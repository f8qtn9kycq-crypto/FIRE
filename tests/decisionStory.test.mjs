import test from "node:test";
import assert from "node:assert/strict";
import { getPlanStory } from "../src/utils/decisionStory.js";

test("decision story uses FIRE threshold as the primary decision metric", () => {
  const story = getPlanStory({ fireReadyAtRet: true, assessmentPortfolio: 1_000, fireTarget: 900, mcData: [40] });
  assert.equal(story.status, "已達到試算門檻");
  assert.equal(story.tone, "good");
  assert.equal(story.success, 40);
});

test("high simulation result does not imply FIRE readiness", () => {
  const story = getPlanStory({ fireReadyAtRet: false, assessmentPortfolio: 800, fireTarget: 1_000, mcData: [95] });
  assert.equal(story.status, "尚未達到試算門檻");
  assert.equal(story.tone, "warn");
  assert.equal(story.success, 95);
});
