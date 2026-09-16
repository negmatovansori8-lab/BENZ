import { Heart, Scale, Share2 } from './icons';
import { IconButton } from './icons/IconButton';
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
  const power = car.power ? `${car.power} ${t('hp')}` : null;

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
        push(t('addedToFavorites'), 'success');
      }
    } catch {
      push(t('somethingWrong'), 'error');
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
    if (!ok) push(t('compareLimit'), 'info');
    else push(t('addedToCompare'), 'success');
  };

  const share = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/cars/${car.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${car.brand} ${car.model}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        push(t('linkCopied'), 'success');
      }
    } catch {
      /* user cancelled */
    }
  };

  const facts = [
    { icon: <IconOdo />, text: `${formatNumber(car.mileage)} ${t('kmUnit')}` },
    { icon: <IconFuel />, text: t(fuelMsg(car.fuel)) },
    { icon: <IconGear />, text: t(transMsg(car.transmission)) },
  ];

  return (
    <article className="card card-lift group relative flex flex-col">
      <div className="absolute right-3 top-3 z-10 flex gap-1.5">
        <IconButton
          icon={Heart}
          label={t('favoriteBtn')}
          tone="onMedia"
          className={cn(fav && '[&_.ah-icon]:fill-red-500 [&_.ah-icon]:text-red-500')}
          onClick={toggleFav}
        />
        <IconButton
          icon={Share2}
          label={t('shareBtn')}
          tone="onMedia"
          className="hidden sm:inline-flex"
          onClick={share}
        />
        <IconButton
          icon={Scale}
          label={t('compareBtn')}
          tone="onMedia"
          className={cn('hidden sm:inline-flex', has(car.id) && 'text-gold-400')}
          onClick={toggleCompare}
        />
      </div>

      <Link viewTransition to={`/cars/${car.id}`} className="flex flex-1 flex-col">
        <div className="relative block aspect-[4/3] overflow-hidden bg-zinc-900 sm:aspect-[5/4]">
          <SafeImg
            src={cover}
            seed={car.id}
            alt={`${car.brand} ${car.model}`}
            className="img-zoom h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          {car.status === 'SOLD' && (
            <div className="absolute left-3 top-3">
              <span className="chip border-0 bg-zinc-950 text-[10px] text-white">{t('badgeSold')}</span>
            </div>
          )}
          <p className="absolute bottom-3 left-3 font-display text-xl font-bold tracking-tight text-white drop-shadow sm:text-2xl">
            {formatPrice(car.price_usd, currency, rates)}
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
          <div>
            <h3 className="font-display text-[1.05rem] font-semibold leading-tight tracking-tight sm:text-lg">
              {car.brand} {car.model}
            </h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--ah-muted)]">
              {car.year}
              {power ? ` · ${power}` : ''}
              {car.engine ? ` · ${car.engine}` : ''}
            </p>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-2">
            {facts.map((f) => (
              <span key={f.text} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ah-text)]/85">
                <IconTile>{f.icon}</IconTile>
                {f.text}
              </span>
            ))}
          </div>
          <p className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-[var(--ah-muted)]">
            <IconPin className="h-3.5 w-3.5" />
            {car.city || car.location || '—'}
          </p>
          <span className="btn-ghost mt-1 inline-flex w-full justify-center !py-2 text-xs">
            {t('viewDetails')}
          </span>
        </div>
      </Link>
    </article>
  );
}

export function CarCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton aspect-[4/3] w-full sm:aspect-[5/4]" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
