import { useId, useState, type ReactNode } from 'react';

interface ConfirmButtonProps {
  label: string;
  /** The confirmation's heading, such as "Give up?". */
  question: string;
  /** What confirming will do, shown before the Learner commits. */
  children: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
}

/**
 * A button for an action the Learner should not take by accident: pressing it
 * asks for confirmation inline, and only confirming runs the action.
 */
export function ConfirmButton({ label, question, children, confirmLabel, cancelLabel, onConfirm, disabled }: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false);
  const headingId = useId();

  if (!asking) {
    return (
      <button type="button" className="button" onClick={() => setAsking(true)} disabled={disabled}>
        {label}
      </button>
    );
  }

  return (
    <div className="confirmation" role="alertdialog" aria-labelledby={headingId}>
      <h3 id={headingId}>{question}</h3>
      <p>{children}</p>
      <div className="confirmation-actions">
        <button
          type="button"
          className="button danger"
          onClick={() => {
            setAsking(false);
            onConfirm();
          }}
        >
          {confirmLabel}
        </button>
        <button type="button" className="button" onClick={() => setAsking(false)} autoFocus>
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
