import { Toaster } from "sonner";

import { ComplianceGuard } from "@/components/compliance-guard";
import { MaintenanceGuard } from "@/components/maintenance-guard";
import { BatchTransactionModal } from "@/components/modals/batch-transaction";
import TopBar from "@/components/top-bar";
import Providers from "@/providers";
import { StakingInterface } from "./components/staking-interface";
import "@/lib/supabase";

export function App() {
  return (
    <Providers>
      <MaintenanceGuard>
        <ComplianceGuard>
          <div className="min-h-screen bg-surface-100">
            <TopBar />
            <main className="mx-auto w-full max-w-[1440px] px-6 pb-16 pt-6">
              <StakingInterface />
            </main>
          </div>
          <BatchTransactionModal />
          <Toaster richColors position="top-right" />
        </ComplianceGuard>
      </MaintenanceGuard>
    </Providers>
  );
}
