import { cn } from '@bem-react/classname';
import type { CSSProperties, FC } from 'react';

import './Loading.css';

const cnLoading = cn('Loading');

export type LoadingProps = {
  readonly visible?: boolean;
  readonly className?: string;
  readonly noBackdrop?: boolean;
  readonly size?: number;
};

export const Loading: FC<LoadingProps> = ({ visible, className, noBackdrop, size }) => {
  if (visible === false) {
    return null;
  }

  const style: CSSProperties | undefined =
    size === undefined ? undefined : ({ '--loading-size': `${String(size)}px` } as CSSProperties);

  return (
    <div aria-busy='true' aria-live='polite' className={cnLoading({ noBackdrop }, [className])} style={style}>
      <div aria-hidden='true' className={cnLoading('Spinner')} />
    </div>
  );
};
