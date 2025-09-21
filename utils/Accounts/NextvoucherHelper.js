const { expect } = require('@playwright/test');

async function navigateToNextVoucherNumbers(nextvouchernumberPage) {
    await nextvouchernumberPage.navigateToaccounts();
    await nextvouchernumberPage.navigateToNextVoucherNumbers();
}

async function openCreateNewNextVoucherNumber(nextvouchernumberPage) {
    await nextvouchernumberPage.openCreateNewNextVoucherNumber();
}

async function verifyRequiredFieldErrorsOnSave(nextvouchernumberPage) {
    await nextvouchernumberPage.clickSave();
    const errors = await nextvouchernumberPage.getRequiredFieldErrors();
    const requiredFields = ['accountingYear', 'listItem', 'zeroMask', 'prefix', 'postfix']; 
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText('This field is required.');
    }
}

async function fillNextVoucherNum(nextvouchernumberPage, data) {
   await nextvouchernumberPage.fillNextVoucherNum(data);
}

async function verifydialogerror(nextvouchernumberPage, message) {
    await expect(await nextvouchernumberPage.errorDialog).toBeVisible();
    await expect(await nextvouchernumberPage.errorDialog).toContainText(message);
}
async function verifymessage(nextvouchernumberPage, message) {
    const warning = await nextvouchernumberPage.getWarningMessage();
    expect(warning).toContain(message); // Adjust message as per actual warning
}
async function getNextVoucherNumByYearAndListItem(nextvouchernumberPage, accountingYear, listItem) {
    // Wait for table to update
    await nextvouchernumberPage.page.waitForTimeout(1000);
    const rowLocator = nextvouchernumberPage.page.locator('#NextVoucherNumbersTable_wrapper table tbody tr');
    const rowCount = await rowLocator.count();
    console.log(`Total rows in Next Voucher Numbers table: ${rowCount}`);
    for (let i = 0; i < rowCount; i++) {
        const row = rowLocator.nth(i);
        const year = await row.locator('td').nth(7).innerText();
        const item = await row.locator('td').nth(8).innerText();
        console.log(`Row ${i + 1}: Year="${year.trim()}", Item="${item.trim()}"`);
        if (year === accountingYear && item === listItem) {
            return parseInt(await row.locator('td').nth(2).innerText(), 10);
        }
    }
    throw new Error('No matching row found for accounting year and list item');
}

async function editNextVoucherNumToUsedValue(nextvouchernumberPage, accountingYear, listItem, newVoucherNum) {
    await nextvouchernumberPage.editNextVoucherNumByYearAndListItem(accountingYear, listItem, newVoucherNum);
}

async function attemptDeleteNextVoucherNumAndVerifyError(nextvouchernumberPage, accountingYear, listItem, expectedError) {
    await nextvouchernumberPage.navigateToNextVoucherNumbers();
    const row = await nextvouchernumberPage.findRowByYearAndListItem(accountingYear, listItem);
    if (!row) throw new Error('Next Voucher Number setup not found');
    await nextvouchernumberPage.clickDeleteOnRow(row);
    await nextvouchernumberPage.confirmDelete();
    await verifydialogerror(nextvouchernumberPage, expectedError);
    // Confirm data still exists
    const stillExists = await nextvouchernumberPage.findRowByYearAndListItem(accountingYear, listItem);
    if (!stillExists) throw new Error('Setup was deleted but should remain');
}

async function isNextVoucherNumPresent(nextvouchernumberPage, accountingYear, listItem) {
    await nextvouchernumberPage.navigateToNextVoucherNumbers();
    const row = await nextvouchernumberPage.findRowByYearAndListItem(accountingYear, listItem);
    return !!row;
}

module.exports = {
    navigateToNextVoucherNumbers,
    openCreateNewNextVoucherNumber,
    verifyRequiredFieldErrorsOnSave,
    fillNextVoucherNum,
    verifydialogerror,
    verifymessage,
    getNextVoucherNumByYearAndListItem,
    editNextVoucherNumToUsedValue,
    attemptDeleteNextVoucherNumAndVerifyError,
    isNextVoucherNumPresent,
};
