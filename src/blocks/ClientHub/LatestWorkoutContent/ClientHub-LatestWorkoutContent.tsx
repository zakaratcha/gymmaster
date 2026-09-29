import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-LatestWorkoutContent.scss';

const cnClientHubLatestWorkoutContent = cn('ClientHub', 'LatestWorkoutContent');

type ClientHubLatestWorkoutContentProps = {
  readonly children: ReactNode;
};

export const ClientHubLatestWorkoutContent: FC<ClientHubLatestWorkoutContentProps> = ({ children }) => {
  return <div className={cnClientHubLatestWorkoutContent()}>{children}</div>;
};
