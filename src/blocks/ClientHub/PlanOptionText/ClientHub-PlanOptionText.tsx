import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-PlanOptionText.scss';

const cnClientHubPlanOptionText = cn('ClientHub', 'PlanOptionText');

type ClientHubPlanOptionTextProps = {
  readonly children: ReactNode;
};

export const ClientHubPlanOptionText: FC<ClientHubPlanOptionTextProps> = ({ children }) => {
  return <span className={cnClientHubPlanOptionText()}>{children}</span>;
};
