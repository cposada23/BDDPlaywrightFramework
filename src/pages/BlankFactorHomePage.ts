import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestHelpers } from '@utils/testHelpers';

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


  /**
   * Verify page title contains expected text
   * @param expectedTitle - Expected title text
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await this.verifyElementContainsText(this.pageTitle, expectedTitle);
  }

  async copyTextFromTile(tile: number): Promise<string> {
    let locator = this.page.locator(`(//*[contains(@class, 'flip-card-front')])[${tile}]`);
    await this.waitForElement(locator);
    await locator.scrollIntoViewIfNeeded();
    await locator.hover();

    let cardBack = this.page.locator("(//*[contains(@class, 'card-back')])[3]/div");
    await this.waitForElement(cardBack);

    const text = await this.getElementText(cardBack);
    return text;
  }

  async scrollToBottom(): Promise<void> {
    await TestHelpers.scrollToBottom(this.page);
  }

  async clickLetsGetStartedButton(): Promise<void> {
    await this.letsGetStartedButton.click();
  }

}
