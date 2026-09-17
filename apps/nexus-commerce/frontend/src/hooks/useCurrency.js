import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import {
  setCurrency,
  toggleCurrency,
  updateExchangeRates,
} from "../redux/slices/currencySlice";
import { productApi } from "../lib/api/productApi";
import { queryKeys } from "../lib/api/queryKeys";
import { CURRENCIES, QUERY_STALE_TIMES } from "../config/constants";
import currency from "currency.js";

export function useCurrency() {
  const dispatch = useDispatch();
  const { activeCurrency, exchangeRateUSDToPKR } = useSelector(
    (state) => state.currency,
  );

  // Background FX rate synchronization
  useQuery({
    queryKey: queryKeys.products.rates(),
    queryFn: async () => {
      const data = await productApi.getExchangeRates();
      if (data?.rates?.PKR) {
        dispatch(
          updateExchangeRates({
            rate: data.rates.PKR,
            lastUpdated: data.lastUpdated,
          }),
        );
      }
      return data;
    },
    staleTime: QUERY_STALE_TIMES.FX_RATES,
    refetchOnWindowFocus: false,
  });

  const isPKR = activeCurrency === CURRENCIES.PKR;
  const currencySymbol = isPKR ? "₨" : "$";

  /**
   * Safely formats an amount according to the active storefront currency.
   */
  const formatPrice = (amountUSD, amountPKR) => {
    if (isPKR) {
      if (amountPKR !== undefined && amountPKR !== null) {
        return `₨ ${currency(amountPKR, { precision: 0, symbol: "" }).format()}`;
      }
      const calculatedPKR = currency(amountUSD || 0).multiply(
        exchangeRateUSDToPKR,
      ).value;
      return `₨ ${currency(calculatedPKR, { precision: 0, symbol: "" }).format()}`;
    }

    const safeUSD =
      amountUSD !== undefined && amountUSD !== null ? amountUSD : 0;
    return currency(safeUSD, { symbol: "$" }).format();
  };

  return {
    activeCurrency,
    isPKR,
    currencySymbol,
    exchangeRate: exchangeRateUSDToPKR,
    setCurrency: (c) => dispatch(setCurrency(c)),
    toggleCurrency: () => dispatch(toggleCurrency()),
    formatPrice,
  };
}
