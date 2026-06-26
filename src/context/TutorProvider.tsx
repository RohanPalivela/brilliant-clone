import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { ChatTurn, ReturnPoint } from '../lib/aiTutor/types';
import { TutorContext, type TutorState } from './tutorContext';

export function TutorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [turns, setTurnsState] = useState<ChatTurn[]>([]);
  const [returnPoint, setReturnPointState] = useState<ReturnPoint | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const setTurns = useCallback(
    (update: (prev: ChatTurn[]) => ChatTurn[]) => setTurnsState(update),
    [],
  );
  const resetChat = useCallback(() => setTurnsState([]), []);
  const setReturnPoint = useCallback(
    (point: ReturnPoint | null) => setReturnPointState(point),
    [],
  );

  const value = useMemo<TutorState>(
    () => ({
      isOpen,
      turns,
      returnPoint,
      open,
      close,
      toggle,
      setTurns,
      resetChat,
      setReturnPoint,
    }),
    [isOpen, turns, returnPoint, open, close, toggle, setTurns, resetChat, setReturnPoint],
  );

  return <TutorContext.Provider value={value}>{children}</TutorContext.Provider>;
}
