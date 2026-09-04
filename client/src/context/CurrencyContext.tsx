import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Currency } from '../types';
import { fetchRates, fallbackRates } from '../services/currency';

interface CurrencyState {
  currency: Currency;
  rates: Record<string, number>;
  setCurrency: (c: Currency) => void;
}

const CurrencyContext = createContext<CurrencyState | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(
    () => (localStorage.getItem('ah_currency') as Currency) || 'USD'
  );
  const [rates, setRates] = useState<Record<string, number>>(fallbackRates);

  useEffect(() => {
    fetchRates().then(setRates);
  }, []);

  const setCurrency = (c: Currency) => {
    localStorage.setItem('ah_currency', c);
    setCurrencyState(c);
  };

  const value = useMemo(() => ({ currency, rates, setCurrency }), [currency, rates]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency');
  return ctx;
}
