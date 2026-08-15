import { useEffect, useState } from "react";
import {
  clearStoredValue,
  persistStoredValue,
  resolveInitialStorageState,
  shouldKeepPersistencePausedAfterChange,
} from "../utils/storagePersistence";

function getBrowserStorage() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function useLocalStorage(key, initialValue, options = {}) {
  const {
    overrideValue,
    normalize = (value) => value,
    persistOverride = true,
    requireExplicitOverridePersistence = false,
  } = options;
  const [initialState] = useState(() =>
    resolveInitialStorageState({
      storage: getBrowserStorage(),
      key,
      initialValue,
      overrideValue,
      normalize,
      persistOverride,
      requireExplicitOverridePersistence,
    }),
  );
  const [skipPersistence, setSkipPersistence] = useState(initialState.skipPersistence);
  const [isOverridePending, setIsOverridePending] = useState(initialState.isOverridePending);
  const [value, setValue] = useState(initialState.value);

  useEffect(() => {
    try {
      persistStoredValue(getBrowserStorage(), key, value, skipPersistence);
    } catch {
      // Ignore storage errors in private browsing or restricted environments.
    }
  }, [key, skipPersistence, value]);

  const updateValue = (nextValue) => {
    setSkipPersistence((current) =>
      shouldKeepPersistencePausedAfterChange(current, isOverridePending),
    );
    setValue(nextValue);
  };

  const persistCurrentValue = () => {
    try {
      const didPersist = persistStoredValue(getBrowserStorage(), key, value);
      if (!didPersist) return false;

      setIsOverridePending(false);
      setSkipPersistence(false);
      return true;
    } catch {
      return false;
    }
  };

  const clearValue = () => {
    try {
      clearStoredValue(getBrowserStorage(), key);
    } catch {
      // Ignore storage errors in private browsing or restricted environments.
    }
    setIsOverridePending(false);
    setSkipPersistence(true);
    setValue(normalize(initialValue));
  };

  return [value, updateValue, clearValue, persistCurrentValue, isOverridePending];
}
