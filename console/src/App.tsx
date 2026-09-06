import { useState } from 'react';
import { BookOpen, LayoutDashboard, Settings as SettingsIcon, Users as UsersIcon, X } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { DataProvider, useData } from './hooks/useData';
import { ToastProvider } from './hooks/useToast';
import { LiveDot } from './components/ui';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Courses from './screens/Courses';
import CourseEditor from './screens/CourseEditor';
import Users from './screens/Users';
import Settings from './screens/Settings';
import { isDemoMode } from './firebase';
import { initialsOf } from './lib/format';

type Tab = 'dashboard' | 'courses' | 'users' | 'settings';

const TABS: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'users', label: 'Users', icon: UsersIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (!isDemoMode || dismissed) return null;
  return (
    <div className="flex items-center gap-3 bg-bee px-4 py-2.5 text-sm font-extrabold text-ink">
      <span aria-hidden="true">⚡</span>
      <p className="min-w-0 flex-1">
        Demo mode - connect Firebase in <code className="font-mono">src/firebase.ts</code> to enable
        live sync
      </p>
      <button
        type="button"
        aria-label="Dismiss demo banner"
        onClick={() => setDismissed(true)}
        className="rounded-full p-1 hover:bg-ink/10"
      >
        <X className="h-4 w-4" />
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <span className="block text-6xl" aria-hidden="true">
            🎓
          </span>
          <p className="font-extrabold text-wolf">Loading EduHub...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  function goToTab(next: Tab) {
    setTab(next);
    setOpenCourseId(null);
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-white">
      <DemoBanner />

      <div className="flex min-h-0 flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-60 shrink-0 flex-col gap-2 overflow-y-auto border-r-2 border-swan px-4 py-6 lg:flex">
          <div className="mb-4 flex items-center gap-2 px-2">
            <span className="text-3xl" aria-hidden="true">
              🎓
            </span>
            <span className="text-lg font-extrabold leading-tight">
              EduHub
              <span className="block text-xs font-bold uppercase tracking-wide text-wolf">
                Console
              </span>
            </span>
          </div>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => goToTab(id)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold uppercase tracking-wide transition-colors ${
                tab === id ? 'bg-macaw/10 text-macaw-dark' : 'text-wolf hover:bg-swan/40'
              }`}
            >
              <Icon className="h-5 w-5" /> {label}
            </button>
          ))}
          <div className="mt-auto flex items-center gap-3 rounded-2xl bg-swan/30 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-grass text-xs font-extrabold text-white">
              {initialsOf(user.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold">{user.name}</span>
              <span className="block text-xs font-bold capitalize text-wolf">{user.role}</span>
            </span>
          </div>
        </aside>

        {/* Main column - scrolls independently of the sidebar */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-swan bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
            <span className="text-2xl lg:hidden" aria-hidden="true">
              🎓
            </span>
            <span className="font-extrabold lg:hidden">EduHub</span>
            <span className="ml-auto flex items-center gap-3">
              <LiveDot live={live} />
              <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-grass text-xs font-extrabold text-white lg:flex">
                {initialsOf(user.name)}
              </span>
            </span>
          </header>

          <main className="px-4 pb-28 pt-6 lg:px-8 lg:pb-12">
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

            {tab === 'users' && <Users />}
            {tab === 'settings' && <Settings />}
          </main>
        </div>
      </div>

      {/* Bottom navigation (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t-2 border-swan bg-white lg:hidden">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => goToTab(id)}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-extrabold uppercase tracking-wide transition-colors ${
              tab === id ? 'text-macaw-dark' : 'text-wolf'
            }`}
          >
            <Icon className="h-5 w-5" /> {label}
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
