import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';
import { ClientHubSection } from '../Section/ClientHub-Section';

const cnClientHub = cn('ClientHub');

type ClientHubHistoryProps = {
  onOpen(): void;
};

export const ClientHubHistory: FC<ClientHubHistoryProps> = ({ onOpen }) => {
  return (
    <ClientHubSection className={cnClientHub('History')} title='История' type='history'>
      <Button onClick={onOpen} type='button'>
        История упражнения…
      </Button>
    </ClientHubSection>
  );
};
