import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './AdminTrainers-Empty.scss';

const cnAdminTrainersEmpty = cn('AdminTrainers', 'Empty');

export const AdminTrainersEmpty: FC = () => {
  return <p className={cnAdminTrainersEmpty()}>Других учёток пока нет</p>;
};
