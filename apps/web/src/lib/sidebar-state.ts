import { createIsomorphicFn } from "@tanstack/react-start"

import { sidebarDefaultOpenFromCookie } from "@/lib/sidebar-cookie"
import { readSidebarDefaultOpenOnServer } from "@/server/sidebar-cookie.server"

const readSidebarDefaultOpen = createIsomorphicFn()
  .client((): boolean => sidebarDefaultOpenFromCookie(document.cookie))
  .server(readSidebarDefaultOpenOnServer)

export { readSidebarDefaultOpen }
