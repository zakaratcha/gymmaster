import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-ActionButton.scss';

const cnClientHub = cn('ClientHub');

type ClientHubActionButtonProps = {
  readonly disabled: boolean;
  onClick(): void;
};

export const ClientHubActionButton: FC<ClientHubActionButtonProps> = ({ disabled, onClick }) => {
  return (
    <Button className={cnClientHub('ActionButton')} disabled={disabled} onClick={onClick} type='button'>
      Старт с плана ▼
    </Button>
  );
};
