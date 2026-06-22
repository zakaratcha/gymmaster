import { cn } from '@bem-react/classname';
import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

import { Button } from '../Button/Button';

import './Fab.scss';

const cnFab = cn('Fab');

type FabProps = {
  readonly className?: string;
  readonly disabled?: boolean;
  readonly ariaLabel: string;
  readonly icon: ReactNode;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

export const Fab: FC<FabProps> = ({ className, disabled, onClick, ariaLabel, icon }) => {
  return (
    <Button
      aria-label={ariaLabel}
      className={cnFab(null, [className])}
      color='primary'
      disabled={disabled}
      onClick={onClick}
      startIcon={icon}
    />
  );
};
