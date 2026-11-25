import { Then } from '@cucumber/cucumber';

import type { CustomWorld } from '../../world';
import { PreviousWorkoutComparisonBlock } from './PreviousWorkoutComparison.block';

Then('экран сравнения с прошлой показывает тег {string}', async function (this: CustomWorld, splitTag: string) {
  await new PreviousWorkoutComparisonBlock(this.page).expectTag(splitTag);
});

Then('экран сравнения с прошлой показывает даты текущей и прошлой тренировок', async function (this: CustomWorld) {
  await new PreviousWorkoutComparisonBlock(this.page).expectDates();
});

Then(
  'сводка сравнения с прошлой показывает прошлый объём {string}, текущий {string} и разницу {string}',
  async function (this: CustomWorld, previousVolume: string, currentVolume: string, delta: string) {
    await new PreviousWorkoutComparisonBlock(this.page).expectSummary(previousVolume, currentVolume, delta);
  }
);

Then(
  'строка сравнения с прошлой для {string} показывает прошлую {string}, текущую {string} и разницу {string}',
  async function (this: CustomWorld, exerciseName: string, previousText: string, currentText: string, delta: string) {
    await new PreviousWorkoutComparisonBlock(this.page).expectRow(exerciseName, previousText, currentText, delta);
  }
);
