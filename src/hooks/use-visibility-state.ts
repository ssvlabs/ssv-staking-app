import { useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
};

const getSnapshot = () => document.visibilityState;

export const useVisibilityState = () => {
  return useSyncExternalStore(subscribe, getSnapshot);
};
