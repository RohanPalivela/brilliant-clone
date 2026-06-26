# DPrilliant — a Brilliant-style way to learn Dynamic Programming

> **Tagline:** _Learn by doing._

**Deployed link:** https://brilliant-clone-5c704.web.app

## What it is

DPrilliant is an interactive, [Brilliant.org](https://brilliant.org)-style learning app for **dynamic programming**. Instead of videos or walls of text, learners *discover* DP by solving hands-on puzzles — marking reachable steps on a staircase, watching it lie down into an array, dragging a look-back window, and turning a by-hand sweep into a tabulation loop — with instant, specific feedback at every step.

The course, **Intro to Dynamic Programming**, is six hand-built lessons that follow a direct-instruction shape: set up the problem, watch a worked example, solve it yourself, then watch the algorithm run.

1. **Can You Reach the Top?** — discover reachability bottom-up on a staircase (jumps of 3 or 5).
2. **From Stairs to Arrays** — watch the staircase lie down into a boolean `reachable[]` array.
3. **Changing the Rules** — transfer the pattern to jumps of 2/3/4 and reason about the look-back window.
4. **The DP Mindset** — name the pattern and turn the by-hand sweep into a tabulation loop.
5. **Making Change** — coin-change feasibility: the staircase in disguise.
6. **Fewest Coins** — the leap from "can you?" to optimization (OR → min).

The core idea is that **a lesson is structured data, not HTML.** Each slide declares a `type`, a `component`, `props`, and a `validation` rule; the same generic widgets render any lesson, and all answer-checking lives in `src/lib/validation.ts`, keyed off `validation.type`.

## Who it's for

A **competitive-programming-curious high-school (or early-college) student** who already knows arrays and recursion and wants a step-by-step guide to building intuition for dynamic programming in a novel way. 

## How to run it

### 1. Install

```bash
npm install
```

### 2. Configure Firebase

Create `.env.local` from the template and paste your Firebase **web app** config
(Firebase console → Project settings → General → Your apps → Web app):

```bash
cp .env.example .env.local
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

In the Firebase console, enable **Authentication → Email/Password and Google**, and create a **Firestore** database. The project (`brilliant-clone-5c704`) is already referenced in `.firebaserc`.

> When deploying to Vercel, add your Vercel domain under **Authentication → Settings → Authorized domains**, or Google sign-in popups will be rejected.

### 2b. (Optional) Configure the AI tutor

The in-app tutor ("Sage") calls a serverless proxy (`api/tutor.ts`) so the model
API key **never ships to the browser**. Two sets of vars (see `.env.example`):

- **Client** (safe to bundle): `VITE_AI_TUTOR_ENABLED=true` to show the UI, plus
  optional `VITE_AI_TUTOR_MODEL`.
- **Server** (no `VITE_` prefix — set in the Vercel dashboard, or `.env` for
  `vercel dev`): `AI_TUTOR_API_KEY` (the secret) and optional `AI_TUTOR_BASE_URL`.
  Token verification uses `FIREBASE_PROJECT_ID`, which falls back to
  `VITE_FIREBASE_PROJECT_ID`, so you normally don't need to set it twice.

Leave `VITE_AI_TUTOR_ENABLED` off and the rest of the app is unaffected.

### 3. Develop

```bash
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint     # oxlint
```

### 4. Deploy (Vercel)

Hosting + the tutor proxy live on **Vercel**; Firestore/Auth stay on Firebase.

```bash
vercel              # preview deploy
vercel --prod       # production deploy  (or: npm run deploy)
```

Vercel auto-detects Vite (builds `dist/`) and compiles the edge function in
`api/`. The SPA fallback lives in `vercel.json`. Set the env vars from
`.env.example` under **Project → Settings → Environment Variables** (remember the
server-only tutor vars have **no** `VITE_` prefix).

Firestore rules and indexes still deploy through Firebase:

```bash
firebase login
firebase deploy --only firestore   # or: npm run deploy:firestore
```

## Testing

Three layers, all runnable from `package.json`:

```bash
npm run test           # unit + component tests (Vitest + Testing Library, jsdom)
npm run test:watch     # the same, in watch mode
npm run test:coverage  # with a v8 coverage report
npm run test:e2e       # end-to-end (Playwright, against the Firebase emulators)
npm run test:e2e:ui    # Playwright UI mode
npm run test:perf      # performance budget checks on the production bundle
```

- **Unit & component** tests live next to their source as `*.test.tsx` — covering the DP/validation helpers (`src/lib`), the interactive widgets, the lesson player, and the streak rules.
- **End-to-end** specs in `e2e/` (auth, lesson completion, mid-lesson resume, course unlocking, streaks, profile) run against the **Firebase Auth + Firestore emulators**, which Playwright boots automatically. The emulators require a Java 21 runtime.
- **Performance** specs use a separate config (`playwright.perf.config.ts`) and measure the production build rather than the dev server.

## Tech stack

- **React 19 + TypeScript + Vite 8**
- **Tailwind CSS v4** for the design system
- **Firebase** — Auth + Firestore for progress, streaks, and resume; lesson catalog is bundled
- **React Router 7** for routing
- **Framer Motion** for animation, plus `lucide-react` (icons) and `canvas-confetti` (celebration)
- **Vitest** + **Testing Library** and **Playwright** for testing; **oxlint** for linting

## Architecture

```
src/
  content/            Bundled, typed lesson content (the "content model")
    dynamic-programming-mastery/  course meta + lesson1..6
  components/
    interactive/      StairGrid, ArrayRow, StairsToArray, RangeSelector,
                      MultipleChoice, CodeBlanks, KnapsackPicker, DPTable, ...
    lesson/           LessonPlayer, SlideView, CongratsScreen
    layout/           AppShell, TopNav, RequireAuth
    ui/               Button, Card, ProgressBar, FeedbackBanner, LoadingScreen
    course/           CourseCard
  pages/              Auth, Home, Courses, CourseDetail, LessonPlayer, Profile
  context/            Firebase auth provider + context
  hooks/              useAuth, useProgress, useStreak
  data/               progressService (Firestore), streak rules
  lib/                firebase init, dp helpers, validation engine, answers, cn
  types/              content + progress models
```

### Data model (Firestore)

Each user can read/write only their own subtree (see `firestore.rules`):

```
users/{uid}                              profile, streak, totals
users/{uid}/courseProgress/{courseId}    percent, current lesson/slide, completed lessons
users/{uid}/lessonProgress/{lessonId}    slide index, completed slides, status
```
