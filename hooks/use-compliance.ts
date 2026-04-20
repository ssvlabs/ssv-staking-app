"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import {
  checkUserCountryRestriction,
  getCurrentLocation,
  getRestrictedCountries,
} from "@/lib/geo-compliance";

const DISABLED_KEY = "locationRestrictionDisabled";

export const useCompliance = () => {
  const { isConnected, chain } = useAccount();

  const disabled =
    typeof window !== "undefined" &&
    localStorage.getItem(DISABLED_KEY) === "true";

  const userLocation = useQuery({
    queryKey: ["userLocation"],
    queryFn: getCurrentLocation,
    staleTime: Infinity,
  });

  const restrictedLocations = useQuery({
    queryKey: ["restrictedLocations"],
    queryFn: getRestrictedCountries,
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  });

  return useQuery({
    queryKey: ["compliance", chain?.id, isConnected, disabled],
    queryFn: () => {
      if (!isConnected || chain?.testnet || disabled) return "";
      return checkUserCountryRestriction(
        userLocation.data!,
        restrictedLocations.data!,
      );
    },
    enabled: !!userLocation.data && !!restrictedLocations.data,
  });
};
