import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-ExerciseHeader.scss';

const cnWorkoutSessionExerciseHeader = cn('WorkoutSession', 'ExerciseHeader');

type WorkoutSessionExerciseHeaderProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionExerciseHeader: FC<WorkoutSessionExerciseHeaderProps> = ({ children }) => {
  return <div className={cnWorkoutSessionExerciseHeader()}>{children}</div>;
};
