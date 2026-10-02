import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ActiveWorkoutTabs-Error.scss';

const cnActiveWorkoutTabsError = cn('ActiveWorkoutTabs', 'Error');

type ActiveWorkoutTabsErrorProps = {
  onRetry(): void;
};

export const ActiveWorkoutTabsError: FC<ActiveWorkoutTabsErrorProps> = ({ onRetry }) => {
  return (
    <div className={cnActiveWorkoutTabsError()}>
      <p>Не удалось загрузить активные тренировки</p>
      <Button color='secondary' onClick={onRetry} type='button'>
        Повторить
      </Button>
    </div>
  );
};
