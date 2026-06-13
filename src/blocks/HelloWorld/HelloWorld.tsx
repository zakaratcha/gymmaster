import { cn } from '@bem-react/classname';
import type { FC } from 'react';

import './HelloWorld.css';

const classname = cn('HelloWorld');

export type HelloWorldProps = {
  readonly apiLine?: string;
};

export const HelloWorld: FC<HelloWorldProps> = ({ apiLine }) => {
  return (
    <div className={classname()}>
      <h1 className={classname('Title')}>Hello world!</h1>
      {apiLine === undefined ? null : <p className={classname('ApiLine')}>{apiLine}</p>}
    </div>
  );
};
