import { type ChangeEvent, type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';
import { Input } from '../../Input/Input';
import type { DraftSet, SetAction, SetField } from '../types';

import './WorkoutSession-SetRow.scss';

const cnWorkoutSessionSetRow = cn('WorkoutSession', 'SetRow');
const cnWorkoutSession = cn('WorkoutSession');

type WorkoutSessionSetInputProps = {
  readonly disabled: boolean;
  readonly exercisePosition: number;
  readonly field: SetField;
  readonly setPosition: number;
  readonly value: string;
  onChange(exercisePosition: number, setPosition: number, field: SetField, value: string): void;
};

const WorkoutSessionSetInput: FC<WorkoutSessionSetInputProps> = ({
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
      className={cnWorkoutSession('SetInput')}
      disabled={disabled}
      onChange={handleChange}
      step={field === 'reps' ? '1' : '0.1'}
      type='number'
      value={value}
    />
  );
};

type WorkoutSessionSetActionProps = {
  readonly action: SetAction;
  readonly className?: string;
  readonly disabled: boolean;
  readonly exercisePosition: number;
  readonly setPosition: number | undefined;
  onAction(action: SetAction, exercisePosition: number, setPosition?: number): void;
};

const WorkoutSessionSetAction: FC<WorkoutSessionSetActionProps> = ({
  action,
  className,
  disabled,
  exercisePosition,
  setPosition,
  onAction
}) => {
  const handleClick = useCallback(() => {
    onAction(action, exercisePosition, setPosition);
  }, [action, exercisePosition, onAction, setPosition]);

  const ariaLabel =
    action === 'add'
      ? `Добавить подход в упражнение ${exercisePosition + 1}`
      : `Удалить подход ${(setPosition ?? 0) + 1} у упражнения ${exercisePosition + 1}`;

  return (
    <Button aria-label={ariaLabel} className={className} disabled={disabled} onClick={handleClick}>
      {action === 'add' ? '+ Подход' : '×'}
    </Button>
  );
};

type WorkoutSessionSetRowProps = {
  readonly disabled: boolean;
  readonly exercisePosition: number;
  readonly isInProgress: boolean;
  readonly set: DraftSet;
  readonly setPosition: number;
  onAction(action: SetAction, exercisePosition: number, setPosition?: number): void;
  onChange(exercisePosition: number, setPosition: number, field: SetField, value: string): void;
};

export const WorkoutSessionSetRow: FC<WorkoutSessionSetRowProps> = ({
  disabled,
  exercisePosition,
  isInProgress,
  set,
  setPosition,
  onAction,
  onChange
}) => {
  return (
    <div className={cnWorkoutSessionSetRow()}>
      <span className={cnWorkoutSession('SetLabel')}>{setPosition + 1}</span>
      {isInProgress ? (
        <>
          <WorkoutSessionSetInput
            disabled={disabled}
            exercisePosition={exercisePosition}
            field='reps'
            onChange={onChange}
            setPosition={setPosition}
            value={set.reps}
          />
          <span className={cnWorkoutSession('SetUnit')}>повт.</span>
          <WorkoutSessionSetInput
            disabled={disabled}
            exercisePosition={exercisePosition}
            field='weightKg'
            onChange={onChange}
            setPosition={setPosition}
            value={set.weightKg}
          />
          <span className={cnWorkoutSession('SetUnit')}>кг</span>
          <WorkoutSessionSetAction
            action='remove'
            className={cnWorkoutSession('RemoveSet')}
            disabled={disabled}
            exercisePosition={exercisePosition}
            onAction={onAction}
            setPosition={setPosition}
          />
        </>
      ) : (
        <>
          <span className={cnWorkoutSession('SetValue')}>{set.reps} повт.</span>
          <span className={cnWorkoutSession('SetValue')}>{set.weightKg} кг</span>
        </>
      )}
    </div>
  );
};
