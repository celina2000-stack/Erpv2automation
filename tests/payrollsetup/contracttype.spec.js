const { test, expect } = require('@playwright/test');
const ContracttypePage = require('../../pages/payrollsetup/ContracttypePage');
const contracttypeData = require('../../fixtures/payrollsetup/ContracttypeData.json');
const { navigateToContracttype,
    openCreateNewcontracttype,
    clickSave,
    verifyRequiredFieldErrors,
    fillcontracttypeForm,
    verifydialogerror,
    verifymessage,
    verifycontracttypeTableRow } = require('../../utils/payrollsetup/ContracttypeHelper');
    const LoginPage = require('../../pages/common/LoginPage');
    const loginData = require('../../fixtures/loginData.json');
    const { performLogin } = require('../../utils/loginHelper');
    const SortPage = require('../../pages/common/SortingPage');
    const { verifySortColumn, verifySortForAllColumns } = require('../../utils/sortingHelper');
    const SearchPage = require('../../pages/common/SearchPage');
    const { verifySearch, verifyinvalidsearch } = require('../../utils/searchHelper');
    test.use({
      ignoreHTTPSErrors: true,   // ✅ Allow navigation to sites with invalid SSL
    });
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await page.goto('https://exolutusv2.exoerp.com');
        await performLogin(loginPage, loginData.admin);
    });
    
    
    test('Contract types: required field validation on empty save', async ({ page }) => {
        const contracttypepage = new ContracttypePage(page);
        await navigateToContracttype(contracttypepage);
        await openCreateNewcontracttype(contracttypepage);
        await clickSave(contracttypepage);
        await verifyRequiredFieldErrors(contracttypepage, expect);
    });
    test('Contract types: duplicate entry validation', async ({ page }) => {
        const contracttypepage = new ContracttypePage(page);
        await navigateToContracttype(contracttypepage);
        await openCreateNewcontracttype(contracttypepage);
        // Fill form with duplicate data using helper and data file
        await fillcontracttypeForm(contracttypepage, contracttypeData.duplicatecontracttype);
        await clickSave(contracttypepage);
        await verifydialogerror(contracttypepage, 'This contract type already exists');
       
    });
    test('contracttypes: Save and verify new job position in table', async ({ page }) => {
        const contracttypepage = new ContracttypePage(page);
        await navigateToContracttype(contracttypepage);
        await openCreateNewcontracttype(contracttypepage);
        // Fill form with duplicate data using helper and data file
        await fillcontracttypeForm(contracttypepage, contracttypeData.newcontracttype);
        await clickSave(contracttypepage);
        await page.waitForTimeout(2000); // Wait for save to complete
        await verifymessage(contracttypepage, 'Saved successfully.');
        await verifycontracttypeTableRow(contracttypepage, contracttypeData.newcontracttype);
    });
    
    test('Contract Type search functionality', async ({ page }) => {
        const contracttypepage = new ContracttypePage(page);
        await navigateToContracttype(contracttypepage);
        await page.waitForTimeout(2000);
        const searchValue = contracttypeData.searchitem.value;
        await verifySearch(
            page,
            '#ServiceAssignmentContractTypesTableFilter',
            '#GetServiceAssignmentContractTypesButton',
            searchValue
        );
        
    });

    test.only('Contract Type invalid search', async ({ page }) => {
        const contracttypepage = new ContracttypePage(page);
        await navigateToContracttype(contracttypepage);
        await page.waitForTimeout(2000);
        const searchValue = contracttypeData.searchitem.invalid;
        await verifyinvalidsearch (
            page,
            '#ServiceAssignmentContractTypesTableFilter',
            '#GetServiceAssignmentContractTypesButton',
            searchValue
        );
        
    });
    test.only('Verify sorting for all columns in contract type module', async ({ page }) => {
        const sortPage = new SortPage(page);
        const contracttypepage = new ContracttypePage(page);
        await navigateToContracttype(contracttypepage);
        await page.waitForTimeout(2000);
        await verifySortForAllColumns(sortPage);
    });





