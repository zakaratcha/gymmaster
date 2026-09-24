import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-ExercisesHeader.scss';

const cnWorkoutSessionExercisesHeader = cn('WorkoutSession', 'ExercisesHeader');

type WorkoutSessionExercisesHeaderProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionExercisesHeader: FC<WorkoutSessionExercisesHeaderProps> = ({ children }) => {
  return <div className={cnWorkoutSessionExercisesHeader()}>{children}</div>;
};
