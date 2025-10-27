const { expect } = require('@playwright/test');

class VendorPage {
    constructor(page) {
        this.page = page;
        this.accountsMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[10]/span/span[2]');
        this.vendorMenu = page.locator('a[href="/App/Vendors"]');
        this.pageHeading = page.locator('//*[@id="kt_app_toolbar_container"]/div[1]/h1');
        this.createNewVendorBtn = page.getByRole('button', { name: '+ Create new vendor' });
        this.vendorTypeCombo = page.locator('#VendorTypeListItemId');
        this.createVendorDialog = page.locator('div[role="dialog"]:has-text("Create new vendor")');
        this.errorDialog = page.locator('.swal2-popup .swal2-html-container');
        this.warningMessageLocator = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');

    }

   async navigateToaccounts() {
        await this.accountsMenu.click();
        
    }

    async navigateToVendors() {
        await this.vendorMenu.click();
        await this.page.waitForTimeout(4000);
        await expect(this.pageHeading).toBeVisible();
    }

    async setShowEntriesTo25(showentries) {
        // Select '25' from the Show entries dropdown
        const showEntriesDropdown = this.page.locator(showentries);
        await showEntriesDropdown.selectOption('25');
        await this.page.waitForTimeout(500); // Wait for grid to update
    }

    async openCreateNewVendor() {
        await this.createNewVendorBtn.click();
        await expect(this.createVendorDialog).toBeVisible();
        await this.page.waitForTimeout(1000);
    }

   // In VendorPage class
async getSelectedVendorTypeText() {
    const selectedOption = await this.vendorTypeCombo.locator('option:checked').textContent();
    return selectedOption.trim();
}

async selectVendorType(type) {
    await this.vendorTypeCombo.selectOption({ label: type });
}



    async verifyAllVendorFormFieldsPresent() {
        await expect(this.vendorTypeCombo).toBeVisible();
        await expect(this.page.locator('#Vendor_CompanyName')).toBeVisible();
        await expect(this.page.locator('#Vendor_VendorDisplayName')).toBeVisible();
        await expect(this.page.locator('#Vendor_PANNo')).toBeVisible();
        await expect(this.page.locator('#statusListItemId')).toBeVisible();
        await expect(this.page.locator('#vendorCode')).toBeVisible();
        await expect(this.page.locator('#Vendor_FirstName')).toBeVisible();
        await expect(this.page.locator('#Vendor_LastName')).toBeVisible();
        await expect(this.page.locator('#GenderListItemId')).toBeVisible();
        await expect(this.page.locator('#Vendor_Email')).toBeVisible();
        await expect(this.page.locator('#Vendor_PhoneNumber')).toBeVisible();
        await expect(this.page.locator('#Vendor_Address')).toBeVisible();
        await expect(this.page.locator('#Vendor_BankBranchName')).toBeVisible();
        await expect(this.page.locator('#Vendor_AccountNumber')).toBeVisible();
        await expect(this.page.locator('#Vendor_AccountHoldersName')).toBeVisible();
        await expect(this.page.locator('#Vendor_OfficeCode')).toBeVisible();
    }
    
     async verifyAllConsultantFormFieldsPresent() {
        await expect(this.page.locator('#Vendor_FirstName')).toBeVisible();
        await expect(this.page.locator('#Vendor_LastName')).toBeVisible();
        await expect(this.page.locator('#GenderListItemId')).toBeVisible();
        await expect(this.page.locator('#Vendor_Email')).toBeVisible();
        await expect(this.page.locator('#Vendor_PhoneNumber')).toBeVisible();
        await expect(this.page.locator('#Vendor_Address')).toBeVisible();
        await expect(this.page.locator('#Personnel_PANNo')).toBeVisible();
        await expect(this.page.locator('#personnelCode')).toBeVisible();
        await expect(this.page.locator('#statusListItemId')).toBeVisible();
        await expect(this.page.locator('#Vendor_BankBranchName')).toBeVisible();
        await expect(this.page.locator('#Vendor_AccountNumber')).toBeVisible();
        await expect(this.page.locator('#Vendor_AccountHoldersName')).toBeVisible();
        await expect(this.page.locator('#Vendor_OfficeCode')).toBeVisible();
    }

    async clickSaveButton() {
        // Adjust selector if Save button text or role changes
        await this.page.getByRole('button', { name: 'Save' }).click();
    }

    getVendorRequiredFieldErrors() {
        // Adjust selectors as per actual error message IDs/classes
        return {
            companyName: this.page.locator('#Vendor_CompanyName-error'),
            vendorDisplayName: this.page.locator('#Vendor_VendorDisplayName-error'),
            panNo: this.page.locator('#Vendor_PANNo-error'),
            status: this.page.locator('#statusListItemId-error'),
            vendorCode: this.page.locator('#vendorCode-error'),
            firstName: this.page.locator('#Vendor_FirstName-error'),
            lastName: this.page.locator('#Vendor_LastName-error'),
            email: this.page.locator('#Vendor_Email-error'),
            phoneNumber: this.page.locator('#Vendor_PhoneNumber-error')
            
        };
    }

    getConsultantRequiredFieldErrors() {
        return {
            firstName: this.page.locator('#Vendor_FirstName-error'),
            lastName: this.page.locator('#Vendor_LastName-error'),
            personnelCode: this.page.locator('#personnelCode-error'),
            status: this.page.locator('#statusListItemId-error'),
            email: this.page.locator('#Vendor_Email-error'),
            phoneNumber: this.page.locator('#Vendor_PhoneNumber-error')
            
        };
    }

    async fillVendorForm(data) {
        if (data.vendorType=='Consultant') {
            if (data.firstName) await this.page.locator('#Vendor_FirstName').fill(data.firstName);
            if (data.lastName) await this.page.locator('#Vendor_LastName').fill(data.lastName);
            if (data.gender) await this.page.locator('#GenderListItemId').selectOption({ label: data.gender });
            if (data.email) await this.page.locator('#Vendor_Email').fill(data.email);
            if (data.phoneNumber) await this.page.locator('#Vendor_PhoneNumber').fill(data.phoneNumber);
            if (data.address) await this.page.locator('#Vendor_Address').fill(data.address);
            if (data.panNo) await this.page.locator('#Personnel_PANNo').fill(data.panNo);
            if (data.vendorCode) await this.page.locator('#personnelCode').fill(data.vendorCode);
            if (data.status) await this.page.locator('#statusListItemId').selectOption({ label: data.status });
            if (data.bankBranchName) await this.page.locator('#Vendor_BankBranchName').fill(data.bankBranchName);
            if (data.accountNumber) await this.page.locator('#Vendor_AccountNumber').fill(data.accountNumber);
            if (data.accountHoldersName) await this.page.locator('#Vendor_AccountHoldersName').fill(data.accountHoldersName);
            if (data.officeCode) await this.page.locator('#Vendor_OfficeCode').fill(data.officeCode);

        }else{
            if (data.companyName) await this.page.locator('#Vendor_CompanyName').fill(data.companyName);
            if (data.vendorDisplayName) await this.page.locator('#Vendor_VendorDisplayName').fill(data.vendorDisplayName);
            if (data.panNo) await this.page.locator('#Vendor_PANNo').fill(data.panNo);
            if (data.status) await this.page.locator('#statusListItemId').selectOption({ label: data.status });
            if (data.vendorCode) await this.page.locator('#vendorCode').fill(data.vendorCode);
            if (data.firstName) await this.page.locator('#Vendor_FirstName').fill(data.firstName);
            if (data.lastName) await this.page.locator('#Vendor_LastName').fill(data.lastName);
            if (data.gender) await this.page.locator('#GenderListItemId').selectOption({ label: data.gender });
            if (data.email) await this.page.locator('#Vendor_Email').fill(data.email);
            if (data.phoneNumber) await this.page.locator('#Vendor_PhoneNumber').fill(data.phoneNumber);
            if (data.address) await this.page.locator('#Vendor_Address').fill(data.address);
            if (data.bankBranchName) await this.page.locator('#Vendor_BankBranchName').fill(data.bankBranchName);
            if (data.accountNumber) await this.page.locator('#Vendor_AccountNumber').fill(data.accountNumber);
            if (data.accountHoldersName) await this.page.locator('#Vendor_AccountHoldersName').fill(data.accountHoldersName);
            if (data.officeCode) await this.page.locator('#Vendor_OfficeCode').fill(data.officeCode);

        }
        
    }

    async getWarningMessage() {
        await this.page.waitForTimeout(1000);
        if (await this.warningMessageLocator.isVisible()) {
            return await this.warningMessageLocator.textContent();
        }
        return null;
    }

    async verifyConsultantTableRow(data) {
        // Assumes first row is the newly added consultant
        const firstRow = this.page.locator('table tbody tr').first();
       
        
        await expect(firstRow.locator('td').nth(3)).toHaveText(data.panNo);
        await expect(firstRow.locator('td').nth(4)).toHaveText(data.email);
        await expect(firstRow.locator('td').nth(5)).toHaveText(data.phoneNumber);
        await expect(firstRow.locator('td').nth(6)).toHaveText(data.address);
        
        await expect(firstRow.locator('td').nth(8)).toHaveText(data.accountNumber);
        await expect(firstRow.locator('td').nth(9)).toHaveText(data.accountHoldersName);
        await expect(firstRow.locator('td').nth(10)).toHaveText(data.vendorType);
        await expect(firstRow.locator('td').nth(11)).toHaveText(data.status);
         if(data.vendorType=='Consultant'){
            const expectedName = `${data.firstName} ${data.lastName}`;
            await expect(firstRow.locator('td').nth(2)).toHaveText(expectedName);
        }else{
            await expect(firstRow.locator('td').nth(2)).toHaveText(data.companyName);
        }
        await expect(firstRow.locator('td').nth(7)).toHaveText(data.bankBranchName);
    }

}

module.exports = VendorPage;
