import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-LatestWorkoutTag.scss';

const cnClientHubLatestWorkoutTag = cn('ClientHub', 'LatestWorkoutTag');

type ClientHubLatestWorkoutTagProps = {
  readonly children: ReactNode;
};

export const ClientHubLatestWorkoutTag: FC<ClientHubLatestWorkoutTagProps> = ({ children }) => {
  return <span className={cnClientHubLatestWorkoutTag()}>{children}</span>;
};
