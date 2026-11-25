import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ExerciseHistory } from '../ExerciseHistory/ExerciseHistory';

import './ExerciseHistoryScreen.scss';

const cnExerciseHistoryScreen = cn('ExerciseHistoryScreen');

export const ExerciseHistoryScreen: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, exerciseId } = useParams<{ id: string; exerciseId: string }>();

  const handleClose = useCallback(() => {
    if (location.key !== 'default') {
      void navigate(-1);
      return;
    }

    if (id !== undefined && id.length > 0) {
      void navigate(`/clients/${encodeURIComponent(id)}`);
    }
  }, [id, location.key, navigate]);

  if (id === undefined || id.length === 0 || exerciseId === undefined || exerciseId.length === 0) {
    return null;
  }

  return (
    <div className={cnExerciseHistoryScreen()}>
      <ExerciseHistory clientId={id} closeLabel='Назад' exerciseId={exerciseId} onClose={handleClose} />
    </div>
  );
};
