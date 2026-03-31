import { Toaster } from "sonner";

import { MaintenanceGuard } from "@/components/maintenance-guard";
import StakingInterface from "@/components/staking-interface";
import TopBar from "@/components/top-bar";
import Providers from "@/providers";
import { Playground } from "@/components/playground";

export function App() {
  return (
    <Providers>
      <MaintenanceGuard>
        <div className="min-h-screen bg-surface-100">
          <TopBar />
          <main className="mx-auto w-full max-w-[1440px] px-6 pb-16 pt-6">
            {/* <StakingInterface /> */}
            <Playground />
          </main>
        </div>
        <Toaster richColors position="top-right" />
      </MaintenanceGuard>
    </Providers>
  );
}
