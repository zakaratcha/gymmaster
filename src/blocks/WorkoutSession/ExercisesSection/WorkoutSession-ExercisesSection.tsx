import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-ExercisesSection.scss';

const cnWorkoutSessionExercisesSection = cn('WorkoutSession', 'ExercisesSection');

type WorkoutSessionExercisesSectionProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionExercisesSection: FC<WorkoutSessionExercisesSectionProps> = ({ children }) => {
  return <section className={cnWorkoutSessionExercisesSection()}>{children}</section>;
};
