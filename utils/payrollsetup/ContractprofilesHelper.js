const { expect } = require('@playwright/test');

async function navigateToContractProfiles(contractprofilesPage) {
    await contractprofilesPage.navigateToPayrollSetup();
    await contractprofilesPage.navigateToContractProfiles();
}

async function openCreateNewContractProfile(contractprofilesPage) {
    await contractprofilesPage.openCreateNewContractProfile();
}

async function clickSave(contractprofilesPage) {
    await contractprofilesPage.clickSave();
}

async function verifyRequiredFieldErrors(contractprofilesPage, expect) {
    const errors = await contractprofilesPage.getRequiredFieldErrors();
    await expect(errors.contractProfileName).toBeVisible();
    await expect(errors.contractProfileName).toHaveText('This field is required.');
}

async function clickAddPaymentItems(contractprofilesPage) {
    await contractprofilesPage.clickAddPaymentItems();
}

async function clickGridSave(contractprofilesPage) {
    await contractprofilesPage.clickGridSave();
}

async function verifyGridRequiredFieldErrors(contractprofilesPage, expect) {
    const errors = await contractprofilesPage.getGridRequiredFieldErrors();
    await expect(errors.paymentItem).toBeVisible();
    await expect(errors.paymentItem).toHaveText('paymentItem is required');
    await expect(errors.paymentBasis).toBeVisible();
    await expect(errors.paymentBasis).toHaveText('PaymentBasis is required');
}

async function addMultiplePaymentItems(contractprofilesPage, paymentItemData) {
    for (const item of paymentItemData) {
        // Click the "Add Payment Item" button first
        await contractprofilesPage.clickAddPaymentItems();

        // Call the existing page function
        await contractprofilesPage.selectGridPaymentItemAndBasis(item);
        await contractprofilesPage.clickGridSave();

        // Optional: short wait for UI stability
        await contractprofilesPage.page.waitForTimeout(2000);
    }
}

async function addValidPaymentItems(contractprofilesPage, data) {
    // Add benefits
    for (const benefit of data.benefits) {
        await contractprofilesPage.clickAddPaymentItems();
        await contractprofilesPage.selectGridPaymentItemAndBasis(benefit);
        await contractprofilesPage.clickGridSave();
        await contractprofilesPage.page.waitForTimeout(1000);
    }
    
    // Switch to deductions tab
    await contractprofilesPage.clickDeductionsTab();
    
    // Add deductions
    for (const deduction of data.deductions) {
        await contractprofilesPage.clickAddPaymentItems();
        await contractprofilesPage.selectGridPaymentItemAndBasis(deduction);
        await contractprofilesPage.clickGridSave();
        await contractprofilesPage.page.waitForTimeout(1000);
    }
}

async function verifyPaymentItemsInGrid(contractprofilesPage, data, expect) {
    // Verify benefits in grid
    await contractprofilesPage.page.getByRole('tab', { name: 'Benefits' }).click();
    await contractprofilesPage.page.waitForTimeout(1000);
    const benefitsTab = contractprofilesPage.page.getByRole('tabpanel', { name: 'Benefits' });
    
    for (const benefit of data.benefits) {
        // Check if the payment item exists in the benefits grid
        const paymentItemExists = await benefitsTab.getByText(benefit.paymentItem).count() > 0;
        expect(paymentItemExists).toBe(true);
        
        // Check if the payment basis exists in the benefits grid
        const paymentBasisExists = await benefitsTab.getByText(benefit.paymentBasis).count() > 0;
        expect(paymentBasisExists).toBe(true);
    }
    
    // Verify deductions in grid
    await contractprofilesPage.page.getByRole('tab', { name: 'Deductions' }).click();
    await contractprofilesPage.page.waitForTimeout(1000);
    const deductionsTab = contractprofilesPage.page.getByRole('tabpanel', { name: 'Deductions' });
    
    for (const deduction of data.deductions) {
        // Check if the payment item exists in the deductions grid
        const paymentItemExists = await deductionsTab.getByText(deduction.paymentItem).count() > 0;
        expect(paymentItemExists).toBe(true);
        
        // Check if the payment basis exists in the deductions grid
        const paymentBasisExists = await deductionsTab.getByText(deduction.paymentBasis).count() > 0;
        expect(paymentBasisExists).toBe(true);
    }
}

async function verifyContractProfileInTable(contractprofilesPage, data, expect) {
    // Navigate back to contract profiles list
    const contractProfileExists = await contractprofilesPage.page.getByText(data.contractProfileName).count() > 0;
    expect(contractProfileExists).toBe(true);
}

async function testUnsavedGridScenario(contractprofilesPage, data) {
    // Fill the contract profile form
    await contractprofilesPage.fillContractProfileForm(data);
    await contractprofilesPage.clickAddPaymentItems();
    await contractprofilesPage.selectGridPaymentItemAndBasis(data.benefits[0]);
    await contractprofilesPage.clickSave();
    await contractprofilesPage.page.waitForTimeout(500);
}

async function testCancelledFormScenario(contractprofilesPage, data) {
    // Fill the contract profile form
    await contractprofilesPage.fillContractProfileForm(data);
    await contractprofilesPage.clickAddPaymentItems();
    await contractprofilesPage.selectGridPaymentItemAndBasis(data.benefits[0]);
    await contractprofilesPage.clickGridSave();
    await contractprofilesPage.page.waitForTimeout(500);
    await contractprofilesPage.clickCancel();
    await contractprofilesPage.page.waitForTimeout(2000);
}

async function verifyContractProfileNotInTable(contractprofilesPage, data, expect) {
    const contractProfileExists = await contractprofilesPage.page.getByText(data.contractProfileName).count() > 0;
    expect(contractProfileExists).toBe(false);
}

async function verifydialogerror(contractprofilesPage, message) {
    await expect(await contractprofilesPage.errorDialog).toBeVisible();
    await expect(await contractprofilesPage.errorDialog).toContainText(message);
}
async function verifymessage(contractprofilesPage, message) {
    const warning = await contractprofilesPage.getWarningMessage();
    expect(warning).toContain(message); // Adjust message as per actual warning
}

// Deductions helper functions
async function clickDeductionsTab(contractprofilesPage) {
    await contractprofilesPage.clickDeductionsTab();
}



module.exports = {
    navigateToContractProfiles,
    openCreateNewContractProfile,
    clickSave,
    verifyRequiredFieldErrors,
    clickAddPaymentItems,
    clickGridSave,
    verifyGridRequiredFieldErrors,
    addMultiplePaymentItems,
    verifydialogerror,
    verifymessage,
    clickDeductionsTab,
    addValidPaymentItems,
    verifyPaymentItemsInGrid,
    verifyContractProfileInTable,
    testUnsavedGridScenario,
    testCancelledFormScenario,
    verifyContractProfileNotInTable
};
