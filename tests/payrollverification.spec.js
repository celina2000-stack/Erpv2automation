const { test } = require('@playwright/test');
const { readExcelSheetRaw, findValueByLabel} = require('../utils/excelReader');
const { performLogin } = require('../utils/loginHelper');
const {navigateToHumanResourceAndPayroll, navigateToPayrollWorkflow, selectEmployees} = require('../utils/humanresource/PayrollHelper');

const LoginPage = require('../pages/common/LoginPage');
const PayrollverificationPage = require('../pages/humanresource/PayrollverificationPage');
const PayrollPage = require('../pages/humanresource/PayrollPage');
const loginData = require('../fixtures/loginData.json');
const { log } = require('console');

test.describe('Payroll Verification Test', () => {
    test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await page.goto('https://exolutusv2.exoerp.com');
    await performLogin(loginPage, loginData.valid);
    await loginPage.verifyLogin();
    });
  test('should verify payroll data for all employees using Excel', async ({ page }) => {
    // 1. Instantiate the PayrollverificationPage
    const payrollverificationPage = new PayrollverificationPage(page);
    const payrollPage = new PayrollPage(page);
    await navigateToHumanResourceAndPayroll(payrollPage);
    const months='Shrawan';
    await navigateToPayrollWorkflow(payrollPage, months);
    await selectEmployees(payrollPage);

    // 8. Verify payroll data using Excel (file path is relative to project root)
    const excelFilePath = './testdata/payroll.xlsx'; // <- Update with your actual path
    await payrollverificationPage.verifyAllEmployeesPayrollDataFromExcel(excelFilePath, months);
    
  });
});