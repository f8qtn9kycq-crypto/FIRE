export const PLANNER_VIEWS = Object.freeze({
  INPUT: "input",
  RESULT: "result",
});

export function getPlannerViewAction(view) {
  return view === PLANNER_VIEWS.RESULT
    ? { label: "調整規劃", nextView: PLANNER_VIEWS.INPUT }
    : { label: "查看退休試算結果", nextView: PLANNER_VIEWS.RESULT };
}

export function transitionPlannerView(view, canShowResults = false) {
  if (view === PLANNER_VIEWS.RESULT) return PLANNER_VIEWS.INPUT;
  return canShowResults ? PLANNER_VIEWS.RESULT : PLANNER_VIEWS.INPUT;
}
