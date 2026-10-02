import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

const subscribe = (onStoreChange: () => void) => {
  const mediaQueryList = window.matchMedia(MOBILE_QUERY)
  mediaQueryList.addEventListener("change", onStoreChange)
  return () => {
    mediaQueryList.removeEventListener("change", onStoreChange)
  }
}

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches

const getServerSnapshot = () => false

const useIsMobile = () => React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

export { useIsMobile }
