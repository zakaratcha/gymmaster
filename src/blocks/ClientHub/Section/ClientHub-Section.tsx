import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import { ClientHubSectionTitle } from '../SectionTitle/ClientHub-SectionTitle';

import './ClientHub-Section.scss';

const cnClientHubSection = cn('ClientHub', 'Section');

type ClientHubSectionProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly title?: string;
  readonly type: 'actions' | 'activeWorkout' | 'bodyWeight' | 'latestWorkout' | 'notes' | 'plan' | 'split';
};

export const ClientHubSection: FC<ClientHubSectionProps> = ({ children, className, title, type }) => {
  return (
    <section className={cnClientHubSection({ type }, [className])}>
      {title !== undefined && <ClientHubSectionTitle>{title}</ClientHubSectionTitle>}
      {children}
    </section>
  );
};
