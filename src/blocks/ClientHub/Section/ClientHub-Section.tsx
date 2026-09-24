import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-Section.scss';

const cnClientHubSection = cn('ClientHub', 'Section');
const cnClientHub = cn('ClientHub');

type ClientHubSectionProps = {
  readonly children: ReactNode;
  readonly title?: string;
  readonly type: 'actions' | 'activeWorkout' | 'bodyWeight' | 'latestWorkout' | 'notes' | 'plan' | 'split';
};

export const ClientHubSection: FC<ClientHubSectionProps> = ({ children, title, type }) => {
  return (
    <section className={cnClientHubSection({ type })}>
      {title !== undefined && <h2 className={cnClientHub('SectionTitle')}>{title}</h2>}
      {children}
    </section>
  );
};
