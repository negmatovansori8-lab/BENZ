import { FormEvent, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ImagePlus, Phone, X } from 'lucide-react';
import { Seo } from '../components/Seo';
import { api } from '../services/api';
import type { Brand, Location } from '../types';
import { BODIES, FUELS, TRANSMISSIONS, VEHICLE_CATEGORIES } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { useI18n } from '../context/LocaleContext';
import { cn, formatPrice } from '../utils/format';
import { bodyMsg, categoryMsg, fuelMsg, transMsg } from '../utils/vehicle';
import {
  IconBody, IconCalendar, IconEngine, IconFuel, IconGear, IconOdo,
  IconPalette, IconPin, IconPower, IconVin,
} from '../components/SpecIcons';
import { CatSedan } from '../components/CategoryIcons';
import { ColorSelect } from '../components/ColorSelect';

const empty = {
  brand_id: '', model_id: '', year: '2020', price_usd: '', mileage: '', engine: '', power: '',
  fuel: 'Petrol', transmission: 'Automatic', body: 'Sedan', color: '', vin: '',
  location_id: '', description: '', phone: '', category: 'passenger',
};

export default function Sell() {
  const { user } = useAuth();
  const { push } = useToast();
  const { t } = useI18n();
  const { currency, rates } = useCurrency();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/meta/brands').then((r) => setBrands(r.data.data || []));
    api.get('/meta/locations').then((r) => setLocations(r.data.data || []));
    if (editId) {
      api.get(`/cars/${editId}`).then((r) => {
        const c = r.data.data;
        setForm({
          brand_id: String(c.brand_id),
          model_id: String(c.model_id),
          year: String(c.year),
          price_usd: String(c.price_usd),
          mileage: String(c.mileage),
          engine: c.engine || '',
          power: c.power ? String(c.power) : '',
          fuel: c.fuel,
          transmission: c.transmission,
          body: c.body,
          color: c.color || '',
          vin: c.vin || '',
          location_id: c.location_id ? String(c.location_id) : '',
          description: c.description || '',
          phone: c.phone || '',
          category: c.category || 'passenger',
        });
        setPreviews((c.images || []).map((i: { url: string }) => i.url));
      }).catch(() => {});
    }
  }, [editId]);

  const models = brands.find((b) => String(b.id) === form.brand_id)?.models || [];
  const brandName = brands.find((b) => String(b.id) === form.brand_id)?.name;
  const modelName = models.find((m) => String(m.id) === form.model_id)?.name;
  const loc = locations.find((l) => String(l.id) === form.location_id);

  const onFiles = (list: FileList | null) => {
    const next = Array.from(list || []).slice(0, 8);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const removePreview = (i: number) => {
    setPreviews((p) => p.filter((_, idx) => idx !== i));
    setFiles((p) => p.filter((_, idx) => idx !== i));
  };

  const publish = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('images', f));
      if (editId) {
        await api.put(`/cars/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        push('Listing updated', 'success');
      } else {
        await api.post('/cars', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        push('Listing submitted for review', 'success');
      }
      navigate('/dashboard');
    } catch (e: unknown) {
      push((e as { displayMessage?: string }).displayMessage || 'Please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { from: '/sell' } });
    setStep('preview');
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="container-ah max-w-4xl py-10">
      <Seo title={`${editId ? t('sellEditTitle') : t('sellTitle')} — BENZ`} />

      <div className="gtr-shell rounded-[1.75rem] border border-white/10">
        <div className="gtr-stripe" />
        <div className="gtr-carbon p-6 sm:p-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.35em] text-gold-400">
                BENZ · {t('sellBadge')}
              </p>
              <h1 className="font-display text-4xl tracking-wide text-white">
                {editId ? t('sellEditTitle') : t('sellTitle')}
              </h1>
              <p className="mt-2 max-w-lg text-sm text-white/55">{t('sellSubtitle')}</p>
            </div>
            <CatSedan className="hidden h-14 w-14 text-gold-500/70 sm:block" />
          </div>

          {step === 'form' ? (
            <form onSubmit={onSubmit} className="space-y-7">
              <Section n="01" title={t('sellStepCar')}>
                <Field label={t('brand')} icon={<CatSedan className="h-3.5 w-3.5" />}>
                  <ColorSelect
                    required
                    value={form.brand_id}
                    placeholder={t('sellSelect')}
                    onChange={(v) => setForm({ ...form, brand_id: v, model_id: '' })}
                    options={brands.map((b) => ({ value: String(b.id), label: b.name }))}
                  />
                </Field>
                <Field label={t('model')} icon={<CatSedan className="h-3.5 w-3.5" />}>
                  <ColorSelect
                    required
                    disabled={!form.brand_id}
                    value={form.model_id}
                    placeholder={t('sellSelect')}
                    onChange={(v) => set('model_id', v)}
                    options={models.map((m) => ({ value: String(m.id), label: m.name }))}
                  />
                </Field>
                <Field label={t('year')} icon={<IconCalendar className="h-3.5 w-3.5" />}>
                  <input required className="input" type="number" min={1950} max={2100} value={form.year} onChange={(e) => set('year', e.target.value)} />
                </Field>
                <Field label={t('sellPriceUsd')} icon={<span className="text-[10px] font-bold">$</span>}>
                  <input required className="input" type="number" min={0} value={form.price_usd} onChange={(e) => set('price_usd', e.target.value)} />
                </Field>
                <Field label={t('category')} icon={<IconBody className="h-3.5 w-3.5" />}>
                  <ColorSelect
                    value={form.category}
                    placeholder={t('sellSelect')}
                    onChange={(v) => set('category', v)}
                    options={VEHICLE_CATEGORIES.map((c) => ({ value: c, label: t(categoryMsg(c)) }))}
                  />
                </Field>
                <Field label={t('location')} icon={<IconPin className="h-3.5 w-3.5" />}>
                  <ColorSelect
                    value={form.location_id}
                    placeholder={t('sellSelect')}
                    onChange={(v) => set('location_id', v)}
                    options={locations.map((l) => ({ value: String(l.id), label: `${l.city}, ${l.country}` }))}
                  />
                </Field>
              </Section>

              <Section n="02" title={t('sellStepSpecs')}>
                <Field label={t('mileage')} icon={<IconOdo className="h-3.5 w-3.5" />}>
                  <input required className="input" type="number" min={0} value={form.mileage} onChange={(e) => set('mileage', e.target.value)} />
                </Field>
                <Field label={t('specEngine')} icon={<IconEngine className="h-3.5 w-3.5" />}>
                  <input className="input" value={form.engine} onChange={(e) => set('engine', e.target.value)} placeholder={t('sellEnginePh')} />
                </Field>
                <Field label={`${t('specPower')} (${t('hp')})`} icon={<IconPower className="h-3.5 w-3.5" />}>
                  <input className="input" type="number" value={form.power} onChange={(e) => set('power', e.target.value)} />
                </Field>
                <Field label={t('fuel')} icon={<IconFuel className="h-3.5 w-3.5" />}>
                  <ColorSelect
                    value={form.fuel}
                    placeholder={t('sellSelect')}
                    onChange={(v) => set('fuel', v)}
                    options={FUELS.map((f) => ({ value: f, label: t(fuelMsg(f)) }))}
                  />
                </Field>
                <Field label={t('transmission')} icon={<IconGear className="h-3.5 w-3.5" />}>
                  <ColorSelect
                    value={form.transmission}
                    placeholder={t('sellSelect')}
                    onChange={(v) => set('transmission', v)}
                    options={TRANSMISSIONS.map((f) => ({ value: f, label: t(transMsg(f)) }))}
                  />
                </Field>
                <Field label={t('body')} icon={<IconBody className="h-3.5 w-3.5" />}>
                  <ColorSelect
                    value={form.body}
                    placeholder={t('sellSelect')}
                    onChange={(v) => set('body', v)}
                    options={BODIES.map((f) => ({ value: f, label: t(bodyMsg(f)) }))}
                  />
                </Field>
                <Field label={t('specColor')} icon={<IconPalette className="h-3.5 w-3.5" />}>
                  <input className="input" value={form.color} onChange={(e) => set('color', e.target.value)} />
                </Field>
                <Field label={t('specVin')} icon={<IconVin className="h-3.5 w-3.5" />}>
                  <input className="input" value={form.vin} onChange={(e) => set('vin', e.target.value)} />
                </Field>
              </Section>

              <Section n="03" title={t('sellStepContact')} cols={1}>
                <Field label={t('phone')} icon={<Phone className="h-3.5 w-3.5" />}>
                  <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder={user?.phone || ''} />
                </Field>
                <label className="block">
                  <span className="label">{t('descriptionTitle')}</span>
                  <textarea className="input min-h-[130px]" value={form.description} onChange={(e) => set('description', e.target.value)} />
                </label>
              </Section>

              <Section n="04" title={t('sellStepPhotos')} cols={1}>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onFiles(e.target.files)}
                />
                <div
                  role="button"
                  tabIndex={0}
                  className={cn('gtr-drop flex flex-col items-center justify-center rounded-2xl px-4 py-10 text-center', drag && 'is-drag')}
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter') fileRef.current?.click(); }}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
                >
                  <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gold-500/15 text-gold-400">
                    <ImagePlus className="h-6 w-6" />
                  </span>
                  <p className="font-semibold text-white">{t('sellDropTitle')}</p>
                  <p className="mt-1 text-xs text-white/50">{t('sellDropHint')}</p>
                </div>
                {previews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {previews.map((src, i) => (
                      <div key={src} className="group relative overflow-hidden rounded-xl">
                        <img src={src} alt="" className="h-28 w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                          onClick={() => removePreview(i)}
                          aria-label={t('sellRemove')}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <button type="submit" className="btn-gold w-full !rounded-2xl !py-3.5 text-base shadow-glow">
                {t('sellPreviewBtn')}
              </button>
            </form>
          ) : (
            <div>
              <h2 className="font-display text-2xl text-white">{t('sellPreviewTitle')}</h2>
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <div className="flex gap-2 overflow-auto">
                  {previews.length
                    ? previews.map((src) => <img key={src} src={src} alt="" className="h-44 w-60 rounded-2xl object-cover" />)
                    : <div className="skeleton h-44 w-full rounded-2xl" />}
                </div>
                <div>
                  <p className="font-display text-3xl text-white">{brandName} {modelName}</p>
                  <p className="mt-1 text-white/55">{form.year} · {t(bodyMsg(form.body))} · {loc ? `${loc.city}, ${loc.country}` : ''}</p>
                  <p className="mt-3 font-display text-3xl text-gold-400">{formatPrice(form.price_usd || 0, currency, rates)}</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">{form.description || t('noDescription')}</p>
                </div>
              </div>
              <div className="mt-7 flex gap-3">
                <button type="button" className="btn-ghost !border-white/15 !text-white" onClick={() => setStep('form')}>{t('sellEditBtn')}</button>
                <button type="button" className="btn-gold flex-1 !rounded-2xl" disabled={loading} onClick={publish}>
                  {loading ? t('sellSaving') : editId ? t('sellSaveChanges') : t('sellPublish')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ n, title, children, cols = 2 }: { n: string; title: string; children: ReactNode; cols?: 1 | 2 }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-display text-sm tracking-[0.2em] text-gold-500">{n}</span>
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80">{title}</h2>
        <span className="h-px flex-1 bg-gradient-to-r from-gold-500/40 to-transparent" />
      </div>
      <div className={cn('grid gap-4', cols === 2 && 'sm:grid-cols-2')}>{children}</div>
    </section>
  );
}

function Field({ label, icon, children }: { label: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <span className="label inline-flex items-center gap-1.5">
        <span className="text-gold-500">{icon}</span>
        {label}
      </span>
      {children}
    </div>
  );
}
