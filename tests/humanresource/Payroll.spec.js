
const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/common/LoginPage');
const PayrollPage = require('../../pages/humanresource/PayrollPage');
const { performLogin } = require('../../utils/loginHelper');
const {navigateToHumanResourceAndPayroll, navigateToPayrollWorkflow, selectEmployees,verifyRequiredFieldErrors, createPaymentBatch} = require('../../utils/humanresource/PayrollHelper');
const loginData = require('../../fixtures/loginData.json');
const employeeData = require('../../fixtures/humanresource/EmployeeData.json');
const payrolldata = require('../../fixtures/humanresource/payrollData.json');

test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await page.goto('https://exolutusv2.exoerp.com');
    await performLogin(loginPage);
    await loginPage.verifyLogin();
});
test('Verify payroll', async ({ page }) => {
    const payrollPage = new PayrollPage(page);
    await navigateToHumanResourceAndPayroll(payrollPage);
    await navigateToPayrollWorkflow(payrollPage, 'Shrawan');
    await selectEmployees(payrollPage);

    // Verify payroll data for all employees in the grid
    await payrollPage.verifyAllEmployeesPayrollData(payrolldata);

});

test('should show validation errors when required fields are left blank in create payment batch', async ({ page }) => {
    const payrollPage = new PayrollPage(page);
    await navigateToHumanResourceAndPayroll(payrollPage);
    // Click the +Create button
    await payrollPage.clickCreatePaymentBatch();
    // Click Save without filling any fields
    await payrollPage.clickSaveOnCreateBatch();
   await verifyRequiredFieldErrors(payrollPage, expect);
});
test.only('should create payment batch successfully with valid data', async ({ page }) => {
    const payrollPage = new PayrollPage(page);
    await navigateToHumanResourceAndPayroll(payrollPage);
    // Click the +Create button
    // Use helper to fill and save payment batch using data file
    await createPaymentBatch(payrollPage, payrolldata.withoutcontractType);
    await payrollPage.verifyPaymentBatchSaved(payrolldata.withoutcontractType, expect);
});
