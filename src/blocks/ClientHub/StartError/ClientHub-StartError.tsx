import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-StartError.scss';

const cnClientHubStartError = cn('ClientHub', 'StartError');

type ClientHubStartErrorProps = {
  readonly children: ReactNode;
};

export const ClientHubStartError: FC<ClientHubStartErrorProps> = ({ children }) => {
  return (
    <p className={cnClientHubStartError()} role='alert'>
      {children}
    </p>
  );
};
