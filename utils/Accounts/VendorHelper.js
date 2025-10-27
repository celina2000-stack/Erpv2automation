const { expect } = require('@playwright/test');

async function navigateToVendors(vendorPage) {
    await vendorPage.navigateToaccounts();
    await vendorPage.navigateToVendors();
}

async function openCreateNewVendor(vendorPage) {
    await vendorPage.openCreateNewVendor();
}

async function verifyAndSelectVendorType(vendorPage, expectedType) {
    const selected = await vendorPage.getSelectedVendorTypeText();
    
    if (selected !== expectedType) {
        // Select the expected type if not already selected
        await vendorPage.selectVendorType(expectedType);
        await vendorPage.page.waitForTimeout(1000); // Wait for any dynamic changes
    }
    
    // Verify the selection
    const finalSelected = await vendorPage.getSelectedVendorTypeText();
    expect(finalSelected).toBe(expectedType);
}

async function verifyAllVendorFormFieldsPresent(vendorPage) {
    await vendorPage.verifyAllVendorFormFieldsPresent();
}

async function verifyAllConsultantFormFieldsPresent(vendorPage) {
    await vendorPage.verifyAllConsultantFormFieldsPresent();
}

async function clickSaveButton(vendorPage) {
    await vendorPage.clickSaveButton();
}

async function verifyVendorRequiredFieldErrors(vendorPage) {
    const errors = vendorPage.getVendorRequiredFieldErrors();
    const requiredFields = ['companyName', 'vendorDisplayName', 'panNo', 'status', 'vendorCode', 'firstName','LastName'];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText('This field is required.');
    }
}

async function verifyConsultantRequiredFieldErrors(vendorPage) {
    const errors = vendorPage.getConsultantRequiredFieldErrors();
    const requiredFields = ['firstName', 'lastName', 'personnelCode', 'status'];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText('This field is required.');
    }
}

async function verifyemailandphoneformat(vendorPage) {
    const errors = vendorPage.getVendorRequiredFieldErrors();
    const requiredFields = ['email','phoneNumber'];
    
    await expect(errors['email']).toBeVisible();
    await expect(errors['email']).toHaveText('Invalid Email format');

    await expect(errors['phoneNumber']).toBeVisible();
    await expect(errors['phoneNumber']).toHaveText('Invalid phone number format');
}

async function fillVendorForm(vendorPage, data) {
    await vendorPage.fillVendorForm(data);
}
async function verifydialogerror(vendorPage, message) {
    await expect(await vendorPage.errorDialog).toBeVisible();
    await expect(await vendorPage.errorDialog).toContainText(message);
}
async function verifymessage(vendorPage, message) {
    const warning = await vendorPage.getWarningMessage();
    expect(warning).toContain(message); // Adjust message as per actual warning
}
module.exports = {
    navigateToVendors,
    openCreateNewVendor,
    verifyAndSelectVendorType,
    verifyAllVendorFormFieldsPresent,
    verifyAllConsultantFormFieldsPresent,
    clickSaveButton,
    verifyVendorRequiredFieldErrors,
    verifyConsultantRequiredFieldErrors,
    verifyemailandphoneformat,
    fillVendorForm,verifydialogerror, verifymessage
};
