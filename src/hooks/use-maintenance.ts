import { useState } from "react"
import { useLocalStorage, useMount } from "react-use"

export const useMaintenance = () => {
  const [mounted, setMounted] = useState(false)
  useMount(() => setMounted(true))

  const [isMaintenance] = useLocalStorage("isMaintenancePage", false, {
    raw: false,
    deserializer: (value) => value !== "false",
    serializer: (value) => String(value),
  })

  return { isMaintenance: mounted ? (isMaintenance ?? true) : null }
}
