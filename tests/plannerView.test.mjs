import assert from "node:assert/strict";
import test from "node:test";
import {
  getPlannerViewAction,
  PLANNER_VIEWS,
  transitionPlannerView,
} from "../src/utils/plannerView.js";

test("planner defaults can use the input presentation state", () => {
  assert.equal(PLANNER_VIEWS.INPUT, "input");
});

test("valid results advance from input to result presentation", () => {
  assert.equal(transitionPlannerView(PLANNER_VIEWS.INPUT, true), PLANNER_VIEWS.RESULT);
});

test("invalid or incomplete inputs remain in the input presentation", () => {
  assert.equal(transitionPlannerView(PLANNER_VIEWS.INPUT, false), PLANNER_VIEWS.INPUT);
});

test("returning to inputs changes only presentation state", () => {
  const inputs = Object.freeze({ age: 45, investments: 2500 });
  assert.equal(transitionPlannerView(PLANNER_VIEWS.RESULT, true), PLANNER_VIEWS.INPUT);
  assert.deepEqual(inputs, { age: 45, investments: 2500 });
});

test("input and result actions use distinct labels", () => {
  assert.deepEqual(getPlannerViewAction(PLANNER_VIEWS.INPUT), {
    label: "查看退休試算結果",
    nextView: PLANNER_VIEWS.RESULT,
  });
  assert.deepEqual(getPlannerViewAction(PLANNER_VIEWS.RESULT), {
    label: "調整規劃",
    nextView: PLANNER_VIEWS.INPUT,
  });
});
