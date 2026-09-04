import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { Seo } from '../components/Seo';
import { useCompare } from '../context/CompareContext';
import { useCurrency } from '../context/CurrencyContext';
import { carImage, formatMileage, formatPrice } from '../utils/format';
import { EmptyState } from '../components/EmptyState';
import type { Car } from '../types';
import { SafeImg } from '../components/SafeImg';

const ROWS: { key: string; label: string; render: (c: Car, currency: ReturnType<typeof useCurrency>) => ReactNode }[] = [
  { key: 'price', label: 'Price', render: (c, cur) => formatPrice(c.price_usd, cur.currency, cur.rates) },
  { key: 'year', label: 'Year', render: (c) => c.year },
  { key: 'mileage', label: 'Mileage', render: (c) => formatMileage(c.mileage) },
  { key: 'engine', label: 'Engine', render: (c) => c.engine || '—' },
  { key: 'power', label: 'Power', render: (c) => c.power ? `${c.power} hp` : '—' },
  { key: 'fuel', label: 'Fuel', render: (c) => c.fuel },
  { key: 'transmission', label: 'Transmission', render: (c) => c.transmission },
  { key: 'body', label: 'Body', render: (c) => c.body },
  { key: 'location', label: 'Location', render: (c) => c.location || '—' },
];

export default function Compare() {
  const { items, remove, clear } = useCompare();
  const currency = useCurrency();

  return (
    <div className="container-ah py-10">
      <Seo title="Compare Cars — BENZ" />
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Compare Cars</h1>
          <p className="text-sm text-[var(--ah-muted)]">Up to 4 vehicles side by side.</p>
        </div>
        {items.length > 0 && <button type="button" className="btn-ghost" onClick={clear}>Clear all</button>}
      </div>

      {!items.length ? (
        <div className="mt-8">
          <EmptyState icon={Scale} title="Nothing to compare" text="Add cars from the marketplace using the compare button." action={{ to: '/cars', label: 'Browse cars' }} />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr>
                <th className="p-4 text-left" />
                {items.map((c) => (
                  <th key={c.id} className="p-4 align-top">
                    <SafeImg src={carImage(c.images?.[0]?.url, c.id)} seed={c.id} alt="" className="mb-2 h-28 w-full rounded-xl object-cover" />
                    <Link to={`/cars/${c.id}`} className="font-semibold">{c.brand} {c.model}</Link>
                    <button type="button" className="mt-2 block text-xs text-red-500" onClick={() => remove(c.id)}>Remove</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key} className="border-t border-[var(--ah-line)]">
                  <th className="p-3 text-left text-[var(--ah-muted)]">{row.label}</th>
                  {items.map((c) => (
                    <td key={c.id} className="p-3 font-medium">{row.render(c, currency)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
