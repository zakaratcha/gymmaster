import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ClientsPage } from '../../pages/Clients/Clients.page';
import type { CustomWorld } from '../../world';
import { ClientHubBlock } from './ClientHub.block';

Then('на карточке клиента отображается заголовок {string}', async function (this: CustomWorld, title: string) {
  const block = new ClientHubBlock(this.page);
  await block.waitForReady();
  expect(await block.getTitle()).toBe(title);
});

Then('на карточке клиента отображается вес {string}', async function (this: CustomWorld, weight: string) {
  const block = new ClientHubBlock(this.page);
  await block.waitForReady();
  expect(await block.getBodyWeightText()).toBe(weight);
});

When('я нажимаю Назад на карточке клиента', async function (this: CustomWorld) {
  const block = new ClientHubBlock(this.page);
  await block.waitForReady();
  await block.clickBack();
});

Then('адрес страницы — карточка клиента {string}', async function (this: CustomWorld, _name: string) {
  await expect(this.page).toHaveURL(/\/clients\/[^/]+$/);
});

Then('адрес страницы — список клиентов', async function (this: CustomWorld) {
  const page = new ClientsPage(this.page);
  await page.testUrl();
});
