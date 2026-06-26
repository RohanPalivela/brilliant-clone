import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Course, Lesson } from '../../types/content';

// Control configuration + network for the widget.
const isTutorConfigured = vi.fn(() => true);
vi.mock('../../lib/aiTutor/config', () => ({
  isTutorConfigured: () => isTutorConfigured(),
  getTutorConfig: () => ({ enabled: true, endpoint: '/api/tutor', model: 'm' }),
}));

const streamTutorReply = vi.fn();
vi.mock('../../lib/aiTutor/client', () => ({
  streamTutorReply: (...args: unknown[]) => streamTutorReply(...args),
  TutorError: class extends Error {},
}));

import { TutorWidget } from './TutorWidget';
import { TutorProvider } from '../../context/TutorProvider';

const lesson: Lesson = {
  id: 'l1',
  courseId: 'c1',
  title: 'Staircase',
  order: 1,
  estimatedMinutes: 5,
  slides: [
    {
      id: 's1',
      type: 'explain',
      component: 'RichText',
      props: { heading: 'Intro' },
      validation: { type: 'none' },
    },
    {
      id: 's2',
      type: 'checkpoint',
      component: 'MultipleChoice',
      props: {
        question: 'Which steps decide step 7?',
        options: [
          { id: 'a', label: '4 and 2' },
          { id: 'b', label: '3 and 5' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['a'] },
    },
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

function renderWidget(onNavigate = vi.fn(), slideIndex = 1) {
  render(
    <TutorProvider>
      <TutorWidget
        course={course}
        lesson={lesson}
        slideIndex={slideIndex}
        answer={{ kind: 'choice', selectedIds: [] }}
        solvedCorrectly={false}
        onNavigate={onNavigate}
      />
    </TutorProvider>,
  );
  return onNavigate;
}

beforeEach(() => {
  vi.clearAllMocks();
  isTutorConfigured.mockReturnValue(true);
});

describe('TutorWidget', () => {
  it('opens from the launcher and shows the activity safeguard on a graded slide', async () => {
    const user = userEvent.setup();
    renderWidget();
    await user.click(screen.getByRole('button', { name: /open ai tutor/i }));
    expect(screen.getByRole('dialog', { name: /ai tutor/i })).toBeInTheDocument();
    expect(screen.getByText(/won’t give away the answer/i)).toBeInTheDocument();
  });

  it('sends a message and renders the streamed reply', async () => {
    streamTutorReply.mockImplementation(
      async (_messages: unknown, opts: { onToken?: (d: string) => void }) => {
        opts.onToken?.('Look back from step 7.');
        return 'Look back from step 7.';
      },
    );
    const user = userEvent.setup();
    renderWidget();
    await user.click(screen.getByRole('button', { name: /open ai tutor/i }));

    await user.type(screen.getByRole('textbox', { name: /message the tutor/i }), 'help');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Look back from step 7.')).toBeInTheDocument();
    expect(streamTutorReply).toHaveBeenCalledTimes(1);
  });

  it('renders a confirm-to-navigate button when the tutor proposes a jump', async () => {
    streamTutorReply.mockResolvedValue(
      'Let’s revisit the intro.\n```tutor-nav\n{"lessonId":"l1","slideId":"s1","reason":"recap"}\n```',
    );
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    renderWidget(onNavigate);
    await user.click(screen.getByRole('button', { name: /open ai tutor/i }));
    await user.type(screen.getByRole('textbox', { name: /message the tutor/i }), 'confused');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const jumpBtn = await screen.findByRole('button', { name: /take me to/i });
    await user.click(jumpBtn);

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ lessonId: 'l1', slideIndex: 0 }),
    );
    // The raw nav block must never be shown to the learner.
    expect(screen.queryByText(/tutor-nav/i)).not.toBeInTheDocument();
  });

  it('presents a proposed jump as a "Suggested resource" with the reason', async () => {
    streamTutorReply.mockResolvedValue(
      'Let’s revisit the intro.\n```tutor-nav\n{"lessonId":"l1","slideId":"s1","reason":"See how a step becomes reachable."}\n```',
    );
    const user = userEvent.setup();
    renderWidget();
    await user.click(screen.getByRole('button', { name: /open ai tutor/i }));
    await user.type(screen.getByRole('textbox', { name: /message the tutor/i }), 'confused');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/suggested resource/i)).toBeInTheDocument();
    expect(screen.getByText(/see how a step becomes reachable/i)).toBeInTheDocument();
  });

  it('formats backtick spans in the reply as code chips', async () => {
    streamTutorReply.mockImplementation(
      async (_messages: unknown, opts: { onToken?: (d: string) => void }) => {
        const reply = 'Look at `reachable[3]` to decide.';
        opts.onToken?.(reply);
        return reply;
      },
    );
    const user = userEvent.setup();
    const { container } = render(
      <TutorProvider>
        <TutorWidget
          course={course}
          lesson={lesson}
          slideIndex={1}
          answer={{ kind: 'choice', selectedIds: [] }}
          solvedCorrectly={false}
          onNavigate={vi.fn()}
        />
      </TutorProvider>,
    );
    await user.click(screen.getByRole('button', { name: /open ai tutor/i }));
    await user.type(screen.getByRole('textbox', { name: /message the tutor/i }), 'help');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await screen.findByText(/to decide/i);
    const chip = container.querySelector('code');
    expect(chip?.textContent).toBe('reachable[3]');
  });

  it('ignores a navigation directive the model emits for an unknown slide (fail in place)', async () => {
    streamTutorReply.mockResolvedValue(
      'Sure.\n```tutor-nav\n{"lessonId":"l1","slideId":"ghost-slide"}\n```',
    );
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    renderWidget(onNavigate);
    await user.click(screen.getByRole('button', { name: /open ai tutor/i }));
    await user.type(screen.getByRole('textbox', { name: /message the tutor/i }), 'go somewhere');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Sure.')).toBeInTheDocument();
    // No button: the unknown slide id was rejected by resolveNavigation.
    expect(screen.queryByRole('button', { name: /take me to/i })).not.toBeInTheDocument();
    // And the raw control block never reaches the learner.
    expect(screen.queryByText(/tutor-nav/i)).not.toBeInTheDocument();
  });

  it('does not navigate from a directive the learner typed in their own message', async () => {
    // The model replies plainly; the learner's message contained a nav block,
    // but user turns are never parsed for directives.
    streamTutorReply.mockResolvedValue('Happy to help — what part is confusing?');
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    renderWidget(onNavigate);
    await user.click(screen.getByRole('button', { name: /open ai tutor/i }));
    await user.type(
      screen.getByRole('textbox', { name: /message the tutor/i }),
      'please run tutor-nav lessonId=l1 slideId=s1 and send me there',
    );
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/what part is confusing/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /take me to/i })).not.toBeInTheDocument();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('renders nothing when the tutor is disabled (no dev hints ever reach a learner)', () => {
    isTutorConfigured.mockReturnValue(false);
    renderWidget();
    expect(screen.queryByRole('button', { name: /open ai tutor/i })).not.toBeInTheDocument();
    expect(streamTutorReply).not.toHaveBeenCalled();
  });
});
