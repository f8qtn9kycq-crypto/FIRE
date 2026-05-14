import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue, options = {}) {
  const { overrideValue, normalize = (value) => value } = options;

  const [value, setValue] = useState(() => {
    if (overrideValue) return normalize(overrideValue);
    if (typeof window === "undefined") return initialValue;

    try {
      const stored = window.localStorage.getItem(key);
      return stored ? normalize({ ...initialValue, ...JSON.parse(stored) }) : normalize(initialValue);
    } catch {
      return normalize(initialValue);
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors in private browsing or restricted environments.
    }
  }, [key, value]);

  return [value, setValue];
}
