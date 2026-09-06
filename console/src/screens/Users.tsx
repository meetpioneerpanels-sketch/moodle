import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { EmptyState, RoleChip, SkeletonList } from '../components/ui';
import { formatDate, initialsOf } from '../lib/format';
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Users</h1>
        <p className="mt-1 font-bold text-wolf">
          {isAdmin
            ? 'Admins can change any role. Changes apply immediately.'
            : 'Only admins can change roles.'}
        </p>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-wolf" />
        <input
          className="input pl-12"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search users"
        />
      </div>

      {loading ? (
        <SkeletonList rows={5} height="h-16" />
      ) : visible.length === 0 ? (
        <EmptyState emoji="🧑‍🎓" title="No users match that search." />
      ) : (
        <>
          {/* Table on desktop */}
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-left">
              <thead className="bg-swan/30">
                <tr className="text-xs font-extrabold uppercase tracking-wide text-wolf">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id} className="border-t-2 border-swan">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-macaw/15 text-xs font-extrabold text-macaw-dark">
                          {initialsOf(item.name)}
                        </span>
                        <span className="font-extrabold">{item.name}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-wolf">{item.email}</td>
                    <td className="px-5 py-3">
                      {isAdmin ? (
                        <select
                          className="rounded-xl border-2 border-swan bg-white px-3 py-1.5 text-sm font-extrabold capitalize focus:border-macaw focus:outline-none"
                          value={item.role}
                          aria-label={`Role for ${item.name}`}
                          onChange={async (event) => {
                            await setUserRole(item.id, event.target.value as Role);
                            toast(`${item.name} is now a ${event.target.value}`);
                          }}
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <RoleChip role={item.role} />
                      )}
                    </td>
                    <td className="px-5 py-3 font-bold text-wolf">{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards on mobile */}
          <ul className="space-y-3 md:hidden">
            {visible.map((item) => (
              <li key={item.id} className="card flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-macaw/15 text-sm font-extrabold text-macaw-dark">
                  {initialsOf(item.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold">{item.name}</p>
                  <p className="truncate text-sm font-bold text-wolf">{item.email}</p>
                  <p className="text-xs font-bold text-wolf">
                    Joined {formatDate(item.createdAt)}
                  </p>
                </div>
                {isAdmin ? (
                  <select
                    className="rounded-xl border-2 border-swan bg-white px-2 py-1.5 text-xs font-extrabold capitalize focus:border-macaw focus:outline-none"
                    value={item.role}
                    aria-label={`Role for ${item.name}`}
                    onChange={async (event) => {
                      await setUserRole(item.id, event.target.value as Role);
                      toast(`${item.name} is now a ${event.target.value}`);
                    }}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                ) : (
                  <RoleChip role={item.role} />
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
