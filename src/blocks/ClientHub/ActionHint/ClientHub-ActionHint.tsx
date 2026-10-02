import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-ActionHint.scss';

const cnClientHub = cn('ClientHub');

type ClientHubActionHintProps = {
  readonly children: ReactNode;
};

export const ClientHubActionHint: FC<ClientHubActionHintProps> = ({ children }) => {
  return <p className={cnClientHub('ActionHint')}>{children}</p>;
};
