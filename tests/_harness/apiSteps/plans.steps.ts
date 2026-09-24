import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ApiError } from '../../../src/services/api/api.models';
import type {
  CreatePlannedWorkoutRequest,
  UpdatePlannedWorkoutRequest
} from '../../../src/services/plans/plans.models';
import {
  createPlan,
  createPlanForTrainer,
  createPlanWithoutAuth,
  deletePlan,
  deletePlanForTrainer,
  deletePlanWithoutAuth,
  getPlan,
  getPlanForTrainer,
  getPlanWithoutAuth,
  listPlans,
  listPlansForTrainer,
  listPlansWithoutAuth,
  updatePlan,
  updatePlanForTrainer,
  updatePlanWithoutAuth
} from '../commands/plans/plans';
import type { ApiWorld } from '../world.api';

function setApiError(this: ApiWorld, error: unknown): void {
  this.lastError = error instanceof ApiError ? error : undefined;
}

function substituteIds(this: ApiWorld, value: string): string {
  return value
    .replaceAll('<clientId>', this.client?.id ?? '')
    .replaceAll('<exerciseId>', this.exercise?.id ?? '')
    .replaceAll('<firstExerciseId>', this.exercises?.[0]?.id ?? '')
    .replaceAll('<secondExerciseId>', this.exercises?.[1]?.id ?? '')
    .replaceAll('<foreignExerciseId>', this.foreignExercise?.id ?? '');
}

function requireClient(this: ApiWorld): string {
  if (this.client === undefined) {
    throw new Error('Нет клиента для операции с планом');
  }

  return this.client.id;
}

function requirePlan(this: ApiWorld): { clientId: string; planId: string } {
  if (this.client === undefined || this.plan === undefined) {
    throw new Error('Нет созданного плана для операции');
  }

  return { clientId: this.client.id, planId: this.plan.id };
}

Given('существует клиент для плана {string}', async function (name: string) {
  const { createClient } = await import('../commands/clients/createClient');
  this.client = await createClient({ name });
});

Given('существует упражнение для плана {string}', async function (name: string) {
  const { createExercise } = await import('../commands/exercises/createExercise');
  this.exercise = await createExercise({ name });
  this.exercises = [this.exercise];
});

Given('существует чужое упражнение для плана {string}', async function (this: ApiWorld, name: string) {
  const { createExerciseForTrainer } = await import('../commands/exercises/createExercise');
  this.foreignExercise = await createExerciseForTrainer({ name });
});

Given(
  'создан план на дату {string} с тегом {string}',
  async function (this: ApiWorld, plannedDate: string, splitTag: string) {
    if (this.exercise === undefined) {
      throw new Error('Нет упражнения для создания плана');
    }

    this.plan = await createPlan(requireClient.call(this), {
      plannedDate,
      splitTag,
      exercises: [{ exerciseId: this.exercise.id, sets: [{ reps: 8, weightKg: 80 }] }]
    });
  }
);

When(
  'я создаю план через API на дату {string} с тегом {string}',
  async function (this: ApiWorld, plannedDate: string, splitTag: string) {
    if (this.exercise === undefined) {
      throw new Error('Нет упражнения для создания плана');
    }

    try {
      this.plan = await createPlan(requireClient.call(this), {
        plannedDate,
        splitTag,
        exercises: [{ exerciseId: this.exercise.id, sets: [{ reps: 8, weightKg: 80.5 }] }]
      });
      this.lastError = undefined;
    } catch (error) {
      this.plan = undefined;
      setApiError.call(this, error);
    }
  }
);

When('я создаю план через API с телом JSON:', async function (this: ApiWorld, json: string) {
  try {
    const payload = JSON.parse(substituteIds.call(this, json)) as CreatePlannedWorkoutRequest;
    this.plan = await createPlan(requireClient.call(this), payload);
    this.lastError = undefined;
  } catch (error) {
    this.plan = undefined;
    setApiError.call(this, error);
  }
});

When('я создаю дополнительное упражнение для плана {string}', async function (this: ApiWorld, name: string) {
  const { createExercise } = await import('../commands/exercises/createExercise');
  const created = await createExercise({ name });
  this.exercises = [...(this.exercises ?? []), created];
  this.exercise = created;
});

When('я создаю план через API без авторизации', async function (this: ApiWorld) {
  try {
    this.plan = await createPlanWithoutAuth(requireClient.call(this), {
      plannedDate: '2099-12-31',
      splitTag: 'без доступа',
      exercises: []
    });
    this.lastError = undefined;
  } catch (error) {
    this.plan = undefined;
    setApiError.call(this, error);
  }
});

When('я запрашиваю список планов через API', async function (this: ApiWorld) {
  try {
    this.plans = await listPlans(requireClient.call(this));
    this.lastError = undefined;
  } catch (error) {
    this.plans = undefined;
    setApiError.call(this, error);
  }
});

When('я запрашиваю список планов через API без авторизации', async function (this: ApiWorld) {
  try {
    this.plans = await listPlansWithoutAuth(requireClient.call(this));
    this.lastError = undefined;
  } catch (error) {
    this.plans = undefined;
    setApiError.call(this, error);
  }
});

When('я запрашиваю созданный план через API', async function (this: ApiWorld) {
  const { clientId, planId } = requirePlan.call(this);
  try {
    this.plan = await getPlan(clientId, planId);
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я запрашиваю созданный план через API без авторизации', async function (this: ApiWorld) {
  const { clientId, planId } = requirePlan.call(this);
  try {
    this.plan = await getPlanWithoutAuth(clientId, planId);
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When(
  'я обновляю созданный план через API на дату {string} с тегом {string}',
  async function (this: ApiWorld, plannedDate: string, splitTag: string) {
    const { clientId, planId } = requirePlan.call(this);
    try {
      this.plan = await updatePlan(clientId, planId, { plannedDate, splitTag });
      this.lastError = undefined;
    } catch (error) {
      setApiError.call(this, error);
    }
  }
);

When('я обновляю созданный план через API с телом JSON:', async function (this: ApiWorld, json: string) {
  const { clientId, planId } = requirePlan.call(this);
  try {
    const payload = JSON.parse(substituteIds.call(this, json)) as UpdatePlannedWorkoutRequest;
    this.plan = await updatePlan(clientId, planId, payload);
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я обновляю созданный план через API без авторизации', async function (this: ApiWorld) {
  const { clientId, planId } = requirePlan.call(this);
  try {
    this.plan = await updatePlanWithoutAuth(clientId, planId, { splitTag: 'без доступа' });
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я удаляю созданный план через API', async function (this: ApiWorld) {
  const { clientId, planId } = requirePlan.call(this);
  await deletePlan(clientId, planId);
  this.lastError = undefined;
});

When('я удаляю созданный план через API без авторизации', async function (this: ApiWorld) {
  const { clientId, planId } = requirePlan.call(this);
  try {
    await deletePlanWithoutAuth(clientId, planId);
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я запрашиваю созданный план через API от имени другого тренера', async function (this: ApiWorld) {
  const { clientId, planId } = requirePlan.call(this);
  try {
    this.plan = await getPlanForTrainer(clientId, planId);
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я запрашиваю список планов через API от имени другого тренера', async function (this: ApiWorld) {
  try {
    this.plans = await listPlansForTrainer(requireClient.call(this));
    this.lastError = undefined;
  } catch (error) {
    this.plans = undefined;
    setApiError.call(this, error);
  }
});

When('я создаю план через API от имени другого тренера', async function (this: ApiWorld) {
  try {
    this.plan = await createPlanForTrainer(requireClient.call(this), {
      plannedDate: '2099-12-31',
      splitTag: 'чужой план',
      exercises: []
    });
    this.lastError = undefined;
  } catch (error) {
    this.plan = undefined;
    setApiError.call(this, error);
  }
});

When('я обновляю созданный план через API от имени другого тренера', async function (this: ApiWorld) {
  const { clientId, planId } = requirePlan.call(this);
  try {
    this.plan = await updatePlanForTrainer(clientId, planId, { splitTag: 'чужое изменение' });
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я удаляю созданный план через API от имени другого тренера', async function (this: ApiWorld) {
  const { clientId, planId } = requirePlan.call(this);
  try {
    await deletePlanForTrainer(clientId, planId);
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

Then(
  'созданный план через API имеет дату {string} и тег {string}',
  function (this: ApiWorld, plannedDate: string, splitTag: string) {
    expect(this.lastError).toBeUndefined();
    expect(this.plan?.plannedDate).toBe(plannedDate);
    expect(this.plan?.splitTag).toBe(splitTag);
  }
);

Then(
  'созданный план через API содержит упражнение с подходом {int} и весом {float}',
  function (this: ApiWorld, reps: number, weightKg: number) {
    expect(this.lastError).toBeUndefined();
    expect(this.plan?.exercises[0]?.sets).toEqual([{ reps, weightKg }]);
  }
);

Then('созданный план через API содержит {int} упражнения', function (this: ApiWorld, count: number) {
  expect(this.lastError).toBeUndefined();
  expect(this.plan?.exercises).toHaveLength(count);
});

Then('порядок упражнений в плане сохранён', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(this.plan?.exercises.map(exercise => exercise.exerciseId)).toEqual([
    this.exercises?.[1]?.id,
    this.exercises?.[0]?.id
  ]);
});

Then('список планов через API содержит {int} плана', function (this: ApiWorld, count: number) {
  expect(this.lastError).toBeUndefined();
  expect(this.plans).toHaveLength(count);
});

Then('список планов через API отсортирован по дате', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  const dates = this.plans?.map(plan => plan.plannedDate) ?? [];
  for (let index = 1; index < dates.length; index += 1) {
    expect((dates[index - 1] ?? '') <= (dates[index] ?? '')).toBe(true);
  }
});
