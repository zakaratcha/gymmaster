import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-SectionTitle.scss';

const cnClientHubSectionTitle = cn('ClientHub', 'SectionTitle');

type ClientHubSectionTitleProps = {
  readonly children: ReactNode;
};

export const ClientHubSectionTitle: FC<ClientHubSectionTitleProps> = ({ children }) => {
  return <h2 className={cnClientHubSectionTitle()}>{children}</h2>;
};
