import { When } from '@cucumber/cucumber';

import { ClientsBlock } from '../blocks/Clients/Clients.block';
import type { CustomWorld } from '../world';

When('я перезагружаю страницу', async function (this: CustomWorld) {
  await this.page.reload();
  await new ClientsBlock(this.page).waitForVisible();
});
