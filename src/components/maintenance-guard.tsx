import type { FC, PropsWithChildren } from "react"

import { Maintenance } from "@/components/maintenance"
import { useMaintenance } from "@/lib/supabase"

export const MaintenanceGuard: FC<PropsWithChildren> = ({ children }) => {
  const { isMaintenance } = useMaintenance()

  if (isMaintenance) return <Maintenance />

  return <>{children}</>
}
