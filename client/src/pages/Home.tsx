import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { Seo } from '../components/Seo';
import { CarCard, CarCardSkeleton } from '../components/CarCard';
import { CategoryGrid } from '../components/CategoryGrid';
import { PropertyCard } from '../components/PropertyCard';
import { api } from '../services/api';
import type { Brand, Car, Location, Property } from '../types';
import { BRANDS } from '../types';
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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState({ brand: '', model: '', minPrice: '', maxPrice: '', year: '', location: '' });
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/cars?featured=true&category=passenger&limit=8'),
      api.get('/cars?category=passenger&sort=newest&limit=8'),
      api.get('/cars?category=passenger&sort=popular&limit=8'),
      api.get('/cars?category=heavy&limit=8'),
      api.get('/cars?category=kamaz&limit=8'),
      api.get('/cars?category=parts&limit=8'),
      api.get('/homes'),
      api.get('/meta/brands'),
      api.get('/meta/locations'),
    ])
      .then(([f, r, p, h, kamazRes, partsRes, homesRes, b, l]) => {
        setFeatured(f.data.data || []);
        setRecent(r.data.data || []);
        setPopular(p.data.data || []);
        setHeavy(h.data.data || []);
        setKamaz(kamazRes.data.data || []);
        setParts(partsRes.data.data || []);
        setHomes((homesRes.data.data || []).slice(0, 4));
        setBrands(b.data.data || []);
        setLocations(l.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (form.brand) q.set('brand', form.brand);
    if (form.model) q.set('model', form.model);
    if (form.minPrice) q.set('minPrice', form.minPrice);
    if (form.maxPrice) q.set('maxPrice', form.maxPrice);
    if (form.year) q.set('yearFrom', form.year);
    if (form.location) q.set('city', form.location);
    navigate(`/cars?${q.toString()}`);
  };

  const models = brands.find((b) => b.name === form.brand)?.models || [];

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

          <form onSubmit={onSearch} className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/10 bg-white/10 p-2 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-7">
            <select className="input !rounded-lg !bg-white/90 !px-2.5 !py-1.5 !text-xs !text-zinc-900" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value, model: '' })}>
              <option value="">{t('brand')}</option>
              {BRANDS.map((b) => <option key={b}>{b}</option>)}
            </select>
            <select className="input !rounded-lg !bg-white/90 !px-2.5 !py-1.5 !text-xs !text-zinc-900" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}>
              <option value="">{t('model')}</option>
              {models.map((m) => <option key={m.id}>{m.name}</option>)}
            </select>
            <input className="input !rounded-lg !bg-white/90 !px-2.5 !py-1.5 !text-xs !text-zinc-900" type="number" placeholder={t('minPrice')} value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })} />
            <input className="input !rounded-lg !bg-white/90 !px-2.5 !py-1.5 !text-xs !text-zinc-900" type="number" placeholder={t('maxPrice')} value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} />
            <input className="input !rounded-lg !bg-white/90 !px-2.5 !py-1.5 !text-xs !text-zinc-900" type="number" placeholder={t('year')} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            <select className="input !rounded-lg !bg-white/90 !px-2.5 !py-1.5 !text-xs !text-zinc-900" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
              <option value="">{t('location')}</option>
              {locations.map((l) => <option key={l.id} value={l.city}>{l.city}</option>)}
            </select>
            <button type="submit" className="btn-gold col-span-2 !rounded-lg !px-3 !py-2 !text-xs sm:col-span-1 lg:col-span-1">
              <Search className="h-3.5 w-3.5" /> {t('searchShort')}
            </button>
          </form>
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
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card skeleton h-64" />)}
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
        {Array.from({ length: 4 }).map((_, i) => (
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
