import { Given, Then, When } from '@cucumber/cucumber';

import { findClientByName } from '../../commands/clients/findClientByName';
import { createExercise } from '../../commands/exercises/createExercise';
import { listExercisesAsAdmin } from '../../commands/exercises/listExercises';
import { updateExercise } from '../../commands/exercises/updateExercise';
import {
  completeWorkoutSession,
  createWorkoutSession,
  updateWorkoutSession
} from '../../commands/workoutSessions/workoutSessions';
import type { CustomWorld } from '../../world';
import { ClientHubBlock } from '../ClientHub/ClientHub.block';
import { WorkoutComparisonBlock } from '../WorkoutComparison/WorkoutComparison.block';
import { WorkoutSessionBlock } from '../WorkoutSession/WorkoutSession.block';
import { ExerciseHistoryBlock } from './ExerciseHistory.block';

async function requireExerciseId(exerciseName: string): Promise<string> {
  const response = await listExercisesAsAdmin();
  const exercise = response.exercises.find(item => item.name === exerciseName && item.archivedAt === undefined);
  if (exercise === undefined) {
    throw new Error(`Упражнение "${exerciseName}" не найдено`);
  }

  return exercise.id;
}

function parseIdenticalSets(value: string): { readonly reps: number; readonly weightKg: number }[] {
  const match = /^(?<count>\d+)×(?<reps>\d+)@(?<weight>\d+(?:\.\d+)?)$/.exec(value.trim());
  if (match?.groups?.count === undefined || match.groups.reps === undefined || match.groups.weight === undefined) {
    throw new Error(`Некорректная группа подходов «${value}»`);
  }

  const set = { reps: Number(match.groups.reps), weightKg: Number(match.groups.weight) };
  return Array.from({ length: Number(match.groups.count) }, () => set);
}

Given(
  'для клиента {string} создана завершённая тренировка без плана с тегом {string}, упражнением {string} и группой подходов {string}',
  async function (clientName: string, splitTag: string, exerciseName: string, setsText: string) {
    const client = await findClientByName(clientName);
    const created = await createWorkoutSession(client.id, { splitTag });
    await updateWorkoutSession(client.id, created.workoutSession.id, {
      exercises: [{ exerciseId: await requireExerciseId(exerciseName), sets: parseIdenticalSets(setsText) }]
    });
    await completeWorkoutSession(client.id, created.workoutSession.id);
  }
);

Given('упражнение {string} в архиве', async function (name: string) {
  const listed = await listExercisesAsAdmin(true);
  const active = listed.exercises.filter(exercise => exercise.name === name && exercise.archivedAt === undefined);
  const targets = active.length > 0 ? active : [await createExercise({ name })];
  for (const exercise of targets) {
    await updateExercise(exercise.id, { archived: true });
  }
});

Given('загрузка истории упражнения завершается ошибкой', async function (this: CustomWorld) {
  await new ExerciseHistoryBlock(this.page).failLoad();
});

When('я открываю выбор истории упражнения', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).openExerciseHistoryDialog();
});

When(
  'я открываю историю упражнения {string} с карточки клиента',
  async function (this: CustomWorld, exerciseName: string) {
    const hub = new ClientHubBlock(this.page);
    await hub.openExerciseHistoryDialog();
    await hub.chooseExerciseHistory(exerciseName);
    const history = new ExerciseHistoryBlock(this.page);
    await history.waitForReady();
  }
);

When('я открываю историю из строки сравнения {string}', async function (this: CustomWorld, exerciseName: string) {
  await new WorkoutComparisonBlock(this.page).openExerciseHistory(exerciseName);
  await new ExerciseHistoryBlock(this.page).waitForReady();
});

When('я открываю историю из карточки упражнения {string}', async function (this: CustomWorld, exerciseName: string) {
  await new WorkoutSessionBlock(this.page).openExerciseHistory(exerciseName);
});

When('я закрываю историю упражнения', async function (this: CustomWorld) {
  await new ExerciseHistoryBlock(this.page).close();
});

When('я повторяю загрузку истории упражнения', async function (this: CustomWorld) {
  await new ExerciseHistoryBlock(this.page).retry();
});

Then('экран истории показывает заголовок {string}', async function (this: CustomWorld, title: string) {
  await new ExerciseHistoryBlock(this.page).expectTitle(title);
});

Then('история показывает строку с датой и подходами {string}', async function (this: CustomWorld, setsText: string) {
  await new ExerciseHistoryBlock(this.page).expectDatedSets(setsText);
});

Then('экран истории показывает {string}', async function (this: CustomWorld, text: string) {
  await new ExerciseHistoryBlock(this.page).expectEmpty(text);
});

Then('экран истории показывает ошибку загрузки', async function (this: CustomWorld) {
  await new ExerciseHistoryBlock(this.page).expectError();
});

Then('список выбора истории не содержит {string}', async function (this: CustomWorld, exerciseName: string) {
  await new ClientHubBlock(this.page).expectExerciseHistoryChoiceAbsent(exerciseName);
});

Then('список выбора истории содержит {string}', async function (this: CustomWorld, exerciseName: string) {
  await new ClientHubBlock(this.page).expectExerciseHistoryChoice(exerciseName);
});

Then('поверх вкладки открыта история {string}', async function (this: CustomWorld, title: string) {
  await new WorkoutSessionBlock(this.page).expectHistoryOverlay();
  await new ExerciseHistoryBlock(this.page).expectTitle(title);
});

Then('факт тренировки не отмечен сохранённым', async function (this: CustomWorld) {
  await new WorkoutSessionBlock(this.page).expectSaveSuccessHidden();
});
