import { useState } from "react";
import { useInterval } from "react-use";

export function useNowEpoch() {
  const [nowEpoch, setNowEpoch] = useState(() =>
    Math.floor(Date.now() / 1000)
  );
  useInterval(() => setNowEpoch(Math.floor(Date.now() / 1000)), 1000);
  return nowEpoch;
}
