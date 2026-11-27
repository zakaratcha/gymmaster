import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-SplitTag.scss';

const cnClientHubSplitTag = cn('ClientHub', 'SplitTag');

type ClientHubSplitTagProps = {
  readonly children: ReactNode;
};

export const ClientHubSplitTag: FC<ClientHubSplitTagProps> = ({ children }) => {
  return <li className={cnClientHubSplitTag()}>{children}</li>;
};
