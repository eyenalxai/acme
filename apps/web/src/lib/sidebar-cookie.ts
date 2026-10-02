const SIDEBAR_COOKIE = "sidebar_state"
const SIDEBAR_COOKIE_PREFIX = `${SIDEBAR_COOKIE}=`

const sidebarDefaultOpenFromCookie = (cookie: string | null): boolean => {
  const entry = (cookie ?? "").split(/;\s*/u).find((part) => part.startsWith(SIDEBAR_COOKIE_PREFIX))

  return entry === undefined || entry === `${SIDEBAR_COOKIE_PREFIX}true`
}

export { sidebarDefaultOpenFromCookie }
