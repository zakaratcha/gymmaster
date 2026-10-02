import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-ActiveWorkoutTime.scss';

const cnClientHubActiveWorkoutTime = cn('ClientHub', 'ActiveWorkoutTime');

type ClientHubActiveWorkoutTimeProps = {
  readonly children: ReactNode;
};

export const ClientHubActiveWorkoutTime: FC<ClientHubActiveWorkoutTimeProps> = ({ children }) => {
  return <span className={cnClientHubActiveWorkoutTime()}>{children}</span>;
};
