import { cn } from '@bem-react/classname';
import type { FC } from 'react';

import './Clients.scss';

const cnClients = cn('Clients');

export const Clients: FC = () => {
  return (
    <div className={cnClients()}>
      <main className={cnClients('Main')}>
        <h1 className={cnClients('Title')}>Клиенты</h1>
      </main>
    </div>
  );
};
