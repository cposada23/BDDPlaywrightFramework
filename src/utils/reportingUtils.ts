import * as fs from 'fs';
import * as path from 'path';

export interface TestReport {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshots?: string[];
  browser?: string;
  timestamp: Date;
}

export class ReportingUtils {
  private reportsDir: string;
  private screenshotsDir: string;
  private videosDir: string;

  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports');
    this.screenshotsDir = path.join(this.reportsDir, 'screenshots');
    this.videosDir = path.join(this.reportsDir, 'videos');
    this.ensureDirectoriesExist();
  }

  /**
   * Ensure all report directories exist
   */
  private ensureDirectoriesExist(): void {
    const directories = [
      this.reportsDir,
      this.screenshotsDir,
      this.videosDir,
      path.join(this.reportsDir, 'allure-results'),
      path.join(this.reportsDir, 'traces')
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate a comprehensive test report
   */
  generateTestReport(testResults: TestReport[]): void {
    const reportPath = path.join(this.reportsDir, 'test-summary.json');
    
    const summary = {
      totalTests: testResults.length,
      passed: testResults.filter(test => test.status === 'passed').length,
      failed: testResults.filter(test => test.status === 'failed').length,
      skipped: testResults.filter(test => test.status === 'skipped').length,
      executionTime: testResults.reduce((total, test) => total + test.duration, 0),
      generatedAt: new Date().toISOString(),
      tests: testResults
    };

    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
    console.log(`📊 Test report generated: ${reportPath}`);
  }

  /**
   * Generate HTML report from JSON results
   */
  generateHTMLReport(): void {
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright BDD Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric h3 { margin: 0; color: #333; }
        .metric .value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .total { color: #007bff; }
        .tests-table { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .status.passed { background: #d4edda; color: #155724; }
        .status.failed { background: #f8d7da; color: #721c24; }
        .status.skipped { background: #fff3cd; color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎭 Playwright BDD Test Report</h1>
            <p>Generated on: <span id="timestamp"></span></p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value total" id="total-tests">0</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value passed" id="passed-tests">0</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value failed" id="failed-tests">0</div>
            </div>
            <div class="metric">
                <h3>Skipped</h3>
                <div class="value skipped" id="skipped-tests">0</div>
            </div>
        </div>

        <div class="tests-table">
            <table>
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Browser</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody id="test-results">
                    <!-- Test results will be populated here -->
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // This would be populated with actual test data
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
    </script>
</body>
</html>`;

    const htmlPath = path.join(this.reportsDir, 'test-report.html');
    fs.writeFileSync(htmlPath, htmlTemplate);
    console.log(`📄 HTML report template created: ${htmlPath}`);
  }

  /**
   * Clean up old reports and artifacts
   */
  cleanupOldReports(daysToKeep: number = 7): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const cleanupDirectories = [this.screenshotsDir, this.videosDir];

    cleanupDirectories.forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });

    console.log(`🧹 Cleaned up reports older than ${daysToKeep} days`);
  }

  /**
   * Get report file paths
   */
  getReportPaths() {
    return {
      htmlReport: path.join(this.reportsDir, 'html-report', 'index.html'),
      jsonReport: path.join(this.reportsDir, 'test-results.json'),
      junitReport: path.join(this.reportsDir, 'junit.xml'),
      allureResults: path.join(this.reportsDir, 'allure-results'),
      customReport: path.join(this.reportsDir, 'test-report.html')
    };
  }
}
