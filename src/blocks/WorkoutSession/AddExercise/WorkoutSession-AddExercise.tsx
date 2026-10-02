import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-AddExercise.scss';

const cnWorkoutSessionAddExercise = cn('WorkoutSession', 'AddExercise');

type WorkoutSessionAddExerciseProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionAddExercise: FC<WorkoutSessionAddExerciseProps> = ({ children }) => {
  return <div className={cnWorkoutSessionAddExercise()}>{children}</div>;
};
