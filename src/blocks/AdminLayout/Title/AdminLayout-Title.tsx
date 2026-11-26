import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './AdminLayout-Title.scss';

const cnAdminLayoutTitle = cn('AdminLayout', 'Title');

export const AdminLayoutTitle: FC = () => {
  return <h1 className={cnAdminLayoutTitle()}>Администрирование</h1>;
};
