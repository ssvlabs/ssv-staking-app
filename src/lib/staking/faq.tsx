import type { ReactNode } from "react";

type FaqEntry = {
  id: string;
  question: string;
  answer: ReactNode;
};

export const STAKING_FAQ: FaqEntry[] = [
  {
    id: "what-is-ssv",
    question: "What is SSV?",
    answer: (
      <>
        <span>
          Secret Shared Validators (SSV) is the first secure and robust way to
          split an Ethereum validator key between non-trusting nodes run by
          operators. The nodes do not need to trust each other to carry out
          their validator duties, and a certain number can be offline without
          affecting validator performance. No single node can sign data on
          behalf of a validator, yet not all are needed to create a valid
          signature, adding fault tolerance to the staking ecosystem. The result
          is a reliable, decentralized, secure staking solution for Ethereum.
          Learn more about how SSV works under the hood in the{" "}
        </span>
        <span className="cursor-pointer" role="link" tabIndex={0}>
          SSV Tech Deep Dive.
        </span>
      </>
    )
  },
  {
    id: "validator-resilience",
    question: "How does SSV improve validator resilience?",
    answer: (
      <>
        <span>
          By distributing a validator key across multiple operators, SSV keeps
          validators online even if some nodes go offline. No single operator
          can act alone, and the network can tolerate failures without
          sacrificing performance or security.
        </span>
      </>
    )
  }
];
