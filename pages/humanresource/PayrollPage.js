const { expect } = require('@playwright/test');
class PayrollPage {   
    constructor(page) {
        this.page = page;
        this.humanResourceMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[1]/span');
        this.showEntriesDropdown = page.locator('//*[@id="PaymentBatchesTable_length"]/label/select');
        this.payrollMenu = page.locator('a[href="/App/Payroll/PayrollWizard"]');
        this.employeeTable = this.page.locator('#paymentEmployeeList table').nth(1);
        this.oneTimeAdjustmentInput = page.locator('//*[@id="PaymentBatchInformationsTab"]/form/div[4]/div[1]/span');
        this.contractTypeInput = page.locator('//*[@id="PaymentBatchInformationsTab"]/form/div[4]/div[2]/span');
        this.batchTypeInput = page.locator('#paymentBatchTypeListItemId');
        this.reportingPeriodInput = page.locator('select#reportingPeriodId');
        this.bankInput = page.locator('select#bankId');
        this.countryCurrencyInput = page.locator('select#countryCurrencyId');
        this.payday= page.locator('#PaymentBatch_PayDate');
        this.note=page.locator('#PaymentBatch_PaymentBatchNote');
    }

    async navigateToHumanResource() {
        await this.humanResourceMenu.click();
    }
    async navigateToPayroll() {
        await this.payrollMenu.click();
        await this.page.waitForTimeout(1000);
        await expect(this.page).toHaveURL(/.*PayrollWizard.*/);
    }

     // Click the +Create button in the Payment Batch section
    async clickCreatePaymentBatch() {
        const createBtn = this.page.locator('//*[@id="CreateNewPaymentBatchButton"]');
        await createBtn.click();
    }

    // Click the Save button in the Create new payment batch dialog
    async clickSaveOnCreateBatch() {
        const saveBtn = this.page.locator('//button[@class="btn btn-primary save-button"]');
        await saveBtn.click();
    }
    // Returns an object with locators for each required field error message in the create payment batch dialog
    async getRequiredFieldErrors() {
        return {
            batchType: this.page.locator('#paymentBatchTypeListItemId-error'),
            reportingPeriod: this.page.locator('#reportingPeriodId-error'),
            bank: this.page.locator('#bankId-error'),
            // contractType: this.page.locator('#contractTypeId-error'),
            countryCurrency: this.page.locator('#countryCurrencyId-error')
        };
    }

    // Fill the create payment batch form with provided data
    async fillPaymentBatch(data) {
        await this.batchTypeInput.selectOption({ label: data.batchType });
        await this.reportingPeriodInput.selectOption({ label: data.reportingPeriod });
        await this.bankInput.selectOption({ label: data.bank });
        await this.countryCurrencyInput.selectOption({ label: data.countryCurrency });
        await this.payday.click();
        await this.payday.fill(data.payday);
        // Select One Time Adjustment
        if (data.oneTimeAdjustment) {
            await this.oneTimeAdjustmentInput.click();
            await this.page.getByRole('option', { name: data.oneTimeAdjustment }).click();
        }

        // Select Contract Type
        if (data.contractType) {
            await this.contractTypeInput.click();
            await this.page.getByRole('option', { name: data.contractType }).click();
        }
        await this.note.fill(data.note);
        await this.page.waitForTimeout(1000); // Wait for form to update
}
// Verifies that the payment batch was saved successfully and appears in the table
    async verifyPaymentBatchSaved(batch, expect) {
        // Check for the success message
        await expect(this.page.locator('text=Saved Successfully')).toBeVisible({ timeout: 10000 });
        // Optionally, also verify the new batch appears in the payment batch table
        await this.page.waitForTimeout(2000);
        // Get the first data row (skip header)
        const firstRow = this.page.locator('#PaymentBatchesTable tr').nth(1);
        // Check columns: adjust nth() if your table structure is different
        // Example: 1=Reporting Period, 2=Contract Type, 3=Bank
        const reportingPeriodCell = firstRow.locator('td').nth(2);
        const contractTypeCell = firstRow.locator('td').nth(3);
        const bankCell = firstRow.locator('td').nth(4);
        const batchstatuscell= firstRow.locator('td').nth(5);
        const RemarksCell = firstRow.locator('td').nth(6);
        await expect(reportingPeriodCell).toHaveText(batch.reportingPeriod);
        await expect(bankCell).toHaveText(batch.bank);
        if (batch.contractType) {
            await expect(contractTypeCell).toHaveText(batch.contractType);
        }
        await expect(batchstatuscell).toHaveText('Draft');
        await expect(RemarksCell).toHaveText(batch.note);
    }

     async setShowEntriesTo25() {
        // Select '25' from the Show entries dropdown
        await this.showEntriesDropdown.selectOption('25');
        await this.page.waitForTimeout(500); // Wait for grid to update
    }


    async clickReportingPeriodRow(periodName) {
    const row = this.page.locator(`//table[@id="PaymentBatchesTable"]//tr[td[normalize-space()="${periodName}"]]`);
    await row.first().click(); // Just to be safe in case multiple matches
    await this.page.waitForTimeout(500); // or use waitForLoadState() if navigation
    }
    async selectAllEmployees() {
        // Select the 'Select All' checkbox beside Department
        const selectAllCheckbox = this.page.locator('//*[@id="select-all"]'); // Adjust selector for the correct checkbox
        await selectAllCheckbox.first().click();
        await this.page.waitForTimeout(500); // Wait for the checkbox to be selected
        // Wait for dialog and click Yes
        const yesButton = this.page.locator('button:has-text("Yes")');
        await yesButton.click();
        await this.page.waitForTimeout(500); // Wait for the dialog to close
        // Re-select the checkbox
        await selectAllCheckbox.first().click();
        await this.page.waitForTimeout(10000);
    }
    async clickNextButton() {
        // Click the Next button to proceed to employee list
        const nextButton = this.page.locator('button:has-text("Next")');
        await nextButton.click();
        await this.page.waitForTimeout(1000); // Wait for navigation or update
    }
    async verifyAllEmployeesPayrollData(payrollFixture) {
    // Get all rows in the payroll grid
    const rows = await this.page.locator('#paymentEmployeeList table').nth(1).locator('tr').all();

        for (const row of rows) {
            const name = await row.locator('td').nth(0).textContent();
            if (!name) continue;

            const trimmedName = name.trim();
            console.log(`Verifying payroll for: ${trimmedName}`);

            const expectedData = payrollFixture.employees.find(e => e.name.trim() === trimmedName);

            if (expectedData) {
                await this.verifyEmployeePayrollData(trimmedName, expectedData);
            } else {
                throw new Error(`No fixture data found for employee: ${trimmedName}`);
            }
        }
}

    async verifyEmployeePayrollData(name, expectedData) {
    const actualData = await this.getEmployeePayrollData(name);
    // Compare all columns in expectedData
    for (const key of Object.keys(expectedData)) {
        if (actualData[key] !== undefined && expectedData[key] !== undefined) {
            const actualValue = actualData[key].replace(/,/g, '').trim();
            const expectedValue = expectedData[key].replace(/,/g, '').trim();

            try {
                await expect(actualValue).toBe(expectedValue);
            } catch (e) {
                throw new Error(`Mismatch in column "${key}" for employee "${name}": expected "${expectedValue}", but got "${actualValue}"`);
            }
        }
    }
}

    
    async getEmployeeRowByName(name) {
        const table = this.page.locator('#paymentEmployeeList table').nth(1);
        return table.locator('tr', { hasText: name }).first();
    }
    async getEmployeePayrollData(name) {
    const row = await this.getEmployeeRowByName(name);
    return {
        name: await row.locator('td').nth(0).textContent(),
        officeName: await row.locator('td').nth(1).textContent(),
        designation: await row.locator('td').nth(2).textContent(),
        workedDays: await row.locator('td').nth(3).textContent(),
        paidLeave: await row.locator('td').nth(4).textContent(),
        unpaidLeave: await row.locator('td').nth(5).textContent(),
        basicSalary: await row.locator('td').nth(6).textContent(),
        providentFundBenefit: await row.locator('td').nth(7).textContent(),
        ssfBenefit: await row.locator('td').nth(8).textContent(),
        allowances: await row.locator('td').nth(9).textContent(),
        grossIncome: await row.locator('td').nth(10).textContent(),
        taxableGrossIncome: await row.locator('td').nth(11).textContent(),
        providentFundDeduction: await row.locator('td').nth(12).textContent(),
        ssfDeduction: await row.locator('td').nth(13).textContent(),
        cit: await row.locator('td').nth(14).textContent(),
        sst: await row.locator('td').nth(15).textContent(),
        tds: await row.locator('td').nth(16).textContent(),
        totalDeduction: await row.locator('td').nth(17).textContent(),
        netSalary: await row.locator('td').nth(18).textContent(),
    };
}

   

}

module.exports = PayrollPage;
