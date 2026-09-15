import { NavLink } from 'react-router-dom';
import { BarChart3, Car, LayoutDashboard, Users } from '../components/icons';
import { Icon } from '../components/icons/Icon';
import { Header, MobileNav } from '../components/Header';
import { RouteShell } from '../components/RouteShell';
import { cn } from '../utils/format';

const items = [
  { to: '/admin', icon: LayoutDashboard, label: 'Шарҳи умумӣ', end: true },
  { to: '/admin/users', icon: Users, label: 'Корбарон' },
  { to: '/admin/cars', icon: Car, label: 'Эълонҳо' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Таҳлил' },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Header />
      <div className="container-ah flex flex-1 flex-col gap-6 py-8 lg:flex-row">
        <aside className="card h-fit w-full p-3 lg:w-56">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gold-600">Админ</p>
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition',
                  isActive ? 'bg-gold-500/15 text-gold-600' : 'text-[var(--ah-muted)] hover:bg-[var(--ah-muted)]/10 hover:text-[var(--ah-text)]'
                )
              }
            >
              <Icon icon={it.icon} size="sm" decorative />
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
