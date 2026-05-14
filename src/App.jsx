import { useEffect, useMemo, useState } from "react";
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

export default function App() {
  const t = zhTW;
  const [tab, setTab] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
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

  const panels = [
    <Inputs inp={inp} setInput={setInput} ready={ready} res={res} />,
    <Projection inp={inp} ready={ready} res={res} emptyText={t.empty} />,
    <Risk inp={inp} ready={ready} res={res} emptyText={t.empty} />,
    <Tax inp={inp} ready={ready} res={res} emptyText={t.empty} />,
  ];

  if (showGuide) {
    return <FormulaGuide onBack={() => setShowGuide(false)} />;
  }

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#C8A96E", textTransform: "uppercase", marginBottom: 3 }}>{t.headerKicker}</div>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15 }}>{t.title}</div>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            style={{ border: "1px solid #2E2C28", background: "#1A1916", color: "#C8A96E", borderRadius: 8, padding: "8px 10px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}
          >
            公式
          </button>
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
    </div>
  );
}
