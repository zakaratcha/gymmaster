import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { createClient } from '../../commands/clients/createClient';
import { findClientByName } from '../../commands/clients/findClientByName';
import { createWorkoutSession } from '../../commands/workoutSessions/workoutSessions';
import { ClientsPage } from '../../pages/Clients/Clients.page';
import type { CustomWorld } from '../../world';
import { ClientCreateFormBlock } from '../ClientCreateForm/ClientCreateForm.block';
import { ClientsBlock } from '../Clients/Clients.block';
import { SplitTagFieldBlock } from '../SplitTagField/SplitTagField.block';
import { WorkoutSessionBlock } from '../WorkoutSession/WorkoutSession.block';
import { ClientHubBlock, type ClientHubSection } from './ClientHub.block';

function parseTags(value: string): readonly string[] {
  return value.split(',').map(tag => tag.trim());
}

const SECTION_BY_NAME: Record<string, ClientHubSection> = {
  планов: 'plans',
  'пула тегов': 'splitTags'
};

function readSection(name: string): ClientHubSection {
  const section = SECTION_BY_NAME[name];
  if (section === undefined) {
    throw new Error(`Неизвестная секция карточки "${name}"`);
  }

  return section;
}

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

Given(
  'для клиента {string} начата тренировка без плана с тегом {string}',
  async function (clientName: string, splitTag: string) {
    const client = await findClientByName(clientName);
    await createWorkoutSession(client.id, { splitTag });
  }
);

Given(
  /^первая загрузка (планов|пула тегов) на карточке завершится ошибкой$/,
  async function (this: CustomWorld, section: string) {
    await new ClientHubBlock(this.page).failLoadsUntilRetry(readSection(section));
  }
);

Given(/^загрузка (планов|пула тегов) завершается ошибкой$/, async function (this: CustomWorld, section: string) {
  await new ClientHubBlock(this.page).failLoads(readSection(section));
});

Given(/^загрузка (планов|пула тегов) на карточке задерживается$/, async function (this: CustomWorld, section: string) {
  await new ClientHubBlock(this.page).holdLoads(readSection(section));
});

When(/^загрузка (планов|пула тегов) на карточке завершается$/, async function (this: CustomWorld, section: string) {
  await new ClientHubBlock(this.page).releaseHeldLoads(readSection(section));
});

When('я повторяю загрузку пула тегов на карточке', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).retrySplitTags();
});

When('я повторяю загрузку планов на карточке', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).retryPlans();
});

Then('блок «Сплит» показывает теги {string}', async function (this: CustomWorld, tags: string) {
  await new ClientHubBlock(this.page).expectSplitTags(parseTags(tags));
});

Then('блок «Сплит» показывает тег {string}', async function (this: CustomWorld, tag: string) {
  await new ClientHubBlock(this.page).expectSplitTag(tag);
});

Then('блок «Сплит» показывает только тег {string}', async function (this: CustomWorld, tag: string) {
  await new ClientHubBlock(this.page).expectSplitTags([tag]);
});

Then('блок «Сплит» показывает «Тегов пока нет»', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).expectSplitEmpty();
});

Then('блок «Сплит» не показывает метку «Скоро» и кнопку настроек сплита', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).expectNoSplitStubs();
});

Then('на карточке клиента отображается ближайший план {string}', async function (this: CustomWorld, text: string) {
  const block = new ClientHubBlock(this.page);
  await block.waitForWorkoutDataReady();
  await block.expectNearestPlan(text);
});

Then(/^действие «Старт с плана» (доступно|недоступно)$/, async function (this: CustomWorld, state: string) {
  await new ClientHubBlock(this.page).expectStartEnabled(state === 'доступно');
});

Then(/^действие «Пустая сессия» (доступно|недоступно)$/, async function (this: CustomWorld, state: string) {
  await new ClientHubBlock(this.page).expectEmptyStartEnabled(state === 'доступно');
});

When('я добавляю через «+ тег» тег {string}', async function (this: CustomWorld, tag: string) {
  await new ClientHubBlock(this.page).addSplitTag(tag);
});

When('я открываю диалог «+ тег»', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).openSplitTagDialog();
});

When('я ввожу в диалоге «+ тег» тег {string}', async function (this: CustomWorld, tag: string) {
  await new ClientHubBlock(this.page).fillSplitTag(tag);
});

Given('сохранение тега на карточке завершится ошибкой', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).failNextSplitTagAdd();
});

When('я подтверждаю диалог «+ тег» без отправки', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).submitSplitTagWithoutRequest();
});

When('я подтверждаю диалог «+ тег», ожидая ошибку {int}', async function (this: CustomWorld, status: number) {
  await new ClientHubBlock(this.page).submitSplitTag(status);
});

Then(
  'диалог «+ тег» открыт с тегом {string} и показывает ошибку {string}',
  async function (this: CustomWorld, tag: string, message: string) {
    await new ClientHubBlock(this.page).expectSplitTagDialogError(tag, message);
  }
);

When('я открываю «Пустая сессия»', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).openEmptyStartDialog();
});

When('я начинаю пустую сессию', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).startEmptySession();
  await new WorkoutSessionBlock(this.page).waitForReady();
});

When('я начинаю «Пустая сессия» с тегом {string}', async function (this: CustomWorld, splitTag: string) {
  const block = new ClientHubBlock(this.page);
  await block.openEmptyStartDialog();
  await new SplitTagFieldBlock(this.page).fill(splitTag);
  await block.startEmptySession();
  await new WorkoutSessionBlock(this.page).waitForReady();
});

When('я начинаю пустую сессию без отправки', async function (this: CustomWorld) {
  await new ClientHubBlock(this.page).submitEmptyStartWithoutRequest();
});

When('я начинаю пустую сессию, ожидая ошибку {int}', async function (this: CustomWorld, status: number) {
  await new ClientHubBlock(this.page).submitEmptyStart(status);
});

Then(
  'диалог «Пустая сессия» открыт с тегом {string} и показывает ошибку {string}',
  async function (this: CustomWorld, tag: string, message: string) {
    await new ClientHubBlock(this.page).expectEmptyStartError(tag, message);
  }
);

Then('открыт экран тренировки с тегом {string}', async function (this: CustomWorld, splitTag: string) {
  await expect(this.page).toHaveURL(/\/workouts\/[^/]+\/[^/]+$/);
  const block = new WorkoutSessionBlock(this.page);
  await block.waitForReady();
  await block.expectSplitTag(splitTag);
});
