# Deployment playbook

From an empty Google account to an installed APK talking live to the web console. Each
step takes roughly five to fifteen minutes and none of them needs a credit card - the
Firebase Spark plan covers a school pilot comfortably. Do the Firebase work once: **both
apps connect to the same project.**

## Step 1 - Create the Firebase backend

1. Go to [console.firebase.google.com](https://console.firebase.google.com), click **Add
   project**, name it (for example `eduhub-school`), and disable Google Analytics if you
   do not need it.
2. **Build > Authentication > Get started**, select **Email/Password**, toggle Enable,
   save.
3. **Build > Firestore Database > Create database**, pick *Start in production mode*, and
   choose a region close to your students.
4. Open the **Rules** tab, paste the contents of [`../firestore.rules`](../firestore.rules),
   and click **Publish**.
5. Back on Project Overview, click the web icon (`</>`), register an app named `EduHub`,
   and copy the `firebaseConfig` values.

The starter rules let any signed-in user read and write. That is fine for a pilot; see
[Hardening the rules](#hardening-the-rules) before a public launch.

## Step 2 - Connect the console

Open `console/src/firebase.ts` and replace the placeholder values:

```ts
const firebaseConfig = {
  apiKey: 'AIza...',                       // was 'PASTE_YOUR_API_KEY'
  authDomain: 'eduhub-school.firebaseapp.com',
  projectId: 'eduhub-school',
  storageBucket: 'eduhub-school.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abc123',
};
```

Then:

```bash
cd console
npm install
npm run dev
```

The yellow demo banner disappears once `apiKey` is no longer the placeholder. Sign up with
your own email - **the first account created in a fresh project becomes the admin**.
Create a course, add two lessons and publish it.

Deploy the build (`npm run build` produces `dist/`) anywhere that serves static files -
Firebase Hosting, Cloud Run, Netlify, Vercel - to give your teachers a permanent URL.

With the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting      # public directory: console/dist, single-page app: yes
firebase deploy --only hosting
```

## Step 3 - Connect the student app

Paste the **same** config into `student/src/firebase.ts`. The identical `projectId` in both
files is the entire basis of live sync.

```bash
cd student
npm install
npm run build      # dist/ is what you deploy
```

The student app must be served over **HTTPS at a stable URL** - PWABuilder needs it in
Step 5, and service workers only register on HTTPS (or `localhost`).

## Step 4 - Test live sync

1. Open the console on a laptop, signed in as admin or teacher.
2. Open the student app on a phone (or a second browser window), signed in as a student.
3. In the console, add a lesson to a published course and save.
4. Watch the student app: the lesson and a *"New lesson available"* toast appear within one
   to two seconds, with no refresh. The pulsing green **Live** dot is visible in both
   headers.
5. On the phone, open the lesson and tap **Mark as complete** - the progress ring on the
   course card updates immediately.

If the lesson never arrives, the two apps are almost certainly pointing at different
projects. Compare the `projectId` in the two `firebase.ts` files.

## Step 5 - Wrap the student app into an APK

The app already ships everything PWABuilder checks for: a valid manifest
(`student/public/manifest.webmanifest`), 192/512 px icons plus a maskable icon
(`student/public/icons/`), and a service worker (`student/public/sw.js`) that precaches the
app shell - including the hashed JS/CSS bundles, which it discovers by reading
`index.html` at install time - so the app opens with no connection at all.

1. Confirm the student app is live at its HTTPS URL and opens in a normal browser.
2. Go to [pwabuilder.com](https://www.pwabuilder.com), paste the URL, click **Start**. The
   report must be green for *Manifest* and *Service Worker*.
3. **Package for stores > Android**, accept the options, download the ZIP - it contains a
   signed APK and an AAB for the Play Store.
4. **Store the signing key** PWABuilder gives you somewhere safe. Every future update must
   be signed with the same key.
5. Transfer the APK to a phone, allow *Install unknown apps* for your file manager,
   install, and log in.

For updates, redeploy the PWA to the same URL - the web content updates itself. Only
re-package when the shell (manifest, icons, name) changes.

## Hardening the rules

The starter rules trust every signed-in user. When the pilot is over, replace them with
something closer to the real permission model:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function role() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    function isStaff() { return signedIn() && role() in ['admin', 'teacher']; }

    match /users/{userId} {
      allow read: if signedIn();
      // A user creates their own profile; only an admin can change a role afterwards.
      allow create: if signedIn() && request.auth.uid == userId;
      allow update: if request.auth.uid == userId
                       && request.resource.data.role == resource.data.role
                    || (signedIn() && role() == 'admin');
      allow delete: if signedIn() && role() == 'admin';
    }

    match /courses/{courseId} {
      allow read: if signedIn();
      allow create: if isStaff();
      allow update, delete: if signedIn()
        && (role() == 'admin' || resource.data.teacherId == request.auth.uid);
    }

    match /lessons/{lessonId} {
      allow read: if signedIn();
      allow write: if isStaff();
    }

    match /lessonProgress/{progressId} {
      allow read: if signedIn()
        && (resource.data.userId == request.auth.uid || isStaff());
      allow write: if signedIn() && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

Test any rule change in the Firebase console's Rules Playground before publishing - a
mistake here locks out every student at once.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Yellow demo banner never disappears | `firebaseConfig` placeholder not replaced | Edit `src/firebase.ts` in **both** apps, paste the real values, restart the dev server |
| "Missing or insufficient permissions" | Rules not published, or the user is signed out | Publish the starter rules from Step 1 and confirm the user is logged in |
| New lessons do not appear on the phone | The apps point at different Firebase projects | Use the same `projectId` in both `firebase.ts` files; check the Live dot is green |
| Student sees no courses at all | Nothing is published yet | Students only receive `published == true`; flip the toggle in the console |
| PWABuilder fails its analysis | Manifest or service worker not reachable at the deployed URL | Confirm HTTPS, that `/manifest.webmanifest` and `/sw.js` return 200, and that `sw.js` registers without console errors |
| APK installs but shows a white screen | The deployed URL changed after packaging | Redeploy to the same stable URL, or re-package |
| YouTube video shows an error in a lesson | A watch link was stored instead of an embed link | Re-save the lesson in the console - its editor rewrites links to `youtube.com/embed/VIDEO_ID` |
| The app flashes white before going dark | The inline theme script in `index.html` was removed | Restore it - it sets `data-theme` before first paint (see `docs/DESIGN.md`) |
| Offline start shows a blank page | An old service worker is cached | Bump `VERSION` in `student/public/sw.js`, redeploy, then reload twice |

Check the browser console (F12) before anything else: Firestore permission errors and
missing-config errors both print there clearly.
