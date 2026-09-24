import { type FC } from 'react';

import { ClientHubSection } from '../Section/ClientHub-Section';
import { ClientHubSoonHint } from '../SoonHint/ClientHub-SoonHint';
import { ClientHubSplitActions } from '../SplitActions/ClientHub-SplitActions';
import { ClientHubSplitButton } from '../SplitButton/ClientHub-SplitButton';
import { ClientHubSplitRow } from '../SplitRow/ClientHub-SplitRow';
import { ClientHubSplitTags } from '../SplitTags/ClientHub-SplitTags';

export const ClientHubSplit: FC = () => {
  return (
    <ClientHubSection title='Сплит' type='split'>
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
