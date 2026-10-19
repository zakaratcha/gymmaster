import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './TabsSkeleton.scss';

const cnTabsSkeleton = cn('TabsSkeleton');

export type TabsSkeletonProps = {
  readonly tabs?: number;
};

export const TabsSkeleton: FC<TabsSkeletonProps> = ({ tabs = 2 }) => {
  return (
    <div aria-busy='true' aria-live='polite' className={cnTabsSkeleton()}>
      {Array.from({ length: tabs }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
};
