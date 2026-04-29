import type { FC, PropsWithChildren } from "react";

import { useCompliance } from "@/hooks/use-compliance";
import { Compliance } from "@/components/compliance";

export const ComplianceGuard: FC<PropsWithChildren> = ({ children }) => {
  const compliance = useCompliance();

  if (compliance.data) return <Compliance />;

  return <>{children}</>;
};
