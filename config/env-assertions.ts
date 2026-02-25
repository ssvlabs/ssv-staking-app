import { isAddress, type Address } from "viem";

type EnvCandidate = { key: string; value: string | undefined };
type RequiredReader = (candidates: EnvCandidate[], label: string) => string;

export type EnvAssertions = {
  getRequiredEnv: RequiredReader;
  getRequiredUrl: RequiredReader;
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

  return { getRequiredEnv, getRequiredUrl, getRequiredAddress };
};
