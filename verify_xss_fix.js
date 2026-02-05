
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the application
    await page.goto('http://localhost:8000');

    // Add a malicious expense
    await page.fill('#expenseDescription', '<img src=x onerror=alert(\'XSS\')>');
    await page.selectOption('#expenseCategory', 'Food');
    await page.fill('#expenseAmount', '100');
    await page.click('#expenseForm button[type="submit"]');

    // Listen for dialogs (alerts)
    let dialogTriggered = false;
    page.on('dialog', dialog => {
      dialogTriggered = true;
      console.error(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });

    // Test "Print Expenses" button
    await page.click('#data-table-tab');
    await page.click('#printExpensesBtn');
    await page.waitForTimeout(1000);

    if (dialogTriggered) {
      throw new Error('XSS vulnerability confirmed in "Print Expenses": An alert was triggered.');
    } else {
      console.log('XSS fix verified in "Print Expenses": No alert was triggered.');
    }

    // Reset dialog trigger flag
    dialogTriggered = false;

    // Test "Print All" button
    await page.click('#printAllBtn');
    await page.waitForTimeout(1000);

    if (dialogTriggered) {
        throw new Error('XSS vulnerability confirmed in "Print All": An alert was triggered.');
      } else {
        console.log('XSS fix verified in "Print All": No alert was triggered.');
      }

  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
