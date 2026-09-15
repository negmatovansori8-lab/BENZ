import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Scale } from '../components/icons';
import { Seo } from '../components/Seo';
import { useCompare } from '../context/CompareContext';
import { useCurrency } from '../context/CurrencyContext';
import { carImage, formatMileage, formatPrice } from '../utils/format';
import { EmptyState } from '../components/EmptyState';
import type { Car } from '../types';
import { SafeImg } from '../components/SafeImg';
import { useI18n } from '../context/LocaleContext';
import type { Msg } from '../i18n/dict';

export default function Compare() {
  const { items, remove, clear } = useCompare();
  const currency = useCurrency();
  const { t } = useI18n();

  const rows: { key: string; label: Msg; render: (c: Car) => ReactNode }[] = [
    { key: 'price', label: 'colPrice', render: (c) => formatPrice(c.price_usd, currency.currency, currency.rates) },
    { key: 'year', label: 'year', render: (c) => c.year },
    { key: 'mileage', label: 'mileage', render: (c) => formatMileage(c.mileage) },
    { key: 'engine', label: 'specEngine', render: (c) => c.engine || '—' },
    { key: 'power', label: 'specPower', render: (c) => c.power ? `${c.power} ${t('hp')}` : '—' },
    { key: 'fuel', label: 'fuel', render: (c) => c.fuel },
    { key: 'transmission', label: 'transmission', render: (c) => c.transmission },
    { key: 'body', label: 'body', render: (c) => c.body },
    { key: 'location', label: 'location', render: (c) => c.city || c.location || '—' },
  ];

  return (
    <div className="container-ah py-6 sm:py-10">
      <Seo title={`${t('compareTitle')} — BENZ`} />
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">{t('compareTitle')}</h1>
          <p className="mt-1 text-sm text-[var(--ah-muted)]">{t('compareSubtitle')}</p>
        </div>
        {items.length > 0 && <button type="button" className="btn-ghost shrink-0 !px-3 !py-2 text-xs" onClick={clear}>{t('clearAll')}</button>}
      </div>

      {!items.length || items.length < 2 ? (
        <div className="mt-8">
          <EmptyState
            icon={Scale}
            title={t('nothingToCompare')}
            text={t('addCarsToCompare')}
            action={{ to: '/cars?category=passenger', label: t('browseCars') }}
          />
        </div>
      ) : (
        <div className="mt-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[520px] overflow-hidden rounded-2xl border border-[var(--ah-line)] bg-[var(--ah-surface)] text-sm">
            <thead>
              <tr>
                <th className="w-24 p-3 text-left" />
                {items.map((c) => (
                  <th key={c.id} className="p-3 align-top">
                    <SafeImg src={carImage(c.images?.[0]?.url, c.id)} seed={c.id} alt="" className="mb-2 h-24 w-full rounded-xl object-cover sm:h-28" />
                    <Link to={`/cars/${c.id}`} className="font-semibold leading-tight">{c.brand} {c.model}</Link>
                    <button type="button" className="mt-2 block text-xs text-red-500" onClick={() => remove(c.id)}>{t('sellRemove')}</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-[var(--ah-line)]">
                  <th className="p-3 text-left text-xs text-[var(--ah-muted)]">{t(row.label)}</th>
                  {items.map((c) => (
                    <td key={c.id} className="p-3 font-medium">{row.render(c)}</td>
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
