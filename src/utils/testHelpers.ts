import { Page } from 'playwright';

export class TestHelpers {
  /**
   * Wait for network to be idle (no requests for specified time)
   */
  static async waitForNetworkIdle(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  /**
   * Generate random test data
   */
  static generateTestData() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    
    return {
      email: `test.${random}.${timestamp}@example.com`,
      username: `user_${random}_${timestamp}`,
      password: `TestPass${timestamp}!`,
      firstName: `TestFirst${random}`,
      lastName: `TestLast${random}`,
      phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      randomString: random,
      timestamp
    };
  }

  /**
   * Scroll element into view
   */
  static async scrollToElement(page: Page, selector: string): Promise<void> {
    await page.locator(selector).scrollIntoViewIfNeeded();
  }

  /** Scroll to bottom of the page */
  static async scrollToBottom(page: Page): Promise<void> {
    await page.keyboard.press('End');
    await page.waitForTimeout(1000);
  }
  /**
   * Wait for element to be stable (not moving)
   */
  static async waitForElementStable(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible' });
    
    // Wait for element to stop moving
    let previousBox = await element.boundingBox();
    await page.waitForTimeout(100);
    let currentBox = await element.boundingBox();
    
    let attempts = 0;
    while (attempts < 10 && 
           previousBox && currentBox && 
           (previousBox.x !== currentBox.x || previousBox.y !== currentBox.y)) {
      previousBox = currentBox;
      await page.waitForTimeout(100);
      currentBox = await element.boundingBox();
      attempts++;
    }
  }

  /**
   * Safely click element with retry
   */
  static async safeClick(page: Page, selector: string, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        const element = page.locator(selector);
        await element.waitFor({ state: 'visible' });
        await this.waitForElementStable(page, selector);
        await element.click();
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Get element text with fallback
   */
  static async getTextSafely(page: Page, selector: string): Promise<string> {
    try {
      const element = page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 5000 });
      return await element.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Check if element exists without throwing error
   */
  static async elementExists(page: Page, selector: string): Promise<boolean> {
    try {
      await page.locator(selector).waitFor({ state: 'attached', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Take screenshot with timestamp
   */
  static async takeScreenshot(page: Page, name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const path = `./reports/screenshots/${filename}`;
    
    await page.screenshot({ 
      path, 
      fullPage: true,
      type: 'png'
    });
    
    return path;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format duration for reports
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
