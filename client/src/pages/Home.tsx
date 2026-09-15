import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Seo } from '../components/Seo';
import { CarCard, CarCardSkeleton } from '../components/CarCard';
import { CategoryGrid } from '../components/CategoryGrid';
import { PropertyCard } from '../components/PropertyCard';
import { api } from '../services/api';
import type { Car, Property } from '../types';
import { useI18n } from '../context/LocaleContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [featured, setFeatured] = useState<Car[]>([]);
  const [recent, setRecent] = useState<Car[]>([]);
  const [popular, setPopular] = useState<Car[]>([]);
  const [heavy, setHeavy] = useState<Car[]>([]);
  const [kamaz, setKamaz] = useState<Car[]>([]);
  const [parts, setParts] = useState<Car[]>([]);
  const [homes, setHomes] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/cars?featured=true&category=passenger&limit=48'),
      api.get('/cars?category=passenger&sort=newest&limit=48'),
      api.get('/cars?category=passenger&sort=popular&limit=48'),
      api.get('/cars?category=heavy&limit=48'),
      api.get('/cars?category=kamaz&limit=48'),
      api.get('/cars?category=parts&limit=48'),
      api.get('/homes?limit=8'),
    ])
      .then(([f, r, p, h, kamazRes, partsRes, homesRes]) => {
        const used = new Set<string>();
        const take = (list: Car[], n = 16) => {
          const out: Car[] = [];
          for (const c of list || []) {
            const key = `${c.brand}|${c.model}|${c.year}|${c.category}`;
            const id = `id:${c.id}`;
            if (used.has(id) || used.has(key)) continue;
            used.add(id);
            used.add(key);
            out.push(c);
            if (out.length >= n) break;
          }
          return out;
        };
        setFeatured(take(f.data.data || []));
        setRecent(take(r.data.data || []));
        setPopular(take(p.data.data || []));
        setHeavy(take(h.data.data || []));
        setKamaz(take(kamazRes.data.data || []));
        setParts(take(partsRes.data.data || []));
        const seenHome = new Set<string>();
        setHomes((homesRes.data.data || []).filter((x: Property) => {
          const key = `${x.kind}|${x.rooms}|${x.area_m2}|${x.location_id ?? x.title}`;
          const id = `id:${x.id}`;
          if (seenHome.has(id) || seenHome.has(key)) return false;
          seenHome.add(id);
          seenHome.add(key);
          return true;
        }).slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Seo title={`BENZ — ${t('heroTitle')}`} description={t('heroSubtitle')} />
      <section
        className="relative min-h-[70vh] overflow-hidden bg-zinc-950 sm:min-h-[88vh]"
      >
        <img
          src="/hero-benz.jpg"
          alt="Mercedes-Benz"
          className="absolute inset-0 h-full w-full object-cover object-center brightness-110 contrast-105 sm:object-right"
          onError={(e) => {
            e.currentTarget.src = '/hero.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/25 sm:bg-gradient-to-r sm:from-black/75 sm:via-black/30 sm:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--ah-bg)] to-transparent" />
        <div className="container-ah relative z-10 flex min-h-[70vh] flex-col justify-end pb-10 pt-20 sm:min-h-[88vh] sm:pb-16 sm:pt-28">
          {user && (
            <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-1.5 text-sm text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {t('hello')}, {user.name} — {t('youAreIn')}
            </p>
          )}
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gold-300">{t('premium')}</p>
          <h1 className="font-display max-w-3xl text-[1.85rem] leading-tight text-white sm:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/75 sm:mt-4 sm:text-lg">{t('heroSubtitle')}</p>
          <Link to="/cars?category=passenger" className="btn-gold mt-6">
            {t('searchCars')}
          </Link>
        </div>
      </section>

      <CategoryGrid />

      <section className="container-ah py-10 sm:py-14">
        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-600">{t('curated')}</p>
            <h2 className="font-display text-2xl sm:text-3xl">{t('featured')}</h2>
          </div>
          <Link to="/cars?featured=true" className="shrink-0 inline-flex items-center gap-1 text-sm text-gold-600">
            {t('viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Grid cars={featured} loading={loading} empty={t('noCars')} />
      </section>

      <section className="container-ah pb-14">
        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-600">{t('catCommercial')}</p>
            <h2 className="font-display text-2xl sm:text-3xl">{t('largeVehicles')}</h2>
            <p className="mt-1 text-sm text-[var(--ah-muted)]">{t('largeVehiclesText')}</p>
          </div>
          <Link to="/cars?category=heavy" className="inline-flex items-center gap-1 text-sm text-gold-600">
            {t('viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Grid cars={heavy} loading={loading} empty={t('noCars')} />
      </section>

      <section className="container-ah pb-14">
        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-600">{t('catKamaz')}</p>
            <h2 className="font-display text-2xl sm:text-3xl">{t('catKamaz')}</h2>
            <p className="mt-1 text-sm text-[var(--ah-muted)]">{t('kamazText')}</p>
          </div>
          <Link to="/cars?category=kamaz" className="inline-flex items-center gap-1 text-sm text-gold-600">
            {t('viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Grid cars={kamaz} loading={loading} empty={t('noCars')} />
      </section>

      <section className="container-ah pb-14">
        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-600">{t('catParts')}</p>
            <h2 className="font-display text-2xl sm:text-3xl">{t('partsTitle')}</h2>
            <p className="mt-1 text-sm text-[var(--ah-muted)]">{t('partsText')}</p>
          </div>
          <Link to="/cars?category=parts" className="inline-flex items-center gap-1 text-sm text-gold-600">
            {t('viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Grid cars={parts} loading={loading} empty={t('noCars')} />
      </section>

      <section className="container-ah pb-14">
        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-600">{t('catHomes')}</p>
            <h2 className="font-display text-2xl sm:text-3xl">{t('homesTitle')}</h2>
            <p className="mt-1 text-sm text-[var(--ah-muted)]">{t('homesText')}</p>
          </div>
          <Link to="/homes" className="inline-flex items-center gap-1 text-sm text-gold-600">
            {t('viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card skeleton h-64" />)}
          </div>
        )}
        {!loading && homes.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {homes.map((p) => <PropertyCard key={p.id} item={p} />)}
          </div>
        )}
        {!loading && !homes.length && <p className="text-sm text-[var(--ah-muted)]">{t('noHomes')}</p>}
      </section>

      <section className="container-ah pb-14">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-600">{t('fresh')}</p>
          <h2 className="font-display text-2xl sm:text-3xl">{t('recentlyAdded')}</h2>
        </div>
        <Grid cars={recent} loading={loading} empty={t('noCars')} />
      </section>

      <section className="container-ah pb-14">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-600">{t('trending')}</p>
          <h2 className="font-display text-2xl sm:text-3xl">{t('popular')}</h2>
        </div>
        <Grid cars={popular} loading={loading} empty={t('noCars')} />
      </section>

      <section className="container-ah pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-5 py-10 text-white sm:px-8 sm:py-14">
          <img
            src="/sell-benz.jpg"
            alt=""
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[58%] object-cover object-center brightness-110 md:block"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/15" />
          <div className="relative max-w-xl">
            <h2 className="font-display text-3xl sm:text-4xl">{t('sellCtaTitle')}</h2>
            <p className="mt-3 text-white/70">{t('sellCtaText')}</p>
            <Link to="/sell" className="btn-gold mt-6">{t('navSell')}</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Grid({ cars, loading, empty }: { cars: Car[]; loading: boolean; empty: string }) {
  if (loading) {
    return (
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-[78%] shrink-0 snap-start sm:w-auto">
            <CarCardSkeleton />
          </div>
        ))}
      </div>
    );
  }
  if (!cars.length) {
    return <p className="text-sm text-[var(--ah-muted)]">{empty}</p>;
  }
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
      {cars.map((c) => (
        <div key={c.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
          <CarCard car={c} />
        </div>
      ))}
    </div>
  );
}
