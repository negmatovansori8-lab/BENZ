import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Seo } from '../components/Seo';
import { PropertyCard } from '../components/PropertyCard';
import { EmptyState } from '../components/EmptyState';
import { api } from '../services/api';
import type { Property } from '../types';
import { useI18n } from '../context/LocaleContext';

const KINDS = ['', 'apartment', 'house', 'land', 'commerce'] as const;

export default function Homes() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const kind = params.get('kind') || '';

  useEffect(() => {
    setLoading(true);
    const q = kind ? `?kind=${kind}` : '';
    api.get(`/homes${q}`).then((r) => setItems(r.data.data || [])).catch(() => setItems([])).finally(() => setLoading(false));
  }, [kind]);

  return (
    <div className="container-ah py-10">
      <Seo title={`${t('homesTitle')} — BENZ`} />
      <h1 className="font-display text-3xl">{t('homesTitle')}</h1>
      <p className="mt-1 text-sm text-[var(--ah-muted)]">{t('homesText')}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k || 'all'}
            type="button"
            className={`chip ${kind === k ? 'bg-gold-500 text-zinc-950' : ''}`}
            onClick={() => {
              const next = new URLSearchParams(params);
              if (k) next.set('kind', k); else next.delete('kind');
              setParams(next);
            }}
          >
            {k ? t(k === 'apartment' ? 'apartment' : k === 'house' ? 'house' : k === 'land' ? 'land' : 'commerce') : t('viewAll')}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading && Array.from({ length: 4 }).map((_, i) => <div key={i} className="card skeleton h-64" />)}
        {!loading && items.map((p) => <PropertyCard key={p.id} item={p} />)}
      </div>
      {!loading && !items.length && (
        <div className="mt-6"><EmptyState icon={Home} title={t('noHomes')} text={t('trySearch')} /></div>
      )}
    </div>
  );
}
