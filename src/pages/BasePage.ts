import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;
  protected baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env.BASE_URL || 'https://example.com';
  }

  /**
   * Navigate to a specific path
   * @param path - The path to navigate to
   */
  async navigateTo(path: string = ''): Promise<void> {
    const url = path ? `${this.baseURL}${path}` : this.baseURL;
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  /**
   * Wait for element to be visible
   * @param locator - The element locator
   * @param timeout - Optional timeout in milliseconds
   */
  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Click on an element with retry mechanism
   * @param locator - The element locator
   * @param options - Click options
   */
  async clickElement(locator: Locator, options?: Parameters<Locator['click']>[0]): Promise<void> {
    await this.waitForElement(locator);
    await locator.click(options);
  }

  /**
   * Fill input field with text
   * @param locator - The input element locator
   * @param text - Text to fill
   */
  async fillInput(locator: Locator, text: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.clear();
    await locator.fill(text);
  }

  /**
   * Get text content from an element
   * @param locator - The element locator
   * @returns The text content
   */
  async getElementText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    const text = await locator.textContent();
    return text || '';
  }

  /**
   * Check if element is visible
   * @param locator - The element locator
   * @returns Boolean indicating visibility
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for page load to complete
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot of the current page
   * @param name - Screenshot name
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `./reports/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }

  /**
   * Verify element contains expected text
   * @param locator - The element locator
   * @param expectedText - Expected text content
   */
  async verifyElementContainsText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toContainText(expectedText);
  }

  /**
   * Verify element is visible
   * @param locator - The element locator
   */
  async verifyElementIsVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /**
   * Get current page title
   * @returns Page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current page URL
   * @returns Current URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }
}
