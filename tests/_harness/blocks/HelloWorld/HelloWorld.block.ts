import { expect } from "@playwright/test";
import type { Page as PlaywrightPage } from "playwright";

import { Block } from "../../classes/Block";

const HELLO_SELECTORS = {
  root: ".HelloWorld",
  title: ".HelloWorld-Title",
  apiLine: ".HelloWorld-ApiLine",
} as const;

export class HelloWorldBlock extends Block<typeof HELLO_SELECTORS> {
  readonly selectors = HELLO_SELECTORS;

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async expectTitle(expected: string): Promise<void> {
    const title = this.findBySelector("title");
    await expect(title).toHaveText(expected);
  }

  async expectApiLineFromServer(): Promise<void> {
    const line = this.findBySelector("apiLine");
    await expect(line).toBeVisible();
    await expect(line).toHaveText("Hello world!");
  }
}
