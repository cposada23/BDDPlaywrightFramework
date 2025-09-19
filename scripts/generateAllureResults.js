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

// Helper function to find screenshots for a specific step
function findScreenshotForStep(scenarioName, stepName, stepIndex) {
  const screenshotDir = path.join(__dirname, '..', 'reports', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    return null;
  }

  const cleanScenario = scenarioName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  const cleanStep = stepName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  
  // Look for screenshots that match this specific step
  const screenshots = fs.readdirSync(screenshotDir)
    .filter(file => {
      const fileName = file.toLowerCase();
      const scenarioMatch = fileName.includes(cleanScenario.toLowerCase());
      const stepMatch = fileName.includes(cleanStep.toLowerCase());
      return scenarioMatch && stepMatch && file.endsWith('.png');
    })
    .map(file => path.join(screenshotDir, file))
    .sort((a, b) => {
      // Sort by modification time to get the most recent
      const aStats = fs.statSync(a);
      const bStats = fs.statSync(b);
      return bStats.mtime.getTime() - aStats.mtime.getTime();
    });

  return screenshots.length > 0 ? screenshots[0] : null;
}

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
          const stepName = step.name || '';
          const fullStepName = `${step.keyword}${stepName}`;
          
          const stepResult = {
            name: fullStepName,
            status: step.result.status || 'skipped',
            stage: 'finished',
            start: now - durationMs + (index * 100),
            stop: now - durationMs + (index * 100) + stepDuration,
            duration: stepDuration
          };

          // Add screenshot attachment if step failed or if screenshot exists
          const stepStatus = step.result.status;
          if (stepStatus === 'failed' || process.env.SCREENSHOT_ALL_STEPS === 'true') {
            const screenshot = findScreenshotForStep(scenario.name, stepName, index + 1);
            
            if (screenshot && fs.existsSync(screenshot)) {
              const attachmentUuid = generateUUID();
              const attachmentName = `step-${index + 1}-screenshot.png`;
              
              // Copy screenshot to allure-results with UUID name
              const targetPath = path.join(allureResultsDir, `${attachmentUuid}-attachment.png`);
              fs.copyFileSync(screenshot, targetPath);
              
              stepResult.attachments = [{
                name: attachmentName,
                source: `${attachmentUuid}-attachment.png`,
                type: 'image/png'
              }];
              
              console.log(`📎 Attached screenshot to step ${index + 1}: ${fullStepName}`);
            }
          }

          return stepResult;
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

    // Note: Screenshots are now attached to individual steps rather than the overall test
    // This provides better clarity about which step failed and when the screenshot was taken

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
