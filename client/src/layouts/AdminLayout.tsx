import { NavLink } from 'react-router-dom';
import { BarChart3, Car, LayoutDashboard, Users } from 'lucide-react';
import { Header, MobileNav } from '../components/Header';
import { RouteShell } from '../components/RouteShell';
import { cn } from '../utils/format';

const items = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/cars', icon: Car, label: 'Listings' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Header />
      <div className="container-ah flex flex-1 flex-col gap-6 py-8 lg:flex-row">
        <aside className="card h-fit w-full p-3 lg:w-56">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gold-600">Admin</p>
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                cn('flex items-center gap-2 rounded-xl px-3 py-2 text-sm', isActive && 'bg-gold-500/15 text-gold-600')
              }
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </NavLink>
          ))}
        </aside>
        <div className="min-w-0 flex-1">
          <RouteShell />
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
