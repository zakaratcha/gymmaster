import { cn } from '@bem-react/classname';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import './Workouts.css';

const cnWorkouts = cn('Workouts');

export const Workouts: FC = () => {
  return (
    <div className={cnWorkouts()}>
      <main className={cnWorkouts('Main')}>
        <h1 className={cnWorkouts('Title')}>Тренировки</h1>
        <Link className={cnWorkouts('ProfileLink')} to='/account'>
          Профиль
        </Link>
      </main>
    </div>
  );
};
