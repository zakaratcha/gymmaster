import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import { Button } from '../../Button/Button';

const cnAdminTrainersCreate = cn('AdminTrainers', 'Create');

export const AdminTrainersCreate: FC = () => {
  return (
    <Button asChild className={cnAdminTrainersCreate()} color='primary'>
      <Link to='/admin/trainers/new'>+ Создать</Link>
    </Button>
  );
};
