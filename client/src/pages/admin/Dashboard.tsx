import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { api } from '../../services/api';
import { formatNumber, timeAgo } from '../../utils/format';

interface Stats {
  total_users: number;
  total_sellers: number;
  total_cars: number;
  active_listings: number;
  sold_cars: number;
  total_revenue: number;
  pending: number;
  gmv: number;
  recent_logins?: { id: number; name: string; email: string; role: string; last_login_at: string }[];
}

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data.data)).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Users', v: stats?.total_users },
    { label: 'Total Sellers', v: stats?.total_sellers },
    { label: 'Total Cars', v: stats?.total_cars },
    { label: 'Active Listings', v: stats?.active_listings },
    { label: 'Sold Cars', v: stats?.sold_cars },
    { label: 'Total Revenue', v: stats ? `$${formatNumber(stats.total_revenue)}` : '—' },
  ];

  return (
    <div>
      <Seo title="Admin — BENZ" />
      <h1 className="font-display text-3xl">Admin Dashboard</h1>
      <p className="text-sm text-[var(--ah-muted)]">Marketplace overview</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--ah-muted)]">{c.label}</p>
            <p className="mt-2 font-display text-3xl">{c.v ?? '—'}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Link to="/admin/users" className="btn-ghost">Manage users</Link>
        <Link to="/admin/cars" className="btn-ghost">Review listings</Link>
        <Link to="/admin/analytics" className="btn-gold">Analytics</Link>
      </div>
      {!!stats?.recent_logins?.length && (
        <div className="card mt-8 p-5">
          <h2 className="font-semibold">Recent logins</h2>
          <ul className="mt-3 divide-y divide-[var(--ah-line)] text-sm">
            {stats.recent_logins.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-2">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-[var(--ah-muted)]">{u.email} · {u.role}</p>
                </div>
                <span className="text-xs text-[var(--ah-muted)]">{timeAgo(u.last_login_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
