import { After, Before, setDefaultTimeout, setWorldConstructor } from '@cucumber/cucumber';

import { api } from '../../src/services/api/api.service';
import { resetApiSession } from './commands/resetApiSession';
import { getBaseUrl } from './config/env';
import { ApiWorld } from './world.api';

setWorldConstructor(ApiWorld);
setDefaultTimeout(30 * 1000);

Before(async function () {
  api.baseUrl = getBaseUrl();
  await resetApiSession();
});

After(async function () {
  await resetApiSession();
});
