import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { Seo } from '../components/Seo';
import { CarCard, CarCardSkeleton } from '../components/CarCard';
import { EmptyState, ErrorState } from '../components/EmptyState';
import { api } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import type { Car, Location, Paginated } from '../types';
import { BODIES, BRANDS, FUELS, TRANSMISSIONS } from '../types';
import { Search as SearchIcon } from 'lucide-react';
import { useI18n } from '../context/LocaleContext';
import type { Msg } from '../i18n/dict';

const SORT_KEYS: { id: string; key: Msg }[] = [
  { id: 'newest', key: 'sortNewest' },
  { id: 'oldest', key: 'sortOldest' },
  { id: 'price_asc', key: 'sortPriceAsc' },
  { id: 'price_desc', key: 'sortPriceDesc' },
  { id: 'mileage_asc', key: 'sortMileage' },
  { id: 'popular', key: 'sortPopular' },
];

export default function Cars() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<Paginated<Car> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const cat = params.get('category') || '';
  const q = params.get('q') || '';
  const pageTitle =
    cat === 'heavy' || cat === 'commercial' ? t('largeVehicles')
    : cat === 'special' ? t('catSpecial')
    : cat === 'kamaz' ? t('catKamaz')
    : cat === 'parts' ? t('catParts')
    : cat === 'passenger' ? t('catPassenger')
    : t('buyCars');
  const dq = useDebounce(q, 300);

  const queryString = useMemo(() => {
    const p = new URLSearchParams(params);
    if (dq) p.set('q', dq);
    else p.delete('q');
    return p.toString();
  }, [params, dq]);

  useEffect(() => {
    api.get('/meta/locations').then((r) => setLocations(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api
      .get(`/cars?${queryString}`)
      .then((r) => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [queryString]);

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  const filters = (
    <div className="space-y-4">
      <Field label={t('category')}>
        <select className="input" value={params.get('category') || ''} onChange={(e) => set('category', e.target.value)}>
          <option value="">{t('any')}</option>
          <option value="passenger">{t('catPassenger')}</option>
          <option value="commercial">{t('catCommercial')}</option>
          <option value="kamaz">{t('catKamaz')}</option>
          <option value="special">{t('catSpecial')}</option>
          <option value="parts">{t('catParts')}</option>
          <option value="heavy">{t('largeVehicles')}</option>
        </select>
      </Field>
      <Field label={t('brand')}>
        <select className="input" value={params.get('brand') || ''} onChange={(e) => set('brand', e.target.value)}>
          <option value="">{t('allBrands')}</option>
          {BRANDS.map((b) => <option key={b}>{b}</option>)}
        </select>
      </Field>
      <Field label={t('model')}>
        <input className="input" placeholder="X5, Camry…" value={params.get('model') || ''} onChange={(e) => set('model', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t('minPrice')}><input className="input" type="number" value={params.get('minPrice') || ''} onChange={(e) => set('minPrice', e.target.value)} /></Field>
        <Field label={t('maxPrice')}><input className="input" type="number" value={params.get('maxPrice') || ''} onChange={(e) => set('maxPrice', e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t('yearFrom')}><input className="input" type="number" value={params.get('yearFrom') || ''} onChange={(e) => set('yearFrom', e.target.value)} /></Field>
        <Field label={t('yearTo')}><input className="input" type="number" value={params.get('yearTo') || ''} onChange={(e) => set('yearTo', e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t('minKm')}><input className="input" type="number" value={params.get('minMileage') || ''} onChange={(e) => set('minMileage', e.target.value)} /></Field>
        <Field label={t('maxKm')}><input className="input" type="number" value={params.get('maxMileage') || ''} onChange={(e) => set('maxMileage', e.target.value)} /></Field>
      </div>
      <Field label={t('fuel')}>
        <select className="input" value={params.get('fuel') || ''} onChange={(e) => set('fuel', e.target.value)}>
          <option value="">{t('any')}</option>
          {FUELS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </Field>
      <Field label={t('transmission')}>
        <select className="input" value={params.get('transmission') || ''} onChange={(e) => set('transmission', e.target.value)}>
          <option value="">{t('any')}</option>
          {TRANSMISSIONS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </Field>
      <Field label={t('body')}>
        <select className="input" value={params.get('body') || ''} onChange={(e) => set('body', e.target.value)}>
          <option value="">{t('any')}</option>
          {BODIES.map((f) => <option key={f}>{f}</option>)}
        </select>
      </Field>
      <Field label={t('country')}>
        <select className="input" value={params.get('country') || ''} onChange={(e) => set('country', e.target.value)}>
          <option value="">{t('any')}</option>
          {[...new Set(locations.map((l) => l.country))].map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label={t('city')}>
        <input className="input" value={params.get('city') || ''} onChange={(e) => set('city', e.target.value)} placeholder="Dushanbe" />
      </Field>
      <button type="button" className="btn-ghost w-full" onClick={() => setParams({})}>{t('clearFilters')}</button>
    </div>
  );

  return (
    <div className="container-ah py-5 sm:py-8">
      <Seo title={`${pageTitle} — BENZ`} description={t('heroSubtitle')} />
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">{pageTitle}</h1>
          <p className="text-sm text-[var(--ah-muted)]">{data?.pagination.total ?? '—'} {t('listings')}</p>
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row md:max-w-xl">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ah-muted)]" />
            <input
              className="input pl-9"
              placeholder={t('searchPlaceholder')}
              value={q}
              onChange={(e) => set('q', e.target.value)}
            />
          </div>
          <select className="input sm:w-48" value={params.get('sort') || 'newest'} onChange={(e) => set('sort', e.target.value)}>
            {SORT_KEYS.map((s) => <option key={s.id} value={s.id}>{t(s.key)}</option>)}
          </select>
          <button type="button" className="btn-ghost lg:hidden" onClick={() => setOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> {t('filters')}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="card hidden h-fit p-5 lg:block">{filters}</aside>
        <div>
          {error && <ErrorState onRetry={() => setParams(new URLSearchParams(params))} />}
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <CarCardSkeleton key={i} />)}
            </div>
          )}
          {!loading && !error && data && data.data.length === 0 && (
            <EmptyState icon={SearchIcon} title={t('noCarsFound')} text={t('trySearch')} />
          )}
          {!loading && data && data.data.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.data.map((c) => <CarCard key={c.id} car={c} />)}
              </div>
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`h-9 w-9 rounded-full text-sm ${Number(params.get('page') || 1) === i + 1 ? 'bg-gold-500 text-zinc-950' : 'border border-[var(--ah-line)]'}`}
                    onClick={() => set('page', String(i + 1))}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {open && createPortal(
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close filters" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 h-[100dvh] w-[min(92vw,380px)] overflow-auto bg-[var(--ah-surface)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{t('filters')}</h2>
              <button type="button" onClick={() => setOpen(false)}><X /></button>
            </div>
            {filters}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
