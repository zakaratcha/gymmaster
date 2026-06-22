import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ApiError } from '../../../src/services/api/api.service';
import { createClient } from '../commands/clients/createClient';
import { deleteAllClients } from '../commands/clients/deleteAllClients';
import { deleteClient } from '../commands/clients/deleteClient';
import { getClientByIdAsAdmin } from '../commands/clients/getClientById';
import { listClientsAsAdmin, listClientsWithoutAuth } from '../commands/clients/listClients';
import { updateClient } from '../commands/clients/updateClient';
import type { ApiWorld } from '../world.api';

Given('все клиенты удалены через API', async function () {
  await deleteAllClients();
});

When('я запрашиваю список клиентов через API', async function (this: ApiWorld) {
  try {
    this.clients = await listClientsAsAdmin();
    this.lastError = undefined;
  } catch (error) {
    this.clients = undefined;
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я запрашиваю список клиентов через API без авторизации', async function (this: ApiWorld) {
  try {
    this.clients = await listClientsWithoutAuth();
    this.lastError = undefined;
  } catch (error) {
    this.clients = undefined;
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When(
  'я создаю клиента через API с именем {string} и весом {int}',
  async function (this: ApiWorld, name: string, bodyWeightKg: number) {
    this.client = await createClient({ name, bodyWeightKg });
    this.lastError = undefined;
  }
);

When(
  'я обновляю созданного клиента через API с именем {string} и весом {int}',
  async function (this: ApiWorld, name: string, bodyWeightKg: number) {
    if (this.client === undefined) {
      throw new Error('Нет созданного клиента для обновления');
    }

    this.client = await updateClient(this.client.id, { name, bodyWeightKg });
    this.lastError = undefined;
  }
);

When('я удаляю созданного клиента через API', async function (this: ApiWorld) {
  if (this.client === undefined) {
    throw new Error('Нет созданного клиента для удаления');
  }

  await deleteClient(this.client.id);
  this.lastError = undefined;
});

When('я запрашиваю созданного клиента через API', async function (this: ApiWorld) {
  if (this.client === undefined) {
    throw new Error('Нет созданного клиента для запроса');
  }

  try {
    this.client = await getClientByIdAsAdmin(this.client.id);
    this.lastError = undefined;
  } catch (error) {
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

Then('список клиентов через API пуст', function (this: ApiWorld) {
  expect(this.clients).toEqual([]);
});

Then(
  'созданный клиент через API имеет имя {string} и вес {int}',
  function (this: ApiWorld, name: string, bodyWeightKg: number) {
    expect(this.client?.name).toBe(name);
    expect(this.client?.bodyWeightKg).toBe(bodyWeightKg);
  }
);
