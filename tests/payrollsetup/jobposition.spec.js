const { test, expect } = require('@playwright/test');
const JobpositionPage = require('../../pages/payrollsetup/JobPositionPage');
const {
    navigateToJobPositions,
    openCreateNewJobPosition,
    clickSave,
    verifyRequiredFieldErrors,
    fillJobPositionForm,
    verifydialogerror,
    verifymessage,
    verifyJobPositionTableRow
} = require('../../utils/payrollsetup/JobpositionHelper');
const LoginPage = require('../../pages/common/LoginPage');
const loginData = require('../../fixtures/loginData.json');
const { performLogin } = require('../../utils/loginHelper');
const jobPositionData = require('../../fixtures/payrollsetup/JobpositionData.json');
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


test('Job Position: required field validation on empty save', async ({ page }) => {
    const jobpositionPage = new JobpositionPage(page);
    await navigateToJobPositions(jobpositionPage);
    await openCreateNewJobPosition(jobpositionPage);
    await clickSave(jobpositionPage);
    await verifyRequiredFieldErrors(jobpositionPage, expect);
});

test('Job Position: duplicate entry validation', async ({ page }) => {
    const jobpositionPage = new JobpositionPage(page);
    await navigateToJobPositions(jobpositionPage);
    await openCreateNewJobPosition(jobpositionPage);
    // Fill form with duplicate data using helper and data file
    await fillJobPositionForm(jobpositionPage, jobPositionData.duplicatejobposition);
    await clickSave(jobpositionPage);
    await verifydialogerror(jobpositionPage, 'This Job position already exists');
   
});

test('Job Position: Save and verify new job position in table', async ({ page }) => {
    const jobpositionPage = new JobpositionPage(page);
    await navigateToJobPositions(jobpositionPage);
    await openCreateNewJobPosition(jobpositionPage);
    await fillJobPositionForm(jobpositionPage, jobPositionData.n);
    await clickSave(jobpositionPage);
    await page.waitForTimeout(2000); // Wait for save to complete
    await verifymessage(jobpositionPage, 'Saved successfully.');
    await verifyJobPositionTableRow(jobpositionPage, jobPositionData.newjobposition);
});

test.only('Job position search functionality by job position name', async ({ page }) => {
    const jobpositionPage = new JobpositionPage(page);
    await navigateToJobPositions(jobpositionPage);
    await page.waitForTimeout(2000);
    const searchValue = jobPositionData.searchitem.jobpositionname;
    await verifySearch(
        page,
        '#JobPositionsTableFilter',
        '#GetJobPositionsButton',
        searchValue
    );
    
});
test.only('Job position search functionality by order Number', async ({ page }) => {
    const jobpositionPage = new JobpositionPage(page);
    await navigateToJobPositions(jobpositionPage);
    await page.waitForTimeout(2000);
    const searchValue = jobPositionData.searchitem.orderno;
    await verifySearch(
        page,
        '#JobPositionsTableFilter',
        '#GetJobPositionsButton',
        searchValue
    );
    
});
test.only('Job position search functionality by status', async ({ page }) => {
    const jobpositionPage = new JobpositionPage(page);
    await navigateToJobPositions(jobpositionPage);
    await page.waitForTimeout(2000);
    const searchValue = jobPositionData.searchitem.status;
    await verifySearch(
        page,
        '#JobPositionsTableFilter',
        '#GetJobPositionsButton',
        searchValue
    );
    
});
test.only('Job position invalid search', async ({ page }) => {
    const jobpositionPage = new JobpositionPage(page);
    await navigateToJobPositions(jobpositionPage);
    await page.waitForTimeout(2000);
    const searchValue = jobPositionData.searchitem.invalid;
    await verifyinvalidsearch(
        page,
        '#JobPositionsTableFilter',
        '#GetJobPositionsButton',
        searchValue
    );
    
});
test.only('Verify sorting for all columns in job position module', async ({ page }) => {
    const sortPage = new SortPage(page);
    const jobpositionPage = new JobpositionPage(page);
    await navigateToJobPositions(jobpositionPage);
    await page.waitForTimeout(2000);
    await verifySortForAllColumns(sortPage);
});
 