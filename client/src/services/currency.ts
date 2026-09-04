import type { Currency } from '../types';
import { api } from './api';

const FALLBACK: Record<Currency, number> = { USD: 1, TJS: 10.92, EUR: 0.92, RUB: 91.5 };

export async function fetchRates(): Promise<Record<string, number>> {
  try {
    const { data } = await api.get('/meta/rates');
    return data.data || FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export { FALLBACK as fallbackRates };
