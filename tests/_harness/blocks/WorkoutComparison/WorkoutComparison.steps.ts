import { Then } from '@cucumber/cucumber';

import type { CustomWorld } from '../../world';
import { WorkoutComparisonBlock } from './WorkoutComparison.block';

Then(
  'сравнение показывает для упражнения {string} план {string} и факт {string}',
  async function (this: CustomWorld, exerciseName: string, planText: string, factText: string) {
    await new WorkoutComparisonBlock(this.page).expectRow(exerciseName, planText, factText);
  }
);

Then(
  'сравнение отмечает упражнение {string} как {string}',
  async function (this: CustomWorld, exerciseName: string, status: string) {
    await new WorkoutComparisonBlock(this.page).expectStatus(exerciseName, status);
  }
);

Then(
  'сводка сравнения показывает план {string} и факт {string}',
  async function (this: CustomWorld, planText: string, factText: string) {
    await new WorkoutComparisonBlock(this.page).expectSummary(planText, factText);
  }
);

Then('сравнение показывает, что плана нет', async function (this: CustomWorld) {
  await new WorkoutComparisonBlock(this.page).expectNoPlan();
});
