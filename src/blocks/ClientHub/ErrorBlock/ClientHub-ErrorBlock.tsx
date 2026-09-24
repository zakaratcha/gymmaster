import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-ErrorBlock.scss';

const cnClientHub = cn('ClientHub');

type ClientHubErrorBlockProps = {
  readonly error: string;
  onRetry(): void;
};

export const ClientHubErrorBlock: FC<ClientHubErrorBlockProps> = ({ error, onRetry }) => {
  return (
    <div className={cnClientHub('ErrorBlock')}>
      <p className={cnClientHub('Error')}>{error}</p>
      <Button className={cnClientHub('Retry')} color='secondary' onClick={onRetry} type='button'>
        Повторить
      </Button>
    </div>
  );
};
