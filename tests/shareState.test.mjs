import assert from "node:assert/strict";
import test from "node:test";
import { clearStoredValue, shouldSkipInitialPersistence } from "../src/utils/storagePersistence.js";

class MemoryStorage {
  constructor(entries = {}) {
    this.values = new Map(Object.entries(entries));
  }

  removeItem(key) {
    this.values.delete(key);
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }
}

test("blank URL overrides stay out of localStorage", () => {
  assert.equal(shouldSkipInitialPersistence(true, false), true);
  assert.equal(shouldSkipInitialPersistence(true, true), false);
  assert.equal(shouldSkipInitialPersistence(false, false), false);
});

test("reset removes the saved plan from storage", () => {
  const storage = new MemoryStorage({ "fire-inputs": '{"age":40}' });

  clearStoredValue(storage, "fire-inputs");

  assert.equal(storage.getItem("fire-inputs"), null);
});
