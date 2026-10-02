import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-Error.scss';

const cnClientHubError = cn('ClientHub', 'Error');

type ClientHubErrorProps = {
  readonly error: string;
};

export const ClientHubError: FC<ClientHubErrorProps> = ({ error }) => {
  return <p className={cnClientHubError()}>{error}</p>;
};
