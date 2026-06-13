import { cn } from '@bem-react/classname';
import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

import './Button.css';

const cnButton = cn('Button');

type ButtonColor = 'primary' | 'secondary' | 'default';

type ButtonProps = {
  readonly color?: ButtonColor;
  readonly asChild?: boolean;
  readonly startIcon?: ReactNode;
  readonly endIcon?: ReactNode;
  readonly children: ReactNode;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick' | 'type'>;

export const Button: FC<ButtonProps> = ({
  color = 'default',
  asChild = false,
  startIcon,
  endIcon,
  children,
  disabled,
  onClick,
  type = 'button'
}) => {
  const className = color === 'default' ? cnButton() : cnButton({ color });

  if (asChild) {
    return (
      <Slot className={className} onClick={onClick}>
        {children}
      </Slot>
    );
  }

  return (
    <button className={className} disabled={disabled} onClick={onClick} type={type}>
      {startIcon == null ? null : (
        <span aria-hidden='true' className={cnButton('StartIcon')}>
          {startIcon}
        </span>
      )}
      <span className={cnButton('Label')}>{children}</span>
      {endIcon == null ? null : (
        <span aria-hidden='true' className={cnButton('EndIcon')}>
          {endIcon}
        </span>
      )}
    </button>
  );
};
