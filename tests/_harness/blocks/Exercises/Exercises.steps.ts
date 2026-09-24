import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import type { CustomWorld } from '../../world';
import { ExerciseFormBlock } from '../ExerciseForm/ExerciseForm.block';
import { ExercisesBlock } from './Exercises.block';

When('я ищу упражнение {string}', async function (this: CustomWorld, query: string) {
  const block = new ExercisesBlock(this.page);
  await block.waitForListReady();
  await block.search(query);
});

When('я открываю форму добавления упражнения', async function (this: CustomWorld) {
  const block = new ExercisesBlock(this.page);
  await block.waitForListReady();
  await block.clickFab();
  const form = new ExerciseFormBlock(this.page);
  await form.expectCreateDialog();
});

When('я создаю упражнение с именем {string} через форму', async function (this: CustomWorld, name: string) {
  const form = new ExerciseFormBlock(this.page);
  await form.fillFields(name);
  await form.submit();
  await form.waitForHidden();
});

When(
  'я создаю упражнение с именем {string} и заметками {string} через форму',
  async function (this: CustomWorld, name: string, notes: string) {
    const form = new ExerciseFormBlock(this.page);
    await form.fillFields(name, notes);
    await form.submit();
    await form.waitForHidden();
  }
);

When('я открываю редактирование упражнения {string}', async function (this: CustomWorld, name: string) {
  const block = new ExercisesBlock(this.page);
  await block.clickExerciseByName(name);
  const form = new ExerciseFormBlock(this.page);
  await form.expectEditDialog();
});

When(
  'я ввожу в форме редактирования имя {string} и заметки {string}',
  async function (this: CustomWorld, name: string, notes: string) {
    const form = new ExerciseFormBlock(this.page);
    await form.fillFields(name, notes);
  }
);

When('я сохраняю упражнение', async function (this: CustomWorld) {
  const form = new ExerciseFormBlock(this.page);
  await form.submit();
  await form.waitForHidden();
});

When('я архивирую упражнение {string}', async function (this: CustomWorld, name: string) {
  const block = new ExercisesBlock(this.page);
  await block.clickArchiveByName(name);
  await block.confirmArchive();
});

Then('отображается экран упражнений', async function (this: CustomWorld) {
  const block = new ExercisesBlock(this.page);
  await block.waitForVisible();
  expect(await block.getTitle()).toBe('Упражнения');
});

Then('на экране упражнений отображается упражнение {string}', async function (this: CustomWorld, name: string) {
  const block = new ExercisesBlock(this.page);
  await block.waitForListReady();
  expect(await block.getExerciseNames()).toContain(name);
});

Then('на экране упражнений не отображается упражнение {string}', async function (this: CustomWorld, name: string) {
  const block = new ExercisesBlock(this.page);
  await block.waitForListReady();
  expect(await block.getExerciseNames()).not.toContain(name);
});

Then('на экране упражнений отображается подсказка {string}', async function (this: CustomWorld, text: string) {
  const block = new ExercisesBlock(this.page);
  await block.waitForListReady();
  expect(await block.getEmptyStateText()).toBe(text);
});
