// Load environment variables from .env file
require('dotenv').config();

// Set allure results directory
process.env.ALLURE_RESULTS_DIR = process.env.ALLURE_RESULTS_DIR || 'reports/allure-results';

// Calculate retry configuration
const retryCount = process.env.RETRY ? parseInt(process.env.RETRY) : 0;

const common = {
  requireModule: ['ts-node/register', 'tsconfig-paths/register'],
  require: [
    'src/steps/**/*.ts',
    'src/config/world.ts'
  ],
  format: [
    'progress-bar',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
    '@cucumber/pretty-formatter'
  ],
  formatOptions: {
    theme: 'bootstrap'
  },
  parallel: process.env.PARALLEL ? parseInt(process.env.PARALLEL) : 1,
  retry: retryCount,
  timeout: process.env.STEP_TIMEOUT ? parseInt(process.env.STEP_TIMEOUT) : 90000, // Increased from 60s to 90s
  // Only add retryTagFilter if retries are enabled
  ...(retryCount > 0 && { retryTagFilter: '@flaky' }),
  failFast: process.env.FAIL_FAST === 'true' // Stop on first failure if enabled
};

const chromium = {
  ...common,
  worldParameters: {
    browser: 'chromium',
    headed: process.env.HEADED === 'true',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0
  }
};

const firefox = {
  ...common,
  worldParameters: {
    browser: 'firefox',
    headed: process.env.HEADED === 'true',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0
  }
};

const webkit = {
  ...common,
  worldParameters: {
    browser: 'webkit',
    headed: process.env.HEADED === 'true',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0
  }
};

const getBrowser = () => {
  switch (process.env.BROWSER) {
    case 'firefox':
      return firefox;
    case 'webkit':
      return webkit;
    default:
      return chromium;
  }
};

module.exports = {
  default: getBrowser()
};
