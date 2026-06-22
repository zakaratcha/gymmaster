import { Given, Then, When } from '@cucumber/cucumber';

import type { CustomWorld } from '../../world';
import { ClientsBlock } from '../Clients/Clients.block';
import { LoginFormBlock } from './LoginForm.block';

async function fillLoginForm(this: CustomWorld, email: string, password: string): Promise<void> {
  const block = new LoginFormBlock(this.page);
  await block.login(email, password);
}

Given(
  'я авторизован с email {string} и паролем {string}',
  async function (this: CustomWorld, email: string, password: string) {
    await fillLoginForm.call(this, email, password);
    const clients = new ClientsBlock(this.page);
    await clients.waitForVisible();
  }
);

When('я авторизуюсь в форме входа с email {string} и паролем {string}', fillLoginForm);

Then('отображается форма входа', async function (this: CustomWorld) {
  const loginForm = new LoginFormBlock(this.page);
  await loginForm.expectVisible();
});

Then('на форме входа отображается ошибка {string}', async function (this: CustomWorld, text: string) {
  const loginForm = new LoginFormBlock(this.page);
  await loginForm.expectError(text);
});
