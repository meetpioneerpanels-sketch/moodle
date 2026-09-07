import { useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Settings as SettingsIcon,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { DataProvider, useData } from './hooks/useData';
import { ToastProvider } from './hooks/useToast';
import { Avatar, LiveDot, ThemeToggle } from './components/ui';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Courses from './screens/Courses';
import CourseEditor from './screens/CourseEditor';
import TestBank from './screens/TestBank';
import Users from './screens/Users';
import Settings from './screens/Settings';
import { isDemoMode } from './firebase';

type Tab = 'dashboard' | 'courses' | 'tests' | 'users' | 'settings';

const TABS: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'tests', label: 'Tests', icon: ClipboardList },
  { id: 'users', label: 'Users', icon: UsersIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (!isDemoMode || dismissed) return null;
  return (
    <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2 text-[13px] text-muted">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
      <p className="min-w-0 flex-1 truncate">
        Demo mode — connect Firebase in{' '}
        <code className="rounded bg-surface-3 px-1 py-0.5 font-mono text-2xs">src/firebase.ts</code>{' '}
        to enable live sync
      </p>
      <button
        type="button"
        aria-label="Dismiss demo banner"
        onClick={() => setDismissed(true)}
        className="rounded p-1 text-subtle transition-colors hover:text-fg"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Shell() {
  const { user, loading } = useAuth();
  const { live } = useData();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);
  const [newCourseOpen, setNewCourseOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex items-center gap-2.5 text-[13px] text-subtle">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-accent" />
          Loading EduHub…
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  function goToTab(next: Tab) {
    setTab(next);
    setOpenCourseId(null);
  }

  const activeLabel = TABS.find((item) => item.id === tab)?.label ?? '';

  return (
    <div className="flex h-[100dvh] flex-col bg-canvas">
      <DemoBanner />

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col gap-1 overflow-y-auto border-r border-line bg-surface-2 px-3 py-4 lg:flex">
          <div className="mb-4 flex items-center gap-2 px-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[13px] font-semibold text-accent-fg">
              E
            </span>
            <span className="text-sm font-semibold">EduHub</span>
            <span className="chip-neutral ml-auto">Console</span>
          </div>

          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => goToTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                tab === id
                  ? 'bg-surface text-fg shadow-xs'
                  : 'text-muted hover:bg-surface-3 hover:text-fg'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}

          <div className="mt-auto flex items-center gap-2.5 rounded-lg px-2.5 py-2">
            <Avatar name={user.name} />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium">{user.name}</span>
              <span className="block text-2xs capitalize text-subtle">{user.role}</span>
            </span>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur lg:px-8">
            <span className="flex items-center gap-2 lg:hidden">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-2xs font-semibold text-accent-fg">
                E
              </span>
              <span className="text-sm font-semibold">EduHub</span>
            </span>
            <span className="hidden text-[13px] font-medium text-muted lg:block">
              {activeLabel}
            </span>
            <span className="ml-auto flex items-center gap-2">
              <LiveDot live={live} />
              <ThemeToggle />
            </span>
          </header>

          <main className="px-4 pb-24 pt-6 lg:px-8 lg:pb-12">
            {tab === 'dashboard' && (
              <Dashboard
                onOpenCourse={(courseId) => {
                  setTab('courses');
                  setOpenCourseId(courseId);
                }}
                onNewCourse={() => {
                  setTab('courses');
                  setOpenCourseId(null);
                  setNewCourseOpen(true);
                }}
                onGoToCourses={() => goToTab('courses')}
              />
            )}

            {tab === 'courses' &&
              (openCourseId ? (
                <CourseEditor courseId={openCourseId} onBack={() => setOpenCourseId(null)} />
              ) : (
                <Courses
                  onOpenCourse={setOpenCourseId}
                  newCourseOpen={newCourseOpen}
                  setNewCourseOpen={setNewCourseOpen}
                />
              ))}

            {tab === 'tests' && <TestBank />}
            {tab === 'users' && <Users />}
            {tab === 'settings' && <Settings />}
          </main>
        </div>
      </div>

      {/* Bottom navigation (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-line bg-surface lg:hidden">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => goToTab(id)}
            aria-current={tab === id ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-2xs font-medium transition-colors ${
              tab === id ? 'text-accent' : 'text-subtle'
            }`}
          >
            <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} /> {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <Shell />
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
