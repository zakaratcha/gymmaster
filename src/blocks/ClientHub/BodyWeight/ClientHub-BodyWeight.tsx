import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { Client } from '../../../services/clients/clients.models';
import { formatBodyWeightKg } from '../format';
import { ClientHubRow } from '../Row/ClientHub-Row';
import { ClientHubSection } from '../Section/ClientHub-Section';
import { ClientHubSectionLabel } from '../SectionLabel/ClientHub-SectionLabel';

import './ClientHub-BodyWeight.scss';

const cnClientHubBodyWeight = cn('ClientHub', 'BodyWeight');

type ClientHubBodyWeightProps =
  | {
      readonly client: Client;
      readonly value?: never;
    }
  | {
      readonly client?: never;
      readonly value: string;
    };

export const ClientHubBodyWeight: FC<ClientHubBodyWeightProps> = props => {
  if (props.client !== undefined) {
    return (
      <ClientHubSection type='bodyWeight'>
        <ClientHubRow>
          <ClientHubSectionLabel>Вес тела</ClientHubSectionLabel>
          <span className={cnClientHubBodyWeight()}>{formatBodyWeightKg(props.client.bodyWeightKg)}</span>
        </ClientHubRow>
      </ClientHubSection>
    );
  }

  return <span className={cnClientHubBodyWeight()}>{props.value}</span>;
};
