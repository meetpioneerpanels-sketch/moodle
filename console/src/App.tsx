import { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  MessageCircleQuestion,
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
import Doubts from './screens/Doubts';
import Insights from './screens/Insights';
import Users from './screens/Users';
import Settings from './screens/Settings';
import AmbientBackground from './components/AmbientBackground';
import { isDemoMode } from './firebase';

type Tab = 'dashboard' | 'courses' | 'tests' | 'doubts' | 'insights' | 'users' | 'settings';

interface TabSpec {
  id: Tab;
  label: string;
  icon: typeof BookOpen;
  /** Tabs only an admin may open. */
  adminOnly?: boolean;
  /** Shown on the phone tab bar; the rest live in the sidebar only. */
  primary?: boolean;
}

const TABS: TabSpec[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, primary: true },
  { id: 'courses', label: 'Courses', icon: BookOpen, primary: true },
  { id: 'tests', label: 'Tests', icon: ClipboardList, primary: true },
  { id: 'doubts', label: 'Doubts', icon: MessageCircleQuestion, primary: true },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: UsersIcon, adminOnly: true },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, primary: true },
];

function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (!isDemoMode || dismissed) return null;
  return (
    <div className="glass flex items-center gap-2 border-b px-4 py-2 text-[13px] text-muted">
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
  const { live, doubts } = useData();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);
  const [newCourseOpen, setNewCourseOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2.5 text-[13px] text-subtle">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-brand" />
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
  // Teachers get the whole workspace except user administration.
  const visibleTabs = TABS.filter((item) => !item.adminOnly || user.role === 'admin');
  const openDoubts = doubts.filter((doubt) => doubt.status === 'open').length;

  return (
    <div className="flex h-[100dvh] flex-col">
      <AmbientBackground />
      <DemoBanner />

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="glass hidden w-56 shrink-0 flex-col gap-1 overflow-y-auto border-r px-3 py-4 lg:flex">
          <div className="mb-4 flex items-center gap-2 px-2">
            <span className="fill-brand flex h-7 w-7 items-center justify-center rounded-md text-[13px] font-semibold">
              E
            </span>
            <span className="text-sm font-semibold">EduHub</span>
            <span className="chip-neutral ml-auto">Console</span>
          </div>

          {visibleTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => goToTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all ${
                tab === id
                  ? 'relief-sm bg-surface text-fg'
                  : 'text-muted hover:bg-surface-3 hover:text-fg'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
              {id === 'doubts' && openDoubts > 0 && (
                <span className="ml-auto rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                  {openDoubts}
                </span>
              )}
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
          <header className="glass sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 lg:px-8">
            <span className="flex items-center gap-2 lg:hidden">
              <span className="fill-brand flex h-6 w-6 items-center justify-center rounded text-2xs font-semibold">
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
                onGoToDoubts={() => goToTab('doubts')}
                onGoToTests={() => goToTab('tests')}
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
            {tab === 'doubts' && <Doubts />}
            {tab === 'insights' && <Insights />}
            {tab === 'users' && user.role === 'admin' && <Users />}
            {tab === 'settings' && <Settings />}
          </main>
        </div>
      </div>

      {/* Bottom navigation (mobile) */}
      <nav className="glass fixed bottom-0 left-0 right-0 z-40 flex border-t lg:hidden">
        {visibleTabs
          .filter((item) => item.primary)
          .map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => goToTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-2xs font-medium transition-colors ${
                tab === id ? 'text-brand' : 'text-subtle'
              }`}
            >
              <Icon style={{ width: 18, height: 18 }} /> {label}
              {id === 'doubts' && openDoubts > 0 && (
                <span className="absolute right-[22%] top-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
              )}
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
