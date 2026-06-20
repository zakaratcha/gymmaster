import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class AppBlock extends Block {
  readonly selectors = {
    root: '.App',
    loginOverlay: '.App-LoginOverlay'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async waitForLoginOverlayHidden(): Promise<void> {
    await this.findBySelector('loginOverlay').waitFor({ state: 'hidden' });
  }
}
