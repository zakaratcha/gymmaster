import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-SplitActions.scss';

const cnClientHubSplitActions = cn('ClientHub', 'SplitActions');

type ClientHubSplitActionsProps = {
  readonly children: ReactNode;
};

export const ClientHubSplitActions: FC<ClientHubSplitActionsProps> = ({ children }) => {
  return <div className={cnClientHubSplitActions()}>{children}</div>;
};
