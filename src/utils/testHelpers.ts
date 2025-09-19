import { Page } from 'playwright';

/**
 * Enhanced error handler to provide detailed error information for step failures
 */
export function enhanceError(error: any, stepName: string, additionalContext?: string): Error {
  let errorMessage = `❌ Step Failed: "${stepName}"\n`;
  
  // Categorize different types of errors
  if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
    errorMessage += `🕐 Timeout Error: Operation timed out\n`;
    if (error.message?.includes('waiting for locator')) {
      errorMessage += `🎯 Issue: Element not found or not interactive\n`;
    } else if (error.message?.includes('navigation')) {
      errorMessage += `🌐 Issue: Page navigation timed out\n`;
    } else if (error.message?.includes('waiting for selector')) {
      errorMessage += `🔍 Issue: Selector not found within timeout period\n`;
    }
  } else if (error.name === 'Error' && error.message?.includes('Element is not attached')) {
    errorMessage += `🔗 Stale Element Error: Element no longer exists in DOM\n`;
  } else if (error.message?.includes('not visible')) {
    errorMessage += `👁️  Visibility Error: Element is not visible\n`;
  } else if (error.message?.includes('not enabled') || error.message?.includes('disabled')) {
    errorMessage += `🚫 Interaction Error: Element is disabled\n`;
  } else if (error.message?.includes('not clickable') || error.message?.includes('intercepted')) {
    errorMessage += `🖱️  Click Error: Element is not clickable or is being covered\n`;
  } else if (error.message?.includes('Navigation')) {
    errorMessage += `🌐 Navigation Error: Failed to navigate to page\n`;
  } else if (error.name === 'AssertionError' || error.message?.includes('expect')) {
    errorMessage += `❗ Assertion Error: Expected condition was not met\n`;
  } else {
    errorMessage += `⚠️  Unknown Error: ${error.name || 'UnknownError'}\n`;
  }
  
  errorMessage += `📋 Original Error: ${error.message}\n`;
  
  if (additionalContext) {
    errorMessage += `ℹ️  Context: ${additionalContext}\n`;
  }
  
  // Add debugging suggestions based on error type
  if (error.message?.includes('timeout')) {
    errorMessage += `💡 Suggestions:\n`;
    errorMessage += `   • Increase timeout if operation needs more time\n`;
    errorMessage += `   • Check if element selector is correct\n`;
    errorMessage += `   • Verify page is fully loaded\n`;
  } else if (error.message?.includes('not visible')) {
    errorMessage += `💡 Suggestions:\n`;
    errorMessage += `   • Check if element is hidden by CSS\n`;
    errorMessage += `   • Scroll element into view\n`;
    errorMessage += `   • Wait for animations to complete\n`;
  }
  
  if (error.stack) {
    errorMessage += `📍 Stack Trace:\n${error.stack}`;
  }
  
  const enhancedError = new Error(errorMessage);
  enhancedError.name = error.name || 'StepExecutionError';
  return enhancedError;
}

export class TestHelpers {
  /**
   * Wait for network to be idle
   */
  static async waitForNetworkIdle(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  /**
   * Scroll element into view
   */
  static async scrollToElement(page: Page, selector: string): Promise<void> {
    await page.locator(selector).scrollIntoViewIfNeeded();
  }

  /** 
   * Scroll to bottom of the page 
   */
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

  /**
   * Enhanced step execution wrapper with error handling
   */
  static async executeStep<T>(
    stepName: string,
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      console.log(`🎯 Executing: ${stepName}...`);
      const result = await operation();
      console.log(`✅ Success: ${stepName}`);
      return result;
    } catch (error) {
      throw enhanceError(error, stepName, context);
    }
  }

  /**
   * Wait with enhanced error context
   */
  static async waitForElementWithContext(
    page: Page, 
    selector: string, 
    options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' | 'detached' },
    context?: string
  ): Promise<void> {
    try {
      await page.locator(selector).waitFor(options || { state: 'visible' });
    } catch (error) {
      const enhancedContext = context || `Waiting for element: ${selector}`;
      throw enhanceError(error, 'Wait for element', enhancedContext);
    }
  }

  /**
   * Click with enhanced error context
   */
  static async clickWithContext(
    page: Page, 
    selector: string, 
    stepName: string,
    context?: string
  ): Promise<void> {
    try {
      await this.waitForElementWithContext(page, selector, { state: 'visible' }, context);
      await this.waitForElementStable(page, selector);
      await page.locator(selector).click();
    } catch (error) {
      throw enhanceError(error, stepName, context || `Clicking element: ${selector}`);
    }
  }

  /**
   * Type text with enhanced error context
   */
  static async typeWithContext(
    page: Page, 
    selector: string, 
    text: string,
    stepName: string,
    context?: string
  ): Promise<void> {
    try {
      await this.waitForElementWithContext(page, selector, { state: 'visible' }, context);
      await page.locator(selector).fill(text);
    } catch (error) {
      throw enhanceError(error, stepName, context || `Typing into element: ${selector}`);
    }
  }
}
