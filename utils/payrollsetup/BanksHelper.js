const { expect } = require('@playwright/test');

async function navigateToBanks(bankPage) {
    await bankPage.navigateToPayrollSetup();
    await bankPage.navigateToBanks();
}

async function openCreateNewbank(bankPage) {
    await bankPage.openCreateNewbank();
}

async function clickSave(bankPage) {
    await bankPage.clickSave();
}

async function verifyRequiredFieldErrors(bankPage, expect) {
    const errors = await bankPage.getRequiredFieldErrors();
    // List of required fields to check for 'This field is required.'
    const requiredFields = ['glaccount', 'status', 'bankname'];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText('This field is required.');
    }
}

async function fillbankForm(bankpage, data) {
    await bankpage.fillbankForm(data);
}

async function verifydialogerror(officePage, message) {
    await expect(await officePage.errorDialog).toBeVisible();
    await expect(await officePage.errorDialog).toContainText(message);
}
async function verifymessage(officePage, message) {
    const warning = await officePage.getWarningMessage();
    expect(warning).toContain(message); // Adjust message as per actual warning
}
async function verifybankTableRow(bankpage, data) {
    await bankpage.verifybankTableRow(data);
}
module.exports = {
    navigateToBanks,
    openCreateNewbank,
    clickSave,
    verifyRequiredFieldErrors,
    fillbankForm,
    verifydialogerror,
    verifymessage,
    verifybankTableRow,
};
