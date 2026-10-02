type ReactDoctorSeverity = "error" | "off"

/**
 * Severity policy over `oxlint-plugin-react-doctor`. Every key here is validated
 * against the plugin's own metadata at load time. A typo, or a rule that the
 * plugin retires, therefore fails the lint run. The mistake cannot pass silently.
 *
 * Resolution order, last match wins: capability exclusion -> category ->
 * framework -> tag -> rule.
 */
const reactDoctorPolicy: {
  /** The capabilities that this project has. Drives `requires` / `disabledWhen`. */
  capabilities: readonly string[]
  categories: Record<string, ReactDoctorSeverity>
  frameworks: Record<string, ReactDoctorSeverity>
  tags: Record<string, ReactDoctorSeverity>
  rules: Record<string, ReactDoctorSeverity>
} = {
  capabilities: [
    "base-ui",
    "react",
    "react-compiler",
    "react:19",
    "react:19.2",
    "shadcn",
    "ssr",
    "tailwind",
    "tailwind:4",
    "tanstack-query",
    "tanstack-start",
  ],
  categories: {
    Accessibility: "error",
    Bugs: "error",
    Maintainability: "error",
    Performance: "error",
    Security: "error",
  },
  frameworks: {
    global: "error",
    nextjs: "off", // We do not use Next.js.
    preact: "off",
    "react-native": "off",
    "tanstack-query": "error",
    "tanstack-start": "error",
  },
  tags: {
    "opt-in": "off",
    "project-analysis": "off", // This rule needs the react-doctor scanner, not oxlint.
    "security-scan": "off",
  },
  rules: {
    // Rules this codebase deliberately does not follow.
    "react-doctor/control-has-associated-label": "off", // Shadcn's Field wires its own labels.
    "react-doctor/design-no-em-dash-in-jsx-text": "off", // Em dashes are intentional in prose.
    "react-doctor/hook-use-state": "off",
    "react-doctor/jsx-props-no-spreading": "off",
    "react-doctor/no-event-handler": "off", // This rule reports false positives on callback props.
    "react-doctor/no-generic-handler-names": "off",
    "react-doctor/no-many-boolean-props": "off",
    "react-doctor/no-multi-comp": "off", // Co-located sub-components are intentional.
    "react-doctor/no-prevent-default": "off", // The app is meaningless without JS.
    "react-doctor/no-static-element-interactions": "off",
    "react-doctor/no-tiny-text": "off", // Dense reference and lesson chrome.
    "react-doctor/react-in-jsx-scope": "off", // React 17+.
    "react-doctor/rendering-svg-precision": "off", // Savings are negligible.

    // Opt-ins worth the friction.
    "react-doctor/display-name": "error",
    "react-doctor/jsx-max-depth": "error",
    "react-doctor/no-arbitrary-px-font-size": "error",
    "react-doctor/no-enter-submit-without-ime-composition-guard": "error",
    "react-doctor/no-img-without-dimensions": "error",
    "react-doctor/no-impure-call-at-module-scope": "error",
    "react-doctor/only-export-components": "error",
    "react-doctor/shadcn-icon-button-requires-label": "error",
  },
}

export { reactDoctorPolicy }
export type { ReactDoctorSeverity }
