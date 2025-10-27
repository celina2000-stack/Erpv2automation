const { test, expect } = require('@playwright/test');
const NextvouchernumberPage = require('../../pages/Accounts/NextvouchernumberPage');
const VoucherPage = require('../../pages/Accounts/VoucherPage');
const { navigateToNextVoucherNumbers,
    openCreateNewNextVoucherNumber,
    verifyRequiredFieldErrorsOnSave,
    fillNextVoucherNum,
    verifydialogerror, verifymessage, getNextVoucherNumByYearAndListItem,
    editNextVoucherNumToUsedValue} = require('../../utils/Accounts/NextvoucherHelper');
const { 
    addnewrecord, getExpectedVoucherNumberFromSetup, hasPostedVoucher } = require('../../utils/Accounts/VoucherHelper');
const voucherData = require('../../fixtures/Accounts/VoucherData.json');

const nextvoucherData = require('../../fixtures/Accounts/NextvoucherData.json');

// Adjust login as needed for your app
const loginData = require('../../fixtures/loginData.json');
const LoginPage = require('../../pages/common/LoginPage');
const { performLogin } = require('../../utils/loginHelper');
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
test('Should show required field error when saving Next voucher number with blank fields', async ({ page }) => {
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await openCreateNewNextVoucherNumber(nextvouchernumberPage);
    await nextvouchernumberPage.clickSave();

    // Verify required field error
    await verifyRequiredFieldErrorsOnSave(nextvouchernumberPage);
});
test('Verify that Next Voucher Number must be greater than zero.', async ({ page }) => {
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await openCreateNewNextVoucherNumber(nextvouchernumberPage);
    await fillNextVoucherNum(nextvouchernumberPage,nextvoucherData.Zeronextvouchernum);
    await nextvouchernumberPage.clickSave();
    await verifydialogerror(nextvouchernumberPage, 'Voucher number must start with number greater than 0');
});
test('Verify that the Zero mask must only contain 0 digit and cannot be zero.', async ({ page }) => {
     const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await openCreateNewNextVoucherNumber(nextvouchernumberPage);
    await fillNextVoucherNum(nextvouchernumberPage,nextvoucherData.emptyZeroMask);
    await nextvouchernumberPage.clickSave();
    await verifydialogerror(nextvouchernumberPage, "ZeroMask must contain only the digit '0' and cannot be empty.");
});
test('Verify that the Next voucher number is created successfully when valid data is entered.', async ({ page }) => {
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await openCreateNewNextVoucherNumber(nextvouchernumberPage);
    await fillNextVoucherNum(nextvouchernumberPage,nextvoucherData.valid);
    await nextvouchernumberPage.clickSave();//Saved successfully.
    await verifymessage(nextvouchernumberPage, 'Saved successfully.');
    await nextvouchernumberPage.verifycreatednextvouchernum(nextvoucherData.valid);
});
test('Verify Next voucher num increments after posting Income Voucher', async ({ page }) => {
    const accountingYear = 'A/Y 2081/82';
    const listItem = 'Income Voucher';
    // Step 1: Get current next voucher num
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    const voucherPage = new VoucherPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    const currentNum = await getNextVoucherNumByYearAndListItem(nextvouchernumberPage, accountingYear, listItem);
    console.log('Current Next Voucher Number:', currentNum);

     const { expectedVoucherNumber } = await getExpectedVoucherNumberFromSetup(voucherPage, accountingYear, listItem);
    console.log('Expected Voucher Number from Setup:', expectedVoucherNumber);
    
    await voucherPage.navigateTovoucher(listItem);
    await voucherPage.openCreateNewJournalVoucher();
    await voucherPage.fillVoucher(voucherData.statusTest);
    await addnewrecord(voucherPage, voucherData.statusTest.gridRow);
    await voucherPage.clickPost();

    // Step 3: Verify the generated voucher number matches expected
    await voucherPage.verifyGeneratedVoucherNumber(expectedVoucherNumber);
    // Step 3: Return to Next Voucher Numbers and verify increment
    await nextvouchernumberPage.navigateToNextVoucherNumbers();
    const newNum = await getNextVoucherNumByYearAndListItem(nextvouchernumberPage, accountingYear, listItem);
    await expect(newNum).toBe(currentNum + 1);
});
test('Verify duplicate Next Voucher Number setup cannot be created for the same Voucher Type and Accounting Year', async ({ page }) => {
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await openCreateNewNextVoucherNumber(nextvouchernumberPage);
    await fillNextVoucherNum(nextvouchernumberPage, nextvoucherData.alreadyExists);
    await nextvouchernumberPage.clickSave();
    await verifydialogerror(nextvouchernumberPage, 'Data already exists for the selected voucher type with accounting year and project');
});
test('Verify system prevents editing Next Voucher Number to a value already used by an existing voucher', async ({ page }) => {
    const accountingYear = 'A/Y 2081/82';
    const listItem = 'Income Voucher';
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    // Get current next voucher num
    const currentNum = await getNextVoucherNumByYearAndListItem(nextvouchernumberPage, accountingYear, listItem);
    
    // Try to edit to a used value (e.g., currentNum - 1)
    await editNextVoucherNumToUsedValue(nextvouchernumberPage, accountingYear, listItem, currentNum - 1);
    await verifydialogerror(nextvouchernumberPage, 'Voucher number already in use');
});
test('Verify system prevents deletion of Next Voucher Number setup if vouchers have been posted', async ({ page }) => {
    const accountingYear = 'A/Y 2081/82';
    const listItem = 'Income Voucher';
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    const voucherPage = new VoucherPage(page);
    // Step 1: Confirm at least one posted voucher exists
    const posted = await hasPostedVoucher(voucherPage, listItem);
    expect(posted).toBe(true);
    // Step 2: Attempt to delete Next Voucher Number setup
    await nextvouchernumberPage.navigateToNextVoucherNumbers();
    const row = await nextvouchernumberPage.findRowByYearAndListItem(accountingYear, listItem);
    expect(row).not.toBeNull();
    await nextvouchernumberPage.clickDeleteOnRow(row);
    await nextvouchernumberPage.confirmDelete();
    // Step 3: Confirm setup still exists
    const stillExists = await nextvouchernumberPage.findRowByYearAndListItem(accountingYear, listItem);
    expect(stillExists).not.toBeNull();
});

test('Next voucher number search functionality by Next voucher num', async ({ page }) => {
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await page.waitForTimeout(2000);
    const searchValue = nextvoucherData.searchitem.nextVoucherNum;
    await verifySearch(
        page,
        '#NextVoucherNumbersTableFilter',
        '#GetNextVoucherNumbersButton',
        searchValue
    );
});
test('Next voucher number search functionality by zero mask', async ({ page }) => {
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await page.waitForTimeout(2000);
    const searchValue = nextvoucherData.searchitem.zeroMask;
    await verifySearch(
        page,
        '#NextVoucherNumbersTableFilter',
        '#GetNextVoucherNumbersButton',
        searchValue
    );
});
test('Next voucher number search functionality by voucher perfix', async ({ page }) => {
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await page.waitForTimeout(2000);
    const searchValue = nextvoucherData.searchitem.voucherprefix;
    await verifySearch(
        page,
        '#NextVoucherNumbersTableFilter',
        '#GetNextVoucherNumbersButton',
        searchValue
    );
});
test('Next voucher number search functionality by voucher postfix', async ({ page }) => {
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await page.waitForTimeout(2000);
    const searchValue = nextvoucherData.searchitem.voucherpostfix;
    await verifySearch(
        page,
        '#NextVoucherNumbersTableFilter',
        '#GetNextVoucherNumbersButton',
        searchValue
    );
});
test('Next voucher number search functionality by accounting year', async ({ page }) => {
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await page.waitForTimeout(2000);
    const searchValue = nextvoucherData.searchitem.accountingYear;
    await verifySearch(
        page,
        '#NextVoucherNumbersTableFilter',
        '#GetNextVoucherNumbersButton',
        searchValue
    );
});
test('Next voucher number search functionality by voucher type', async ({ page }) => {
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await page.waitForTimeout(2000);
    const searchValue = nextvoucherData.searchitem.vouchertype;
    await verifySearch(
        page,
        '#NextVoucherNumbersTableFilter',
        '#GetNextVoucherNumbersButton',
        searchValue
    );
});
test('Next voucher number invalid search', async ({ page }) => {
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await page.waitForTimeout(2000);
    const searchValue = nextvoucherData.searchitem.invalid;
    await verifyinvalidsearch(
        page,
        '#NextVoucherNumbersTableFilter',
        '#GetNextVoucherNumbersButton',
        searchValue
    ); 
});
test.only('Verify sorting for all columns in Next Voucher module', async ({ page }) => {
    const sortPage = new SortPage(page);
    const nextvouchernumberPage = new NextvouchernumberPage(page);
    await navigateToNextVoucherNumbers(nextvouchernumberPage);
    await page.waitForTimeout(2000);
    await verifySortForAllColumns(sortPage);    
});
