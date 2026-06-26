import { motion } from 'framer-motion';
import { CornerUpLeft, X } from 'lucide-react';

interface TutorReturnPillProps {
  /** Short description of where the learner will return to. */
  label: string;
  onReturn: () => void;
  onDismiss: () => void;
}

/**
 * A floating pill shown after the tutor takes the learner to another part of
 * the course, so they can jump straight back to exactly where they were.
 */
export function TutorReturnPill({ label, onReturn, onDismiss }: TutorReturnPillProps) {
  return (
    <motion.div
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -16, opacity: 0 }}
      className="fixed left-1/2 top-3 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-3 pr-1.5 shadow-card"
    >
      <button
        type="button"
        onClick={onReturn}
        className="flex items-center gap-2 rounded-full text-sm font-semibold text-brand hover:text-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <CornerUpLeft className="h-4 w-4" aria-hidden="true" />
        <span className="max-w-[16rem] truncate">{label}</span>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss return shortcut"
        className="rounded-full p-1 text-muted hover:bg-canvas hover:text-ink"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
