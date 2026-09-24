import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ClientHubBlock } from '../../blocks/ClientHub/ClientHub.block';
import { PlannedWorkoutEditorBlock } from '../../blocks/PlannedWorkoutEditor/PlannedWorkoutEditor.block';
import type { CustomWorld } from '../../world';
import { PlannedWorkoutEditorPage } from '../PlannedWorkoutEditor/PlannedWorkoutEditor.page';
import { PlannedWorkoutListPage } from './PlannedWorkoutList.page';

function getClientId(page: CustomWorld['page']): string {
  const clientId = new URL(page.url()).pathname.split('/', 3)[2];
  if (clientId === undefined || clientId.length === 0) {
    throw new Error('Не удалось определить id клиента');
  }

  return clientId;
}

When('я открываю список планов из карточки клиента', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).clickAllPlans();
  await expect(this.page).toHaveURL(/\/clients\/[^/]+\/plans$/);
  await new PlannedWorkoutListPage(this.page).waitForReady();
});

Then('адрес страницы — список планов', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/clients\/[^/]+\/plans$/);
});

Then('список планов пуст', async function (this: CustomWorld) {
  await new PlannedWorkoutListPage(this.page).expectEmpty();
});

When('я нажимаю стрелку Назад в списке планов', async function (this: CustomWorld) {
  await new PlannedWorkoutListPage(this.page).clickBack();
  await expect(this.page).toHaveURL(/\/clients\/[^/]+$/);
  await new ClientHubBlock(this.page).waitForReady();
});

When('я нажимаю стрелку Назад в редакторе плана', async function (this: CustomWorld) {
  await new PlannedWorkoutEditorPage(this.page).clickBack();
  await expect(this.page).toHaveURL(/\/clients\/[^/]+\/plans$/);
  await new PlannedWorkoutListPage(this.page).waitForReady();
});

When('я открываю создание плана', async function (this: CustomWorld) {
  const clientId = getClientId(this.page);
  await new PlannedWorkoutEditorPage(this.page).openNew(clientId);
});

When('я открываю план с тегом {string}', async function (this: CustomWorld, splitTag: string) {
  await new PlannedWorkoutListPage(this.page).openPlanByTag(splitTag);
  await new PlannedWorkoutEditorBlock(this.page).waitForReady();
});

When('я нажимаю Назад к списку планов', async function (this: CustomWorld) {
  await new PlannedWorkoutListPage(this.page).clickBack();
  await new PlannedWorkoutListPage(this.page).waitForReady();
});

Then('в списке планов отображается тег {string}', async function (this: CustomWorld, splitTag: string) {
  await new PlannedWorkoutListPage(this.page).expectPlan(splitTag);
});

When(
  'я заполняю план датой {string} и тегом {string}',
  async function (this: CustomWorld, plannedDate: string, splitTag: string) {
    await new PlannedWorkoutEditorBlock(this.page).fillPlanFields(plannedDate, splitTag);
  }
);

When('я добавляю в план упражнение {string}', async function (this: CustomWorld, exerciseName: string) {
  await new PlannedWorkoutEditorBlock(this.page).addExercise(exerciseName);
});

When(
  'я заполняю подход {int} у упражнения {int} с повторами {string} и весом {string}',
  async function (this: CustomWorld, setPosition: number, exercisePosition: number, reps: string, weightKg: string) {
    await new PlannedWorkoutEditorBlock(this.page).fillSet(exercisePosition - 1, setPosition - 1, reps, weightKg);
  }
);

When('я перемещаю упражнение {string} вниз', async function (this: CustomWorld, exerciseName: string) {
  await new PlannedWorkoutEditorBlock(this.page).moveExerciseDown(exerciseName);
});

When('я нажимаю Сохранить план без отправки', async function (this: CustomWorld) {
  await new PlannedWorkoutEditorBlock(this.page).clickSave();
});

When('я сохраняю план', async function (this: CustomWorld) {
  await new PlannedWorkoutEditorBlock(this.page).saveAndWaitForResponse();
  await expect(this.page).toHaveURL(/\/clients\/[^/]+\/plans$/);
  await new PlannedWorkoutListPage(this.page).waitForReady();
});

Then('в редакторе плана отображается {int} упражнение', async function (this: CustomWorld, count: number) {
  await new PlannedWorkoutEditorBlock(this.page).expectExerciseCount(count);
});

Then('порядок упражнений в редакторе: {string}', async function (this: CustomWorld, names: string) {
  await new PlannedWorkoutEditorBlock(this.page).expectExerciseNames(names.split(',').map(name => name.trim()));
});

Then('редактор плана показывает ошибку', async function (this: CustomWorld) {
  await new PlannedWorkoutEditorBlock(this.page).expectError();
});

When('я перезагружаю редактор плана', async function (this: CustomWorld) {
  await this.page.reload();
  await new PlannedWorkoutEditorBlock(this.page).waitForReady();
});

When('я удаляю план с тегом {string}', async function (this: CustomWorld, splitTag: string) {
  await new PlannedWorkoutListPage(this.page).deletePlanByTag(splitTag);
});

When('я перезагружаю список планов', async function (this: CustomWorld) {
  await this.page.reload();
  await new PlannedWorkoutListPage(this.page).waitForReady();
});
