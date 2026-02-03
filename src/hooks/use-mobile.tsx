import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Set the initial value on the client
    setIsMobile(mql.matches)

    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    // Listen for changes
    mql.addEventListener("change", onChange)

    // Cleanup
    return () => mql.removeEventListener("change", onChange)
  }, []) // Empty dependency array ensures this runs only once on mount on the client

  return isMobile
}
