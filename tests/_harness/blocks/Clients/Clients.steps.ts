import { Then } from '@cucumber/cucumber';

import type { CustomWorld } from '../../world';
import { ClientsBlock } from './Clients.block';

Then('отображается экран клиентов', async function (this: CustomWorld) {
  const block = new ClientsBlock(this.page);
  await block.expectTitle('Клиенты');
});
