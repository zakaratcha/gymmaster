import { expect } from "@playwright/test";
import type { Page as PlaywrightPage } from "playwright";

import { Block, type BlockSelectors } from "./Block";
import { getBaseUrl } from "../config/env";

export abstract class Page<S extends BlockSelectors = BlockSelectors> extends Block<S> {
  abstract readonly url: string;
  abstract readonly title: string;

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async open(urlExtras = ""): Promise<void> {
    const base = getBaseUrl();
    const path = this.url === "/" ? "/" : this.url;
    const url = new URL(path + urlExtras, `${base}/`).href;
    await this.page.goto(url);
    await this.waitForVisible();
  }

  async testUrl(): Promise<void> {
    const base = getBaseUrl();
    const expected = new URL(this.url === "/" ? "/" : this.url, `${base}/`).href;
    await expect(this.page).toHaveURL(expected);
  }
}
