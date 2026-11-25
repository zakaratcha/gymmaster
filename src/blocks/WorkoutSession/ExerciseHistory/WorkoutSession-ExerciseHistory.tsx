import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { CounterClockwiseClockIcon } from '@radix-ui/react-icons';

import './WorkoutSession-ExerciseHistory.scss';

const cnWorkoutSessionExerciseHistory = cn('WorkoutSession', 'ExerciseHistory');

type WorkoutSessionExerciseHistoryProps = {
  readonly exerciseName: string;
  onOpen(): void;
};

export const WorkoutSessionExerciseHistory: FC<WorkoutSessionExerciseHistoryProps> = ({ exerciseName, onOpen }) => {
  return (
    <button
      aria-label={`История упражнения ${exerciseName}`}
      className={cnWorkoutSessionExerciseHistory()}
      type='button'
      onClick={onOpen}
    >
      <CounterClockwiseClockIcon aria-hidden='true' />
    </button>
  );
};
