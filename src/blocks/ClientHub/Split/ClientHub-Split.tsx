import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { ClientHubSection } from '../Section/ClientHub-Section';
import { ClientHubSplitActions } from '../SplitActions/ClientHub-SplitActions';
import { ClientHubSplitButton } from '../SplitButton/ClientHub-SplitButton';
import { ClientHubSplitEmpty } from '../SplitEmpty/ClientHub-SplitEmpty';
import { ClientHubSplitError } from '../SplitError/ClientHub-SplitError';
import { ClientHubSplitLoading } from '../SplitLoading/ClientHub-SplitLoading';
import { ClientHubSplitRow } from '../SplitRow/ClientHub-SplitRow';
import { ClientHubSplitTags } from '../SplitTags/ClientHub-SplitTags';

const cnClientHub = cn('ClientHub');

type ClientHubSplitProps = {
  readonly addDisabled: boolean;
  readonly error: string | undefined;
  readonly loading: boolean;
  readonly tags: readonly string[];
  onAdd(): void;
  onRetry(): void;
};

export const ClientHubSplit: FC<ClientHubSplitProps> = ({ addDisabled, error, loading, tags, onAdd, onRetry }) => {
  const ready = !loading && error === undefined;

  return (
    <ClientHubSection className={cnClientHub('Split')} title='Сплит' type='split'>
      {loading && <ClientHubSplitLoading />}
      {error !== undefined && <ClientHubSplitError error={error} onRetry={onRetry} />}
      <ClientHubSplitRow>
        {ready && tags.length === 0 && <ClientHubSplitEmpty />}
        {ready && tags.length > 0 && <ClientHubSplitTags tags={tags} />}
        <ClientHubSplitActions>
          <ClientHubSplitButton disabled={addDisabled} onClick={onAdd}>
            + тег
          </ClientHubSplitButton>
        </ClientHubSplitActions>
      </ClientHubSplitRow>
    </ClientHubSection>
  );
};
