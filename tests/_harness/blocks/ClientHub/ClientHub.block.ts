import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class ClientHubBlock extends Block {
  readonly selectors = {
    root: '.ClientHub',
    title: '.ClientHub-Title',
    back: '.ClientHub-Back',
    edit: '.ClientHub-Edit',
    delete: '.ClientHub-Delete',
    deleteDialog: 'dialog.ClientHub-DeleteDialog',
    deleteConfirm: '.ClientHub-DeleteConfirm',
    deleteCancel: '.ClientHub-DeleteCancel',
    deleteError: '.ClientHub-DeleteError',
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

  async expectTitle(title: string): Promise<void> {
    await expect(this.findBySelector('title')).toHaveText(title);
  }

  async expectBodyWeight(weight: string): Promise<void> {
    await expect(this.findBySelector('bodyWeight')).toHaveText(weight);
  }

  async expectNotes(notes: string): Promise<void> {
    await expect(this.findBySelector('notesPreview')).toHaveText(notes);
  }

  async clickEdit(): Promise<void> {
    await this.findBySelector('edit').click();
  }

  async clickDelete(): Promise<void> {
    await this.findBySelector('delete').click();
  }

  async expectDeleteDialog(): Promise<void> {
    await expect(this.findBySelector('deleteDialog')).toBeVisible();
    await expect(this.findBySelector('deleteDialog')).toHaveJSProperty('open', true);
  }

  async expectDeleteDialogHidden(): Promise<void> {
    await expect(this.findBySelector('deleteDialog')).toBeHidden();
  }

  async cancelDelete(): Promise<void> {
    await this.findBySelector('deleteCancel').click();
    await this.expectDeleteDialogHidden();
  }

  async confirmDelete(): Promise<void> {
    await this.findBySelector('deleteConfirm').click();
  }

  async expectDeleteError(): Promise<void> {
    await this.expectDeleteDialog();
    await expect(this.findBySelector('deleteError')).toBeVisible();
    await expect(this.findBySelector('deleteError')).toHaveText(/\S/);
    await expect(this.findBySelector('deleteConfirm')).toBeEnabled();
  }

  async failNextMutation(method: 'PATCH' | 'DELETE'): Promise<void> {
    const url = new URL(this.page.url());
    url.pathname = `/api${url.pathname}`;
    url.search = '';
    url.hash = '';
    let failed = false;

    await this.page.route(url.toString(), async route => {
      if (route.request().method() !== method || failed) {
        await route.continue();
        return;
      }

      failed = true;
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Временная ошибка сервера' })
      });
    });
  }

  async clickBack(): Promise<void> {
    await this.findBySelector('back').click();
  }
}
