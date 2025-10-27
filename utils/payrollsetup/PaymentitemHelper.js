const { expect } = require('@playwright/test');

async function navigateToPaymentItems(paymentitemPage) {
    await paymentitemPage.navigateToPayrollSetup();
    await paymentitemPage.navigateToPaymentItems();
}

async function openCreateNewPaymentItem(paymentitemPage) {
    await paymentitemPage.openCreateNewPaymentItem();
}

async function clickSave(paymentitemPage) {
    await paymentitemPage.clickSave();
}

async function verifyRequiredFieldErrors(paymentitemPage) {
    const errors = await paymentitemPage.getRequiredFieldErrors();
    // List of required fields to check for 'This field is required.'
    const requiredFields = ['paymentItemName', 'paymentItemType', 'paymentType'];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText('This field is required');
    }
    // Payment basis error message
    await expect(errors.paymentBasis).toBeVisible();
    await expect(errors.paymentBasis).toHaveText('Please select at least one payment basis.');
}

async function fillPaymentItemForm(paymentitemPage, paymentItemData) {
    await paymentitemPage.fillPaymentItemForm(paymentItemData);
}

async function verifymessage(paymentitemPage, message) {
    const warning = await paymentitemPage.getWarningMessage();
    expect(warning).toContain(message); // Adjust message as per actual warning
}


module.exports = {
    navigateToPaymentItems,
    openCreateNewPaymentItem,
    clickSave,
    verifyRequiredFieldErrors,
    fillPaymentItemForm,
    verifymessage
};
