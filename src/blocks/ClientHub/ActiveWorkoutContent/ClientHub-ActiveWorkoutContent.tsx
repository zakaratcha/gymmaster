import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-ActiveWorkoutContent.scss';

const cnClientHubActiveWorkoutContent = cn('ClientHub', 'ActiveWorkoutContent');

type ClientHubActiveWorkoutContentProps = {
  readonly children: ReactNode;
};

export const ClientHubActiveWorkoutContent: FC<ClientHubActiveWorkoutContentProps> = ({ children }) => {
  return <div className={cnClientHubActiveWorkoutContent()}>{children}</div>;
};
