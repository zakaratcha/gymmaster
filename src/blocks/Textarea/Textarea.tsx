import { type ChangeEvent, type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';
import * as Label from '@radix-ui/react-label';

import './Textarea.scss';

const cnTextarea = cn('Textarea');

type TextareaProps = {
  readonly id: string;
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly disabled?: boolean;
  readonly className?: string;
  onChange(value: string): void;
};

export const Textarea: FC<TextareaProps> = ({
  id,
  label,
  name,
  value,
  placeholder,
  rows = 3,
  disabled,
  className,
  onChange
}) => {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <div className={cnTextarea(null, [className])}>
      <Label.Root className={cnTextarea('Label')} htmlFor={id}>
        {label}
      </Label.Root>
      <textarea
        className={cnTextarea('Control')}
        disabled={disabled}
        id={id}
        name={name}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </div>
  );
};
