# EduHub - a mini Moodle in two apps

A compact learning management system built from the *Mini-Moodle AI Build Kit*: a
teacher/admin web console and a student PWA that share one Firebase project and stay in
sync in real time.

| App | Folder | Runs on | What it does |
| --- | --- | --- | --- |
| **EduHub Console** | [`console/`](console) | Desktop/laptop browsers | Create courses and lessons, manage users, publish content |
| **EduHub Student** | [`student/`](student) | Android (APK via PWABuilder) and any browser | Browse published courses, read lessons, mark progress |

Content flows one way - the console publishes, students read - and small progress signals
flow back. Both apps subscribe to the same Firestore collections with `onSnapshot`
listeners, so a lesson saved in the console appears on every student device in about a
second, with no refresh.

```
Teacher console  ──write──►  Cloud Firestore  ──onSnapshot──►  Student app
      ▲                    (courses, lessons,                       │
      └────────onSnapshot── users, lessonProgress) ◄────write───────┘
```

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

[`e2e/`](e2e) holds Playwright smoke tests that drive both built apps in demo mode -
course creation and publishing, lesson reordering and deletion, role changes, the student
reading flow, and the PWA guarantees (service worker precache, manifest, offline start).
See [`e2e/README.md`](e2e/README.md).

## Repository layout

```
console/                Teacher & admin web console (React 18 + TS + Tailwind)
  src/firebase.ts       Firebase config + demo-mode switch
  src/types.ts          The shared Firestore schema
  src/hooks/            Auth, data (Firestore or demo store), toasts
  src/screens/          Login, Dashboard, Courses, Course editor, Users, Settings
student/                Student learning PWA (same stack, mobile-first)
  public/manifest.webmanifest, public/sw.js, public/icons/
  src/screens/          Login, Home, Browse, Course detail, Lesson player, Profile
  src/lib/offline.ts    localStorage cache of recently read lessons
e2e/                    Playwright smoke tests for both apps (25 checks, no Firebase needed)
docs/DEPLOYMENT.md      Firebase setup, live-sync test, APK packaging, troubleshooting
docs/DATA-MODEL.md      The schema contract between the two apps
docs/AI-STUDIO-PROMPTS.md  The original build-kit prompts this repo implements
firestore.rules         Starter security rules (signed-in users only)
```

## Tech

React 18, TypeScript, Tailwind CSS, Vite, Firebase JS SDK v10 (Auth + Firestore),
lucide-react icons, Nunito. No router library - both apps use state-based navigation, and
the student app pushes a history entry per screen so the Android back button behaves
natively.

## Roles

Three roles, one bootstrap rule: **the first account created in a fresh Firebase project
becomes the admin**, so you can never lock yourself out. Admins manage everything and can
change any user's role from the Users screen; teachers manage the courses they own;
students read published courses only and never see drafts.
