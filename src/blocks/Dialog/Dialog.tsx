import { type FC, type ReactNode, type SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import { cn } from '@bem-react/classname';

import './Dialog.scss';

const cnDialog = cn('Dialog');

type DialogTitleProps = {
  readonly children: ReactNode;
};

export const DialogTitle: FC<DialogTitleProps> = ({ children }) => {
  return <h2 className={cnDialog('Title')}>{children}</h2>;
};

type DialogContentProps = {
  readonly children: ReactNode;
};

export const DialogContent: FC<DialogContentProps> = ({ children }) => {
  return <div className={cnDialog('Content')}>{children}</div>;
};

type DialogActionsProps = {
  readonly children: ReactNode;
};

export const DialogActions: FC<DialogActionsProps> = ({ children }) => {
  return <div className={cnDialog('Actions')}>{children}</div>;
};

type DialogProps = {
  readonly ariaLabel: string;
  readonly children: ReactNode;
  onCancel(): void;
};

export const Dialog: FC<DialogProps> = ({ ariaLabel, children, onCancel }) => {
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
    <dialog aria-label={ariaLabel} className={cnDialog()} onCancel={handleCancel} ref={dialogRef}>
      {children}
    </dialog>
  );
};
