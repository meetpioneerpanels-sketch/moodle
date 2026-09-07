# EduHub - entry-test prep in two apps

A compact learning platform built from the *Mini-Moodle AI Build Kit*: a teacher/admin web
console and a student PWA that share one Firebase project and stay in sync in real time.
Alongside the course library, it runs a full test-prep flow - university selection,
packages, timed topical tests, score reports and per-subject analytics.

| App | Folder | Runs on | What it does |
| --- | --- | --- | --- |
| **EduHub Console** | [`console/`](console) | Desktop/laptop browsers | Create courses and lessons, manage users, publish content |
| **EduHub Student** | [`student/`](student) | Android (APK via PWABuilder) and any browser | Pick universities and a package, take timed tests, read lessons, track progress |

Content flows one way - the console publishes courses, lessons and question banks, students
read them - and progress signals (lesson completion, test attempts, doubts) flow back. Both apps subscribe to the same Firestore collections with `onSnapshot`
listeners, so a lesson saved in the console appears on every student device in about a
second, with no refresh.

```
Teacher console  ──write──►  Cloud Firestore  ──onSnapshot──►  Student app
      ▲              (courses, lessons, tests, questions,           │
      │               users, lessonProgress, testAttempts,           │
      └──onSnapshot── liveClasses, doubts, catalogue)  ◄───write─────┘
```

## What the student app does

| Screen | What it is |
| --- | --- |
| **Onboarding** | Pick an exam (ECAT / MDCAT) and the universities you are targeting, then a package - a four-step stepper, stored on the profile |
| **Home** | Greeting, three circular quick actions, and rows into Live Classes, Recorded Courses, Practice Zone and sharing |
| **Practice Zone** | University filter, subject tabs, chapter pills, and a list of topical tests that are either startable or locked behind a package |
| **Test player** | One question at a time under a per-question countdown; answering reveals the correct option, a worked solution and the difficulty; questions can be bookmarked |
| **Score report** | Correct / incorrect / seconds rings, an accuracy breakdown, performance by difficulty, time per question, and every solution on demand |
| **Analytics** | Per-subject accuracy as concentric rings, questions correct, tests attempted, average time per question, plus course reading progress |
| **Ask your Doubt** | The raised centre action - send a question to a teacher and read the replies |
| **Live Classes** | Cohort dates, what is included, seats left, and registration |
| **Courses** | The original library: course detail, lesson player, offline reading |

## Quick start

Both apps run **without Firebase**. While `src/firebase.ts` still holds the placeholder
config they start in *demo mode*: sample courses and lessons in memory, every screen and
every action fully working, and a yellow banner saying so.

```bash
cd console && npm install && npm run dev   # http://localhost:5173
cd student && npm install && npm run dev   # http://localhost:5174
```

In demo mode any email plus a six-character password signs you in. The first account you
create becomes the admin, exactly as it will against a real Firebase project.

The demo is seeded to look lived-in: 96 topical tests across four subjects (16 of them
playable, with 96 written questions and worked solutions), twelve past attempts spread over
the last fortnight so the analytics rings and streak read properly, answered and open
doubts, five courses with fourteen lessons, twelve universities and six class offerings.
See [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md#demo-seed).

To go live, paste your Firebase web config into **both** `console/src/firebase.ts` and
`student/src/firebase.ts` - the same `projectId` in both files is what makes live sync
work. Full instructions: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Scripts

Each app supports the same commands:

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Typecheck, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |

## Tests

[`e2e/`](e2e) holds 34 Playwright checks that drive both built apps in demo mode: course
creation and publishing, lesson reordering, authoring a test and its questions, role
changes, then on the student side the whole onboarding → practice → timed test → score
report → analytics path, asking a doubt, registering for a live class, reading a lesson,
and the PWA guarantees (service-worker precache, manifest, offline start).
See [`e2e/README.md`](e2e/README.md).

## Repository layout

```
console/                Teacher & admin web console (React 18 + TS + Tailwind)
  src/firebase.ts       Firebase config + demo-mode switch
  src/types.ts          The shared Firestore schema
  src/hooks/            Auth, data (Firestore or demo store), toasts
  src/screens/          Login, Dashboard, Courses, Course editor, Test bank, Users, Settings
student/                Student learning PWA (same stack, mobile-first)
  public/manifest.webmanifest, public/sw.js, public/icons/
  src/screens/          Login, onboarding, Home, Practice Zone, Test player, Score report,
                        Analytics, Live Classes, Ask a Doubt, Menu, course reading
  src/components/charts.tsx  Donut, MultiRing and BarChart - no charting dependency
  src/lib/questionBank.ts    96 seed questions, 16 chapters, with worked solutions
  src/lib/offline.ts    localStorage cache of recently read lessons
e2e/                    Playwright smoke tests for both apps (25 checks, no Firebase needed)
docs/DESIGN.md          Design tokens, theming, type and motion
docs/DEPLOYMENT.md      Firebase setup, live-sync test, APK packaging, troubleshooting
docs/DATA-MODEL.md      The schema contract between the two apps
docs/AI-STUDIO-PROMPTS.md  The original build-kit prompts this repo implements
firestore.rules         Starter security rules (signed-in users only)
```

## Tech

React 18, TypeScript, Tailwind CSS, Vite, Firebase JS SDK v10 (Auth + Firestore),
lucide-react icons, Poppins. No router library - both apps use state-based navigation, and
the student app pushes a history entry per screen so the Android back button behaves
natively.

## Design

Built from the product design reference: a soft lavender-grey canvas, white cards on a low
wide shadow, fully rounded buttons, and a crimson brand colour with amber / sky / rose
supporting accents. Poppins throughout. On top of that base sit four layers - an ambient
gradient canvas with a faint dot grid, frosted glass on the floating chrome, soft-relief
(neumorphic) treatment on tactile controls, and gradient fills with matching glows on
primary actions and chart marks. Everything runs on CSS-variable tokens, so the
light/dark/system switch in both apps needs no per-component branching, and each subject's
colour is a `tone-*` class that stays legible in both themes. Charts are hand-rolled SVG -
donut rings, concentric multi-rings and grouped bars - with no charting dependency.
See [`docs/DESIGN.md`](docs/DESIGN.md).

## Roles

Three roles, one bootstrap rule: **the first account created in a fresh Firebase project
becomes the admin**, so you can never lock yourself out. Admins manage everything and can
change any user's role from the Users screen; teachers manage the courses they own;
students read published courses only and never see drafts. Locked topical tests open with
the Advanced package.
