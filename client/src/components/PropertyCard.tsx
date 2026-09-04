import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { Property } from '../types';
import { formatPrice } from '../utils/format';
import { useCurrency } from '../context/CurrencyContext';
import { useI18n } from '../context/LocaleContext';
import { SafeImg } from './SafeImg';
import type { Msg } from '../i18n/dict';

const KIND_KEY: Record<string, Msg> = {
  apartment: 'apartment',
  house: 'house',
  land: 'land',
  commerce: 'commerce',
};

export function PropertyCard({ item }: { item: Property }) {
  const { currency, rates } = useCurrency();
  const { t } = useI18n();
  const cover = item.images?.[0]?.url || `/homes/${((item.id - 1) % 3) + 1}.jpg`;
  const kind = KIND_KEY[item.kind] || 'apartment';

  return (
    <article className="card group flex flex-col">
      <Link to={`/homes/${item.id}`} className="relative block overflow-hidden bg-zinc-900">
        <SafeImg src={cover} seed={item.id} alt={item.title} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
        {item.is_featured && (
          <span className="absolute left-3 top-3 chip bg-gold-500 text-[10px] text-zinc-950">{t('curated')}</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] uppercase tracking-wider text-gold-600">{t(kind)}</p>
        <h3 className="mt-1 font-semibold leading-tight">{item.title}</h3>
        <p className="mt-2 font-display text-lg text-gold-600">{formatPrice(item.price_usd, currency, rates)}</p>
        <p className="mt-2 text-xs text-[var(--ah-muted)]">
          {item.kind !== 'land' && item.rooms > 0 ? `${item.rooms} ${t('rooms')} · ` : ''}
          {item.area_m2 ? `${item.area_m2} ${t('area')}` : ''}
        </p>
        <p className="mt-auto flex items-center gap-1 pt-3 text-xs text-[var(--ah-muted)]">
          <MapPin className="h-3.5 w-3.5" />
          {item.location || '—'}
        </p>
      </div>
    </article>
  );
}
