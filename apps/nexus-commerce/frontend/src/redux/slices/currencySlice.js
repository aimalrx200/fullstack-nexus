import { createSlice } from "@reduxjs/toolkit";
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  DEFAULT_USD_TO_PKR_RATE,
  STORAGE_KEYS,
} from "../../config/constants";

const getInitialCurrency = () => {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
  return saved === CURRENCIES.PKR ? CURRENCIES.PKR : CURRENCIES.USD;
};

const initialState = {
  activeCurrency: getInitialCurrency(),
  exchangeRateUSDToPKR: DEFAULT_USD_TO_PKR_RATE,
  lastUpdated: null,
};

export const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.activeCurrency = action.payload;
    },
    toggleCurrency: (state) => {
      state.activeCurrency =
        state.activeCurrency === CURRENCIES.USD
          ? CURRENCIES.PKR
          : CURRENCIES.USD;
    },
    updateExchangeRates: (state, action) => {
      const { rate, lastUpdated } = action.payload;
      if (rate && rate > 0) {
        state.exchangeRateUSDToPKR = Number(rate);
        state.lastUpdated = lastUpdated || new Date().toISOString();
      }
    },
  },
});

export const { setCurrency, toggleCurrency, updateExchangeRates } =
  currencySlice.actions;
export default currencySlice.reducer;
