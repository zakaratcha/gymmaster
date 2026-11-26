import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './AdminTrainers-Error.scss';

const cnAdminTrainersError = cn('AdminTrainers', 'Error');

type AdminTrainersErrorProps = {
  readonly error: string;
  onRetry(): void;
};

export const AdminTrainersError: FC<AdminTrainersErrorProps> = ({ error, onRetry }) => {
  const handleRetry = useCallback(() => {
    onRetry();
  }, [onRetry]);

  return (
    <div className={cnAdminTrainersError()}>
      <p role='alert'>{error}</p>
      <Button color='secondary' onClick={handleRetry} type='button'>
        Повторить
      </Button>
    </div>
  );
};
