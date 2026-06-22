import { cn } from '@bem-react/classname';
import type { FC } from 'react';

import './Exercises.scss';

const cnExercises = cn('Exercises');

export const Exercises: FC = () => {
  return (
    <div className={cnExercises()}>
      <main className={cnExercises('Main')}>
        <h1 className={cnExercises('Title')}>Упражнения</h1>
      </main>
    </div>
  );
};
