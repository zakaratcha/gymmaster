import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-ActiveWorkoutInfo.scss';

const cnClientHubActiveWorkoutInfo = cn('ClientHub', 'ActiveWorkoutInfo');

type ClientHubActiveWorkoutInfoProps = {
  readonly children: ReactNode;
};

export const ClientHubActiveWorkoutInfo: FC<ClientHubActiveWorkoutInfoProps> = ({ children }) => {
  return <div className={cnClientHubActiveWorkoutInfo()}>{children}</div>;
};
