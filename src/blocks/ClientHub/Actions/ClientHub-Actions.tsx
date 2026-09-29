import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { ClientHubActionButton } from '../ActionButton/ClientHub-ActionButton';
import { ClientHubActionHint } from '../ActionHint/ClientHub-ActionHint';
import { ClientHubActionRow } from '../ActionRow/ClientHub-ActionRow';
import { ClientHubSection } from '../Section/ClientHub-Section';

const cnClientHub = cn('ClientHub');

type ClientHubActionsProps = {
  readonly active: boolean;
  readonly disabled: boolean;
  onStart(): void;
};

export const ClientHubActions: FC<ClientHubActionsProps> = ({ active, disabled, onStart }) => {
  return (
    <ClientHubSection className={cnClientHub('Actions')} title='Действия' type='actions'>
      {active && <ClientHubActionHint>У клиента уже есть тренировка в процессе</ClientHubActionHint>}
      <ClientHubActionRow>
        <ClientHubActionButton disabled={disabled} onClick={onStart} />
      </ClientHubActionRow>
    </ClientHubSection>
  );
};
