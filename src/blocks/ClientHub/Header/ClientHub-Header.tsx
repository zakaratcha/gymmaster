import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { Client } from '../../../services/clients/clients.models';
import { ClientHubBack } from '../Back/ClientHub-Back';
import { ClientHubEdit } from '../Edit/ClientHub-Edit';
import { ClientHubTitle } from '../Title/ClientHub-Title';

import './ClientHub-Header.scss';

const cnClientHubHeader = cn('ClientHub', 'Header');

type ClientHubHeaderProps = {
  readonly client: Client | undefined;
  onEdit(): void;
};

export const ClientHubHeader: FC<ClientHubHeaderProps> = ({ client, onEdit }) => {
  return (
    <header className={cnClientHubHeader()}>
      <ClientHubBack />
      <ClientHubTitle name={client?.name} />
      <ClientHubEdit disabled={client === undefined} onClick={onEdit} />
    </header>
  );
};
