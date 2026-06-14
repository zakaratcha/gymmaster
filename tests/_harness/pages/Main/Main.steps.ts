import { Given } from '@cucumber/cucumber';

import { LoginFormBlock } from '../../blocks/LoginForm/LoginForm.block';
import type { CustomWorld } from '../../world';
import { MainPage } from './Main.page';

Given('я на главной странице приложения', async function (this: CustomWorld) {
  const main = new MainPage(this.page);
  await main.open();
  const loginForm = new LoginFormBlock(this.page);
  await loginForm.expectVisible();
});
