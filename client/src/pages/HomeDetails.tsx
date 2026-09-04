import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';
import { Seo } from '../components/Seo';
import { ErrorState } from '../components/EmptyState';
import { api } from '../services/api';
import type { Property } from '../types';
import { formatPrice } from '../utils/format';
import { useCurrency } from '../context/CurrencyContext';
import { useI18n } from '../context/LocaleContext';
import { SafeImg } from '../components/SafeImg';
import type { Msg } from '../i18n/dict';

const KIND_KEY: Record<string, Msg> = {
  apartment: 'apartment',
  house: 'house',
  land: 'land',
  commerce: 'commerce',
};

export default function HomeDetails() {
  const { id } = useParams();
  const { t } = useI18n();
  const { currency, rates } = useCurrency();
  const [item, setItem] = useState<Property | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    api.get(`/homes/${id}`).then((r) => setItem(r.data.data)).catch(() => setError(true));
  }, [id]);

  if (error) return <div className="container-ah py-16"><ErrorState onRetry={() => window.location.reload()} /></div>;
  if (!item) return <div className="container-ah py-16"><div className="skeleton h-[380px] w-full rounded-3xl" /></div>;

  const cover = item.images?.[0]?.url || `/homes/${((item.id - 1) % 3) + 1}.jpg`;
  const kind = KIND_KEY[item.kind] || 'apartment';

  return (
    <div className="container-ah py-8">
      <Seo title={`${item.title} — BENZ`} />
      <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <SafeImg src={cover} seed={item.id} alt={item.title} className="h-[420px] w-full rounded-3xl object-cover" />
        <aside className="card p-6">
          <p className="text-xs uppercase tracking-wider text-gold-600">{t(kind)}</p>
          <h1 className="font-display mt-2 text-3xl">{item.title}</h1>
          <p className="mt-4 font-display text-4xl text-gold-600">{formatPrice(item.price_usd, currency, rates)}</p>
          <p className="mt-2 flex items-center gap-1 text-sm text-[var(--ah-muted)]"><MapPin className="h-4 w-4" />{item.location}</p>
          <dl className="mt-6 space-y-2 text-sm">
            {item.rooms > 0 && <div className="flex justify-between"><dt className="text-[var(--ah-muted)]">{t('rooms')}</dt><dd>{item.rooms}</dd></div>}
            {item.area_m2 ? <div className="flex justify-between"><dt className="text-[var(--ah-muted)]">{t('area')}</dt><dd>{item.area_m2}</dd></div> : null}
            {item.floor ? <div className="flex justify-between"><dt className="text-[var(--ah-muted)]">{t('floor')}</dt><dd>{item.floor} / {item.floors || '—'}</dd></div> : null}
          </dl>
          <a className="btn-gold mt-6 w-full" href={`tel:${item.phone || item.seller_phone}`}>
            <Phone className="h-4 w-4" /> {t('contactSeller')}
          </a>
          <p className="mt-4 text-sm text-[var(--ah-muted)]">{item.seller_name}</p>
        </aside>
      </div>
      <section className="card mt-8 p-6">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ah-muted)]">{item.description}</p>
      </section>
    </div>
  );
}
