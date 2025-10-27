const { expect } = require('@playwright/test');

class ContractprofilesPage {
    constructor(page) {
        this.page = page;
        this.payrollSetupMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[8]/span/span[2]');
        this.contractProfilesMenu = page.locator('a[href="/App/ContractProfiles"]');
        this.pageHeading = page.locator('h1', { hasText: 'Contract profiles' });
        this.createNewContractProfileButton = page.getByRole('button', { name: '+ Create new contract profile' });
        this.saveButton = page.getByRole('button', { name: ' Save' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.contractProfileNameInput = page.getByRole('textbox', { name: 'Contract profile name' });
        this.addPaymentItemsButton = page.getByRole('button', { name: 'Add Payment Items' });
        this.gridSaveButton = page.locator('.k-grid-save-command');
        this.duplicatePaymentItemError = page.locator('text=This PaymentItem is already saved!');
        this.errorDialog = page.locator('.swal2-popup .swal2-html-container');
        this.warningMessageLocator = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');
    }

    async navigateToPayrollSetup() {
        await this.payrollSetupMenu.click();
    }
    async navigateToContractProfiles() {
        await this.contractProfilesMenu.click();
        await this.page.waitForTimeout(1000);
        await expect(this.pageHeading).toBeVisible();
    }
    async openCreateNewContractProfile() {
        await this.createNewContractProfileButton.click();
    }
    async clickSave() {
        await this.saveButton.click();
    }
    async clickCancel() {
        await this.cancelButton.click();
    }
    async getRequiredFieldErrors() {
        return {
            contractProfileName: this.page.locator('#contractProfileName-error')
        };
    }
    async clickAddPaymentItems() {
        await this.addPaymentItemsButton.click();
    }
    async clickGridSave() {
        await this.gridSaveButton.click();
    }
    async getGridRequiredFieldErrors() {
        return {
            paymentItem: this.page.locator('#paymentItem-error'),
            paymentBasis: this.page.locator('#PaymentBasis-error')
        };
    }
    async fillContractProfileForm(data) {
        await this.contractProfileNameInput.fill(data.contractProfileName);
    }
    async selectGridPaymentItemAndBasis(data) {
        // Select payment item in the new grid row
        await this.page.getByRole('combobox').nth(3).click();
        await this.page.getByRole('option', {name: data.paymentItem}).click();
        // Select payment basis in the new grid row
        await this.page.getByRole('combobox').nth(4).click();
        await this.page.getByRole('option', { name: data.paymentBasis }).click();
        await this.page.locator("(//input[@title='Rate'])[1]").type(data.rate);
    }
    async getWarningMessage() {
         // brief wait for toast to appear
        const toasts = this.page.locator('.toast-message');
        const count = await toasts.count();
      
        if (count === 0) return null;
      
        // Collect all visible toast messages
        const allMessages = [];
        for (let i = 0; i < count; i++) {
          const toast = toasts.nth(i);
          if (await toast.isVisible()) {
            const text = (await toast.textContent())?.trim();
            if (text) allMessages.push(text);
          }
        }
      
        // Return concatenated or the last message (you can adjust)
        return allMessages.join(' | ');
      }
      
    
    // Deductions tab methods
    async clickDeductionsTab() {
        await this.page.getByRole('tab', { name: 'Deductions' }).click();
    }
    
}

module.exports = ContractprofilesPage;
