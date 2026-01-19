import { TxStepRow, type TxStepRowProps } from "@/components/staking/tx-step-row";

type TxStepListProps = {
  steps: TxStepRowProps[];
};

export function TxStepList({ steps }: TxStepListProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {steps.map((step, index) => (
        <TxStepRow key={index} {...step} />
      ))}
    </div>
  );
}
