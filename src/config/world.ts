// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

import { World, IWorldOptions, setWorldConstructor, Before, After, AfterStep, BeforeAll } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, firefox, webkit } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// Enhanced error logging utility
class ErrorLogger {
  static logError(context: string, error: any, additionalInfo?: any): void {
    console.error(`\n❌ ERROR IN: ${context}`);
    console.error(`📋 Error Type: ${error.name || 'Unknown'}`);
    console.error(`💬 Error Message: ${error.message || 'No message provided'}`);
    
    if (additionalInfo) {
      console.error(`ℹ️  Additional Info:`, additionalInfo);
    }
    
    if (error.stack) {
      console.error(`📍 Stack Trace:`);
      console.error(error.stack);
    }
    console.error(`\n`);
  }
}

// Global variables to track screenshot metadata
declare global {
  var stepScreenshots: Map<string, { stepName: string; scenarioName: string; path: string; stepIndex: number }>;
}

if (!global.stepScreenshots) {
  global.stepScreenshots = new Map();
}

export interface CustomWorldOptions extends IWorldOptions {
  browser: string;
  headed?: boolean;
  slowMo?: number;
  baseURL?: string;
  scenarioName?: string;
  stepIndex?: number;
}

export class CustomWorld extends World<CustomWorldOptions> {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;
  private baseURL: string;

  constructor(options: IWorldOptions) {
    super(options);
    this.baseURL = process.env.BASE_URL || 'https://blankfactor.com';
    this.parameters.stepIndex = 0;
  }

  /**
   * Clear all screenshots from the screenshots directory
   */
  static clearScreenshots(): void {
    const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
    if (fs.existsSync(screenshotDir)) {
      const files = fs.readdirSync(screenshotDir);
      files.forEach(file => {
        if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
          fs.unlinkSync(path.join(screenshotDir, file));
        }
      });
      console.log(`🧹 Cleared ${files.length} screenshot(s) from previous runs`);
    }
    // Clear the global screenshot metadata
    global.stepScreenshots.clear();
  }

  async openBrowser(): Promise<void> {
    try {
      const browserType = this.parameters.browser || 'chromium';
      console.log(`🌐 Launching ${browserType} browser...`);
      
      const launchOptions = {
        headless: !this.parameters.headed,
        slowMo: this.parameters.slowMo || 0,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        timeout: 60000 // 60 second timeout for browser launch
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
      console.log(`✅ ${browserType} browser launched successfully`);

      console.log('🔧 Creating browser context...');
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: {
          dir: './reports/videos',
          size: { width: 1280, height: 720 }
        }
      });
      console.log('✅ Browser context created');

      console.log('🎬 Starting tracing...');
      // Enable tracing with more options
      await this.context.tracing.start({ 
        screenshots: true, 
        snapshots: true,
        sources: true
      });
      console.log('✅ Tracing started');

      console.log('📄 Creating new page...');
      this.page = await this.context.newPage();
      
      // Set longer timeouts for page operations
      this.page.setDefaultTimeout(60000); // 60 seconds
      this.page.setDefaultNavigationTimeout(90000); // 90 seconds for navigation
      
      console.log('✅ Page created with extended timeouts');
    } catch (error) {
      ErrorLogger.logError('Browser Setup', error, {
        browserType: this.parameters.browser || 'chromium',
        headed: this.parameters.headed,
        slowMo: this.parameters.slowMo
      });
      throw error;
    }
  }

  async closeBrowser(): Promise<void> {
    try {
      if (this.context) {
        console.log('🛑 Stopping tracing...');
        await this.context.tracing.stop({ path: `./reports/traces/trace-${Date.now()}.zip` });
        console.log('✅ Tracing saved');
      }
      
      if (this.browser) {
        console.log('🔒 Closing browser...');
        await this.browser.close();
        console.log('✅ Browser closed');
      }
    } catch (error) {
      ErrorLogger.logError('Browser Cleanup', error, 'Error during browser cleanup');
      
      // Force close browser if normal close fails
      try {
        if (this.browser) {
          await this.browser.close();
        }
      } catch (forceCloseError: any) {
        console.error('Failed to force close browser:', forceCloseError?.message || 'Unknown error');
      }
    }
  }

  async navigateToBaseURL(): Promise<void> {
    await this.page.goto(this.baseURL);
  }

  async takeScreenshot(name: string): Promise<string | null> {
    if (this.page) {
      // Clean the name for consistent file naming
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      const screenshotPath = `./reports/screenshots/${cleanName}-${Date.now()}.png`;
      
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    }
    return null;
  }

  async takeScreenshotForStep(stepName: string, scenarioName: string): Promise<string | null> {
    if (this.page) {
      const cleanScenario = scenarioName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      const cleanStep = stepName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      const timestamp = Date.now();
      const screenshotPath = `./reports/screenshots/${cleanScenario}-${cleanStep}-${timestamp}.png`;
      
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      
      // Store metadata for Allure report linking
      const stepIndex = this.parameters.stepIndex || 0;
      const screenshotKey = `${scenarioName}-${stepName}-${timestamp}`;
      global.stepScreenshots.set(screenshotKey, {
        stepName,
        scenarioName,
        path: screenshotPath,
        stepIndex
      });
      
      console.log(`📸 Step screenshot saved: ${screenshotPath} (Step ${stepIndex}: ${stepName})`);
      return screenshotPath;
    }
    return null;
  }
}

setWorldConstructor(CustomWorld);

// Clear screenshots before all tests start
BeforeAll({ timeout: 30000 }, async function () {
  try {
    console.log('🚀 Starting test suite - clearing old screenshots...');
    CustomWorld.clearScreenshots();
  } catch (error) {
    ErrorLogger.logError('BeforeAll Hook', error, 'Failed to clear screenshots');
    throw error;
  }
});

Before({ timeout: 120000 }, async function (this: CustomWorld, scenario) {
  try {
    console.log(`🎬 Starting scenario: "${scenario.pickle.name}"`);
    // Store scenario name for step screenshots
    this.parameters.scenarioName = scenario.pickle.name;
    this.parameters.stepIndex = 0; // Reset step counter for each scenario
    await this.openBrowser();
    console.log('✅ Browser opened successfully');
  } catch (error) {
    ErrorLogger.logError('Before Hook - Browser Setup', error, {
      scenarioName: scenario.pickle.name,
      browser: this.parameters.browser
    });
    throw error;
  }
});

AfterStep({ timeout: 30000 }, async function (this: CustomWorld, { pickleStep, result }) {
  // Increment step counter
  this.parameters.stepIndex = (this.parameters.stepIndex || 0) + 1;
  
  const shouldTakeScreenshotOnFailure = result.status === 'FAILED';
  const shouldTakeScreenshotOnAll = process.env.SCREENSHOT_ALL_STEPS === 'true';
  
  if (shouldTakeScreenshotOnFailure || shouldTakeScreenshotOnAll) {
    const stepName = pickleStep.text || 'unknown-step';
    const scenarioName = this.parameters.scenarioName || 'unknown-scenario';
    const screenshotPath = await this.takeScreenshotForStep(stepName, scenarioName);
    
    if (screenshotPath) {
      if (shouldTakeScreenshotOnFailure) {
        console.log(`🔍 Step ${this.parameters.stepIndex} failed - screenshot captured: ${stepName}`);
      } else if (shouldTakeScreenshotOnAll) {
        console.log(`📷 Debug screenshot captured for step ${this.parameters.stepIndex}: ${stepName}`);
      }
    }
  }
});

After({ timeout: 60000 }, async function (this: CustomWorld, scenario) {
  try {
    console.log(`🏁 Finishing scenario: "${scenario.pickle.name}" - Status: ${scenario.result?.status}`);
    
    // Store scenario name for step screenshots
    this.parameters.scenarioName = scenario.pickle.name;
    
    if (scenario.result?.status === 'FAILED') {
      console.log('📸 Taking failure screenshot...');
      const screenshotPath = await this.takeScreenshot(scenario.pickle.name);
      if (screenshotPath) {
        console.log(`💥 Test failed - screenshot captured for: ${scenario.pickle.name}`);
      }
    }
    
    console.log('🔒 Closing browser...');
    await this.closeBrowser();
    console.log('✅ Browser closed successfully');
  } catch (error) {
    ErrorLogger.logError('After Hook - Cleanup', error, {
      scenarioName: scenario.pickle.name,
      scenarioStatus: scenario.result?.status
    });
    
    // Still try to close browser even if screenshot fails
    try {
      if (this.browser) {
        await this.browser.close();
      }
    } catch (browserError: any) {
      console.error('Failed to close browser:', browserError?.message || 'Unknown error');
    }
  }
});
