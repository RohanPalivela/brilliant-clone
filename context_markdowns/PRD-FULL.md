# Product Requirements Document: Brilliant Clone

**Version:** 1.0  
**Status:** Draft  
**Last updated:** June 23, 2026  
**Reference product:** [Brilliant.org](https://brilliant.org)  
**Companion doc:** [`PRD.md`](./PRD.md) (initial scope notes)

---

## 1. Executive Summary

This product is a **Brilliant.org-style interactive learning platform** focused on STEM concepts taught through hands-on problem solving rather than passive video lectures. The core experience is: open a lesson, manipulate visual elements, answer questions, receive instant feedback, and build intuition step by step.

For the initial release, the catalog contains **one course: Dynamic Programming**, designed for a high-school student preparing for competitive programming. The platform shell (navigation, progress, lesson engine, persistence) is modeled closely on Brilliant's real product patterns so it can scale to additional courses and Learning Paths later.

**Tagline (Brilliant-aligned):** *Learn by doing.*

**Tech stack:** React (web) + Firebase (Auth, Firestore, Hosting).

---

## 2. Problem Statement

Students learning advanced competitive programming topics (like dynamic programming) often encounter:

- Dense textbook explanations that assume prior intuition
- LeetCode-style problem banks with little scaffolding
- Passive video content that feels complete but does not build transferable understanding

Brilliant solves this with **interactive, bite-sized lessons** where learners discover concepts by solving puzzles first and generalizing later. This clone applies that same pedagogy to dynamic programming, starting from bottom-up reasoning rather than jumping straight to memoization syntax.

---

## 3. Product Principles

These principles are taken directly from how Brilliant positions and builds its product. Every feature decision should be evaluated against them.

| Principle | What it means in practice |
|---|---|
| **Learn by doing** | Lessons are problem-first. Explanations follow interaction, not the other way around. |
| **One concept per screen** | Each slide teaches or tests exactly one idea. Minimal prose; maximum manipulation. |
| **Instant feedback** | Every answer is validated immediately. Wrong answers trigger guided correction, not dead ends. |
| **Visual and interactive** | Abstract ideas (arrays, state transitions, recurrences) are represented as draggable, clickable visuals. |
| **Bite-sized sessions** | A lesson should be completable in ~10–20 minutes. Progress is saved mid-lesson. |
| **Progress you can see** | Course maps, progress bars, and "continue where you left off" are always visible. |
| **Motivation through habit** | Streaks and completion celebrations reinforce daily practice (MVP: streaks + congrats screens; leagues/XP in a later phase). |
| **Sequential mastery (free tier behavior)** | Learners work through lessons in order; later lessons assume earlier ones (matches Brilliant free-user flow). |

---

## 4. Target Users

### 4.1 Primary Persona — Competitive HS Student

**Name:** Alex  
**Age:** 16 (junior in high school)  
**Goal:** Understand dynamic programming well enough to solve easy DP problems on USACO / Codeforces  
**Context:** Has basic programming knowledge (loops, arrays, functions) but finds DP tutorials overwhelming  
**Frustrations:** Memoization articles feel like magic; wants to *see* why a state is reachable  
**Success looks like:** Can identify subproblems, build a boolean/integer DP table bottom-up, and explain transitions in words

### 4.2 Secondary Personas (future, not MVP blockers)

| Persona | Need |
|---|---|
| **Curious lifelong learner** | Self-paced exploration of CS topics without formal prerequisites |
| **Parent / teacher** | Visibility into student progress (Brilliant for Educators-style dashboard — future) |
| **Peer competitor** | XP leagues and weekly leaderboards (future) |

---

## 5. Scope

### 5.1 MVP (v1)

- Firebase Authentication (email + Google)
- 4 core pages: **Home**, **Courses**, **Course Detail**, **Profile**
- Lesson player with slide-based navigation, progress persistence, and completion flow
- **One course:** Dynamic Programming (sequential lessons)
- Mobile-responsive web layout
- Streak tracking (simplified Brilliant model)
- Course + lesson progress stored in Firestore

### 5.2 Explicitly Out of Scope for v1

| Feature | Notes |
|---|---|
| Koji AI tutor | Brilliant's contextual AI helper — future phase |
| Premium / paywall | No subscription logic in v1 |
| Learning Paths catalog | Only one course; path UI can be stubbed |
| Leagues & XP leaderboards | Future gamification layer |
| Native iOS / Android apps | Web-first; responsive design only |
| Offline mode | Requires network (matches Brilliant today) |
| Certificates / accreditation | Not part of Brilliant's core value prop either |
| Educator dashboard | Future |
| Multiple subjects (Math, Science, etc.) | Catalog architecture supports it; content does not ship in v1 |

### 5.3 Future Phases (Brilliant parity targets)

1. **v1.1** — XP on lesson completion, lesson redo/review from course page  
2. **v1.2** — Practice sets between lessons (Brilliant "checkpoints")  
3. **v2** — Learning Paths UI, additional CS courses (Greedy, Graphs)  
4. **v3** — Koji-style AI hint system with access to on-screen interactive state  
5. **v4** — Leagues, streak charges, daily goals, push notifications  

---

## 6. Information Architecture

```
App
├── Home (dashboard)
├── Courses (catalog)
│   └── Course Detail (lesson path)
│       └── Lesson Player (slide sequence)
│           └── Lesson Complete (congrats + XP stub)
├── Profile (account + stats)
└── Auth (sign in / sign up — modal or dedicated route)
```

### Global Navigation (Brilliant-style)

Persistent top nav on authenticated pages:

| Nav item | Route | Purpose |
|---|---|---|
| Home | `/` | Continue learning, streak, in-progress courses |
| Courses | `/courses` | Browse catalog (single DP course in v1) |
| Profile | `/profile` | Account info, stats, settings |

Lesson player uses a **minimal chrome** header: back/close, lesson title, slide progress indicator (e.g., dots or `3 / 12`), optional streak icon.

---

## 7. Page Specifications

### 7.1 Home (`/`)

**Purpose:** Brilliant's home page is a personalized dashboard — not a marketing landing page. It answers: *What should I do next?*

#### Layout sections

1. **Greeting + streak row**
   - "Good evening, Alex" (time-aware optional)
   - Streak flame icon + count (e.g., "🔥 4 day streak")
   - Streak rules (Brilliant-aligned): completing **one full lesson** OR **3 interactive problems** in a day extends the streak

2. **Continue learning (primary CTA)**
   - Card for the active course with:
     - Course title: *Dynamic Programming*
     - Current lesson number + name (e.g., "Lesson 2 · Reachability on the Stairs")
     - Course-level progress bar (% of lessons completed)
     - **Continue** button → deep-links to exact slide in current lesson

3. **Your courses**
   - Grid/list of enrolled or started courses (v1: only DP)
   - Each card shows: title, short description, progress bar, lesson count

4. **Recommended next** (optional v1 stub)
   - Placeholder for future Learning Path suggestions

#### Empty state (new user)

- Welcome message
- Single prominent card: "Start Dynamic Programming" → Courses page or directly into Lesson 1

#### Data dependencies

- `users/{uid}` — display name, streak count, last activity date
- `users/{uid}/courseProgress/{courseId}` — current lesson, slide index, percent complete

---

### 7.2 Courses (`/courses`)

**Purpose:** Catalog browsing. On Brilliant, this page also surfaces **Learning Paths** (grouped course sequences). In v1, show a simplified catalog with one featured course.

#### Layout

1. **Page header**
   - Title: "Courses"
   - Subtitle: "Interactive lessons in math and computer science" (Brilliant tone)

2. **Learning Path strip (visual only in v1)**
   - Label: "Programming & CS"
   - Description: "Build computational thinking from first principles"
   - Contains one course card: **Dynamic Programming**

3. **Course card**
   - Title, 1–2 sentence description
   - Estimated time (e.g., "~45 min · 4 lessons")
   - Progress bar if started
   - Difficulty tag: "Intermediate"
   - CTA: "Start" or "Continue"

#### Behavior

- Tapping a course → Course Detail page
- Free-user rule (future): sequential lesson locking. **v1:** all lessons visible but recommended order enforced via UI (locked icon on future lessons optional)

---

### 7.3 Course Detail (`/courses/:courseId`)

**Purpose:** Brilliant's course page shows the full lesson path — a vertical or winding sequence of nodes representing lessons, with clear completed / current / locked states.

#### Header

- Course title: **Dynamic Programming**
- Course description (2–3 sentences):
  > Build intuition for dynamic programming from the ground up. You'll explore reachability, state transitions, and tabulation through interactive puzzles — before writing a single `memo` function.
- Overall progress bar
- Stats row: `X of Y lessons completed` · `~Z min remaining`

#### Lesson path

Sequential list or path visualization. Each lesson node shows:

| State | Visual |
|---|---|
| Completed | Checkmark, full color |
| In progress | Highlighted, "Continue" badge |
| Not started | Muted, lesson number visible |
| Locked (optional v1) | Grayed with lock icon |

Each lesson row/card includes:
- Lesson number + title
- Estimated duration (e.g., "12 min")
- **Redo / Review** icon on completed lessons (Brilliant has this — can ship in v1.1)

#### Actions

- **Start course** / **Continue** → first incomplete lesson
- Tapping a completed lesson → review mode (read-only or redo from start)

---

### 7.4 Lesson Player (`/courses/:courseId/lessons/:lessonId`)

**Purpose:** The core Brilliant experience. A full-screen, distraction-minimized player that walks the learner through slides one at a time.

#### Chrome

| Element | Behavior |
|---|---|
| Close / back | Returns to Course Detail (confirm if mid-slide with unsaved work — progress auto-saves) |
| Progress | Slide counter `4 / 11` or segmented progress bar |
| Title | Lesson name (truncated on mobile) |

#### Slide types

Each lesson is an ordered array of slides. Each slide has **one** purpose:

| Type | Description | Brilliant parallel |
|---|---|---|
| `prompt` | Short question + interactive widget; learner must answer correctly to advance | Problem-first opener |
| `explore` | Manipulable visualization; no strict answer required; "Continue" when ready | Exploration / simulation |
| `explain` | Brief concept reveal with optional animation; minimal text | Explanation step after struggle |
| `checkpoint` | Multiple-choice or select-all; instant feedback | Knowledge check |
| `celebrate` | Sub-lesson milestone (optional) | Mid-lesson encouragement |

#### Interaction rules

- **Advance gate:** On `prompt` and `checkpoint` slides, the "Continue" button is disabled until the answer is correct (or user completes required interaction)
- **Wrong answer feedback:** Inline message explaining *why* wrong; no punitive language. Optionally highlight relevant UI elements (Brilliant often animates the correction)
- **Hints (v1):** Static text hint button, 1–2 hints per slide max (Koji replacement)
- **Auto-save:** On every slide transition, persist `lessonId`, `slideIndex`, `completedSlideIds`, timestamp

#### End of lesson — Congrats screen

Brilliant shows celebratory animation + XP. v1 includes:

- Full-screen congrats: "Lesson complete!"
- Summary: problems answered, time spent (optional)
- Course progress update animation
- Streak update if applicable ("🔥 Streak extended!")
- CTAs: **Next lesson** (if exists) · **Back to course**

---

### 7.5 Profile (`/profile`)

**Purpose:** Account management and learning stats (Brilliant profile is lightweight — not a social network).

#### Sections

1. **Account**
   - Display name, email
   - Sign out

2. **Learning stats**
   - Current streak
   - Lessons completed (total)
   - Courses in progress

3. **Settings (minimal v1)**
   - Notification preferences (stub)
   - Theme: follow system / light / dark (optional)

---

## 8. Lesson Content Design Standards

These rules mirror how Brilliant authors structure lessons.

1. **Problem before lecture** — Open with a puzzle the learner can attempt before seeing the general rule.
2. **Minimal wording** — Prefer labels, highlights, and motion over paragraphs. No slide should require more than ~3 sentences of reading.
3. **One concept per slide** — If a slide needs "and also," split it.
4. **Concrete → abstract** — Stairs before arrays; arrays before recurrence notation.
5. **Immediate validation** — Every interactive slide checks the answer on-device (rules in slide config), not free-form text entry for v1.
6. **Iterative difficulty** — Same mechanic, new numbers (3/5 steps → 2–4 steps).
7. **Bottom-up first** — Introduce DP as tabulation / reachability before top-down memoization (aligns with user's pedagogical direction).

### Feedback copy tone

- Correct: "Nice!" / "That's right." / "Exactly."
- Incorrect: "Not quite — notice that..." + visual cue
- Never: "Wrong!" / "Failed"

---

## 9. Course: Dynamic Programming

**Course ID:** `dynamic-programming`  
**Audience:** HS junior+ with basic programming  
**Prerequisites:** Loops, arrays, booleans  
**Lessons:** 4 (v1)  
**Pedagogical arc:** Reachability → tabulation → generalization → pattern recognition

---

### Lesson 1: Can You Reach the Top?

**Goal:** Discover that reachability can be built step-by-step from the ground up.

| Slide | Type | Content |
|---|---|---|
| 1 | `prompt` | **Setup:** You start on the ground (height 0). You can jump exactly **3** or **5** steps at a time. Can you land on step **11**? Show 11 contiguous stair blocks (heights 1–11) plus ground (0). |
| 2 | `explore` | **Interactive stairs:** User taps a step to mark it ✓ (reachable) or ✗ (not reachable). Clicking step *n* highlights steps *n−3* and *n−5* (outline/glow) so the learner sees which prior states matter. Drag-to-mark is also supported. |
| 3 | `checkpoint` | **Verify:** User submits their marking for step 11. Validate against correct reachability set. |
| 4 | `explain` | **Reveal:** "Dynamic programming builds answers from the bottom up. To know if step 11 is reachable, you only need to check steps 6 and 8." Animate the dependency arrows. |
| 5 | `celebrate` | Mini milestone copy. |

**Interaction spec (Slide 2–3):**

- Stair visualization: 12 positions (0–11); 0 is always ✓
- Tap toggles: empty → ✓ → ✗ → empty
- On select of step `n`, highlight `{n-3, n-5}` where indices ≥ 0
- Validation logic: `reachable[0] = true`; `reachable[n] = reachable[n-3] \|\| reachable[n-5]` (with bounds checks)

---

### Lesson 2: From Stairs to Arrays

**Goal:** Map the stair mental model to a boolean array representation.

| Slide | Type | Content |
|---|---|---|
| 1 | `explain` | Morph stairs into a horizontal array `reachable[]` where index = height. Animate each stair snapping into a cell. |
| 2 | `explore` | Array cells mirror stair interaction: tap to toggle ✓/✗. Same highlight behavior on prior indices. |
| 3 | `prompt` | Given jumps of 3 and 5, user fills the array for heights 0–11 using the UI (not code). |
| 4 | `checkpoint` | Multiple choice: "What values do we need to compute `reachable[11]`?" → `{reachable[8], reachable[6]}` |
| 5 | `explain` | Introduce recurrence in plain language: `reachable[i] = reachable[i-3] OR reachable[i-5]` (when indices valid). No code editor in v1. |

---

### Lesson 3: Changing the Rules

**Goal:** Transfer the pattern to a new jump set without hand-holding.

| Slide | Type | Content |
|---|---|---|
| 1 | `prompt` | New rule: jumps of **2, 3, or 4** steps. Can you reach step 11? Fresh stair/array UI. |
| 2 | `explore` | **Range selector interaction:** Two draggable handles on a number line (positions 1–10) define the "look-back window" for computing `F(11)`. Learner drags circles to indicate which prior states they must check. Handles cannot overlap; range represents `{i-2, i-3, i-4}`. |
| 3 | `checkpoint` | "Which indices matter for `F(11)`?" — validate range `{7, 8, 9}`. |
| 4 | `prompt` | Full reachability pass: user marks or auto-fills array; validate entire solution. |
| 5 | `explain` | Generalize: "For any step `i`, look back at all allowed jump sizes." |

---

### Lesson 4: The DP Mindset

**Goal:** Name the pattern and connect to competitive programming.

| Slide | Type | Content |
|---|---|---|
| 1 | `explain` | Define DP in one sentence: *Build solutions to big problems from solutions to smaller subproblems.* |
| 2 | `checkpoint` | Select-all: which problems are DP-shaped? (reachability, fibonacci, knapsack-lite scenarios described in words) |
| 3 | `prompt` | Capstone puzzle: new jump set `{1, 4, 6}`, target 12 — user solves with array UI. |
| 4 | `explain` | Bridge to code: show pseudocode tabulation loop (read-only). "Next step: implement this in your language of choice." |
| 5 | `celebrate` | Course milestone congrats. |

---

## 10. Interactive Component Library (v1)

Reusable widgets referenced across lessons:

| Component | Props / behavior |
|---|---|
| `StairGrid` | `steps`, `jumpSizes`, `value[]`, `onChange`, `highlightIndices` |
| `ArrayRow` | Boolean/array cell row; syncs with `StairGrid` logic |
| `RangeSelector` | `min`, `max`, dual handles, `onRangeChange` |
| `MultipleChoice` | `options[]`, `correctIds`, single or multi-select |
| `ProgressBar` | `value`, `max`, label |
| `SlideContainer` | Layout wrapper, handles advance gate |
| `FeedbackBanner` | Correct / incorrect states with copy |

All validation rules live in slide config JSON (Firestore or bundled), not hardcoded in components.

---

## 11. Data Model (Firestore)

### 11.1 Collections

```
users/{uid}
  displayName: string
  email: string
  createdAt: timestamp
  streak: number
  lastActivityDate: string   // YYYY-MM-DD for streak calc
  streakCharges: number      // default 0; future use
  lessonsCompletedToday: number
  totalLessonsCompleted: number

users/{uid}/courseProgress/{courseId}
  courseId: string
  startedAt: timestamp
  updatedAt: timestamp
  percentComplete: number    // 0-100
  currentLessonId: string
  currentSlideIndex: number
  completedLessonIds: string[]

users/{uid}/lessonProgress/{lessonId}
  lessonId: string
  courseId: string
  startedAt: timestamp
  completedAt: timestamp | null
  currentSlideIndex: number
  completedSlideIds: string[]
  status: "not_started" | "in_progress" | "completed"

courses/{courseId}                    // read-only catalog
  title: string
  description: string
  subject: "computer-science"
  difficulty: "beginner" | "intermediate" | "advanced"
  lessonOrder: string[]
  estimatedMinutes: number

courses/{courseId}/lessons/{lessonId}
  title: string
  order: number
  estimatedMinutes: number
  slides: Slide[]                    // slide config array
```

### 11.2 Slide schema (embedded in lesson doc)

```typescript
type Slide = {
  id: string;
  type: "prompt" | "explore" | "explain" | "checkpoint" | "celebrate";
  component: "StairGrid" | "ArrayRow" | "RangeSelector" | "MultipleChoice" | "RichText";
  props: Record<string, unknown>;
  validation?: {
    type: "reachability" | "multipleChoice" | "range" | "none";
    correctAnswer: unknown;
  };
  hint?: string;
  explanationOnWrong?: string;
};
```

### 11.3 Persistence rules

- Auto-save on slide change (debounced 500ms)
- On lesson complete: update `lessonProgress`, `courseProgress`, user streak fields
- Progress syncs across devices via Firestore real-time listener on `courseProgress`

---

## 12. Authentication

Brilliant supports email, Google, and Apple sign-in. **v1 requirements:**

| Method | Priority |
|---|---|
| Google (Firebase) | P0 |
| Email / password | P0 |
| Apple | P2 (future) |

Unauthenticated users can browse course marketing copy on `/courses` but cannot start lessons.

---

## 13. Gamification (Brilliant-aligned)

### 13.1 Streaks (MVP)

| Rule | Detail |
|---|---|
| Qualifying activity | Complete 1 lesson OR 3 checked interactive problems in a calendar day |
| Display | Home + Profile |
| Reset | Miss a day → streak = 0 (streak charges deferred to v1.2) |

### 13.2 XP & Leagues (deferred)

Brilliant awards XP per lesson, resets weekly XP for league competition (30 learners per group, 10 league tiers). Document for future implementation; stub `+10 XP` on congrats screen in v1 optional.

---

## 14. Visual & UX Guidelines

### 14.1 Brilliant design language (reference)

- Clean white / soft gray backgrounds
- Rounded cards with subtle shadows
- Generous whitespace; content centered on lesson slides
- Primary action: solid filled button (Brilliant uses dark navy / black CTAs)
- Progress indicators: segmented bars or dot steppers
- Celebratory moments: confetti or bounce animation (lightweight CSS)

### 14.2 Responsive breakpoints

| Breakpoint | Layout |
|---|---|
| Mobile `< 640px` | Single column; lesson player full viewport; stair cells scroll horizontally if needed |
| Tablet `640–1024px` | Two-column course cards |
| Desktop `> 1024px` | Max content width ~960px centered |

### 14.3 Accessibility (baseline)

- Keyboard navigable interactive elements
- `aria-label` on stair cells and toggles
- Color is not the only indicator (use ✓ / ✗ icons)
- Respect `prefers-reduced-motion`

---

## 15. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Lesson player first slide interactive in < 2s on 4G |
| Availability | Firebase SLA; graceful offline message |
| Security | Firestore rules: users read/write only their own progress |
| Privacy | No chat logs; minimal PII (email, display name) |
| Browser support | Latest Chrome, Safari, Firefox, Edge (evergreen) |

---

## 16. Analytics (recommended events)

| Event | When |
|---|---|
| `lesson_started` | First slide viewed |
| `slide_completed` | Advance to next slide |
| `answer_submitted` | `{ correct: boolean, slideId }` |
| `lesson_completed` | Congrats screen shown |
| `streak_updated` | `{ count }` |

Firebase Analytics or a lightweight custom log table.

---

## 17. Success Metrics

| Metric | v1 target |
|---|---|
| Lesson 1 completion rate | > 60% of users who start |
| Course completion rate | > 30% of users who finish Lesson 1 |
| Day-7 retention | > 20% (requires streak hook) |
| Avg. session length | 12–18 min (matches Brilliant lesson sizing) |
| Mobile usage | > 40% of sessions |

---

## 18. Open Questions

1. Should later lessons be **hard-locked** until prior completion (Brilliant free tier) or just **recommended** in v1?
2. Ship **redo lesson** in v1 or v1.1?
3. Bundle slide configs in the client build vs. serve from Firestore (affects content update workflow)?
4. Dark mode in v1 or defer?

---

## 19. Appendix A — Brilliant Feature Mapping

| Brilliant feature | This product (v1) |
|---|---|
| Interactive lesson slides | ✅ Lesson player |
| Course path visualization | ✅ Course Detail |
| Home "continue learning" | ✅ Home |
| Progress persistence | ✅ Firestore |
| Streaks | ✅ Simplified |
| Learning Paths | 🔶 Stub on Courses page |
| Practice sets | ❌ v1.2 |
| XP & Leagues | ❌ v1.1+ |
| Koji AI tutor | ❌ v3 |
| Premium / daily limits | ❌ Not in scope |
| Mobile apps | ❌ Web responsive only |

---

## 20. Appendix B — User Stories

| ID | Story | Acceptance criteria |
|---|---|---|
| US-01 | As Alex, I want to see where I left off so I can resume in one tap | Home card shows lesson + slide; Continue opens exact slide |
| US-02 | As Alex, I want to mark stair reachability interactively so I can discover the DP pattern myself | StairGrid toggles work; highlights show n−3 and n−5 |
| US-03 | As Alex, I want instant feedback when I'm wrong so I learn without getting stuck | Wrong answers show explanation; UI highlights relevant cells |
| US-04 | As Alex, I want a congrats screen after each lesson so I feel progress | Congrats screen with next-lesson CTA |
| US-05 | As Alex, I want my progress saved automatically so I can switch devices | Firestore persists slide index; reload resumes correctly |
| US-06 | As Alex, I want to use this on my phone between classes | Layout works at 375px width; touch targets ≥ 44px |

---

*This document is the source of truth for v1 implementation. Update [`PRD.md`](./PRD.md) only for quick scratch notes; keep structured requirements here.*
