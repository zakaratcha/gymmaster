import { type FC, type ReactNode, type SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import { cn } from '@bem-react/classname';

import './Dialog.scss';

const cnDialog = cn('Dialog');

type DialogProps = {
  readonly ariaLabel: string;
  readonly children: ReactNode;
  readonly className?: string;
  onCancel(): void;
};

export const Dialog: FC<DialogProps> = ({ ariaLabel, children, className, onCancel }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      onCancel();
    },
    [onCancel]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog aria-label={ariaLabel} className={cnDialog(null, [className])} onCancel={handleCancel} ref={dialogRef}>
      {children}
    </dialog>
  );
};
