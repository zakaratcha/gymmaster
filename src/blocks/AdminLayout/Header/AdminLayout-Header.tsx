import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { AdminLayoutBack } from '../Back/AdminLayout-Back';
import { AdminLayoutTitle } from '../Title/AdminLayout-Title';

import './AdminLayout-Header.scss';

const cnAdminLayoutHeader = cn('AdminLayout', 'Header');

export const AdminLayoutHeader: FC = () => {
  return (
    <header className={cnAdminLayoutHeader()}>
      <AdminLayoutBack />
      <AdminLayoutTitle />
    </header>
  );
};
