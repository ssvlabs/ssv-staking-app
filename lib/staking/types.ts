export type StepStatus =
  | "idle"
  | "waiting"
  | "submitted"
  | "confirmed"
  | "error";

export type WithdrawalRequest = {
  id: string;
  amount: bigint;
  unlockTime: number;
};
