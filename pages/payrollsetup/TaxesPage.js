const { expect } = require('@playwright/test');
class TaxesPage {
    constructor(page) {
        this.page = page;
        this.payrollSetupMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[8]/span/span[2]');
        this.TaxesMenu = page.locator('a[href="/App/Taxes"]');
        this.pageHeading = page.locator('h1', { hasText: 'Taxes' });
        this.createNewtaxButton = page.getByRole('button', { name: '+ Create new tax' });
        this.saveButton = page.getByRole('button', { name: ' Save' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.taxnameInput=page.locator("#Tax_TaxName");
        this.displayname=page.locator("#Tax_DisplayName")
        this.glaccountinput= page.locator("#glAccountId");
        this.tdstype = page.locator("#tdsTypeId");
        this.maritalstatus = page.locator("#maritalStatusListItemId");
        this.addtaxrate = page.getByRole('button', { name: 'Add Tax Rate' });
        this.rate=page.locator("(//input[@title='Rate'])[1]")
        this.lowerlimit=page.locator("(//input[@title='Lower Limit Item'])[1]")
        this.upperlimit=page.locator("(//input[@title='Upper Limit'])[1]")
        this.rateinput=page.locator("#rate")
        this.lowerlimitinput=page.locator("#lowerLimit")
        this.upperlimitinput=page.locator("#upperLimit")
        this.startdate=page.locator("#startDate")
        this.enddate=page.locator("#endDate")
        this.gridSaveButton = page.locator('.k-grid-save-command');
        this.errorDialog = page.locator('.swal2-popup .swal2-html-container');
        this.warningMessageLocator = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');
    }

    async navigateToPayrollSetup() {
        await this.payrollSetupMenu.click();
    }
    async navigateToTaxes() {
        await this.TaxesMenu.click();
        await this.page.waitForTimeout(1000);
        await expect(this.pageHeading).toBeVisible();
    }
    async openCreateNewtax() {
        await this.createNewtaxButton.click();
    }
    async clickSave() {
        await this.saveButton.click();
    }
    async clickCancel() {
        await this.cancelButton.click();
    }
    async getRequiredFieldErrors() {
        return {
            taxname: this.page.locator('#Tax_TaxName-error'),
            glaccount: this.page.locator('#glAccountId-error'),
            tdstype: this.page.locator('#tdsTypeId-error'),
            maritalstatus: this.page.locator('#maritalStatusListItemId-error'),
        };
    }
    async filltaxForm(Data) {
        await this.taxnameInput.fill(Data.taxname)
        await this.displayname.fill(Data.displayname)
        await this.glaccountinput.selectOption({ label: Data.glaccount});
        await this.tdstype.selectOption({label: Data.tdstype});
        await this.maritalstatus.selectOption({label: Data.maritalstatus})
    }

    async clickaddtaxrate(){
        await this.addtaxrate.click();
    }
    async filltaxrate(Data){
        await this.rateinput.fill(Data.rate);
        await this.lowerlimit.click();
        await this.lowerlimitinput.fill(Data.lowerlimit)
        await this.upperlimit.click();
        await this.upperlimitinput.fill(Data.upperlimit);
        await this.startdate.fill(Data.startdate);
        await this.enddate.fill(Data.enddate);
        
    }
    async fillinvalidrate(Data){
        await this.lowerlimit.click();
        await this.lowerlimitinput.fill(Data.lowerlimit)
        await this.upperlimit.click();
        await this.upperlimitinput.type(Data.upperlimit);
        await this.startdate.fill(Data.startdate);
        await this.enddate.fill(Data.enddate);
        await this.rate.click();
        await this.rateinput.fill(Data.rate);
        await this.page.waitForTimeout(4000);
    }
    async fillinvalidlimit(Data){
        await this.startdate.fill(Data.startdate);
        await this.enddate.fill(Data.enddate);
        await this.page.waitForTimeout(1000);
        await this.rate.click();
        await this.rateinput.fill(Data.rate);
        await this.lowerlimit.click();
        await this.lowerlimitinput.fill(Data.lowerlimit)
        await this.upperlimit.click();
        await this.upperlimitinput.type(Data.upperlimit);
    }

    async fillinvaliddate(Data){
        await this.rateinput.fill(Data.rate);
        await this.lowerlimit.click();
        await this.lowerlimitinput.fill(Data.lowerlimit)
        await this.upperlimit.click();
        await this.upperlimitinput.type(Data.upperlimit);
        await this.startdate.fill(Data.startdate);
        await this.enddate.fill(Data.enddate);
        await this.page.waitForTimeout(1000);
    }

    async clickgridsave(){
        await this.gridSaveButton.click();
    }

    async getWarningMessage() {
        await this.page.waitForTimeout(1000);
        if (await this.warningMessageLocator.isVisible()) {
            return await this.warningMessageLocator.textContent();
        }
        return null;
    }

    async veifytaxrateingrid(data){
        const lastRow = this.page.locator('#taxRateGrid table tbody tr').last();
        await expect(lastRow.locator('td').nth(2)).toHaveText(data.rate);
        await expect(lastRow.locator('td').nth(3)).toHaveText(data.lowerlimit);
        await expect(lastRow.locator('td').nth(4)).toHaveText(data.upperlimit);
        await expect(lastRow.locator('td').nth(5)).toHaveText(data.startdate);
        await expect(lastRow.locator('td').nth(6)).toHaveText(data.enddate); 

    }
    async verifytaxTableRow(data) {
        // Assumes first row is the newly added job position
        const firstRow = this.page.locator('table tbody tr').first();
        await expect(firstRow.locator('td').nth(2)).toHaveText(data.taxname);
        await expect(firstRow.locator('td').nth(3)).toHaveText(data.displayname);
        const accountName = data.glaccount.split(' ').slice(1).join(' ');
        await expect(firstRow.locator('td').nth(4)).toHaveText(accountName);
        await expect(firstRow.locator('td').nth(5)).toHaveText(data.tdstype);
        await expect(firstRow.locator('td').nth(6)).toHaveText(data.maritalstatus);
    }
}

module.exports = TaxesPage;