import { useMemo, useState } from 'react';
import { Search, Users as UsersIcon } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Avatar, EmptyState, RoleChip, SkeletonList } from '../components/ui';
import { formatDate } from '../lib/format';
import type { Role } from '../types';

const ROLES: Role[] = ['admin', 'teacher', 'student'];

export default function Users() {
  const { user } = useAuth();
  const { users, loading, setUserRole } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const isAdmin = user?.role === 'admin';

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...users]
      .filter(
        (item) =>
          !term ||
          item.name.toLowerCase().includes(term) ||
          item.email.toLowerCase().includes(term),
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [users, search]);

  const roleSelect = (id: string, name: string, role: Role) => (
    <select
      className="rounded-md border border-line bg-surface px-2 py-1 text-[13px] capitalize text-fg transition-colors hover:bg-surface-3 focus:border-brand focus:outline-none"
      value={role}
      aria-label={`Role for ${name}`}
      onChange={async (event) => {
        await setUserRole(id, event.target.value as Role);
        toast(`${name} is now a ${event.target.value}`);
      }}
    >
      {ROLES.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-[-0.015em]">Users</h1>
        <p className="mt-1 text-[13px] text-muted">
          {isAdmin
            ? 'Role changes apply immediately, everywhere.'
            : 'Only admins can change roles.'}
        </p>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input
          className="input pl-9"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search users"
        />
      </div>

      {loading ? (
        <SkeletonList rows={5} height="h-14" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-4 w-4" />}
          title="No users match"
          description="Try a different name or email."
        />
      ) : (
        <>
          {/* Table on desktop */}
          <div className="hidden overflow-hidden rounded-xl border border-line md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-surface-2 text-[13px] font-medium text-subtle">
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((item) => (
                  <tr key={item.id} className="bg-surface transition-colors hover:bg-surface-2">
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2.5">
                        <Avatar name={item.name} size="sm" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-muted">{item.email}</td>
                    <td className="px-4 py-2.5">
                      {isAdmin ? (
                        roleSelect(item.id, item.name, item.role)
                      ) : (
                        <RoleChip role={item.role} />
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-subtle">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards on mobile */}
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line md:hidden">
            {visible.map((item) => (
              <li key={item.id} className="flex items-center gap-3 bg-surface px-4 py-3">
                <Avatar name={item.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="truncate text-[13px] text-subtle">{item.email}</p>
                </div>
                {isAdmin ? roleSelect(item.id, item.name, item.role) : <RoleChip role={item.role} />}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
