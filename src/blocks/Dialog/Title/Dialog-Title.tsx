import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './Dialog-Title.scss';

const cnDialogTitle = cn('Dialog', 'Title');

type DialogTitleProps = {
  readonly children: ReactNode;
};

export const DialogTitle: FC<DialogTitleProps> = ({ children }) => {
  return <h2 className={cnDialogTitle()}>{children}</h2>;
};
