import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-SoonHint.scss';

const cnClientHubSoonHint = cn('ClientHub', 'SoonHint');

type ClientHubSoonHintProps = {
  readonly children: ReactNode;
};

export const ClientHubSoonHint: FC<ClientHubSoonHintProps> = ({ children }) => {
  return <p className={cnClientHubSoonHint()}>{children}</p>;
};
