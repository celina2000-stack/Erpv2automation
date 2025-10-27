const { expect } = require('@playwright/test');

class JobpositionPage {
    constructor(page) {
        this.page = page;
        this.payrollSetupMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[8]/span/span[2]');
        this.jobPositionsMenu = page.locator('a[href="/App/JobPositions"]');
        this.pageHeading = page.locator('//*[@id="kt_app_toolbar_container"]/div[1]/h1');
        this.createNewJobPositionButton = page.getByRole('button', { name: '+ Create new job position' });
        this.saveButton = page.getByRole('button', { name: '\uf0c7 Save' });
        this.jobPositionNameInput = page.getByRole('textbox', { name: 'Job position name' });
        this.statusDropdown = page.locator('#jobPositionStatusListItemId');
        this.orderNoInput = page.getByRole('spinbutton', { name: 'Order no' });
        this.errorDialog = page.locator('.swal2-popup .swal2-html-container');
        this.warningMessageLocator = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');
    }

    async navigateToPayrollSetup() {
        await this.payrollSetupMenu.click();
    }
    async navigateToJobPositions() {
        await this.jobPositionsMenu.click();
        await expect(this.pageHeading).toBeVisible();
    }
    async openCreateNewJobPosition() {
        await this.createNewJobPositionButton.click();
    }
    async clickSave() {
        await this.saveButton.click();
    }
    async getRequiredFieldErrors() {
        return {
            jobPositionName: this.page.locator('#JobPosition_JobPositionName-error'),
            status: this.page.locator('#jobPositionStatusListItemId-error')
        };
    }
    async fillJobPositionForm(Data) {
        await this.jobPositionNameInput.fill(Data.name);
        await this.statusDropdown.selectOption({ label: Data.status });
        await this.orderNoInput.fill(Data.orderNo);
    }
    async getWarningMessage() {
        await this.page.waitForTimeout(1000);
        if (await this.warningMessageLocator.isVisible()) {
            return await this.warningMessageLocator.textContent();
        }
        return null;
    }
    async verifyJobPositionTableRow(data) {
        // Assumes first row is the newly added job position
        const firstRow = this.page.locator('table tbody tr').first();
        await expect(firstRow.locator('td').nth(2)).toHaveText(data.name);
        await expect(firstRow.locator('td').nth(3)).toHaveText(data.orderNo);
        await expect(firstRow.locator('td').nth(4)).toHaveText(data.status);
    }
}

module.exports = JobpositionPage;
