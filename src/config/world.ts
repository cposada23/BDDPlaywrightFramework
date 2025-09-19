// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

import { World, IWorldOptions, setWorldConstructor, Before, After } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, firefox, webkit } from 'playwright';
import { TestFixtures } from '@fixtures/testFixtures';

export interface CustomWorldOptions extends IWorldOptions {
  browser: string;
  headed?: boolean;
  slowMo?: number;
  baseURL?: string;
}

export class CustomWorld extends World<CustomWorldOptions> {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;
  public fixtures!: TestFixtures;
  private baseURL: string;

  constructor(options: IWorldOptions) {
    super(options);
    this.baseURL = process.env.BASE_URL || 'https://blankfactor.com';
  }

  async openBrowser(): Promise<void> {
    const browserType = this.parameters.browser || 'chromium';
    const launchOptions = {
      headless: !this.parameters.headed,
      slowMo: this.parameters.slowMo || 0,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    };

    switch (browserType) {
      case 'firefox':
        this.browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
        this.browser = await webkit.launch(launchOptions);
        break;
      default:
        this.browser = await chromium.launch(launchOptions);
        break;
    }

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: {
        dir: './reports/videos',
        size: { width: 1280, height: 720 }
      }
    });

    // Enable tracing
    await this.context.tracing.start({ screenshots: true, snapshots: true });

    this.page = await this.context.newPage();
    this.fixtures = new TestFixtures();
  }

  async closeBrowser(): Promise<void> {
    if (this.context) {
      await this.context.tracing.stop({ path: `./reports/traces/trace-${Date.now()}.zip` });
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  async navigateToBaseURL(): Promise<void> {
    await this.page.goto(this.baseURL);
  }

  async takeScreenshot(name: string): Promise<void> {
    if (this.page) {
      await this.page.screenshot({
        path: `./reports/screenshots/${name}-${Date.now()}.png`,
        fullPage: true
      });
    }
  }
}

setWorldConstructor(CustomWorld);

Before({ timeout: 60000 }, async function (this: CustomWorld) {
  await this.openBrowser();
});

After({ timeout: 30000 }, async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === 'FAILED') {
    await this.takeScreenshot(scenario.pickle.name);
  }
  await this.closeBrowser();
});
