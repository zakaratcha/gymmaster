import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';
import { AppBlock } from '../App/App.block';

export class ShellBlock extends Block {
  readonly selectors = {
    root: '.Shell',
    bottomNav: '.Shell-BottomNav',
    clientsTab: '.Shell-NavItem_tab_clients',
    exercisesTab: '.Shell-NavItem_tab_exercises',
    accountTab: '.Shell-NavItem_tab_account'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async openAccountTab(): Promise<void> {
    const app = new AppBlock(this.page);
    await app.waitForLoginOverlayHidden();
    await this.findBySelector('accountTab').click();
  }
}
