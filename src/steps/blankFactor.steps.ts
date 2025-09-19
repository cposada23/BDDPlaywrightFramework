import { Then, Given, When, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../config/world';
import { BlankFactorHomePage } from '@pages/BlankFactorHomePage';

// Set a higher default timeout for all steps (90 seconds)
setDefaultTimeout(90 * 1000);

// Enhanced error handler to provide detailed error information
function enhanceError(error: any, stepName: string, additionalContext?: string): Error {
  let errorMessage = `❌ Step Failed: "${stepName}"\n`;
  
  if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
    errorMessage += `🕐 Timeout Error: Operation timed out\n`;
    if (error.message?.includes('waiting for locator')) {
      errorMessage += `🎯 Issue: Element not found or not interactive\n`;
    }
  } else if (error.name === 'Error' && error.message?.includes('Element is not attached')) {
    errorMessage += `🔗 Stale Element Error: Element no longer exists in DOM\n`;
  } else if (error.message?.includes('not visible')) {
    errorMessage += `👁️  Visibility Error: Element is not visible\n`;
  } else if (error.message?.includes('not enabled')) {
    errorMessage += `🚫 Interaction Error: Element is disabled\n`;
  }
  
  errorMessage += `📋 Original Error: ${error.message}\n`;
  
  if (additionalContext) {
    errorMessage += `ℹ️  Context: ${additionalContext}\n`;
  }
  
  if (error.stack) {
    errorMessage += `📍 Stack Trace:\n${error.stack}`;
  }
  
  const enhancedError = new Error(errorMessage);
  enhancedError.name = error.name || 'StepExecutionError';
  return enhancedError;
}

// Reusable page object instance
let blankFactorHomePage: BlankFactorHomePage;

// Navigation Steps

Given('I navigate to Blankfactor home page', async function (this: CustomWorld) {
  try {
    console.log('🚀 Navigating to Blankfactor home page...');
    blankFactorHomePage = new BlankFactorHomePage(this.page);
    await blankFactorHomePage.navigateToHomePage();
    console.log('✅ Successfully navigated to home page');
  } catch (error) {
    throw enhanceError(error, 'Navigate to Blankfactor home page', 'Check if the base URL is correct and the site is accessible');
  }
});


Given('I hover over {string} and open the {string} section', async function (this: CustomWorld, hoverElement: string, openElement: string) {
  try {
    console.log(`🎯 Hovering over "${hoverElement}" and opening "${openElement}" section...`);
    switch (hoverElement) {
      case 'Industries':
        await blankFactorHomePage.hoverOverIndustriesSelect();
        break;
      default:
        throw new Error(`Unsupported hover element: ${hoverElement}`);
    }
    await blankFactorHomePage.openItemInSelect(openElement);
    console.log(`✅ Successfully opened "${openElement}" section`);
  } catch (error) {
    throw enhanceError(error, `Hover over "${hoverElement}" and open "${openElement}" section`, 
      `Check if the "${hoverElement}" element is visible and the "${openElement}" option exists`);
  }
});

When('I copy the text from the 3dht tile', async function (this: CustomWorld) {
  try {
    console.log('📋 Copying text from 3rd tile...');
    let text = await blankFactorHomePage.copyTextFromTile(3);
    console.log(`📄 Retrieved text: "${text.trim()}"`);
    let expectedText = "Automate your operations and get to market quickly and securely. Leverage predictive data analytics using machine learning to build reliable, yet forward-thinking financial solutions.";
    expect(text.trim()).toBe(expectedText);
    console.log('✅ Text matches expected value');
  } catch (error) {
    throw enhanceError(error, 'Copy text from 3rd tile', 
      'Check if the 3rd tile element exists and contains the expected text');
  }
});

When('I scroll to the bottom of the page and click on the Let\'s get started button', async function (this: CustomWorld) {
  try {
    console.log('⬇️ Scrolling to bottom of page...');
    await blankFactorHomePage.scrollToBottom();
    console.log('🖱️ Clicking "Let\'s get started" button...');
    await blankFactorHomePage.clickLetsGetStartedButton();
    console.log('✅ Successfully clicked "Let\'s get started" button');
  } catch (error) {
    throw enhanceError(error, 'Scroll to bottom and click Let\'s get started button', 
      'Check if the "Let\'s get started" button is visible and clickable after scrolling');
  }
});

Then('I verify that the page is loaded and the page url is {string}', async function (this: CustomWorld, url: string) {
  try {
    console.log('⏳ Waiting for page to load...');
    await blankFactorHomePage.waitForPageLoad();
    let currentURL = await blankFactorHomePage.getCurrentURL();
    console.log(`🔗 Current URL: ${currentURL}`);
    console.log(`🎯 Expected URL: ${url}`);
    expect(currentURL).toBe(url);
    console.log('✅ URL matches expected value');
  } catch (error) {
    throw enhanceError(error, `Verify page URL is "${url}"`, 
      `Check if navigation was successful and the current URL matches the expected URL`);
  }
});

Then('I verify the page title is {string}', async function (this: CustomWorld, title: string) {
  try {
    console.log('📋 Getting page title...');
    let pageTitle = await blankFactorHomePage.getPageTitle();
    console.log(`📄 Current title: "${pageTitle}"`);
    console.log(`🎯 Expected title: "${title}"`);
    expect(pageTitle).toBe(title);
    console.log('✅ Page title matches expected value');
  } catch (error) {
    throw enhanceError(error, `Verify page title is "${title}"`, 
      'Check if the page has loaded completely and the title is as expected');
  }
});