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

