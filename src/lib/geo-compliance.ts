/* eslint-disable @typescript-eslint/no-explicit-any */

import { NETWORK_CONFIGS } from "@/lib/config";

const geoApiKeys = {
  IPGEO_API_KEY: import.meta.env.VITE_IPGEO_API_KEY,
  IPREGISTRY_KEY: import.meta.env.VITE_IPREGISTRY_KEY,
  BIGDATACLOUD_KEY: import.meta.env.VITE_BIGDATACLOUD_KEY,
};

const getComplianceApiBase = () => {
  const mainnet = NETWORK_CONFIGS.find((n) => n.chainId === 1);
  return mainnet?.ssvApiBaseUrl ?? NETWORK_CONFIGS[0].ssvApiBaseUrl;
};

export const getRestrictedCountries = async (): Promise<string[]> => {
  const response = await fetch(
    `${getComplianceApiBase()}/compliance/countries/restricted`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error("Failed to fetch restricted countries");
  return response.json();
};

export const getCurrentLocation = async (): Promise<string[]> => {
  const fetchLocation = async (
    url: string,
    getCountry: (data: any) => string[],
  ) => {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return null;
      const data = await res.json();
      return getCountry(data);
    } catch {
      return null;
    }
  };

  const filterEmpty = (name: undefined | null | string) => !!name;

  const shuffleArray = <T>(arr: T[]): T[] => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const countryGetters = shuffleArray([
    {
      url: `https://api.ipgeolocation.io/ipgeo?apiKey=${geoApiKeys.IPGEO_API_KEY}`,
      getCountry: (data: any): string[] =>
        [data.country_name, data.city].filter(filterEmpty),
    },
    {
      url: `https://api.ipregistry.co/?key=${geoApiKeys.IPREGISTRY_KEY}`,
      getCountry: (data: any): string[] =>
        [
          data.location?.country?.name,
          data.location?.region?.name,
          data.location?.city,
        ].filter(filterEmpty),
    },
    {
      url: `https://api.bigdatacloud.net/data/country-by-ip?key=${geoApiKeys.BIGDATACLOUD_KEY}`,
      getCountry: (data: any): string[] =>
        [
          data.country?.name,
          data.country?.isoName,
          data.location?.city,
          data.location?.localityName,
        ].filter(filterEmpty),
    },
    {
      url: "https://ipapi.co/json/",
      getCountry: (data: any): string[] =>
        [data?.country_name, data?.region, data?.city].filter(filterEmpty),
    },
    {
      url: "https://geolocation-db.com/json/",
      getCountry: (data: any): string[] =>
        [data?.country_name, data?.city].filter(filterEmpty),
    },
  ]);

  for (const { url, getCountry } of countryGetters) {
    const location = await fetchLocation(url, getCountry);
    if (location?.length) return location;
  }

  return [];
};

export const checkUserCountryRestriction = (
  userLocation: string[],
  restrictedLocations: string[],
): string => {
  if (!userLocation.length) return "Unknown";

  for (const location of userLocation) {
    for (const restricted of restrictedLocations) {
      if (restricted.toLowerCase().includes(location.toLowerCase())) {
        return userLocation[0] ?? "Unknown";
      }
    }
  }

  return "";
};
