import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './Dialog-Content.scss';

const cnDialogContent = cn('Dialog', 'Content');

type DialogContentProps = {
  readonly children: ReactNode;
};

export const DialogContent: FC<DialogContentProps> = ({ children }) => {
  return <div className={cnDialogContent()}>{children}</div>;
};
