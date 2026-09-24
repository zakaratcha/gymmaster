import { Given } from '@cucumber/cucumber';

import { createExercise } from '../../commands/exercises/createExercise';
import { deleteAllExercises } from '../../commands/exercises/deleteAllExercises';
import type { CustomWorld } from '../../world';
import { ExercisesPage } from './Exercises.page';

Given('на странице упражнений нет активных упражнений', async function () {
  await deleteAllExercises();
});

Given('существует упражнение {string}', async function (name: string) {
  await createExercise({ name });
});

Given('существует упражнение {string} с заметками {string}', async function (name: string, notes: string) {
  await createExercise({ name, notes });
});

Given('я на странице упражнений', async function (this: CustomWorld) {
  const exercises = new ExercisesPage(this.page);
  await exercises.open();
});
