import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-ExerciseHistoryOption.scss';

const cnClientHubExerciseHistoryOption = cn('ClientHub', 'ExerciseHistoryOption');

type ClientHubExerciseHistoryOptionProps = {
  readonly exerciseId: string;
  readonly name: string;
  onSelect(exerciseId: string): void;
};

export const ClientHubExerciseHistoryOption: FC<ClientHubExerciseHistoryOptionProps> = ({
  exerciseId,
  name,
  onSelect
}) => {
  const handleClick = useCallback(() => {
    onSelect(exerciseId);
  }, [exerciseId, onSelect]);

  return (
    <Button className={cnClientHubExerciseHistoryOption()} onClick={handleClick} type='button'>
      {name}
    </Button>
  );
};
