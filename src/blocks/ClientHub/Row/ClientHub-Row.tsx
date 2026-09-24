import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-Row.scss';

const cnClientHubRow = cn('ClientHub', 'Row');

type ClientHubRowProps = {
  readonly children: ReactNode;
};

export const ClientHubRow: FC<ClientHubRowProps> = ({ children }) => {
  return <div className={cnClientHubRow()}>{children}</div>;
};
