"use client";

import { useSyncExternalStore } from "react";

type MultisigModalState = {
  isOpen: boolean;
};

let state: MultisigModalState = {
  isOpen: false
};

const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const setState = (partial: Partial<MultisigModalState>) => {
  state = { ...state, ...partial };
  emit();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;

export const multisigModalStore = {
  open: () => setState({ isOpen: true }),
  close: () => setState({ isOpen: false })
};

export const useMultisigTransactionModal = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    isOpen: snapshot.isOpen,
    open: multisigModalStore.open,
    close: multisigModalStore.close
  };
};
