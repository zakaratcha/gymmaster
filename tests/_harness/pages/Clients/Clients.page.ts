import type { Page as PlaywrightPage } from 'playwright';

import { Page } from '../../classes/Page';

export class ClientsPage extends Page {
  readonly title = 'Клиенты';
  readonly url = '/clients';
  readonly selectors = {
    root: '.Clients',
    title: '.Clients-Title'
  } as const;

  constructor(page: PlaywrightPage) {
    super(page);
  }
}
