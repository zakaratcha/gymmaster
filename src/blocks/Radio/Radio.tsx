import { type ChangeEvent, type FC, type ReactNode, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import './Radio.scss';

const cnRadio = cn('Radio');

export type RadioProps = {
  readonly checked: boolean;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly name: string;
  readonly value: string;
  readonly children: ReactNode;
  onChange(value: string): void;
};

export const Radio: FC<RadioProps> = ({ checked, className, disabled = false, name, value, children, onChange }) => {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.currentTarget.value);
    },
    [onChange]
  );

  return (
    <label className={cnRadio({ checked, disabled }, [className])}>
      <input
        checked={checked}
        className={cnRadio('Control')}
        disabled={disabled}
        name={name}
        onChange={handleChange}
        type='radio'
        value={value}
      />
      <span className={cnRadio('Label')}>{children}</span>
    </label>
  );
};
