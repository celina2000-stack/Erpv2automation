const { expect } = require('@playwright/test');
class ContracttypePage {
    constructor(page) {
        this.page = page;
        this.payrollSetupMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[8]/span/span[2]');
        this.ContracttypeMenu = page.locator('a[href="/App/ServiceAssignmentContractTypes"]');
        this.pageHeading = page.locator('h1', { hasText: 'Contract Types' });
        this.createNewcontracttypeButton = page.getByRole('button', { name: '+ Create new contract type' });
        this.saveButton = page.getByRole('button', { name: ' Save' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.contractname= page.locator("#contractTypeListItemId");
        this.contracttype = page.locator("#ServiceAssignmentContractType_ContractType");
        this.errorDialog = page.locator('.swal2-popup .swal2-html-container');
        this.warningMessageLocator = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');
    }

    async navigateToPayrollSetup() {
        await this.payrollSetupMenu.click();
    }
    async navigateToContracttype() {
        await this.ContracttypeMenu.click();
        await this.page.waitForTimeout(1000);
        await expect(this.pageHeading).toBeVisible();
    }
    async openCreateNewcontracttype() {
        await this.createNewcontracttypeButton.click();
    }
    async clickSave() {
        await this.saveButton.click();
    }
    async clickCancel() {
        await this.cancelButton.click();
    }
    async getRequiredFieldErrors() {
        return {
            contractname: this.page.locator('#contractTypeListItemId-error'),
            contracttype: this.page.locator('#ServiceAssignmentContractType_ContractType-error')
        };
    }
    async fillcontracttypeForm(Data) {
        await this.contractname.selectOption({ label: Data.contractname });
        await this.contracttype.fill(Data.contracttype);
    }

    async getWarningMessage() {
        await this.page.waitForTimeout(1000);
        if (await this.warningMessageLocator.isVisible()) {
            return await this.warningMessageLocator.textContent();
        }
        return null;
    }
    async verifycontracttypeTableRow(data) {
        // Assumes first row is the newly added job position
        const firstRow = this.page.locator('table tbody tr').first();
        await expect(firstRow.locator('td').nth(2)).toHaveText(data.contractname);
        await expect(firstRow.locator('td').nth(3)).toHaveText(data.contracttype);
    }
}

module.exports = ContracttypePage;