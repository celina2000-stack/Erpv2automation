const { expect } = require('@playwright/test');

class PaymentitemPage {
    constructor(page) {
        this.page = page;
        this.payrollSetupMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[8]/span/span[2]');
        this.paymentItemsMenu = page.locator('a[href="/App/PaymentItems"]');
        this.pageHeading = page.locator('//*[@id="kt_app_toolbar_container"]/div[1]/h1');
        this.createNewPaymentItemButton = page.getByRole('button', { name: '+ Create new payment Item' });
        this.saveButton = page.getByRole('button', { name: ' Save' });
        this.paymentItemNameInput = page.getByRole('textbox', { name: 'Payment Item Name' });
        this.paymentItemTypeDropdown = page.locator('#paymentItemTypeListItemId');
        this.paymentTypeDropdown = page.locator('#paymentTypeListItemId');
        this.paymentBasisDropdown = page.locator('//*[@id="PaymentItemInformationsForm"]/div/div[7]/span[1]/div/input');
        this.taxableTypeDropdown = page.locator('//*[@id="PaymentItemInformationsForm"]/div/div[8]/span');
        this.warningMessageLocator = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');
    }

     async navigateToPayrollSetup() {
        await this.payrollSetupMenu.click();
    }
    async navigateToPaymentItems() {
        await this.payrollSetupMenu.click();
        await this.paymentItemsMenu.click();
        await expect(this.pageHeading).toBeVisible();
    }

    async openCreateNewPaymentItem() {
        await this.createNewPaymentItemButton.click();
    }

    async clickSave() {
        await this.saveButton.click();
    }

    async getRequiredFieldErrors() {
        // Returns an object with locators for each required field error message using error message IDs
        return {
            paymentItemName: this.page.locator('#paymentItemName-error'),
            paymentItemType: this.page.locator('#paymentItemTypeListItemId-error'),
            paymentType: this.page.locator('#paymentTypeListItemId-error'),
            paymentBasis: this.page.locator('#paymentItemBasisId-error'),
        };
    }

    async fillPaymentItemForm(paymentItemData) {
        await this.paymentItemNameInput.fill(paymentItemData.paymentItemName);
        await this.paymentItemTypeDropdown.selectOption({ label: paymentItemData.paymentItemType });
        await this.paymentTypeDropdown.selectOption({ label: paymentItemData.paymentType });
        // Always loop through paymentBasis array
        for (const basis of paymentItemData.paymentBasis) {
            await this.paymentBasisDropdown.click();
            await this.page.getByRole('option', { name: basis }).click();
            await this.page.waitForTimeout(1000); // Small delay to ensure the dropdown processes each selection
        }
        if(paymentItemData.paymentItemType=="Benefit"){
            await this.taxableTypeDropdown.click();
            await this.page.getByRole('option', { name: paymentItemData.taxableType,  exact: true }).click();
        }
        
    }
     async getWarningMessage() {
        await this.page.waitForTimeout(1000);
        if (await this.warningMessageLocator.isVisible()) {
            return await this.warningMessageLocator.textContent();
        }
        return null;
    }

    // Get the default order number from the first row of the payment items table
    async getDefaultOrderNumber() {
        const firstRow = this.page.locator('table tbody tr').first();
        return await firstRow.locator('td').nth(0).textContent(); // Assuming order number is in the first column
    }

    // Get the default order number from the order number field in the form
    async getDefaultOrderNumberFromForm() {
        const orderNumberInput = this.page.locator('#PaymentItem_OrderNum');
        const value = await orderNumberInput.inputValue();
        console.log('Order Number:', value); // Print the order number
        return value;
    }

    // Verify that the newly created payment item appears in the table with correct details
    // Set viewport to large size before verifying table row
    async verifyPaymentItemTableRow(paymentItemData, expectedOrderNumber) {
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        const firstRow = this.page.locator('table tbody tr').first();
        await expect(firstRow.locator('td').nth(2)).toHaveText(paymentItemData.paymentItemName);
        await expect(firstRow.locator('td').nth(4)).toHaveText(expectedOrderNumber);
        await expect(firstRow.locator('td').nth(5)).toHaveText(paymentItemData.paymentItemType);
        await expect(firstRow.locator('td').nth(6)).toHaveText(paymentItemData.paymentType);
        if(paymentItemData.paymentItemType=="Benefit"){
            await expect(firstRow.locator('td').nth(7)).toHaveText(paymentItemData.taxableType);
        }else{
            await expect(firstRow.locator('td').nth(7)).toHaveText('');
        }
        await expect(firstRow.locator('td').nth(8)).toHaveText(paymentItemData.paymentBasis.join(', '));
    }


}

module.exports = PaymentitemPage;
