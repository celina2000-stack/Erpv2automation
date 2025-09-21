const { expect } = require('@playwright/test');

class VoucherPage {
    constructor(page) {
        this.page = page;
        this.accountsMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[10]/span/span[2]');
        this.pageHeading = page.locator('//*[@id="kt_app_toolbar_container"]/div[1]/h1');
        this.voucher = page.locator('a[href="/App/Vouchers"]');
        this.createNewJournalVoucherBtn = page.locator('#CreateNewVoucherButton');
        this.narrationInput = page.locator('#Voucher_Narration');
        this.voucherDateInput = page.locator('#VoucherDateAD');
        this.dueDateInput = page.locator('#DueDateAD');
        this.draftButton = page.locator('button:has-text("Draft")');
        this.postButton = page.locator('button:has-text("Post")');
        this.draftBtn = page.getByRole('button', { name: 'Draft' });
        this.errorDialog = page.locator('.swal2-popup .swal2-html-container');

        this.addrecordbtn=page.getByRole('button', { name: 'Add New Record' });
        this.glAccount=page.locator("//td[@class='td.numeric.rf-editableCell.rf-glAccountdropdown k-table-td']//button[@aria-label='select']");
        this.debitInput=page.getByRole('textbox', { name: 'Debit (Rs)' });
        this.creditInput=page.getByRole('textbox', { name: 'Credit (Rs)' });
        this.saveRowButton=page.locator("//button[@class='k-grid-save-command k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary k-icon-button']");
        this.warningMessageLocator = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');
        this.firstRowStatus = page.locator('#VouchersTable tbody tr:first-child td:nth-child(8)');

        // Locators for Next Voucher Numbers navigation
        this.nextVoucherNumbersMenu = page.locator('a[href="/App/NextVoucherNumbers"]');
        
    // Navigate to Next Voucher Numbers screen
    
    }

    async navigateaccounts() {
        await this.accountsMenu.click();
    }

    async navigateTovoucher(voucherName) {
        // Find link by text (exact match)
        const voucherLink = this.page.locator(`a:has-text("${voucherName}")`);
        await voucherLink.click();
        await this.page.waitForTimeout(4000);
        await expect(this.pageHeading).toHaveText(voucherName);
    }
    async navigateToNextVoucherNumbers() {
        await this.accountsMenu.click();
        await this.nextVoucherNumbersMenu.click();
        await this.page.waitForTimeout(3000);
        await expect(this.page).toHaveURL(/.*NextVoucherNumbers.*/);
    }
    async openCreateNewJournalVoucher() {
        await this.createNewJournalVoucherBtn.click();
        await this.page.waitForTimeout(1000);
    }
     async clickDraft() {
        await this.draftButton.click();
        await this.page.waitForTimeout(1000);
    }

    async clickPost() {
        await this.postButton.click();
        await this.page.waitForTimeout(3000);
    }
    async fillVoucher(data) {
        await this.voucherDateInput.fill(data.voucherDate);
        await this.dueDateInput.fill(data.dueDate);
        await this.narrationInput.fill(data.narration);
    }
    async getRequiredFieldErrors() {
        return {
            narration: this.page.locator('#Voucher_Narration-error')
        };
    }
    // Add a new row to the voucher grid
    async addGridRow(rowData) {
        // Click Add New Record
        await this.addrecordbtn.click();
        // Select GL Account
        await this.glAccount.click();
        await this.page.getByRole('option', { name: rowData.glAccount }).first().click();
        // Fill Debit and Credit
        if(rowData.debit) await this.debitInput.type(rowData.debit);
        if(rowData.credit) await this.creditInput.type(rowData.credit);
    }

    // Save grid row (if additional save is needed in dialog)
    async saveGridRow() {
       await this.saveRowButton.click();
       await this.page.waitForTimeout(500);
    }
    async getWarningMessage() {
        await this.page.waitForTimeout(1000);
        if (await this.warningMessageLocator.isVisible()) {
            return await this.warningMessageLocator.textContent();
        }
        return null;
    }

     async verifyStatus(expectedStatus) {
        const actualStatus = await this.firstRowStatus.innerText();
        console.log(`Actual Status: "${actualStatus.trim()}"`);
        await expect(actualStatus.trim()).toBe(expectedStatus);
    }
     async clickActionButton(rowIndex = 1) {
        const row = this.page.locator(`#VouchersTable tbody tr:nth-child(${rowIndex})`);
        await row.locator('td:nth-child(2) button').click();
    }
    async selectAction(option) {
        await this.page.locator(`a.dropdown-item:has-text("${option}")`).first().click();
    }
    async getNextVoucherNumberData(accountingYear, listItemName) {
        // Find the row in the grid that matches the accounting year and list item name
        const rows = this.page.locator('#NextVoucherNumbersTable tbody tr');
        const rowCount = await rows.count();
        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const yearCell = await row.locator('td').nth(7).innerText();
            const nameCell = await row.locator('td').nth(8).innerText();
            if (yearCell.trim() === accountingYear && nameCell.trim() === listItemName) {
                const nextVoucherNum = await row.locator('td').nth(2).innerText();
                const zeroMask = await row.locator('td').nth(3).innerText();
                const prefix = await row.locator('td').nth(5).innerText();
                const postfix = await row.locator('td').nth(6).innerText();
                return {
                    nextVoucherNum: nextVoucherNum.trim(),
                    zeroMask: zeroMask.trim(),
                    prefix: prefix.trim(),
                    postfix: postfix.trim(),
                };
            }
        }
        return null;
    }
    generateExpectedVoucherNumber(prefix, number, zeroMask, postfix, accountingYear) {
        // Pad the number with zeros according to the zero mask length
        let paddedNumber = number;
        if (zeroMask && zeroMask.length > 0) {
            paddedNumber = number.padStart(zeroMask.length, '0');
        }
        // Format: [prefix]-[zero-padded number]-[accounting year][postfix]
        return `${prefix}-${paddedNumber}-${accountingYear}${postfix}`;
    }
     async verifyGeneratedVoucherNumber(expectedVoucherNumber) {
        // Assumes the voucher number is shown in the first row, second column of the vouchers table after posting
        const actualVoucherNumber = await this.page.locator('#VouchersTable tbody tr:first-child td:nth-child(3)').innerText();
        console.log('Actual Voucher Number:', actualVoucherNumber.trim());
        expect(actualVoucherNumber.trim()).toBe(expectedVoucherNumber);
    }
    async getVoucherRows() {
        // Assumes voucher rows are in a table with tbody tr
        return await this.page.locator('#VoucherTable tbody tr').all();
    }

    async getVoucherStatus(row) {
        // Assumes status is in a specific column, e.g., column 5 (adjust index as needed)
        return await row.locator('td').nth(5).innerText();
    }
}

module.exports = VoucherPage;
