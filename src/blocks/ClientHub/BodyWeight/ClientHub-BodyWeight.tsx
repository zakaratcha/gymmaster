import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { Client } from '../../../services/clients/clients.models';
import { formatBodyWeightKg } from '../../../services/util/format/format';
import { ClientHubRow } from '../Row/ClientHub-Row';
import { ClientHubSection } from '../Section/ClientHub-Section';
import { ClientHubSectionLabel } from '../SectionLabel/ClientHub-SectionLabel';

import './ClientHub-BodyWeight.scss';

const cnClientHubBodyWeight = cn('ClientHub', 'BodyWeight');

type ClientHubBodyWeightProps = {
  readonly client: Client;
};

export const ClientHubBodyWeight: FC<ClientHubBodyWeightProps> = ({ client }) => {
  return (
    <ClientHubSection className={cnClientHubBodyWeight()} type='bodyWeight'>
      <ClientHubRow>
        <ClientHubSectionLabel>Вес тела</ClientHubSectionLabel>
        <span>{formatBodyWeightKg(client.bodyWeightKg)}</span>
      </ClientHubRow>
    </ClientHubSection>
  );
};
