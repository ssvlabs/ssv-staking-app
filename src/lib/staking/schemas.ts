import { z } from "zod";
import { parseUnits } from "viem";
import { MINIMAL_STAKING_AMOUNT } from "@/lib/staking/constants";

export const createStakeSchema = ({
  balance,
  decimals,
}: {
  balance: bigint;
  decimals: number;
}) =>
  z.object({
    amount: z
      .string()
      .min(1, "Enter an amount to stake")
      .transform((val, ctx) => {
        try {
          return parseUnits(val.replace(/,/g, ""), decimals);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid amount",
          });
          return z.NEVER;
        }
      })
      .pipe(
        z
          .bigint()
          .refine(
            (v) => v >= MINIMAL_STAKING_AMOUNT,
            "Below minimum stake amount"
          )
          .refine((v) => v <= balance, "Insufficient SSV balance")
      ),
  });

export const createUnstakeSchema = ({
  balance,
  decimals,
}: {
  balance: bigint;
  decimals: number;
}) =>
  z.object({
    amount: z
      .string()
      .min(1, "Enter an amount to unstake")
      .transform((val, ctx) => {
        try {
          return parseUnits(val.replace(/,/g, ""), decimals);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid amount",
          });
          return z.NEVER;
        }
      })
      .pipe(
        z
          .bigint()
          .refine((v) => v > 0n, "Enter an amount to unstake")
          .refine((v) => v <= balance, "Insufficient cSSV balance")
      ),
  });
