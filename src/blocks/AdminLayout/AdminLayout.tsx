import { observer } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import type { FC } from 'react';
import { Navigate } from 'react-router-dom';

import { isPlatformAdmin } from '../../services/trainers/trainers.utils';
import { currentUserStore } from '../../stores/currentUser.store';
import { AdminLayoutContent } from './Content/AdminLayout-Content';
import { AdminLayoutHeader } from './Header/AdminLayout-Header';

import './AdminLayout.scss';

const cnAdminLayout = cn('AdminLayout');

export const AdminLayout: FC = observer(() => {
  if (!isPlatformAdmin(currentUserStore.roles)) {
    return <Navigate replace to='/clients' />;
  }

  return (
    <div className={cnAdminLayout()}>
      <AdminLayoutHeader />
      <AdminLayoutContent />
    </div>
  );
});
