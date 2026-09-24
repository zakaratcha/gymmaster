import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { Client } from '../../../services/clients/clients.models';
import { formatBodyWeightKg } from '../format';
import { ClientHubSection } from '../Section/ClientHub-Section';
import { ClientHubSectionLabel } from '../SectionLabel/ClientHub-SectionLabel';

import './ClientHub-BodyWeight.scss';

const cnClientHub = cn('ClientHub');

type ClientHubBodyWeightProps = {
  readonly client: Client;
};

export const ClientHubBodyWeight: FC<ClientHubBodyWeightProps> = ({ client }) => {
  return (
    <ClientHubSection type='bodyWeight'>
      <div className={cnClientHub('Row')}>
        <ClientHubSectionLabel>Вес тела</ClientHubSectionLabel>
        <span className={cnClientHub('BodyWeight')}>{formatBodyWeightKg(client.bodyWeightKg)}</span>
      </div>
    </ClientHubSection>
  );
};
