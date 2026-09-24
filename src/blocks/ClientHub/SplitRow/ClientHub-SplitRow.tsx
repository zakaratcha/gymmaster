import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-SplitRow.scss';

const cnClientHubSplitRow = cn('ClientHub', 'SplitRow');

type ClientHubSplitRowProps = {
  readonly children: ReactNode;
};

export const ClientHubSplitRow: FC<ClientHubSplitRowProps> = ({ children }) => {
  return <div className={cnClientHubSplitRow()}>{children}</div>;
};
