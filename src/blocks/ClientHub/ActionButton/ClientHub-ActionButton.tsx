import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-ActionButton.scss';

const cnClientHub = cn('ClientHub');

type ClientHubActionButtonProps = {
  readonly children: ReactNode;
  readonly disabled: boolean;
  readonly primary?: boolean;
  onClick(): void;
};

export const ClientHubActionButton: FC<ClientHubActionButtonProps> = ({
  children,
  disabled,
  primary = false,
  onClick
}) => {
  return (
    <Button
      className={cnClientHub('ActionButton')}
      color={primary ? 'primary' : 'default'}
      disabled={disabled}
      onClick={onClick}
      type='button'
    >
      {children}
    </Button>
  );
};
