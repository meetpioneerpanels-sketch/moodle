# The original build-kit prompts

This repository is a hand-written implementation of the two prompts from the *Mini-Moodle
AI Build Kit*. They are kept here because they are the specification: if you ever want to
regenerate one of the apps from scratch in
[Google AI Studio Build](https://ai.google/build), paste the matching prompt into a new
app and compare the result against the code here.

Where the code and these prompts disagree, the code is what runs - the differences are
listed at the bottom.

---

## Prompt 1 - Teacher & admin web console

> Build a complete, production-quality web application called "EduHub Console" - a teacher
> and admin dashboard for a small school learning management system, in the spirit of a
> friendly, modern Moodle.
>
> **TECH STACK**
> - React 18 + TypeScript + Tailwind CSS, single-page app; use state-based navigation (no
>   router library).
> - Firebase JS SDK v10 or newer (modular imports): `firebase/auth` and `firebase/firestore`.
> - `lucide-react` for icons. Google Font "Nunito" (weights 400, 700, 800, 900) as the app font.
> - Put all Firebase setup in one file, `src/firebase.ts`, exporting `db` and `auth`, with a
>   clearly marked placeholder config:
>   `const firebaseConfig = { apiKey: "PASTE_YOUR_API_KEY", authDomain: "PASTE_PROJECT_ID.firebaseapp.com", projectId: "PASTE_PROJECT_ID", storageBucket: "PASTE_PROJECT_ID.appspot.com", messagingSenderId: "PASTE_SENDER_ID", appId: "PASTE_APP_ID" };`
>
> **DEMO MODE (IMPORTANT)**
> - If `apiKey` still equals `"PASTE_YOUR_API_KEY"`, run in demo mode: keep all data in
>   memory using a `useDemoData` hook seeded with 3 sample courses and 8 sample lessons, and
>   show a dismissible yellow banner: "Demo mode - connect Firebase in src/firebase.ts to
>   enable live sync".
> - Every create, edit, delete and publish action must work in demo mode exactly as it will
>   work against Firebase, so the full UI can be tested before connecting the backend.
>
> **DATA MODEL** (must match exactly - a separate student app reads the same database)
> - Collection "users": `{ name, email, role: "admin" | "teacher" | "student", createdAt }`
> - Collection "courses": `{ title, description, category, emoji, colorTheme (one of green | blue | orange | purple | pink), teacherId, teacherName, published (boolean), lessonCount (number), createdAt, updatedAt }`
> - Collection "lessons": `{ courseId, title, content (plain text, multi-paragraph), imageUrl, videoUrl (YouTube link), durationMin (number), order (number), createdAt }`
>
> **AUTH & ROLES**
> - Email/password sign-up and sign-in with Firebase Auth. The sign-up form collects full
>   name and account type (Teacher or Student).
> - The first account ever created automatically becomes role "admin". Admins can change any
>   user's role from the Users screen; teachers can only manage their own courses; admins can
>   manage everything.
>
> **SCREENS**
> 1. **Login / Sign-up** - friendly split screen: left brand panel with a large
>    graduation-cap emoji and the app name; right side the form with inline validation errors.
> 2. **Dashboard** - four stat cards (My Courses, Total Lessons, Published, Students) computed
>    live from Firestore; a "Recently edited" list of courses; quick-action buttons New Course
>    and Add Lesson.
> 3. **Courses** - responsive card grid; each card shows an emoji badge on its colorTheme
>    background, title, category chip, lesson count, and a Published/Draft toggle switch;
>    search box plus category filter; a New Course button opens a modal with title,
>    description, category, an emoji picker (12 options) and a color-theme picker.
> 4. **Course Editor** - single-course view: editable course header plus a lesson list showing
>    each lesson's order number, title and duration; buttons Add Lesson, Edit, Delete (with
>    confirmation), and up/down arrows that reorder lessons and persist the "order" field.
> 5. **Lesson Editor** - modal or side panel: title, multi-paragraph content textarea, image
>    URL with a live thumbnail preview, YouTube URL automatically converted to an embedded
>    preview, `durationMin`, and Save.
> 6. **Users** - table of all users (name, email, role chip, joined date) with search;
>    admin-only role dropdown per row.
> 7. **Settings** - app info, sign out, and a "Firebase connection" card that shows whether
>    the app is in live mode or demo mode.
>
> **REAL-TIME SYNC**
> - All lists must subscribe with `onSnapshot` listeners so any change made by another user
>   appears within about one second without refreshing. Show a small pulsing green "Live" dot
>   in the header while listeners are active.
>
> **DESIGN SYSTEM (follow strictly)**
> - Duolingo-inspired: white background, rounded-2xl cards with soft shadows, chunky bold
>   headings in `#3C3C3C`; primary green `#58CC02`, blue `#1CB0F6`, orange `#FF9600`, red
>   `#FF4B4B` for destructive actions, yellow `#FFC800` for highlights.
> - Big friendly buttons with a 2px darker bottom border for a 3D press effect and a hover lift.
> - Playful empty states: large emoji, one friendly sentence, one call-to-action button (for
>   example "No courses yet - create your first one!"). Add a small confetti burst animation
>   when a course is published for the first time.
>
> **QUALITY BAR**
> - Loading skeletons (not spinners) for every list; toast notifications on save, delete and
>   publish; confirmation dialogs before destructive actions; helpful form validation messages.
> - Fully responsive from 360 px phone width to desktop; the sidebar collapses to bottom
>   navigation on small screens.
> - Clean component structure in folders, TypeScript types for every data model, and no TODO
>   placeholder code.

---

## Prompt 2 - Student learning app (PWA, APK-ready)

> Build a complete, production-quality mobile-first web app called "EduHub Student" - the
> student-facing companion of a small school learning management system. It must feel like a
> polished Duolingo-style Android app and must be ready to be wrapped into an APK with
> PWABuilder.
>
> **TECH STACK**
> - React 18 + TypeScript + Tailwind CSS, single-page app with bottom tab navigation (no
>   router library).
> - Firebase JS SDK v10 or newer (modular imports): `firebase/auth` and `firebase/firestore`.
> - `lucide-react` for icons. Google Font "Nunito" (weights 400, 700, 800, 900).
> - All Firebase setup in one file, `src/firebase.ts`, exporting `db` and `auth`, with the same
>   clearly marked placeholder structure as the teacher console.
>
> **DEMO MODE (IMPORTANT)**
> - If `apiKey` is still the placeholder, run fully in demo mode with 3 sample published
>   courses and 8 sample lessons kept in memory, plus a yellow banner "Demo mode - live sync
>   off". Every screen and interaction must work in demo mode.
>
> **DATA MODEL** (must match exactly - the teacher web console writes this data)
> - Collection "users": `{ name, email, role, createdAt }`
> - Collection "courses": `{ title, description, category, emoji, colorTheme, teacherId, teacherName, published, lessonCount, createdAt, updatedAt }`
> - Collection "lessons": `{ courseId, title, content, imageUrl, videoUrl, durationMin, order, createdAt }`
> - Collection "lessonProgress": `{ courseId, lessonId, userId, completed, completedAt }` -
>   written by this app when a student finishes a lesson.
>
> **AUTH & ACCESS**
> - Email/password login and sign-up (collect name and a Student / Teacher choice, but this
>   app gives read access to students; teachers work in the separate web console).
> - Students may see ONLY courses where `published` equals true. Never show drafts.
>
> **SCREENS** (mobile-first, designed for 360-430 px phone widths)
> 1. **Splash / Login** - brand panel with a large graduation-cap emoji, app name and a green
>    gradient; email/password form with a link to sign-up.
> 2. **Home** (bottom tab 1) - greeting header with avatar and a streak-style flame icon; a
>    large "Continue learning" card showing the next incomplete lesson; a horizontal scroll
>    list "All courses" with emoji cover cards; each card shows a progress ring with the
>    completion percentage.
> 3. **Browse** (tab 2) - search box plus category chips (All, Math, Science, Language,
>    History, Other) and a course card list that updates live.
> 4. **Course Detail** - course header (emoji, title, teacher name, description and a progress
>    bar like "3 of 10 lessons"); lesson list with number bubbles where completed lessons show
>    a green check circle; tapping a lesson opens the Lesson Player.
> 5. **Lesson Player** - full-screen reading view: lesson title, optional image, multi-paragraph
>    content in large readable type (17 px, 1.7 line height), optional YouTube video embedded at
>    16:9; a sticky bottom bar with a big green "Mark as complete" button that writes
>    `lessonProgress`, triggers a confetti burst and updates the progress ring; Previous / Next
>    lesson buttons.
> 6. **Profile** (tab 3) - avatar, name, stats (courses enrolled, lessons completed), a "My
>    courses" list with progress, and sign out.
>
> **LIVE SYNC (the core feature)**
> - Subscribe with `onSnapshot` to published courses and their lessons. When the teacher
>   publishes a new course or edits a lesson, every open app must update within about one
>   second and show a small toast like "New lesson available" without any user refresh. Show a
>   pulsing green "Live" dot in the home header.
>
> **PWA REQUIREMENTS (critical for APK wrapping)**
> - Include a valid web app manifest: name "EduHub Student", short_name "EduHub", display
>   "standalone", orientation "portrait", theme_color `#58CC02`, background_color `#FFFFFF`,
>   and generate simple 192 px and 512 px icons.
> - Register a service worker that precaches the app shell so the app opens offline, and store
>   the text of recently viewed lessons in localStorage for offline reading.
> - Handle the `beforeinstallprompt` event with a friendly "Install app" banner. Avoid
>   browser-only UI dependencies; make every touch target at least 44 px; keep Android
>   back-button behavior natural.
>
> **DESIGN SYSTEM (follow strictly)**
> - Duolingo-inspired: white background, rounded-2xl cards, chunky bold headings in `#3C3C3C`,
>   primary green `#58CC02`, blue `#1CB0F6`, orange `#FF9600`, red `#FF4B4B`, yellow `#FFC800`.
> - Big 3D-style buttons with a darker bottom border and a press-down effect; progress rings;
>   playful empty states with emoji; confetti on lesson completion.
>
> **QUALITY BAR**
> - Loading skeletons everywhere; toast feedback for sync and saves; an offline banner "You are
>   offline - showing downloaded lessons" when `navigator.onLine` is false; TypeScript types for
>   all data models; no placeholder TODO code.

---

## Where this implementation differs

Small, deliberate departures made while building the real thing:

- **`useDemoData` is a module, not a hook.** Demo data lives in `src/lib/demoStore.ts` with a
  `subscribe()` method that mirrors `onSnapshot`, so screens use one data API in both modes and
  demo mutations propagate to every listening component exactly as Firestore does.
- **YouTube links are normalised on save.** The console stores `videoUrl` already in
  `youtube.com/embed/VIDEO_ID` form, so the student app can drop it straight into an iframe -
  this is what makes the "watch link pasted" failure impossible rather than merely documented.
- **`lessonProgress` uses a deterministic document id** (`${userId}_${lessonId}`), so completing
  a lesson twice updates one document instead of creating duplicates.
- **A maskable 512 px icon** was added alongside the required 192/512 icons, because Android
  adaptive icons crop a square icon badly.
- **The service worker reads `index.html` at install time** to precache the hashed JS/CSS
  bundles. A static file list cannot name them, and without this the first offline start shows a
  blank page.
- **A demo-mode sign-in derives a display name from the email**, so the greeting reads "Hi Liam"
  rather than "Hi liam@school.edu".
- **The design system was replaced twice.** The prompts above specify a Duolingo-inspired
  look - Nunito, chunky 3D buttons, `#58CC02` green. The apps now follow a supplied product
  design reference instead: Poppins, a lavender-grey canvas with white cards on a soft
  shadow, fully rounded buttons, a crimson brand colour, and a light/dark/system theme
  switch. Course and subject colours survive as tinted `tone-*` accents. See
  [`DESIGN.md`](DESIGN.md); the prompts are kept verbatim above as the original brief.
- **A test-prep layer was added** on top of the LMS the prompts describe: exams and
  university selection, packages, a topical-test Practice Zone, a timed question player
  with worked solutions, a score report with difficulty and timing analysis, per-subject
  analytics, live-class registration, and an Ask-your-Doubt channel - plus the Test bank in
  the console that authors the question banks behind them. Those collections are documented
  in [`DATA-MODEL.md`](DATA-MODEL.md).
