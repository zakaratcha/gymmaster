import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { WorkoutSessionRemoveSet } from '../RemoveSet/WorkoutSession-RemoveSet';
import { WorkoutSessionSetInput } from '../SetInput/WorkoutSession-SetInput';
import { WorkoutSessionSetLabel } from '../SetLabel/WorkoutSession-SetLabel';
import { WorkoutSessionSetUnit } from '../SetUnit/WorkoutSession-SetUnit';
import { WorkoutSessionSetValue } from '../SetValue/WorkoutSession-SetValue';
import type { DraftSet, SetAction, SetField } from '../types';

import './WorkoutSession-SetRow.scss';

const cnWorkoutSessionSetRow = cn('WorkoutSession', 'SetRow');

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
      <WorkoutSessionSetLabel>{setPosition + 1}</WorkoutSessionSetLabel>
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
          <WorkoutSessionSetUnit>повт.</WorkoutSessionSetUnit>
          <WorkoutSessionSetInput
            disabled={disabled}
            exercisePosition={exercisePosition}
            field='weightKg'
            onChange={onChange}
            setPosition={setPosition}
            value={set.weightKg}
          />
          <WorkoutSessionSetUnit>кг</WorkoutSessionSetUnit>
          <WorkoutSessionRemoveSet
            disabled={disabled}
            exercisePosition={exercisePosition}
            setPosition={setPosition}
            onAction={onAction}
          />
        </>
      ) : (
        <>
          <WorkoutSessionSetValue>{set.reps} повт.</WorkoutSessionSetValue>
          <WorkoutSessionSetValue>{set.weightKg} кг</WorkoutSessionSetValue>
        </>
      )}
    </div>
  );
};
