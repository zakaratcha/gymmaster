import { type ChangeEvent, type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { filterSplitTagSuggestions } from '../../services/splitTags/splitTags.utils';
import { Input } from '../Input/Input';
import { SplitTagFieldSuggestion } from './Suggestion/SplitTagField-Suggestion';
import { SplitTagFieldSuggestions } from './Suggestions/SplitTagField-Suggestions';

import './SplitTagField.scss';

const cnSplitTagField = cn('SplitTagField');

export type SplitTagFieldProps = {
  readonly className?: string;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly id: string;
  readonly label: string;
  readonly placeholder?: string;
  readonly tags: readonly string[];
  readonly value: string;
  onChange(value: string): void;
};

export const SplitTagField: FC<SplitTagFieldProps> = ({
  className,
  disabled,
  error,
  id,
  label,
  placeholder,
  tags,
  value,
  onChange
}) => {
  const suggestions = filterSplitTagSuggestions(tags, value);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <div className={cnSplitTagField(null, [className])}>
      <Input
        disabled={disabled}
        error={error}
        id={id}
        label={label}
        onChange={handleChange}
        placeholder={placeholder}
        value={value}
      />
      {suggestions.length > 0 && (
        <SplitTagFieldSuggestions>
          {suggestions.map(tag => (
            <SplitTagFieldSuggestion disabled={disabled} key={tag} tag={tag} onSelect={onChange} />
          ))}
        </SplitTagFieldSuggestions>
      )}
    </div>
  );
};
