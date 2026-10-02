import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-ActionRow.scss';

const cnClientHubActionRow = cn('ClientHub', 'ActionRow');

type ClientHubActionRowProps = {
  readonly children: ReactNode;
};

export const ClientHubActionRow: FC<ClientHubActionRowProps> = ({ children }) => {
  return <div className={cnClientHubActionRow()}>{children}</div>;
};
