const { expect } = require('@playwright/test');
class BanksPage {
    constructor(page) {
        this.page = page;
        this.payrollSetupMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[8]/span/span[2]');
        this.banksMenu = page.locator('a[href="/App/Banks"]');
        this.pageHeading = page.locator('h1', { hasText: 'Banks' });
        this.createNewbankButton = page.getByRole('button', { name: '+ Create new bank' });
        this.saveButton = page.getByRole('button', { name: ' Save' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.glaccountinput= page.locator("#glAccountId");
        this.statusInput = page.locator("#bankStatusListItemId");
        this.banknameInput = page.locator("#Bank_BankName");
        this.errorDialog = page.locator('.swal2-popup .swal2-html-container');
        this.warningMessageLocator = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');
    }

    async navigateToPayrollSetup() {
        await this.payrollSetupMenu.click();
    }
    async navigateToBanks() {
        await this.banksMenu.click();
        await this.page.waitForTimeout(1000);
        await expect(this.pageHeading).toBeVisible();
    }
    async openCreateNewbank() {
        await this.createNewbankButton.click();
    }
    async clickSave() {
        await this.saveButton.click();
    }
    async clickCancel() {
        await this.cancelButton.click();
    }
    async getRequiredFieldErrors() {
        return {
            glaccount: this.page.locator('#glAccountId-error'),
            status: this.page.locator('#bankStatusListItemId-error'),
            bankname: this.page.locator('#Bank_BankName-error')
        };
    }
    async fillbankForm(Data) {
        await this.glaccountinput.selectOption({ label: Data.glaccount});
        await this.statusInput.selectOption({ label: Data.status });
        await this.banknameInput.fill(Data.bankname);
    }

    async getWarningMessage() {
        await this.page.waitForTimeout(1000);
        if (await this.warningMessageLocator.isVisible()) {
            return await this.warningMessageLocator.textContent();
        }
        return null;
    }
    async verifybankTableRow(data) {
        // Assumes first row is the newly added job position
        const lastRow = this.page.locator('table tbody tr').last();
        await expect(lastRow.locator('td').nth(2)).toHaveText(data.bankname);
        const accountName = data.glaccount.split(' ').slice(1).join(' ');
        await expect(lastRow.locator('td').nth(3)).toHaveText(accountName);
        await expect(lastRow.locator('td').nth(4)).toHaveText(data.status);
    }
}

module.exports = BanksPage;