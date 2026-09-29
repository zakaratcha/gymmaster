import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { ClientHubSection } from '../Section/ClientHub-Section';
import { ClientHubSoonHint } from '../SoonHint/ClientHub-SoonHint';
import { ClientHubSplitActions } from '../SplitActions/ClientHub-SplitActions';
import { ClientHubSplitButton } from '../SplitButton/ClientHub-SplitButton';
import { ClientHubSplitRow } from '../SplitRow/ClientHub-SplitRow';
import { ClientHubSplitTags } from '../SplitTags/ClientHub-SplitTags';

const cnClientHub = cn('ClientHub');

export const ClientHubSplit: FC = () => {
  return (
    <ClientHubSection className={cnClientHub('Split')} title='Сплит' type='split'>
      <ClientHubSoonHint>Скоро</ClientHubSoonHint>
      <ClientHubSplitRow>
        <ClientHubSplitTags>ноги · верх · день А</ClientHubSplitTags>
        <ClientHubSplitActions>
          <ClientHubSplitButton disabled>+ тег</ClientHubSplitButton>
          <ClientHubSplitButton ariaLabel='Настройки сплита' disabled>
            ⚙
          </ClientHubSplitButton>
        </ClientHubSplitActions>
      </ClientHubSplitRow>
    </ClientHubSection>
  );
};
