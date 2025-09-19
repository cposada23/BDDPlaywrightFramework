# 🎯 Page Object Error Handling Pattern

## Overview
Error handling has been moved from step definitions to page object methods, creating a more maintainable and reusable architecture.

## ✅ **Architectural Benefits**

### 🔄 **Reusability**
- Multiple step files can use the same page object methods
- All get consistent error handling automatically
- No need to duplicate error handling logic

### 🧹 **Clean Separation of Concerns**
- **Step Definitions**: Focus on business logic and test flow
- **Page Objects**: Handle UI interactions AND their error states
- **Test Helpers**: Provide reusable error enhancement utilities

### 🛠️ **Maintainability** 
- Error handling for UI operations centralized in page objects
- Update error context in one place for all tests using that page
- Consistent error messages across different test scenarios

## 📋 **Implementation Pattern**

### **Page Object Method Structure**
```typescript
// In BlankFactorHomePage.ts
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
```

### **Step Definition Structure**
```typescript
// In blankFactor.steps.ts
Given('I navigate to Blankfactor home page', async function (this: CustomWorld) {
  blankFactorHomePage = new BlankFactorHomePage(this.page);
  await blankFactorHomePage.navigateToHomePage(); // Error handling is in page object
});
```

## 🔧 **When to Keep Error Handling in Steps**

Only keep error handling in step definitions for:

### ✅ **Business Logic Assertions**
```typescript
When('I copy the text from the 3dht tile', async function (this: CustomWorld) {
  let text = await blankFactorHomePage.copyTextFromTile(3); // Page object handles UI errors
  let expectedText = "Expected content...";
  
  try {
    expect(text.trim()).toBe(expectedText);
    console.log('✅ Text matches expected value');
  } catch (error) {
    // Step handles business logic assertion errors
    throw enhanceError(error, 'Verify tile text matches expected content', 
      `Expected: "${expectedText}" but got: "${text.trim()}". Check if content has changed.`);
  }
});
```

### ✅ **Step-Specific Logic**
```typescript
Given('I hover over {string} and open the {string} section', async function (this: CustomWorld, hoverElement: string, openElement: string) {
  switch (hoverElement) {
    case 'Industries':
      await blankFactorHomePage.hoverOverIndustriesSelect(); // Page object handles hover errors
      break;
    default:
      // Step handles unsupported parameter errors
      throw enhanceError(new Error(`Unsupported hover element: ${hoverElement}`), 
        'Hover over menu element', 'Only "Industries" is currently supported');
  }
  await blankFactorHomePage.openItemInSelect(openElement); // Page object handles click errors
});
```

## 🎯 **Error Context Examples**

### **Page Object Error Context** (UI-focused)
```typescript
// Specific to UI element and interaction
throw enhanceError(
  error,
  'Click "Let\'s get started" button',
  'Check if the "Let\'s get started" button is visible and clickable after scrolling to the bottom of the page'
);
```

### **Step Definition Error Context** (Business-focused)
```typescript
// Specific to business expectation
throw enhanceError(error, 
  `Verify page URL is "${url}"`, 
  `Expected URL: "${url}" but got: "${currentURL}". Check if navigation was successful.`
);
```

## 🏗️ **Creating New Page Objects**

When creating new page objects, follow this pattern:

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { enhanceError } from '@utils/testHelpers';

export class NewPageObject extends BasePage {
  private readonly someElement: Locator;

  constructor(page: Page) {
    super(page);
    this.someElement = this.page.locator('#some-element');
  }

  async performSomeAction(): Promise<void> {
    try {
      console.log('🎯 Performing some action...');
      await this.waitForElement(this.someElement);
      await this.someElement.click();
      console.log('✅ Action completed successfully');
    } catch (error) {
      throw enhanceError(
        error,
        'Perform some action',
        'Check if the element is visible and interactable. Verify page state is correct.'
      );
    }
  }
}
```

## 🧪 **Testing Pattern**

### **Step Definition Tests Focus On:**
- ✅ Business logic flow
- ✅ Data validation  
- ✅ Assertion verification
- ✅ Test scenario orchestration

### **Page Object Methods Handle:**
- ✅ UI element interactions
- ✅ Element waiting and visibility
- ✅ Browser action errors
- ✅ DOM-related failures

## 📊 **Error Output Examples**

### **UI Interaction Error (from Page Object):**
```
❌ Step Failed: "Click Let's get started button"
🖱️  Click Error: Element is not clickable or is being covered
📋 Original Error: Element is not clickable at point (500, 300)
ℹ️  Context: Check if the "Let's get started" button is visible and clickable after scrolling to the bottom of the page
💡 Suggestions:
   • Check if element is hidden by CSS
   • Scroll element into view
   • Wait for animations to complete
📍 Stack Trace: [Full stack trace]
```

### **Business Logic Error (from Step Definition):**
```
❌ Step Failed: "Verify tile text matches expected content"
❗ Assertion Error: Expected condition was not met
📋 Original Error: Expected "New content" but received "Old content"  
ℹ️  Context: Expected: "New content" but got: "Old content". Check if the text content has changed.
📍 Stack Trace: [Full stack trace]
```

## 🎉 **Result**

You now have a clean, maintainable architecture where:
- **Page objects** handle UI interaction errors with specific UI context
- **Step definitions** handle business logic errors with specific business context  
- **Error handling is reusable** across multiple step files using the same page objects
- **Debugging is easier** with context-specific error messages for both UI and business concerns
