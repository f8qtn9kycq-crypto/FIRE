import { useEffect, useState } from "react";
import { clearStoredValue, shouldSkipInitialPersistence } from "../utils/storagePersistence";

export function useLocalStorage(key, initialValue, options = {}) {
  const { overrideValue, normalize = (value) => value, persistOverride = true } = options;
  const [skipPersistence, setSkipPersistence] = useState(() =>
    shouldSkipInitialPersistence(Boolean(overrideValue), persistOverride),
  );

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
    if (skipPersistence) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors in private browsing or restricted environments.
    }
  }, [key, skipPersistence, value]);

  const updateValue = (nextValue) => {
    setSkipPersistence(false);
    setValue(nextValue);
  };

  const clearValue = () => {
    if (typeof window !== "undefined") {
      clearStoredValue(window.localStorage, key);
    }
    setSkipPersistence(true);
    setValue(normalize(initialValue));
  };

  return [value, updateValue, clearValue];
}
