import { After, Before, setDefaultTimeout, setWorldConstructor } from '@cucumber/cucumber';

import { api } from '../../src/services/api/api.service';
import { resetApiSession } from './commands/auth/apiSession';
import { getBaseUrl } from './config/env';
import { ApiWorld } from './world.api';

setWorldConstructor(ApiWorld);
setDefaultTimeout(30 * 1000);

Before(function () {
  api.baseUrl = getBaseUrl();
  resetApiSession();
});

After(function () {
  resetApiSession();
});
