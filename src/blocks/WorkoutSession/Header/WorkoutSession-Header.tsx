import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import './WorkoutSession-Header.scss';

const cnWorkoutSessionHeader = cn('WorkoutSession', 'Header');
const cnWorkoutSession = cn('WorkoutSession');

type WorkoutSessionHeaderProps = {
  readonly clientId: string | undefined;
};

export const WorkoutSessionHeader: FC<WorkoutSessionHeaderProps> = ({ clientId }) => {
  return (
    <header className={cnWorkoutSessionHeader()}>
      <Link
        aria-label='Назад к карточке клиента'
        className={cnWorkoutSession('Back')}
        to={clientId === undefined ? '/clients' : `/clients/${clientId}`}
      >
        ←
      </Link>
      <h1 className={cnWorkoutSession('Title')}>Тренировка</h1>
    </header>
  );
};
