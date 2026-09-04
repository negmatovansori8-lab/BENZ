import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Seo } from '../components/Seo';
import { api } from '../services/api';
import type { Car } from '../types';
import { CarCard, CarCardSkeleton } from '../components/CarCard';
import { EmptyState } from '../components/EmptyState';

export default function Favorites() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/favorites').then((r) => setCars(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div className="container-ah py-10">
      <Seo title="Favorites — BENZ" />
      <h1 className="font-display text-3xl">Favorites</h1>
      <p className="text-sm text-[var(--ah-muted)]">Cars you saved for later.</p>
      <div className="mt-8">
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <CarCardSkeleton key={i} />)}
          </div>
        )}
        {!loading && !cars.length && (
          <EmptyState icon={Heart} title="No favorites yet" text="Tap the heart on any car to save it here." action={{ to: '/cars', label: 'Browse cars' }} />
        )}
        {!loading && cars.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((c) => (
              <CarCard key={c.id} car={c} onFavorite={(id, next) => { if (!next) setCars((xs) => xs.filter((x) => x.id !== id)); }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
