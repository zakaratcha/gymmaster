import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class ClientHubBlock extends Block {
  readonly selectors = {
    root: '.ClientHub',
    title: '.ClientHub-Title',
    back: '.ClientHub-Back',
    edit: '.ClientHub-Edit',
    loading: '.ClientHub-Loading',
    bodyWeight: '.ClientHub-BodyWeight',
    notesPreview: '.ClientHub-NotesPreview',
    sectionTitle: '.ClientHub-SectionTitle',
    error: '.ClientHub-Error'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async waitForReady(): Promise<void> {
    await this.waitForVisible();

    const loading = this.findBySelector('loading');
    if (await loading.isVisible()) {
      await loading.waitFor({ state: 'hidden' });
    }

    await this.findBySelector('bodyWeight').or(this.findBySelector('error')).first().waitFor({ state: 'visible' });
  }

  async getTitle(): Promise<string> {
    const title = await this.findBySelector('title').textContent();
    return title?.trim() ?? '';
  }

  async clickBack(): Promise<void> {
    await this.findBySelector('back').click();
  }

  async getBodyWeightText(): Promise<string> {
    const text = await this.findBySelector('bodyWeight').textContent();
    return text?.trim() ?? '';
  }
}
