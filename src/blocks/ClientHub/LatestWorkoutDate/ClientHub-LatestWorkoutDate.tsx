import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-LatestWorkoutDate.scss';

const cnClientHubLatestWorkoutDate = cn('ClientHub', 'LatestWorkoutDate');

type ClientHubLatestWorkoutDateProps = {
  readonly children: ReactNode;
};

export const ClientHubLatestWorkoutDate: FC<ClientHubLatestWorkoutDateProps> = ({ children }) => {
  return <span className={cnClientHubLatestWorkoutDate()}>{children}</span>;
};
