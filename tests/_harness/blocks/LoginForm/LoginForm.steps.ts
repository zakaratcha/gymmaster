import { Given, Then, When } from '@cucumber/cucumber';

import type { CustomWorld } from '../../world';
import { ProfileBlock } from '../Profile/Profile.block';
import { LoginFormBlock } from './LoginForm.block';

async function fillLoginForm(this: CustomWorld, email: string, password: string): Promise<void> {
  const block = new LoginFormBlock(this.page);
  await block.login(email, password);
}

Given(
  'я авторизован с email {string} и паролем {string}',
  async function (this: CustomWorld, email: string, password: string) {
    await fillLoginForm.call(this, email, password);
    const profile = new ProfileBlock(this.page);
    await profile.waitForVisible();
  }
);

When('я авторизуюсь в форме входа с email {string} и паролем {string}', fillLoginForm);

Then('отображается форма входа', async function (this: CustomWorld) {
  const block = new LoginFormBlock(this.page);
  await block.expectVisible();
});
