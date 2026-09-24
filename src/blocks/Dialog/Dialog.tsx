import { type FC, type ReactNode, type SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import { cn } from '@bem-react/classname';

import './Dialog.scss';

const cnDialog = cn('Dialog');

type DialogProps = {
  readonly title: string;
  readonly children?: ReactNode;
  readonly actions: ReactNode;
  readonly description?: string;
  readonly error?: string;
  onCancel(): void;
};

export const Dialog: FC<DialogProps> = ({ title, children, actions, description, error, onCancel }) => {
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
    <dialog aria-label={title} className={cnDialog()} onCancel={handleCancel} ref={dialogRef}>
      <div className={cnDialog('Content')}>
        <h2 className={cnDialog('Title')}>{title}</h2>
        {description !== undefined && <p className={cnDialog('Description')}>{description}</p>}
        {error !== undefined && (
          <p className={cnDialog('Error')} role='alert'>
            {error}
          </p>
        )}
        {children}
      </div>
      <div className={cnDialog('Actions')}>{actions}</div>
    </dialog>
  );
};
