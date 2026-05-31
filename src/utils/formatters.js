export const SYM = "NT$";

export const CURRENCIES = {
  TWD: { code: "TWD", rate: 1, symbol: "NT$" },
  USD: { code: "USD", rate: 0.031, symbol: "US$" },
};

export function fmtCurrency(n, currency = CURRENCIES.TWD) {
  const converted = (n || 0) * currency.rate;

  return new Intl.NumberFormat(currency.code === "TWD" ? "zh-TW" : "en-US", {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: 0,
  }).format(converted);
}

export function fmt(n, currency = CURRENCIES.TWD) {
  if (currency.code !== "TWD") return fmtCurrency(n, currency);

  const v = Math.round(n || 0);
  if (Math.abs(v) >= 1e8) return SYM + (v / 1e8).toFixed(2) + "億";
  return SYM + (v / 1e4).toFixed(1) + "萬";
}

export const moneyWanToTwd = (w, currency = CURRENCIES.TWD) =>
  ((parseFloat(w) || 0) * 1e4) / currency.rate;

export const twdToMoneyWan = (r, currency = CURRENCIES.TWD) =>
  r === 0 ? 0 : parseFloat(((r * currency.rate) / 1e4).toFixed(2));

export function formatMoneyInput(value) {
  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed) || parsed === 0) return "";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: parsed % 1 === 0 ? 0 : 2,
  }).format(parsed);
}

export function parseMoneyInput(input) {
  if (typeof input === "number") return Number.isFinite(input) ? input : 0;
  if (!input || typeof input !== "string") return 0;

  const cleaned = input.replace(/[萬万]/g, "").replace(/[,\s]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function validateMoneyInput(value, options = {}) {
  const { min = 0, max = 9999999, allowZero = true } = options;
  const parsed = parseFloat(value);

  if (!Number.isFinite(parsed)) {
    return { isValid: false, reason: "請輸入有效金額" };
  }

  if (!allowZero && parsed === 0) {
    return { isValid: false, reason: "不能為 0" };
  }

  if (parsed < min || parsed > max) {
    return {
      isValid: false,
      reason: parsed < min ? `最小值為 ${min} 萬` : `最大值為 ${max} 萬`,
    };
  }

  return { isValid: true };
}
