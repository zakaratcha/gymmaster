import { cn } from '@bem-react/classname';
import * as Label from '@radix-ui/react-label';
import type { FC, InputHTMLAttributes } from 'react';

import './Input.scss';

const cnInput = cn('Input');

export type InputProps = {
  readonly id?: string;
  readonly className?: string;
  readonly label?: string;
  readonly error?: string;
  readonly 'data-exercise-position'?: number;
  readonly 'data-field'?: string;
  readonly 'data-set-position'?: number;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'disabled' | 'name' | 'onChange' | 'placeholder' | 'step' | 'type' | 'value'
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
  step,
  type = 'text',
  'data-exercise-position': dataExercisePosition,
  'data-field': dataField,
  'data-set-position': dataSetPosition
}) => {
  const hasError = error !== undefined && error.length > 0;
  const hasLabel = label !== undefined && id !== undefined;

  return (
    <div className={cnInput({ error: hasError }, [className])}>
      {hasLabel && (
        <Label.Root className={cnInput('Label')} htmlFor={id}>
          {label}
        </Label.Root>
      )}
      <input
        aria-invalid={hasError ? true : undefined}
        className={cnInput('Control')}
        data-exercise-position={dataExercisePosition}
        data-field={dataField}
        data-set-position={dataSetPosition}
        defaultValue={defaultValue}
        disabled={disabled}
        id={id}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        type={type}
        value={value}
      />
      {hasError && <span className={cnInput('Error')}>{error}</span>}
    </div>
  );
};
