import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import 'chromedriver';
import { generateExcelReport, TestResult } from './excel-reporter';

const APP_URL = 'http://localhost:3000'; // Make sure the Vite dev server is running here

/**
 * Helper to wait for an element and click it
 */
async function waitAndClick(driver: WebDriver, xpath: string, timeout = 8000) {
  const el = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  await driver.wait(until.elementIsEnabled(el), timeout);
  await el.click();
}

/**
 * Helper to wait for an element and type text into it
 */
async function waitAndType(driver: WebDriver, xpath: string, text: string, timeout = 8000) {
  const el = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  await el.clear();
  await el.sendKeys(text);
}

/**
 * Helper to wait for an element to be visible on the page
 */
async function waitForElement(driver: WebDriver, xpath: string, timeout = 8000) {
  const el = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
  return await driver.wait(until.elementIsVisible(el), timeout);
}

async function runTests() {
  const results: TestResult[] = [];
  let driver: WebDriver | null = null;

  const recordResult = (step: string, expected: string, actual: string, status: 'Pass' | 'Fail', start: number) => {
    const durationMs = Date.now() - start;
    results.push({ step, expected, actual, status, durationMs });
    console.log(`[${status}] ${step} (${durationMs}ms) - ${actual}`);
  };

  /**
   * Helper to execute a test step, catch errors, and record the result automatically
   */
  async function executeStep(stepName: string, expected: string, action: () => Promise<void>) {
    const start = Date.now();
    try {
      await action();
      recordResult(stepName, expected, 'Step completed successfully', 'Pass', start);
    } catch (e: any) {
      recordResult(stepName, expected, `Failed: ${e.message}`, 'Fail', start);
      throw e; // Rethrow to stop test execution if a critical step fails
    }
  }

  try {
    console.log('Starting Selenium WebDriver...');
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();

    // Test 1: Splash Screen / App Launch
    await executeStep('1. App Launch', 'Splash screen loads successfully', async () => {
      await driver!.get(APP_URL);
      await waitForElement(driver!, "//button[contains(., 'Get Started') or contains(., 'Begin')]", 10000);
    });

    // Test 2: Get Started Navigation
    await executeStep('2. Navigate to Sign In', 'Clicking Get Started navigates to the Sign In page', async () => {
      await waitAndClick(driver!, "//button[contains(., 'Get Started') or contains(., 'Begin')]");
      await waitForElement(driver!, "//input[@type='email']", 5000);
    });

    // Test 3: Login Authentication
    await executeStep('3. Login Authentication', 'User can log in with valid credentials', async () => {
      await waitAndType(driver!, "//input[@type='email']", "test@example.com");
      await waitAndType(driver!, "//input[@type='password']", "password123");
      // Use generic button locator to ensure we click the sign in button
      await waitAndClick(driver!, "//button[@type='submit']");

      // Wait for navigation to dashboard - typically 'MindMate Insight' or 'Home' header
      await waitForElement(driver!, "//*[contains(text(), 'MindMate Insight') or contains(text(), 'Insight') or contains(text(), 'Welcome')]", 12000);
    });

    // Test 4: Dashboard Validation
    await executeStep('4. Dashboard Feature', 'Dashboard loads and displays core elements', async () => {
      // Verifying dashboard loaded successfully
      await waitForElement(driver!, "//nav"); // Bottom Nav should be present
    });

    // Test 5: AI Chatbot
    await executeStep('5. AI Chatbot Interaction', 'User can navigate to chat and send a message', async () => {
      await waitAndClick(driver!, "//nav//button[contains(., 'AI Chat') or contains(., 'Chat')]");
      // Chat input area
      await waitAndType(driver!, "//input[@placeholder='Type your message...' or @type='text'] | //textarea", "Hello, I am feeling a bit anxious today.");
      // Send button
      // Find input box first
      const chatInput = await driver!.findElement(By.xpath("//input[@type='text'] | //textarea"));

      // Press ENTER instead of clicking send button
      await chatInput.sendKeys("\n");
      await driver!.sleep(2000);

      // Check if message appears in chat
      await waitForElement(driver!, "//*[contains(text(),'anxious')]", 5000);
    });

    // Test 6 & 7: Stress Tracker & Daily Reflection
    await executeStep('6 & 7. Stress Tracker & Daily Reflection', 'User completes check-in flow with stress tracking and reflection', async () => {
      // Navigate to Check-in
      await waitAndClick(driver!, "//nav//button[contains(., 'Check-in')]");
      await waitForElement(driver!, "//button[contains(., 'Continue Check-in')]", 5000);

      // We go through the check-in steps clicking 'Continue Check-in' repeatedly
      // Step 1: Mood
      await waitAndClick(driver!, "//button[contains(., 'Continue Check-in')]");
      await driver!.sleep(500);

      // Step 2: Indicators
      await waitAndClick(driver!, "//button[contains(., 'Continue Check-in')]");
      await driver!.sleep(500);

      // Step 3: Anxiety
      await waitAndClick(driver!, "//button[contains(., 'Continue Check-in')]");
      await driver!.sleep(500);

      // Step 4: Stress
      await waitAndClick(driver!, "//button[contains(., 'Continue Check-in')]");
      await driver!.sleep(500);

      // Step 5: Sleep & Reflection (Daily Reflection text area)
      await waitAndType(driver!, "//textarea", "I am working on my wellness journey and testing my reflections.");
      await waitAndClick(driver!, "//button[contains(., 'Generate Life Evaluation')]");
      await driver!.sleep(1000);

      // Step 6: Results & Save
      await waitAndClick(driver!, "//button[contains(., 'Save to Sanctuary History')]");

      // Should redirect to history automatically
      await waitForElement(driver!, "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'history') or contains(., 'History')]", 8000);
    });

    // Test 8: Navigation between sections
    await executeStep('8. Navigation Between Sections', 'User can seamlessly navigate using the bottom nav', async () => {
      // We are at history. Let's go to Home.
      await waitAndClick(driver!, "//nav//button[contains(., 'Home')]");
      await waitForElement(driver!, "//*[contains(text(), 'MindMate Insight') or contains(text(), 'Insight')]", 5000);

      // Let's go to Profile
      await waitAndClick(driver!, "//nav//button[contains(., 'Profile')]");
      await waitForElement(driver!, "//*[contains(text(), 'Profile') or contains(., 'Settings')]", 5000);
    });

    // Test 9: Logout functionality
    await executeStep('9. Logout Functionality', 'User can log out and is redirected to Splash/Login', async () => {
      // Ensure we are on Profile page
      await waitForElement(driver!, "//button[contains(., 'Sign Out') or contains(., 'Log Out') or contains(., 'Logout')]");
      await waitAndClick(driver!, "//button[contains(., 'Sign Out') or contains(., 'Log Out') or contains(., 'Logout')]");

      // Verify redirect to Splash Screen
      await waitForElement(driver!, "//button[contains(., 'Get Started') or contains(., 'Begin')]", 5000);
    });

  } catch (err) {
    console.error('\n❌ Test suite failed. Stopping execution.');
  } finally {
    // Generate Final Excel Report
    console.log('\nGenerating Excel Report...');
    await generateExcelReport(results, 'e2e-report.xlsx');

    if (driver) {
      console.log('Closing browser...');
      await driver.quit();
    }
  }
}

runTests();
