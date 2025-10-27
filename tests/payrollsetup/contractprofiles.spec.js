const { test, expect } = require('@playwright/test');
const ContractprofilesPage = require('../../pages/payrollsetup/ContractprofilesPage');
const {
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
} = require('../../utils/payrollsetup/ContractprofilesHelper');
const LoginPage = require('../../pages/common/LoginPage');
const loginData = require('../../fixtures/loginData.json');
const { performLogin } = require('../../utils/loginHelper');
const contractprofilesData = require('../../fixtures/payrollsetup/contractprofilesData.json');
const { verifySearch, verifyinvalidsearch } = require('../../utils/searchHelper');
const SortPage = require('../../pages/common/SortingPage');
    const { verifySortColumn, verifySortForAllColumns } = require('../../utils/sortingHelper');

test.use({
  ignoreHTTPSErrors: true,
});
test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await page.goto('https://exolutusv2.exoerp.com');
    await performLogin(loginPage, loginData.admin);
});

test('Contract Profile: required field validation on empty save', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await openCreateNewContractProfile(contractprofilesPage);
    await clickSave(contractprofilesPage);
    await verifyRequiredFieldErrors(contractprofilesPage, expect);
});

test('Contract Profile: required field validation in Benefits grid on empty save', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await openCreateNewContractProfile(contractprofilesPage);
    await clickAddPaymentItems(contractprofilesPage);
    await clickGridSave(contractprofilesPage);
    await verifyGridRequiredFieldErrors(contractprofilesPage, expect);
});

test('Contract Profile: duplicate Payment Item validation in Benefits grid', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await openCreateNewContractProfile(contractprofilesPage);
    await contractprofilesPage.fillContractProfileForm(contractprofilesData.duplicatePaymentItems);
    await addMultiplePaymentItems(contractprofilesPage, contractprofilesData.duplicatePaymentItems.benefits);
    await verifymessage(contractprofilesPage, 'This PaymentItem is already saved!');
});

test('Contract Profile: required field validation in Deductions grid on empty save', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await openCreateNewContractProfile(contractprofilesPage);
    await clickDeductionsTab(contractprofilesPage);
    await clickAddPaymentItems(contractprofilesPage);
    await clickGridSave(contractprofilesPage);
    await verifyGridRequiredFieldErrors(contractprofilesPage, expect);
});

test('Contract Profile: duplicate Payment Item validation in Deductions grid', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await openCreateNewContractProfile(contractprofilesPage);
    await contractprofilesPage.fillContractProfileForm(contractprofilesData.duplicateDeductionItems);
    await addMultiplePaymentItems(contractprofilesPage, contractprofilesData.duplicateDeductionItems.benefits);
    await clickDeductionsTab(contractprofilesPage);
    await addMultiplePaymentItems(contractprofilesPage, contractprofilesData.duplicateDeductionItems.deductions);
    await verifymessage(contractprofilesPage, 'This PaymentItem is already saved!');
});

test('Contract Profile: add valid payment items in Benefits and Deductions grids', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await openCreateNewContractProfile(contractprofilesPage);
    await contractprofilesPage.fillContractProfileForm(contractprofilesData.validPaymentItems);
    await addMultiplePaymentItems(contractprofilesPage, contractprofilesData.validPaymentItems.benefits);
    await clickDeductionsTab(contractprofilesPage);
    await addMultiplePaymentItems(contractprofilesPage, contractprofilesData.validPaymentItems.deductions);
    await verifyPaymentItemsInGrid(contractprofilesPage, contractprofilesData.validPaymentItems, expect);
});

test('Contract Profile: verify Basic Salary requirement for other payment items', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await openCreateNewContractProfile(contractprofilesPage);
    await contractprofilesPage.fillContractProfileForm(contractprofilesData.invalidPaymentItemsWithoutBasic);
    await addMultiplePaymentItems(contractprofilesPage, contractprofilesData.invalidPaymentItemsWithoutBasic.benefits);
    await verifymessage(contractprofilesPage, 'Please save a basic PaymentItem first!');
});

test('Contract Profile: verify system prevents duplicate contract profile', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await openCreateNewContractProfile(contractprofilesPage);
    await contractprofilesPage.fillContractProfileForm(contractprofilesData.duplicateContractProfile);
    await addMultiplePaymentItems(contractprofilesPage, contractprofilesData.duplicateContractProfile.benefits);
    await verifymessage(contractprofilesPage, 'This Contract Profile Name already exists!');
});

test('Contract Profile: verify form opens and can be saved with valid data', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await openCreateNewContractProfile(contractprofilesPage);
    await contractprofilesPage.fillContractProfileForm(contractprofilesData.validContractProfile);
    await addMultiplePaymentItems(contractprofilesPage, contractprofilesData.validContractProfile.benefits);
    await contractprofilesPage.clickSave();
    await verifyContractProfileInTable(contractprofilesPage, contractprofilesData.validContractProfile, expect);
});

test('Contract Profile: verify form cannot be saved without saving grid first', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await openCreateNewContractProfile(contractprofilesPage);
    await testUnsavedGridScenario(contractprofilesPage, contractprofilesData.unsavedGridData);
    await verifymessage(contractprofilesPage, 'Please Save the row before proceeding!');
});

test('Contract Profile: verify cancelled form does not appear in table', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await openCreateNewContractProfile(contractprofilesPage);
    await testCancelledFormScenario(contractprofilesPage, contractprofilesData.cancelledFormData);
    await verifyContractProfileNotInTable(contractprofilesPage, contractprofilesData.cancelledFormData, expect);
});

test('contract profile search functionality', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await page.waitForTimeout(1000);
    const searchValue = contractprofilesData.searchitem.contractname;
    await verifySearch(
        page,
        '#ContractProfilesTableFilter',
        '#GetContractProfilesButton',
        searchValue
    );
    
});
test('contract profile invalid search', async ({ page }) => {
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await page.waitForTimeout(1000);
    const searchValue = contractprofilesData.searchitem.invalid;
    await verifyinvalidsearch(
        page,
        '#ContractProfilesTableFilter',
        '#GetContractProfilesButton',
        searchValue
    );
    
});
test.only('Verify sorting for all columns in contract profile module', async ({ page }) => {
    const sortPage = new SortPage(page);
    const contractprofilesPage = new ContractprofilesPage(page);
    await navigateToContractProfiles(contractprofilesPage);
    await page.waitForTimeout(2000);
    await verifySortForAllColumns(sortPage);
});
