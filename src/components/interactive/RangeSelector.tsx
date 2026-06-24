import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { RangeSelectorProps, SlideAnswer } from '../../types/content';
import { cn } from '../../lib/cn';

interface Props {
  config: RangeSelectorProps;
  answer: SlideAnswer;
  onAnswer: (answer: SlideAnswer) => void;
}

function rangeIndices(a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

export function RangeSelector({ config, answer, onAnswer }: Props) {
  const { min, max, target, jumpSizes, goalIndex } = config;
  // The goal sits on the line but the handles can never select it.
  const selectableMax = goalIndex != null ? goalIndex - 1 : max;
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<'low' | 'high' | null>(null);

  const indices = answer.kind === 'range' ? answer.indices : [];
  const low = indices.length ? Math.min(...indices) : min;
  const high = indices.length ? Math.max(...indices) : min + 1;

  // Seed an initial window so what the learner sees matches the stored answer.
  useEffect(() => {
    if (!indices.length) {
      onAnswer({ kind: 'range', indices: rangeIndices(min, min + 1) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = (a: number, b: number) =>
    onAnswer({ kind: 'range', indices: rangeIndices(a, b) });

  const valueFromClientX = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return low;
    const ratio = (clientX - rect.left) / rect.width;
    const v = Math.round(min + ratio * (max - min));
    return Math.min(selectableMax, Math.max(min, v));
  };

  useEffect(() => {
    if (!activeHandle) return;
    const move = (e: PointerEvent) => {
      const v = valueFromClientX(e.clientX);
      if (activeHandle === 'low') emit(Math.min(v, high - 1), high);
      else emit(low, Math.max(v, low + 1));
    };
    const up = () => setActiveHandle(null);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHandle, low, high]);

  const onHandleKey = (e: KeyboardEvent, handle: 'low' | 'high') => {
    const delta = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
    if (!delta) return;
    e.preventDefault();
    if (handle === 'low') emit(Math.min(Math.max(min, low + delta), high - 1), high);
    else emit(low, Math.max(Math.min(selectableMax, high + delta), low + 1));
  };

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const ticks = rangeIndices(min, max);

  return (
    <div className="w-full select-none">
      <p className="mb-6 text-center text-sm text-muted">
        Look-backs for{' '}
        <span className="font-semibold text-ink">step {target}</span> · jumps{' '}
        {jumpSizes.join(', ')}
      </p>

      <div className="relative px-3 pt-6 pb-2">
        {/* Track */}
        <div ref={trackRef} className="relative h-2 rounded-full bg-line">
          {/* Selected window */}
          <div
            className="absolute h-2 rounded-full bg-brand/30"
            style={{ left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%` }}
          />

          {/* Fixed goal marker — shown on the line but not selectable. */}
          {goalIndex != null && (
            <div
              className="-top-2.5 -translate-x-1/2 absolute flex h-7 w-7 items-center justify-center rounded-full border-2 border-cta bg-cta text-xs font-bold text-white shadow-md"
              style={{ left: `${pct(goalIndex)}%` }}
              aria-label={`Goal: ${goalIndex}`}
            >
              {goalIndex}
            </div>
          )}

          {(['low', 'high'] as const).map((handle) => {
            const value = handle === 'low' ? low : high;
            return (
              <button
                key={handle}
                type="button"
                role="slider"
                aria-label={`${handle === 'low' ? 'Lower' : 'Upper'} bound`}
                aria-valuemin={min}
                aria-valuemax={selectableMax}
                aria-valuenow={value}
                onPointerDown={() => setActiveHandle(handle)}
                onKeyDown={(e) => onHandleKey(e, handle)}
                style={{ left: `${pct(value)}%`, touchAction: 'none' }}
                className={cn(
                  '-top-3 absolute h-8 w-8 -translate-x-1/2 rounded-full border-2 border-brand bg-surface shadow-md transition-transform',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                  activeHandle === handle ? 'scale-110' : 'hover:scale-105',
                )}
              >
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-bold text-brand">
                  {value}
                </span>
              </button>
            );
          })}
        </div>

        {/* Ticks */}
        <div className="relative mt-5 h-6">
          {ticks.map((t) => {
            const isGoal = goalIndex != null && t === goalIndex;
            const inWindow = t >= low && t <= high;
            return (
              <span
                key={t}
                className={cn(
                  '-translate-x-1/2 absolute text-xs tabular-nums',
                  isGoal
                    ? 'font-bold text-cta'
                    : inWindow
                      ? 'font-bold text-brand'
                      : 'text-muted',
                )}
                style={{ left: `${pct(t)}%` }}
              >
                {isGoal ? 'goal' : t}
              </span>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-sm">
        <span className="text-muted">Selected window: </span>
        <span className="font-semibold text-ink">
          {'{'}
          {rangeIndices(low, high).join(', ')}
          {'}'}
        </span>
      </p>
    </div>
  );
}
