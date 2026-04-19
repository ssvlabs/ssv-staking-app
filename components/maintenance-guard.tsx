"use client";

import type { FC, PropsWithChildren } from "react";

import { useMaintenance } from "@/lib/supabase";

import { Maintenance } from "./maintenance";

export const MaintenanceGuard: FC<PropsWithChildren> = ({ children }) => {
  const { isMaintenance } = useMaintenance();

  if (isMaintenance) return <Maintenance />;

  return <>{children}</>;
};
