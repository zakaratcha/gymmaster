import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';
import { AppBlock } from '../App/App.block';

export class WorkoutsBlock extends Block {
  readonly selectors = {
    root: '.Workouts',
    title: '.Workouts-Title',
    profileLink: '.Workouts-ProfileLink'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async expectTitle(expected: string): Promise<void> {
    await this.waitForVisible();
    await expect(this.findBySelector('title')).toHaveText(expected);
  }

  async openProfile(): Promise<void> {
    const app = new AppBlock(this.page);
    await app.waitForLoginOverlayHidden();
    await this.findBySelector('profileLink').click();
  }
}
