import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ApiError } from '../../../src/services/api/api.models';
import { UNAUTH_TEST_CLIENT_ID } from '../commands/clients/clientTestIds';
import { createClient, createClientWithoutAuth } from '../commands/clients/createClient';
import { deleteAllClients } from '../commands/clients/deleteAllClients';
import { deleteClient, deleteClientForTrainer, deleteClientWithoutAuth } from '../commands/clients/deleteClient';
import {
  getClientByIdAsAdmin,
  getClientByIdForTrainer,
  getClientByIdWithoutAuth
} from '../commands/clients/getClientById';
import { listClientsAsAdmin, listClientsWithoutAuth } from '../commands/clients/listClients';
import { updateClient, updateClientForTrainer, updateClientWithoutAuth } from '../commands/clients/updateClient';
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

When('я создаю клиента через API без авторизации', async function (this: ApiWorld) {
  try {
    this.client = await createClientWithoutAuth({ name: 'Тест' });
    this.lastError = undefined;
  } catch (error) {
    this.client = undefined;
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я запрашиваю клиента по id через API без авторизации', async function (this: ApiWorld) {
  try {
    this.client = await getClientByIdWithoutAuth(UNAUTH_TEST_CLIENT_ID);
    this.lastError = undefined;
  } catch (error) {
    this.client = undefined;
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я обновляю клиента по id через API без авторизации', async function (this: ApiWorld) {
  try {
    this.client = await updateClientWithoutAuth(UNAUTH_TEST_CLIENT_ID, { name: 'Тест' });
    this.lastError = undefined;
  } catch (error) {
    this.client = undefined;
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я удаляю клиента по id через API без авторизации', async function (this: ApiWorld) {
  try {
    await deleteClientWithoutAuth(UNAUTH_TEST_CLIENT_ID);
    this.lastError = undefined;
  } catch (error) {
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я запрашиваю клиента по id {string} через API', async function (this: ApiWorld, id: string) {
  try {
    this.client = await getClientByIdAsAdmin(id);
    this.lastError = undefined;
  } catch (error) {
    this.client = undefined;
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я обновляю клиента по id {string} через API', async function (this: ApiWorld, id: string) {
  try {
    this.client = await updateClient(id, { name: 'Тест' });
    this.lastError = undefined;
  } catch (error) {
    this.client = undefined;
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я удаляю клиента по id {string} через API', async function (this: ApiWorld, id: string) {
  try {
    await deleteClient(id);
    this.lastError = undefined;
  } catch (error) {
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я запрашиваю созданного клиента через API от имени другого тренера', async function (this: ApiWorld) {
  if (this.client === undefined) {
    throw new Error('Нет созданного клиента для запроса');
  }

  try {
    this.client = await getClientByIdForTrainer(this.client.id);
    this.lastError = undefined;
  } catch (error) {
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я обновляю созданного клиента через API от имени другого тренера', async function (this: ApiWorld) {
  if (this.client === undefined) {
    throw new Error('Нет созданного клиента для обновления');
  }

  try {
    this.client = await updateClientForTrainer(this.client.id, { name: 'Чужой' });
    this.lastError = undefined;
  } catch (error) {
    this.client = undefined;
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я удаляю созданного клиента через API от имени другого тренера', async function (this: ApiWorld) {
  if (this.client === undefined) {
    throw new Error('Нет созданного клиента для удаления');
  }

  try {
    await deleteClientForTrainer(this.client.id);
    this.lastError = undefined;
  } catch (error) {
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

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

When('я создаю клиента через API с телом JSON:', async function (this: ApiWorld, json: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- намеренно невалидные тела в API-тестах
    this.client = await createClient(JSON.parse(json));
    this.lastError = undefined;
  } catch (error) {
    this.client = undefined;
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я обновляю созданного клиента через API с телом JSON:', async function (this: ApiWorld, json: string) {
  if (this.client === undefined) {
    throw new Error('Нет созданного клиента для обновления');
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- намеренно невалидные тела в API-тестах
    this.client = await updateClient(this.client.id, JSON.parse(json));
    this.lastError = undefined;
  } catch (error) {
    this.client = undefined;
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

Then('список клиентов через API пуст', function (this: ApiWorld) {
  expect(this.clients).toEqual([]);
});

Then('созданный клиент через API имеет имя {string} без веса', function (this: ApiWorld, name: string) {
  expect(this.lastError).toBeUndefined();
  expect(this.client?.name).toBe(name);
  expect(this.client).not.toHaveProperty('bodyWeightKg');
});

Then(
  'созданный клиент через API имеет имя {string} и вес {int}',
  function (this: ApiWorld, name: string, bodyWeightKg: number) {
    expect(this.lastError).toBeUndefined();
    expect(this.client?.name).toBe(name);
    expect(this.client?.bodyWeightKg).toBe(bodyWeightKg);
  }
);
