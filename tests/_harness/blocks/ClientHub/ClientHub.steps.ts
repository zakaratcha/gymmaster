import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { createClient } from '../../commands/clients/createClient';
import { ClientsPage } from '../../pages/Clients/Clients.page';
import type { CustomWorld } from '../../world';
import { ClientCreateFormBlock } from '../ClientCreateForm/ClientCreateForm.block';
import { ClientsBlock } from '../Clients/Clients.block';
import { ClientHubBlock } from './ClientHub.block';

Given(
  'существует клиент {string} с заметками {string} и весом {float}',
  async function (name: string, notes: string, bodyWeightKg: number) {
    await createClient({ name, notes, bodyWeightKg });
  }
);

Given('я на карточке клиента {string}', async function (this: CustomWorld, name: string) {
  await new ClientsPage(this.page).open();
  await new ClientsBlock(this.page).clickClientByName(name);
  await new ClientHubBlock(this.page).waitForReady();
});

Then('на карточке клиента отображается заголовок {string}', async function (this: CustomWorld, title: string) {
  const block = new ClientHubBlock(this.page);
  await block.waitForReady();
  await block.expectTitle(title);
});

Then('на карточке клиента отображается вес {string}', async function (this: CustomWorld, weight: string) {
  const block = new ClientHubBlock(this.page);
  await block.waitForReady();
  await block.expectBodyWeight(weight);
});

Then('на карточке клиента отображаются заметки {string}', async function (this: CustomWorld, notes: string) {
  const block = new ClientHubBlock(this.page);
  await block.waitForReady();
  await block.expectNotes(notes);
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

When('я открываю редактирование клиента на карточке', async function (this: CustomWorld) {
  const block = new ClientHubBlock(this.page);
  await block.waitForReady();
  await block.clickEdit();
  await new ClientCreateFormBlock(this.page).expectEditDialog();
});

Then(
  'форма редактирования содержит имя {string}, заметки {string} и вес {string}',
  async function (this: CustomWorld, name: string, notes: string, weight: string) {
    const form = new ClientCreateFormBlock(this.page);
    await form.expectEditDialog();
    await form.expectValues(name, notes, weight);
  }
);

When(
  'я ввожу в форме редактирования имя {string}, заметки {string} и вес {string}',
  async function (this: CustomWorld, name: string, notes: string, weight: string) {
    await new ClientCreateFormBlock(this.page).fillFields({ name, notes, weight });
  }
);

When('я сохраняю изменения клиента', async function (this: CustomWorld) {
  const form = new ClientCreateFormBlock(this.page);
  await new ClientHubBlock(this.page).submitMutation('PATCH', 200, () => form.submit());
  await form.waitForHidden();
});

When('я сохраняю изменения клиента, ожидая ошибку валидации', async function (this: CustomWorld) {
  const form = new ClientCreateFormBlock(this.page);
  await form.submit();
  await form.expectEditDialog();
  await form.expectError();
});

When('я сохраняю изменения клиента, ожидая ошибку 500', async function (this: CustomWorld) {
  const form = new ClientCreateFormBlock(this.page);
  await new ClientHubBlock(this.page).submitMutation('PATCH', 500, () => form.submit());
  await form.expectEditDialog();
  await form.expectError();
});

When('я отменяю редактирование клиента', async function (this: CustomWorld) {
  await new ClientCreateFormBlock(this.page).cancel();
});

Then('форма редактирования клиента закрыта', async function (this: CustomWorld) {
  await new ClientCreateFormBlock(this.page).waitForHidden();
});

Then('форма редактирования клиента показывает ошибку', async function (this: CustomWorld) {
  const form = new ClientCreateFormBlock(this.page);
  await form.expectEditDialog();
  await form.expectError();
});

When('я перезагружаю карточку клиента', async function (this: CustomWorld) {
  await this.page.reload();
  await new ClientHubBlock(this.page).waitForReady();
});

When('я открываю удаление клиента на карточке', async function (this: CustomWorld) {
  const block = new ClientHubBlock(this.page);
  await block.waitForReady();
  await block.clickDelete();
  await block.expectDeleteDialog();
});

When('я отменяю удаление клиента', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).cancelDelete();
});

When('я подтверждаю удаление клиента', async function (this: CustomWorld) {
  const block = new ClientHubBlock(this.page);
  await block.confirmDelete();
  await block.expectDeleteDialogHidden();
  await new ClientsPage(this.page).testUrl();
  await new ClientsBlock(this.page).waitForListReady();
});

When('я подтверждаю удаление клиента, ожидая ошибку 500', async function (this: CustomWorld) {
  const block = new ClientHubBlock(this.page);
  await block.submitMutation('DELETE', 500, () => block.confirmDelete());
  await block.expectDeleteError();
});

Then('диалог удаления клиента закрыт', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).expectDeleteDialogHidden();
});

Then('диалог удаления клиента показывает ошибку', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).expectDeleteError();
});

Then('удалённый клиент {string} отсутствует в списке', async function (this: CustomWorld, name: string) {
  const block = new ClientsBlock(this.page);
  await block.waitForListReady();
  await expect.poll(() => block.getClientNames()).not.toContain(name);
});

Given('следующее сохранение клиента на карточке завершится ошибкой 500', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).failNextMutation('PATCH');
});

Given('следующее удаление клиента на карточке завершится ошибкой 500', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).failNextMutation('DELETE');
});
