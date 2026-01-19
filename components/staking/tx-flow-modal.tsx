"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

type TxFlowModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function TxFlowModal({
  title,
  isOpen,
  onClose,
  children
}: TxFlowModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[var(--color-overlay)] backdrop-blur-[10px]" />
      <div className="relative z-10 w-[560px] max-w-[calc(100%-32px)] rounded-[16px] bg-[var(--color-surface-0)] p-8">
        <div className="flex w-full flex-col gap-5">
          <div className="flex h-[28px] items-center">
            <p className="text-[18px] font-bold leading-[28px] text-[var(--color-ink-900)]">
              {title}
            </p>
          </div>
          {children}
        </div>
        <button
          className="absolute right-8 top-8 flex size-6 items-center justify-center text-[var(--color-ink-900)]"
          onClick={onClose}
          type="button"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}
