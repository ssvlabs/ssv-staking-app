const OG_TIERS: [number, number][] = [
  [20_001, 0],
  [12_001, 20],
  [5_001, 30],
  [0, 50],
];

const NEW_HOLDER_TIERS: [number, number][] = [
  [20_001, 0],
  [12_001, 10],
  [5_001, 15],
  [0, 25],
];

const MIN_STAKED_FOR_BOOST = 50;

export const calculateBoost = (isOG: boolean, stakedSSV: number): string => {
  if (stakedSSV < MIN_STAKED_FOR_BOOST) return "–";
  const tiers = isOG ? OG_TIERS : NEW_HOLDER_TIERS;
  const match = tiers.find(([threshold]) => stakedSSV >= threshold);
  if (!match) return "–";
  return match[1] === 0 ? "0%" : `+${match[1]}%`;
};
