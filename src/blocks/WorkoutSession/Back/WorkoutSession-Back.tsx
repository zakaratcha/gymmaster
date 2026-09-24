import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import './WorkoutSession-Back.scss';

const cnWorkoutSessionBack = cn('WorkoutSession', 'Back');

type WorkoutSessionBackProps = {
  readonly clientId: string | undefined;
};

export const WorkoutSessionBack: FC<WorkoutSessionBackProps> = ({ clientId }) => {
  return (
    <Link
      aria-label='Назад к карточке клиента'
      className={cnWorkoutSessionBack()}
      to={clientId === undefined ? '/clients' : `/clients/${clientId}`}
    >
      ←
    </Link>
  );
};
