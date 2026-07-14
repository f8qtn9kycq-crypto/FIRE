import { useEffect, useMemo, useState } from "react";
import FAQ from "./components/FAQ";
import Inputs from "./components/Inputs";
import FormulaGuide from "./components/FormulaGuide";
import PlanActions from "./components/PlanActions";
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
  const [activePage, setActivePage] = useState("calculator");
  const urlInputs = useMemo(() => {
    if (typeof window === "undefined") return null;
    return parseInputsFromSearch(window.location.search);
  }, []);
  const urlIsBlank = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("blank") === "1";
  }, []);
  const [isResetState, setIsResetState] = useState(urlIsBlank);
  const [inp, setInp, clearStoredInputs] = useLocalStorage("fire-inputs", initialInputs, {
    overrideValue: urlInputs,
    normalize: normalizeInputs,
    persistOverride: !urlIsBlank,
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
    setIsResetState(true);
  };

  const setInput = (key, value) => {
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

  const showDetails = () => {
    setTab(1);
    window.requestAnimationFrame(() => {
      document.querySelector(".tab-bar")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const panels = [
    <Inputs inp={inp} setInput={setInput} ready={ready} res={res} story={story} />,
    <Projection inp={inp} ready={ready} res={res} emptyText={t.empty} />,
    <Risk inp={inp} ready={ready} res={res} emptyText={t.empty} />,
    <Tax inp={inp} ready={ready} res={res} emptyText={t.empty} />,
  ];

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

      <div className="tab-bar">
        {t.tabs.map((label, i) => (
          <button
            key={label}
            className="tab-button"
            onClick={() => setTab(i)}
            style={{
              flex: 1,
              padding: "13px 4px",
              fontSize: 16,
              fontWeight: tab === i ? 700 : 400,
              color: tab === i ? "#C8A96E" : "#9B9890",
              background: "none",
              border: "none",
              borderBottom: tab === i ? "2px solid #C8A96E" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="app-content">{panels[tab]}</div>
      <div className={`sticky-summary ${ready && res ? "is-ready" : ""}`}>
        <div>
          <div className={`sticky-status ${story.tone}`}>{story.tone === "neutral" ? retirementLabel : story.status}</div>
          <div className="sticky-metrics">
            {story.achievementRate === null ? "填完核心數字即可試算" : `退休時達標率：${story.achievementRate}% · ${retirementLabel}`}
          </div>
        </div>
        <button type="button" onClick={showDetails} disabled={!ready || !res}>
          查看詳細
        </button>
      </div>
    </div>
  );
}
