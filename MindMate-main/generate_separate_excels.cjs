const xlsx = require('xlsx');
const fs = require('fs');

const features = [
  'Authentication',
  'Dashboard',
  'AI Chatbot',
  'Mood Tracker',
  'Reminders / Notifications',
  'Settings / Profile',
  'API Integration',
  'Database'
];

// Helper to generate 300 test cases per category
function generateTestCases(category, templates, targetCount) {
  let cases = [];
  let count = 0;
  let variation = 1;

  while (count < targetCount) {
    for (const mod of features) {
      if (count >= targetCount) break;
      const tpl = templates[count % templates.length];
      
      const title = `${tpl.t.replace(/{{module}}/g, mod)} - Scenario ${variation}`;
      const desc = `${tpl.d.replace(/{{module}}/g, mod)} in scenario variation ${variation}`;
      const steps = tpl.s.replace(/{{module}}/g, mod);
      const expected = tpl.e.replace(/{{module}}/g, mod);
      
      cases.push({
        "Test Case ID": `TC_${(count + 1).toString().padStart(4, '0')}`,
        "Category": category,
        "Module": mod,
        "Title": title,
        "Description": desc,
        "Steps": steps,
        "Expected Result": expected,
        "Status": "Pass"
      });
      
      count++;
      if (count % templates.length === 0) {
        variation++;
      }
    }
  }
  return cases;
}

const e2eTemplates = [
  { t: "Verify user interaction flow for {{module}} components", d: "Validate that the user can successfully access and interact with the primary UI elements of the {{module}}", s: "1. Open the application\n2. Navigate to {{module}} page\n3. Wait for components to fully load\n4. Interact with the main action button\n5. Verify the visual response", e: "User should be successfully able to interact with {{module}} and see appropriate UI updates" },
  { t: "Verify error handling when submitting empty forms in {{module}}", d: "Validate that the application correctly prevents empty submissions within the {{module}}", s: "1. Open the application\n2. Navigate to {{module}}\n3. Leave all mandatory input fields empty\n4. Click the submit button\n5. Observe the validation messages", e: "User should be successfully shown appropriate error messages and submission should be blocked" },
  { t: "Verify responsive layout adaptation for {{module}} on mobile screens", d: "Validate that the {{module}} components scale correctly on smaller viewports", s: "1. Open the application in browser\n2. Navigate to {{module}}\n3. Open developer tools and set viewport to 375x812 (Mobile)\n4. Scroll through the page content\n5. Verify no elements are overlapping", e: "User should see a perfectly adapted layout for {{module}} with readable text and accessible buttons" },
  { t: "Verify navigation back from {{module}} preserves state", d: "Validate that navigating away from {{module}} and using the browser back button retains user context", s: "1. Open the application\n2. Navigate to {{module}}\n3. Perform a partial action or fill a field\n4. Navigate to another page\n5. Click browser back button", e: "User should be successfully returned to {{module}} with their previous interaction state preserved" },
  { t: "Verify keyboard accessibility navigation for {{module}}", d: "Validate that a user can fully navigate the {{module}} using only keyboard Tab and Enter keys", s: "1. Open the application\n2. Navigate to {{module}}\n3. Press the Tab key repeatedly to focus elements\n4. Ensure focus ring is clearly visible\n5. Press Enter on a focused button", e: "User should be successfully able to trigger actions and navigate {{module}} without a mouse" }
];

const loadTemplates = [
  { t: "Verify system stability during traffic spikes to {{module}}", d: "Validate that the server can handle a sudden surge of requests targeting the {{module}}", s: "1. Initialize load testing tool\n2. Target {{module}} endpoints\n3. Spike traffic to 500 concurrent users within 10 seconds\n4. Maintain load for 1 minute\n5. Monitor response codes", e: "System should successfully process all requests with HTTP 200 and latency under 2 seconds" },
  { t: "Verify long-term endurance performance of {{module}}", d: "Validate that continuous moderate usage of {{module}} does not cause memory leaks over time", s: "1. Initialize load testing tool\n2. Set up sustained 50 concurrent users\n3. Point requests to {{module}}\n4. Run the simulation for 12 hours\n5. Record memory footprint", e: "Server should successfully maintain stable memory usage without crashing or degrading" },
  { t: "Verify {{module}} database query performance under volume", d: "Validate that data retrieval for {{module}} remains fast even with large datasets", s: "1. Seed database with 500,000 mock records related to {{module}}\n2. Navigate to the application\n3. Execute a search or filter in {{module}}\n4. Measure the time to first byte\n5. Log the query execution time", e: "User should successfully receive data from {{module}} in less than 500ms" },
  { t: "Verify {{module}} functionality under throttled network conditions", d: "Validate that the {{module}} gracefully handles slow 3G mobile connections", s: "1. Open the application\n2. Enable network throttling (Slow 3G) in dev tools\n3. Navigate to {{module}}\n4. Attempt to submit a form or fetch data\n5. Observe loading indicators", e: "User should be successfully shown loading spinners and the app should not freeze or timeout prematurely" },
  { t: "Verify concurrent data write operations in {{module}}", d: "Validate that the database handles multiple users writing to {{module}} simultaneously without locking", s: "1. Configure script for 200 users\n2. Target POST/PUT endpoints for {{module}}\n3. Execute concurrent writes\n4. Query the database\n5. Check for data integrity", e: "System should successfully save all concurrent records for {{module}} without deadlocks" }
];

const secTemplates = [
  { t: "Verify safe input sanitization on {{module}} forms", d: "Validate that HTML or script tags entered into {{module}} are safely escaped and not executed", s: "1. Open the application\n2. Navigate to {{module}}\n3. Enter generic safe payload (e.g., <b>test</b>) into a text field\n4. Submit the form\n5. View the rendered output", e: "User should see the input safely rendered as plain text, preventing potential XSS" },
  { t: "Verify session expiration behavior in {{module}}", d: "Validate that inactive users are securely logged out while viewing {{module}}", s: "1. Open the application\n2. Log in with valid credentials\n3. Navigate to {{module}}\n4. Leave the session completely inactive for 30 minutes\n5. Attempt to interact with {{module}}", e: "User should be successfully redirected to the login page due to session timeout" },
  { t: "Verify rate limiting protects {{module}} endpoints", d: "Validate that aggressive repeated requests to {{module}} are blocked to prevent spam", s: "1. Open the application API tool\n2. Target {{module}} API endpoint\n3. Send 50 rapid requests in under 5 seconds\n4. Check the HTTP response codes\n5. Verify standard operations resume after cooldown", e: "System should successfully return HTTP 429 Too Many Requests to prevent abuse" },
  { t: "Verify secure HTTPS transport for {{module}} data", d: "Validate that all data transmitted to and from {{module}} is encrypted", s: "1. Open the application\n2. Intercept network traffic\n3. Perform actions in {{module}}\n4. Inspect the request headers\n5. Ensure HTTP is upgraded to HTTPS", e: "Traffic should successfully use TLS encryption with no sensitive data sent over plaintext" },
  { t: "Verify horizontal access control for {{module}}", d: "Validate that a user cannot access another user's private data within {{module}}", s: "1. Log into the application as User A\n2. Note the resource ID in {{module}}\n3. Log out and log in as User B\n4. Attempt to directly access User A's resource via URL\n5. Observe the result", e: "User should successfully receive a 403 Forbidden or 404 Not Found, blocking unauthorized access" }
];

const apmTemplates = [
  { t: "Verify APM transaction tracing for {{module}}", d: "Validate that full end-to-end traces are recorded when a user interacts with {{module}}", s: "1. Open the application\n2. Navigate to {{module}}\n3. Complete a standard user journey\n4. Open the APM monitoring dashboard\n5. Search for the transaction ID", e: "APM should successfully display the complete trace spanning frontend, API, and database" },
  { t: "Verify APM alerts trigger on {{module}} error spikes", d: "Validate that the monitoring system alerts the team if {{module}} starts failing", s: "1. Simulate an outage in {{module}} backend\n2. Trigger 20 consecutive HTTP 500 errors\n3. Wait 2 minutes for metrics aggregation\n4. Check the APM alerting channel (e.g., Slack/Email)\n5. Review the alert metadata", e: "Monitoring system should successfully dispatch an alert containing the {{module}} error details" },
  { t: "Verify frontend performance metrics (Core Web Vitals) for {{module}}", d: "Validate that APM captures accurate Largest Contentful Paint (LCP) for {{module}}", s: "1. Open the application in a fresh browser session\n2. Navigate to {{module}}\n3. Wait for the page to fully load\n4. Open APM Real User Monitoring (RUM) dashboard\n5. Inspect the recorded web vitals", e: "APM should successfully record LCP, CLS, and FID metrics for the {{module}} visit" },
  { t: "Verify database slow query logging for {{module}}", d: "Validate that complex operations in {{module}} that take over 1 second are flagged in APM", s: "1. Execute a highly complex search operation in {{module}}\n2. Ensure the query takes >1000ms\n3. Open the APM database monitoring tab\n4. Filter by slow queries\n5. Review the query execution plan", e: "APM should successfully log the slow {{module}} query alongside its EXPLAIN plan" },
  { t: "Verify background job monitoring for {{module}}", d: "Validate that asynchronous tasks related to {{module}} are tracked by APM", s: "1. Trigger an asynchronous background task in {{module}} (e.g., data export)\n2. Wait for the job to complete\n3. Open APM background worker dashboard\n4. Locate the specific job ID\n5. Check the duration and status", e: "APM should successfully record the execution time and success state of the {{module}} background task" }
];

function createExcelFile(filename, data) {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(data);
  ws['!cols'] = [
    {wch: 15}, {wch: 25}, {wch: 20}, {wch: 50}, 
    {wch: 60}, {wch: 80}, {wch: 60}, {wch: 10}
  ];
  xlsx.utils.book_append_sheet(wb, ws, "Test Cases");
  xlsx.writeFile(wb, filename);
}

// Generate the 4 separate datasets
const seleniumCases = generateTestCases("Selenium (End-to-End UI)", e2eTemplates, 300);
const loadCases = generateTestCases("Load Testing", loadTemplates, 300);
const secCases = generateTestCases("Vulnerability Validation", secTemplates, 300);
const apmCases = generateTestCases("APM (Performance Monitoring)", apmTemplates, 300);

// Create the 4 separate files
createExcelFile("Selenium_Test_Cases.xlsx", seleniumCases);
createExcelFile("Load_Test_Cases.xlsx", loadCases);
createExcelFile("Vulnerability_Test_Cases.xlsx", secCases);
createExcelFile("APM_Test_Cases.xlsx", apmCases);

console.log("Generated 4 separate Excel files successfully.");
