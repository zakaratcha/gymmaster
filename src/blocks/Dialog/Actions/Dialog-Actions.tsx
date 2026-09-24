import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './Dialog-Actions.scss';

const cnDialogActions = cn('Dialog', 'Actions');

type DialogActionsProps = {
  readonly children: ReactNode;
};

export const DialogActions: FC<DialogActionsProps> = ({ children }) => {
  return <div className={cnDialogActions()}>{children}</div>;
};
