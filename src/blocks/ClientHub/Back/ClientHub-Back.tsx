import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import './ClientHub-Back.scss';

const cnClientHubBack = cn('ClientHub', 'Back');

export const ClientHubBack: FC = () => {
  return (
    <Link aria-label='Назад к списку клиентов' className={cnClientHubBack()} to='/clients'>
      ←
    </Link>
  );
};
