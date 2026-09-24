import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-SessionsError.scss';

const cnClientHubSessionsError = cn('ClientHub', 'SessionsError');

type ClientHubSessionsErrorProps = {
  readonly error: string;
  onRetry(): void;
};

export const ClientHubSessionsError: FC<ClientHubSessionsErrorProps> = ({ error, onRetry }) => {
  return (
    <div className={cnClientHubSessionsError()}>
      <p>{error}</p>
      <Button color='secondary' onClick={onRetry} type='button'>
        Повторить
      </Button>
    </div>
  );
};
