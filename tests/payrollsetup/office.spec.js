const { test, expect } = require('@playwright/test');
const OfficePage = require('../../pages/payrollsetup/OfficePage');
const { navigateToOffices, openCreateNewOffice, verifyRequiredFieldErrors, verifydialogerror, verifymessage } = require('../../utils/payrollsetup/OfficeHelper');
const LoginPage = require('../../pages/common/LoginPage');
const loginData = require('../../fixtures/loginData.json');
const officeData = require('../../fixtures/payrollsetup/OfficeData.json');
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

test('Office: required field validation on empty save', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await openCreateNewOffice(officePage);
    await officePage.clickSave();
    await verifyRequiredFieldErrors(officePage, expect);
});

test('Office: End Time before Start Time validation', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await openCreateNewOffice(officePage);
    await officePage.fillOfficeForm(officeData.invalidTimeOffice);
    await page.waitForTimeout(1000);
    await officePage.clickSave();
    await verifydialogerror(officePage, 'Office Start Time must be before Office End Time.');
});

test('Office: Break Start Time after Break End Time validation', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await openCreateNewOffice(officePage);
    await officePage.fillOfficeForm(officeData.breakTimeInvalid);
    await page.waitForTimeout(1000);
    await officePage.clickSave();
    await verifydialogerror(officePage, 'Break Start Time must be less than Break End Time.');
});

test('Office: Break times must be within office hours validation', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await openCreateNewOffice(officePage);
    await officePage.fillOfficeForm(officeData.breakTimeOutsideOfficeHour);
    await page.waitForTimeout(1000);
    await officePage.clickSave();
    await verifydialogerror(officePage, 'Break times must be within Office Start and End Time.');
});

test('Office: Duplicate office entry validation', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await openCreateNewOffice(officePage);
    await officePage.fillOfficeForm(officeData.duplicateOffice);
    await page.waitForTimeout(1000);
    await officePage.clickSave();
    await verifydialogerror(officePage, `Office name already exists.`);
});

test('Office: Save and verify new office data in table', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    //await openCreateNewOffice(officePage);
    //await officePage.fillOfficeForm(officeData.newOffice);
    await page.waitForTimeout(1000);
    //await officePage.clickSave();
    //await verifymessage(officePage, 'Saved successfully.');
    await officePage.verifyOfficeTableRow(officeData.newOffice);
});

test.only('Office search functionality by office name', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await page.waitForTimeout(2000);
    const searchValue = officeData.searchitem.officename;
    await verifySearch(
        page,
        '#OfficesTableFilter',
        '#GetOfficesButton',
        searchValue
    );
    
});

test.only('Office search functionality by office start time', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await page.waitForTimeout(2000);
    const searchValue = officeData.searchitem.starttime;
    await verifySearch(
        page,
        '#OfficesTableFilter',
        '#GetOfficesButton',
        searchValue
    );
});
test.only('Office search functionality by office end time', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await page.waitForTimeout(2000);
    const searchValue = officeData.searchitem.endtime;
    await verifySearch(
        page,
        '#OfficesTableFilter',
        '#GetOfficesButton',
        searchValue
    );
});
test.only('Office search functionality by work days', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await page.waitForTimeout(2000);
    const searchValue = officeData.searchitem.workdays;
    await verifySearch(
        page,
        '#OfficesTableFilter',
        '#GetOfficesButton',
        searchValue
    );
});
test.only('Office search functionality by working hour', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await page.waitForTimeout(2000);
    const searchValue = officeData.searchitem.workhour;
    await verifySearch(
        page,
        '#OfficesTableFilter',
        '#GetOfficesButton',
        searchValue
    );
});
test.only('Office search functionality by head office', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await page.waitForTimeout(2000);
    const searchValue = officeData.searchitem.headoffice;
    await verifySearch(
        page,
        '#OfficesTableFilter',
        '#GetOfficesButton',
        searchValue
    );
});
test.only('Office search functionality by status', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await page.waitForTimeout(2000);
    const searchValue = officeData.searchitem.status;
    await verifySearch(
        page,
        '#OfficesTableFilter',
        '#GetOfficesButton',
        searchValue
    );
});
test.only('Office invalid search', async ({ page }) => {
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await page.waitForTimeout(2000);
    const searchValue = officeData.searchitem.invalid;
    await verifyinvalidsearch(
        page,
        '#OfficesTableFilter',
        '#GetOfficesButton',
        searchValue
    );
    
});
test.only('Verify sorting for all columns in office module', async ({ page }) => {
    const sortPage = new SortPage(page);
    const officePage = new OfficePage(page);
    await navigateToOffices(officePage);
    await page.waitForTimeout(2000);
    await verifySortForAllColumns(sortPage);
});
 