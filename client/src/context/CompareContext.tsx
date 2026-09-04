import { createContext, useContext, useMemo, useState } from 'react';
import type { Car } from '../types';

interface CompareState {
  items: Car[];
  add: (car: Car) => boolean;
  remove: (id: number) => void;
  clear: () => void;
  has: (id: number) => boolean;
}

const CompareContext = createContext<CompareState | null>(null);

function load(): Car[] {
  try {
    return JSON.parse(localStorage.getItem('ah_compare') || '[]');
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Car[]>(load);

  const persist = (next: Car[]) => {
    setItems(next);
    localStorage.setItem('ah_compare', JSON.stringify(next));
  };

  const value = useMemo<CompareState>(
    () => ({
      items,
      add: (car) => {
        if (items.some((c) => c.id === car.id)) return true;
        if (items.length >= 4) return false;
        persist([...items, car]);
        return true;
      },
      remove: (id) => persist(items.filter((c) => c.id !== id)),
      clear: () => persist([]),
      has: (id) => items.some((c) => c.id === id),
    }),
    [items]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare');
  return ctx;
}
