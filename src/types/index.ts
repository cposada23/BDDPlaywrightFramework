import { Page, BrowserContext, Browser } from 'playwright';

export interface CustomWorld {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  baseURL: string;
}

export interface TestConfig {
  baseURL: string;
  timeout: number;
  headless: boolean;
  slowMo: number;
  retries: number;
}

export interface StepContext {
  world: CustomWorld;
  testData?: any;
  currentPage?: string;
}

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

export interface LaunchOptions {
  headless?: boolean;
  slowMo?: number;
  timeout?: number;
  args?: string[];
}
