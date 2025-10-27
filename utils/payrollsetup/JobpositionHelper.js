const { expect } = require('@playwright/test');

async function navigateToJobPositions(jobpositionPage) {
    await jobpositionPage.navigateToPayrollSetup();
    await jobpositionPage.navigateToJobPositions();
}

async function openCreateNewJobPosition(jobpositionPage) {
    await jobpositionPage.openCreateNewJobPosition();
}

async function clickSave(jobpositionPage) {
    await jobpositionPage.clickSave();
}

async function verifyRequiredFieldErrors(jobpositionPage, expect) {
    const errors = await jobpositionPage.getRequiredFieldErrors();
    // List of required fields to check for 'This field is required.'
    const requiredFields = ['jobPositionName', 'status'];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText('This field is required.');
    }
}

async function fillJobPositionForm(jobpositionPage, data) {
    await jobpositionPage.fillJobPositionForm(data);
}

async function verifydialogerror(officePage, message) {
    await expect(await officePage.errorDialog).toBeVisible();
    await expect(await officePage.errorDialog).toContainText(message);
}
async function verifymessage(officePage, message) {
    const warning = await officePage.getWarningMessage();
    expect(warning).toContain(message); // Adjust message as per actual warning
}
async function verifyJobPositionTableRow(jobpositionPage, data) {
    await jobpositionPage.verifyJobPositionTableRow(data);
}
module.exports = {
    navigateToJobPositions,
    openCreateNewJobPosition,
    clickSave,
    verifyRequiredFieldErrors,
    fillJobPositionForm,
    verifydialogerror,
    verifymessage,
    verifyJobPositionTableRow,
};
