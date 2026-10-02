import type { OxlintConfig } from "oxlint"

import { REACT_DOCTOR_RULES } from "oxlint-plugin-react-doctor"

import type { ReactDoctorSeverity } from "#react-doctor/policy"

import { reactDoctorPolicy } from "#react-doctor/policy"

type RuleConfig = NonNullable<OxlintConfig["rules"]>
type ReactDoctorRuleEntry = (typeof REACT_DOCTOR_RULES)[number]

const isReactDoctorRuleKey = (key: string): key is `react-doctor/${string}` =>
  key.startsWith("react-doctor/")

const collectUnique = (values: readonly string[]): Set<string> => new Set(values)

const hasCapability = (capability: string): boolean =>
  reactDoctorPolicy.capabilities.includes(capability)

const assertKnown = ({
  declared,
  kind,
  known,
}: {
  declared: readonly string[]
  kind: string
  known: Set<string>
}): void => {
  const unknown = declared.filter((value) => !known.has(value))

  if (unknown.length > 0) {
    throw new Error(`Unknown React Doctor ${kind} in oxlint policy: ${unknown.join(", ")}`)
  }
}

const assertPolicyMatchesPlugin = (): void => {
  const entries = REACT_DOCTOR_RULES

  assertKnown({
    declared: reactDoctorPolicy.capabilities,
    kind: "capability",
    known: collectUnique([
      ...entries.map((entry) => entry.rule.framework),
      ...entries.flatMap((entry) => entry.rule.requires ?? []),
      ...entries.flatMap((entry) => entry.rule.disabledWhen ?? []),
    ]),
  })
  assertKnown({
    declared: Object.keys(reactDoctorPolicy.categories),
    kind: "category",
    known: collectUnique(entries.map((entry) => entry.rule.category)),
  })
  assertKnown({
    declared: Object.keys(reactDoctorPolicy.frameworks),
    kind: "framework",
    known: collectUnique(entries.map((entry) => entry.rule.framework)),
  })
  assertKnown({
    declared: Object.keys(reactDoctorPolicy.tags),
    kind: "tag",
    known: collectUnique(entries.flatMap((entry) => entry.rule.tags ?? [])),
  })
  assertKnown({
    declared: Object.keys(reactDoctorPolicy.rules),
    kind: "rule",
    known: collectUnique(entries.map((entry) => entry.key)),
  })
}

const isApplicable = (entry: ReactDoctorRuleEntry): boolean => {
  const { disabledWhen, lifecycle, requires } = entry.rule

  if (lifecycle === "retired") {
    return false
  }

  if (disabledWhen?.some((capability) => hasCapability(capability)) === true) {
    return false
  }

  return requires === undefined || requires.every((capability) => hasCapability(capability))
}

const resolveSeverity = (entry: ReactDoctorRuleEntry): ReactDoctorSeverity => {
  if (!isApplicable(entry)) {
    return "off"
  }

  const explicit = reactDoctorPolicy.rules[entry.key]

  if (explicit !== undefined) {
    return explicit
  }

  // The plugin marks opt-in rules with `defaultEnabled: false`. Only an explicit
  // Policy entry above can switch them on.
  if (entry.rule.defaultEnabled === false) {
    return "off"
  }

  let severity: ReactDoctorSeverity =
    reactDoctorPolicy.frameworks[entry.rule.framework] ??
    reactDoctorPolicy.categories[entry.rule.category] ??
    "error"

  for (const tag of entry.rule.tags ?? []) {
    severity = reactDoctorPolicy.tags[tag] ?? severity
  }

  return severity
}

const buildReactDoctorRules = (): RuleConfig => {
  assertPolicyMatchesPlugin()

  const rules: RuleConfig = {}

  for (const entry of REACT_DOCTOR_RULES) {
    if (isReactDoctorRuleKey(entry.key)) {
      rules[entry.key] = resolveSeverity(entry)
    }
  }

  return rules
}

export { buildReactDoctorRules }
