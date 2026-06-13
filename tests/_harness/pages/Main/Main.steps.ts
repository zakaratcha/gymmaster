import { Given } from '@cucumber/cucumber';

import type { CustomWorld } from '../../world';
import { MainPage } from './Main.page';

Given('открыта главная страница приложения', async function (this: CustomWorld) {
  const main = new MainPage(this.page);
  await main.open();
});
