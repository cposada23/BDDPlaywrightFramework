const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate UUID function
function generateUUID() {
  return crypto.randomUUID ? crypto.randomUUID() : 
         'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
           var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
           return v.toString(16);
         });
}

// Read cucumber JSON report
const cucumberReport = JSON.parse(fs.readFileSync('reports/cucumber-report.json', 'utf8'));

// Create allure-results directory
const allureResultsDir = 'reports/allure-results';
if (!fs.existsSync(allureResultsDir)) {
  fs.mkdirSync(allureResultsDir, { recursive: true });
}

// Clear existing results
fs.readdirSync(allureResultsDir).forEach(file => {
  fs.unlinkSync(path.join(allureResultsDir, file));
});

// Convert each cucumber feature to allure format
cucumberReport.forEach(feature => {
  feature.elements.forEach(scenario => {
    const testCaseId = generateUUID();
    const fileName = `${testCaseId}-result.json`;  // Changed to -result.json
    
    const status = scenario.steps.some(step => step.result && step.result.status === 'failed') ? 'failed' : 
                   scenario.steps.some(step => step.result && step.result.status === 'skipped') ? 'skipped' : 'passed';
    
    const totalDuration = scenario.steps.reduce((sum, step) => sum + ((step.result && step.result.duration) || 0), 0);
    const durationMs = Math.round(totalDuration / 1000000); // Convert nanoseconds to milliseconds
    
    const now = Date.now();
    
    const allureResult = {
      uuid: testCaseId,
      historyId: scenario.id,
      testCaseId: scenario.id,
      name: scenario.name,
      fullName: `${feature.name}: ${scenario.name}`,
      description: scenario.description || feature.description,
      status: status,
      stage: 'finished',
      start: now - durationMs,
      stop: now,
      duration: durationMs,
      labels: [
        { name: 'feature', value: feature.name },
        { name: 'story', value: scenario.name },
        { name: 'suite', value: feature.name },
        { name: 'framework', value: 'cucumber' },
        { name: 'language', value: 'javascript' },
        { name: 'testClass', value: feature.name }
      ],
      steps: scenario.steps
        .filter(step => !step.hidden && step.result)
        .map((step, index) => {
          const stepDuration = Math.round(((step.result && step.result.duration) || 0) / 1000000);
          return {
            name: `${step.keyword}${step.name || ''}`,
            status: step.result.status || 'skipped',
            stage: 'finished',
            start: now - durationMs + (index * 100),
            stop: now - durationMs + (index * 100) + stepDuration,
            duration: stepDuration
          };
        })
    };

    // Add failure details if test failed
    const failedStep = scenario.steps.find(step => step.result && step.result.status === 'failed');
    if (failedStep && failedStep.result.error_message) {
      allureResult.statusDetails = {
        message: failedStep.result.error_message.split('\n')[0],
        trace: failedStep.result.error_message
      };
    }

    fs.writeFileSync(path.join(allureResultsDir, fileName), JSON.stringify(allureResult, null, 2));
  });
});

// Create environment info
const environmentInfo = {
  browser: process.env.BROWSER || 'chromium',
  baseUrl: process.env.BASE_URL || 'https://blankfactor.com',
  nodeVersion: process.version
};

fs.writeFileSync(path.join(allureResultsDir, 'environment.properties'), 
  Object.entries(environmentInfo).map(([key, value]) => `${key}=${value}`).join('\n'));

console.log(`✅ Generated Allure results in ${allureResultsDir}`);
console.log(`📊 Run 'npm run report' to view the report`);
