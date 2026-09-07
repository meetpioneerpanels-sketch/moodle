# Firestore data model

This schema is the contract between the two apps. Both `console/src/types.ts` and
`student/src/types.ts` declare it, deliberately duplicated so each app can be deployed and
regenerated on its own. **If you rename a field, change it in both files** or live sync
breaks silently.

Field names are lowercase with no spaces, because queries in both codebases reference them
by name.

The model has two layers: the original LMS content (courses, lessons, reading progress)
and the test-prep layer (exams, universities, packages, question banks, attempts, doubts).

## `users`

Document id = the Firebase Auth `uid`.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Full name, collected at sign-up |
| `email` | string | Same address as the Auth account |
| `role` | `"admin" \| "teacher" \| "student"` | First account in a fresh project is forced to `admin` |
| `createdAt` | number | `Date.now()` at sign-up |
| `examId` | string? | Onboarding: the exam being prepared for, e.g. `ecat` |
| `universityIds` | string[]? | Onboarding: target universities |
| `packageId` | string? | Onboarding: the selected package |

Written by both apps at sign-up; read by both. Only an admin changes `role`, from the
console's Users screen.

## `courses`

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | |
| `description` | string | |
| `category` | string | Math, Science, Language, History, Other |
| `emoji` | string | Cover badge, chosen from 12 options |
| `colorTheme` | `"green" \| "blue" \| "orange" \| "purple" \| "pink"` | Drives the card colour in both apps |
| `teacherId` | string | `uid` of the owner |
| `teacherName` | string | Denormalised so the student app needs no user lookup |
| `published` | boolean | Students only ever query `published == true` |
| `lessonCount` | number | Kept in step with the `lessons` collection by the console |
| `createdAt` / `updatedAt` | number | `updatedAt` drives "recently edited" ordering |

Written by the console; read by the student app.

## `lessons`

| Field | Type | Notes |
| --- | --- | --- |
| `courseId` | string | Parent course document id |
| `title` | string | |
| `content` | string | Plain text; blank lines become paragraphs in the player |
| `imageUrl` | string | Optional; empty string when unused |
| `videoUrl` | string | Optional; **stored in `youtube.com/embed/VIDEO_ID` form** - the console's lesson editor converts watch/share/shorts links on save |
| `durationMin` | number | Shown as "N min read" |
| `order` | number | 1-based; the console's up/down arrows swap this field |
| `createdAt` | number | Tie-breaker when two lessons share an order |

Written by the console; read by the student app.

## `lessonProgress`

Document id = `` `${userId}_${lessonId}` `` so each student has exactly one document per
lesson and completing twice is idempotent.

| Field | Type | Notes |
| --- | --- | --- |
| `courseId` | string | Denormalised for per-course progress queries |
| `lessonId` | string | |
| `userId` | string | The student's `uid`; the app queries `where('userId', '==', uid)` |
| `completed` | boolean | |
| `completedAt` | number | Also feeds the streak counter on Home |

Written by the student app; read by the student app today, and by console dashboards in a
future version.

## `exams`, `universities`, `packages`

Read-only catalogue, authored once per deployment.

| Collection | Key fields |
| --- | --- |
| `exams` | `name`, `fullName`, `universityIds[]` |
| `universities` | `name`, `fullName`, `monogram`, `colorTheme` |
| `packages` | `name`, `price`, `currency`, `features[{label, included}]`, `recommended` |

## `tests`

One topical test, inside one chapter of one subject.

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | e.g. "Topical Test - 01" |
| `subject` | `"Maths" \| "Physics" \| "Chemistry" \| "English"` | Drives the subject tabs |
| `chapter` | string | "Ch 1" … "Ch 4" |
| `universityId` | string | Which university's syllabus it follows |
| `questionCount` | number | Kept in step with `questions` by the console |
| `secondsPerQuestion` | number | The per-question countdown in the player |
| `locked` | boolean | Requires a paid package; renders as "Locked" |
| `order` | number | Ordering within a chapter |

Written by the console's Test bank; read by the student Practice Zone.

## `questions`

| Field | Type | Notes |
| --- | --- | --- |
| `testId` | string | Parent test |
| `text` | string | The question stem |
| `options` | string[] | 2-6 options, rendered A, B, C… |
| `correctIndex` | number | Index into `options` |
| `explanation` | string | Shown after answering, and in the solutions list |
| `difficulty` | `"Easy" \| "Medium" \| "Hard"` | Feeds the difficulty analysis chart |
| `videoUrl` | string | Optional worked solution, stored as a YouTube **embed** URL |
| `order` | number | Order within the test |

## `testAttempts`

Written by the student app on submit; the report and analytics read nothing else.

| Field | Type | Notes |
| --- | --- | --- |
| `testId` / `testTitle` / `subject` | string | Denormalised so analytics needs no joins |
| `userId` | string | The student's `uid` |
| `answers` | array | `{questionId, selectedIndex \| null, correct, secondsTaken, difficulty, bookmarked}` |
| `correct` / `incorrect` / `unanswered` / `bookmarks` | number | Precomputed headline figures |
| `secondsTaken` | number | Total across the attempt |
| `startedAt` / `completedAt` | number | Timestamps |

`selectedIndex: null` means the countdown expired - that question counts as skipped, not wrong.

## `liveClasses`

| Field | Type | Notes |
| --- | --- | --- |
| `title`, `universityId` | string | |
| `startDate` / `endDate` | number | Shown on the class card |
| `includes` | string[] | The "What is Included?" checklist |
| `seats` / `seatsTaken` | number | Drives "N seats left" |
| `mode` | `"live" \| "recorded"` | Splits the two screens |

## `doubts`

| Field | Type | Notes |
| --- | --- | --- |
| `userId` / `userName` | string | Who asked |
| `subject` | Subject | |
| `question` | string | |
| `imageUrl` | string | Optional photo of their working |
| `status` | `"open" \| "answered"` | |
| `answer` | string | Filled in by a teacher |
| `createdAt` / `answeredAt` | number | |

## Queries in use

| App | Query | Index |
| --- | --- | --- |
| Console | whole `courses`, `lessons`, `users` collections | none needed |
| Student | `courses where published == true` | single-field, automatic |
| Student | `lessonProgress where userId == uid` | single-field, automatic |
| Console | `lessons where courseId == id` (on course delete) | single-field, automatic |
| Console | whole `tests`, `questions`, `universities` collections | none needed |
| Student | `testAttempts where userId == uid` | single-field, automatic |
| Student | `doubts where userId == uid` | single-field, automatic |

No composite indexes are required, so there is no `firestore.indexes.json` to deploy.
Sorting (`order`, `updatedAt`) is done client-side on these small collections, which keeps
every listener a simple, index-free subscription.
