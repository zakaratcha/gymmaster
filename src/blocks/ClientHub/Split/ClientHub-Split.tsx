import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';
import { ClientHubSection } from '../Section/ClientHub-Section';

import './ClientHub-Split.scss';

const cnClientHub = cn('ClientHub');

export const ClientHubSplit: FC = () => {
  return (
    <ClientHubSection title='Сплит' type='split'>
      <p className={cnClientHub('SoonHint')}>Скоро</p>
      <div className={cnClientHub('SplitRow')}>
        <span className={cnClientHub('SplitTags')}>ноги · верх · день А</span>
        <div className={cnClientHub('SplitActions')}>
          <Button className={cnClientHub('SplitButton')} disabled type='button'>
            + тег
          </Button>
          <Button aria-label='Настройки сплита' className={cnClientHub('SplitButton')} disabled type='button'>
            ⚙
          </Button>
        </div>
      </div>
    </ClientHubSection>
  );
};
