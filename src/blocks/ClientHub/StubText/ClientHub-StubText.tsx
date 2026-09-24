import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-StubText.scss';

const cnClientHubStubText = cn('ClientHub', 'StubText');

type ClientHubStubTextProps = {
  readonly children: ReactNode;
};

export const ClientHubStubText: FC<ClientHubStubTextProps> = ({ children }) => {
  return <p className={cnClientHubStubText()}>{children}</p>;
};
