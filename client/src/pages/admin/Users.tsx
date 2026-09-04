import { useEffect, useState } from 'react';
import { Seo } from '../../components/Seo';
import { api } from '../../services/api';
import type { User } from '../../types';
import { useToast } from '../../context/ToastContext';
import { timeAgo } from '../../utils/format';

export default function AdminUsers() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<{ user: User; listings: unknown[] } | null>(null);
  const { push } = useToast();

  const load = () => api.get(`/admin/users?q=${encodeURIComponent(q)}`).then((r) => setUsers(r.data.data || []));
  useEffect(() => { load().catch(() => {}); }, []);

  const act = async (path: string, method: 'post' | 'delete' = 'post') => {
    try {
      await api[method](path);
      push('Updated', 'success');
      load();
      setSelected(null);
    } catch (e: unknown) {
      push((e as { displayMessage?: string }).displayMessage || 'Please try again', 'error');
    }
  };

  return (
    <div>
      <Seo title="Admin Users — BENZ" />
      <h1 className="font-display text-3xl">User Management</h1>
      <div className="mt-4 flex gap-2">
        <input className="input max-w-sm" placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="btn-gold" onClick={() => load()}>Search</button>
      </div>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase text-[var(--ah-muted)]">
            <tr><th className="p-3">User</th><th>Role</th><th>Status</th><th>Last login</th><th>Joined</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-[var(--ah-line)]">
                <td className="p-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-[var(--ah-muted)]">{u.email}</p>
                </td>
                <td>{u.role}</td>
                <td>{u.is_blocked ? 'Blocked' : 'Active'}</td>
                <td>{u.last_login_at ? timeAgo(u.last_login_at) : '—'}</td>
                <td>{u.created_at ? timeAgo(u.created_at) : '—'}</td>
                <td className="space-x-1 p-3 text-right">
                  <button type="button" className="btn-ghost !py-1 !text-xs" onClick={() => api.get(`/admin/users/${u.id}`).then((r) => setSelected(r.data.data))}>View</button>
                  {u.is_blocked
                    ? <button type="button" className="btn-ghost !py-1 !text-xs" onClick={() => act(`/admin/users/${u.id}/unblock`)}>Unblock</button>
                    : <button type="button" className="btn-ghost !py-1 !text-xs" onClick={() => act(`/admin/users/${u.id}/block`)}>Block</button>}
                  <button type="button" className="btn-ghost !py-1 !text-xs text-red-500" onClick={() => act(`/admin/users/${u.id}`, 'delete')}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="card mt-4 p-5">
          <h2 className="font-semibold">Profile · {selected.user.name}</h2>
          <p className="text-sm text-[var(--ah-muted)]">{selected.user.email} · {selected.user.phone} · {selected.user.role}</p>
          <p className="mt-2 text-sm">Listings: {(selected.listings as unknown[]).length}</p>
          <button type="button" className="btn-ghost mt-3" onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
