export const MIN_CAPITAL_GAINS_TAX_PERCENT = 0;
export const MAX_CAPITAL_GAINS_TAX_PERCENT_EXCLUSIVE = 100;

export function isValidCapitalGainsTaxPercent(value) {
  return (
    Number.isFinite(value) &&
    value >= MIN_CAPITAL_GAINS_TAX_PERCENT &&
    value < MAX_CAPITAL_GAINS_TAX_PERCENT_EXCLUSIVE
  );
}

export function isValidCapitalGainsTaxRate(value) {
  return Number.isFinite(value) && value >= 0 && value < 1;
}

export function grossUpWithdrawalForTax(netWithdrawal, capitalGainsTaxRate) {
  if (!isValidCapitalGainsTaxRate(capitalGainsTaxRate)) {
    throw new RangeError("Capital gains tax rate must be at least 0 and less than 1.");
  }

  return netWithdrawal / (1 - capitalGainsTaxRate);
}
