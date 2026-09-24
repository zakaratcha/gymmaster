import { type IWorldOptions, World } from '@cucumber/cucumber';

import type { ApiError } from '../../src/services/api/api.models';
import type { AuthResult } from '../../src/services/auth/auth.models';
import type { Client } from '../../src/services/clients/clients.models';
import type { Exercise } from '../../src/services/exercises/exercises.models';
import type { Trainer } from '../../src/services/trainers/trainers.models';

export class ApiWorld extends World {
  authResult?: AuthResult;
  lastError?: ApiError;
  client?: Client;
  clients?: readonly Client[];
  exercise?: Exercise;
  exercises?: readonly Exercise[];
  trainer?: Trainer;

  constructor(options: IWorldOptions) {
    super(options);
  }
}
