import { expect } from '@playwright/test';
import type { Locator, Page as PlaywrightPage } from 'playwright';

export type BlockSelectors = {
  readonly root: string;
} & Record<string, string>;

export abstract class Block<S extends BlockSelectors = BlockSelectors> {
  abstract readonly selectors: S;

  constructor(
    protected readonly page: PlaywrightPage,
    protected readonly parent: Locator | null = null
  ) {}

  protected get scope(): PlaywrightPage | Locator {
    return this.parent ?? this.page;
  }

  protected getSelector(key: keyof S): string {
    const selector = this.selectors[key];
    if (selector === undefined) {
      throw new Error(`Selector "${String(key)}" is not defined`);
    }
    return selector;
  }

  protected findBySelector(key: keyof S): Locator {
    return this.scope.locator(this.getSelector(key));
  }

  protected findAllBySelector(key: keyof S): Locator {
    return this.scope.locator(this.getSelector(key));
  }

  async waitForExist(): Promise<void> {
    const root = this.findBySelector('root');
    await root.waitFor({ state: 'attached' });
  }

  async waitForVisible(): Promise<void> {
    const root = this.findBySelector('root');
    await expect(root).toBeVisible();
  }

  async waitForHidden(): Promise<void> {
    const root = this.findBySelector('root');
    await expect(root).toBeHidden();
  }

  async isVisible(): Promise<boolean> {
    return await this.findBySelector('root').isVisible();
  }
}
