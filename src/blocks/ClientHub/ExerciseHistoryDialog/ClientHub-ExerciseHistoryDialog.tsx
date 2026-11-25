import { type FC, useCallback, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';

import type { Exercise } from '../../../services/exercises/exercises.models';
import { listExercises } from '../../../services/exercises/exercises.service';
import { DialogContent } from '../../Dialog/Content/Dialog-Content';
import { Dialog } from '../../Dialog/Dialog';
import { DialogTitle } from '../../Dialog/Title/Dialog-Title';
import { ClientHubExerciseHistoryEmpty } from '../ExerciseHistoryEmpty/ClientHub-ExerciseHistoryEmpty';
import { ClientHubExerciseHistoryError } from '../ExerciseHistoryError/ClientHub-ExerciseHistoryError';
import { ClientHubExerciseHistoryLoading } from '../ExerciseHistoryLoading/ClientHub-ExerciseHistoryLoading';
import { ClientHubExerciseHistoryOption } from '../ExerciseHistoryOption/ClientHub-ExerciseHistoryOption';

const cnClientHub = cn('ClientHub');

type ClientHubExerciseHistoryDialogProps = {
  onCancel(): void;
  onSelect(exerciseId: string): void;
};

type ClientHubExerciseHistoryDialogState = {
  exercises: readonly Exercise[];
  loading: boolean;
  error?: string;
  setExercises(value: readonly Exercise[]): void;
  setLoading(value: boolean): void;
  setError(value: string | undefined): void;
};

export const ClientHubExerciseHistoryDialog: FC<ClientHubExerciseHistoryDialogProps> = observer(
  ({ onCancel, onSelect }) => {
    const state = useLocalObservable<ClientHubExerciseHistoryDialogState>(() => ({
      exercises: [],
      loading: true,
      setExercises(value) {
        this.exercises = value;
      },
      setLoading(value) {
        this.loading = value;
      },
      setError(value) {
        this.error = value;
      }
    }));

    const loadExercises = useCallback(async () => {
      state.setLoading(true);
      state.setError(undefined);
      try {
        const exercises = await listExercises();
        state.setExercises(exercises);
      } catch {
        state.setExercises([]);
        state.setError('Не удалось загрузить упражнения');
      } finally {
        state.setLoading(false);
      }
    }, [state]);

    useEffect(() => {
      void loadExercises();
    }, [loadExercises]);

    const handleRetry = useCallback(() => {
      void loadExercises();
    }, [loadExercises]);

    const ready = !state.loading && state.error === undefined;

    return (
      <Dialog ariaLabel='Выбор упражнения' className={cnClientHub('ExerciseHistoryDialog')} onCancel={onCancel}>
        <DialogTitle>История упражнения</DialogTitle>
        <DialogContent>
          {state.loading && <ClientHubExerciseHistoryLoading />}
          {!state.loading && state.error !== undefined && (
            <ClientHubExerciseHistoryError error={state.error} onRetry={handleRetry} />
          )}
          {ready && state.exercises.length === 0 && <ClientHubExerciseHistoryEmpty />}
          {ready &&
            state.exercises.map(exercise => (
              <ClientHubExerciseHistoryOption
                exerciseId={exercise.id}
                key={exercise.id}
                name={exercise.name}
                onSelect={onSelect}
              />
            ))}
        </DialogContent>
      </Dialog>
    );
  }
);
