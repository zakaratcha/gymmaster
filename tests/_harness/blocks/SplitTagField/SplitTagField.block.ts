import { expect } from '@playwright/test';
import type { Locator, Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class SplitTagFieldBlock extends Block {
  readonly selectors = {
    root: '.SplitTagField',
    input: '.SplitTagField input',
    suggestion: '.SplitTagField-Suggestion'
  } as const;

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  private get suggestions(): Locator {
    return this.findBySelector('root').getByRole('group', { name: 'Подсказки тегов' });
  }

  async fill(value: string): Promise<void> {
    await this.waitForVisible();
    await this.findBySelector('input').fill(value);
  }

  async chooseSuggestion(tag: string): Promise<void> {
    await this.waitForVisible();
    await this.suggestions.getByRole('button', { name: tag, exact: true }).click();
    await expect(this.findBySelector('input')).toHaveValue(tag);
  }

  async expectSuggestions(tags: readonly string[]): Promise<void> {
    await this.waitForVisible();
    await expect(this.findBySelector('suggestion')).toHaveText([...tags]);
  }

  async expectSuggestionAbsent(tag: string): Promise<void> {
    await this.waitForVisible();
    await expect(this.findBySelector('suggestion').filter({ hasText: tag })).toHaveCount(0);
  }

  async expectNoSuggestions(): Promise<void> {
    await this.waitForVisible();
    await expect(this.findBySelector('suggestion')).toHaveCount(0);
  }
}
