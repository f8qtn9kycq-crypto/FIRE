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
