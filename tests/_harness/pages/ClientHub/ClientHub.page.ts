import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { ClientHubBlock } from '../../blocks/ClientHub/ClientHub.block';
import { Page } from '../../classes/Page';
import { getBaseUrl } from '../../config/env';

export class ClientHubPage extends Page {
  readonly title = 'Карточка клиента';
  readonly url = '/clients';
  readonly selectors = {
    root: '.ClientHub',
    title: '.ClientHub-Title'
  } as const;

  constructor(page: PlaywrightPage) {
    super(page);
  }

  override async open(clientId: string): Promise<void> {
    await super.open(`/${clientId}`);
    const block = new ClientHubBlock(this.page);
    await block.waitForReady();
  }

  async testClientUrl(clientId: string): Promise<void> {
    const base = getBaseUrl();
    const expected = new URL(`/clients/${clientId}`, `${base}/`).href;
    await expect(this.page).toHaveURL(expected);
  }
}
