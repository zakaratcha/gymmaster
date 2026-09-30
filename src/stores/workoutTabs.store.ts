import { action, makeObservable, observable } from 'mobx';

import type { ActiveWorkoutSession } from '../services/workoutSessions/workoutSessions.models';
import { listActiveWorkoutSessions } from '../services/workoutSessions/workoutSessions.service';

const DEFAULT_HOME_PATH = '/clients';
const WORKOUT_PATH_PREFIX = '/workouts/';

class WorkoutTabsStore {
  @observable sessions: readonly ActiveWorkoutSession[] = [];
  @observable loading = false;
  @observable loaded = false;
  @observable error?: string;
  @observable mainPath?: string;

  private generation = 0;

  constructor() {
    makeObservable(this);
  }

  get homePath(): string {
    return this.mainPath ?? DEFAULT_HOME_PATH;
  }

  @action
  rememberMainPath(pathname: string): void {
    if (pathname.startsWith(WORKOUT_PATH_PREFIX)) {
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
    this.generation = 0;
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
