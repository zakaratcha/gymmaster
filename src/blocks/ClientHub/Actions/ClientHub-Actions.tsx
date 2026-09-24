import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';
import { ClientHubActionRow } from '../ActionRow/ClientHub-ActionRow';
import { ClientHubSection } from '../Section/ClientHub-Section';

import './ClientHub-Actions.scss';

const cnClientHub = cn('ClientHub');

type ClientHubActionsProps = {
  readonly active: boolean;
  readonly disabled: boolean;
  onStart(): void;
};

export const ClientHubActions: FC<ClientHubActionsProps> = ({ active, disabled, onStart }) => {
  return (
    <ClientHubSection title='Действия' type='actions'>
      {active && <p className={cnClientHub('ActionHint')}>У клиента уже есть тренировка в процессе</p>}
      <ClientHubActionRow>
        <Button className={cnClientHub('ActionButton')} disabled={disabled} onClick={onStart} type='button'>
          Старт с плана ▼
        </Button>
      </ClientHubActionRow>
    </ClientHubSection>
  );
};
