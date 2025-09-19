import { Then, Given, When} from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../config/world';
import { BlankFactorHomePage } from '@pages/BlankFactorHomePage';

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
  }
  await blankFactorHomePage.openItemInSelect(openElement);
});

When('I scroll down until the section {string}', async function (this: CustomWorld, section: string) {
  await blankFactorHomePage.scrollDownUntilSection(section);
});

Then('I should be on the correct URL', async function (this: CustomWorld) {
  // Reuse the existing page object instance
  const currentURL = await blankFactorHomePage.getCurrentURL();
  expect(currentURL).toBe('https://blankfactor.com/industries/retirement-and-wealth/');
});
