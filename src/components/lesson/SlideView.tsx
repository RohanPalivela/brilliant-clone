import type { Slide, SlideAnswer } from '../../types/content';
import { StairGrid } from '../interactive/StairGrid';
import { ArrayRow } from '../interactive/ArrayRow';
import { RangeSelector } from '../interactive/RangeSelector';
import { MultipleChoice } from '../interactive/MultipleChoice';
import { CodeBlanks } from '../interactive/CodeBlanks';

interface SlideViewProps {
  slide: Slide;
  answer: SlideAnswer;
  onAnswer: (answer: SlideAnswer) => void;
  showMistakes: boolean;
}

function Prompt({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="mx-auto mb-8 max-w-lg text-center text-base leading-relaxed text-ink-soft">
      {text}
    </p>
  );
}

export function SlideView({ slide, answer, onAnswer, showMistakes }: SlideViewProps) {
  switch (slide.component) {
    case 'StairGrid':
      return (
        <div>
          <Prompt text={slide.props.prompt} />
          <StairGrid
            config={slide.props}
            answer={answer}
            onAnswer={onAnswer}
            showMistakes={showMistakes}
          />
        </div>
      );

    case 'ArrayRow':
      return (
        <div>
          <Prompt text={slide.props.prompt} />
          <ArrayRow
            config={slide.props}
            answer={answer}
            onAnswer={onAnswer}
            showMistakes={showMistakes}
          />
        </div>
      );

    case 'RangeSelector':
      return (
        <div>
          <Prompt text={slide.props.prompt} />
          <RangeSelector config={slide.props} answer={answer} onAnswer={onAnswer} />
        </div>
      );

    case 'CodeBlanks':
      return (
        <div>
          <Prompt text={slide.props.prompt} />
          <CodeBlanks
            config={slide.props}
            answer={answer}
            onAnswer={onAnswer}
            showMistakes={showMistakes}
            correct={
              slide.validation?.type === 'codeBlanks'
                ? slide.validation.correct
                : undefined
            }
          />
        </div>
      );

    case 'MultipleChoice':
      return (
        <MultipleChoice
          config={slide.props}
          answer={answer}
          onAnswer={onAnswer}
          showMistakes={showMistakes}
          correctIds={
            slide.validation?.type === 'multipleChoice'
              ? slide.validation.correctIds
              : []
          }
        />
      );

    case 'RichText': {
      const { heading, body, emphasis, bullets, pseudocode, visual } = slide.props;
      const visualConfig = visual
        ? {
            steps: visual.steps,
            jumpSizes: visual.jumpSizes,
            editable: false,
            showSolution: true,
            highlightIndices: visual.highlightIndices,
            display: visual.display,
          }
        : null;
      const noop = () => {};
      return (
        <div className="mx-auto max-w-lg text-center">
          {heading && (
            <h2 className="mb-4 text-2xl font-bold text-ink">{heading}</h2>
          )}
          {emphasis && (
            <p className="mx-auto mb-4 max-w-md rounded-xl bg-brand-soft px-5 py-4 text-base font-semibold text-brand">
              {emphasis}
            </p>
          )}
          {body && (
            <p className="text-base leading-relaxed text-ink-soft">{body}</p>
          )}
          {bullets && bullets.length > 0 && (
            <ul className="mx-auto mt-4 flex max-w-md flex-col gap-2 text-left text-sm text-ink-soft">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand">•</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
          {visualConfig && (
            <div className="mt-6">
              {visual!.component === 'ArrayRow' ? (
                <ArrayRow config={visualConfig} answer={{ kind: 'none' }} onAnswer={noop} />
              ) : (
                <StairGrid config={visualConfig} answer={{ kind: 'none' }} onAnswer={noop} />
              )}
            </div>
          )}
          {pseudocode && (
            <pre className="mt-5 overflow-x-auto rounded-xl bg-cta px-5 py-4 text-left font-mono text-sm leading-relaxed text-white">
              <code>{pseudocode}</code>
            </pre>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}
