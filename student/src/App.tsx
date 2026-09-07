import { useCallback, useEffect, useState } from 'react';
import { Compass, Home as HomeIcon, User, WifiOff, X } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { DataProvider } from './hooks/useData';
import { ToastProvider } from './hooks/useToast';
import { useInstallPrompt, useOnline } from './hooks/usePwa';
import Login from './screens/Login';
import Home from './screens/Home';
import Browse from './screens/Browse';
import CourseDetail from './screens/CourseDetail';
import LessonPlayer from './screens/LessonPlayer';
import Profile from './screens/Profile';
import { isDemoMode } from './firebase';

type Tab = 'home' | 'browse' | 'profile';

type View =
  | { kind: 'tab'; tab: Tab }
  | { kind: 'course'; courseId: string }
  | { kind: 'lesson'; courseId: string; lessonId: string };

const TABS: { id: Tab; label: string; icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'browse', label: 'Browse', icon: Compass },
  { id: 'profile', label: 'Profile', icon: User },
];

function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (!isDemoMode || dismissed) return null;
  return (
    <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2 text-[13px] text-muted">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
      <p className="flex-1">Demo mode - live sync off</p>
      <button
        type="button"
        aria-label="Dismiss demo banner"
        onClick={() => setDismissed(true)}
        className="rounded p-1 text-subtle"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="flex items-center gap-2 border-b border-line bg-warning-soft px-4 py-2 text-[13px] text-warning">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      You are offline - showing downloaded lessons
    </div>
  );
}

function InstallBanner() {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  if (!canInstall || dismissed) return null;
  return (
    <div className="flex items-center gap-2.5 border-b border-line bg-surface-2 px-4 py-2.5">
      <p className="flex-1 text-[13px] font-medium">Add EduHub to your home screen</p>
      <button type="button" className="btn-primary btn-sm" onClick={install}>
        Install
      </button>
      <button
        type="button"
        aria-label="Dismiss install banner"
        onClick={() => setDismissed(true)}
        className="rounded p-1 text-subtle"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Shell() {
  const { user, loading } = useAuth();
  const [stack, setStack] = useState<View[]>([{ kind: 'tab', tab: 'home' }]);
  const current = stack[stack.length - 1]!;

  const push = useCallback((view: View) => {
    setStack((previous) => [...previous, view]);
    // A history entry per screen makes the Android back button feel native.
    window.history.pushState({ eduhub: true }, '');
  }, []);

  /** Always route "back" through history so the hardware button stays in sync. */
  const back = useCallback(() => window.history.back(), []);

  useEffect(() => {
    const onPop = () => setStack((previous) => (previous.length > 1 ? previous.slice(0, -1) : previous));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function goToTab(tab: Tab) {
    setStack([{ kind: 'tab', tab }]);
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-canvas">
        <div className="flex items-center gap-2.5 text-[13px] text-subtle">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-accent" />
          Loading EduHub...
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const onLesson = current.kind === 'lesson';
  const activeTab: Tab = stack[0]!.kind === 'tab' ? (stack[0] as { tab: Tab }).tab : 'home';

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-canvas">
      <DemoBanner />
      <OfflineBanner />
      {!onLesson && <InstallBanner />}

      <main className={`flex-1 ${onLesson ? '' : 'pb-24'}`}>
        {current.kind === 'tab' && current.tab === 'home' && (
          <Home
            onOpenCourse={(courseId) => push({ kind: 'course', courseId })}
            onOpenLesson={(courseId, lessonId) => push({ kind: 'lesson', courseId, lessonId })}
          />
        )}
        {current.kind === 'tab' && current.tab === 'browse' && (
          <Browse onOpenCourse={(courseId) => push({ kind: 'course', courseId })} />
        )}
        {current.kind === 'tab' && current.tab === 'profile' && (
          <Profile onOpenCourse={(courseId) => push({ kind: 'course', courseId })} />
        )}
        {current.kind === 'course' && (
          <CourseDetail
            courseId={current.courseId}
            onBack={back}
            onOpenLesson={(lessonId) =>
              push({ kind: 'lesson', courseId: current.courseId, lessonId })
            }
          />
        )}
        {current.kind === 'lesson' && (
          <LessonPlayer
            courseId={current.courseId}
            lessonId={current.lessonId}
            onBack={back}
            onOpenLesson={(lessonId) =>
              setStack((previous) => [
                ...previous.slice(0, -1),
                { kind: 'lesson', courseId: current.courseId, lessonId },
              ])
            }
          />
        )}
      </main>

      {!onLesson && (
        <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 border-t border-line bg-surface pb-safe">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => goToTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-2xs font-medium transition-colors ${
                activeTab === id ? 'text-accent' : 'text-subtle'
              }`}
            >
              <Icon className="h-5 w-5" /> {label}
            </button>
          ))}
        </nav>
      )}
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
