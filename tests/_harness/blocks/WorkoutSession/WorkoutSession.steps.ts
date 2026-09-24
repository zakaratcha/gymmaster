import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { findClientByName } from '../../commands/clients/findClientByName';
import { listExercisesAsAdmin } from '../../commands/exercises/listExercises';
import { createPlan } from '../../commands/plans/plans';
import type { CustomWorld } from '../../world';
import { ClientHubBlock } from '../ClientHub/ClientHub.block';
import { WorkoutSessionBlock } from './WorkoutSession.block';

Given(
  'для клиента {string} создан план {string} с упражнением {string}',
  async function (clientName: string, splitTag: string, exerciseName: string) {
    const client = await findClientByName(clientName);
    const response = await listExercisesAsAdmin();
    const exercise = response.exercises.find(item => item.name === exerciseName);
    if (exercise === undefined) {
      throw new Error(`Упражнение "${exerciseName}" не найдено`);
    }

    await createPlan(client.id, {
      plannedDate: '2099-12-31',
      splitTag,
      exercises: [
        {
          exerciseId: exercise.id,
          sets: [
            { reps: 8, weightKg: 80.5 },
            { reps: 10, weightKg: 82.5 }
          ]
        }
      ]
    });
  }
);

When('я начинаю тренировку с плана {string}', async function (this: CustomWorld, splitTag: string) {
  await new ClientHubBlock(this.page).startPlan(splitTag);
  await new WorkoutSessionBlock(this.page).waitForReady();
});

When(
  'я редактирую подход {int} с повторами {string} и весом {string}',
  async function (this: CustomWorld, setPosition: number, reps: string, weightKg: string) {
    await new WorkoutSessionBlock(this.page).fillSet(0, setPosition - 1, reps, weightKg);
  }
);

When('я добавляю подход в упражнение {int}', async function (this: CustomWorld, exercisePosition: number) {
  await new WorkoutSessionBlock(this.page).addSet(exercisePosition - 1);
});

When(
  'я удаляю подход {int} из упражнения {int}',
  async function (this: CustomWorld, setPosition: number, exercisePosition: number) {
    await new WorkoutSessionBlock(this.page).removeSet(exercisePosition - 1, setPosition - 1);
  }
);

When('я завершаю тренировку', async function (this: CustomWorld) {
  await new WorkoutSessionBlock(this.page).completeAndWaitForResult();
});

Then('адрес страницы — экран тренировки', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/workouts\/[^/]+\/[^/]+$/);
});

When('я открываю последний завершённый результат', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).openLatestCompletedResult();
  await new WorkoutSessionBlock(this.page).waitForReady();
});

When('я перезагружаю страницу тренировки', async function (this: CustomWorld) {
  await new WorkoutSessionBlock(this.page).reload();
});

Then(
  'последний завершённый результат содержит {string} и {string}',
  async function (this: CustomWorld, splitTag: string, stats: string) {
    await new ClientHubBlock(this.page).expectLatestCompleted(splitTag, stats);
  }
);

Then(
  'завершённая тренировка содержит подход {int} с повторами {int} и весом {float}',
  async function (this: CustomWorld, setPosition: number, reps: number, weightKg: number) {
    await new WorkoutSessionBlock(this.page).expectCompletedSet(0, setPosition - 1, reps, weightKg);
  }
);

Then('тренировка отображается как завершённая', async function (this: CustomWorld) {
  await new WorkoutSessionBlock(this.page).expectCompleted();
});
