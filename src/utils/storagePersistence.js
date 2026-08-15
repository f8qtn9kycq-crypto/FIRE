export function shouldSkipInitialPersistence(hasOverride, persistOverride = true) {
  return Boolean(hasOverride) && !persistOverride;
}

export function areStoredValuesEqual(left, right) {
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

export function resolveInitialStorageState({
  storage,
  key,
  initialValue,
  overrideValue,
  normalize = (value) => value,
  persistOverride = true,
  requireExplicitOverridePersistence = false,
}) {
  let hasStoredValue = false;
  let storedValueIsValid = false;
  let storedValue = normalize(initialValue);

  if (storage) {
    try {
      const rawStoredValue = storage.getItem(key);
      hasStoredValue = rawStoredValue !== null;
      if (hasStoredValue) {
        storedValue = normalize({ ...initialValue, ...JSON.parse(rawStoredValue) });
        storedValueIsValid = true;
      }
    } catch {
      storedValue = normalize(initialValue);
    }
  }

  const hasOverride = Boolean(overrideValue);
  const normalizedOverride = hasOverride ? normalize(overrideValue) : null;
  const overrideMatchesStoredValue =
    hasOverride && storedValueIsValid && areStoredValuesEqual(normalizedOverride, storedValue);
  const skipPersistence = shouldSkipInitialPersistence(hasOverride, persistOverride);

  return {
    value: hasOverride ? normalizedOverride : storedValue,
    skipPersistence,
    isOverridePending:
      skipPersistence &&
      requireExplicitOverridePersistence &&
      !overrideMatchesStoredValue,
    hasStoredValue,
    overrideMatchesStoredValue,
  };
}

export function shouldKeepPersistencePausedAfterChange(skipPersistence, isOverridePending) {
  return Boolean(skipPersistence) && Boolean(isOverridePending);
}

export function persistStoredValue(storage, key, value, skipPersistence = false) {
  if (!storage || skipPersistence) return false;
  storage.setItem(key, JSON.stringify(value));
  return true;
}

export function clearStoredValue(storage, key) {
  if (storage) storage.removeItem(key);
}
