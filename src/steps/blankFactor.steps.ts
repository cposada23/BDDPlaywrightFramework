import { Then, Given, When, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../config/world';
import { BlankFactorHomePage } from '@pages/BlankFactorHomePage';
import { enhanceError } from '@utils/testHelpers';

// Set a higher default timeout for all steps (90 seconds)
setDefaultTimeout(90 * 1000);

// Reusable page object instance
let blankFactorHomePage: BlankFactorHomePage;

// Navigation Steps

Given('I navigate to Blankfactor home page', async function (this: CustomWorld) {
  blankFactorHomePage = new BlankFactorHomePage(this.page);
  await blankFactorHomePage.navigateToHomePage();
});


Given('I hover over {string} and open the {string} section', async function (this: CustomWorld, hoverElement: string, openElement: string) {
  switch (hoverElement) {
    case 'Industries':
      await blankFactorHomePage.hoverOverIndustriesSelect();
      break;
    default:
      throw enhanceError(new Error(`Unsupported hover element: ${hoverElement}`), 'Hover over menu element', 'Only "Industries" is currently supported');
  }
  await blankFactorHomePage.openItemInSelect(openElement);
});

When('I copy the text from the 3dht tile', async function (this: CustomWorld) {
  let text = await blankFactorHomePage.copyTextFromTile(3);
  let expectedText = "Automate your operations and get to market quickly and securely. Leverage predictive data analytics using machine learning to build reliable, yet forward-thinking financial solutions.";
  
  try {
    expect(text.trim()).toBe(expectedText);
    console.log('✅ Text matches expected value');
  } catch (error) {
    throw enhanceError(error, 'Verify tile text matches expected content', 
      `Expected: "${expectedText}" but got: "${text.trim()}". Check if the text content has changed.`);
  }
});

When('I scroll to the bottom of the page and click on the Let\'s get started button', async function (this: CustomWorld) {
  await blankFactorHomePage.scrollToBottom();
  await blankFactorHomePage.clickLetsGetStartedButton();
});

Then('I verify that the page is loaded and the page url is {string}', async function (this: CustomWorld, url: string) {
  console.log('⏳ Waiting for page to load...');
  await blankFactorHomePage.waitForPageLoad();
  let currentURL = await blankFactorHomePage.getCurrentURL();
  console.log(`🔗 Current URL: ${currentURL}`);
  console.log(`🎯 Expected URL: ${url}`);
  
  try {
    expect(currentURL).toBe(url);
    console.log('✅ URL matches expected value');
  } catch (error) {
    throw enhanceError(error, `Verify page URL is "${url}"`, 
      `Expected URL: "${url}" but got: "${currentURL}". Check if navigation was successful.`);
  }
});

Then('I verify the page title is {string}', async function (this: CustomWorld, title: string) {
  console.log('📋 Getting page title...');
  let pageTitle = await blankFactorHomePage.getPageTitle();
  console.log(`📄 Current title: "${pageTitle}"`);
  console.log(`🎯 Expected title: "${title}"`);
  
  try {
    expect(pageTitle).toBe(title);
    console.log('✅ Page title matches expected value');
  } catch (error) {
    throw enhanceError(error, `Verify page title is "${title}"`, 
      `Expected title: "${title}" but got: "${pageTitle}". Check if the page has loaded completely and the title is as expected.`);
  }
});