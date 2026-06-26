import { createContext } from 'react';
import type { ChatTurn, ReturnPoint } from '../lib/aiTutor/types';

/**
 * Tutor UI state that must survive route changes (so a cross-lesson "take me
 * there" jump can persist the conversation and the return point). Lives above
 * the router; the lesson-specific context is supplied to the widget as props.
 */
export interface TutorState {
  isOpen: boolean;
  turns: ChatTurn[];
  /** Where the learner was before a tutor jump; drives the "return" pill. */
  returnPoint: ReturnPoint | null;

  open: () => void;
  close: () => void;
  toggle: () => void;
  setTurns: (update: (prev: ChatTurn[]) => ChatTurn[]) => void;
  resetChat: () => void;
  setReturnPoint: (point: ReturnPoint | null) => void;
}

// A no-op default so components (and unit tests) can use the tutor hooks
// without a provider mounted. Cross-route persistence only works with the real
// provider, but single-component tests don't need it.
export const defaultTutorState: TutorState = {
  isOpen: false,
  turns: [],
  returnPoint: null,
  open: () => {},
  close: () => {},
  toggle: () => {},
  setTurns: () => {},
  resetChat: () => {},
  setReturnPoint: () => {},
};

export const TutorContext = createContext<TutorState>(defaultTutorState);
