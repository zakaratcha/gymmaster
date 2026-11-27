import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import './SplitTagField-Suggestion.scss';

const cnSplitTagFieldSuggestion = cn('SplitTagField', 'Suggestion');

type SplitTagFieldSuggestionProps = {
  readonly disabled?: boolean;
  readonly tag: string;
  onSelect(tag: string): void;
};

export const SplitTagFieldSuggestion: FC<SplitTagFieldSuggestionProps> = ({ disabled, tag, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(tag);
  }, [onSelect, tag]);

  return (
    <button className={cnSplitTagFieldSuggestion()} disabled={disabled} onClick={handleClick} type='button'>
      {tag}
    </button>
  );
};
