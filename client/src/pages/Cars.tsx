import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search as SearchIcon } from '../components/icons';
import { Icon } from '../components/icons/Icon';
import { IconButton } from '../components/icons/IconButton';
import { Seo } from '../components/Seo';
import { CarCard, CarCardSkeleton } from '../components/CarCard';
import { EmptyState, ErrorState } from '../components/EmptyState';
import { api } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import type { Car, Location, Paginated } from '../types';
import { BRANDS } from '../types';
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
    if (!p.get('limit')) p.set('limit', '24');
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
      .then((r) => {
        const seen = new Set<string>();
        const rows = (r.data.data || []).filter((c: Car) => {
          const twinKey = cat === 'kamaz' || cat === 'heavy' || cat === 'commercial' || cat === 'special' || cat === 'parts'
            ? `${c.brand}|${c.model}|${c.category}`
            : `${c.brand}|${c.model}|${c.year}|${c.category}`;
          const id = `id:${c.id}`;
          if (seen.has(id) || seen.has(twinKey)) return false;
          seen.add(id);
          seen.add(twinKey);
          return true;
        });
        setData({ ...r.data, data: rows });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [queryString]);

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (cat) next.set('category', cat);
    setParams(next);
  };

  const filters = (
    <div className="space-y-3">
      <Field label={t('brand')}>
        <select className="input" value={params.get('brand') || ''} onChange={(e) => set('brand', e.target.value)}>
          <option value="">{t('allBrands')}</option>
          {BRANDS.map((b) => <option key={b}>{b}</option>)}
        </select>
      </Field>
      <Field label={t('city')}>
        <select className="input" value={params.get('city') || ''} onChange={(e) => set('city', e.target.value)}>
          <option value="">{t('any')}</option>
          {[...new Set(locations.map((l) => l.city))].map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <div className="flex gap-2 pt-1">
        <button type="button" className="btn-ghost flex-1 !py-2.5" onClick={clearFilters}>{t('clearFilters')}</button>
        <button type="button" className="btn-gold flex-1 !py-2.5 lg:hidden" onClick={() => setOpen(false)}>{t('applyFilters')}</button>
      </div>
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
              <Icon icon={SearchIcon} size="sm" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ah-muted)]" decorative />
              <input
                className="input pl-9"
                placeholder={t('searchPlaceholder')}
                value={q}
                onChange={(e) => set('q', e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select className="input flex-1 sm:w-48" value={params.get('sort') || 'newest'} onChange={(e) => set('sort', e.target.value)}>
                {SORT_KEYS.map((s) => <option key={s.id} value={s.id}>{t(s.key)}</option>)}
              </select>
              <button type="button" className="btn-ghost inline-flex shrink-0 items-center gap-2 lg:hidden" onClick={() => setOpen(true)}>
                <Icon icon={SlidersHorizontal} size="sm" decorative /> {t('filters')}
              </button>
            </div>
          </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
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
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                {(() => {
                  const current = Number(params.get('page') || 1);
                  const totalPages = data.pagination.totalPages;
                  const pages = new Set([1, totalPages, current - 1, current, current + 1]);
                  const list = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
                  const nodes: ReactNode[] = [];
                  list.forEach((n, idx) => {
                    if (idx && n - list[idx - 1] > 1) {
                      nodes.push(<span key={`e${n}`} className="px-1 text-[var(--ah-muted)]">…</span>);
                    }
                    nodes.push(
                      <button
                        key={n}
                        type="button"
                        className={`h-9 min-w-9 rounded-full px-3 text-sm ${current === n ? 'bg-gold-500 text-zinc-950' : 'border border-[var(--ah-line)]'}`}
                        onClick={() => set('page', String(n))}
                      >
                        {n}
                      </button>
                    );
                  });
                  return nodes;
                })()}
              </div>
            </>
          )}
        </div>
      </div>

      {open && createPortal(
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label={t('menuClose')} onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-auto rounded-t-3xl bg-[var(--ah-surface)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--ah-line)]" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{t('filters')}</h2>
              <IconButton icon={X} label={t('menuClose')} size="md" onClick={() => setOpen(false)} />
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
