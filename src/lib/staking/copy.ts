export const STAKING_COPY = {
  modals: {
    stake: "Stake",
    unstake: "Unstake",
    withdraw: "Withdraw",
    claim: "Claim",
    multisig: "Transaction Initiated"
  },
  actions: {
    approve: "Approve",
    stake: "Stake",
    unstake: "Unstake",
    withdraw: "Withdraw",
    claim: "Claim",
    close: "Close"
  },
  buttons: {
    addToMetamask: "Add cSSV to Metamask"
  },
  multisig: {
    pending:
      "Your transaction has been initiated in your multi-sig wallet and is now pending approval from other participants.",
    returnWhenApproved: "Please return once approved."
  },
  toasts: {
    metamaskMissing: "Metamask not detected.",
    metamaskError: "Unable to add cSSV to Metamask."
  }
} as const;
