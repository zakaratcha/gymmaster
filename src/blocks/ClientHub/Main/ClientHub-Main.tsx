import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-Main.scss';

const cnClientHubMain = cn('ClientHub', 'Main');

type ClientHubMainProps = {
  readonly children: ReactNode;
};

export const ClientHubMain: FC<ClientHubMainProps> = ({ children }) => {
  return <main className={cnClientHubMain()}>{children}</main>;
};
