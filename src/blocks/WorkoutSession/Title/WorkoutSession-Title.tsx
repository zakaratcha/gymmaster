import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-Title.scss';

const cnWorkoutSessionTitle = cn('WorkoutSession', 'Title');

export const WorkoutSessionTitle: FC = () => {
  return <h1 className={cnWorkoutSessionTitle()}>Тренировка</h1>;
};
