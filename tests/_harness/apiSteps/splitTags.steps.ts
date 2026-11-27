import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ApiError } from '../../../src/services/api/api.models';
import { splitTagsClient } from '../../../src/services/splitTags/splitTags.client';
import type { AddSplitTagRequest, SplitTagsResponse } from '../../../src/services/splitTags/splitTags.models';
import { findClientByName } from '../commands/clients/findClientByName';
import { requestAsAdmin } from '../commands/requestAs';
import {
  addSplitTag,
  addSplitTagForTrainer,
  listSplitTags,
  listSplitTagsForTrainer,
  listSplitTagsWithoutAuth
} from '../commands/splitTags/splitTags';
import type { ApiWorld } from '../world.api';

const MISSING_CLIENT_ID = '00000000-0000-0000-0000-000000000000';

function parseTags(value: string): readonly string[] {
  return value.split(',').map(tag => tag.trim());
}

function requireClient(this: ApiWorld): string {
  if (this.client === undefined) {
    throw new Error('Нет клиента для операции с пулом тегов');
  }

  return this.client.id;
}

async function requestSplitTags(this: ApiWorld, request: () => Promise<readonly string[]>): Promise<void> {
  try {
    this.splitTags = await request();
    this.lastError = undefined;
  } catch (error) {
    this.splitTags = undefined;
    if (!(error instanceof ApiError)) {
      throw error;
    }

    this.lastError = error;
  }
}

Given('в пул тегов клиента добавлен тег {string}', async function (this: ApiWorld, tag: string) {
  await addSplitTag(requireClient.call(this), tag);
});

Given('в пул тегов клиента {string} добавлены теги {string}', async function (clientName: string, tags: string) {
  const client = await findClientByName(clientName);
  for (const tag of parseTags(tags)) {
    await addSplitTag(client.id, tag);
  }
});

When('я запрашиваю пул тегов клиента через API', async function (this: ApiWorld) {
  const clientId = requireClient.call(this);
  await requestSplitTags.call(this, () => listSplitTags(clientId));
});

When('я запрашиваю пул тегов клиента через API от имени другого тренера', async function (this: ApiWorld) {
  const clientId = requireClient.call(this);
  await requestSplitTags.call(this, () => listSplitTagsForTrainer(clientId));
});

When('я запрашиваю пул тегов клиента через API без авторизации', async function (this: ApiWorld) {
  const clientId = requireClient.call(this);
  await requestSplitTags.call(this, () => listSplitTagsWithoutAuth(clientId));
});

When('я запрашиваю пул тегов несуществующего клиента через API', async function (this: ApiWorld) {
  await requestSplitTags.call(this, () => listSplitTags(MISSING_CLIENT_ID));
});

When('я добавляю в пул тегов клиента через API тег {string}', async function (this: ApiWorld, tag: string) {
  const clientId = requireClient.call(this);
  await requestSplitTags.call(this, () => addSplitTag(clientId, tag));
});

When(
  'я добавляю в пул тегов клиента через API тег {string} от имени другого тренера',
  async function (this: ApiWorld, tag: string) {
    const clientId = requireClient.call(this);
    await requestSplitTags.call(this, () => addSplitTagForTrainer(clientId, tag));
  }
);

When(
  'я добавляю в пул тегов несуществующего клиента через API тег {string}',
  async function (this: ApiWorld, tag: string) {
    await requestSplitTags.call(this, () => addSplitTag(MISSING_CLIENT_ID, tag));
  }
);

When('я добавляю в пул тегов клиента через API с телом JSON:', async function (this: ApiWorld, json: string) {
  const clientId = requireClient.call(this);
  const payload = JSON.parse(json) as AddSplitTagRequest;
  await requestSplitTags.call(this, async () => {
    const response = await requestAsAdmin<SplitTagsResponse, [string, AddSplitTagRequest]>(
      splitTagsClient.add,
      clientId,
      payload
    );
    return response.splitTags;
  });
});

Then('API возвращает пустой пул тегов клиента', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  expect(this.splitTags).toEqual([]);
});

Then('API возвращает пул тегов клиента {string}', function (this: ApiWorld, tags: string) {
  expect(this.lastError).toBeUndefined();
  expect(this.splitTags).toEqual(parseTags(tags));
});

Then('пул тегов клиента содержит только теги {string}', async function (this: ApiWorld, tags: string) {
  expect(await listSplitTags(requireClient.call(this))).toEqual(parseTags(tags));
});

Then('пул тегов клиента содержит тег {string}', async function (this: ApiWorld, tag: string) {
  expect(await listSplitTags(requireClient.call(this))).toContain(tag);
});

Then('пул тегов клиента не содержит тег {string}', async function (this: ApiWorld, tag: string) {
  expect(await listSplitTags(requireClient.call(this))).not.toContain(tag);
});

Then('начатая тренировка через API имеет тег {string}', function (this: ApiWorld, splitTag: string) {
  expect(this.lastError).toBeUndefined();
  expect(this.workoutSession?.splitTag).toBe(splitTag);
});
