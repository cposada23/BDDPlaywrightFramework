import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class BlankFactorHomePage extends BasePage {

  private readonly pageTitle: Locator;
  private readonly industriesSelect: Locator;


  constructor(page: Page) {
    super(page);
    this.pageTitle = this.page.locator('h1');
    this.industriesSelect = this.page.locator("//header//a/span[normalize-space(text()) = 'Industries']");
  }


  async navigateToHomePage(): Promise<void> {
    await this.navigateTo('/');
    await this.waitForPageLoad();
  }

  /**
   * Get the page title text
   * @returns The page title text
   */
  async getPageTitleText(): Promise<string> {
    return await this.getElementText(this.pageTitle);
  }

  async hoverOverIndustriesSelect(): Promise<void> {
    await this.industriesSelect.hover();
  }

  async openItemInSelect(item: string): Promise<void> {
    let locator = this.page.locator(`//*[contains(@class, "item__title") and text() = "${item}"]`);
    await this.waitForElement(locator);
    await locator.click();
  }

  async scrollDownUntilSection(section: string): Promise<void> {
    let locator = this.page.locator(`//*[contains(@class, "section-title") and text() = "${section}"]`);
    await this.waitForElement(locator);
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Verify page title contains expected text
   * @param expectedTitle - Expected title text
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await this.verifyElementContainsText(this.pageTitle, expectedTitle);
  }

}
