import { useEffect, useMemo, useState } from 'react';
import { Seo } from '../../components/Seo';
import { api } from '../../services/api';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

interface Point {
  bucket: string;
  count?: number;
  gmv?: number;
  revenue?: number;
  pct?: number;
  name?: string;
}

interface Analytics {
  sales: Point[];
  brands: { name: string; views: number; listings: number; favorites: number; pct: number }[];
  users: Point[];
  revenue: Point[];
}

function formatBucket(iso: string, period: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (period === 'yearly') {
    return String(d.getFullYear());
  }
  if (period === 'monthly') {
    return d.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
  }
  if (period === 'weekly') {
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: '2-digit' });
  }
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function pctLabel(pct?: number) {
  if (pct == null || Number.isNaN(pct)) return '—';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct}%`;
}

function pctClass(pct?: number) {
  if (pct == null || pct === 0) return 'text-[var(--ah-muted)]';
  return pct > 0 ? 'text-emerald-400' : 'text-red-400';
}

function summary(points: Point[], key: 'gmv' | 'revenue' | 'count') {
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const value = Number(last?.[key] || 0);
  const before = Number(prev?.[key] || 0);
  const pct = before === 0 ? (value > 0 ? 100 : 0) : Math.round(((value - before) / before) * 1000) / 10;
  return { value, pct };
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    api.get(`/admin/analytics?period=${period}`).then((r) => setData(r.data.data)).catch(() => {});
  }, [period]);

  const sales = useMemo(
    () => (data?.sales || []).map((s) => ({ ...s, name: formatBucket(s.bucket, period) })),
    [data?.sales, period]
  );
  const revenue = useMemo(
    () => (data?.revenue || []).map((s) => ({ ...s, name: formatBucket(s.bucket, period) })),
    [data?.revenue, period]
  );
  const users = useMemo(
    () => (data?.users || []).map((s) => ({ ...s, name: formatBucket(s.bucket, period) })),
    [data?.users, period]
  );

  const salesSum = summary(sales, 'gmv');
  const revenueSum = summary(revenue, 'revenue');
  const usersSum = summary(users, 'count');

  return (
    <div>
      <Seo title="Admin Analytics — BENZ" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl">Таҳлил</h1>
        <div className="flex gap-2">
          {([
            { id: 'daily', label: 'Рӯз' },
            { id: 'weekly', label: 'Ҳафта' },
            { id: 'monthly', label: 'Моҳ' },
            { id: 'yearly', label: 'Сол' },
          ] as const).map((p) => (
            <button key={p.id} type="button" className={`chip ${period === p.id ? 'bg-gold-500 text-zinc-950' : ''}`} onClick={() => setPeriod(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wider text-[var(--ah-muted)]">Фурӯш (охирин)</p>
          <p className="mt-1 font-display text-2xl">{Math.round(salesSum.value).toLocaleString('ru-RU')}</p>
          <p className={`mt-1 text-sm font-semibold ${pctClass(salesSum.pct)}`}>{pctLabel(salesSum.pct)} нисбат ба қаблӣ</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wider text-[var(--ah-muted)]">Даромад (охирин)</p>
          <p className="mt-1 font-display text-2xl">{Math.round(revenueSum.value).toLocaleString('ru-RU')}</p>
          <p className={`mt-1 text-sm font-semibold ${pctClass(revenueSum.pct)}`}>{pctLabel(revenueSum.pct)} нисбат ба қаблӣ</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wider text-[var(--ah-muted)]">Корбарони нав</p>
          <p className="mt-1 font-display text-2xl">{Math.round(usersSum.value).toLocaleString('ru-RU')}</p>
          <p className={`mt-1 text-sm font-semibold ${pctClass(usersSum.pct)}`}>{pctLabel(usersSum.pct)} нисбат ба қаблӣ</p>
        </div>
      </div>

      <section className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Фурӯш</h2>
          <span className={`text-sm font-semibold ${pctClass(sales[sales.length - 1]?.pct)}`}>
            {pctLabel(sales[sales.length - 1]?.pct)}
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" fontSize={11} interval="preserveStartEnd" minTickGap={28} />
              <YAxis fontSize={12} />
              <Tooltip
                formatter={(value: number, key: string) => [
                  Number(value).toLocaleString('ru-RU'),
                  key === 'gmv' ? 'Фурӯш' : key === 'pct' ? 'Фоиз' : key,
                ]}
                labelFormatter={(label) => String(label)}
              />
              <Area type="monotone" dataKey="gmv" stroke="#c9a227" fill="#c9a22733" name="Фурӯш" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Даромад</h2>
          <span className={`text-sm font-semibold ${pctClass(revenue[revenue.length - 1]?.pct)}`}>
            {pctLabel(revenue[revenue.length - 1]?.pct)}
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" fontSize={11} interval="preserveStartEnd" minTickGap={28} />
              <YAxis fontSize={12} />
              <Tooltip
                formatter={(value: number) => [Number(value).toLocaleString('ru-RU'), 'Даромад']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#22c55e22" name="Даромад" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Афзоиши корбарон</h2>
          <span className={`text-sm font-semibold ${pctClass(users[users.length - 1]?.pct)}`}>
            {pctLabel(users[users.length - 1]?.pct)}
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={users}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" fontSize={11} interval="preserveStartEnd" minTickGap={28} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value: number) => [Number(value).toLocaleString('ru-RU'), 'Корбарон']} />
              <Bar dataKey="count" fill="#c9a227" radius={6} name="Корбарон" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card mt-6 p-5">
        <h2 className="mb-4 font-semibold">Брендҳои маъмул</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.brands || []} layout="vertical" margin={{ left: 80, right: 48 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={12} />
              <Tooltip
                formatter={(value: number, key: string) => [
                  key === 'pct' ? `${value}%` : Number(value).toLocaleString('ru-RU'),
                  key === 'views' ? 'Дидан' : key === 'pct' ? 'Ҳисса' : key,
                ]}
              />
              <Bar dataKey="views" fill="#c9a227" radius={6} name="Дидан" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.brands || []).slice(0, 6).map((b) => (
            <li key={b.name} className="flex items-center justify-between rounded-xl border border-[var(--ah-line)] px-3 py-2 text-sm">
              <span>{b.name}</span>
              <span className="font-semibold text-gold-500">{b.pct}%</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
