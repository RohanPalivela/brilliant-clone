import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { Course, Lesson } from '../../types/content';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'test-uid' } }),
}));

vi.mock('../../data/progressService', () => ({
  saveSlideProgress: vi.fn().mockResolvedValue(undefined),
  recordProblemSolved: vi.fn().mockResolvedValue(undefined),
  completeLesson: vi.fn().mockResolvedValue({
    streakExtended: false,
    newStreak: 0,
    percentComplete: 0,
    alreadyCompleted: false,
  }),
}));

vi.mock('../../lib/aiTutor/config', () => ({
  isTutorConfigured: () => true,
  getTutorConfig: () => ({ apiKey: 'sk', baseUrl: 'http://x/v1', model: 'm' }),
}));

const streamTutorReply = vi.fn();
vi.mock('../../lib/aiTutor/client', () => ({
  streamTutorReply: (...args: unknown[]) => streamTutorReply(...args),
  TutorError: class extends Error {},
}));

import * as progress from '../../data/progressService';
import { LessonPlayer } from './LessonPlayer';
import { TutorProvider } from '../../context/TutorProvider';

const lesson: Lesson = {
  id: 'l1',
  courseId: 'c1',
  title: 'Staircase',
  order: 1,
  estimatedMinutes: 5,
  slides: [
    { id: 's1', type: 'explain', component: 'RichText', props: { heading: 'Intro slide' }, validation: { type: 'none' } },
    {
      id: 's2',
      type: 'checkpoint',
      component: 'MultipleChoice',
      props: { question: 'Reachable?', options: [{ id: 'y', label: 'Yes' }, { id: 'n', label: 'No' }] },
      validation: { type: 'multipleChoice', correctIds: ['n'] },
    },
    { id: 's3', type: 'celebrate', component: 'RichText', props: { heading: 'Done slide' }, validation: { type: 'none' } },
  ],
};

const course: Course = {
  id: 'c1',
  title: 'DP',
  shortDescription: 's',
  description: 'd',
  subject: 'computer-science',
  difficulty: 'beginner',
  estimatedMinutes: 5,
  lessonOrder: ['l1'],
  lessons: [lesson],
};

function renderPlayer(initialSlideIndex: number) {
  return render(
    <MemoryRouter>
      <TutorProvider>
        <LessonPlayer
          course={course}
          lesson={lesson}
          initialSlideIndex={initialSlideIndex}
          initialMaxReached={initialSlideIndex}
          initialCompletedSlideIds={[]}
        />
      </TutorProvider>
    </MemoryRouter>,
  );
}

async function jumpViaTutor(slideId: string, highlight?: string) {
  const user = userEvent.setup();
  const directive: Record<string, string> = { lessonId: 'l1', slideId, reason: 'recap' };
  if (highlight) directive.highlight = highlight;
  streamTutorReply.mockResolvedValue(
    `Let’s look at that.\n\`\`\`tutor-nav\n${JSON.stringify(directive)}\n\`\`\``,
  );
  await user.click(screen.getByRole('button', { name: /open ai tutor/i }));
  await user.type(screen.getByRole('textbox', { name: /message the tutor/i }), 'help me');
  await user.click(screen.getByRole('button', { name: /send message/i }));
  const jumpBtn = await screen.findByRole('button', { name: /take me to/i });
  await user.click(jumpBtn);
  return user;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LessonPlayer + tutor navigation', () => {
  it('leads the learner to an earlier slide and offers a one-tap return', async () => {
    renderPlayer(1); // start on the gated MultipleChoice slide (s2)
    expect(screen.getByText('Reachable?')).toBeInTheDocument();

    const user = await jumpViaTutor('s1'); // jump back to the intro

    expect(await screen.findByText('Intro slide')).toBeInTheDocument();
    const returnBtn = await screen.findByRole('button', { name: /back to step 2/i });

    await user.click(returnBtn);
    expect(await screen.findByText('Reachable?')).toBeInTheDocument();
  });

  it('spotlights the phrase the tutor asked to highlight on the destination slide', async () => {
    renderPlayer(1); // start on the MultipleChoice slide
    await jumpViaTutor('s1', 'Intro'); // jump to the intro and spotlight "Intro"

    // The heading's accessible name is still the full text, but the matched
    // phrase inside it is wrapped in the spotlight mark.
    const heading = await screen.findByRole('heading', { name: /intro slide/i });
    const mark = heading.querySelector('mark.tutor-highlight');
    expect(mark).not.toBeNull();
    expect(mark?.textContent).toBe('Intro');
  });

  it('clears the spotlight once the learner moves on', async () => {
    renderPlayer(0);
    await jumpViaTutor('s3', 'Done'); // forward jump, spotlight "Done"
    const done = await screen.findByRole('heading', { name: /done slide/i });
    expect(done.querySelector('mark.tutor-highlight')).not.toBeNull();

    // The return pill takes them back; the spotlight should not persist.
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /back to step 1/i }));
    const intro = await screen.findByRole('heading', { name: /intro slide/i });
    expect(intro.querySelector('mark.tutor-highlight')).toBeNull();
  });

  it('never inflates saved progress when the tutor jumps the learner forward (#6)', async () => {
    const { unmount } = renderPlayer(0); // genuine progress: slide 0
    expect(screen.getByText('Intro slide')).toBeInTheDocument();

    await jumpViaTutor('s3'); // peek forward to the last slide
    expect(await screen.findByText('Done slide')).toBeInTheDocument();

    // Leaving flushes progress. It must record the furthest *genuinely* reached
    // slide (0), not the slide the tutor peeked to (2).
    unmount();

    const calls = (progress.saveSlideProgress as unknown as { mock: { calls: unknown[][] } })
      .mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      expect(call[3]).toBe(0);
    }
  });
});
