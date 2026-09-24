import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-Retry.scss';

const cnClientHubRetry = cn('ClientHub', 'Retry');

type ClientHubRetryProps = {
  onRetry(): void;
};

export const ClientHubRetry: FC<ClientHubRetryProps> = ({ onRetry }) => {
  return (
    <Button className={cnClientHubRetry()} color='secondary' onClick={onRetry} type='button'>
      Повторить
    </Button>
  );
};
