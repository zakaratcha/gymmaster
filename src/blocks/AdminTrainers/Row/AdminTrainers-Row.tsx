import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import type { AdminTrainer, TrainerStatus } from '../../../services/trainers/trainers.models';
import { Button } from '../../Button/Button';

import './AdminTrainers-Row.scss';

const cnAdminTrainersRow = cn('AdminTrainers', 'Row');

type AdminTrainersRowProps = {
  readonly trainer: AdminTrainer;
  onBlock(trainer: AdminTrainer): void;
  onUnblock(trainer: AdminTrainer): void;
  onResetPassword(trainer: AdminTrainer): void;
};

function statusLabel(status: TrainerStatus): string {
  return status === 'active' ? 'активен' : 'заблокирован';
}

export const AdminTrainersRow: FC<AdminTrainersRowProps> = ({ trainer, onBlock, onUnblock, onResetPassword }) => {
  const handleStatusClick = useCallback(() => {
    if (trainer.status === 'active') {
      onBlock(trainer);
      return;
    }

    onUnblock(trainer);
  }, [onBlock, onUnblock, trainer]);

  const handleResetPassword = useCallback(() => {
    onResetPassword(trainer);
  }, [onResetPassword, trainer]);

  return (
    <li className={cnAdminTrainersRow()} data-email={trainer.email} data-status={trainer.status}>
      <span>{trainer.email}</span>
      <span>{statusLabel(trainer.status)}</span>
      <Button onClick={handleStatusClick} type='button'>
        {trainer.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
      </Button>
      <Button onClick={handleResetPassword} type='button'>
        Сбросить пароль
      </Button>
    </li>
  );
};
