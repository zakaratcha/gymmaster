import { type FC, useCallback, useEffect, useRef } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';

import type { ExerciseHistoryResponse } from '../../services/exerciseHistory/exerciseHistory.models';
import { getExerciseHistory } from '../../services/exerciseHistory/exerciseHistory.service';
import { ExerciseHistoryEmpty } from './Empty/ExerciseHistory-Empty';
import { ExerciseHistoryError } from './Error/ExerciseHistory-Error';
import { ExerciseHistoryHeader } from './Header/ExerciseHistory-Header';
import { ExerciseHistoryLoading } from './Loading/ExerciseHistory-Loading';
import { ExerciseHistoryTable } from './Table/ExerciseHistory-Table';

import './ExerciseHistory.scss';

const cnExerciseHistory = cn('ExerciseHistory');

type ExerciseHistoryProps = {
  readonly clientId: string;
  readonly closeLabel: string;
  readonly exerciseId: string;
  onClose(): void;
};

type ExerciseHistoryState = {
  response?: ExerciseHistoryResponse;
  loading: boolean;
  error?: string;
  setResponse(value: ExerciseHistoryResponse | undefined): void;
  setLoading(value: boolean): void;
  setError(value: string | undefined): void;
};

export const ExerciseHistory: FC<ExerciseHistoryProps> = observer(({ clientId, closeLabel, exerciseId, onClose }) => {
  const state = useLocalObservable<ExerciseHistoryState>(() => ({
    loading: true,
    setResponse(value) {
      this.response = value;
    },
    setLoading(value) {
      this.loading = value;
    },
    setError(value) {
      this.error = value;
    }
  }));

  const loadGeneration = useRef(0);

  const loadHistory = useCallback(async () => {
    loadGeneration.current += 1;
    const generation = loadGeneration.current;
    state.setLoading(true);
    state.setError(undefined);
    state.setResponse(undefined);
    try {
      const response = await getExerciseHistory(clientId, exerciseId);
      if (loadGeneration.current !== generation) {
        return;
      }
      state.setResponse(response);
    } catch {
      if (loadGeneration.current !== generation) {
        return;
      }
      state.setError('Не удалось загрузить историю');
    } finally {
      if (loadGeneration.current === generation) {
        state.setLoading(false);
      }
    }
  }, [clientId, exerciseId, state]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleRetry = useCallback(() => {
    void loadHistory();
  }, [loadHistory]);

  const response = state.response;
  const title = response === undefined ? undefined : `История: ${response.exerciseName} · ${response.clientName}`;
  const loaded = !state.loading && state.error === undefined && response !== undefined;

  return (
    <div className={cnExerciseHistory()}>
      <ExerciseHistoryHeader
        closeLabel={closeLabel}
        title={loaded && response !== undefined ? title : undefined}
        onClose={onClose}
      />
      {state.loading && <ExerciseHistoryLoading />}
      {!state.loading && state.error !== undefined && (
        <ExerciseHistoryError error={state.error} onRetry={handleRetry} />
      )}
      {loaded && response !== undefined && response.entries.length === 0 && <ExerciseHistoryEmpty />}
      {loaded && response !== undefined && response.entries.length > 0 && (
        <ExerciseHistoryTable entries={response.entries} />
      )}
    </div>
  );
});
