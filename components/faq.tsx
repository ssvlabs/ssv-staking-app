import { useState, type ReactNode } from "react";

import { ChevronDownIcon } from "@/components/ui/chevron-down-icon";

type FaqProps = {
  className?: string;
  question: string;
  answer: ReactNode;
  defaultOpen?: boolean;
};

export function Faq({ className, question, answer, defaultOpen = false }: FaqProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={className}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <span className="flex-1 text-[14px] font-semibold text-ink-900">{question}</span>
        <span className="inline-flex size-[15px] items-center justify-center">
          <ChevronDownIcon
            className={`text-ink-900 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {isOpen && <div className="mt-3 text-left text-[14px] leading-[20px] text-ink-700">{answer}</div>}
    </div>
  );
}
