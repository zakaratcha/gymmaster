import { cn } from '@bem-react/classname';
import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

import './Button.scss';

const cnButton = cn('Button');

type ButtonColor = 'primary' | 'secondary' | 'default';

type ButtonProps = {
  readonly className?: string;
  readonly color?: ButtonColor;
  readonly asChild?: boolean;
  readonly startIcon?: ReactNode;
  readonly endIcon?: ReactNode;
  readonly children?: ReactNode;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'disabled' | 'onClick' | 'type'> & {
    readonly 'data-exercise-id'?: string;
  };

export const Button: FC<ButtonProps> = ({
  className,
  color = 'default',
  asChild = false,
  startIcon,
  endIcon,
  children,
  disabled,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  'data-exercise-id': exerciseId
}) => {
  const buttonClassName = color === 'default' ? cnButton(null, [className]) : cnButton({ color }, [className]);

  if (asChild) {
    return (
      <Slot className={buttonClassName} onClick={onClick}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      aria-label={ariaLabel}
      className={buttonClassName}
      data-exercise-id={exerciseId}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
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
