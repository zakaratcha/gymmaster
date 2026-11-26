import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import './AdminLayout-Back.scss';

const cnAdminLayoutBack = cn('AdminLayout', 'Back');

export const AdminLayoutBack: FC = () => {
  return (
    <Link className={cnAdminLayoutBack()} to='/account'>
      ← Назад
    </Link>
  );
};
