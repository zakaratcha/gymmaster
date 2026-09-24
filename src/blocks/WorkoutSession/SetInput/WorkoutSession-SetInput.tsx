import { type ChangeEvent, type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { Input } from '../../Input/Input';
import type { SetField } from '../types';

import './WorkoutSession-SetInput.scss';

const cnWorkoutSessionSetInput = cn('WorkoutSession', 'SetInput');

type WorkoutSessionSetInputProps = {
  readonly disabled: boolean;
  readonly exercisePosition: number;
  readonly field: SetField;
  readonly setPosition: number;
  readonly value: string;
  onChange(exercisePosition: number, setPosition: number, field: SetField, value: string): void;
};

export const WorkoutSessionSetInput: FC<WorkoutSessionSetInputProps> = ({
  disabled,
  exercisePosition,
  field,
  setPosition,
  value,
  onChange
}) => {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(exercisePosition, setPosition, field, event.target.value);
    },
    [exercisePosition, field, onChange, setPosition]
  );

  return (
    <Input
      className={cnWorkoutSessionSetInput()}
      disabled={disabled}
      onChange={handleChange}
      step={field === 'reps' ? '1' : '0.1'}
      type='number'
      value={value}
    />
  );
};
