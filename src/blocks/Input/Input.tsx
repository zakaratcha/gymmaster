import { cn } from '@bem-react/classname';
import * as Label from '@radix-ui/react-label';
import type { FC, InputHTMLAttributes } from 'react';

import './Input.scss';

const cnInput = cn('Input');

export type InputProps = {
  readonly id: string;
  readonly className?: string;
  readonly label?: string;
  readonly error?: string;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'disabled' | 'name' | 'onChange' | 'placeholder' | 'type' | 'value'
>;

export const Input: FC<InputProps> = ({
  id,
  className,
  label,
  error,
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled,
  name,
  type = 'text'
}) => {
  const hasError = error !== undefined && error.length > 0;

  return (
    <div className={cnInput({ error: hasError }, [className])}>
      {label === undefined ? null : (
        <Label.Root className={cnInput('Label')} htmlFor={id}>
          {label}
        </Label.Root>
      )}
      <input
        aria-invalid={hasError ? true : undefined}
        className={cnInput('Control')}
        defaultValue={defaultValue}
        disabled={disabled}
        id={id}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {hasError ? <span className={cnInput('Error')}>{error}</span> : null}
    </div>
  );
};
