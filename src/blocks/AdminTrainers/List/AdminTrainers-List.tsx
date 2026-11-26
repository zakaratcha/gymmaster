import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { AdminTrainer } from '../../../services/trainers/trainers.models';
import { AdminTrainersRow } from '../Row/AdminTrainers-Row';

import './AdminTrainers-List.scss';

const cnAdminTrainersList = cn('AdminTrainers', 'List');

type AdminTrainersListProps = {
  readonly trainers: readonly AdminTrainer[];
  onBlock(trainer: AdminTrainer): void;
  onUnblock(trainer: AdminTrainer): void;
  onResetPassword(trainer: AdminTrainer): void;
};

export const AdminTrainersList: FC<AdminTrainersListProps> = ({ trainers, onBlock, onUnblock, onResetPassword }) => {
  return (
    <ul className={cnAdminTrainersList()}>
      {trainers.map(trainer => (
        <AdminTrainersRow
          key={trainer.id}
          trainer={trainer}
          onBlock={onBlock}
          onResetPassword={onResetPassword}
          onUnblock={onUnblock}
        />
      ))}
    </ul>
  );
};
