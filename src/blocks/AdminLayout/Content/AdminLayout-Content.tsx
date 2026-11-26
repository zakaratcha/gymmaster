import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Outlet } from 'react-router-dom';

import './AdminLayout-Content.scss';

const cnAdminLayoutContent = cn('AdminLayout', 'Content');

export const AdminLayoutContent: FC = () => {
  return (
    <div className={cnAdminLayoutContent()}>
      <Outlet />
    </div>
  );
};
