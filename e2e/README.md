# End-to-end smoke tests

Two Playwright scripts - 39 checks - that drive the built apps in demo mode, with no
Firebase project needed. They cover the paths that are easy to break and slow to check by
hand: creating and publishing a course, reordering and deleting lessons, authoring a
topical test and its questions, answering a doubt, reading the Insights rollup, role
changes, and that a teacher sees the teaching tools but not user administration; and on the
student side the whole onboarding → Practice Zone → timed test → score report → analytics
path, asking a doubt, registering for a live class, reading a lesson, that a staff account
is routed to the console rather than student onboarding, and the PWA guarantees (service
worker, manifest, offline start).

## Run them

```bash
npm install                     # in this folder
npx playwright install chromium # once, unless a browser is already available

# terminal 1
cd ../console && npm run build && npm run preview -- --port 4173
# terminal 2
cd ../student && npm run build && npm run preview -- --port 4174

# terminal 3
npm test
```

Build the student app before testing it: the service-worker and offline checks need the
production output, not the dev server.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `CONSOLE_URL` | `http://localhost:4173` | Where the console is served |
| `STUDENT_URL` | `http://localhost:4174` | Where the student app is served |
| `PLAYWRIGHT_CHROMIUM` | unset | Path to an existing Chromium binary, instead of Playwright's own |

A failing step prints its name, so the output says what broke rather than only where.
