import { useEffect, useState } from 'react';
import { Seo } from '../../components/Seo';
import { api } from '../../services/api';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

interface Analytics {
  sales: { bucket: string; count: number; gmv: number; revenue: number }[];
  brands: { name: string; views: number; listings: number; favorites: number }[];
  users: { bucket: string; count: number }[];
  revenue: { bucket: string; revenue: number }[];
}

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    api.get(`/admin/analytics?period=${period}`).then((r) => setData(r.data.data)).catch(() => {});
  }, [period]);

  const sales = (data?.sales || []).map((s) => ({ ...s, name: fmt(s.bucket) }));
  const revenue = (data?.revenue || []).map((s) => ({ ...s, name: fmt(s.bucket) }));
  const users = (data?.users || []).map((s) => ({ ...s, name: fmt(s.bucket) }));

  return (
    <div>
      <Seo title="Admin Analytics — BENZ" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl">Analytics</h1>
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
            <button key={p} type="button" className={`chip capitalize ${period === p ? 'bg-gold-500 text-zinc-950' : ''}`} onClick={() => setPeriod(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <section className="card mt-6 p-5">
        <h2 className="mb-4 font-semibold">Sales</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="gmv" stroke="#c9a227" fill="#c9a22733" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card mt-6 p-5">
        <h2 className="mb-4 font-semibold">Revenue</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#22c55e22" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card mt-6 p-5">
        <h2 className="mb-4 font-semibold">User growth</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={users}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#c9a227" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card mt-6 p-5">
        <h2 className="mb-4 font-semibold">Popular Brands</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.brands || []} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={12} />
              <Tooltip />
              <Bar dataKey="views" fill="#c9a227" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
