import { useState } from "react";
import { CURRENCIES, fmt, formatMoneyInput, moneyWanToTwd, parseMoneyInput } from "../utils/formatters";
import MobileSummary from "./MobileSummary";
import { Divider, NumInput, SecLabel, Slider } from "./SummaryCards";

const PRESETS = {
  retPre: [
    { label: "保守", value: 4 },
    { label: "平衡", value: 7 },
    { label: "積極", value: 10 },
  ],
  retPost: [
    { label: "保守", value: 3 },
    { label: "平衡", value: 5 },
    { label: "積極", value: 7 },
  ],
  swr: [
    { label: "保守", value: 3 },
    { label: "平衡", value: 3.5 },
    { label: "積極", value: 4 },
  ],
  inf: [
    { label: "低", value: 1.5 },
    { label: "一般", value: 2.5 },
    { label: "高", value: 4 },
  ],
};

export default function Inputs({ inp, setInput, ready, res, story }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const currency = res?.currency || CURRENCIES[inp.currencyCode] || CURRENCIES.TWD;
  const moneyPrefix = currency.symbol || currency.code;
  const needsExpense = inp.expenses <= 0;

  return (
    <div>
      <MobileSummary inp={inp} res={res} story={story} />

      <Divider />
      <SecLabel>核心試算</SecLabel>
      <div className="age-grid">
        <NumInput label="目前年齡" value={inp.age} onChange={(v) => setInput("age", v)} placeholder="例：45" />
        <NumInput label="退休年齡" value={inp.retAge} onChange={(v) => setInput("retAge", v)} placeholder="例：55" />
      </div>
      <div className="money-grid">
        <NumInput label="現金儲蓄（萬元）" isWan prefix={moneyPrefix} value={inp.cash} onChange={(v) => setInput("cash", v)} placeholder="例：500" formatValue={formatMoneyInput} parseValue={parseMoneyInput} />
        <NumInput label="投資總額（萬元）" isWan prefix={moneyPrefix} value={inp.investments} onChange={(v) => setInput("investments", v)} placeholder="例：2500" formatValue={formatMoneyInput} parseValue={parseMoneyInput} />
      </div>
      {(inp.cash > 0 || inp.investments > 0) && (
        <div className="input-helper">
          合計：{fmt(moneyWanToTwd(inp.cash, currency) + moneyWanToTwd(inp.investments, currency), currency)}
        </div>
      )}
      <NumInput label="退休生活費（年，現值，萬元）" isWan prefix={moneyPrefix} value={inp.expenses} onChange={(v) => setInput("expenses", v)} placeholder="例：100" formatValue={formatMoneyInput} parseValue={parseMoneyInput} />
      {inp.expenses > 0 && (
        <div className="input-helper">
          以今日物價計算；試算會依每年 {inp.inf}% 通膨自動推估退休時生活費。
        </div>
      )}

      <button
        type="button"
        className="primary-cta"
        onClick={() => {
          if (!ready) setAdvancedOpen(true);
        }}
      >
        {ready ? "已完成試算" : needsExpense ? "開始試算：填退休生活費" : "開始試算"}
      </button>

      <details className="advanced-panel" open={advancedOpen} onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}>
        <summary>進階設定</summary>
        <div className="advanced-body">
          <details className="setting-panel">
            <summary>通膨與提領</summary>
            <Slider label="安全提領率" value={inp.swr} min={2} max={6} step={0.25} presets={PRESETS.swr} onChange={(v) => setInput("swr", v)} />
            <Slider label="通貨膨脹率" value={inp.inf} min={0} max={8} step={0.25} presets={PRESETS.inf} onChange={(v) => setInput("inf", v)} />
          </details>

          <details className="setting-panel">
            <summary>進階假設</summary>
            <NumInput label="退休前每年投入金額（萬元）" isWan prefix={moneyPrefix} value={inp.annualContrib} onChange={(v) => setInput("annualContrib", v)} placeholder="例：200" formatValue={formatMoneyInput} parseValue={parseMoneyInput} />
            {inp.annualContrib > 0 && inp.retAge > inp.age && (
              <div className="input-helper">
                退休前共投入 {inp.retAge - inp.age} 年，合計 {fmt(moneyWanToTwd(inp.annualContrib, currency) * (inp.retAge - inp.age), currency)}（未含複利）
              </div>
            )}
            <Slider label="退休前年報酬率" value={inp.retPre} min={2} max={15} step={0.5} presets={PRESETS.retPre} onChange={(v) => setInput("retPre", v)} />
            <Slider label="退休後年報酬率" value={inp.retPost} min={1} max={12} step={0.5} presets={PRESETS.retPost} onChange={(v) => setInput("retPost", v)} />
          </details>

          <details className="setting-panel">
            <summary>稅務設定</summary>
            <div className="field-block">
              <label>輸入 / 顯示幣別</label>
              <select
                value={inp.currencyCode}
                onChange={(e) => setInput("currencyCode", e.target.value)}
                className="large-select"
              >
                {Object.keys(CURRENCIES).map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
            <NumInput label="資本利得稅率 %" value={inp.cgTax} onChange={(v) => setInput("cgTax", v)} placeholder="例：20" />
          </details>

          <details className="setting-panel">
            <summary>Monte Carlo 與壓力測試</summary>
            <div className="setting-note">
              目前模擬與熊市壓力測試會自動依你的核心數字更新，詳細結果放在「風險」與「預測」頁。
            </div>
          </details>
        </div>
      </details>
    </div>
  );
}
