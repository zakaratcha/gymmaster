import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { ClientHubError } from '../Error/ClientHub-Error';
import { ClientHubRetry } from '../Retry/ClientHub-Retry';

import './ClientHub-ErrorBlock.scss';

const cnClientHubErrorBlock = cn('ClientHub', 'ErrorBlock');

type ClientHubErrorBlockProps = {
  readonly error: string;
  onRetry(): void;
};

export const ClientHubErrorBlock: FC<ClientHubErrorBlockProps> = ({ error, onRetry }) => {
  return (
    <div className={cnClientHubErrorBlock()}>
      <ClientHubError error={error} />
      <ClientHubRetry onRetry={onRetry} />
    </div>
  );
};
