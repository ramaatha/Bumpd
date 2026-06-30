import { useEffect, useState } from "react";

/**
 * Returns true until BOTH conditions are met:
 * 1. isLoading is false
 * 2. At least minMs milliseconds have passed since mount
 */
export default function useMinLoading(isLoading, minMs = 2500) {
  const [minPassed, setMinPassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinPassed(true), minMs);
    return () => clearTimeout(timer);
  }, []);

  return isLoading || !minPassed;
}
