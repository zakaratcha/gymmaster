import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';
import { findClientByName } from '../../commands/clients/findClientByName';

export class ClientsBlock extends Block {
  readonly selectors = {
    root: '.Clients',
    title: '.Clients-Title',
    searchInput: '.Clients-SearchField .Input-Control',
    emptyState: '.Clients-Empty',
    clientRow: '.Clients-RowName',
    clientRowButton: '.Clients-Row',
    recentChip: '.Clients-RecentChip',
    fab: '.Clients-Fab',
    error: '.Clients-Error'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async search(query: string): Promise<void> {
    await this.findBySelector('searchInput').fill(query);
  }

  async clickFab(): Promise<void> {
    await this.findBySelector('fab').click();
  }

  async getTitle(): Promise<string> {
    const title = await this.findBySelector('title').textContent();
    return title ?? '';
  }

  async getClientNames(): Promise<string[]> {
    const rows = this.findAllBySelector('clientRow');
    const texts = await rows.allTextContents();
    return texts.map(text => text.trim());
  }

  async getEmptyStateText(): Promise<string | null> {
    const empty = this.findBySelector('emptyState');
    if (!(await empty.isVisible())) {
      return null;
    }

    const text = await empty.textContent();
    return text?.trim() ?? null;
  }

  async clickClientByName(name: string): Promise<void> {
    await this.waitForListReady();
    await this.findBySelector('root')
      .locator(this.selectors.clientRowButton)
      .filter({ has: this.page.locator(this.selectors.clientRow, { hasText: name }) })
      .first()
      .click();
  }

  async clickRecentChipByName(name: string): Promise<void> {
    await this.waitForListReady();
    const client = await findClientByName(name);
    await this.findBySelector('root')
      .locator(this.selectors.recentChip)
      .and(this.page.locator(`[data-client-id="${client.id}"]`))
      .click();
  }

  async waitForListReady(): Promise<void> {
    await this.waitForVisible();

    const content = this.findBySelector('root').locator('.Clients-Content');
    const loading = content.locator('.Clients-Loading');
    if (await loading.isVisible()) {
      await loading.waitFor({ state: 'hidden' });
    }
    await content.locator('.Clients-Empty, .Clients-RowName, .Clients-Error').first().waitFor({ state: 'visible' });
  }
}
