const { test, expect } = require('@playwright/test');
const TaxesPage = require('../../pages/payrollsetup/TaxesPage');
const {
    navigateToTaxes,
    openCreateNewtax,
    clickSave,
    verifyRequiredFieldErrors,
    filltaxForm,
    verifydialogerror,
    verifymessage,
    addMultipletaxrate,
    verifytaxTableRow
} = require('../../utils/payrollsetup/TaxesHelper');
const taxData = require('../../fixtures/payrollsetup/TaxesData.json');
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


test('Taxes: required field validation on empty save', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await openCreateNewtax(taxPage);
    await clickSave(taxPage);
    await verifyRequiredFieldErrors(taxPage, expect);
});
test('Taxes: duplicate entry validation', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await openCreateNewtax(taxPage);
    // Fill form with duplicate data using helper and data file
    await filltaxForm(taxPage, taxData.duplicatetax);
    await clickSave(taxPage);
    await verifydialogerror(taxPage, 'Tax Detail already exists!');
   
});

test('Taxes: Verify that invalid rate values are not accepted in the tax rate grid', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await openCreateNewtax(taxPage);
    // Fill form with duplicate data using helper and data file
    await filltaxForm(taxPage, taxData.invalidrate);
    await taxPage.clickaddtaxrate();
    await taxPage.fillinvalidrate(taxData.invalidrate.taxrate[0])
    await taxPage.clickgridsave();
    await verifydialogerror(taxPage, 'Rate is required and must be greater than 0');
   
});

test('Taxes: Verify that system gives warning message when rate is "0', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await openCreateNewtax(taxPage);
    // Fill form with duplicate data using helper and data file
    await filltaxForm(taxPage, taxData.ratezero);
    await taxPage.clickaddtaxrate();
    await taxPage.fillinvalidrate(taxData.ratezero.taxrate[0])
    await taxPage.clickgridsave();
    await verifydialogerror(taxPage, 'Rate cannot be 0.');
   
});
test('Taxes: Verify that system gives warning message when rate is greater than "39', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await openCreateNewtax(taxPage);
    // Fill form with duplicate data using helper and data file
    await filltaxForm(taxPage, taxData.rategreater39);
    await taxPage.clickaddtaxrate();
    await taxPage.fillinvalidrate(taxData.rategreater39.taxrate[0])
    await taxPage.clickgridsave();
    await verifydialogerror(taxPage, "Rate can't be more than 39%.");
   
});
test('Taxes: Verify that lower limit cannot be greater than upper limit in the tax rate grid', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await openCreateNewtax(taxPage);
    // Fill form with duplicate data using helper and data file
    await filltaxForm(taxPage, taxData.lowerlimitgreater);
    await taxPage.clickaddtaxrate();
    await taxPage.fillinvalidlimit(taxData.lowerlimitgreater.taxrate[0])
    await taxPage.clickgridsave();
    await verifydialogerror(taxPage, 'Upper Limit should be more than lower limit!');
   
});

test('Taxes: Verify that startdate must be greater than end date in tax rate grid', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await openCreateNewtax(taxPage);
    // Fill form with duplicate data using helper and data file
    await filltaxForm(taxPage, taxData.startdateafter);
    await taxPage.clickaddtaxrate();
    await taxPage.fillinvaliddate(taxData.startdateafter.taxrate[0])
    await taxPage.clickgridsave();
    await verifydialogerror(taxPage, 'StartDate cannot be greater than endDate!');
   
});
test('Verify multiple rows can be added in tax rate grid', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await openCreateNewtax(taxPage);
    // Fill form with duplicate data using helper and data file
    await filltaxForm(taxPage, taxData.multipletaxrate);
    await addMultipletaxrate(taxPage, taxData.multipletaxrate.taxrate );
    await page.waitForTimeout(5000);    

});

test('Taxes: Save and verify new Tax in table', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await openCreateNewtax(taxPage);
    // Fill form with duplicate data using helper and data file
    await filltaxForm(taxPage, taxData.newtax);
    await addMultipletaxrate(taxPage, taxData.newtax.taxrate );
    await clickSave(taxPage);
    await page.waitForTimeout(1000); // Wait for save to complete
    await verifymessage(taxPage, 'Saved Successfully');
    await verifytaxTableRow(taxPage, taxData.newtax);
});

test.only('Tax search functionality by tax name', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await page.waitForTimeout(2000);
    const searchValue = taxData.searchitem.taxname;
    await verifySearch(
        page,
        '#TaxesTableFilter',
        '#GetTaxesButton',
        searchValue
    );
});
test.only('Tax search functionality by display name', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await page.waitForTimeout(2000);
    const searchValue = taxData.searchitem.displayname;
    await verifySearch(
        page,
        '#TaxesTableFilter',
        '#GetTaxesButton',
        searchValue
    );
});
test.only('Tax search functionality by glaccount', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await page.waitForTimeout(2000);
    const searchValue = taxData.searchitem.glaccount;
    await verifySearch(
        page,
        '#TaxesTableFilter',
        '#GetTaxesButton',
        searchValue
    );
});
test.only('Tax search functionality by Tds type', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await page.waitForTimeout(2000);
    const searchValue = taxData.searchitem.tdstype;
    await verifySearch(
        page,
        '#TaxesTableFilter',
        '#GetTaxesButton',
        searchValue
    );
});
test.only('Tax search functionality by Marital status', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await page.waitForTimeout(2000);
    const searchValue = taxData.searchitem.maritalstatus;
    await verifySearch(
        page,
        '#TaxesTableFilter',
        '#GetTaxesButton',
        searchValue
    );
});
test.only('Tax invalid search', async ({ page }) => {
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await page.waitForTimeout(2000);
    const searchValue = taxData.searchitem.invalid;
    await verifyinvalidsearch(
        page,
        '#TaxesTableFilter',
        '#GetTaxesButton',
        searchValue
    ); 
});
test.only('Verify sorting for all columns in Tax module', async ({ page }) => {
    const sortPage = new SortPage(page);
    const taxPage = new TaxesPage(page);
    await navigateToTaxes(taxPage);
    await page.waitForTimeout(2000);
    await verifySortForAllColumns(sortPage);    
});
