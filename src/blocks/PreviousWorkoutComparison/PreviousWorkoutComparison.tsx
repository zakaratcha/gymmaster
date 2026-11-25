import { type FC, useCallback, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { useParams } from 'react-router-dom';

import { buildPreviousWorkoutComparison } from '../../services/workoutSessions/previousWorkoutComparison.utils';
import type { WorkoutSession as WorkoutSessionModel } from '../../services/workoutSessions/workoutSessions.models';
import { getPreviousWorkoutSession, getWorkoutSession } from '../../services/workoutSessions/workoutSessions.service';
import { PreviousWorkoutComparisonDates } from './Dates/PreviousWorkoutComparison-Dates';
import { PreviousWorkoutComparisonEmpty } from './Empty/PreviousWorkoutComparison-Empty';
import { PreviousWorkoutComparisonError } from './Error/PreviousWorkoutComparison-Error';
import { PreviousWorkoutComparisonHeader } from './Header/PreviousWorkoutComparison-Header';
import { PreviousWorkoutComparisonList } from './List/PreviousWorkoutComparison-List';
import { PreviousWorkoutComparisonLoading } from './Loading/PreviousWorkoutComparison-Loading';
import { PreviousWorkoutComparisonSummary } from './Summary/PreviousWorkoutComparison-Summary';

import './PreviousWorkoutComparison.scss';

const cnPreviousWorkoutComparison = cn('PreviousWorkoutComparison');

type PreviousWorkoutComparisonState = {
  current?: WorkoutSessionModel;
  previous: WorkoutSessionModel | null;
  loading: boolean;
  error?: string;
  setCurrent(value: WorkoutSessionModel): void;
  setPrevious(value: WorkoutSessionModel | null): void;
  setLoading(value: boolean): void;
  setError(value: string | undefined): void;
};

export const PreviousWorkoutComparison: FC = observer(() => {
  const { clientId, sessionId } = useParams<{ clientId: string; sessionId: string }>();
  const state = useLocalObservable<PreviousWorkoutComparisonState>(() => ({
    previous: null,
    loading: true,
    setCurrent(value) {
      this.current = value;
    },
    setPrevious(value) {
      this.previous = value;
    },
    setLoading(value) {
      this.loading = value;
    },
    setError(value) {
      this.error = value;
    }
  }));

  const loadComparison = useCallback(async () => {
    if (clientId === undefined || clientId.length === 0 || sessionId === undefined || sessionId.length === 0) {
      state.setError('Тренировка не найдена');
      state.setLoading(false);
      return;
    }

    state.setLoading(true);
    state.setError(undefined);
    try {
      const [current, previous] = await Promise.all([
        getWorkoutSession(clientId, sessionId),
        getPreviousWorkoutSession(clientId, sessionId)
      ]);
      state.setCurrent(current);
      state.setPrevious(previous);
    } catch {
      state.setError('Не удалось загрузить сравнение');
    } finally {
      state.setLoading(false);
    }
  }, [clientId, sessionId, state]);

  useEffect(() => {
    void loadComparison();
  }, [loadComparison]);

  const handleRetry = useCallback(() => {
    void loadComparison();
  }, [loadComparison]);

  const backTo =
    clientId === undefined || clientId.length === 0 || sessionId === undefined || sessionId.length === 0
      ? '/clients'
      : `/workouts/${encodeURIComponent(clientId)}/${encodeURIComponent(sessionId)}`;
  const current = state.current;
  const previous = state.previous;

  if (state.loading) {
    return (
      <div className={cnPreviousWorkoutComparison()}>
        <PreviousWorkoutComparisonHeader backTo={backTo} />
        <PreviousWorkoutComparisonLoading />
      </div>
    );
  }

  if (state.error !== undefined) {
    return (
      <div className={cnPreviousWorkoutComparison()}>
        <PreviousWorkoutComparisonHeader backTo={backTo} splitTag={current?.splitTag} />
        <PreviousWorkoutComparisonError error={state.error} onRetry={handleRetry} />
      </div>
    );
  }

  if (current === undefined || previous === null) {
    return (
      <div className={cnPreviousWorkoutComparison()}>
        <PreviousWorkoutComparisonHeader backTo={backTo} splitTag={current?.splitTag} />
        <PreviousWorkoutComparisonEmpty>Прошлой аналогичной тренировки нет</PreviousWorkoutComparisonEmpty>
      </div>
    );
  }

  const comparison = buildPreviousWorkoutComparison(previous, current);

  return (
    <div className={cnPreviousWorkoutComparison()}>
      <PreviousWorkoutComparisonHeader backTo={backTo} splitTag={current.splitTag} />
      <PreviousWorkoutComparisonDates
        currentCompletedAt={current.completedAt ?? ''}
        previousCompletedAt={previous.completedAt ?? ''}
      />
      <PreviousWorkoutComparisonSummary comparison={comparison} />
      <PreviousWorkoutComparisonList rows={comparison.rows} />
    </div>
  );
});
