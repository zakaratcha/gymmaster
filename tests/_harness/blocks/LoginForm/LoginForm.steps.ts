import { Given, Then, When } from '@cucumber/cucumber';

import { MainPage } from '../../pages/Main/Main.page';
import type { CustomWorld } from '../../world';
import { AppBlock } from '../App/App.block';
import { LoginFormBlock } from './LoginForm.block';

async function fillLoginForm(this: CustomWorld, email: string, password: string): Promise<void> {
  const block = new LoginFormBlock(this.page);
  await block.login(email, password);
}

Given(
  'я авторизован с email {string} и паролем {string}',
  async function (this: CustomWorld, email: string, password: string) {
    const main = new MainPage(this.page);
    await main.open();
    await fillLoginForm.call(this, email, password);
    const app = new AppBlock(this.page);
    await app.waitForLoginOverlayHidden();
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
