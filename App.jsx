import { useEffect, useMemo, useState } from "react";
import FAQ from "./components/FAQ";
import Inputs from "./components/Inputs";
import FormulaGuide from "./components/FormulaGuide";
import Projection from "./components/Projection";
import Risk from "./components/Risk";
import Tax from "./components/Tax";
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
import { fmt } from "./utils/formatters";

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
  const [inp, setInp] = useLocalStorage("fire-inputs", initialInputs, {
    overrideValue: urlInputs,
    normalize: normalizeInputs,
  });

  const ready = useMemo(() => isReady(inp), [inp]);
  const res = useMemo(() => calculateResults(inp), [inp]);
  const story = useMemo(() => getPlanStory(res), [res]);
  const retirementLabel = inp.retAge <= inp.age ? "已退休模式" : `${inp.retAge || "未設定"}歲退休`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = serializeInputsToSearch(inp);
    window.history.replaceState({}, "", `${window.location.pathname}?${query}`);
  }, [inp]);

  const setInput = (key, value) => {
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
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#C8A96E", textTransform: "uppercase", marginBottom: 3 }}>{t.headerKicker}</div>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15 }}>{t.title}</div>
          </div>
          <div className="header-actions">
            <button type="button" onClick={() => setActivePage("faq")}>
              FAQ
            </button>
            <button type="button" onClick={() => setActivePage("guide")}>
              公式
            </button>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#3E3C38", marginTop: 4 }}>{t.subtitle}</div>
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
              color: tab === i ? "#C8A96E" : "#4A4844",
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
          <div className={`sticky-status ${story.tone}`}>{retirementLabel}</div>
          <div className="sticky-metrics">
            {story.achievementRate === null ? "填完核心數字即可試算" : `${story.achievementRate}% 達標`}
            {res ? <span>目前資產：{fmt(res.savedRaw, res.currency)}</span> : null}
          </div>
        </div>
        <button type="button" onClick={showDetails} disabled={!ready || !res}>
          查看詳細
        </button>
      </div>
    </div>
  );
}
