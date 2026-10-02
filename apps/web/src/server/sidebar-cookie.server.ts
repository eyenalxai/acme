import { getRequestHeaders } from "@tanstack/react-start/server"

import { sidebarDefaultOpenFromCookie } from "@/lib/sidebar-cookie"

const readSidebarDefaultOpenOnServer = (): boolean =>
  sidebarDefaultOpenFromCookie(getRequestHeaders().get("cookie"))

export { readSidebarDefaultOpenOnServer }
