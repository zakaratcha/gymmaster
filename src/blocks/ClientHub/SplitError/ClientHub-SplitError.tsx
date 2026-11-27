import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-SplitError.scss';

const cnClientHubSplitError = cn('ClientHub', 'SplitError');

type ClientHubSplitErrorProps = {
  readonly error: string;
  onRetry(): void;
};

export const ClientHubSplitError: FC<ClientHubSplitErrorProps> = ({ error, onRetry }) => {
  return (
    <div className={cnClientHubSplitError()}>
      <p>{error}</p>
      <Button color='secondary' onClick={onRetry} type='button'>
        Повторить
      </Button>
    </div>
  );
};
