import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class ActiveWorkoutTabsBlock extends Block {
  readonly selectors = {
    root: '.ActiveWorkoutTabs',
    tab: '.ActiveWorkoutTabs-Tab',
    activeTab: '.ActiveWorkoutTabs-Tab_active',
    loading: '.ActiveWorkoutTabs-Loading',
    error: '.ActiveWorkoutTabs-Error',
    errorText: '.ActiveWorkoutTabs-Error p',
    retry: '.ActiveWorkoutTabs-Error .Button',
    bottomNav: '.Shell-BottomNav'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async waitForTabs(names: readonly string[]): Promise<void> {
    await this.waitForVisible();
    await expect(this.findAllBySelector('tab')).toHaveText([...names]);
  }

  override async waitForHidden(): Promise<void> {
    await expect(this.page.locator('.ActiveWorkoutTabs, .ActiveWorkoutTabs-Loading')).toHaveCount(0);
  }

  async tabNames(): Promise<string[]> {
    const texts = await this.findAllBySelector('tab').allTextContents();
    return texts.map(text => text.trim());
  }

  async openTab(name: string): Promise<void> {
    await this.findAllBySelector('tab').filter({ hasText: name }).first().click();
  }

  async openHome(): Promise<void> {
    await this.openTab('Главная');
  }

  async activeTabName(): Promise<string> {
    const text = await this.findBySelector('activeTab').textContent();
    return text?.trim() ?? '';
  }

  async expectBottomNavVisible(): Promise<void> {
    await expect(this.findBySelector('bottomNav')).toBeVisible();
  }

  async expectBottomNavHidden(): Promise<void> {
    await expect(this.findBySelector('bottomNav')).toHaveCount(0);
  }

  async failLoad(): Promise<void> {
    await this.page.route(/\/api\/workout-sessions\/active$/, async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Временная ошибка сервера' })
      });
    });
  }

  async restoreLoad(): Promise<void> {
    await this.page.unroute(/\/api\/workout-sessions\/active$/);
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async expectError(): Promise<void> {
    await expect(this.findBySelector('error')).toBeVisible();
    await expect(this.findBySelector('errorText')).toHaveText(/\S/);
    await expect(this.findBySelector('retry')).toBeEnabled();
  }

  async retry(): Promise<void> {
    await this.findBySelector('retry').click();
    await expect(this.findBySelector('error')).toHaveCount(0);
  }
}
