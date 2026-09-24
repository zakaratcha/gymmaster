import { Given } from '@cucumber/cucumber';

import type { CustomWorld } from '../../world';
import { ExercisesPage } from './Exercises.page';

Given('я на странице упражнений', async function (this: CustomWorld) {
  const exercises = new ExercisesPage(this.page);
  await exercises.open();
});
