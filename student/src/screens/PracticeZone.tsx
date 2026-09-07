import { useMemo, useState } from 'react';
import { ChevronDown, Target } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { EmptyState, LockPill, PillTabs, ScreenHeader, Tabs } from '../components/ui';
import { CATEGORIES, type Subject, type Test } from '../types';

const CHAPTERS = ['Ch 1', 'Ch 2', 'Ch 3', 'Ch 4'] as const;

interface Props {
  onBack: () => void;
  onStartTest: (test: Test) => void;
}

export default function PracticeZone({ onBack, onStartTest }: Props) {
  const { user } = useAuth();
  const { tests, universities, attempts } = useData();
  const [subject, setSubject] = useState<Subject>('Maths');
  const [chapter, setChapter] = useState<(typeof CHAPTERS)[number]>('Ch 1');
  const [universityId, setUniversityId] = useState<string>(user?.universityIds?.[0] ?? 'nust');

  const visible = useMemo(
    () =>
      tests
        .filter((test) => test.subject === subject && test.chapter === chapter)
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    [tests, subject, chapter],
  );

  const attemptedIds = new Set(attempts.map((attempt) => attempt.testId));

  return (
    <div className="min-h-[100dvh] bg-canvas pb-28">
      <ScreenHeader title="Practice Zone" onBack={onBack} />

      <div className="space-y-4 px-4">
        <p className="text-[13px] text-subtle">
          {tests.length} Topical Tests · {CATEGORIES.length} Subjects
        </p>

        <div className="relative">
          <select
            className="input appearance-none"
            value={universityId}
            onChange={(event) => setUniversityId(event.target.value)}
            aria-label="Select university"
          >
            {universities.map((university) => (
              <option key={university.id} value={university.id}>
                {university.name} — {university.fullName}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold">Subjects</h2>
          <Tabs tabs={CATEGORIES} active={subject} onChange={setSubject} />
        </div>

        <PillTabs tabs={CHAPTERS} active={chapter} onChange={setChapter} />

        {visible.length === 0 ? (
          <EmptyState
            icon={<Target className="h-5 w-5" />}
            title="No tests here yet"
            description="Try another chapter or subject."
          />
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-card">
            {visible.map((test) => (
              <li key={test.id}>
                <button
                  type="button"
                  disabled={test.locked}
                  onClick={() => onStartTest(test)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-surface-2 disabled:cursor-not-allowed"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{test.title}</span>
                    <span className="mt-0.5 block text-[13px] text-subtle">
                      {test.questionCount} Questions
                      {attemptedIds.has(test.id) && ' · Attempted'}
                    </span>
                  </span>
                  <LockPill locked={test.locked} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="px-1 text-[13px] text-subtle">
          Locked tests open with the Advanced package.
        </p>
      </div>
    </div>
  );
}
