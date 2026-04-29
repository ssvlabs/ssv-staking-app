import { isAddress, type Address } from "viem";

type EnvCandidate = { key: string; value: string | undefined };
type RequiredReader = (candidates: EnvCandidate[], label: string) => string;
type UrlWithFallbackReader = (
  candidates: EnvCandidate[],
  label: string,
  fallbackValue: string
) => string;

export type EnvAssertions = {
  getRequiredEnv: RequiredReader;
  getRequiredUrl: RequiredReader;
  getUrlWithFallback: UrlWithFallbackReader;
  getRequiredAddress: (candidates: EnvCandidate[], label: string) => Address;
};

export const createEnvAssertions = (configName: string): EnvAssertions => {
  const prefix = `[config/${configName}]`;

  const getRequiredEnv: RequiredReader = (candidates, label) => {
    for (const candidate of candidates) {
      const value = candidate.value;
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }

    const keys = candidates.map((candidate) => candidate.key);
    throw new Error(
      `${prefix} Missing required env for ${label}. Expected one of: ${keys.join(", ")}`
    );
  };

  const getRequiredUrl: RequiredReader = (keys, label) => {
    const value = getRequiredEnv(keys, label);

    try {
      new URL(value);
    } catch {
      throw new Error(`${prefix} Invalid URL for ${label}: ${value}`);
    }

    return value;
  };

  const getUrlWithFallback: UrlWithFallbackReader = (
    candidates,
    label,
    fallbackValue
  ) => {
    const resolvedValue =
      candidates.find(
        (candidate) =>
          typeof candidate.value === "string" && candidate.value.trim().length > 0
      )?.value ?? fallbackValue;

    try {
      new URL(resolvedValue);
    } catch {
      throw new Error(`${prefix} Invalid URL for ${label}: ${resolvedValue}`);
    }

    return resolvedValue;
  };

  const getRequiredAddress = (
    candidates: EnvCandidate[],
    label: string
  ): Address => {
    const value = getRequiredEnv(candidates, label);
    if (!isAddress(value)) {
      throw new Error(`${prefix} Invalid address for ${label}: ${value}`);
    }
    return value;
  };

  return {
    getRequiredEnv,
    getRequiredUrl,
    getUrlWithFallback,
    getRequiredAddress
  };
};
