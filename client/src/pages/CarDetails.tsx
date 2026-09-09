import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Mail, Scale, X, ZoomIn } from 'lucide-react';
import { Seo } from '../components/Seo';
import { ErrorState } from '../components/EmptyState';
import { api } from '../services/api';
import type { Car } from '../types';
import { formatNumber, formatPrice, galleryImages, trackViewed, avatarUrl, carImage } from '../utils/format';
import { useCurrency } from '../context/CurrencyContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/LocaleContext';
import { cn } from '../utils/format';
import { SafeImg } from '../components/SafeImg';
import { ContactActions } from '../components/ContactActions';
import {
  IconBody, IconCalendar, IconClock, IconCondition, IconDrive, IconEngine,
  IconEye, IconFuel, IconGear, IconOdo, IconPalette, IconPin, IconPower,
  IconTile, IconVin,
} from '../components/SpecIcons';
import { bodyMsg, categoryMsg, conditionMsg, fuelMsg, inferDrive, powerKw, transMsg } from '../utils/vehicle';
import type { Msg } from '../i18n/dict';

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [error, setError] = useState(false);
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const { currency, rates } = useCurrency();
  const { add, has } = useCompare();
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setError(false);
    setIdx(0);
    api.get(`/cars/${id}`)
      .then((r) => {
        setCar(r.data.data);
        trackViewed(Number(id));
      })
      .catch(() => setError(true));
  }, [id]);

  if (error) return <div className="container-ah py-16"><ErrorState onRetry={() => window.location.reload()} /></div>;
  if (!car) {
    return (
      <div className="container-ah py-16">
        <div className="skeleton h-[420px] w-full rounded-3xl" />
      </div>
    );
  }

  const images = galleryImages(car.images, car.id);
  const current = images[idx] || carImage(null, car.id);
  const drive = inferDrive(car);
  const kw = powerKw(car.power);
  const dateLocale = locale === 'tg' ? 'ru-RU' : locale === 'ru' ? 'ru-RU' : 'en-US';
  const posted = new Date(car.created_at).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });

  const specs: { icon: ReactNode; label: Msg; value: string }[] = [
    { icon: <IconCalendar />, label: 'year', value: String(car.year) },
    { icon: <IconOdo />, label: 'mileage', value: `${formatNumber(car.mileage)} ${t('kmUnit')}` },
    { icon: <IconCondition />, label: 'condition', value: t(conditionMsg(car.mileage)) },
    { icon: <IconEngine />, label: 'specEngine', value: car.engine || '—' },
    { icon: <IconPower />, label: 'specPower', value: car.power ? `${car.power} ${t('hp')}${kw ? ` · ${kw} ${t('kw')}` : ''}` : '—' },
    { icon: <IconFuel />, label: 'fuel', value: t(fuelMsg(car.fuel)) },
    { icon: <IconGear />, label: 'transmission', value: t(transMsg(car.transmission)) },
    { icon: <IconBody />, label: 'body', value: t(bodyMsg(car.body)) },
    ...(drive ? [{ icon: <IconDrive />, label: 'drive' as const, value: t(drive) }] : []),
    { icon: <IconPalette />, label: 'specColor', value: car.color || '—' },
    { icon: <IconVin />, label: 'specVin', value: car.vin || '—' },
    { icon: <IconPin />, label: 'location', value: [car.city, car.country].filter(Boolean).join(', ') || car.location || '—' },
    { icon: <IconEye />, label: 'specViews', value: formatNumber(car.views || 0) },
    { icon: <IconClock />, label: 'specPosted', value: posted },
    ...(car.category ? [{ icon: <IconBody />, label: 'category' as const, value: t(categoryMsg(car.category)) }] : []),
  ];

  const favorite = async () => {
    if (!user) return navigate('/login');
    try {
      if (car.is_favorite) {
        await api.delete(`/favorites/${car.id}`);
        setCar({ ...car, is_favorite: false });
      } else {
        await api.post('/favorites', { car_id: car.id });
        setCar({ ...car, is_favorite: true });
        push('Added to favorites', 'success');
      }
    } catch (e: unknown) {
      push((e as { displayMessage?: string }).displayMessage || 'Please try again', 'error');
    }
  };

  const sendMessage = async () => {
    if (!user) return navigate('/login');
    if (!msg.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post('/messages', { car_id: car.id, content: msg });
      push('Message sent', 'success');
      navigate(`/messages/${data.conversation.id}`);
    } catch (e: unknown) {
      push((e as { displayMessage?: string }).displayMessage || 'Please try again', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-ah py-5 sm:py-8">
      <Seo title={`${car.brand} ${car.model} ${car.year} — BENZ`} description={car.description || undefined} />
      <Link to="/cars" className="mb-5 inline-flex items-center gap-2 text-sm text-[var(--ah-muted)] transition hover:text-gold-600">
        <ArrowLeft className="h-4 w-4" /> {t('back')}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <button type="button" className="relative block w-full overflow-hidden rounded-2xl sm:rounded-3xl" onClick={() => setZoom(true)}>
            <SafeImg
              key={current + idx}
              src={current}
              seed={car.id}
              index={idx}
              alt={`${car.brand} ${car.model}`}
              className="fade-swap h-56 w-full object-cover sm:h-[420px]"
            />
            <span className="absolute bottom-4 right-4 rounded-full bg-black/50 p-2 text-white backdrop-blur"><ZoomIn className="h-4 w-4" /></span>
          </button>
          <div className="mt-3 flex gap-2 overflow-auto">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setIdx(i)}
                className={cn(
                  'h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition duration-300',
                  i === idx ? 'border-gold-500 scale-[1.02]' : 'border-transparent opacity-70 hover:opacity-100'
                )}
              >
                <SafeImg src={src} seed={car.id} index={i} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <aside className="card p-6">
          {car.is_featured && <span className="chip bg-gold-500/15 text-gold-700">{t('badgeFeatured')}</span>}
          <h1 className="font-display mt-2 text-2xl sm:text-3xl">{car.brand} {car.model}</h1>
          <p className="mt-1 text-[var(--ah-muted)]">{car.year} · {t(bodyMsg(car.body))}</p>
          <p className="mt-4 font-display text-3xl text-gold-600 sm:text-4xl">{formatPrice(car.price_usd, currency, rates)}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--ah-muted)]">
            <IconPin className="h-4 w-4" />
            {[car.city, car.country].filter(Boolean).join(', ') || car.location}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button type="button" className="btn-ghost" onClick={favorite}>
              <Heart className={cn('h-4 w-4', car.is_favorite && 'fill-red-500 text-red-500')} /> {t('favoriteBtn')}
            </button>
            <button type="button" className="btn-ghost" onClick={() => { add(car); push('Added to compare', 'success'); }}>
              <Scale className={cn('h-4 w-4', has(car.id) && 'text-gold-500')} /> {t('compareBtn')}
            </button>
            <ContactActions phone={car.phone || car.seller_phone} />
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--ah-line)] p-4">
            <div className="flex items-center gap-3">
              <img src={avatarUrl(car.seller_name, car.seller_avatar)} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold">{car.seller_name}</p>
                <p className="text-xs text-[var(--ah-muted)]">{t('seller')}</p>
              </div>
            </div>
            <textarea className="input mt-3 min-h-[90px]" placeholder={t('writeMessage')} value={msg} onChange={(e) => setMsg(e.target.value)} />
            <button type="button" className="btn-gold mt-2 w-full" disabled={sending} onClick={sendMessage}>
              <Mail className="h-4 w-4" /> {sending ? t('sending') : t('messageSeller')}
            </button>
          </div>
        </aside>
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">{t('specs')}</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {specs.map((s) => (
              <div key={s.label + s.value} className="flex items-center gap-3 rounded-2xl border border-[var(--ah-line)] bg-[var(--ah-bg)]/40 p-3">
                <IconTile size="md">{s.icon}</IconTile>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--ah-muted)]">{t(s.label)}</p>
                  <p className="truncate font-medium">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold">{t('descriptionTitle')}</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ah-muted)]">
            {car.description || t('noDescription')}
          </p>
        </div>
      </section>

      {zoom && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 fade-swap" onClick={() => setZoom(false)}>
          <button type="button" className="absolute right-6 top-6 text-white"><X /></button>
          <img src={current} alt="" className="max-h-[90vh] max-w-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = carImage(null, car.id); }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
