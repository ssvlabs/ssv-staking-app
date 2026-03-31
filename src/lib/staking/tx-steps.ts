import { STAKING_COPY } from "@/lib/staking/copy";
import type { StepStatus } from "@/lib/staking/types";
import type { TxStepRowProps } from "@/components/staking/tx-step-row";

type TxStepBase = {
  status: StepStatus;
  label: string;
  hash: `0x${string}` | null;
  onRetry?: () => void;
  disabled?: boolean;
};

export const buildSingleStep = (
  step: TxStepBase,
  idleLabel: string
): TxStepRowProps[] => [
  {
    ...step,
    idleLabel
  }
];

export const buildApprovalAndActionSteps = (
  needsApproval: boolean,
  approval: TxStepBase,
  action: TxStepBase,
  labels: { approve?: string; action: string }
): TxStepRowProps[] =>
  needsApproval
    ? [
        {
          ...approval,
          idleLabel: labels.approve ?? STAKING_COPY.actions.approve
        },
        {
          ...action,
          idleLabel: labels.action
        }
      ]
    : [
        {
          ...action,
          idleLabel: labels.action
        }
      ];
