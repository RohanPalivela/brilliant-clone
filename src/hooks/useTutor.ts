import { useContext } from 'react';
import { TutorContext } from '../context/tutorContext';

/** Access shared tutor UI state (open flag, chat turns, return point). */
export function useTutor() {
  return useContext(TutorContext);
}
