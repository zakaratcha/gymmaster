import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-LatestWorkoutStats.scss';

const cnClientHubLatestWorkoutStats = cn('ClientHub', 'LatestWorkoutStats');

type ClientHubLatestWorkoutStatsProps = {
  readonly children: ReactNode;
};

export const ClientHubLatestWorkoutStats: FC<ClientHubLatestWorkoutStatsProps> = ({ children }) => {
  return <span className={cnClientHubLatestWorkoutStats()}>{children}</span>;
};
