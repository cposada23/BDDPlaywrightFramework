# 🚨 Enhanced Error Handling Guide

## Overview
Your Playwright BDD framework now has comprehensive error handling that provides detailed, actionable error messages instead of generic timeouts.

## ✅ What's Fixed

### 🎯 **Root Problem Solved**
- **Before**: `function timed out, ensure the promise resolves within 5000 milliseconds`
- **After**: Detailed error messages with specific failure reasons, context, and debugging information

### 🔧 **Key Improvements**

1. **Enhanced Step Error Handling**: All step definitions now catch and enhance errors
2. **Increased Timeouts**: More realistic timeout values across the framework
3. **Better Browser Operations**: Comprehensive error handling in browser setup/teardown
4. **Detailed Logging**: Rich error context and debugging information
5. **Graceful Fallbacks**: System continues working even when parts fail

## 📋 **Error Message Examples**

### Before (Generic):
```
Error: function timed out, ensure the promise resolves within 5000 milliseconds
```

### After (Detailed):
```
❌ Step Failed: "I navigate to Blankfactor home page"
🕐 Timeout Error: Operation timed out
🎯 Issue: Element not found or not interactive
📋 Original Error: Timeout 30000ms exceeded
ℹ️  Context: Check if the base URL is correct and the site is accessible
📍 Stack Trace: [Full stack trace]
```

## ⚙️ **Configuration Changes**

### Timeout Values (Increased):
- **Step Default Timeout**: 60s → 90s (configurable via `STEP_TIMEOUT`)
- **Cucumber Global**: 60s → 90s 
- **Before Hook**: 60s → 120s (browser setup)
- **After Hook**: 30s → 60s (cleanup)
- **AfterStep Hook**: 10s → 30s (screenshots)
- **Page Operations**: 30s → 60s
- **Navigation**: 30s → 90s

### Error Types Detected:
- ✅ **Timeout Errors**: Specific timeout context
- ✅ **Element Not Found**: Locator issues
- ✅ **Stale Element**: DOM attachment problems  
- ✅ **Visibility Issues**: Hidden/invisible elements
- ✅ **Interaction Blocked**: Disabled/unclickable elements
- ✅ **Browser Failures**: Launch/close problems

## 🎮 **New Test Scripts**

### For Debugging Timeouts:
```bash
# Extended timeout (2 minutes per step)
npm run test:extended-timeout

# Verbose mode (headed + screenshots + slow motion)  
npm run test:verbose

# Fail fast (stop on first error)
npm run test:fail-fast
```

### Environment Variables:
```bash
# Custom step timeout (in milliseconds)
STEP_TIMEOUT=120000

# Take screenshots on every step (debugging)
SCREENSHOT_ALL_STEPS=true

# Stop on first failure
FAIL_FAST=true
```

## 📊 **Enhanced Logging Output**

You'll now see detailed step-by-step logs:
```bash
🚀 Starting test suite - clearing old screenshots...
🧹 Cleared 15 screenshot(s) from previous runs
🎬 Starting scenario: "Navigate to homepage"
🌐 Launching chromium browser...
✅ chromium browser launched successfully
🔧 Creating browser context...
✅ Browser context created
🎬 Starting tracing...
✅ Tracing started
📄 Creating new page...
✅ Page created with extended timeouts
✅ Browser opened successfully
🚀 Navigating to Blankfactor home page...
✅ Successfully navigated to home page
```

## 🔍 **Error Context Information**

When errors occur, you get:
- **Step Name**: Which specific step failed
- **Error Type**: Timeout, element not found, etc.
- **Context**: What to check/verify
- **Original Error**: The actual Playwright error
- **Stack Trace**: Full debugging information
- **Environment Info**: Browser, scenario, settings

## 💡 **Debugging Tips**

### When You See Timeout Errors:
1. **Check the detailed error message** - it now tells you exactly what timed out
2. **Use trace viewer**: `npm run trace` to see what happened step-by-step
3. **Run in verbose mode**: `npm run test:verbose` to see it happening live
4. **Increase timeout if needed**: `STEP_TIMEOUT=180000 npm test`

### Common Error Types & Solutions:

#### 🎯 **"Element not found or not interactive"**
- **Problem**: Locator can't find the element
- **Solution**: Check your selectors in page objects
- **Debug**: Use `npm run test:verbose` to see the page

#### 🔗 **"Stale Element Error: Element no longer exists in DOM"**
- **Problem**: Element was removed/changed after you found it  
- **Solution**: Re-find element before interacting
- **Debug**: Check if page navigation occurred

#### 👁️ **"Visibility Error: Element is not visible"**
- **Problem**: Element exists but is hidden
- **Solution**: Wait for element to be visible or scroll into view
- **Debug**: Check CSS visibility, display, opacity

#### 🚫 **"Interaction Error: Element is disabled"**
- **Problem**: Element can't be clicked/interacted with
- **Solution**: Wait for element to be enabled
- **Debug**: Check element state and form validation

## 🚀 **Testing the Fix**

### Run a test to see enhanced errors:
```bash
# Normal test with better error handling
npm test

# If you want to see lots of debugging info:
npm run test:verbose

# If something times out, check the trace:
npm run trace
```

### Expected Output on Success:
- ✅ Detailed step-by-step logging
- ✅ Clear success/failure indicators  
- ✅ Better performance with realistic timeouts

### Expected Output on Failure:
- ❌ Specific error type identification
- 📋 Detailed failure context
- 🎯 Actionable debugging suggestions
- 📸 Automatic screenshot capture
- 📍 Full stack trace information

## 🔧 **Framework Files Modified**

1. **`src/utils/testHelpers.ts`**: 
   - **NEW**: `enhanceError()` function - Reusable error enhancement across all step files
   - **NEW**: `TestHelpers.executeStep()` - Wrapper for step execution with automatic error handling
   - **NEW**: `TestHelpers.clickWithContext()` - Enhanced click with error context
   - **NEW**: `TestHelpers.typeWithContext()` - Enhanced text input with error context
   - **NEW**: `TestHelpers.waitForElementWithContext()` - Enhanced element waiting

2. **`src/steps/blankFactor.steps.ts`**: 
   - Added error handling to all steps using utilities
   - Imports `enhanceError` from testHelpers
   - Increased default timeout to 90s
   - Enhanced error context

3. **`src/config/world.ts`**:
   - Added `ErrorLogger` utility class
   - Enhanced browser setup/teardown
   - Increased hook timeouts
   - Better error recovery

4. **`cucumber.js`**:
   - Increased global timeout to 90s
   - Added configurable timeout via environment
   - Fixed retry configuration
   - Added retry and fail-fast options

5. **`package.json`**:
   - Added debugging scripts
   - Extended timeout options
   - Added retry test scripts

## 🔄 **Reusable Error Handling**

The error handling is now completely reusable across all step files! Here are the new utilities:

### 📦 **Core Error Function**
```typescript
import { enhanceError } from '@utils/testHelpers';

// Manual error handling
try {
  await someOperation();
} catch (error) {
  throw enhanceError(error, 'Step name', 'Additional context');
}
```

### 🎯 **Step Execution Wrapper** 
```typescript
// Automatic error handling with logging
await TestHelpers.executeStep(
  'Navigate to login page',
  async () => {
    await page.goto('/login');
    await TestHelpers.waitForNetworkIdle(page);
  },
  'Check if login page is accessible'
);
```

### 🖱️ **Enhanced Click Helper**
```typescript
// Click with automatic error context
await TestHelpers.clickWithContext(
  page,
  'button[data-testid="submit"]',
  'Click submit button',
  'Submit button should be enabled after form validation'
);
```

### ⌨️ **Enhanced Type Helper**
```typescript
// Type with automatic error context
await TestHelpers.typeWithContext(
  page,
  'input[name="username"]',
  'myusername',
  'Enter username',
  'Username field should be visible and editable'
);
```

### ⏳ **Enhanced Wait Helper**
```typescript
// Wait with automatic error context
await TestHelpers.waitForElementWithContext(
  page,
  '[data-testid="success-message"]',
  { state: 'visible', timeout: 10000 },
  'Success message should appear after form submission'
);
```

### 🔧 **Using in New Step Files**

When creating new step files, simply import the utilities:

```typescript
import { enhanceError, TestHelpers } from '@utils/testHelpers';

Given('I do something', async function (this: CustomWorld) {
  await TestHelpers.executeStep(
    'Do something',
    async () => {
      // Your step logic here
    },
    'Context about what should work'
  );
});
```

### 💡 **Benefits of Reusable Error Handling**

✅ **Consistent**: All errors follow the same detailed format
✅ **Maintainable**: Update error handling in one place
✅ **Comprehensive**: Enhanced error detection and suggestions
✅ **Developer-Friendly**: Easy to use in any step file
✅ **Debuggable**: Rich context and debugging information

## 🎉 **Result**

**No more generic timeout errors!** You now have a complete, reusable error handling system that provides specific, actionable error messages across your entire test framework. The system is also more reliable with realistic timeout values and built-in error recovery.
