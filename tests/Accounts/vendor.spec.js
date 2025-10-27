const { test, expect } = require('@playwright/test');
const VendorPage = require('../../pages/Accounts/VendorPage');
const { navigateToVendors, openCreateNewVendor, verifyAndSelectVendorType, 
    verifyAllVendorFormFieldsPresent, verifyAllConsultantFormFieldsPresent, 
    clickSaveButton, verifyVendorRequiredFieldErrors, verifyConsultantRequiredFieldErrors,
    verifyemailandphoneformat, fillVendorForm, verifydialogerror, verifymessage } = require('../../utils/Accounts/VendorHelper');
const LoginPage = require('../../pages/common/LoginPage');
const loginData = require('../../fixtures/loginData.json');
const { performLogin } = require('../../utils/loginHelper');
const vendorData = require('../../fixtures/Accounts/VendorData.json')
const { verifySearch, verifyinvalidsearch } = require('../../utils/searchHelper');
const SortPage = require('../../pages/common/SortingPage');
const { verifySortColumn, verifySortForAllColumns } = require('../../utils/sortingHelper');

test.use({
  ignoreHTTPSErrors: true,   // ✅ Allow navigation to sites with invalid SSL
});
test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await page.goto('https://exolutusv2.exoerp.com');
    await performLogin(loginPage, loginData.admin);
});

test('Verify form opens correctly when Create New Vendor is clicked and Vendor is selected as Vendor type', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await openCreateNewVendor(vendorPage);
    await verifyAndSelectVendorType(vendorPage, 'Vendor');
    await verifyAllVendorFormFieldsPresent(vendorPage);
});
test('Verify form opens correctly when Create New Vendor is clicked and Organization is selected as Vendor type', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await openCreateNewVendor(vendorPage);
    await verifyAndSelectVendorType(vendorPage, 'Organization');
    await verifyAllVendorFormFieldsPresent(vendorPage);
});
test('Verify form opens correctly when Create New Vendor is clicked and Consultant is selected as Vendor type', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await openCreateNewVendor(vendorPage);
    await verifyAndSelectVendorType(vendorPage, 'Consultant');
    await verifyAllConsultantFormFieldsPresent(vendorPage);
});
test('Required field validation errors appear for blank Vendor form', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await openCreateNewVendor(vendorPage);
    await verifyAndSelectVendorType(vendorPage, 'Vendor');
    await clickSaveButton(vendorPage);
    await verifyVendorRequiredFieldErrors(vendorPage);
});
test('Required field validation errors appear for blank Organization form', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await openCreateNewVendor(vendorPage);
    await verifyAndSelectVendorType(vendorPage, 'Vendor');
    await clickSaveButton(vendorPage);
    await verifyVendorRequiredFieldErrors(vendorPage);
});

test('Required field validation errors appear for blank Consultant form', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await openCreateNewVendor(vendorPage);
    await verifyAndSelectVendorType(vendorPage, 'Consultant');
    await clickSaveButton(vendorPage);
    await verifyConsultantRequiredFieldErrors(vendorPage);
});
test('Should not allow duplicate PAN number', async ({ page }) => {
    const vendorPage = new VendorPage(page);

    await navigateToVendors(vendorPage);
    await openCreateNewVendor(vendorPage);
    await verifyAndSelectVendorType(vendorPage, vendorData.duplicatepanno.vendorType);
    await fillVendorForm(vendorPage, vendorData.duplicatepanno);
    await page.waitForTimeout(5000);
    //await clickSaveButton(vendorPage);
    await verifydialogerror(vendorPage, 'PAN number already exists');   
    
});

test('Shows validation error for invalid email and phone number', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await openCreateNewVendor(vendorPage);
    await verifyAndSelectVendorType(vendorPage, vendorData.invalidemailandphone.vendorType);
    await fillVendorForm(vendorPage, vendorData.invalidemailandphone);
    await page.waitForTimeout(1000);
    //await clickSaveButton(vendorPage);
    await verifyemailandphoneformat(vendorPage); 
    
});
test('Verify all consultant table columns after save', async ({ page }) => {   
    const vendorPage = new VendorPage(page);     
    const Data = vendorData.organization;
    await navigateToVendors(vendorPage);
    await openCreateNewVendor(vendorPage);
    await verifyAndSelectVendorType(vendorPage, Data.vendorType);
    await fillVendorForm(vendorPage, Data);
    await clickSaveButton(vendorPage);
    await page.waitForTimeout(1000);
    await verifymessage(vendorPage, 'Saved successfully.');
    await page.waitForTimeout(3000);
    await vendorPage.verifyConsultantTableRow(Data);
});
test('Vendor search functionality by name', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await page.waitForTimeout(2000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await vendorPage.setShowEntriesTo25('//*[@id="VendorsTable_length"]/label/select');
    const searchValue = vendorData.searchitem.name;
    await verifySearch(
        page,
        '#VendorsTableFilter',
        '#GetVendorsButton',
        searchValue
    );
});
test('Vendor search functionality by PAN/VAT number', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await page.waitForTimeout(2000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await vendorPage.setShowEntriesTo25('//*[@id="VendorsTable_length"]/label/select');
    const searchValue = vendorData.searchitem.pan;
    await verifySearch(
        page,
        '#VendorsTableFilter',
        '#GetVendorsButton',
        searchValue
    );
});
test('Vendor search functionality by email', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await page.waitForTimeout(2000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await vendorPage.setShowEntriesTo25('//*[@id="VendorsTable_length"]/label/select');
    const searchValue = vendorData.searchitem.email;
    await verifySearch(
        page,
        '#VendorsTableFilter',
        '#GetVendorsButton',
        searchValue
    );
});
test('Vendor search functionality by phone number', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await page.waitForTimeout(2000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await vendorPage.setShowEntriesTo25('//*[@id="VendorsTable_length"]/label/select');
    const searchValue = vendorData.searchitem.phone;
    await verifySearch(
        page,
        '#VendorsTableFilter',
        '#GetVendorsButton',
        searchValue
    );
});
test('Vendor search functionality by address', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await page.waitForTimeout(2000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await vendorPage.setShowEntriesTo25('//*[@id="VendorsTable_length"]/label/select');
    const searchValue = vendorData.searchitem.address;
    await verifySearch(
        page,
        '#VendorsTableFilter',
        '#GetVendorsButton',
        searchValue
    );
});
test('Vendor search functionality by Bank', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await page.waitForTimeout(2000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await vendorPage.setShowEntriesTo25('//*[@id="VendorsTable_length"]/label/select');
    const searchValue = vendorData.searchitem.bank;
    await verifySearch(
        page,
        '#VendorsTableFilter',
        '#GetVendorsButton',
        searchValue
    );
});
test('Vendor search functionality by account number', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await page.waitForTimeout(2000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await vendorPage.setShowEntriesTo25('//*[@id="VendorsTable_length"]/label/select');
    const searchValue = vendorData.searchitem.accountNumber;
    await verifySearch(
        page,
        '#VendorsTableFilter',
        '#GetVendorsButton',
        searchValue
    );
});
test('Vendor search functionality by account holder name', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await page.waitForTimeout(2000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await vendorPage.setShowEntriesTo25('//*[@id="VendorsTable_length"]/label/select');
    const searchValue = vendorData.searchitem.accountHoldersName;
    await verifySearch(
        page,
        '#VendorsTableFilter',
        '#GetVendorsButton',
        searchValue
    );
});
test('Vendor search functionality by vendor type', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await page.waitForTimeout(2000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await vendorPage.setShowEntriesTo25('//*[@id="VendorsTable_length"]/label/select');
    const searchValue = vendorData.searchitem.vendortype;
    await verifySearch(
        page,
        '#VendorsTableFilter',
        '#GetVendorsButton',
        searchValue
    );
});
test('Vendor search functionality by status', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await page.waitForTimeout(2000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await vendorPage.setShowEntriesTo25('//*[@id="VendorsTable_length"]/label/select');
    const searchValue = vendorData.searchitem.status;
    await verifySearch(
        page,
        '#VendorsTableFilter',
        '#GetVendorsButton',
        searchValue
    );
});
test('Vendor invalid search', async ({ page }) => {
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await page.waitForTimeout(2000);
    const searchValue = vendorData.searchitem.invalid;
    await verifyinvalidsearch(
        page,
        '#VendorsTableFilter',
        '#GetVendorsButton',
        searchValue
    );  
});
test.only('Verify sorting for all columns in Vendor module', async ({ page }) => {
    const sortPage = new SortPage(page);
    const vendorPage = new VendorPage(page);
    await navigateToVendors(vendorPage);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    await verifySortForAllColumns(sortPage);    
});





