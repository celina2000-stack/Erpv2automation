const { expect } = require('@playwright/test');

class ChartofaccountPage {
    constructor(page) {
        this.page = page;
        this.accountsMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[10]/span/span[2]');
        this.coaMenu = page.locator('a[href="/App/GLAccounts"]');
        this.firstDataRow = page.locator('tr[role="row"]:not(:has(th))').first();
        this.createNewButton = page.getByRole('button', { name: /Create new/ });
        this.saveButton = page.getByRole('button', { name: /Save/ });
        this.expandAllButton = page.getByRole('button', { name: /ExpandAll/ });
        this.glAccountUseTypeSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Ledger Item' }) });
        this.openingBalanceSection = page.getByText('Opening Balance', { exact: true })
        // Toast/warning locator for error/warning messages (like ServiceAssignmentPage)
        this.warningMessageLocator = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');
        // Chart of Account main fields
        this.accountNumberInput = page.locator('#GLAccount_AccountNumber');
        this.accountNameInput = page.locator('#GLAccount_AccountName');
        this.isDebitSelect = page.locator('#isDebit');
        this.glAccountUseTypeSelect = page.locator('#gLAccountUseTypeListItemId');
        this.relatedToSelect = page.locator('#gLAccountRelatedToListItemId');
        this.currencySelect = page.locator('#countryCurrencyId');
        this.statusSelect = page.locator('#gLAccountStatusListItemId');
        this.descriptionInput = page.locator('#GLAccount_Description');
        //Opening balance
        this.accountingyearSelect=page.locator('#glAccountingYearId');
        this.rateInput=page.locator('#GLAccount_ForexRate');
        this.forexamountInput=page.locator('#GLAccount_ForexAmount');
        this.obtransactionTypeSelect=page.locator('#balancedebit');
        this.openingBalanceInput = page.locator('#openingBalance');

        // Tax Detail fields
        this.taxcheckbox=page.locator('#gL_AccountIsTaxCheckBox');
        this.taxNameInput = page.locator('#taxName');
        this.taxRateInput = page.locator('#taxRate');
        this.tdsTypeSelect = page.locator('#tdsTypeId');
        this.taxStartDateInput = page.locator('#StartDateAD');
        this.taxEndDateInput = page.locator('#EndDateAD'); 
    }

     async navigateaccounts() {
        await this.accountsMenu.click();
    }

    async navigateTocoa() {
        await this.coaMenu.click();
        await this.page.waitForTimeout(3000);
        await expect(this.page).toHaveURL(/.*GLAccounts.*/);
    }

    async clickFirstDataRow() {
        await this.firstDataRow.click();
    }

    async clickCreateNew() {
        await this.createNewButton.click();
        await this.page.waitForTimeout(1000); // Wait for the create button action to complete
    }

    async clickSave() {
        await this.saveButton.click();
        await this.page.waitForTimeout(2000); // Wait for the save action to complete
    }

    async getRequiredFieldErrors() {
        // Returns an object with locators for each required field error message using error message IDs or selectors
        return {
            accountNumber: this.page.locator('#GLAccount_AccountNumber-error'),
            accountName: this.page.locator('#GLAccount_AccountName-error'),
            currency: this.page.locator('#countryCurrencyId-error'),
        };
    }

    async expandAllRows() {
        await this.expandAllButton.click();
        await this.page.waitForTimeout(3000); // Wait for rows to expand
    }
    async clickAddForAccountName(accountName) {
        // Find the row containing the account name
        const row = this.page.locator('tr').filter({ hasText: accountName });
        // Click the first '+' button in the Action column of that row
        await row.locator('button').first().click();
        await this.page.waitForTimeout(2000); // Wait for the action to complete
    }

    async getParentGLAccountValue() {
        // fallback: try to get the value from the first visible input (may not be correct)
        const textbox = this.page.locator('form[role="form"] input[type="text"]').first();
        const value = await textbox.inputValue();
        console.log('Parent GLAccount value (input):', value);
        return value;
    }

    async selectGLAccountUseTypeLedgerItem() {
        await this.glAccountUseTypeSelect.selectOption({ label: 'Ledger Item' });
    }

    async isOpeningBalanceVisible() {
        return await this.openingBalanceSection.isVisible();
    }

    

    // Clicks the '+' button for the first row matching the given account name
    async clickAddForAccountNameAndWait(accountName) {
        const row = this.page.locator('tr').filter({ hasText: accountName }).first();
        await row.locator('button').first().click();
        await this.page.waitForTimeout(2000);
    }
    async clickEditforaccountName(accountName) {
        const row = this.page.locator('tr').filter({ hasText: accountName }).first();
        await row.locator('button').nth(1).click();
    }
    async clickdeleteforaccountName(accountName) {
        const row = this.page.locator('tr').filter({ hasText: accountName }).first();
        await row.locator('button').nth(2).click();
    }

    // Returns the warning message if visible, otherwise null
    async getAddChildWarningMessage() {
        await this.page.waitForTimeout(1000);
        if (await this.warningMessageLocator.isVisible()) {
            return await this.warningMessageLocator.textContent();
        }
        return null;
    }

    async checkTaxCheckbox() {
        
        if (!(await this.taxcheckbox.isChecked())) {
            await this.taxcheckbox.check();
            await this.page.waitForTimeout(2000); // Wait for UI to update}
        }
    }

    // Returns true if the Tax Detail section is visible
    async isTaxDetailSectionVisible() {
        return await this.page.getByRole('heading', { name: /Tax Details/i }).isVisible();
    }
     // Returns locators for required field errors in the Tax Detail section
    async getTaxDetailRequiredFieldErrors() {
        return {
            taxName: this.page.locator('#taxName-error'),
            tdsType: this.page.locator('#tdsTypeId-error'),
        };
    }
    // Fills Chart of Account and Tax Detail form fields using data from fixture or defaults
    async fillChartOfAccount(data) {
        await this.accountNumberInput.fill(data.accountNumber);
        await this.accountNameInput.fill(data.accountName);
        await this.currencySelect.selectOption({ label: data.currency });
        if (data.transactionType) await this.isDebitSelect.selectOption({ label: data.transactionType });
        if (data.glAccountUseType) await this.glAccountUseTypeSelect.selectOption({ label: data.glAccountUseType });
        if (data.relatedTo) await this.relatedToSelect.selectOption({ label: data.relatedTo });
        if (data.status) await this.statusSelect.selectOption({ label: data.status });
    }
    async fillopeningbalance(data) {
        if(data.glAccountUseType==='Ledger Item'){
            if (data.accountingyear) await this.accountingyearSelect.selectOption({ label: data.accountingyear });
            if(data.currency==='USD'){
                if (data.Rate) await this.rateInput.fill(data.Rate);
                if (data.Forexamount) await this.forexamountInput.fill(data.Forexamount);
            }
            if (data.obtransactionType) await this.obtransactionTypeSelect.selectOption({ label: data.obtransactionType });
            if (data.openingBalance) await this.openingBalanceInput.fill(data.openingBalance);
        }
    }
     async fillTaxDetails(data) {
        await this.taxNameInput.fill(data.taxName);
        await this.taxRateInput.fill(data.taxRate);
        if (data.tdsType) await this.tdsTypeSelect.selectOption({ label: data.tdsType });
        await this.taxStartDateInput.fill(data.startDate);
        await this.taxEndDateInput.fill(data.endDate);
    }
    // Navigates to Payroll Setup > Taxes
    async navigateToPayrollSetupTaxes() {
        // Click Payroll setup menu
        await this.page.getByRole('menuitem', { name: /Payroll setup/i }).click();
        // Click Taxes submenu
        await this.page.getByRole('menuitem', { name: /Taxes/i }).click();
        // Wait for the Taxes table to load
        await this.page.waitForTimeout(3000);
    }

    // Verifies that a tax with the given name and tds type exists in the Taxes table
    async verifyTaxInPayrollSetup(data) {
    const taxName = data.taxName;
    const tdsType = data.tdsType;
    // Find all rows in the tax table
    const rows = await this.page.locator('#TaxesTable tbody tr').all();
    let found = false;

    for (const row of rows) {
        const cells = await row.locator('td').all();
        if (cells.length < 6) continue; // ensure row has enough columns

        const taxNameCell = await cells[2].textContent(); // 3rd column
        const tdsTypeCell = await cells[5].textContent(); // 6th column
        if (taxNameCell && tdsTypeCell &&
            taxNameCell.trim() === taxName &&
            tdsTypeCell.trim() === tdsType) {
            found = true;
            break;
        }
    }
    if (!found) {
        throw new Error(`Tax with name '${taxName}' and TDS type '${tdsType}' not found in Payroll Setup > Taxes table.`);
    } 
}

    // Verifies that an account appears in the grid, under parent if specified, or as root if not
 async verifyAccountInGrid(coa) {
    const normalize = str => Number(str?.replace(/,/g, "").trim());

    const rows = await this.page
        .locator('#ChartOfAccountDetailGrid table')
        .nth(1)
        .locator('tr[role="row"]')
        .all();

    for (const row of rows) {
        const cells = await row.locator('td').all();
        const account = (await cells[5].textContent())?.trim();
        const parent  = (await cells[2].textContent())?.trim();
        const balance = normalize(await cells[6].textContent());
        const type    = (await cells[11].textContent())?.trim();

        if (account === coa.accountName && (!coa.parent || parent === coa.parent)) {
        if (coa.openingBalance && normalize(coa.openingBalance) !== balance) {
            throw new Error(`Balance mismatch for '${account}': expected '${coa.openingBalance}', found '${balance}'`);
        }
        if (coa.transactionType && coa.transactionType !== type) {
            throw new Error(`Type mismatch for '${account}': expected '${coa.transactionType}', found '${type}'`);
        }
        console.log(`Account '${account}' verified${coa.parent ? ` under '${coa.parent}'` : ""}`);
        return; // found and verified, exit
        }
    }

    // Not found: throw parent-specific message if parent exists
    if (coa.parent) {
        throw new Error(`Account '${coa.accountName}' under parent '${coa.parent}' not found in Chart of Accounts.`);
    } else {
        throw new Error(`Account '${coa.accountName}' not found in Chart of Accounts.`);
    }
    }
 
    async deleteconfirmation(){
             // Handle native confirmation dialog
        this.page.once('dialog', async dialog => {
            expect(dialog.message()).toContain('Are you sure you want to delete this item?');
            await dialog.accept(); // click OK
        });
    }
    // Deletes a Ledger Group with children and verifies the error dialog
    async verifydeletionerror() {
        // Wait for error/warning dialog and verify error
        const errorDialog = this.page.locator('div[role="dialog"], .swal2-popup, .modal-dialog');
        await errorDialog.waitFor({ state: 'visible', timeout: 5000 });

        const errorMsg = await errorDialog.textContent();
        expect(errorMsg).toContain('This GL Account is used in other GL Accounts, so it cannot be deleted.');

    }
}

module.exports = ChartofaccountPage;
