import { action, makeObservable, observable } from 'mobx';

import type { ActiveWorkoutSession } from '../services/workoutSessions/workoutSessions.models';
import { listActiveWorkoutSessions } from '../services/workoutSessions/workoutSessions.service';

const DEFAULT_HOME_PATH = '/clients';
const WORKOUT_PATH_PATTERN = /^\/workouts\/([^/]+)\/[^/]+\/?$/;

class WorkoutTabsStore {
  @observable sessions: readonly ActiveWorkoutSession[] = [];
  @observable loading = false;
  @observable loaded = false;
  @observable error?: string;
  @observable mainPath?: string;
  @observable workoutClientId?: string;

  private generation = 0;

  constructor() {
    makeObservable(this);
  }

  get homePath(): string {
    if (this.mainPath !== undefined) {
      return this.mainPath;
    }

    // Прямая ссылка или перезагрузка на экране тренировки: маршрут основного
    // интерфейса ещё не запомнен, поэтому возвращаем на карточку клиента этой
    // тренировки — как вкладка была открыта до перезагрузки.
    return this.workoutClientId === undefined
      ? DEFAULT_HOME_PATH
      : `/clients/${encodeURIComponent(this.workoutClientId)}`;
  }

  @action
  rememberPath(pathname: string): void {
    const match = WORKOUT_PATH_PATTERN.exec(pathname);
    const workoutClientId = match?.[1];

    if (workoutClientId !== undefined) {
      this.workoutClientId = decodeURIComponent(workoutClientId);
      return;
    }

    this.mainPath = pathname;
  }

  @action
  reset(): void {
    this.sessions = [];
    this.loading = false;
    this.loaded = false;
    this.error = undefined;
    this.mainPath = undefined;
    this.workoutClientId = undefined;
    // Счётчик монотонный: обнуление позволило бы незавершённому запросу
    // предыдущего тренера совпасть с поколением следующего.
    this.generation += 1;
  }

  load(): Promise<void> {
    this.generation += 1;
    const generation = this.generation;

    return this.runLoad(generation);
  }

  private async runLoad(generation: number): Promise<void> {
    this.startLoading();

    try {
      const sessions = await listActiveWorkoutSessions();
      if (generation === this.generation) {
        this.applySessions(sessions);
      }
    } catch {
      if (generation === this.generation) {
        this.applyError();
      }
    } finally {
      if (generation === this.generation) {
        this.stopLoading();
      }
    }
  }

  @action
  private startLoading(): void {
    this.loading = true;
    this.error = undefined;
  }

  @action
  private stopLoading(): void {
    this.loading = false;
  }

  @action
  private applySessions(sessions: readonly ActiveWorkoutSession[]): void {
    this.sessions = sessions;
    this.loaded = true;
  }

  @action
  private applyError(): void {
    this.error = 'Не удалось загрузить активные тренировки';
  }
}

export const workoutTabsStore = new WorkoutTabsStore();
