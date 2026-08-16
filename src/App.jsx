import { useEffect, useMemo, useRef, useState } from "react";
import FAQ from "./components/FAQ";
import Inputs from "./components/Inputs";
import FormulaGuide from "./components/FormulaGuide";
import PlanActions from "./components/PlanActions";
import PlannerResults from "./components/PlannerResults";
import Projection from "./components/Projection";
import Risk from "./components/Risk";
import Tax from "./components/Tax";
import UtilityIcon from "./components/UtilityIcon";
import { useLocalStorage } from "./hooks/useLocalStorage";
import zhTW from "./i18n/zhTW";
import {
  calculateResults,
  convertMoneyInputsForCurrency,
  initialInputs,
  isReady,
  normalizeInputs,
  parseInputsFromSearch,
  serializeInputsToSearch,
} from "./utils/fireEngine";
import { getPlannerViewAction, PLANNER_VIEWS, transitionPlannerView } from "./utils/plannerView";

function getPlanStory(res) {
  if (!res) return { status: "先填核心數字", tone: "neutral", success: null, achievementRate: null };

  const success = res.mcData?.length ? res.mcData[res.mcData.length - 1] : null;
  const achievementRate = Math.max(0, Math.round((res.assessmentPortfolio / Math.max(res.fireTarget, 1)) * 100));
  if (success >= 85 && res.fireReadyAtRet) {
    return { status: "相對穩健", tone: "good", success, achievementRate };
  }
  if (success >= 65 || res.fireReadyAtRet) {
    return { status: "接近可行", tone: "warn", success, achievementRate };
  }
  return { status: "需要調整", tone: "bad", success, achievementRate };
}

export default function App() {
  const t = zhTW;
  const [tab, setTab] = useState(0);
  const [viewMode, setViewMode] = useState(PLANNER_VIEWS.INPUT);
  const [activePage, setActivePage] = useState("calculator");
  const inputHeadingRef = useRef(null);
  const resultHeadingRef = useRef(null);
  const urlInputs = useMemo(() => {
    if (typeof window === "undefined") return null;
    return parseInputsFromSearch(window.location.search);
  }, []);
  const urlIsBlank = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("blank") === "1";
  }, []);
  const [isResetState, setIsResetState] = useState(urlIsBlank);
  const [sharedSaveError, setSharedSaveError] = useState("");
  const [
    inp,
    setInp,
    clearStoredInputs,
    persistCurrentInputs,
    isSharedPlanPending,
  ] = useLocalStorage("fire-inputs", initialInputs, {
    overrideValue: urlInputs,
    normalize: normalizeInputs,
    persistOverride: false,
    requireExplicitOverridePersistence: !urlIsBlank,
  });

  const ready = useMemo(() => isReady(inp), [inp]);
  const res = useMemo(() => calculateResults(inp), [inp]);
  const story = useMemo(() => getPlanStory(res), [res]);
  const retirementLabel = inp.retAge <= inp.age ? "已退休模式" : `${inp.retAge || "未設定"}歲退休`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = isResetState ? "blank=1" : serializeInputsToSearch(inp);
    const nextUrl = `${window.location.pathname}?${query}`;
    window.history.replaceState({}, "", nextUrl);
  }, [inp, isResetState]);

  const resetInputs = () => {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm("確定要清除目前的退休規劃資料嗎？清除後將回到空白試算。");
    if (!confirmed) return;

    clearStoredInputs();
    setSharedSaveError("");
    setIsResetState(true);
  };

  const setInput = (key, value) => {
    setSharedSaveError("");
    setIsResetState(false);
    if (typeof key === "object") {
      setInp((prev) => ({ ...prev, ...key }));
      return;
    }

    if (key === "currencyCode") {
      setInp((prev) => convertMoneyInputsForCurrency(prev, value));
      return;
    }

    setInp((prev) => ({ ...prev, [key]: value }));
  };

  const saveSharedPlan = () => {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm(
      t.sharedPlan.saveConfirm,
    );
    if (!confirmed) return;

    if (!persistCurrentInputs()) {
      setSharedSaveError(t.sharedPlan.saveError);
      return;
    }

    setSharedSaveError("");
  };

  const focusViewHeading = (ref) => {
    window.requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      ref.current?.focus({ preventScroll: true });
    });
  };

  const showResults = () => {
    const nextView = transitionPlannerView(viewMode, ready && Boolean(res));
    if (nextView !== PLANNER_VIEWS.RESULT) return;
    setTab(1);
    setViewMode(nextView);
    focusViewHeading(resultHeadingRef);
  };

  const adjustPlan = () => {
    setTab(0);
    setViewMode(PLANNER_VIEWS.INPUT);
    focusViewHeading(inputHeadingRef);
  };

  const panels = [
    null,
    <Projection inp={inp} ready={ready} res={res} emptyText={t.empty} />,
    <Risk inp={inp} ready={ready} res={res} emptyText={t.empty} />,
    <Tax inp={inp} ready={ready} res={res} emptyText={t.empty} />,
  ];
  const resultTabs = t.tabs.slice(1).map((label, offset) => ({ label, index: offset + 1 }));
  const stickyAction = getPlannerViewAction(viewMode);

  if (activePage === "guide") {
    return <FormulaGuide onBack={() => setActivePage("calculator")} />;
  }

  if (activePage === "faq") {
    return <FAQ onBack={() => setActivePage("calculator")} />;
  }

  return (
    <div className="app-shell">
      <div className="app-header">
        <div className="app-header-main">
          <div className="app-title-block">
            <div style={{ fontSize: 11, color: "#C8A96E", textTransform: "uppercase", marginBottom: 3 }}>{t.headerKicker}</div>
            <div className="app-title">{t.title}</div>
          </div>
          <div className="header-actions">
            <PlanActions onReset={resetInputs} />
            <button type="button" className="header-action-button" aria-label="常見問題" title="常見問題" onClick={() => setActivePage("faq")}>
              <span className="header-action-icon" aria-hidden="true">
                <UtilityIcon name="help" />
              </span>
              <span className="header-action-label">FAQ</span>
            </button>
            <button type="button" className="header-action-button" aria-label="計算公式" title="計算公式" onClick={() => setActivePage("guide")}>
              <span className="header-action-icon" aria-hidden="true">
                <UtilityIcon name="formula" />
              </span>
              <span className="header-action-label">公式</span>
            </button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#8F8A80", marginTop: 4 }}>{t.subtitle}</div>
      </div>

      {isSharedPlanPending && (
        <section className="shared-plan-notice" aria-labelledby="shared-plan-title">
          <div>
            <strong id="shared-plan-title">{t.sharedPlan.title}</strong>
            <p>{t.sharedPlan.description}</p>
            {sharedSaveError && <p className="shared-plan-error" role="alert">{sharedSaveError}</p>}
          </div>
          <button type="button" onClick={saveSharedPlan}>{t.sharedPlan.saveButton}</button>
        </section>
      )}

      <main className="app-content">
        {viewMode === PLANNER_VIEWS.INPUT ? (
          <Inputs
            inp={inp}
            setInput={setInput}
            ready={ready}
            res={res}
            onShowResults={showResults}
            headingRef={inputHeadingRef}
          />
        ) : (
          <PlannerResults
            inp={inp}
            res={res}
            story={story}
            tabs={resultTabs}
            activeTab={tab}
            onTabChange={setTab}
            panels={panels}
            onAdjustPlan={adjustPlan}
            headingRef={resultHeadingRef}
          />
        )}
      </main>
      <div className={`sticky-summary ${ready && res ? "is-ready" : ""}`}>
        <div>
          <div className={`sticky-status ${story.tone}`}>{story.tone === "neutral" ? retirementLabel : story.status}</div>
          <div className="sticky-metrics">
            {story.achievementRate === null ? "填完核心數字即可試算" : `退休時達標率：${story.achievementRate}% · ${retirementLabel}`}
          </div>
        </div>
        <button
          type="button"
          onClick={viewMode === PLANNER_VIEWS.RESULT ? adjustPlan : showResults}
          disabled={viewMode === PLANNER_VIEWS.INPUT && (!ready || !res)}
        >
          {stickyAction.label}
        </button>
      </div>
    </div>
  );
}
