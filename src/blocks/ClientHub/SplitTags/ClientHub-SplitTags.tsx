import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-SplitTags.scss';

const cnClientHubSplitTags = cn('ClientHub', 'SplitTags');

type ClientHubSplitTagsProps = {
  readonly children: ReactNode;
};

export const ClientHubSplitTags: FC<ClientHubSplitTagsProps> = ({ children }) => {
  return <span className={cnClientHubSplitTags()}>{children}</span>;
};
