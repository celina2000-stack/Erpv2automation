const { expect } = require('@playwright/test');

async function navigateToAccountsAndvoucher(chartofaccountPage, vouchername) {
    await chartofaccountPage.navigateaccounts();
    await chartofaccountPage.navigateTovoucher(vouchername);
}
async function openCreateNewJournalVoucher(voucherPage) {
    await voucherPage.openCreateNewJournalVoucher();
}


async function verifyRequiredFieldErrorsOnDraft(voucherPage) {
    await voucherPage.clickDraft();
    const errors = await voucherPage.getRequiredFieldErrors();
    const requiredFields = ['narration'];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText('This field is required.');
    }
}

async function verifyNoDataToSaveError(voucherPage,) {
    await expect(await voucherPage.errorDialog).toBeVisible();
    await expect(await voucherPage.errorDialog).toContainText('No data available to save');
}
async function addnewrecord(voucherPage, gridRows) {
    for (const rowData of gridRows) {
        await voucherPage.addGridRow(rowData);
        await voucherPage.saveGridRow();
    }
}

async function verifymessage(voucherPage, message) {
    const warning = await voucherPage.getWarningMessage();
    expect(warning).toContain(message); // Adjust message as per actual warning
}

async function clickactionandoption(voucherPage, option) {
    await voucherPage.clickActionButton();
    await voucherPage.selectAction(option);
    await voucherPage.page.waitForTimeout(1000);
}

async function getExpectedVoucherNumberFromSetup(voucherPage, accountingYear, listItemName) {
    await voucherPage.navigateToNextVoucherNumbers();
    const data = await voucherPage.getNextVoucherNumberData(accountingYear, listItemName);
    if (!data) throw new Error('No setup data found for given accounting year and list item name');
    const expectedVoucherNumber = voucherPage.generateExpectedVoucherNumber(
        data.prefix,
        data.nextVoucherNum,
        data.zeroMask,
        data.postfix,
        accountingYear
    );
    return { expectedVoucherNumber, setupData: data };
}

async function hasPostedVoucher(voucherPage, listItem) {
    await voucherPage.navigateaccounts();
    await voucherPage.navigateTovoucher(listItem);
    const rows = await voucherPage.getVoucherRows();
    console.log(`Total voucher rows found: ${rows}`);
    for (const row of rows) {
        const status = await voucherPage.getVoucherStatus(row);
        if (status === 'Verified (Posted)') {
            return true;
        }
    }
    return false;
}

module.exports = {
    navigateToAccountsAndvoucher,
    openCreateNewJournalVoucher,
    verifyRequiredFieldErrorsOnDraft,
    verifyNoDataToSaveError,
    addnewrecord, verifymessage,
    clickactionandoption, getExpectedVoucherNumberFromSetup,
    hasPostedVoucher,
};
