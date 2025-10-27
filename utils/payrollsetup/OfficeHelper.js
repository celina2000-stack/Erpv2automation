const { expect } = require('@playwright/test');

async function navigateToOffices(officePage) {
    await officePage.navigateToPayrollSetup();
    await officePage.navigateToOffices();
}

async function openCreateNewOffice(officePage) {
    await officePage.openCreateNewOfficeDialog();
}
async function verifyRequiredFieldErrors(officePage, expect) {
    const errors = await officePage.getRequiredFieldErrors();
    // List of required fields to check for 'This field is required.'
    const requiredFields = ['office','officeName', 'status'];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText('This field is required');
    }
    // Weekend day error message
    await expect(errors.weekendDay).toBeVisible();
    await expect(errors.weekendDay).toHaveText('Please select at least one weekend day.');
}

async function verifydialogerror(officePage, message) {
    await expect(await officePage.errorDialog).toBeVisible();
    await expect(await officePage.errorDialog).toContainText(message);
}
async function verifymessage(officePage, message) {
    const warning = await officePage.getWarningMessage();
    expect(warning).toContain(message); // Adjust message as per actual warning
}

module.exports = { verifyRequiredFieldErrors, navigateToOffices, openCreateNewOffice, verifydialogerror, verifymessage };
