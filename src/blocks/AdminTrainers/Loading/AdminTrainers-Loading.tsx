import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Loading } from '../../Loading/Loading';

import './AdminTrainers-Loading.scss';

const cnAdminTrainersLoading = cn('AdminTrainers', 'Loading');

export const AdminTrainersLoading: FC = () => {
  return (
    <div className={cnAdminTrainersLoading()}>
      <Loading visible />
    </div>
  );
};
