import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestHelpers, enhanceError } from '@utils/testHelpers';

export class BlankFactorHomePage extends BasePage {

  private readonly pageTitle: Locator;
  private readonly industriesSelect: Locator;
  private readonly letsGetStartedButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.page.locator('h1');
    this.industriesSelect = this.page.locator("//header//a/span[normalize-space(text()) = 'Industries']");
    this.letsGetStartedButton = this.page.locator('//a[normalize-space(text()) = "Let\'s get started"]');
  }


  async navigateToHomePage(): Promise<void> {
    try {
      console.log('🚀 Navigating to Blankfactor home page...');
      await this.navigateTo('/');
      await this.waitForPageLoad();
      console.log('✅ Successfully navigated to home page');
    } catch (error) {
      throw enhanceError(
        error,
        'Navigate to Blankfactor home page',
        'Check if the base URL is correct and the site is accessible. Verify network connectivity and that the site is not down.'
      );
    }
  }

  /**
   * Get the page title text
   * @returns The page title text
   */
  async getPageTitleText(): Promise<string> {
    return await this.getElementText(this.pageTitle);
  }

  async hoverOverIndustriesSelect(): Promise<void> {
    try {
      console.log('🎯 Hovering over Industries menu...');
      await this.waitForElement(this.industriesSelect);
      await this.industriesSelect.hover();
      console.log('✅ Successfully hovered over Industries menu');
    } catch (error) {
      throw enhanceError(
        error,
        'Hover over Industries menu',
        'Check if the Industries menu element is visible in the header and not blocked by other elements'
      );
    }
  }

  async openItemInSelect(item: string): Promise<void> {
    try {
      console.log(`🎯 Clicking on "${item}" menu item...`);
      let locator = this.page.locator(`//*[contains(@class, "item__title") and text() = "${item}"]`);
      await this.waitForElement(locator);
      await locator.click();
      console.log(`✅ Successfully clicked on "${item}" menu item`);
    } catch (error) {
      throw enhanceError(
        error,
        `Open "${item}" menu item`,
        `Check if the "${item}" option appears in the dropdown menu after hovering over Industries. Verify the text matches exactly.`
      );
    }
  }

  /**
   * Verify page title contains expected text
   * @param expectedTitle - Expected title text
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await this.verifyElementContainsText(this.pageTitle, expectedTitle);
  }

  async copyTextFromTile(tile: number): Promise<string> {
    try {
      console.log(`📋 Copying text from tile ${tile}...`);
      let locator = this.page.locator(`(//*[contains(@class, 'flip-card-front')])[${tile}]`);
      await this.waitForElement(locator);
      await locator.scrollIntoViewIfNeeded();
      await locator.hover();

      let cardBack = this.page.locator("(//*[contains(@class, 'card-back')])[3]/div");
      await this.waitForElement(cardBack);

      const text = await this.getElementText(cardBack);
      console.log(`📄 Retrieved text from tile ${tile}: "${text.trim()}"`);
      return text;
    } catch (error) {
      throw enhanceError(
        error,
        `Copy text from tile ${tile}`,
        `Check if the tile ${tile} element exists on the page and that the flip animation works correctly on hover`
      );
    }
  }

  async scrollToBottom(): Promise<void> {
    try {
      console.log('⬇️ Scrolling to bottom of page...');
      await TestHelpers.scrollToBottom(this.page);
      console.log('✅ Successfully scrolled to bottom');
    } catch (error) {
      throw enhanceError(
        error,
        'Scroll to bottom of page',
        'Check if the page allows scrolling and that the scroll operation completes successfully'
      );
    }
  }

  async clickLetsGetStartedButton(): Promise<void> {
    try {
      console.log('🖱️ Clicking "Let\'s get started" button...');
      await this.waitForElement(this.letsGetStartedButton);
      await this.letsGetStartedButton.click();
      console.log('✅ Successfully clicked "Let\'s get started" button');
    } catch (error) {
      throw enhanceError(
        error,
        'Click "Let\'s get started" button',
        'Check if the "Let\'s get started" button is visible and clickable after scrolling to the bottom of the page'
      );
    }
  }

}
