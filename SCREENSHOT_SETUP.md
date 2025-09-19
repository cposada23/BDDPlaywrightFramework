# 📸 Screenshot Configuration Guide

## Overview
This Playwright BDD framework now has enhanced screenshot functionality that automatically captures and attaches screenshots to various reports, particularly when tests fail.

## Screenshot Features

### ✅ What's Working Now

1. **Automatic Screenshot Cleanup**: Old screenshots are automatically cleared before each test run to avoid confusion
2. **Automatic Screenshot on Test Failure**: Screenshots are automatically captured when any test scenario fails
3. **Automatic Screenshot on Step Failure**: Screenshots are captured when individual steps fail  
4. **Step-Level Allure Integration**: Screenshots are now attached to specific steps in Allure reports, not just the overall test
5. **Debug Mode**: Optionally capture screenshots on every step for debugging
6. **Consistent Naming**: Screenshots use clean, consistent naming that matches with test scenarios
7. **Step Tracking**: Each screenshot is linked to its specific step number for easy identification

### 📁 Screenshot Storage
- All screenshots are saved to: `./reports/screenshots/`
- Naming pattern: `{scenario-name}-{timestamp}.png` for scenario failures
- Naming pattern: `{scenario-name}-{step-name}-{timestamp}.png` for step failures

## How to Use

### 1. Default Behavior (Screenshots on Failures Only)
```bash
npm test
```
- Screenshots will only be taken when tests or steps fail
- Screenshots will be attached to Allure reports automatically

### 2. Debug Mode (Screenshots on Every Step)
```bash
npm run test:screenshot-all
```
- Takes screenshots after every step (passed or failed)
- Useful for debugging test flows
- ⚠️ **Warning**: This generates many screenshots - use only for debugging

### 3. Manual Screenshots in Step Definitions
```typescript
// In your step definitions
await this.takeScreenshot('custom-screenshot-name');
```

## Report Integration

### Allure Reports
1. Run your tests: `npm test`
2. Generate Allure report: `npm run report`
3. Screenshots will appear as attachments in the specific failed steps (not just at the test level)
4. Each step that fails will have its screenshot attached directly to that step
5. In debug mode, all steps will have screenshots attached

### HTML Reports  
- Screenshots are saved but not automatically embedded
- You can manually reference them from `./reports/screenshots/`

## Configuration

### Environment Variables
- `SCREENSHOT_ALL_STEPS=true`: Capture screenshots on every step (for debugging)
- `BASE_URL`: Set the base URL for your application
- `BROWSER`: Choose browser (chromium, firefox, webkit)

### Customization
You can customize screenshot behavior in `src/config/world.ts`:

```typescript
// Modify screenshot options
await this.page.screenshot({
  path: screenshotPath,
  fullPage: true,          // Capture full page
  clip: undefined,         // Or clip to specific area
  quality: 80,            // JPEG quality (if using .jpg)
});
```

## Troubleshooting

### Screenshots Not Appearing in Allure Reports?
1. Ensure tests are actually failing (screenshots only attach to failed steps by default)
2. Check that `./reports/screenshots/` directory contains screenshots
3. Run `npm run generate:allure` to regenerate Allure data with screenshot attachments
4. Check console output for screenshot attachment messages:
   - `📎 Attached screenshot to step X: [step name]`
   - `🔍 Step X failed - screenshot captured: [step name]`
5. Screenshots are now attached to individual steps, not the overall test

### Screenshot File Naming Issues?
- The framework automatically cleans test names to create valid filenames
- Special characters are converted to hyphens
- Multiple consecutive hyphens are collapsed to single hyphens

### Too Many Screenshots?
- Turn off `SCREENSHOT_ALL_STEPS` environment variable
- Screenshots on failures only is the default behavior

### Old Screenshots Not Clearing?
- Screenshots are automatically cleared before each test suite run
- Check console output for: `🧹 Cleared X screenshot(s) from previous runs`
- If cleanup doesn't work, manually delete files from `./reports/screenshots/`

## File Structure
```
reports/
├── screenshots/           # All screenshot files
├── allure-results/       # Allure data with screenshot attachments  
├── allure-report/        # Generated Allure HTML report
├── cucumber-report.html  # Cucumber HTML report
└── cucumber-report.json  # Cucumber JSON report
```

## Implementation Details

### Key Files Modified
- `src/config/world.ts`: Screenshot capture logic, cleanup, and Cucumber hooks
- `scripts/generateAllureResults.js`: Step-level screenshot attachment to Allure reports
- `package.json`: Added debug screenshot script

### Screenshot Hooks
- `BeforeAll`: Clears old screenshots before test suite starts
- `Before`: Sets up scenario context and resets step counter
- `AfterStep`: Captures screenshots on step failures (and optionally all steps), tracks step numbers
- `After`: Captures screenshots on scenario failures (fallback)

### Console Output Messages
- `🚀 Starting test suite - clearing old screenshots...`
- `🧹 Cleared X screenshot(s) from previous runs`
- `📸 Step screenshot saved: [path] (Step X: [step name])`
- `🔍 Step X failed - screenshot captured: [step name]`
- `📎 Attached screenshot to step X: [step name]`

## Next Steps
- Consider integrating screenshots with other report formats (HTML, JUnit)
- Add video recording on failures alongside screenshots  
- Implement screenshot comparison for visual regression testing
