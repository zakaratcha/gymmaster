import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class ClientsBlock extends Block {
  readonly selectors = {
    root: '.Clients',
    title: '.Clients-Title'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async expectTitle(expected: string): Promise<void> {
    await this.waitForVisible();
    await expect(this.findBySelector('title')).toHaveText(expected);
  }
}
