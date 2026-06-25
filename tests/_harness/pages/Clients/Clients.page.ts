import type { Page as PlaywrightPage } from 'playwright';

import { Page } from '../../classes/Page';

const CLIENTS_SELECTORS = {
  root: '.Clients',
  title: '.Clients-Title'
} as const;

export class ClientsPage extends Page<typeof CLIENTS_SELECTORS> {
  readonly title = 'Клиенты';
  readonly url = '/clients';
  readonly selectors = CLIENTS_SELECTORS;

  constructor(page: PlaywrightPage) {
    super(page);
  }
}
