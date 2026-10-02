import type { Toaster as ToasterImpl } from "@acme/ui/components/sonner"

import { useEffect, useState } from "react"

const Toaster = () => {
  const [Impl, setImpl] = useState<typeof ToasterImpl | null>(null)

  useEffect(() => {
    let closed = false

    const load = async () => {
      try {
        const module = await import("@acme/ui/components/sonner")
        if (!closed) {
          setImpl(() => module.Toaster)
        }
      } catch (error) {
        console.error("The toaster failed to load", error)
      }
    }

    void load()

    return () => {
      closed = true
    }
  }, [])

  return Impl ? <Impl /> : null
}

export { Toaster }
