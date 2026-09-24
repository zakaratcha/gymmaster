import { type ChangeEvent, type FC } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-ExerciseSelect.scss';

const cnWorkoutSessionExerciseSelect = cn('WorkoutSession', 'ExerciseSelect');

type WorkoutSessionExerciseSelectProps = {
  readonly disabled: boolean;
  readonly exercises: readonly { readonly id: string; readonly name: string }[];
  readonly selectedExerciseId: string;
  onChange(event: ChangeEvent<HTMLSelectElement>): void;
};

export const WorkoutSessionExerciseSelect: FC<WorkoutSessionExerciseSelectProps> = ({
  disabled,
  exercises,
  selectedExerciseId,
  onChange
}) => {
  return (
    <select
      aria-label='Упражнение'
      className={cnWorkoutSessionExerciseSelect()}
      disabled={disabled}
      onChange={onChange}
      value={selectedExerciseId}
    >
      {exercises.map(exercise => (
        <option key={exercise.id} value={exercise.id}>
          {exercise.name}
        </option>
      ))}
    </select>
  );
};
