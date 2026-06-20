import { Then, When } from '@cucumber/cucumber';

import type { CustomWorld } from '../../world';
import { ProfileBlock } from './Profile.block';

Then('отображается экран профиля с email {string}', async function (this: CustomWorld, email: string) {
  const block = new ProfileBlock(this.page);
  await block.expectEmail(email);
});

When('я выхожу из системы', async function (this: CustomWorld) {
  const block = new ProfileBlock(this.page);
  await block.logoutFromHome();
});
