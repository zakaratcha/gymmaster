import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import './WorkoutSession-Back.scss';

const cnWorkoutSessionBack = cn('WorkoutSession', 'Back');

type WorkoutSessionBackProps = {
  readonly to: string;
};

export const WorkoutSessionBack: FC<WorkoutSessionBackProps> = ({ to }) => {
  return (
    <Link aria-label='Вернуться в кабинет' className={cnWorkoutSessionBack()} to={to}>
      ←
    </Link>
  );
};
