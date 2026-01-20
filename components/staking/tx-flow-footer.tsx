import { STAKING_COPY } from "@/lib/staking/copy";

type TxFlowFooterProps = {
  onClose: () => void;
  label?: string;
};

export function TxFlowFooter({
  onClose,
  label = STAKING_COPY.actions.close
}: TxFlowFooterProps) {
  return (
    <div className="flex w-full pt-4">
      <button
        className="h-[52px] w-full rounded-[12px] bg-brand-50 text-[14px] font-semibold text-brand-600"
        onClick={onClose}
        type="button"
      >
        {label}
      </button>
    </div>
  );
}
