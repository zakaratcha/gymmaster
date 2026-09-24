import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ApiError } from '../../../src/services/api/api.models';
import type { CreateExerciseRequest, UpdateExerciseRequest } from '../../../src/services/exercises/exercises.models';
import { createExercise, createExerciseWithoutAuth } from '../commands/exercises/createExercise';
import { deleteAllExercises } from '../commands/exercises/deleteAllExercises';
import { listExercisesAsAdmin, listExercisesWithoutAuth } from '../commands/exercises/listExercises';
import {
  getExerciseByIdAsAdmin,
  getExerciseByIdForTrainer,
  getExerciseByIdWithoutAuth,
  updateExercise,
  updateExerciseForTrainer
} from '../commands/exercises/updateExercise';
import type { ApiWorld } from '../world.api';

const MISSING_EXERCISE_ID = '00000000-0000-0000-0000-000000000000';

function setApiError(this: ApiWorld, error: unknown): void {
  this.lastError = error instanceof ApiError ? error : undefined;
}

Given('все упражнения архивированы через API', async function () {
  await deleteAllExercises();
});

Given('существует упражнение {string}', async function (name: string) {
  await createExercise({ name });
});

Given('существует упражнение {string} с заметками {string}', async function (name: string, notes: string) {
  await createExercise({ name, notes });
});

When('я запрашиваю список упражнений через API', async function (this: ApiWorld) {
  try {
    const response = await listExercisesAsAdmin();
    this.exercises = response.exercises;
    this.lastError = undefined;
  } catch (error) {
    this.exercises = undefined;
    setApiError.call(this, error);
  }
});

When('я запрашиваю список упражнений через API без авторизации', async function (this: ApiWorld) {
  try {
    const response = await listExercisesWithoutAuth();
    this.exercises = response.exercises;
    this.lastError = undefined;
  } catch (error) {
    this.exercises = undefined;
    setApiError.call(this, error);
  }
});

When('я создаю упражнение через API с именем {string}', async function (this: ApiWorld, name: string) {
  this.exercise = await createExercise({ name });
  this.lastError = undefined;
});

When(
  'я создаю упражнение через API с именем {string} и заметками {string}',
  async function (this: ApiWorld, name: string, notes: string) {
    this.exercise = await createExercise({ name, notes });
    this.lastError = undefined;
  }
);

When('я создаю упражнение через API без заметок', async function (this: ApiWorld) {
  this.exercise = await createExercise({ name: 'Без заметок' });
  this.lastError = undefined;
});

When('я создаю упражнение через API без авторизации', async function (this: ApiWorld) {
  try {
    this.exercise = await createExerciseWithoutAuth({ name: 'Тест' });
    this.lastError = undefined;
  } catch (error) {
    this.exercise = undefined;
    setApiError.call(this, error);
  }
});

When('я запрашиваю созданное упражнение через API', async function (this: ApiWorld) {
  if (this.exercise === undefined) {
    throw new Error('Нет созданного упражнения для запроса');
  }

  try {
    this.exercise = await getExerciseByIdAsAdmin(this.exercise.id);
    this.lastError = undefined;
  } catch (error) {
    this.exercise = undefined;
    setApiError.call(this, error);
  }
});

When('я запрашиваю созданное упражнение через API без авторизации', async function (this: ApiWorld) {
  try {
    this.exercise = await getExerciseByIdWithoutAuth(MISSING_EXERCISE_ID);
    this.lastError = undefined;
  } catch (error) {
    this.exercise = undefined;
    setApiError.call(this, error);
  }
});

When('я запрашиваю несуществующее упражнение через API', async function (this: ApiWorld) {
  try {
    this.exercise = await getExerciseByIdAsAdmin(MISSING_EXERCISE_ID);
    this.lastError = undefined;
  } catch (error) {
    this.exercise = undefined;
    setApiError.call(this, error);
  }
});

When(
  'я обновляю созданное упражнение через API с именем {string} и заметками {string}',
  async function (this: ApiWorld, name: string, notes: string) {
    if (this.exercise === undefined) {
      throw new Error('Нет созданного упражнения для обновления');
    }

    this.exercise = await updateExercise(this.exercise.id, { name, notes });
    this.lastError = undefined;
  }
);

When('я архивирую созданное упражнение через API', async function (this: ApiWorld) {
  if (this.exercise === undefined) {
    throw new Error('Нет созданного упражнения для архивации');
  }

  this.exercise = await updateExercise(this.exercise.id, { archived: true });
  this.lastError = undefined;
});

When('я запрашиваю список упражнений с архивными через API', async function (this: ApiWorld) {
  const response = await listExercisesAsAdmin(true);
  this.exercises = response.exercises;
  this.lastError = undefined;
});

When('я запрашиваю созданное упражнение через API от имени другого тренера', async function (this: ApiWorld) {
  if (this.exercise === undefined) {
    throw new Error('Нет созданного упражнения для запроса');
  }

  try {
    this.exercise = await getExerciseByIdForTrainer(this.exercise.id);
    this.lastError = undefined;
  } catch (error) {
    this.exercise = undefined;
    setApiError.call(this, error);
  }
});

When('я обновляю созданное упражнение через API от имени другого тренера', async function (this: ApiWorld) {
  if (this.exercise === undefined) {
    throw new Error('Нет созданного упражнения для обновления');
  }

  try {
    this.exercise = await updateExerciseForTrainer(this.exercise.id, { name: 'Чужое упражнение' });
    this.lastError = undefined;
  } catch (error) {
    this.exercise = undefined;
    setApiError.call(this, error);
  }
});

When('я создаю упражнение через API с телом JSON:', async function (this: ApiWorld, json: string) {
  try {
    this.exercise = await createExercise(JSON.parse(json) as CreateExerciseRequest);
    this.lastError = undefined;
  } catch (error) {
    this.exercise = undefined;
    setApiError.call(this, error);
  }
});

When('я обновляю созданное упражнение через API с телом JSON:', async function (this: ApiWorld, json: string) {
  if (this.exercise === undefined) {
    throw new Error('Нет созданного упражнения для обновления');
  }

  try {
    this.exercise = await updateExercise(this.exercise.id, JSON.parse(json) as UpdateExerciseRequest);
    this.lastError = undefined;
  } catch (error) {
    this.exercise = undefined;
    setApiError.call(this, error);
  }
});

Then('список упражнений через API пуст', function (this: ApiWorld) {
  expect(this.exercises).toEqual([]);
});

Then('список упражнений через API содержит упражнение {string}', function (this: ApiWorld, name: string) {
  expect(this.exercises?.map(exercise => exercise.name)).toContain(name);
});

Then('список упражнений через API не содержит упражнение {string}', function (this: ApiWorld, name: string) {
  expect(this.exercises?.map(exercise => exercise.name)).not.toContain(name);
});

Then(
  'созданное упражнение через API имеет имя {string} и заметки {string}',
  function (this: ApiWorld, name: string, notes: string) {
    expect(this.lastError).toBeUndefined();
    expect(this.exercise?.name).toBe(name);
    expect(this.exercise?.notes).toBe(notes);
  }
);

Then('созданное упражнение через API имеет имя {string} без заметок', function (this: ApiWorld, name: string) {
  expect(this.lastError).toBeUndefined();
  expect(this.exercise?.name).toBe(name);
  expect(this.exercise).not.toHaveProperty('notes');
});

Then('созданное упражнение через API архивировано', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(this.exercise?.archivedAt).toEqual(expect.any(String));
});
