import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ApiError } from '../../../src/services/api/api.models';
import type { ExerciseHistoryResponse } from '../../../src/services/exerciseHistory/exerciseHistory.models';
import { createClient } from '../commands/clients/createClient';
import {
  getExerciseHistory,
  getExerciseHistoryForTrainer,
  getExerciseHistoryWithoutAuth
} from '../commands/exerciseHistory/exerciseHistory';
import { createExercise } from '../commands/exercises/createExercise';
import { updateExercise } from '../commands/exercises/updateExercise';
import {
  completeWorkoutSession,
  createWorkoutSession,
  updateWorkoutSession
} from '../commands/workoutSessions/workoutSessions';
import type { ApiWorld } from '../world.api';

const MISSING_EXERCISE_ID = '00000000-0000-0000-0000-000000000000';

type HistorySet = {
  readonly reps: number;
  readonly weightKg: number;
};

function setApiError(this: ApiWorld, error: unknown): void {
  if (error instanceof ApiError) {
    this.lastError = error;
    return;
  }

  throw error;
}

function requireClientId(this: ApiWorld): string {
  if (this.client === undefined) {
    throw new Error('Нет клиента для истории упражнения');
  }

  return this.client.id;
}

function requireExercise(this: ApiWorld, name: string): { readonly id: string; readonly name: string } {
  const exercise = this.exercises?.find(item => item.name === name);
  if (exercise === undefined) {
    throw new Error(`Нет упражнения «${name}» для истории`);
  }

  return exercise;
}

function parseSets(value: string): HistorySet[] {
  return value.split(',').map(part => {
    const match = /^(?<reps>\d+)×(?<weight>\d+(?:\.\d+)?)$/.exec(part.trim());
    if (match?.groups?.reps === undefined || match.groups.weight === undefined) {
      throw new Error(`Некорректный подход «${part}»`);
    }

    return { reps: Number(match.groups.reps), weightKg: Number(match.groups.weight) };
  });
}

function rememberHistory(
  this: ApiWorld,
  sessionId: string,
  groups: readonly { readonly exerciseName: string; readonly sets: readonly HistorySet[] }[]
): void {
  const byName = new Map<string, HistorySet[]>();
  for (const group of groups) {
    const sets = byName.get(group.exerciseName) ?? [];
    sets.push(...group.sets);
    byName.set(group.exerciseName, sets);
  }

  const fixtures = [...(this.historyFixtures ?? [])];
  for (const [exerciseName, sets] of byName) {
    fixtures.push({ sessionId, exerciseName, sets });
  }
  this.historyFixtures = fixtures;
}

async function saveSession(
  this: ApiWorld,
  clientId: string,
  groups: readonly {
    readonly exerciseId: string;
    readonly exerciseName: string;
    readonly sets: readonly HistorySet[];
  }[],
  complete: boolean
): Promise<void> {
  const created = await createWorkoutSession(clientId, { splitTag: 'сила' });
  await updateWorkoutSession(clientId, created.workoutSession.id, {
    exercises: groups.map(group => ({ exerciseId: group.exerciseId, sets: group.sets }))
  });

  if (!complete) {
    this.workoutSession = created.workoutSession;
    return;
  }

  const completed = await completeWorkoutSession(clientId, created.workoutSession.id);
  this.workoutSession = completed.workoutSession;
  rememberHistory.call(
    this,
    completed.workoutSession.id,
    groups.map(group => ({ exerciseName: group.exerciseName, sets: group.sets }))
  );
}

async function readHistory(this: ApiWorld, clientId: string, exerciseId: string): Promise<void> {
  try {
    this.exerciseHistory = await getExerciseHistory(clientId, exerciseId);
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
}

function reversed<T>(values: readonly T[]): T[] {
  const result: T[] = [];
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (value !== undefined) {
      result.push(value);
    }
  }

  return result;
}

function requireHistory(this: ApiWorld): ExerciseHistoryResponse {
  if (this.exerciseHistory === undefined) {
    throw new Error('История упражнения не загружена');
  }

  return this.exerciseHistory;
}

Given('подготовлены клиент и упражнения для истории упражнения', async function (this: ApiWorld) {
  this.client = await createClient({ name: 'Анна' });
  const squat = await createExercise({ name: 'Присед' });
  const bench = await createExercise({ name: 'Жим' });
  this.exercise = squat;
  this.exercises = [squat, bench];
  this.historyFixtures = [];
});

Given(
  'завершена тренировка с упражнением {string} и подходами {string}',
  async function (this: ApiWorld, exerciseName: string, setsText: string) {
    const exercise = requireExercise.call(this, exerciseName);
    await saveSession.call(
      this,
      requireClientId.call(this),
      [{ exerciseId: exercise.id, exerciseName, sets: parseSets(setsText) }],
      true
    );
  }
);

Given(
  'завершена тренировка с упражнением {string} без подходов',
  async function (this: ApiWorld, exerciseName: string) {
    const exercise = requireExercise.call(this, exerciseName);
    await saveSession.call(
      this,
      requireClientId.call(this),
      [{ exerciseId: exercise.id, exerciseName, sets: [] }],
      true
    );
  }
);

Given(
  'начата тренировка с упражнением {string} и подходами {string}',
  async function (this: ApiWorld, exerciseName: string, setsText: string) {
    const exercise = requireExercise.call(this, exerciseName);
    await saveSession.call(
      this,
      requireClientId.call(this),
      [{ exerciseId: exercise.id, exerciseName, sets: parseSets(setsText) }],
      false
    );
  }
);

Given(
  'у другого клиента завершена тренировка с упражнением {string} и подходами {string}',
  async function (this: ApiWorld, exerciseName: string, setsText: string) {
    const exercise = requireExercise.call(this, exerciseName);
    this.secondaryClient = await createClient({ name: 'Борис' });
    const created = await createWorkoutSession(this.secondaryClient.id, { splitTag: 'чужая' });
    await updateWorkoutSession(this.secondaryClient.id, created.workoutSession.id, {
      exercises: [{ exerciseId: exercise.id, sets: parseSets(setsText) }]
    });
    await completeWorkoutSession(this.secondaryClient.id, created.workoutSession.id);
  }
);

Given(
  'завершена тренировка с двумя вхождениями {string}: {string} и {string}',
  async function (this: ApiWorld, exerciseName: string, firstSets: string, secondSets: string) {
    const exercise = requireExercise.call(this, exerciseName);
    await saveSession.call(
      this,
      requireClientId.call(this),
      [
        { exerciseId: exercise.id, exerciseName, sets: parseSets(firstSets) },
        { exerciseId: exercise.id, exerciseName, sets: parseSets(secondSets) }
      ],
      true
    );
  }
);

Given('упражнение {string} перенесено в архив через API', async function (this: ApiWorld, exerciseName: string) {
  const exercise = requireExercise.call(this, exerciseName);
  await updateExercise(exercise.id, { archived: true });
});

When('я запрашиваю историю упражнения {string} через API', async function (this: ApiWorld, exerciseName: string) {
  const exercise = requireExercise.call(this, exerciseName);
  await readHistory.call(this, requireClientId.call(this), exercise.id);
});

When(
  'я запрашиваю историю упражнения {string} у чужого клиента через API',
  async function (this: ApiWorld, exerciseName: string) {
    if (this.trainerClient === undefined) {
      throw new Error('Нет чужого клиента');
    }

    const exercise = requireExercise.call(this, exerciseName);
    await readHistory.call(this, this.trainerClient.id, exercise.id);
  }
);

When('я запрашиваю историю чужого упражнения через API', async function (this: ApiWorld) {
  if (this.foreignExercise === undefined) {
    throw new Error('Нет чужого упражнения');
  }

  await readHistory.call(this, requireClientId.call(this), this.foreignExercise.id);
});

When('я запрашиваю историю несуществующего упражнения через API', async function (this: ApiWorld) {
  await readHistory.call(this, requireClientId.call(this), MISSING_EXERCISE_ID);
});

When(
  'я запрашиваю историю упражнения {string} через API от имени другого тренера',
  async function (this: ApiWorld, exerciseName: string) {
    const exercise = requireExercise.call(this, exerciseName);
    try {
      this.exerciseHistory = await getExerciseHistoryForTrainer(requireClientId.call(this), exercise.id);
      this.lastError = undefined;
    } catch (error) {
      setApiError.call(this, error);
    }
  }
);

When(
  'я запрашиваю историю упражнения {string} через API без авторизации',
  async function (this: ApiWorld, exerciseName: string) {
    const exercise = requireExercise.call(this, exerciseName);
    try {
      this.exerciseHistory = await getExerciseHistoryWithoutAuth(requireClientId.call(this), exercise.id);
      this.lastError = undefined;
    } catch (error) {
      setApiError.call(this, error);
    }
  }
);

Then('история упражнения пуста', function (this: ApiWorld) {
  expect(requireHistory.call(this).entries).toEqual([]);
});

Then('история упражнения содержит имя клиента и название {string}', function (this: ApiWorld, exerciseName: string) {
  const history = requireHistory.call(this);
  expect(history.clientName).toBe(this.client?.name);
  expect(history.exerciseName).toBe(exerciseName);
});

Then('история упражнения {string} содержит завершённые тренировки', function (this: ApiWorld, exerciseName: string) {
  const history = requireHistory.call(this);
  const fixtures = (this.historyFixtures ?? []).filter(fixture => fixture.exerciseName === exerciseName);
  expect(history.entries.map(entry => entry.sessionId)).toEqual(reversed(fixtures.map(fixture => fixture.sessionId)));
  expect(history.entries.map(entry => entry.sets)).toEqual(reversed(fixtures.map(fixture => [...fixture.sets])));
});

Then('в истории упражнения одна запись с подходами по порядку', function (this: ApiWorld) {
  const history = requireHistory.call(this);
  const fixture = this.historyFixtures?.[0];
  expect(history.entries).toHaveLength(1);
  expect(history.entries[0]?.sessionId).toBe(fixture?.sessionId);
  expect(history.entries[0]?.sets).toEqual(fixture?.sets);
});
