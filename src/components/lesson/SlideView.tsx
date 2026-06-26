import type { Slide, SlideAnswer } from '../../types/content';
import { StairGrid } from '../interactive/StairGrid';
import { ArrayRow } from '../interactive/ArrayRow';
import { StairsToArray } from '../interactive/StairsToArray';
import { StaircaseWalkthrough } from '../interactive/StaircaseWalkthrough';
import { RangeSelector } from '../interactive/RangeSelector';
import { PredecessorPicker } from '../interactive/PredecessorPicker';
import { MultipleChoice } from '../interactive/MultipleChoice';
import { CodeBlanks } from '../interactive/CodeBlanks';
import { KnapsackPicker } from '../interactive/KnapsackPicker';
import { CoinBuilder } from '../interactive/CoinBuilder';
import { PathBuilder } from '../interactive/PathBuilder';
import { MinChoicePicker } from '../interactive/MinChoicePicker';
import { DPTable } from '../interactive/DPTable';
import { CoinSweep } from '../interactive/CoinSweep';
import { SubproblemIsolation } from '../interactive/SubproblemIsolation';
import { GreedyFailure } from '../interactive/GreedyFailure';
import { CoinRecurrence } from '../interactive/CoinRecurrence';
import { ForwardExplosion } from '../interactive/ForwardExplosion';
import { FibonacciSequence } from '../interactive/FibonacciSequence';
import { CodeViewer } from '../interactive/CodeViewer';
import { renderInline, highlightPlain } from '../../lib/renderInline';

interface SlideViewProps {
  slide: Slide;
  answer: SlideAnswer;
  onAnswer: (answer: SlideAnswer) => void;
  showMistakes: boolean;
  /** A phrase the tutor asked to spotlight on this slide, if any. */
  highlight?: string;
}

// Each newline in the prompt becomes its own spaced line.
function Prompt({ text, highlight }: { text?: string; highlight?: string }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="mx-auto mb-8 flex max-w-lg flex-col gap-3 text-center">
      {lines.map((line, i) => (
        <p key={i} className="text-base leading-relaxed text-ink-soft">
          {renderInline(line, `l${i}`, highlight)}
        </p>
      ))}
    </div>
  );
}

export function SlideView({
  slide,
  answer,
  onAnswer,
  showMistakes,
  highlight,
}: SlideViewProps) {
  switch (slide.component) {
    case 'StairGrid':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
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
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <ArrayRow
            config={slide.props}
            answer={answer}
            onAnswer={onAnswer}
            showMistakes={showMistakes}
          />
        </div>
      );

    case 'StairsToArray':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <StairsToArray config={slide.props} />
        </div>
      );

    case 'StaircaseWalkthrough':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <StaircaseWalkthrough config={slide.props} />
        </div>
      );

    case 'RangeSelector':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <RangeSelector config={slide.props} answer={answer} onAnswer={onAnswer} />
        </div>
      );

    case 'PredecessorPicker':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <PredecessorPicker
            config={slide.props}
            answer={answer}
            onAnswer={onAnswer}
            showMistakes={showMistakes}
          />
        </div>
      );

    case 'CodeBlanks':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
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

    case 'KnapsackPicker':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <KnapsackPicker
            config={slide.props}
            answer={answer}
            onAnswer={onAnswer}
            showMistakes={showMistakes}
          />
        </div>
      );

    case 'CoinBuilder':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <CoinBuilder
            config={slide.props}
            answer={answer}
            onAnswer={onAnswer}
            showMistakes={showMistakes}
          />
        </div>
      );

    case 'PathBuilder':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <PathBuilder
            config={slide.props}
            answer={answer}
            onAnswer={onAnswer}
            showMistakes={showMistakes}
          />
        </div>
      );

    case 'MinChoicePicker':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <MinChoicePicker
            config={slide.props}
            answer={answer}
            onAnswer={onAnswer}
            showMistakes={showMistakes}
          />
        </div>
      );

    case 'DPTable':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <DPTable config={slide.props} />
        </div>
      );

    case 'CoinSweep':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <CoinSweep config={slide.props} />
        </div>
      );

    case 'SubproblemIsolation':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <SubproblemIsolation config={slide.props} />
        </div>
      );

    case 'GreedyFailure':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <GreedyFailure config={slide.props} />
        </div>
      );

    case 'CoinRecurrence':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <CoinRecurrence config={slide.props} />
        </div>
      );

    case 'CodeViewer':
      return (
        <div>
          <Prompt text={slide.props.prompt} highlight={highlight} />
          <CodeViewer config={slide.props} />
        </div>
      );

    case 'RichText': {
      const { heading, body, emphasis, bullets, pseudocode, visual, bodyFirst } =
        slide.props;
      const gridConfig =
        visual &&
        visual.component !== 'ForwardExplosion' &&
        visual.component !== 'FibonacciSequence'
          ? {
              steps: visual.steps ?? 0,
              jumpSizes: visual.jumpSizes,
              editable: false,
              showSolution: true,
              highlightIndices: visual.highlightIndices,
              display: visual.display,
              showArrows: visual.showArrows,
              arrowTargets: visual.arrowTargets,
              loop: visual.loop,
            }
          : null;
      const noop = () => {};
      const bodyEl = body && (
        <p className="text-base leading-relaxed text-ink-soft">
          {highlightPlain(body, 'rt-body', highlight)}
        </p>
      );
      const emphasisEl = emphasis && (
        <p className="mx-auto mb-4 max-w-md rounded-xl bg-brand-soft px-5 py-4 text-base font-semibold text-brand">
          {highlightPlain(emphasis, 'rt-emph', highlight)}
        </p>
      );
      return (
        <div className="mx-auto max-w-lg text-center">
          {heading && (
            <h2 className="mb-4 text-2xl font-bold text-ink">
              {highlightPlain(heading, 'rt-head', highlight)}
            </h2>
          )}
          {bodyFirst ? (
            <>
              {bodyEl && <div className="mb-4">{bodyEl}</div>}
              {emphasisEl}
            </>
          ) : (
            <>
              {emphasisEl}
              {bodyEl}
            </>
          )}
          {bullets && bullets.length > 0 && (
            <ul className="mx-auto mt-4 flex max-w-md flex-col gap-2 text-left text-sm text-ink-soft">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand">•</span>
                  {highlightPlain(b, `rt-b${i}`, highlight)}
                </li>
              ))}
            </ul>
          )}
          {visual?.component === 'ForwardExplosion' && (
            <div className="mt-6">
              <ForwardExplosion
                jumpSizes={visual.jumpSizes}
                depth={visual.depth}
                caption={visual.caption}
              />
            </div>
          )}
          {visual?.component === 'FibonacciSequence' && (
            <div className="mt-6">
              <FibonacciSequence
                count={visual.count}
                seeds={visual.seeds}
                label={visual.label}
                startIndex={visual.startIndex}
                caption={visual.caption}
              />
            </div>
          )}
          {gridConfig && (
            <div className="mt-6">
              {visual!.component === 'ArrayRow' ? (
                <ArrayRow config={gridConfig} answer={{ kind: 'none' }} onAnswer={noop} />
              ) : (
                <StairGrid config={gridConfig} answer={{ kind: 'none' }} onAnswer={noop} />
              )}
            </div>
          )}
          {pseudocode && (
            <pre className="mt-5 overflow-x-auto rounded-xl border border-code-border bg-code-bg px-5 py-4 text-left font-mono text-sm leading-relaxed text-code-text">
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
