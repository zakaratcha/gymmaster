import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class AdminLayoutBlock extends Block {
  readonly selectors = {
    root: '.AdminLayout',
    back: '.AdminLayout-Back',
    title: '.AdminLayout-Title'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async expectTitle(): Promise<void> {
    await expect(this.findBySelector('title')).toHaveText('Администрирование');
  }

  async goBack(): Promise<void> {
    await this.findBySelector('back').click();
  }
}
