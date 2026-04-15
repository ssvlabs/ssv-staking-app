import { maintenanceProxy } from "@/lib/supabase";
import { useSnapshot } from "valtio";

export const useMaintenance = () => {
  return { isMaintenance: useSnapshot(maintenanceProxy).isActive };
};
