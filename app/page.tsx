import StakingInterface from "@/components/staking-interface";
import TopBar from "@/components/top-bar";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-100">
      <TopBar />
      <main className="mx-auto w-full max-w-[1440px] px-6 pb-16 pt-6">
        <StakingInterface />
      </main>
    </div>
  );
}
