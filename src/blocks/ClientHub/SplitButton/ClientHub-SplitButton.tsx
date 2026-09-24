import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-SplitButton.scss';

const cnClientHubSplitButton = cn('ClientHub', 'SplitButton');

type ClientHubSplitButtonProps = {
  readonly ariaLabel?: string;
  readonly children: ReactNode;
  readonly disabled: boolean;
};

export const ClientHubSplitButton: FC<ClientHubSplitButtonProps> = ({ ariaLabel, children, disabled }) => {
  return (
    <Button aria-label={ariaLabel} className={cnClientHubSplitButton()} disabled={disabled} type='button'>
      {children}
    </Button>
  );
};
