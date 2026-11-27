import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { ClientHubActionButton } from '../ActionButton/ClientHub-ActionButton';
import { ClientHubActionHint } from '../ActionHint/ClientHub-ActionHint';
import { ClientHubActionRow } from '../ActionRow/ClientHub-ActionRow';
import { ClientHubSection } from '../Section/ClientHub-Section';

const cnClientHub = cn('ClientHub');

type ClientHubActionsProps = {
  readonly active: boolean;
  readonly emptyStartDisabled: boolean;
  readonly startDisabled: boolean;
  onEmptyStart(): void;
  onStart(): void;
};

export const ClientHubActions: FC<ClientHubActionsProps> = ({
  active,
  emptyStartDisabled,
  startDisabled,
  onEmptyStart,
  onStart
}) => {
  return (
    <ClientHubSection className={cnClientHub('Actions')} title='Действия' type='actions'>
      {active && <ClientHubActionHint>У клиента уже есть тренировка в процессе</ClientHubActionHint>}
      <ClientHubActionRow>
        <ClientHubActionButton disabled={startDisabled} onClick={onStart}>
          Старт с плана ▼
        </ClientHubActionButton>
        <ClientHubActionButton disabled={emptyStartDisabled} onClick={onEmptyStart}>
          Пустая сессия
        </ClientHubActionButton>
      </ClientHubActionRow>
    </ClientHubSection>
  );
};
