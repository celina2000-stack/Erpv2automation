const { expect } = require('@playwright/test');

class NextvouchernumberPage {
    constructor(page) {
        this.page = page;
        // Menu and navigation
        this.accountsMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[10]/span/span[2]');
        this.nextVoucherNumbersMenu = page.locator('a[href="/App/NextVoucherNumbers"]');
        this.pageHeading = page.locator('//*[@id="kt_app_toolbar_container"]/div[1]/h1');
        this.createNewNextVoucherNumberBtn = page.locator('button:has-text("Create new next voucher number")');
        this.saveButton = page.locator('button:has-text("Save")');
        this.cancelButton = page.locator('button:has-text("Cancel")');
        // Form fields
        this.accountingYearDropdown = page.locator('select#accountingYearId');
        this.listItemDropdown = page.locator('#listItemVoucherTypeId');
        this.nextVoucherNumInput = page.locator('#NextVoucherNumber_NextVoucherNum');
        this.zeroMaskInput = page.locator('#NextVoucherNumber_ZeroMask');
        this.isDefaultCheckbox = page.locator('#NextVoucherNumber_IsDefault');
        this.voucherPrefixInput = page.locator('#NextVoucherNumber_VoucherPrefix');
        this.voucherPostfixInput = page.locator('#NextVoucherNumber_VoucherPostfix');

        this.errorDialog = page.locator('.swal2-popup .swal2-html-container');
        this.warningMessageLocator = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');
    }

    async navigateToaccounts() {
        await this.accountsMenu.click();
        
    }

    async navigateToNextVoucherNumbers() {
        await this.nextVoucherNumbersMenu.click();
        await this.page.waitForTimeout(4000);
        await expect(this.pageHeading).toBeVisible();
    }

    async openCreateNewNextVoucherNumber() {
        await this.createNewNextVoucherNumberBtn.click();
        await this.page.waitForTimeout(1000);
    }

    async clickSave() {
        await this.saveButton.click();
        await this.page.waitForTimeout(2000);
    }

    async clickCancel() {
        await this.cancelButton.click();
    }

    async getRequiredFieldErrors() {
        return {
            accountingYear: this.page.locator('#accountingYearId-error'),
            listItem: this.page.locator('#listItemVoucherTypeId-error'),
            zeroMask: this.page.locator('#NextVoucherNumber_ZeroMask-error'),
            prefix: this.page.locator('#NextVoucherNumber_VoucherPrefix-error'),
            postfix: this.page.locator('#NextVoucherNumber_VoucherPostfix-error'), 
        };
    }


    async fillNextVoucherNum(data) {
        await this.accountingYearDropdown.selectOption({ label: data.accountingYear });
        await this.listItemDropdown.selectOption({ label: data.listItem });
        await this.nextVoucherNumInput.fill(data.nextVoucherNum);
        if (data.zeroMask !== '') {
            await this.zeroMaskInput.fill(data.zeroMask);
        }
        if (data.voucherPrefix !== '') {
            await this.voucherPrefixInput.fill(data.voucherPrefix);
        }
        if (data.voucherPostfix !== '') {
            await this.voucherPostfixInput.fill(data.voucherPostfix);
        }
        if (data.isDefault) {
            const checked = await this.isDefaultCheckbox.isChecked();
            if (!checked) await this.isDefaultCheckbox.check();
        }
        await this.page.waitForTimeout(1000);
    }

    getVoucherNumError() {
        return this.page.locator('#NextVoucherNum-error');
    }

    async verifycreatednextvouchernum(data) {
    // Wait for table to update after save
    await this.page.waitForTimeout(2000);

    const row = this.page.locator('#NextVoucherNumbersTable_wrapper table tbody tr').last();

    const nextVoucherNum = await row.locator('td').nth(2).innerText();
    const zeroMask = await row.locator('td').nth(3).innerText();
    const isDefault = await row.locator('td').nth(4).locator('i').getAttribute('title');
    const voucherPrefix = await row.locator('td').nth(5).innerText();
    const voucherPostfix = await row.locator('td').nth(6).innerText();
    const accountingYear = await row.locator('td').nth(7).innerText();
    const listItemName = await row.locator('td').nth(8).innerText();
    
        // Log actual values for debugging
    console.log("Table Values Found:");
    console.log({
        nextVoucherNum,
        zeroMask,
        isDefault,
        voucherPrefix,
        voucherPostfix,
        accountingYear,
        listItemName
    });
    // Assertions with expect (gives better debug info)
    await expect(nextVoucherNum).toBe(data.nextVoucherNum);
    await expect(zeroMask).toBe(data.zeroMask);
    await expect(voucherPrefix).toBe(data.voucherPrefix);
    await expect(voucherPostfix).toBe(data.voucherPostfix);
    await expect(accountingYear).toBe(data.accountingYear);
    await expect(listItemName,).toBe(data.listItem);

    const expectedDefault = data.isDefault ? 'True' : 'False';
    await expect(isDefault).toBe(expectedDefault);
}

 async getWarningMessage() {
        await this.page.waitForTimeout(1000);
        if (await this.warningMessageLocator.isVisible()) {
            return await this.warningMessageLocator.textContent();
        }
        return null;
    }

    async editNextVoucherNumByYearAndListItem(accountingYear, listItem, newVoucherNum) {
        const rowLocator = this.page.locator('#NextVoucherNumbersTable_wrapper table tbody tr');
        const rowCount = await rowLocator.count();
        for (let i = 0; i < rowCount; i++) {
            const row = rowLocator.nth(i);
            const year = await row.locator('td').nth(7).innerText();
            const item = await row.locator('td').nth(8).innerText();
            if (year === accountingYear && item === listItem) {
                await row.locator('td').nth(1).locator('.btn-group').click();
                await row.locator('a:has-text("Edit")').click();
                await this.nextVoucherNumInput.fill(String(newVoucherNum));
                await this.clickSave();
                return;
            }
        }
        throw new Error('No matching row found for accounting year and list item');
    }

    async findRowByYearAndListItem(accountingYear, listItem) {
        const rowLocator = this.page.locator('#NextVoucherNumbersTable_wrapper table tbody tr');
        const rowCount = await rowLocator.count();
        for (let i = 0; i < rowCount; i++) {
            const row = rowLocator.nth(i);
            const year = await row.locator('td').nth(7).innerText();
            const item = await row.locator('td').nth(8).innerText();
            if (year === accountingYear && item === listItem) {
                return row;
            }
        }
        return null;
    }

    async clickDeleteOnRow(row) {
        // Assumes delete button is in last column (adjust index if needed)
        const deleteBtn = row.locator('td').last().locator('button[title="Delete"]');
        await deleteBtn.click();
    }

    async confirmDelete() {
        // Assumes a confirmation dialog appears with a confirm button
        const confirmBtn = this.page.locator('button:has-text("Yes")');
        await confirmBtn.click();
    }
}

module.exports = NextvouchernumberPage;
