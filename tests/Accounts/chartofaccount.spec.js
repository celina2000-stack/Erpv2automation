const { test, expect } = require('@playwright/test');
const { navigateToAccountsAndChartOfAccount, openChartOfAccountCreation, 
        verifyRequiredFieldErrors, addChildAccountAndVerifyParent,
        verifyOpeningBalanceVisibilityForLedgerGroupVsLedgerItem, 
        verifyAddChildWarningForLedgerItem, verifyTaxDetailSectionAppears,
        verifyTaxDetailRequiredFieldErrors,verifymessage, fillTaxDetails, fillChartOfAccount,
        verifyTaxDetailInPayrollSetup, verifyAccountInGrid,
        deleteLedgerGroupWithChildren, verifyDuplicateAccountNumberNotAllowed } = require('../../utils/Accounts/ChartofaccountHelper');
const ChartofaccountPage = require('../../pages/Accounts/ChartofaccountPage');
const chartofaccountData = require('../../fixtures/Accounts/ChartofaccountData.json');
const LoginPage = require('../../pages/common/LoginPage');
const loginData = require('../../fixtures/loginData.json');
const { performLogin } = require('../../utils/loginHelper');
test.use({
  ignoreHTTPSErrors: true,   // ✅ Allow navigation to sites with invalid SSL
});
test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await page.goto('https://exolutusv2.exoerp.com');
    await performLogin(loginPage, loginData.admin);
  });

test('Chart of Account required field validation errors', async ({ page }) => {
    const chartofaccountPage = new ChartofaccountPage(page);
    await navigateToAccountsAndChartOfAccount(chartofaccountPage);
    await openChartOfAccountCreation(chartofaccountPage);
    await chartofaccountPage.clickSave();
    await verifyRequiredFieldErrors(chartofaccountPage);
});

test('Chart of Account: clicking "+" for Ledger Group opens child form with correct parent', async ({ page }) => {
    const chartofaccountPage = new ChartofaccountPage(page);
    await navigateToAccountsAndChartOfAccount(chartofaccountPage);
    // Expand all rows if needed (optional, add if required)
    await chartofaccountPage.expandAllRows();
    await addChildAccountAndVerifyParent(chartofaccountPage, chartofaccountData.ledgerGroupAccountName);
});


test('Chart of Account: Opening Balance visibility for Ledger Group vs Ledger Item', async ({ page }) => {
    const chartofaccountPage = new ChartofaccountPage(page);
    await navigateToAccountsAndChartOfAccount(chartofaccountPage);
    // Expand all rows if needed (optional, add if required)
    await chartofaccountPage.expandAllRows();
    await addChildAccountAndVerifyParent(chartofaccountPage, chartofaccountData.ledgerGroupAccountName);
    await verifyOpeningBalanceVisibilityForLedgerGroupVsLedgerItem(chartofaccountPage);
});


test('Chart of Account: clicking "+" for Ledger Item shows warning', async ({ page }) => {
    const chartofaccountPage = new ChartofaccountPage(page);
    await navigateToAccountsAndChartOfAccount(chartofaccountPage);
    await chartofaccountPage.expandAllRows();
    await verifyAddChildWarningForLedgerItem(chartofaccountPage,'Land');
    await verifymessage(chartofaccountPage, 'Cannot add a child account to a LedgerItem-type GL Account.')
});
test('Chart of Account: Tax Detail section appears when Tax checkbox is selected', async ({ page }) => {
    const chartofaccountPage = new ChartofaccountPage(page);
    await navigateToAccountsAndChartOfAccount(chartofaccountPage);
    // Expand all rows if needed (optional, add if required)
    await chartofaccountPage.expandAllRows();
    await addChildAccountAndVerifyParent(chartofaccountPage, chartofaccountData.ledgerGroupAccountName);
    await verifyOpeningBalanceVisibilityForLedgerGroupVsLedgerItem(chartofaccountPage);
    await verifyTaxDetailSectionAppears(chartofaccountPage);
});
test('Chart of Account: required field validation errors in Tax Detail section', async ({ page }) => {
    const chartofaccountPage = new ChartofaccountPage(page);
    await navigateToAccountsAndChartOfAccount(chartofaccountPage);
    await openChartOfAccountCreation(chartofaccountPage);
    await chartofaccountPage.selectGLAccountUseTypeLedgerItem();
    await chartofaccountPage.checkTaxCheckbox();
    await verifyTaxDetailRequiredFieldErrors(chartofaccountPage);
});
test('Verify filled Tax Detail is displayed correctly in Tax under Payroll Setup.', async ({ page }) => {
     const chartofaccountPage = new ChartofaccountPage(page);
     await navigateToAccountsAndChartOfAccount(chartofaccountPage);
     await chartofaccountPage.expandAllRows();
     await chartofaccountPage.clickEditforaccountName(chartofaccountData.ledgeritemAccountName);
     await fillTaxDetails(chartofaccountPage, chartofaccountData.coatax);
     await verifymessage(chartofaccountPage, "Saved successfully")
    // Now verify the tax detail appears in Payroll Setup > Taxes using chartofaccountPage and helper
    await verifyTaxDetailInPayrollSetup(chartofaccountPage, chartofaccountData.coatax);
});
test('Create new account is created successfully', async ({ page }) => {
    const chartofaccountPage = new ChartofaccountPage(page);
    await navigateToAccountsAndChartOfAccount(chartofaccountPage);
    await chartofaccountPage.expandAllRows();
    if(chartofaccountData.coa.parent){
        await addChildAccountAndVerifyParent(chartofaccountPage, chartofaccountData.coa.parent);
    }else{
        await openChartOfAccountCreation(chartofaccountPage);
    }
    
    await fillChartOfAccount(chartofaccountPage,chartofaccountData.coa);
    await verifymessage(chartofaccountPage,"Saved successfully")
    await page.waitForTimeout(2000);
    // Verify the account appears in the grid under parent or as root
    await page.reload();
    await page.waitForTimeout(3000);
    await chartofaccountPage.expandAllRows();
    await verifyAccountInGrid(chartofaccountPage, chartofaccountData.coa);
});

test('Verify deleting a Ledger Group with children is restricted or shows a warning.', async ({ page }) => {
    const chartofaccountPage = new ChartofaccountPage(page);
    await navigateToAccountsAndChartOfAccount(chartofaccountPage);
    await chartofaccountPage.expandAllRows();

    await deleteLedgerGroupWithChildren(chartofaccountPage, chartofaccountData.ledgerGroupAccountName);
    await chartofaccountPage.verifydeletionerror();
});

test.only('Verify that duplicate Account number are not allowed', async ({ page }) => {
   const chartofaccountPage = new ChartofaccountPage(page);
    await navigateToAccountsAndChartOfAccount(chartofaccountPage);
    await chartofaccountPage.expandAllRows();
    if(chartofaccountData.coa.parent){
        await addChildAccountAndVerifyParent(chartofaccountPage, chartofaccountData.coa.parent);
    }else{
        await openChartOfAccountCreation(chartofaccountPage);
    }
    
    await fillChartOfAccount(chartofaccountPage,chartofaccountData.duplicateaccountnum);
    await verifymessage(chartofaccountPage, 'Account number already exists');
    
});





