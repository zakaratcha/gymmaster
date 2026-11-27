import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-SplitButton.scss';

const cnClientHubSplitButton = cn('ClientHub', 'SplitButton');

type ClientHubSplitButtonProps = {
  readonly children: ReactNode;
  readonly disabled: boolean;
  onClick(): void;
};

export const ClientHubSplitButton: FC<ClientHubSplitButtonProps> = ({ children, disabled, onClick }) => {
  return (
    <Button
      className={cnClientHubSplitButton()}
      color='secondary'
      disabled={disabled}
      onClick={onClick}
      size='s'
      type='button'
    >
      {children}
    </Button>
  );
};
