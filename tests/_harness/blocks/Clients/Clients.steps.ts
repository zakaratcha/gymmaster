import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import type { CustomWorld } from '../../world';
import { ClientCreateFormBlock } from '../ClientCreateForm/ClientCreateForm.block';
import { ClientsBlock } from './Clients.block';

When('я ищу клиента {string}', async function (this: CustomWorld, query: string) {
  const block = new ClientsBlock(this.page);
  await block.waitForListReady();
  await block.search(query);
});

When('я открываю карточку клиента {string} из списка', async function (this: CustomWorld, name: string) {
  const block = new ClientsBlock(this.page);
  await block.clickClientByName(name);
});

When('я открываю карточку клиента {string} из недавних', async function (this: CustomWorld, name: string) {
  const block = new ClientsBlock(this.page);
  await block.clickRecentChipByName(name);
});

When('я открываю форму добавления клиента', async function (this: CustomWorld) {
  const block = new ClientsBlock(this.page);
  await block.waitForListReady();
  await block.clickFab();
  const form = new ClientCreateFormBlock(this.page);
  await form.waitForVisible();
});

When('я создаю клиента с именем {string} через форму', async function (this: CustomWorld, name: string) {
  const form = new ClientCreateFormBlock(this.page);
  await form.fillAndSubmit({ name });
  await form.waitForHidden();
});

Then('отображается экран клиентов', async function (this: CustomWorld) {
  const block = new ClientsBlock(this.page);
  await block.waitForVisible();
  expect(await block.getTitle()).toBe('Клиенты');
});

Then('на экране клиентов отображается клиент {string}', async function (this: CustomWorld, name: string) {
  const block = new ClientsBlock(this.page);
  await block.waitForListReady();
  expect(await block.getClientNames()).toContain(name);
});

Then('на экране клиентов не отображается клиент {string}', async function (this: CustomWorld, name: string) {
  const block = new ClientsBlock(this.page);
  await block.waitForListReady();
  expect(await block.getClientNames()).not.toContain(name);
});

Then('на экране клиентов отображается подсказка {string}', async function (this: CustomWorld, text: string) {
  const block = new ClientsBlock(this.page);
  await block.waitForListReady();
  expect(await block.getEmptyStateText()).toBe(text);
});
