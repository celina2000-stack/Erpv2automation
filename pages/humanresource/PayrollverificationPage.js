const { expect } = require('@playwright/test');
const { readExcelDataBySheetName, findValueByLabel } = require('../../utils/excelReader');

class PayrollverificationPage {
   
    constructor(page) {
        this.page = page;
        this.humanResourceMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[1]/span');
        this.showEntriesDropdown = page.locator('//*[@id="PaymentBatchesTable_length"]/label/select');
        this.payrollMenu = page.locator('a[href="/App/Payroll/PayrollWizard"]');
        this.employeeTable = this.page.locator('#paymentEmployeeList table').nth(1);
    }

    async navigateToHumanResource() {
        await this.humanResourceMenu.click();
    }
    async navigateToPayroll() {
        await this.payrollMenu.click();
        await this.page.waitForTimeout(1000);
        await expect(this.page).toHaveURL(/.*PayrollWizard.*/);
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
        await this.page.waitForTimeout(500);
    }
    async clickNextButton() {
        // Click the Next button to proceed to employee list
        const nextButton = this.page.locator('button:has-text("Next")');
        await nextButton.click();
        await this.page.waitForTimeout(1000); // Wait for navigation or update
    }
    async verifyAllEmployeesPayrollDataFromExcel(filePath, monthLabel) {
      
    const rows = await this.page.locator('#paymentEmployeeList table').nth(1).locator('tr').all();
    const failedComparisons = [];

    for (const row of rows) {
      const name = await row.locator('td').nth(0).textContent();
      if (!name) continue;

      const trimmedName = name.trim();
      console.log(`Verifying payroll for: ${trimmedName} (${monthLabel})`);

      let excelData;
      try {
        excelData = readExcelDataBySheetName(filePath, trimmedName);
      } catch (err) {
        failedComparisons.push(`Sheet not found for employee "${trimmedName}"`);
        continue;
      }

      const expectedData = {
      basicSalary: findValueByLabel(excelData, 'Salary', monthLabel),
      grossIncome: findValueByLabel(excelData, 'Gross Salary', monthLabel),
      sst: findValueByLabel(excelData, 'SST', monthLabel),
      tds: findValueByLabel(excelData, 'TDS', monthLabel),
      totalDeduction: findValueByLabel(excelData, 'Total Deduction', monthLabel),
      netSalary: findValueByLabel(excelData, 'Net Salary', monthLabel),
    };
      // Capture errors from each employee verification
    const error = await this.verifyEmployeePayrollData(trimmedName, expectedData);
    if (error) failedComparisons.push(error);
    }
    if (failedComparisons.length > 0) {
    const summary = failedComparisons.join('\n');
    throw new Error(`\nPayroll verification failed for some employees:\n\n${summary}`);
    }
     console.log('All employee payrolls verified successfully.');
  }


    async verifyEmployeePayrollData(name, expectedData) {
      const actualData = await this.getEmployeePayrollData(name);
      let errorMessages = [];

      for (const key of Object.keys(expectedData)) {
        const actualRaw = actualData[key];
        const expectedRaw = expectedData[key];

        // Print actual and expected for every key
        console.log(`[${name}] Comparing ${key}: UI="${actualRaw}" vs Excel="${expectedRaw}"`);

        if (actualRaw == null || expectedRaw == null) {
          console.warn(
            `Skipping comparison for ${key} of ${name} due to missing value: UI="${actualRaw}", Excel="${expectedRaw}"`
          );
          continue;
        }

        const normalize = val => Number(String(val).replace(/,/g, '').trim());

        const actualValue = normalize(actualRaw);
        const expectedValue = normalize(expectedRaw);

        try {
          expect(actualValue).toBeCloseTo(expectedValue, 1);
        } catch (e) {
          errorMessages.push(
            `Mismatch in column "${key}" for employee "${name}": expected "${expectedValue}", but got "${actualValue}"`
          );
        }
      }
      if (errorMessages.length > 0) {
        return errorMessages.join('\n');
      } else {
        console.log(`✅ Correct calculation for employee: ${name}`);
        return null;
      }
    }


    
    async getEmployeeRowByName(name) {
        const table = this.page.locator('#paymentEmployeeList table').nth(1);
        return table.locator('tr', { hasText: name }).first();
    }
    async getEmployeePayrollData(name, shift = 0) {
    const row = await this.getEmployeeRowByName(name);

    return {
        name: await row.locator('td').nth(0).textContent(),
        basicSalary: await row.locator('td').nth(6).textContent(),
        providentFundBenefit: await row.locator('td').nth(7).textContent(),
        ssfBenefit: await row.locator('td').nth(8).textContent(),
        allowances: await row.locator('td').nth(9).textContent(),
        grossIncome: await row.locator('td').nth(10 + shift).textContent(),
        taxableGrossIncome: await row.locator('td').nth(11 + shift).textContent(),
        providentFundDeduction: await row.locator('td').nth(12 + shift).textContent(),
        ssfDeduction: await row.locator('td').nth(13 + shift).textContent(),
        cit: await row.locator('td').nth(14 + shift).textContent(),
        sst: await row.locator('td').nth(15 + shift).textContent(),
        tds: await row.locator('td').nth(16 + shift).textContent(),
        totalDeduction: await row.locator('td').nth(17 + shift).textContent(),
        netSalary: await row.locator('td').nth(18 + shift).textContent(),
    };
}

}

module.exports = PayrollverificationPage;
