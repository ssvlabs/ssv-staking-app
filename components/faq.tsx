import * as React from "react";

type FaqProps = {
  className?: string;
  question: string;
  answer: React.ReactNode;
  defaultOpen?: boolean;
};

export function Faq({ className, question, answer, defaultOpen = false }: FaqProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return (
    <div className={className}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <span className="flex-1 text-[14px] font-semibold text-[var(--color-ink-900)]">{question}</span>
        <span className="inline-flex size-[15px] items-center justify-center">
          <svg
            className={`size-[12px] text-[var(--color-ink-900)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {isOpen && <div className="mt-3 text-left text-[14px] leading-[20px] text-[var(--color-ink-700)]">{answer}</div>}
    </div>
  );
}
