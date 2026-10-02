import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-ActiveWorkoutTag.scss';

const cnClientHubActiveWorkoutTag = cn('ClientHub', 'ActiveWorkoutTag');

type ClientHubActiveWorkoutTagProps = {
  readonly children: ReactNode;
};

export const ClientHubActiveWorkoutTag: FC<ClientHubActiveWorkoutTagProps> = ({ children }) => {
  return <span className={cnClientHubActiveWorkoutTag()}>{children}</span>;
};
