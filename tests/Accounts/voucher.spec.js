const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/common/LoginPage');
const loginData = require('../../fixtures/loginData.json');
const { performLogin } = require('../../utils/loginHelper');

const VoucherPage = require('../../pages/Accounts/VoucherPage');
const { navigateToAccountsAndvoucher, openCreateNewJournalVoucher, 
    verifyRequiredFieldErrorsOnDraft, verifyNoDataToSaveError, 
    addnewrecord, verifymessage,
    clickactionandoption, getExpectedVoucherNumberFromSetup } = require('../../utils/Accounts/VoucherHelper');
const voucherData = require('../../fixtures/Accounts/VoucherData.json');
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

test('Voucher required field validation on Draft', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = 'Receipt Voucher';
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await openCreateNewJournalVoucher(voucherPage);
    await verifyRequiredFieldErrorsOnDraft(voucherPage);
});

test('Voucher shows "No data available to save" when narration, voucher date, and due date are filled and grid is empty', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = 'Receipt Voucher';
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await openCreateNewJournalVoucher(voucherPage);
    await voucherPage.fillVoucher(voucherData.emptygrid);
    await voucherPage.clickDraft();
    await verifyNoDataToSaveError(voucherPage);
});

test('Voucher shows error when both debit and credit are entered in one grid row and Draft is clicked twice', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = 'Receipt Voucher';
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await openCreateNewJournalVoucher(voucherPage);
    await voucherPage.fillVoucher(voucherData.debitCreditSameRow);
    await addnewrecord(voucherPage,voucherData.debitCreditSameRow.gridRow);
    await voucherPage.clickDraft();
    await verifymessage(voucherPage, 'Debit and Credit amounts are both entered in row(s): 1. only one is allowed per row.');
});

test('Voucher shows error when total debit and credit are not equal and Post is clicked', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = 'Receipt Voucher';
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await openCreateNewJournalVoucher(voucherPage);
    await voucherPage.fillVoucher(voucherData.debitCreditNotEqual);
    await addnewrecord(voucherPage,voucherData.debitCreditNotEqual.gridRow);
    await voucherPage.clickPost();
    await verifymessage(voucherPage, 'Total Debit and Credit amounts must be equal.');
});

test('Voucher status is Checked (Unposted) after Draft and Verified (Posted) after Post', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = 'Receipt Voucher';
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await openCreateNewJournalVoucher(voucherPage);
    await voucherPage.fillVoucher(voucherData.statusTest);
    await addnewrecord(voucherPage, voucherData.statusTest.gridRow);
    await voucherPage.clickDraft();
    await page.waitForTimeout(2000);
    await voucherPage.verifyStatus('Checked (Unposted)');
    await clickactionandoption(voucherPage, 'Edit');
    await voucherPage.clickPost();
    await page.waitForTimeout(2000);
    await voucherPage.verifyStatus('Verified (Posted)');
});

test('Voucher shows error when neither debit nor credit is entered in a grid row', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = 'Receipt Voucher';
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await openCreateNewJournalVoucher(voucherPage);
    await voucherPage.fillVoucher(voucherData.noAmount);
    await addnewrecord(voucherPage, voucherData.noAmount.gridRow);
    
    await verifymessage(voucherPage, 'Please enter an amount');
});
test('Verify voucher number is auto-generated upon posting a JV based on the defined next voucher number', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const accountingYear = 'A/Y 2081/82';
    const vouchername = 'Receipt Voucher';
    const { expectedVoucherNumber } = await getExpectedVoucherNumberFromSetup(voucherPage, accountingYear, vouchername);
    console.log('Expected Voucher Number from Setup:', expectedVoucherNumber);
    
    await voucherPage.navigateTovoucher(vouchername);
    await voucherPage.openCreateNewJournalVoucher();
    await voucherPage.fillVoucher(voucherData.statusTest);
    await addnewrecord(voucherPage, voucherData.statusTest.gridRow);
    await voucherPage.clickPost();

    // Step 3: Verify the generated voucher number matches expected
    await voucherPage.verifyGeneratedVoucherNumber(expectedVoucherNumber);
});

test('Voucher search functionality by voucher number', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = voucherData.searchitem.vouchername;
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await page.waitForTimeout(2000);
    const searchValue = voucherData.searchitem.vouchernumber;
    await verifySearch(
        page,
        '#VouchersTableFilter',
        '#GetVouchersButton',
        searchValue
    );
});
test('Voucher search functionality by debit amount', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = voucherData.searchitem.vouchername;
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await page.waitForTimeout(2000);
    const searchValue = voucherData.searchitem.debitamount;
    await verifySearch(
        page,
        '#VouchersTableFilter',
        '#GetVouchersButton',
        searchValue
    );
});

test('Voucher search functionality by credit amount', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = voucherData.searchitem.vouchername;
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await page.waitForTimeout(2000);
    const searchValue = voucherData.searchitem.creditamount;
    await verifySearch(
        page,
        '#VouchersTableFilter',
        '#GetVouchersButton',
        searchValue
    );
});
test('Voucher search functionality by voucher date', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = voucherData.searchitem.vouchername;
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await page.waitForTimeout(2000);
    const searchValue = voucherData.searchitem.voucherdate;
    await verifySearch(
        page,
        '#VouchersTableFilter',
        '#GetVouchersButton',
        searchValue
    );
});
test('Voucher search functionality by posted date', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = voucherData.searchitem.vouchername;
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await page.waitForTimeout(2000);
    const searchValue = voucherData.searchitem.posteddate;
    await verifySearch(
        page,
        '#VouchersTableFilter',
        '#GetVouchersButton',
        searchValue
    );
});
test('Voucher search functionality by status', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = voucherData.searchitem.vouchername;
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await page.waitForTimeout(2000);
    const searchValue = voucherData.searchitem.status;
    await verifySearch(
        page,
        '#VouchersTableFilter',
        '#GetVouchersButton',
        searchValue
    );
});
test('Voucher invalid search', async ({ page }) => {
    const voucherPage = new VoucherPage(page);
    const vouchername = voucherData.searchitem.vouchername;
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await page.waitForTimeout(2000);
    const searchValue = voucherData.searchitem.invalid;
    await verifyinvalidsearch(
        page,
        '#VouchersTableFilter',
        '#GetVouchersButton',
        searchValue
    );  
});

test.only('Verify sorting for all columns in Voucher module', async ({ page }) => {
    const sortPage = new SortPage(page);
    const voucherPage = new VoucherPage(page);
    const vouchername = voucherData.searchitem.vouchername;
    await navigateToAccountsAndvoucher(voucherPage, vouchername);
    await page.waitForTimeout(2000);
    await verifySortForAllColumns(sortPage);    
});

