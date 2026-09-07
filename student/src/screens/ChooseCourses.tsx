import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { useData } from '../hooks/useData';
import { ScreenHeader, Stepper } from '../components/ui';
import { toneOf } from '../lib/theme';

interface Props {
  selectedExam: string | null;
  selectedUniversities: string[];
  onChange: (examId: string, universityIds: string[]) => void;
  onNext: () => void;
}

export default function ChooseCourses({
  selectedExam,
  selectedUniversities,
  onChange,
  onNext,
}: Props) {
  const { exams, universities } = useData();
  const [expanded, setExpanded] = useState<string | null>(selectedExam ?? exams[0]?.id ?? null);

  function toggleUniversity(examId: string, universityId: string) {
    const next = selectedUniversities.includes(universityId)
      ? selectedUniversities.filter((item) => item !== universityId)
      : [...selectedUniversities, universityId];
    onChange(examId, next);
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <div className="px-4 pt-safe">
        <div className="pt-3">
          <Stepper steps={4} current={1} />
        </div>
      </div>

      <ScreenHeader title="Choose your Courses" />

      <div className="flex-1 space-y-3 px-4 pb-32">
        {exams.map((exam) => {
          const open = expanded === exam.id;
          const examUniversities = universities.filter((university) =>
            exam.universityIds.includes(university.id),
          );
          const chosen = examUniversities.filter((university) =>
            selectedUniversities.includes(university.id),
          ).length;

          return (
            <section key={exam.id} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : exam.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{exam.name}</span>
                    {chosen > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber text-[9px] font-bold text-white">
                        {chosen}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-subtle">
                    {exam.fullName}
                  </span>
                </span>
                <span className="icon-btn bg-surface-3 text-muted">
                  {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>

              {open && (
                <div className="grid grid-cols-3 gap-3 border-t border-line px-4 py-4">
                  {examUniversities.map((university) => {
                    const active = selectedUniversities.includes(university.id);
                    return (
                      <button
                        key={university.id}
                        type="button"
                        onClick={() => toggleUniversity(exam.id, university.id)}
                        aria-pressed={active}
                        className={`${toneOf(university.colorTheme)} relative flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 transition-colors ${
                          active ? 'tone-border bg-surface' : 'border-line bg-surface'
                        }`}
                      >
                        {active && (
                          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-success text-white">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        )}
                        <span className="tone-soft flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold">
                          {university.monogram}
                        </span>
                        <span className="text-[13px] font-semibold">{university.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}

        <p className="px-1 text-[13px] text-subtle">
          Pick every university you are targeting - your practice tests and live classes are
          filtered to match.
        </p>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-line bg-surface px-4 pb-safe pt-3">
        <button
          type="button"
          className="btn-primary w-full"
          disabled={selectedUniversities.length === 0}
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
