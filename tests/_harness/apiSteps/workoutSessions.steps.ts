import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ApiError } from '../../../src/services/api/api.models';
import type {
  CreateWorkoutSessionRequest,
  UpdateWorkoutSessionRequest
} from '../../../src/services/workoutSessions/workoutSessions.models';
import { createClient, createClientForTrainer } from '../commands/clients/createClient';
import { createExercise, createExerciseForTrainer } from '../commands/exercises/createExercise';
import { updateExercise } from '../commands/exercises/updateExercise';
import { createPlan } from '../commands/plans/plans';
import {
  completeWorkoutSession,
  completeWorkoutSessionForTrainer,
  completeWorkoutSessionWithoutAuth,
  createWorkoutSession,
  createWorkoutSessionForTrainer,
  createWorkoutSessionWithoutAuth,
  getActiveWorkoutSession,
  getActiveWorkoutSessionForTrainer,
  getActiveWorkoutSessionWithoutAuth,
  getLatestCompletedWorkoutSession,
  getLatestCompletedWorkoutSessionForTrainer,
  getLatestCompletedWorkoutSessionWithoutAuth,
  getWorkoutSession,
  getWorkoutSessionForTrainer,
  getWorkoutSessionWithoutAuth,
  updateWorkoutSession,
  updateWorkoutSessionForTrainer,
  updateWorkoutSessionWithoutAuth
} from '../commands/workoutSessions/workoutSessions';
import type { ApiWorld } from '../world.api';

const INVALID_ID = '00000000-0000-0000-0000-000000000000';

function setApiError(this: ApiWorld, error: unknown): void {
  this.lastError = error instanceof ApiError ? error : undefined;
}

function substituteIds(this: ApiWorld, value: string): string {
  return value
    .replaceAll('<clientId>', this.client?.id ?? '')
    .replaceAll('<planId>', this.plan?.id ?? '')
    .replaceAll('<firstExerciseId>', this.exercises?.[0]?.id ?? '')
    .replaceAll('<secondExerciseId>', this.exercises?.[1]?.id ?? '')
    .replaceAll('<thirdExerciseId>', this.exercises?.[2]?.id ?? '')
    .replaceAll('<fourthExerciseId>', this.exercises?.[3]?.id ?? '')
    .replaceAll('<foreignExerciseId>', this.foreignExercise?.id ?? '')
    .replaceAll('<archivedExerciseId>', this.archivedExercise?.id ?? '')
    .replaceAll('<invalidExerciseId>', INVALID_ID);
}

function requireClient(this: ApiWorld): string {
  if (this.client === undefined) {
    throw new Error('Нет клиента для операции с тренировкой');
  }

  return this.client.id;
}

function requirePlanId(this: ApiWorld): string {
  if (this.plan === undefined) {
    throw new Error('Нет плана для операции с тренировкой');
  }

  return this.plan.id;
}

function requireSessionId(this: ApiWorld): string {
  if (this.workoutSession === undefined) {
    throw new Error('Нет сессии для операции с тренировкой');
  }

  return this.workoutSession.id;
}

function saveWorkoutSession(this: ApiWorld, response: { readonly workoutSession: ApiWorld['workoutSession'] }): void {
  const session = response.workoutSession;
  if (session === undefined) {
    throw new Error('API не вернул тренировку');
  }

  this.workoutSession = session;
  this.workoutSessions = [...(this.workoutSessions ?? []), session];
  this.lastError = undefined;
}

Given('подготовлены клиент и план тренировки для сессии', async function (this: ApiWorld) {
  const client = await createClient({ name: 'Анна' });
  const exerciseNames = ['Присед', 'Жим', 'Тяга', 'Разгибание'];
  const exercises = [];
  for (const name of exerciseNames) {
    exercises.push(await createExercise({ name }));
  }

  const firstExercise = exercises[0];
  if (firstExercise === undefined) {
    throw new Error('Нет упражнения для плана тренировки');
  }

  this.client = client;
  this.exercise = firstExercise;
  this.exercises = exercises;
  this.plan = await createPlan(client.id, {
    plannedDate: '2099-12-31',
    splitTag: 'сила',
    exercises: [
      {
        exerciseId: exercises[0]?.id ?? '',
        sets: [
          { reps: 8, weightKg: 80.5 },
          { reps: 10, weightKg: 82.5 }
        ]
      },
      { exerciseId: exercises[1]?.id ?? '', sets: [{ reps: 10, weightKg: 50 }] },
      { exerciseId: exercises[2]?.id ?? '', sets: [{ reps: 5, weightKg: 100 }] },
      { exerciseId: exercises[3]?.id ?? '', sets: [{ reps: 12, weightKg: 40 }] }
    ]
  });
});

Given('существует второй клиент и план для сессии', async function (this: ApiWorld) {
  const firstExercise = this.exercises?.[0];
  if (firstExercise === undefined) {
    throw new Error('Нет упражнения для второго плана');
  }

  this.secondaryClient = await createClient({ name: 'Борис' });
  this.secondaryPlan = await createPlan(this.secondaryClient.id, {
    plannedDate: '2099-12-31',
    splitTag: 'второй',
    exercises: [{ exerciseId: firstExercise.id, sets: [{ reps: 12, weightKg: 60 }] }]
  });
});

Given('существует клиент другого тренера', async function (this: ApiWorld) {
  this.trainerClient = await createClientForTrainer({ name: 'Второй тренер' });
});

Given('существует чужое упражнение для сессии {string}', async function (this: ApiWorld, name: string) {
  this.foreignExercise = await createExerciseForTrainer({ name });
});

Given('существует архивное упражнение для сессии {string}', async function (this: ApiWorld, name: string) {
  const exercise = await createExercise({ name });
  this.archivedExercise = await updateExercise(exercise.id, { archived: true });
});

Given('создана тренировка через API', async function (this: ApiWorld) {
  const response = await createWorkoutSession(requireClient.call(this), { plannedWorkoutId: requirePlanId.call(this) });
  saveWorkoutSession.call(this, response);
});

When('я начинаю тренировку через API', async function (this: ApiWorld) {
  try {
    const response = await createWorkoutSession(requireClient.call(this), {
      plannedWorkoutId: requirePlanId.call(this)
    });
    saveWorkoutSession.call(this, response);
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я начинаю тренировку через API с телом JSON:', async function (this: ApiWorld, json: string) {
  try {
    const payload = JSON.parse(substituteIds.call(this, json)) as CreateWorkoutSessionRequest;
    saveWorkoutSession.call(this, await createWorkoutSession(requireClient.call(this), payload));
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я начинаю тренировку через API для второго клиента', async function (this: ApiWorld) {
  if (this.secondaryClient === undefined || this.secondaryPlan === undefined) {
    throw new Error('Нет второго клиента и плана');
  }

  try {
    saveWorkoutSession.call(
      this,
      await createWorkoutSession(this.secondaryClient.id, { plannedWorkoutId: this.secondaryPlan.id })
    );
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я начинаю тренировку через API для чужого клиента', async function (this: ApiWorld) {
  try {
    saveWorkoutSession.call(
      this,
      await createWorkoutSessionForTrainer(requireClient.call(this), { plannedWorkoutId: requirePlanId.call(this) })
    );
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я начинаю тренировку через API с чужим планом', async function (this: ApiWorld) {
  if (this.trainerClient === undefined) {
    throw new Error('Нет клиента второго тренера');
  }

  try {
    saveWorkoutSession.call(
      this,
      await createWorkoutSessionForTrainer(this.trainerClient.id, { plannedWorkoutId: requirePlanId.call(this) })
    );
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я начинаю тренировку через API без авторизации', async function (this: ApiWorld) {
  try {
    saveWorkoutSession.call(
      this,
      await createWorkoutSessionWithoutAuth(requireClient.call(this), { plannedWorkoutId: requirePlanId.call(this) })
    );
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я запрашиваю тренировку через API', async function (this: ApiWorld) {
  try {
    const response = await getWorkoutSession(requireClient.call(this), requireSessionId.call(this));
    this.workoutSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я запрашиваю активную тренировку через API', async function (this: ApiWorld) {
  try {
    const response = await getActiveWorkoutSession(requireClient.call(this));
    this.activeWorkoutSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я запрашиваю последнюю завершённую тренировку через API', async function (this: ApiWorld) {
  try {
    const response = await getLatestCompletedWorkoutSession(requireClient.call(this));
    this.latestCompletedSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я обновляю тренировку через API с телом JSON:', async function (this: ApiWorld, json: string) {
  try {
    const payload = JSON.parse(substituteIds.call(this, json)) as UpdateWorkoutSessionRequest;
    const response = await updateWorkoutSession(requireClient.call(this), requireSessionId.call(this), payload);
    this.workoutSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я завершаю тренировку через API', async function (this: ApiWorld) {
  try {
    const response = await completeWorkoutSession(requireClient.call(this), requireSessionId.call(this));
    const completedSession = response.workoutSession;
    this.workoutSession = completedSession;
    this.workoutSessions = (this.workoutSessions ?? []).map(session =>
      session.id === completedSession.id ? completedSession : session
    );
    this.firstCompletedAt ??= completedSession.completedAt;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я запрашиваю тренировку через API от имени другого тренера', async function (this: ApiWorld) {
  try {
    const response = await getWorkoutSessionForTrainer(requireClient.call(this), requireSessionId.call(this));
    this.workoutSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я обновляю тренировку через API от имени другого тренера', async function (this: ApiWorld) {
  const exerciseId = this.exercises?.[0]?.id;
  if (exerciseId === undefined) {
    throw new Error('Нет упражнения для чужого обновления');
  }

  try {
    const response = await updateWorkoutSessionForTrainer(requireClient.call(this), requireSessionId.call(this), {
      exercises: [{ exerciseId, sets: [{ reps: 9, weightKg: 45 }] }]
    });
    this.workoutSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я завершаю тренировку через API от имени другого тренера', async function (this: ApiWorld) {
  try {
    const response = await completeWorkoutSessionForTrainer(requireClient.call(this), requireSessionId.call(this));
    this.workoutSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я запрашиваю активную тренировку через API от имени другого тренера', async function (this: ApiWorld) {
  try {
    const response = await getActiveWorkoutSessionForTrainer(requireClient.call(this));
    this.activeWorkoutSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я запрашиваю последнюю завершённую тренировку от имени другого тренера', async function (this: ApiWorld) {
  try {
    const response = await getLatestCompletedWorkoutSessionForTrainer(requireClient.call(this));
    this.latestCompletedSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я запрашиваю тренировку через API без авторизации', async function (this: ApiWorld) {
  try {
    const response = await getWorkoutSessionWithoutAuth(requireClient.call(this), requireSessionId.call(this));
    this.workoutSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я запрашиваю активную тренировку через API без авторизации', async function (this: ApiWorld) {
  try {
    const response = await getActiveWorkoutSessionWithoutAuth(requireClient.call(this));
    this.activeWorkoutSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я запрашиваю последнюю завершённую тренировку без авторизации', async function (this: ApiWorld) {
  try {
    const response = await getLatestCompletedWorkoutSessionWithoutAuth(requireClient.call(this));
    this.latestCompletedSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я обновляю тренировку через API без авторизации', async function (this: ApiWorld) {
  const exerciseId = this.exercises?.[0]?.id;
  if (exerciseId === undefined) {
    throw new Error('Нет упражнения для неавторизованного обновления');
  }

  try {
    const response = await updateWorkoutSessionWithoutAuth(requireClient.call(this), requireSessionId.call(this), {
      exercises: [{ exerciseId, sets: [{ reps: 9, weightKg: 45 }] }]
    });
    this.workoutSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я завершаю тренировку через API без авторизации', async function (this: ApiWorld) {
  try {
    const response = await completeWorkoutSessionWithoutAuth(requireClient.call(this), requireSessionId.call(this));
    this.workoutSession = response.workoutSession;
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

Then('созданная тренировка копирует план', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(this.workoutSession).toMatchObject({
    clientId: this.client?.id,
    plannedWorkoutId: this.plan?.id,
    splitTag: this.plan?.splitTag,
    status: 'in_progress',
    startedAt: expect.any(String)
  });
  expect(this.workoutSession?.exercises).toEqual(this.plan?.exercises);
});

Then('созданная тренировка прочитана', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(this.workoutSession?.id).toBe(this.workoutSessions?.[0]?.id);
  expect(this.workoutSession?.exercises).toEqual(this.plan?.exercises);
});

Then('активная тренировка является созданной', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(this.activeWorkoutSession?.id).toBe(this.workoutSession?.id);
});

Then('активной тренировки нет', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(this.activeWorkoutSession).toBeNull();
});

Then('последняя завершённая тренировка является созданной', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(this.latestCompletedSession?.id).toBe(this.workoutSessions?.[0]?.id);
  expect(this.latestCompletedSession?.status).toBe('completed');
});

Then('агрегатный PATCH заменяет упражнения и подходы', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(
    this.workoutSession?.exercises.map(exercise => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      sets: exercise.sets
    }))
  ).toEqual([
    {
      exerciseId: this.exercises?.[3]?.id,
      exerciseName: 'Разгибание',
      sets: [
        { reps: 12, weightKg: 40 },
        { reps: 8, weightKg: 42.5 }
      ]
    },
    {
      exerciseId: this.exercises?.[0]?.id,
      exerciseName: 'Присед',
      sets: [{ reps: 9, weightKg: 81 }]
    },
    {
      exerciseId: this.exercises?.[1]?.id,
      exerciseName: 'Жим',
      sets: [{ reps: 10, weightKg: 50 }]
    }
  ]);
});

Then('тренировка завершена', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(this.workoutSession?.status).toBe('completed');
  expect(this.workoutSession?.completedAt).toEqual(expect.any(String));
});

Then('повторное завершение сохраняет время завершения', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(this.workoutSession?.status).toBe('completed');
  expect(this.workoutSession?.completedAt).toBe(this.firstCompletedAt);
});

Then('для двух клиентов созданы активные тренировки', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(this.workoutSessions).toHaveLength(2);
  expect(this.workoutSessions?.map(session => session.clientId)).toEqual([this.client?.id, this.secondaryClient?.id]);
  expect(this.workoutSessions?.every(session => session.status === 'in_progress')).toBe(true);
});

Then('после завершения создана новая тренировка', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(this.workoutSessions).toHaveLength(2);
  const [completedSession, newSession] = this.workoutSessions ?? [];
  expect(completedSession?.status).toBe('completed');
  expect(newSession?.status).toBe('in_progress');
  expect(newSession?.id).not.toBe(completedSession?.id);
});
