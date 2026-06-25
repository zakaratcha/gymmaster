import { Given } from '@cucumber/cucumber';

import type { CustomWorld } from '../../world';
import { ClientsPage } from './Clients.page';

Given('я на странице клиентов', async function (this: CustomWorld) {
  const clients = new ClientsPage(this.page);
  await clients.open();
});
