# Firestore data model

This schema is the contract between the two apps. Both `console/src/types.ts` and
`student/src/types.ts` declare it, deliberately duplicated so each app can be deployed and
regenerated on its own. **If you rename a field, change it in both files** or live sync
breaks silently.

Field names are lowercase with no spaces, because queries in both codebases reference them
by name.

## `users`

Document id = the Firebase Auth `uid`.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Full name, collected at sign-up |
| `email` | string | Same address as the Auth account |
| `role` | `"admin" \| "teacher" \| "student"` | First account in a fresh project is forced to `admin` |
| `createdAt` | number | `Date.now()` at sign-up |

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

## Queries in use

| App | Query | Index |
| --- | --- | --- |
| Console | whole `courses`, `lessons`, `users` collections | none needed |
| Student | `courses where published == true` | single-field, automatic |
| Student | `lessonProgress where userId == uid` | single-field, automatic |
| Console | `lessons where courseId == id` (on course delete) | single-field, automatic |

No composite indexes are required, so there is no `firestore.indexes.json` to deploy.
Sorting (`order`, `updatedAt`) is done client-side on these small collections, which keeps
every listener a simple, index-free subscription.
