import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LessonPlayer } from './LessonPlayer';
import type { Course, Lesson } from '../../types/content';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'test-uid' } }),
}));

vi.mock('../../data/progressService', () => ({
  saveSlideProgress: vi.fn().mockResolvedValue(undefined),
  recordProblemSolved: vi.fn().mockResolvedValue(undefined),
  completeLesson: vi.fn().mockResolvedValue({
    streakExtended: true,
    newStreak: 3,
    percentComplete: 40,
    alreadyCompleted: false,
  }),
}));

vi.mock('../../data/reviewService', () => ({
  enrollReviewItem: vi.fn().mockResolvedValue(undefined),
  enrollSkillBank: vi.fn().mockResolvedValue(undefined),
  subscribeReviewItems: vi.fn(() => () => {}),
}));

import * as progress from '../../data/progressService';

const lesson: Lesson = {
  id: 'l1',
  courseId: 'c1',
  title: 'Test Lesson',
  order: 1,
  estimatedMinutes: 5,
  slides: [
    {
      id: 's1',
      type: 'explain',
      component: 'RichText',
      props: { heading: 'Intro slide' },
      validation: { type: 'none' },
    },
    {
      id: 's2',
      type: 'checkpoint',
      component: 'MultipleChoice',
      props: {
        question: 'Reachable?',
        options: [
          { id: 'y', label: 'Yes' },
          { id: 'n', label: 'No' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['n'] },
      explanationOnWrong: 'Look at the predecessors.',
    },
    {
      id: 's3',
      type: 'celebrate',
      component: 'RichText',
      props: { heading: 'Done slide' },
      validation: { type: 'none' },
    },
  ],
};

const course: Course = {
  id: 'c1',
  title: 'Test Course',
  shortDescription: 's',
  description: 'd',
  subject: 'computer-science',
  difficulty: 'beginner',
  estimatedMinutes: 5,
  lessonOrder: ['l1'],
  lessons: [lesson],
};

function renderPlayer(initialSlideIndex = 0) {
  return render(
    <MemoryRouter>
      <LessonPlayer
        course={course}
        lesson={lesson}
        initialSlideIndex={initialSlideIndex}
        initialCompletedSlideIds={[]}
      />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LessonPlayer gating', () => {
  it('shows Continue (not Check) on a non-gated slide and advances', async () => {
    const user = userEvent.setup();
    renderPlayer(0);
    expect(screen.getByText('Intro slide')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Check/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Continue/ }));
    // Advanced to the gated MultipleChoice slide.
    expect(screen.getByText('Reachable?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check/ })).toBeInTheDocument();
  });

  it('requires a correct answer before letting the learner continue', async () => {
    const user = userEvent.setup();
    renderPlayer(1);

    // Checking with nothing selected is wrong: feedback shows, still gated.
    await user.click(screen.getByRole('button', { name: /Check/ }));
    expect(screen.getByText('Look at the predecessors.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check/ })).toBeInTheDocument();

    // Pick the correct option and check again.
    await user.click(screen.getByText('No'));
    await user.click(screen.getByRole('button', { name: /Check/ }));

    expect(screen.getByText('Exactly — nice work!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/ })).toBeInTheDocument();
    expect(progress.recordProblemSolved).toHaveBeenCalledWith('test-uid');
    expect(progress.recordProblemSolved).toHaveBeenCalledTimes(1);
  });

  it('navigates back to the previous slide', async () => {
    const user = userEvent.setup();
    renderPlayer(1);
    expect(screen.getByText('Reachable?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Previous slide/ }));
    expect(screen.getByText('Intro slide')).toBeInTheDocument();
  });

  it('finishes the lesson and shows the congrats screen', async () => {
    const user = userEvent.setup();
    renderPlayer(2);
    await user.click(screen.getByRole('button', { name: /Finish lesson/ }));

    expect(await screen.findByText('Lesson complete!')).toBeInTheDocument();
    expect(progress.completeLesson).toHaveBeenCalledWith(
      'test-uid',
      course,
      lesson,
    );
  });
});
