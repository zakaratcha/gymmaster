import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './SplitTagField-Suggestions.scss';

const cnSplitTagFieldSuggestions = cn('SplitTagField', 'Suggestions');

type SplitTagFieldSuggestionsProps = {
  readonly children: ReactNode;
};

export const SplitTagFieldSuggestions: FC<SplitTagFieldSuggestionsProps> = ({ children }) => {
  return (
    <div aria-label='Подсказки тегов' className={cnSplitTagFieldSuggestions()} role='group'>
      {children}
    </div>
  );
};
