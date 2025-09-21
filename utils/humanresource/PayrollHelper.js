// Fill and save payment batch using page object and data

const payrollData = require('../../fixtures/humanresource/payrollData.json');
async function createPaymentBatch(payrollPage, data) {
    await payrollPage.clickCreatePaymentBatch();
    await payrollPage.fillPaymentBatch(data);
    await payrollPage.clickSaveOnCreateBatch();
}
async function navigateToHumanResourceAndPayroll(payrollPage) {
    await payrollPage.navigateToHumanResource();
    await payrollPage.navigateToPayroll();
}
async function verifyRequiredFieldErrors(payrollPage, expect) {
    const errors = await payrollPage.getRequiredFieldErrors();
    // List of required fields to check for 'This field is required.'
    const requiredFields = [
        'batchType', 'reportingPeriod', 'bank', 'countryCurrency'
    ];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText(/This field is required\./);
    }
}
async function navigateToPayrollWorkflow(payrollPage, periodName = 'Shrawan') {
    await payrollPage.setShowEntriesTo25();
    await payrollPage.clickReportingPeriodRow(periodName);
    await payrollPage.clickNextButton();
}
async function selectEmployees(payrollPage){
    await payrollPage.selectAllEmployees();
    await payrollPage.clickNextButton();
}

module.exports = {
    navigateToHumanResourceAndPayroll,
    navigateToPayrollWorkflow,
    selectEmployees, verifyRequiredFieldErrors
    , createPaymentBatch
};