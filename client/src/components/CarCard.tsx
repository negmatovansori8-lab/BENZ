import { Heart, Scale } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Car } from '../types';
import { cn, coverImage, formatNumber, formatPrice } from '../utils/format';
import { useCurrency } from '../context/CurrencyContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/LocaleContext';
import { api } from '../services/api';
import { useState } from 'react';
import { SafeImg } from './SafeImg';
import { IconFuel, IconGear, IconOdo, IconPin, IconTile } from './SpecIcons';
import { fuelMsg, transMsg } from '../utils/vehicle';

export function CarCard({ car, onFavorite }: { car: Car; onFavorite?: (id: number, next: boolean) => void }) {
  const { currency, rates } = useCurrency();
  const { add, has, remove } = useCompare();
  const { user } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const navigate = useNavigate();
  const [fav, setFav] = useState(!!car.is_favorite);
  const cover = coverImage(car.images, car.id);

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login');
    try {
      if (fav) {
        await api.delete(`/favorites/${car.id}`);
        setFav(false);
        onFavorite?.(car.id, false);
      } else {
        await api.post('/favorites', { car_id: car.id });
        setFav(true);
        onFavorite?.(car.id, true);
        push('Added to favorites', 'success');
      }
    } catch (err: unknown) {
      push((err as { displayMessage?: string }).displayMessage || 'Something went wrong', 'error');
    }
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (has(car.id)) {
      remove(car.id);
      return;
    }
    const ok = add(car);
    if (!ok) push('You can compare up to 4 cars', 'info');
    else push('Added to compare', 'success');
  };

  const facts = [
    { icon: <IconOdo />, text: `${formatNumber(car.mileage)} ${t('kmUnit')}` },
    { icon: <IconFuel />, text: t(fuelMsg(car.fuel)) },
    { icon: <IconGear />, text: t(transMsg(car.transmission)) },
  ];

  return (
    <article className={cn('card card-lift group relative flex flex-col', car.is_featured && 'ring-2 ring-gold-500/70')}>
      <div className="absolute right-3 top-3 z-10 flex gap-1">
        <button type="button" onClick={toggleFav} className="rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70" aria-label={t('favoriteBtn')}>
          <Heart className={cn('h-4 w-4', fav && 'fill-red-500 text-red-500')} />
        </button>
        <button type="button" onClick={toggleCompare} className="rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70" aria-label={t('compareBtn')}>
          <Scale className={cn('h-4 w-4', has(car.id) && 'text-gold-400')} />
        </button>
      </div>

      <Link viewTransition to={`/cars/${car.id}`} className="flex flex-1 flex-col">
        <div className="relative block overflow-hidden bg-zinc-900">
          <SafeImg
            src={cover}
            seed={car.id}
            alt={`${car.brand} ${car.model}`}
            className="img-zoom h-48 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute left-3 top-3 flex gap-1">
            {car.is_featured && <span className="chip bg-gold-500 text-[10px] text-zinc-950">{t('badgeFeatured')}</span>}
            {car.status === 'SOLD' && <span className="chip bg-zinc-950 text-[10px] text-white">{t('badgeSold')}</span>}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="font-display text-xl leading-none text-gold-600 dark:text-gold-400">
            {formatPrice(car.price_usd, currency, rates)}
          </p>
          <h3 className="mt-2 font-semibold leading-tight">
            {car.brand} {car.model}
          </h3>
          <p className="mt-0.5 text-xs text-[var(--ah-muted)]">{car.year}</p>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
            {facts.map((f) => (
              <span key={f.text} className="inline-flex items-center gap-1.5 text-xs font-medium">
                <IconTile>{f.icon}</IconTile>
                {f.text}
              </span>
            ))}
          </div>
          <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-[var(--ah-muted)]">
            <IconPin className="h-3.5 w-3.5" />
            {car.city || car.location || '—'}
          </p>
        </div>
      </Link>
    </article>
  );
}

export function CarCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-48 w-full" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-10 w-full rounded" />
      </div>
    </div>
  );
}
