export function shouldSkipInitialPersistence(hasOverride, persistOverride = true) {
  return Boolean(hasOverride) && !persistOverride;
}

export function clearStoredValue(storage, key) {
  if (storage) storage.removeItem(key);
}
