import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-SectionLabel.scss';

const cnClientHubSectionLabel = cn('ClientHub', 'SectionLabel');

type ClientHubSectionLabelProps = {
  readonly children: ReactNode;
};

export const ClientHubSectionLabel: FC<ClientHubSectionLabelProps> = ({ children }) => {
  return <span className={cnClientHubSectionLabel()}>{children}</span>;
};
