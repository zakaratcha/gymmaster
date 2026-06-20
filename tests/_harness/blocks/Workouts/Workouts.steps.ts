import { Then } from '@cucumber/cucumber';

import type { CustomWorld } from '../../world';
import { WorkoutsBlock } from './Workouts.block';

Then('отображается экран тренировок', async function (this: CustomWorld) {
  const block = new WorkoutsBlock(this.page);
  await block.expectTitle('Тренировки');
});
