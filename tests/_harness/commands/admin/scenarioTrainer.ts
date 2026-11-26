import { randomUUID } from 'node:crypto';

export type ScenarioTrainer = {
  id?: string;
  email: string;
  password: string;
};

type ForeignClient = {
  readonly id: string;
  readonly name: string;
};

let scenarioTrainer: ScenarioTrainer | undefined;
let secondScenarioTrainer: ScenarioTrainer | undefined;
let foreignClient: ForeignClient | undefined;
let finishAdminWorkouts = false;

export function resetScenarioTrainer(): void {
  scenarioTrainer = undefined;
  secondScenarioTrainer = undefined;
  foreignClient = undefined;
  finishAdminWorkouts = false;
}

export function createScenarioTrainerEmail(): string {
  return `trainer-${randomUUID()}@local`;
}

export function rememberScenarioTrainer(trainer: ScenarioTrainer): void {
  scenarioTrainer = trainer;
}

export function requireScenarioTrainer(): ScenarioTrainer {
  if (scenarioTrainer === undefined) {
    throw new Error('Нет учётки, созданной в сценарии');
  }

  return scenarioTrainer;
}

export function rememberSecondScenarioTrainer(trainer: ScenarioTrainer): void {
  secondScenarioTrainer = trainer;
}

export function requireSecondScenarioTrainer(): ScenarioTrainer {
  if (secondScenarioTrainer === undefined) {
    throw new Error('Нет второй учётки, созданной в сценарии');
  }

  return secondScenarioTrainer;
}

export function rememberForeignClient(client: ForeignClient): void {
  foreignClient = client;
}

export function requireForeignClient(): ForeignClient {
  if (foreignClient === undefined) {
    throw new Error('Нет клиента второго тренера');
  }

  return foreignClient;
}

export function markFinishAdminWorkouts(): void {
  finishAdminWorkouts = true;
}

export function takeFinishAdminWorkouts(): boolean {
  const finish = finishAdminWorkouts;
  finishAdminWorkouts = false;
  return finish;
}
