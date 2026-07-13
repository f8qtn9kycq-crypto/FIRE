import { useRef, useState } from "react";
import { CURRENCIES, fmt, formatMoneyInput, moneyWanToTwd, parseMoneyInput } from "../utils/formatters";
import { DEFAULT_PLAN_END_AGE, getInputCompletion, getValidationAlert, validateInputsForDisplay } from "../utils/fireEngine";
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
  const inputRefs = useRef({});
  const currency = res?.currency || CURRENCIES[inp.currencyCode] || CURRENCIES.TWD;
  const moneyPrefix = currency.symbol || currency.code;
  const completion = getInputCompletion(inp);
  const completionByKey = Object.fromEntries(completion.fields.map((field) => [field.key, field]));
  const ageMissing = !completionByKey.age.isComplete;
  const retAgeMissing = !completionByKey.retAge.isComplete;
  const assetsMissing = !completionByKey.assets.isComplete;
  const expensesMissing = !completionByKey.expenses.isComplete;
  const validation = validateInputsForDisplay(inp);
  const validationAlert = getValidationAlert(inp);
  const hasTouchedPlanningAge = inp.age > 0 || inp.retAge > 0 || inp.lifeExp !== DEFAULT_PLAN_END_AGE;
  const shouldShowValidation = hasTouchedPlanningAge && validationAlert.alertType !== "success";
  const hasBlockingValidation = hasTouchedPlanningAge && validation.hasErrors;
  const setInputRef = (key) => (node) => {
    inputRefs.current[key] = node;
  };
  const focusFirstMissing = () => {
    const target = completion.firstMissing;
    const input = target && inputRefs.current[target.focusKey];
    if (!input) return;

    input.scrollIntoView({ behavior: "smooth", block: "center" });
    window.requestAnimationFrame(() => input.focus());
  };

  return (
    <div>
      <MobileSummary inp={inp} res={res} story={story} />

      {shouldShowValidation && (
        <div className={`validation-alert ${validationAlert.alertType}`}>
          <strong>{validationAlert.statusText}</strong>
          <ul>
            {validationAlert.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </div>
      )}

      <Divider />
      <SecLabel>核心試算</SecLabel>
      <section className="completion-card" aria-live="polite">
        <div className="completion-header">
          <strong>核心資料 {completion.completedCount}/{completion.totalCount} 完成</strong>
          <span>{completion.allComplete ? "可以開始試算" : "還有資料需要補上"}</span>
        </div>
        <progress
          className="completion-progress"
          value={completion.completedCount}
          max={completion.totalCount}
          aria-label={`核心資料完成 ${completion.completedCount} 項，共 ${completion.totalCount} 項`}
        />
        <div className="completion-list">
          {completion.fields.map((field) => (
            <span key={field.key} className={`completion-item ${field.isComplete ? "is-complete" : "is-missing"}`}>
              {field.isComplete ? "完成" : "待填"}：{field.label}
            </span>
          ))}
        </div>
      </section>
      <div className="age-grid">
        <NumInput
          id="age"
          inputRef={setInputRef("age")}
          label="目前年齡（歲）"
          value={inp.age}
          onChange={(v) => setInput("age", v)}
          placeholder="例：45"
          isMissing={ageMissing}
          errorText={ageMissing ? "請填寫目前年齡" : ""}
        />
        <NumInput
          id="retirement-age"
          inputRef={setInputRef("retAge")}
          label="退休年齡（歲）"
          value={inp.retAge}
          onChange={(v) => setInput("retAge", v)}
          placeholder="例：55"
          isMissing={retAgeMissing}
          errorText={retAgeMissing ? "請填寫退休年齡" : ""}
        />
      </div>
      <div className="money-grid">
        <NumInput id="cash" inputRef={setInputRef("cash")} label="現金儲蓄（萬元）" isWan prefix={moneyPrefix} value={inp.cash} onChange={(v) => setInput("cash", v)} placeholder="例：500" formatValue={formatMoneyInput} parseValue={parseMoneyInput} isMissing={assetsMissing} />
        <NumInput id="investments" label="投資總額（萬元）" isWan prefix={moneyPrefix} value={inp.investments} onChange={(v) => setInput("investments", v)} placeholder="例：2500" formatValue={formatMoneyInput} parseValue={parseMoneyInput} isMissing={assetsMissing} />
      </div>
      {assetsMissing && (
        <div className="input-error input-group-error">請至少填寫現金儲蓄或投資總額其中一項</div>
      )}
      {(inp.cash > 0 || inp.investments > 0) && (
        <div className="input-helper">
          合計：{fmt(moneyWanToTwd(inp.cash, currency) + moneyWanToTwd(inp.investments, currency), currency)}
        </div>
      )}
      <NumInput id="expenses" inputRef={setInputRef("expenses")} label="退休生活費（年，現值，萬元）" isWan prefix={moneyPrefix} value={inp.expenses} onChange={(v) => setInput("expenses", v)} placeholder="例：100" formatValue={formatMoneyInput} parseValue={parseMoneyInput} isMissing={expensesMissing} errorText={expensesMissing ? "請填寫退休後每年生活費" : ""} />
      {inp.expenses > 0 && (
        <div className="input-helper">
          以今日物價計算；試算會依每年 {inp.inf}% 通膨自動推估退休時生活費。
        </div>
      )}
      <NumInput id="annual-contribution" label="退休前每年投入金額（萬元）" isWan prefix={moneyPrefix} value={inp.annualContrib} onChange={(v) => setInput("annualContrib", v)} placeholder="可填 0" formatValue={formatMoneyInput} parseValue={parseMoneyInput} />
      <div className="input-helper">可先填 0；有定期投入時，試算會加入退休前資產。</div>

      <button
        type="button"
        className="primary-cta"
        disabled={hasBlockingValidation}
        onClick={() => {
          if (!ready) focusFirstMissing();
        }}
      >
        {hasBlockingValidation ? "請先修正年齡設定" : ready ? "已完成試算" : completion.firstMissing ? `還需要：${completion.firstMissing.label}` : "完成核心資料後試算"}
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
            <NumInput label="長期規劃到幾歲" value={inp.lifeExp} onChange={(v) => setInput("lifeExp", v)} placeholder="例：95" />
            <div className="input-helper">
              {inp.retAge > 0 && inp.lifeExp > inp.retAge
                ? `退休後規劃約 ${inp.lifeExp - inp.retAge} 年；若想保守，可測試 95-100 歲。`
                : "預設以 95 歲作為長期規劃年齡。"}
            </div>
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
