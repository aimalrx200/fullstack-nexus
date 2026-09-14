import currency from "currency.js";

// Configurable baseline exchange rate (1 USD = 280 PKR)
const DEFAULT_USD_TO_PKR_RATE = 280.0;

/**
 * Converts USD amount to PKR with zero floating-point precision loss.
 */
export const convertUSDtoPKR = (
  amountUSD,
  exchangeRate = DEFAULT_USD_TO_PKR_RATE,
) => {
  const safeAmount = Number(amountUSD) || 0;
  return currency(safeAmount, { precision: 2 }).multiply(exchangeRate).value;
};

/**
 * Converts PKR amount to USD with precision division.
 */
export const convertPKRtoUSD = (
  amountPKR,
  exchangeRate = DEFAULT_USD_TO_PKR_RATE,
) => {
  const safeAmount = Number(amountPKR) || 0;
  return currency(safeAmount, { precision: 2 }).divide(exchangeRate).value;
};

/**
 * Performs safe currency addition.
 */
export const addMoney = (baseAmount, amountToAdd) => {
  return currency(baseAmount).add(amountToAdd).value;
};

/**
 * Performs safe currency subtraction (never drops below zero).
 */
export const subtractMoney = (baseAmount, amountToSubtract) => {
  const result = currency(baseAmount).subtract(amountToSubtract).value;
  return Math.max(0, result);
};

/**
 * Computes discount reduction from a percentage.
 */
export const calculateDiscount = (totalAmount, discountPercent) => {
  const safePercent = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  return currency(totalAmount).multiply(safePercent / 100).value;
};

/**
 * Formats a monetary value for display.
 */
export const formatMoney = (amount, currencyCode = "USD") => {
  const safeAmount = Number(amount) || 0;

  if (currencyCode?.toUpperCase() === "PKR") {
    return `₨ ${currency(safeAmount, { symbol: "", precision: 0 }).format()}`;
  }

  return currency(safeAmount, { symbol: "$" }).format();
};
