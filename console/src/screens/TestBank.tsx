import { useMemo, useState } from 'react';
import { ArrowLeft, ClipboardList, Lock, Pencil, Plus, Trash2, Unlock } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog, EmptyState, Modal, SkeletonList } from '../components/ui';
import QuestionEditor from '../components/QuestionEditor';
import { toneOfSubject } from '../lib/theme';
import { CATEGORIES, type Question, type Subject, type Test, type TestDraft } from '../types';

const CHAPTERS = ['Ch 1', 'Ch 2', 'Ch 3', 'Ch 4'];

const EMPTY_TEST: TestDraft = {
  title: '',
  subject: 'Maths',
  chapter: 'Ch 1',
  universityId: 'nust',
  secondsPerQuestion: 15,
  locked: false,
};

export default function TestBank() {
  const {
    tests,
    universities,
    loading,
    createTest,
    updateTest,
    deleteTest,
    questionsOf,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  } = useData();
  const { toast } = useToast();

  const [subject, setSubject] = useState<Subject>('Maths');
  const [openTestId, setOpenTestId] = useState<string | null>(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testDraft, setTestDraft] = useState<TestDraft>(EMPTY_TEST);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [questionEditorOpen, setQuestionEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  const [error, setError] = useState('');

  const visible = useMemo(
    () =>
      tests
        .filter((test) => test.subject === subject)
        .sort((a, b) => a.chapter.localeCompare(b.chapter) || a.order - b.order),
    [tests, subject],
  );

  const openTest = tests.find((test) => test.id === openTestId) ?? null;
  const questions = openTest ? questionsOf(openTest.id) : [];

  async function saveTest() {
    if (testDraft.title.trim().length < 3) {
      setError('Give the test a title of at least 3 characters.');
      return;
    }
    const payload = { ...testDraft, title: testDraft.title.trim() };
    if (editingTest) {
      await updateTest(editingTest.id, payload);
      toast('Test updated');
    } else {
      const testId = await createTest(payload);
      setOpenTestId(testId);
      toast('Test created');
    }
    setTestModalOpen(false);
  }

  // --- single test view ------------------------------------------------------
  if (openTest) {
    return (
      <div className={`${toneOfSubject(openTest.subject)} space-y-6`}>
        <button type="button" className="btn-quiet btn-sm -ml-2" onClick={() => setOpenTestId(null)}>
          <ArrowLeft className="h-3.5 w-3.5" /> All tests
        </button>

        <header className="card p-5">
          <div className="flex flex-wrap items-start gap-4">
            <span className="tone-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-semibold">
              {openTest.subject[0]}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold">{openTest.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="chip tone-soft">{openTest.subject}</span>
                <span className="chip-neutral">{openTest.chapter}</span>
                <span className="chip-neutral">{questions.length} questions</span>
                <span className="chip-neutral">{openTest.secondsPerQuestion}s per question</span>
                <span className={`chip ${openTest.locked ? 'bg-surface-3 text-muted' : 'bg-success-soft text-success'}`}>
                  {openTest.locked ? 'Locked' : 'Free'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => updateTest(openTest.id, { locked: !openTest.locked })}
              >
                {openTest.locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {openTest.locked ? 'Unlock' : 'Lock'}
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => {
                  setEditingTest(openTest);
                  setTestDraft({
                    title: openTest.title,
                    subject: openTest.subject,
                    chapter: openTest.chapter,
                    universityId: openTest.universityId,
                    secondsPerQuestion: openTest.secondsPerQuestion,
                    locked: openTest.locked,
                  });
                  setError('');
                  setTestModalOpen(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
          </div>
        </header>

        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-[13px] font-medium text-muted">Questions</h2>
            <button
              type="button"
              className="btn-primary btn-sm ml-auto"
              onClick={() => {
                setEditingQuestion(null);
                setQuestionEditorOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add question
            </button>
          </div>

          {questions.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-4 w-4" />}
              title="No questions yet"
              description="Add the first question to this test."
            />
          ) : (
            <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {questions.map((question, index) => (
                <li
                  key={question.id}
                  className="group flex items-start gap-3 bg-surface px-4 py-3 transition-colors hover:bg-surface-2"
                >
                  <span className="mt-0.5 w-5 shrink-0 text-center text-[13px] tabular-nums text-subtle">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm">{question.text}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="chip bg-success-soft text-success">
                        Answer: {String.fromCharCode(65 + question.correctIndex)}
                      </span>
                      <span className="chip-neutral">{question.difficulty}</span>
                      {question.videoUrl && <span className="chip-neutral">Video</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label={`Edit question ${index + 1}`}
                      onClick={() => {
                        setEditingQuestion(question);
                        setQuestionEditorOpen(true);
                      }}
                      className="rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-3 hover:text-fg"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete question ${index + 1}`}
                      onClick={() => setQuestionToDelete(question)}
                      className="rounded-md p-1.5 text-subtle transition-colors hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <QuestionEditor
          open={questionEditorOpen}
          question={editingQuestion}
          testTitle={openTest.title}
          onClose={() => setQuestionEditorOpen(false)}
          onSave={async (draft) => {
            if (editingQuestion) {
              await updateQuestion(editingQuestion.id, draft);
              toast('Question saved');
            } else {
              await createQuestion(openTest.id, draft);
              toast('Question added');
            }
          }}
        />

        <ConfirmDialog
          open={questionToDelete !== null}
          title="Delete question?"
          message="Students who already attempted this test keep their result, but the question disappears from future attempts."
          onCancel={() => setQuestionToDelete(null)}
          onConfirm={async () => {
            if (!questionToDelete) return;
            await deleteQuestion(questionToDelete.id, openTest.id);
            setQuestionToDelete(null);
            toast('Question deleted', 'info');
          }}
        />

        <TestModal />
      </div>
    );
  }

  // --- list view -------------------------------------------------------------
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Test bank</h1>
          <p className="mt-1 text-[13px] text-muted">
            Topical tests students take in the Practice Zone.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary btn-sm"
          onClick={() => {
            setEditingTest(null);
            setTestDraft({ ...EMPTY_TEST, subject });
            setError('');
            setTestModalOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" /> New test
        </button>
      </header>

      <div className="flex gap-1 overflow-x-auto">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSubject(item)}
            aria-pressed={subject === item}
            className={`h-8 shrink-0 rounded-lg px-3.5 text-[13px] font-medium transition-colors ${
              subject === item ? 'bg-brand text-white' : 'bg-surface text-muted shadow-xs'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList rows={5} height="h-14" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-4 w-4" />}
          title={`No ${subject} tests yet`}
          description="Create the first topical test for this subject."
        />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {visible.map((test) => (
            <li
              key={test.id}
              className="group flex items-center gap-3 bg-surface px-4 py-3 transition-colors hover:bg-surface-2"
            >
              <button
                type="button"
                onClick={() => setOpenTestId(test.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="chip-neutral shrink-0">{test.chapter}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{test.title}</span>
                  <span className="block text-[13px] text-subtle">
                    {test.questionCount} question{test.questionCount === 1 ? '' : 's'} ·{' '}
                    {universities.find((university) => university.id === test.universityId)?.name ??
                      test.universityId}
                  </span>
                </span>
              </button>
              <span
                className={`chip shrink-0 ${test.locked ? 'bg-surface-3 text-muted' : 'bg-success-soft text-success'}`}
              >
                {test.locked ? 'Locked' : 'Free'}
              </span>
              <button
                type="button"
                aria-label={`Delete ${test.title}`}
                onClick={() => setTestToDelete(test)}
                className="shrink-0 rounded-md p-1.5 text-subtle opacity-60 transition-all hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={testToDelete !== null}
        title="Delete test?"
        message={`"${testToDelete?.title}" and all of its questions will be deleted permanently.`}
        confirmLabel="Delete test"
        onCancel={() => setTestToDelete(null)}
        onConfirm={async () => {
          if (!testToDelete) return;
          await deleteTest(testToDelete.id);
          setTestToDelete(null);
          toast('Test deleted', 'info');
        }}
      />

      <TestModal />
    </div>
  );

  function TestModal() {
    return (
      <Modal
        open={testModalOpen}
        title={editingTest ? 'Edit test' : 'New test'}
        subtitle={editingTest ? editingTest.title : 'Students find it in the Practice Zone.'}
        onClose={() => setTestModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setTestModalOpen(false)}
            >
              Cancel
            </button>
            <button type="button" className="btn-primary btn-sm" onClick={saveTest}>
              {editingTest ? 'Save changes' : 'Create test'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="test-title">
              Title
            </label>
            <input
              id="test-title"
              className="input"
              value={testDraft.title}
              onChange={(event) => setTestDraft({ ...testDraft, title: event.target.value })}
              placeholder="Topical Test - 01"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="test-subject">
                Subject
              </label>
              <select
                id="test-subject"
                className="input"
                value={testDraft.subject}
                onChange={(event) =>
                  setTestDraft({ ...testDraft, subject: event.target.value as Subject })
                }
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="test-chapter">
                Chapter
              </label>
              <select
                id="test-chapter"
                className="input"
                value={testDraft.chapter}
                onChange={(event) => setTestDraft({ ...testDraft, chapter: event.target.value })}
              >
                {CHAPTERS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="test-university">
                University
              </label>
              <select
                id="test-university"
                className="input"
                value={testDraft.universityId}
                onChange={(event) =>
                  setTestDraft({ ...testDraft, universityId: event.target.value })
                }
              >
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="test-seconds">
                Seconds per question
              </label>
              <input
                id="test-seconds"
                type="number"
                min={5}
                max={300}
                className="input"
                value={testDraft.secondsPerQuestion}
                onChange={(event) =>
                  setTestDraft({
                    ...testDraft,
                    secondsPerQuestion: Math.max(5, Number(event.target.value) || 15),
                  })
                }
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-[13px] text-muted">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[color:var(--brand)]"
              checked={testDraft.locked}
              onChange={(event) => setTestDraft({ ...testDraft, locked: event.target.checked })}
            />
            Requires a paid package (locked in the Practice Zone)
          </label>

          {error && <p className="error-text">{error}</p>}
        </div>
      </Modal>
    );
  }
}
