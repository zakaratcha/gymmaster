import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { findClientByName } from '../../commands/clients/findClientByName';
import { listExercisesAsAdmin } from '../../commands/exercises/listExercises';
import { createPlan } from '../../commands/plans/plans';
import type { CustomWorld } from '../../world';
import { ClientHubBlock } from '../ClientHub/ClientHub.block';
import { WorkoutSessionBlock } from './WorkoutSession.block';

async function requireExerciseId(exerciseName: string): Promise<string> {
  const response = await listExercisesAsAdmin();
  const exercise = response.exercises.find(item => item.name === exerciseName);
  if (exercise === undefined) {
    throw new Error(`Упражнение "${exerciseName}" не найдено`);
  }

  return exercise.id;
}

Given(
  'для клиента {string} создан план {string} с упражнением {string}',
  async function (this: CustomWorld, clientName: string, splitTag: string, exerciseName: string) {
    const client = await findClientByName(clientName);
    await createPlan(client.id, {
      plannedDate: '2099-12-31',
      splitTag,
      exercises: [
        {
          exerciseId: await requireExerciseId(exerciseName),
          sets: [
            { reps: 8, weightKg: 80.5 },
            { reps: 10, weightKg: 82.5 }
          ]
        }
      ]
    });
  }
);

Given(
  'для клиента {string} создан план {string} с упражнениями {string} и {string}',
  async function (
    this: CustomWorld,
    clientName: string,
    splitTag: string,
    firstExercise: string,
    secondExercise: string
  ) {
    const client = await findClientByName(clientName);
    await createPlan(client.id, {
      plannedDate: '2099-12-31',
      splitTag,
      exercises: [
        { exerciseId: await requireExerciseId(firstExercise), sets: [{ reps: 8, weightKg: 80.5 }] },
        { exerciseId: await requireExerciseId(secondExercise), sets: [{ reps: 10, weightKg: 50 }] }
      ]
    });
  }
);

When('я начинаю тренировку с плана {string}', async function (this: CustomWorld, splitTag: string) {
  await new ClientHubBlock(this.page).startPlan(splitTag);
  await new WorkoutSessionBlock(this.page).waitForReady();
});

When('я возвращаюсь к карточке клиента', async function (this: CustomWorld) {
  await this.page.getByRole('link', { name: 'Вернуться в кабинет' }).click();
  await new ClientHubBlock(this.page).waitForReady();
});

Given(
  'следующий запуск тренировки на карточке завершится ошибкой {int}',
  async function (this: CustomWorld, status: number) {
    await new ClientHubBlock(this.page).failNextStart(status);
  }
);

When('я открываю запуск тренировки с плана {string}', async function (this: CustomWorld, splitTag: string) {
  await new ClientHubBlock(this.page).openStartDialog(splitTag);
});

When('я запускаю тренировку, ожидая ошибку {int}', async function (this: CustomWorld, status: number) {
  await new ClientHubBlock(this.page).submitStart(status);
});

Then('диалог запуска тренировки показывает ошибку {string}', async function (this: CustomWorld, message: string) {
  await new ClientHubBlock(this.page).expectStartError(message);
});

Then(
  'на карточке клиента отображается активная тренировка {string}',
  async function (this: CustomWorld, splitTag: string) {
    await new ClientHubBlock(this.page).expectActiveWorkout(splitTag);
  }
);

When('я открываю активную тренировку', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).openActiveWorkout();
  await new WorkoutSessionBlock(this.page).waitForReady();
});

When(
  'я редактирую подход {int} с повторами {string} и весом {string}',
  async function (this: CustomWorld, setPosition: number, reps: string, weightKg: string) {
    await new WorkoutSessionBlock(this.page).fillSet(0, setPosition - 1, reps, weightKg);
  }
);

When(
  'я редактирую подход {int} упражнения {int} с повторами {string} и весом {string}',
  async function (this: CustomWorld, setPosition: number, exercisePosition: number, reps: string, weightKg: string) {
    await new WorkoutSessionBlock(this.page).fillSet(exercisePosition - 1, setPosition - 1, reps, weightKg);
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

Given('следующее сохранение факта завершится ошибкой {int}', async function (this: CustomWorld, status: number) {
  await new WorkoutSessionBlock(this.page).failNextSave(status);
});

When('я сохраняю факт тренировки', async function (this: CustomWorld) {
  await new WorkoutSessionBlock(this.page).saveFacts(200);
});

When('я сохраняю факт тренировки, ожидая ошибку {int}', async function (this: CustomWorld, status: number) {
  await new WorkoutSessionBlock(this.page).saveFacts(status);
});

When('я нажимаю сохранение факта', async function (this: CustomWorld) {
  await new WorkoutSessionBlock(this.page).saveFactsWithoutRequest();
});

Then('факт тренировки сохранён', async function (this: CustomWorld) {
  await new WorkoutSessionBlock(this.page).expectSaveSuccess();
});

Then('форма тренировки показывает ошибку', async function (this: CustomWorld) {
  await new WorkoutSessionBlock(this.page).expectFormError();
});

Then(
  'подход {int} содержит повторы {string} и вес {string}',
  async function (this: CustomWorld, setPosition: number, reps: string, weightKg: string) {
    await new WorkoutSessionBlock(this.page).expectSetInputs(0, setPosition - 1, reps, weightKg);
  }
);

Then(
  'подход {int} упражнения {int} содержит повторы {string} и вес {string}',
  async function (this: CustomWorld, setPosition: number, exercisePosition: number, reps: string, weightKg: string) {
    await new WorkoutSessionBlock(this.page).expectSetInputs(exercisePosition - 1, setPosition - 1, reps, weightKg);
  }
);

When('я добавляю упражнение {string}', async function (this: CustomWorld, exerciseName: string) {
  await new WorkoutSessionBlock(this.page).addExercise(exerciseName);
});

When('я удаляю упражнение {int}', async function (this: CustomWorld, exercisePosition: number) {
  await new WorkoutSessionBlock(this.page).removeExercise(exercisePosition - 1);
});

When('я перемещаю упражнение {int} вверх', async function (this: CustomWorld, exercisePosition: number) {
  await new WorkoutSessionBlock(this.page).moveExercise(exercisePosition - 1, 'up');
});

When('я перемещаю упражнение {int} вниз', async function (this: CustomWorld, exercisePosition: number) {
  await new WorkoutSessionBlock(this.page).moveExercise(exercisePosition - 1, 'down');
});

Then('фактические упражнения идут в порядке {string}', async function (this: CustomWorld, order: string) {
  await new WorkoutSessionBlock(this.page).expectExerciseOrder(order.split(',').map(name => name.trim()));
});

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
