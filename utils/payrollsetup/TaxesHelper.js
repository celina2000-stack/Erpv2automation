const { expect } = require('@playwright/test');

async function navigateToTaxes(taxPage) {
    await taxPage.navigateToPayrollSetup();
    await taxPage.navigateToTaxes();
}

async function openCreateNewtax(taxPage) {
    await taxPage.openCreateNewtax();
}

async function clickSave(taxPage) {
    await taxPage.clickSave();
}

async function verifyRequiredFieldErrors(taxPage, expect) {
    const errors = await taxPage.getRequiredFieldErrors();
    // List of required fields to check for 'This field is required.'
    const requiredFields = ['taxname', 'glaccount', 'tdstype','maritalstatus'];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText('This field is required.');
    }
}

async function filltaxForm(taxpage, data) {
    await taxpage.filltaxForm(data);
}

async function verifydialogerror(taxpage, message) {
    await expect(await taxpage.errorDialog).toBeVisible();
    await expect(await taxpage.errorDialog).toContainText(message);
}
async function verifymessage(taxpage, message) {
    const warning = await taxpage.getWarningMessage();
    expect(warning).toContain(message); // Adjust message as per actual warning
}

async function addMultipletaxrate(taxpage, taxrate) {
    for (const item of taxrate) {
        // Click the "Add Payment Item" button first
        await taxpage.clickaddtaxrate();

        // Call the existing page function
        await taxpage.filltaxrate(item);
        await taxpage.clickgridsave();

        // Optional: short wait for UI stability
        await taxpage.page.waitForTimeout(2000);
        await taxpage.veifytaxrateingrid(item);
    }
}

async function verifytaxTableRow(taxpage, data) {
    await taxpage.verifytaxTableRow(data);
}
module.exports = {
    navigateToTaxes,
    openCreateNewtax,
    clickSave,
    verifyRequiredFieldErrors,
    filltaxForm,
    verifydialogerror,
    verifymessage,
    addMultipletaxrate,
    verifytaxTableRow,
};
