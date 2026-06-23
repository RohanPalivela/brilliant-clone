# Brilliant Clone — Dynamic Programming

> **Subject:** Dynamic Programming (computer science), taught for a competitive-programming-curious high-school student.
> **Tagline:** _Learn by doing._

An interactive, Brilliant.org-style learning app. Instead of videos or walls of text, learners discover dynamic programming by solving hands-on puzzles — marking reachable steps on a staircase, mapping it onto an array, and dragging a look-back window — with instant, specific feedback at every step.

This is the **Phase 1 MVP**: the full learn-by-doing experience with **no AI**. It teaches on its own.

## Features

- **Auth** — email/password and Google sign-in (Firebase Auth).
- **Interactive lesson player** — one concept per slide, an advance gate that only unlocks on a correct answer, hints, and instant explanatory feedback.
- **Four hand-built DP lessons** — reachability → arrays → generalization → naming the pattern.
- **Rich problem types** beyond multiple choice: a tap/drag staircase (`StairGrid`), a boolean array (`ArrayRow`), and a dual-handle range slider (`RangeSelector`).
- **Progress that persists** across sessions and devices (Firestore), with mid-lesson resume.
- **Course path** with sequential unlocking, completed/current/locked states, and a "continue where you left off" home dashboard.
- **Streaks** — a day counts when you finish a lesson or 3 interactive problems.
- **Mobile-first**, responsive, keyboard-navigable, and `prefers-reduced-motion` aware.

## Tech stack

- **React 19 + TypeScript + Vite 8**
- **Tailwind CSS v4** for the design system
- **Firebase** — Auth + Firestore (progress/streaks); catalog content is bundled
- **React Router 7** for routing
- `lucide-react` (icons) and `canvas-confetti` (celebration)

## Architecture

```
src/
  content/            Bundled, typed lesson content (the "content model")
    dynamic-programming/  course meta + lesson1..4
  components/
    interactive/      StairGrid, ArrayRow, RangeSelector, MultipleChoice
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

Key idea: **a lesson is structured data, not HTML.** Each slide declares a `type`, a `component`, `props`, and a `validation` rule. The same generic widgets render any lesson, and all answer-checking lives in [`src/lib/validation.ts`](src/lib/validation.ts) keyed off `validation.type`. This is what makes lessons easy to add by hand today — and easy for AI to generate in a later phase.

## Data model (Firestore)

Each user can read/write only their own subtree (see [`firestore.rules`](firestore.rules)):

```
users/{uid}                              profile, streak, totals
users/{uid}/courseProgress/{courseId}    percent, current lesson/slide, completed lessons
users/{uid}/lessonProgress/{lessonId}    slide index, completed slides, status
```

## Getting started

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

In the Firebase console, enable **Authentication → Email/Password and Google**, and create a **Firestore** database. The project (`brilliant-clone-5c704`) is already referenced in [`.firebaserc`](.firebaserc).

### 3. Run

```bash
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint     # oxlint
```

## Deploy (Firebase Hosting)

```bash
firebase login
firebase deploy            # deploys hosting, Firestore rules, and auth config
# or: npm run deploy       # build + deploy in one step
```

Hosting serves the built `dist/` as a single-page app (see [`firebase.json`](firebase.json)).

**Deployed app:** _add your Hosting URL here after the first deploy._

## Course: Dynamic Programming

1. **Can You Reach the Top?** — discover reachability bottom-up on a staircase (jumps of 3 or 5).
2. **From Stairs to Arrays** — map the staircase onto a boolean `reachable[]` array.
3. **Changing the Rules** — transfer the pattern to jumps of 2/3/4 and reason about the look-back window.
4. **The DP Mindset** — name the pattern and bridge to a tabulation loop (capstone: jumps of 1/4/6).
