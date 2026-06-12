import { expect } from "@playwright/test";
import type { Page as PlaywrightPage } from "playwright";

import { Block } from "../../classes/Block";

export class HelloWorldBlock extends Block {
  readonly selectors = {
    root: ".HelloWorld",
    title: ".HelloWorld-Title",
    apiLine: ".HelloWorld-ApiLine",
  };

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
