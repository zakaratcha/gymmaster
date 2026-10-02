import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-PlansError.scss';

const cnClientHubPlansError = cn('ClientHub', 'PlansError');

type ClientHubPlansErrorProps = {
  readonly error: string;
  onRetry(): void;
};

export const ClientHubPlansError: FC<ClientHubPlansErrorProps> = ({ error, onRetry }) => {
  return (
    <div className={cnClientHubPlansError()}>
      <p>{error}</p>
      <Button color='secondary' onClick={onRetry} type='button'>
        Повторить
      </Button>
    </div>
  );
};
