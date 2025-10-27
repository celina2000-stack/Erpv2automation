const { expect } = require('@playwright/test');

async function navigateToContracttype(contracttypePage) {
    await contracttypePage.navigateToPayrollSetup();
    await contracttypePage.navigateToContracttype();
}

async function openCreateNewcontracttype(contracttypePage) {
    await contracttypePage.openCreateNewcontracttype();
}

async function clickSave(contracttypePage) {
    await contracttypePage.clickSave();
}

async function verifyRequiredFieldErrors(contracttypePage, expect) {
    const errors = await contracttypePage.getRequiredFieldErrors();
    // List of required fields to check for 'This field is required.'
    const requiredFields = ['contractname', 'contracttype'];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText('This field is required.');
    }
}

async function fillcontracttypeForm(contracttypepage, data) {
    await contracttypepage.fillcontracttypeForm(data);
}

async function verifydialogerror(officePage, message) {
    await expect(await officePage.errorDialog).toBeVisible();
    await expect(await officePage.errorDialog).toContainText(message);
}
async function verifymessage(officePage, message) {
    const warning = await officePage.getWarningMessage();
    expect(warning).toContain(message); // Adjust message as per actual warning
}
async function verifycontracttypeTableRow(contracttypepage, data) {
    await contracttypepage.verifycontracttypeTableRow(data);
}
module.exports = {
    navigateToContracttype,
    openCreateNewcontracttype,
    clickSave,
    verifyRequiredFieldErrors,
    fillcontracttypeForm,
    verifydialogerror,
    verifymessage,
    verifycontracttypeTableRow,
};
