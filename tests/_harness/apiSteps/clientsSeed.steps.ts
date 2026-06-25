import { Given } from '@cucumber/cucumber';

import { createClient } from '../commands/clients/createClient';
import { deleteAllClients } from '../commands/clients/deleteAllClients';

Given('нет ни одного клиента', async function () {
  await deleteAllClients();
});

Given('существует клиент {string}', async function (name: string) {
  await createClient({ name });
});
