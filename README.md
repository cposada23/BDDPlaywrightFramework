# Playwright BDD Framework

A comprehensive BDD (Behavior-Driven Development) testing framework using Playwright, Cucumber, and TypeScript with best practices.

## 🚀 Features

- **BDD Testing**: Cucumber integration for behavior-driven development
- **Cross-browser Testing**: Chrome, Firefox, Safari, and mobile browsers
- **TypeScript**: Full TypeScript support with strict type checking
- **Page Object Model**: Organized and maintainable page object structure
- **Test Fixtures**: Reusable test data and configuration
- **Rich Reporting**: HTML, JSON, JUnit, and Allure reports
- **Screenshots & Videos**: Automatic capture on test failures
- **Parallel Execution**: Run tests in parallel for faster execution
- **CI/CD Ready**: Configured for continuous integration

## 📁 Project Structure

```
playwright-bdd-framework/
├── src/
│   ├── pages/              # Page Object Model classes
│   │   ├── BasePage.ts     # Base page with common methods
│   │   └── ExamplePage.ts  # Example page implementation
│   ├── steps/              # Cucumber step definitions
│   │   ├── common.steps.ts # Common step definitions
│   │   └── example.steps.ts# Example-specific steps
│   ├── fixtures/           # Test data and fixtures
│   │   └── testFixtures.ts # Test data management
│   ├── utils/              # Utility functions
│   │   └── reportingUtils.ts# Reporting utilities
│   ├── config/             # Configuration files
│   │   └── world.ts        # Cucumber world configuration
│   └── types/              # TypeScript type definitions
│       └── index.ts        # Common type definitions
├── features/               # Cucumber feature files
│   ├── example.feature     # Basic example tests
│   └── advanced-example.feature # Advanced test scenarios
├── reports/                # Test reports and artifacts
│   ├── html-report/        # HTML test reports
│   ├── allure-results/     # Allure test results
│   ├── screenshots/        # Test screenshots
│   └── videos/             # Test recordings
├── cucumber.js             # Cucumber configuration
├── playwright.config.ts    # Playwright configuration
└── tsconfig.json          # TypeScript configuration
```

## 🛠️ Installation

1. **Clone the repository** (or use the existing project):
   ```bash
   cd /path/to/your/project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Playwright browsers**:
   ```bash
   npm run install:browsers
   ```

4. **Copy environment configuration**:
   ```bash
   cp env.example .env
   ```

## 🏃‍♂️ Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in Chrome only
npm run test:chrome

# Run tests in Firefox only
npm run test:firefox

# Run tests in Safari/WebKit only
npm run test:webkit

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests in parallel
npm run test:parallel

# Debug tests (with Playwright Inspector)
npm run test:debug
```

### Running Specific Tests

```bash
# Run tests with specific tags
npx cucumber-js --tags "@smoke"
npx cucumber-js --tags "@ui and @basic-navigation"

# Run a specific feature file
npx cucumber-js features/example.feature

# Run tests in parallel with custom thread count
PARALLEL=4 npm test
```

### Environment Variables

Set these environment variables to customize test execution:

```bash
# Browser selection
BROWSER=chrome|firefox|webkit

# Display mode
HEADED=true|false

# Slow motion (milliseconds)
SLOW_MO=1000

# Base URL for testing
BASE_URL=https://your-app.com

# Enable debugging
PWDEBUG=1
```

## 📊 Reporting

The framework generates multiple types of reports:

### View Reports

```bash
# Generate and view Allure report
npm run report

# Generate Allure report without opening
npm run report:generate

# View HTML report (generated automatically after test run)
open reports/html-report/index.html
```

### Report Types

1. **HTML Report**: `reports/html-report/index.html`
2. **JSON Report**: `reports/test-results.json`
3. **JUnit Report**: `reports/junit.xml`
4. **Allure Report**: `reports/allure-results/` (requires `npm run report`)
