import assert from "node:assert/strict";
import test from "node:test";
import {
  clearStoredValue,
  persistStoredValue,
  resolveInitialStorageState,
  shouldKeepPersistencePausedAfterChange,
  shouldSkipInitialPersistence,
} from "../src/utils/storagePersistence.js";

class MemoryStorage {
  constructor(entries = {}, { failWrites = false } = {}) {
    this.values = new Map(Object.entries(entries));
    this.failWrites = failWrites;
  }

  removeItem(key) {
    this.values.delete(key);
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    if (this.failWrites) throw new Error("storage unavailable");
    this.values.set(key, String(value));
  }
}

const initialPlan = { age: 0, assets: 0, retAge: 65 };
const normalizePlan = (value) => ({ ...initialPlan, ...value });

function resolveState(storage, overrideValue, options = {}) {
  return resolveInitialStorageState({
    storage,
    key: "fire-inputs",
    initialValue: initialPlan,
    overrideValue,
    normalize: normalizePlan,
    persistOverride: false,
    ...options,
  });
}

test("a divergent shared plan stays isolated until the user explicitly saves it", () => {
  const savedPlanRaw = '{\n  "age": 45,\n  "assets": 1000,\n  "retAge": 65\n}';
  const storage = new MemoryStorage({ "fire-inputs": savedPlanRaw });
  const sharedPlan = { age: 50, assets: 2200, retAge: 67 };

  const initialState = resolveState(storage, sharedPlan, {
    requireExplicitOverridePersistence: true,
  });

  assert.deepEqual(initialState.value, sharedPlan);
  assert.equal(initialState.skipPersistence, true);
  assert.equal(initialState.isOverridePending, true);
  assert.equal(persistStoredValue(storage, "fire-inputs", initialState.value, true), false);
  assert.equal(storage.getItem("fire-inputs"), savedPlanRaw);

  const editedSharedPlan = { ...sharedPlan, assets: 2400 };
  const pausedAfterEdit = shouldKeepPersistencePausedAfterChange(
    initialState.skipPersistence,
    initialState.isOverridePending,
  );
  assert.equal(pausedAfterEdit, true);
  assert.equal(persistStoredValue(storage, "fire-inputs", editedSharedPlan, pausedAfterEdit), false);
  assert.equal(storage.getItem("fire-inputs"), savedPlanRaw);

  const reloadedSharedState = resolveState(storage, editedSharedPlan, {
    requireExplicitOverridePersistence: true,
  });
  assert.deepEqual(reloadedSharedState.value, editedSharedPlan);
  assert.equal(reloadedSharedState.isOverridePending, true);
  assert.equal(storage.getItem("fire-inputs"), savedPlanRaw);

  const baseUrlState = resolveState(storage, null);
  assert.deepEqual(baseUrlState.value, { age: 45, assets: 1000, retAge: 65 });

  assert.equal(persistStoredValue(storage, "fire-inputs", editedSharedPlan), true);
  assert.equal(storage.getItem("fire-inputs"), JSON.stringify(editedSharedPlan));

  const nextEdit = { ...editedSharedPlan, assets: 2600 };
  assert.equal(persistStoredValue(storage, "fire-inputs", nextEdit), true);
  assert.equal(storage.getItem("fire-inputs"), JSON.stringify(nextEdit));
});

test("a shared URL matching the saved plan preserves raw storage and resumes on edit", () => {
  const savedPlanRaw = '{ "age": 45, "assets": 1000, "retAge": 65 }';
  const savedPlan = { age: 45, assets: 1000, retAge: 65 };
  const storage = new MemoryStorage({ "fire-inputs": savedPlanRaw });

  const state = resolveState(storage, savedPlan, {
    requireExplicitOverridePersistence: true,
  });

  assert.equal(state.skipPersistence, true);
  assert.equal(state.overrideMatchesStoredValue, true);
  assert.equal(state.isOverridePending, false);
  assert.equal(storage.getItem("fire-inputs"), savedPlanRaw);

  const pausedAfterEdit = shouldKeepPersistencePausedAfterChange(
    state.skipPersistence,
    state.isOverridePending,
  );
  assert.equal(pausedAfterEdit, false);
  assert.equal(
    persistStoredValue(storage, "fire-inputs", { ...savedPlan, assets: 1100 }, pausedAfterEdit),
    true,
  );
});

test("blank URL skips its initial write and resumes persistence on the first edit", () => {
  const savedPlanRaw = '{"age":45,"assets":1000,"retAge":65}';
  const storage = new MemoryStorage({ "fire-inputs": savedPlanRaw });
  const blankState = resolveState(storage, initialPlan);

  assert.equal(blankState.skipPersistence, true);
  assert.equal(blankState.isOverridePending, false);
  assert.equal(storage.getItem("fire-inputs"), savedPlanRaw);

  const pausedAfterEdit = shouldKeepPersistencePausedAfterChange(
    blankState.skipPersistence,
    blankState.isOverridePending,
  );
  assert.equal(pausedAfterEdit, false);
  assert.equal(
    persistStoredValue(storage, "fire-inputs", { ...initialPlan, age: 40 }, pausedAfterEdit),
    true,
  );
  assert.equal(storage.getItem("fire-inputs"), '{"age":40,"assets":0,"retAge":65}');
});

test("a shared plan without prior storage remains isolated until explicit save", () => {
  const storage = new MemoryStorage();
  const sharedPlan = { age: 52, assets: 1800, retAge: 66 };
  const state = resolveState(storage, sharedPlan, {
    requireExplicitOverridePersistence: true,
  });

  assert.equal(state.hasStoredValue, false);
  assert.equal(state.isOverridePending, true);
  assert.equal(persistStoredValue(storage, "fire-inputs", sharedPlan, state.skipPersistence), false);
  assert.equal(storage.getItem("fire-inputs"), null);

  assert.equal(persistStoredValue(storage, "fire-inputs", sharedPlan), true);
  assert.equal(storage.getItem("fire-inputs"), JSON.stringify(sharedPlan));
});

test("malformed saved data falls back safely without being overwritten by a shared plan", () => {
  const malformedPlan = "{not-json";
  const storage = new MemoryStorage({ "fire-inputs": malformedPlan });
  const sharedPlan = { age: 50, assets: 2200, retAge: 67 };

  const baseUrlState = resolveState(storage, null);
  assert.deepEqual(baseUrlState.value, initialPlan);

  const sharedState = resolveState(storage, sharedPlan, {
    requireExplicitOverridePersistence: true,
  });
  assert.equal(sharedState.hasStoredValue, true);
  assert.equal(sharedState.isOverridePending, true);
  assert.equal(persistStoredValue(storage, "fire-inputs", sharedPlan, true), false);
  assert.equal(storage.getItem("fire-inputs"), malformedPlan);
});

test("failed explicit writes leave the previous plan unchanged", () => {
  const savedPlanRaw = '{"age":45,"assets":1000,"retAge":65}';
  const storage = new MemoryStorage(
    { "fire-inputs": savedPlanRaw },
    { failWrites: true },
  );

  assert.throws(
    () => persistStoredValue(storage, "fire-inputs", { age: 50, assets: 2200, retAge: 67 }),
    /storage unavailable/,
  );
  assert.equal(storage.getItem("fire-inputs"), savedPlanRaw);
});

test("initial persistence and reset policies keep their existing boundaries", () => {
  assert.equal(shouldSkipInitialPersistence(true, false), true);
  assert.equal(shouldSkipInitialPersistence(true, true), false);
  assert.equal(shouldSkipInitialPersistence(false, false), false);

  const storage = new MemoryStorage({ "fire-inputs": '{"age":40}' });
  clearStoredValue(storage, "fire-inputs");
  assert.equal(storage.getItem("fire-inputs"), null);
});
