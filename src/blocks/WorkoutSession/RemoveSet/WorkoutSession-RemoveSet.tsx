import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';
import type { SetAction } from '../types';

import './WorkoutSession-RemoveSet.scss';

const cnWorkoutSessionRemoveSet = cn('WorkoutSession', 'RemoveSet');

type WorkoutSessionRemoveSetProps = {
  readonly disabled: boolean;
  readonly exercisePosition: number;
  readonly setPosition: number;
  onAction(action: SetAction, exercisePosition: number, setPosition?: number): void;
};

export const WorkoutSessionRemoveSet: FC<WorkoutSessionRemoveSetProps> = ({
  disabled,
  exercisePosition,
  setPosition,
  onAction
}) => {
  const handleClick = useCallback(() => {
    onAction('remove', exercisePosition, setPosition);
  }, [exercisePosition, onAction, setPosition]);

  return (
    <Button
      aria-label={`Удалить подход ${setPosition + 1} у упражнения ${exercisePosition + 1}`}
      className={cnWorkoutSessionRemoveSet()}
      disabled={disabled}
      onClick={handleClick}
    >
      ×
    </Button>
  );
};
