// cSSV Genesis Boost tiers, effective 2026-06-09. Boost is gated on the June 5
// LST snapshot (see use-genesis-eligibility): ineligible wallets always get 0%.
// For eligible wallets the boost is determined by SSV staked, with no minimum
// stake floor. Tiers (inclusive upper bound) — kept in lockstep with the
// backend getBoost() in generate-boosted-snapshots.js:
//   0 – 5,000        => 20%
//   5,000.01 – 12,000 => 15%
//   12,000.01 – 20,000 => 10%
//   20,000+          => 0%
const BOOST_TIERS: [number, number][] = [
  [5_000, 20],
  [12_000, 15],
  [20_000, 10],
  [Infinity, 0]
];

export const calculateBoost = (
  isEligible: boolean,
  stakedSSV: number
): string => {
  if (!isEligible || stakedSSV <= 0) return "0%";
  const match = BOOST_TIERS.find(([upperBound]) => stakedSSV <= upperBound);
  const percent = match ? match[1] : 0;
  return percent === 0 ? "0%" : `+${percent}%`;
};
