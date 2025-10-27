const { test, expect } = require('@playwright/test');
const BanksPage = require('../../pages/payrollsetup/BanksPage');
const {
    navigateToBanks,
    openCreateNewbank,
    clickSave,
    verifyRequiredFieldErrors,
    fillbankForm,
    verifydialogerror,
    verifymessage,
    verifybankTableRow
} = require('../../utils/payrollsetup/BanksHelper');
const bankData = require('../../fixtures/payrollsetup/BanksData.json');
const LoginPage = require('../../pages/common/LoginPage');
const loginData = require('../../fixtures/loginData.json');
const { performLogin } = require('../../utils/loginHelper');
const { verifySearch, verifyinvalidsearch } = require('../../utils/searchHelper');
const SortPage = require('../../pages/common/SortingPage');
const { verifySortColumn, verifySortForAllColumns } = require('../../utils/sortingHelper');
// Test: Validation messages appear when saving empty Create New Office form
test.use({
  ignoreHTTPSErrors: true,   // ✅ Allow navigation to sites with invalid SSL
});
test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await page.goto('https://exolutusv2.exoerp.com');
    await performLogin(loginPage, loginData.admin);
});


test('Banks: required field validation on empty save', async ({ page }) => {
    const BankPage = new BanksPage(page);
    await navigateToBanks(BankPage);
    await openCreateNewbank(BankPage);
    await clickSave(BankPage);
    await verifyRequiredFieldErrors(BankPage, expect);
});
test('Banks: duplicate entry validation', async ({ page }) => {
    const BankPage = new BanksPage(page);
    await navigateToBanks(BankPage);
    await openCreateNewbank(BankPage);
    // Fill form with duplicate data using helper and data file
    await fillbankForm(BankPage, bankData.duplicatebank);
    await clickSave(BankPage);
    await verifydialogerror(BankPage, 'A bank with this name already exists.');
   
});
test('Banks: Save and verify new job position in table', async ({ page }) => {
    const BankPage = new BanksPage(page);
    await navigateToBanks(BankPage);
    await openCreateNewbank(BankPage);
    // Fill form with duplicate data using helper and data file
    await fillbankForm(BankPage, bankData.newbank);
    await clickSave(BankPage);
    await page.waitForTimeout(2000); // Wait for save to complete
    await verifymessage(BankPage, 'Saved successfully.');
    await verifybankTableRow(BankPage, bankData.newbank);
});

test.only('Bank search functionality by bank name', async ({ page }) => {
    const BankPage = new BanksPage(page);
    await navigateToBanks(BankPage);
    await page.waitForTimeout(2000);
    const searchValue = bankData.searchitem.bankname;
    await verifySearch(
        page,
        '#BanksTableFilter',
        '#GetBanksButton',
        searchValue
    );
    
});
test.only('Bank search functionality by glaccount', async ({ page }) => {
    const BankPage = new BanksPage(page);
    await navigateToBanks(BankPage);
    await page.waitForTimeout(2000);
    const searchValue = bankData.searchitem.glaccount;
    await verifySearch(
        page,
        '#BanksTableFilter',
        '#GetBanksButton',
        searchValue
    );
    
});
test.only('Bank search functionality by status', async ({ page }) => {
    const BankPage = new BanksPage(page);
    await navigateToBanks(BankPage);
    await page.waitForTimeout(2000);
    const searchValue = bankData.searchitem.status;
    await verifySearch(
        page,
        '#BanksTableFilter',
        '#GetBanksButton',
        searchValue
    );
    
});
test.only('Bank invalid search', async ({ page }) => {
    const BankPage = new BanksPage(page);
    await navigateToBanks(BankPage);
    await page.waitForTimeout(2000);
    const searchValue = bankData.searchitem.invalid;
    await verifyinvalidsearch(
        page,
        '#BanksTableFilter',
        '#GetBanksButton',
        searchValue
    );
    
});
test.only('Verify sorting for all columns in Bank module', async ({ page }) => {
    const sortPage = new SortPage(page);
    const BankPage = new BanksPage(page);
    await navigateToBanks(BankPage);
    await page.waitForTimeout(2000);
    await verifySortForAllColumns(sortPage);
});
