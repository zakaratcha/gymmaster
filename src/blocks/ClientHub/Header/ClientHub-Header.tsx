import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import type { Client } from '../../../services/clients/clients.models';
import { Button } from '../../Button/Button';

import './ClientHub-Header.scss';

const cnClientHubHeader = cn('ClientHub', 'Header');
const cnClientHub = cn('ClientHub');

type ClientHubHeaderProps = {
  readonly client: Client | undefined;
  onEdit(): void;
};

export const ClientHubHeader: FC<ClientHubHeaderProps> = ({ client, onEdit }) => {
  return (
    <header className={cnClientHubHeader()}>
      <Link aria-label='Назад к списку клиентов' className={cnClientHub('Back')} to='/clients'>
        ←
      </Link>
      <h1 className={cnClientHub('Title')}>{client?.name ?? 'Клиент'}</h1>
      <Button className={cnClientHub('Edit')} disabled={client === undefined} onClick={onEdit} type='button'>
        Править
      </Button>
    </header>
  );
};
