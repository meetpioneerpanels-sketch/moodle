import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Home as HomeIcon, LayoutGrid, MessageCircleQuestion, User, WifiOff, X } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { DataProvider } from './hooks/useData';
import { ToastProvider } from './hooks/useToast';
import { useInstallPrompt, useOnline } from './hooks/usePwa';
import Login from './screens/Login';
import ChooseCourses from './screens/ChooseCourses';
import SelectPackage from './screens/SelectPackage';
import Home from './screens/Home';
import PracticeZone from './screens/PracticeZone';
import TestPlayer from './screens/TestPlayer';
import TestResult from './screens/TestResult';
import Analytics from './screens/Analytics';
import LiveClasses from './screens/LiveClasses';
import AskDoubt from './screens/AskDoubt';
import Menu from './screens/Menu';
import Browse from './screens/Browse';
import CourseDetail from './screens/CourseDetail';
import LessonPlayer from './screens/LessonPlayer';
import AmbientBackground from './components/AmbientBackground';
import { isDemoMode } from './firebase';
import type { Test, TestAttempt } from './types';

type Tab = 'home' | 'courses' | 'analytics' | 'menu';

type View =
  | { kind: 'tab'; tab: Tab }
  | { kind: 'practice' }
  | { kind: 'test'; test: Test }
  | { kind: 'result'; attempt: TestAttempt }
  | { kind: 'classes'; mode: 'live' | 'recorded' }
  | { kind: 'doubt' }
  | { kind: 'course'; courseId: string }
  | { kind: 'lesson'; courseId: string; lessonId: string }
  | { kind: 'onboarding-universities' }
  | { kind: 'onboarding-package' };

const TABS: { id: Tab; label: string; icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'courses', label: 'Courses', icon: LayoutGrid },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'menu', label: 'Menu', icon: User },
];

function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (!isDemoMode || dismissed) return null;
  return (
    <div className="glass flex items-center gap-2 border-b px-4 py-2 text-2xs text-muted">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" aria-hidden="true" />
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
    <div className="flex items-center gap-2 border-b border-line bg-warning-soft px-4 py-2 text-2xs font-medium text-warning">
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
    <div className="glass flex items-center gap-2.5 border-b px-4 py-2.5">
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
  const { user, loading, updateProfile } = useAuth();
  const [stack, setStack] = useState<View[]>([{ kind: 'tab', tab: 'home' }]);
  const [draftUniversities, setDraftUniversities] = useState<string[]>([]);
  const [draftExam, setDraftExam] = useState<string | null>(null);
  const [draftPackage, setDraftPackage] = useState<string | null>(null);

  const current = stack[stack.length - 1]!;

  const push = useCallback((view: View) => {
    setStack((previous) => [...previous, view]);
    // A history entry per screen makes the Android back button feel native.
    window.history.pushState({ eduhub: true }, '');
  }, []);

  /** Always route "back" through history so the hardware button stays in sync. */
  const back = useCallback(() => window.history.back(), []);

  const replace = useCallback((view: View) => {
    setStack((previous) => [...previous.slice(0, -1), view]);
  }, []);

  useEffect(() => {
    const onPop = () =>
      setStack((previous) => (previous.length > 1 ? previous.slice(0, -1) : previous));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Seed the onboarding drafts from the profile once it loads.
  useEffect(() => {
    if (!user) return;
    setDraftExam(user.examId ?? null);
    setDraftUniversities(user.universityIds ?? []);
    setDraftPackage(user.packageId ?? null);
  }, [user]);

  function goToTab(tab: Tab) {
    setStack([{ kind: 'tab', tab }]);
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="flex items-center gap-2.5 text-[13px] text-subtle">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-brand" />
          Loading EduHub...
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  // First run: pick the exam and universities, then a package.
  const needsOnboarding = !user.universityIds?.length || !user.packageId;
  const onboardingView =
    current.kind === 'onboarding-universities' || current.kind === 'onboarding-package';

  if (needsOnboarding || onboardingView) {
    const step = current.kind === 'onboarding-package' || (!onboardingView && user.universityIds?.length)
      ? 'package'
      : 'universities';

    if (step === 'universities') {
      return (
        <ChooseCourses
          selectedExam={draftExam}
          selectedUniversities={draftUniversities}
          onChange={(examId, universityIds) => {
            setDraftExam(examId);
            setDraftUniversities(universityIds);
          }}
          onNext={async () => {
            await updateProfile({
              examId: draftExam ?? 'ecat',
              universityIds: draftUniversities,
            });
            if (onboardingView) replace({ kind: 'onboarding-package' });
          }}
        />
      );
    }

    return (
      <SelectPackage
        selectedPackage={draftPackage}
        onSelect={setDraftPackage}
        onBack={() => (onboardingView ? back() : replace({ kind: 'onboarding-universities' }))}
        onNext={async () => {
          await updateProfile({ packageId: draftPackage ?? 'ultimate' });
          setStack([{ kind: 'tab', tab: 'home' }]);
        }}
      />
    );
  }

  const immersive =
    current.kind === 'test' || current.kind === 'result' || current.kind === 'lesson';
  const activeTab: Tab = stack[0]!.kind === 'tab' ? (stack[0] as { tab: Tab }).tab : 'home';

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col">
      <AmbientBackground />
      {!immersive && (
        <>
          <DemoBanner />
          <OfflineBanner />
          <InstallBanner />
        </>
      )}

      <main className={`flex-1 ${immersive ? '' : 'pb-24'}`}>
        {current.kind === 'tab' && current.tab === 'home' && (
          <Home
            onOpen={(destination) => {
              if (destination === 'practice' || destination === 'sample') push({ kind: 'practice' });
              else if (destination === 'doubt') push({ kind: 'doubt' });
              else if (destination === 'recorded') push({ kind: 'classes', mode: 'recorded' });
              else push({ kind: 'classes', mode: 'live' });
            }}
          />
        )}
        {current.kind === 'tab' && current.tab === 'courses' && (
          <Browse onOpenCourse={(courseId) => push({ kind: 'course', courseId })} />
        )}
        {current.kind === 'tab' && current.tab === 'analytics' && <Analytics />}
        {current.kind === 'tab' && current.tab === 'menu' && (
          <Menu
            onOpenCourses={() => goToTab('courses')}
            onChangePackage={() => push({ kind: 'onboarding-package' })}
            onChangeUniversities={() => push({ kind: 'onboarding-universities' })}
          />
        )}

        {current.kind === 'practice' && (
          <PracticeZone onBack={back} onStartTest={(test) => push({ kind: 'test', test })} />
        )}
        {current.kind === 'test' && (
          <TestPlayer
            test={current.test}
            onExit={back}
            onFinished={(attempt) => replace({ kind: 'result', attempt })}
          />
        )}
        {current.kind === 'result' && (
          <TestResult attempt={current.attempt} onDone={() => setStack([{ kind: 'tab', tab: 'analytics' }])} />
        )}
        {current.kind === 'classes' && <LiveClasses mode={current.mode} onBack={back} />}
        {current.kind === 'doubt' && <AskDoubt onBack={back} />}

        {current.kind === 'course' && (
          <CourseDetail
            courseId={current.courseId}
            onBack={back}
            onOpenLesson={(lessonId) => push({ kind: 'lesson', courseId: current.courseId, lessonId })}
          />
        )}
        {current.kind === 'lesson' && (
          <LessonPlayer
            courseId={current.courseId}
            lessonId={current.lessonId}
            onBack={back}
            onOpenLesson={(lessonId) =>
              replace({ kind: 'lesson', courseId: current.courseId, lessonId })
            }
          />
        )}
      </main>

      {!immersive && (
        <nav className="glass fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t pb-safe">
          <div className="relative flex">
            {TABS.slice(0, 2).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => goToTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`flex min-h-[62px] flex-1 flex-col items-center justify-center gap-1 text-2xs font-medium transition-colors ${
                  activeTab === id ? 'text-brand' : 'text-subtle'
                }`}
              >
                <Icon className="h-5 w-5" /> {label}
              </button>
            ))}

            {/* Centre action, raised out of the bar as in the design. */}
            <div className="relative w-[72px] shrink-0">
              <button
                type="button"
                onClick={() => push({ kind: 'doubt' })}
                className="fill-brand absolute -top-8 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full ring-4 ring-[color:var(--canvas)] transition-transform active:scale-95"
                aria-label="Ask your Doubt"
              >
                <MessageCircleQuestion className="h-6 w-6" />
              </button>
              <span className="absolute bottom-2 left-1/2 w-[72px] -translate-x-1/2 text-center text-[10px] font-medium leading-[1.15] text-subtle">
                Ask your
                <br />
                Doubt
              </span>
            </div>

            {TABS.slice(2).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => goToTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`flex min-h-[62px] flex-1 flex-col items-center justify-center gap-1 text-2xs font-medium transition-colors ${
                  activeTab === id ? 'text-brand' : 'text-subtle'
                }`}
              >
                <Icon className="h-5 w-5" /> {label}
              </button>
            ))}
          </div>
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
