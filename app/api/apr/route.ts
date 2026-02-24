import { createPublicClient, formatUnits, http, type Address } from "viem";

import { getViewsAbiByChainId } from "@/lib/abis";
import { getNetworkConfigByChainId } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SECONDS_PER_YEAR = 31_536_000;

const fetchIndex = async (
  publicClient: ReturnType<typeof createPublicClient>,
  chainId: number,
  viewsAddress: Address
): Promise<bigint> => {
  const value = await publicClient.readContract({
    address: viewsAddress,
    abi: getViewsAbiByChainId(chainId),
    functionName: "accEthPerShare"
  });
  if (typeof value !== "bigint") {
    throw new Error("Unexpected accEthPerShare response");
  }
  return value;
};

const fetchPrices = async () => {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,ssv-network&vs_currencies=usd",
    { cache: "no-store" }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch price data from CoinGecko");
  }
  const payload = (await response.json()) as {
    ethereum?: { usd?: number };
    "ssv-network"?: { usd?: number };
  };
  const priceEth = payload.ethereum?.usd;
  const priceSsv = payload["ssv-network"]?.usd;
  if (!priceEth || !priceSsv) {
    throw new Error("Missing price data from CoinGecko");
  }
  return { priceEth, priceSsv };
};

const computeApr = (
  accEthPerShare: bigint,
  priceEth: number,
  priceSsv: number
) => {
  if (!Number.isFinite(priceEth) || !Number.isFinite(priceSsv)) return null;
  const ratePerShare = Number(formatUnits(accEthPerShare, 18));
  if (!Number.isFinite(ratePerShare) || ratePerShare <= 0) return null;
  const apr = ratePerShare * SECONDS_PER_YEAR * (priceEth / priceSsv) * 100;
  return Number.isFinite(apr) ? apr : null;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedChainIdRaw = url.searchParams.get("chainId");
    const requestedChainId = Number.parseInt(requestedChainIdRaw ?? "", 10);
    const chainId = Number.isInteger(requestedChainId)
      ? requestedChainId
      : undefined;
    const network = getNetworkConfigByChainId(chainId);

    const publicClient = createPublicClient({
      transport: http(network.rpcUrl)
    });

    const [accEthPerShare, prices] = await Promise.all([
      fetchIndex(publicClient, network.chainId, network.contracts.Views),
      fetchPrices()
    ]);

    const apr = computeApr(accEthPerShare, prices.priceEth, prices.priceSsv);
    const lastUpdated = Math.floor(Date.now() / 1000);

    return Response.json({ apr, lastUpdated });
  } catch (error) {
    console.error("APR API error:", error);
    return Response.json({ apr: null }, { status: 500 });
  }
}
