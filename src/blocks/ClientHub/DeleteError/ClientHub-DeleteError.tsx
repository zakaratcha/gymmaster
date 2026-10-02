import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-DeleteError.scss';

const cnClientHubDeleteError = cn('ClientHub', 'DeleteError');

type ClientHubDeleteErrorProps = {
  readonly error: string;
};

export const ClientHubDeleteError: FC<ClientHubDeleteErrorProps> = ({ error }) => {
  return (
    <p className={cnClientHubDeleteError()} role='alert'>
      {error}
    </p>
  );
};
