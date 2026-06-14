import { When } from '@cucumber/cucumber';

import type { CustomWorld } from '../world';

When('я перезагружаю страницу', async function (this: CustomWorld) {
  await this.page.reload();
});
