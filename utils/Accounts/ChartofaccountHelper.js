const { expect } = require('@playwright/test');

// Navigates to Accounts > Chart of Account
async function navigateToAccountsAndChartOfAccount(chartofaccountPage) {
    await chartofaccountPage.navigateaccounts();
    await chartofaccountPage.navigateTocoa();
}

// Opens the Chart of Account creation form
async function openChartOfAccountCreation(chartofaccountPage) {
    await chartofaccountPage.clickFirstDataRow();
    await chartofaccountPage.clickCreateNew();
}

// Verifies required field errors in Chart of Account creation form
async function verifyRequiredFieldErrors(chartofaccountPage) {
    await chartofaccountPage.clickSave();
    const errors = await chartofaccountPage.getRequiredFieldErrors();
    const requiredFields = ['accountNumber', 'accountName', 'currency'];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText(/This field is required\./);
    }
}

// Expands all rows in Chart of Account table
async function expandAllRows(chartofaccountPage) {
    await chartofaccountPage.expandAllRows();
}
// Clicks '+' for a given account name and verifies Parent GLAccount value
async function addChildAccountAndVerifyParent(chartofaccountPage, accountName) {
    await chartofaccountPage.clickAddForAccountName(accountName);
    // Wait for the form/dialog to appear
    await chartofaccountPage.page.waitForSelector('input, [role="dialog"]');
    const parentValue = await chartofaccountPage.getParentGLAccountValue();
    expect(parentValue).toContain(accountName);
}
// Helper to automate Opening Balance visibility scenario
async function verifyOpeningBalanceVisibilityForLedgerGroupVsLedgerItem(chartofaccountPage) {
    // Should NOT be visible for Ledger Group
    expect(await chartofaccountPage.isOpeningBalanceVisible()).toBeFalsy();
    // Select Ledger Item
    await chartofaccountPage.selectGLAccountUseTypeLedgerItem();
    await chartofaccountPage.page.waitForTimeout(1000); // Wait for UI to update
    // Should be visible for Ledger Item
    expect(await chartofaccountPage.isOpeningBalanceVisible()).toBeTruthy();
}
// Clicks '+' for a given account name and verifies the warning message for Ledger Item
async function verifyAddChildWarningForLedgerItem(chartofaccountPage, accountName) {
    await chartofaccountPage.clickAddForAccountNameAndWait(accountName);
}

// Verifies that Tax Detail section appears when Tax checkbox is selected
async function verifyTaxDetailSectionAppears(chartofaccountPage) {
    await chartofaccountPage.checkTaxCheckbox();
    const taxDetailVisible = await chartofaccountPage.isTaxDetailSectionVisible();
    expect(taxDetailVisible).toBeTruthy();
}
// Verifies required field errors in Tax Detail section
async function verifyTaxDetailRequiredFieldErrors(chartofaccountPage) {
    await chartofaccountPage.clickSave();
    const errors = await chartofaccountPage.getTaxDetailRequiredFieldErrors();
    const requiredFields = ['taxName', 'tdsType'];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText(/This field is required\./);
    }
}

async function fillTaxDetails(chartofaccountPage,data) {
    await chartofaccountPage.checkTaxCheckbox();
    await chartofaccountPage.fillTaxDetails(data);
    await chartofaccountPage.clickSave();
}
// Fills Chart of Account and Tax Detail form fields with sample values using the page object method
async function fillChartOfAccount(chartofaccountPage,data, errormessagr) {
    await chartofaccountPage.fillChartOfAccount(data);
    await chartofaccountPage.fillopeningbalance(data);
    if(data.tax){
        await chartofaccountPage.checkTaxCheckbox();
        await chartofaccountPage.fillTaxDetails(data);
    }
    await chartofaccountPage.clickSave();
}
// Verifies that duplicate Account number is not allowed
async function verifymessage(chartofaccountPage, message) {
    const warning = await chartofaccountPage.getAddChildWarningMessage();
    expect(warning).toContain(message); // Adjust message as per actual warning
}

// Navigates to Payroll Setup > Taxes and verifies a tax name exists
async function verifyTaxDetailInPayrollSetup(chartofaccountPage, data) {
    await chartofaccountPage.navigateToPayrollSetupTaxes();
    await chartofaccountPage.verifyTaxInPayrollSetup(data);
    await chartofaccountPage.waitForTimeout(2000);
}
// Verifies that the created account appears in the grid under parent or as root
async function verifyAccountInGrid(chartofaccountPage, data) {
    await chartofaccountPage.verifyAccountInGrid(data);
}
// Deletes a Ledger Group with children and verifies the error dialog
async function deleteLedgerGroupWithChildren(chartofaccountPage, accountName) {
    
    await chartofaccountPage.deleteconfirmation();
    await chartofaccountPage.clickdeleteforaccountName(accountName);
}


module.exports = {
    navigateToAccountsAndChartOfAccount,
    openChartOfAccountCreation,
    verifyRequiredFieldErrors
    ,addChildAccountAndVerifyParent
    ,expandAllRows
    ,verifyOpeningBalanceVisibilityForLedgerGroupVsLedgerItem
    ,verifyAddChildWarningForLedgerItem
    ,verifyTaxDetailSectionAppears
    ,verifyTaxDetailRequiredFieldErrors,
    verifymessage,
    fillTaxDetails,
    fillChartOfAccount,
    verifyTaxDetailInPayrollSetup,
    verifyAccountInGrid,
    deleteLedgerGroupWithChildren
};


