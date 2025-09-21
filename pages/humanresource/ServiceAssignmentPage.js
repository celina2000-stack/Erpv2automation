    
const { expect } = require('@playwright/test');

class ServiceAssignmentPage {
    
    constructor(page) {
    this.page = page;
    this.createbutton = page.locator('#StepperCreateNewServiceAssignmentButton');
    this.startDateInput = page.locator('#ServiceAssignment_StartDate');
    this.endDateInput = page.locator('#ServiceAssignment_EndDate');
    this.startMitiInput = page.locator('#EmployeeContract_StartMiti');
    this.endMitiInput = page.locator('#EmployeeContract_EndMiti');
    this.maritalStatusInput = page.locator('#maritalStatus');
    this.officeSelect = page.locator('#officeId');
    this.jobPositionSelect = page.locator('#jobPositionId');
    this.supervisorInput = page.locator('//*[@id="ServiceAssignmentInformationsForm"]/div[2]/div[1]/span');
    this.contractTypeSelect = page.locator('#serviceAssignmentContractTypeId');
    this.contractProfileSelect = page.locator('#contractProfileId');
    this.employeeStatusSelect = page.locator('#employeeStatusListItemId');
    this.currencySelect = page.locator('#countryCurrencyId');
    this.contractSalaryInput = page.locator('#contractSalary');
    this.resignedDateInput = page.locator('#ServiceAssignment_ResignedDate');
    this.resignedMitiInput = page.locator('#ServiceAssignment_ResignedMiti');
    this.femaleRebateCheckbox = page.locator('#ServiceAssignment_FemaleRebate');
    this.disabledCheckbox = page.locator('#ServiceAssignment_IsDisabled');
    this.deductionsTabSelector = '//*[@id="tab2"]';
    this.contractsalary=page.locator('//*[@id="ServiceAssignmentInformationsForm"]/div[3]/div[4]/label');
    this.body=page.locator('#kt_app_body');
    // --- Locators for Benefits ---
    this.benefitAddButton = this.page.locator('//*[@id="serviceAssignmentPaymentDetailBenefitGrid"]/div[1]/button[1]');
    this.benefitRowPaymentItem = this.page.locator('tr[role="row"] td [role="combobox"]').first();
    this.benefitRowPaymentBasis = this.page.locator('tr[role="row"] td [role="combobox"]').nth(1);
    this.benefitRowRate = this.page.locator('tr[role="row"] td input[type="text"]').nth(1);
    this.benefitRowStatus = this.page.locator('tr[role="row"] td [role="combobox"]').nth(2);
    this.benefitRowSaveButton = this.page.locator('tr[role="row"] button:has-text("Save")');
    this.benefitDuplicateError = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');

    // --- Locators for Deductions ---
    this.deductionTabButton = this.page.locator('//*[@id="tab2"]');
    this.deductionAddButton = this.page.locator('//*[@id="serviceAssignmentPaymentDetailDeductionGrid"]/div[1]/button[1]');
    this.deductionRowPaymentItem = this.page.locator('tr[role="row"] td [role="combobox"]').first();
    this.deductionRowPaymentBasis = this.page.locator('tr[role="row"] td [role="combobox"]').nth(1);
    this.deductionRowRate = this.page.locator('tr[role="row"] td input[type="text"]').nth(1);
    this.deductionRowStatus = this.page.locator('tr[role="row"] td [role="combobox"]').nth(2);
    this.deductionRowSaveButton = this.page.locator('tr[role="row"] button:has-text("Save")');
    this.deductionDuplicateError = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');

    // --- Locators for Rebates ---
    this.rebateTabButton = this.page.locator('//*[@id="tab3"]');
    this.rebateAddButton = this.page.locator('//*[@id="RebateGrid"]/div[1]/button[1]');
    this.rebateRowInsurance = this.page.locator('tr[role="row"] td [role="combobox"]').first();
    this.rebateRowInsuranceAmount = this.page.locator('tr[role="row"] td input[type="text"]').nth(8);  // adjust index if needed
    this.rebateRowSaveButton = this.page.locator('tr[role="row"] button:has-text("Save")');
    this.rebateRowDeleteButton = this.page.locator('tr[role="row"] button:has-text("Delete")'); // for action
    this.rebateDuplicateError = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');

}

    async clickCreateButton() {
        await this.createbutton.click(); 
        await this.page.waitForTimeout(4000); // Wait for the create button action to complete  
    }
    async selectSupervisor(supervisor) {
            await this.supervisorInput.click();
            await this.page.getByRole('option', { name: supervisor }).click();
        }
    async fillServiceAssignmentForm(serviceData) {
        await this.startDateInput.type(serviceData.startDate);
        await this.endDateInput.fill(serviceData.endDate);
        await this.officeSelect.selectOption(serviceData.office);
        await this.jobPositionSelect.selectOption(serviceData.jobPosition);
        await this.selectSupervisor(serviceData.supervisor);
        await this.contractTypeSelect.selectOption(serviceData.contractType);
        await this.contractProfileSelect.selectOption(serviceData.contractProfile);
        await this.employeeStatusSelect.selectOption(serviceData.employeeStatus);
        if(serviceData.employeeStatus=="Resigned"){
            await this.resignedDateInput.fill(serviceData.resignedDate);
            await this.resignedMitiInput.fill(serviceData.resignedMiti);
        }
        if (serviceData.female) {
            await this.femaleRebateCheckbox.check();
        }
        if (serviceData.isDisabled) {
            await this.disabledCheckbox.check();
        }

        // Optionally click Save here if needed
        // await this.page.locator('button:has-text("Save")').click();

        await this.page.waitForTimeout(2000); // Optional
    }
    
    async selectContractProfile(profileName) {
        await this.page.locator('label:has-text("Contract profile") + div select, select[aria-label="Contract profile"], select[name="Contract profile"]').selectOption({ label: profileName });
    }
    
    async getContractSalaryValue() {
        // Assumes the Contract Salary field is a disabled input or textbox
        const value = await this.page.locator('input[aria-label="Contract Salary"], input[disabled][name="Contract Salary"], input[disabled][aria-label*="Contract Salary"], input[disabled][placeholder*="Contract Salary"], input[disabled][type="text"]').inputValue().catch(async () => {
            // fallback for textbox
            return await this.page.locator('textbox[aria-label="Contract Salary"], [role="textbox"][aria-label*="Contract Salary"]').textContent();
        });
        // Remove commas and parse as float
        return value ? value.replace(/,/g, '').trim() : '';
    }

    async clickSaveButton() {
        // Click the Save button in the service assignment dialog
        await this.page.locator('button:has-text("Save")').click();
        await this.page.waitForTimeout(3000);
    }

    async getRequiredFieldErrors() {
        // Returns an object with locators for each required field error message using error message IDs for service assignment
        return {
            office: this.page.locator('#officeId-error'),
            jobPosition: this.page.locator('#jobPositionId-error'),
            supervisor: this.page.locator('#supervisorIds-error'),
            contractType: this.page.locator('#serviceAssignmentContractTypeId-error'),
            employeeStatus: this.page.locator('#employeeStatusListItemId-error'),
        };
    }
    async getBenefitsGridRows() {
            // Adjust selector as needed for your grid
            const rows = await this.page.$$('#serviceAssignmentPaymentDetailBenefitGrid table.k-grid-table tbody tr');
            return Promise.all(rows.map(async row => {
                const cells = await row.$$('td');
                return {
                    paymentItem: await cells[0].innerText(),
                    paymentType: await cells[1].innerText(),
                    paymentBasis: await cells[2].innerText(),
                    rate: await cells[3].innerText()
                };
            }));
    }

    async switchToDeductionsTab() {
        await this.page.click(this.deductionsTabSelector);
    }

    async getDeductionsGridRows() {
        const rows = await this.page.$$('#serviceAssignmentPaymentDetailDeductionGrid table.k-grid-table tbody tr');
        return Promise.all(rows.map(async row => {
            const cells = await row.$$('td');
            return {
                paymentItem: await cells[0].innerText(),
                paymentType: await cells[1].innerText(),
                paymentBasis: await cells[2].innerText(),
                rate: await cells[3].innerText()
            };
        }));
    }

    // --- Methods for Rebates ---
    async switchToRebateTab() {
        await this.rebateTabButton.click();
        await this.page.waitForTimeout(500);
    }

    async getRebateGridRows() {
        const rows = await this.page.$$('#RebateGrid table.k-grid-table tbody tr');
        return Promise.all(rows.map(async row => {
            const cells = await row.$$('td');
            return {
                insurance: await cells[4].innerText(),
                insuranceAmount: await cells[5].innerText()
            };
        }));
    }
    // --- Methods for Benefits ---
    async addBenefitRow({ paymentItem, paymentBasis, rate, status }) {
        await this.benefitAddButton.click();
        await this.benefitRowPaymentItem.click();
        await this.page.getByRole('option', { name: paymentItem }).click();
        await this.page.waitForTimeout(500); // Wait for dropdown to update
        await this.benefitRowPaymentBasis.click();
        await this.page.getByRole('option', { name: paymentBasis }).click();
        await this.page.waitForTimeout(500); 
        await this.benefitRowRate.click();
        await this.benefitRowRate.type(rate);
        await this.page.waitForTimeout(500); 
        await this.benefitRowStatus.click();
        await this.page.locator('#statusId_listbox').getByRole('option', { name: status, exact: true })
        .click();
        await this.page.locator("//button[@class='k-grid-save-command k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary k-icon-button']").click();
        await this.page.waitForTimeout(500);
    }
    async getDuplicateBenefitError() {
        // Wait for error toast or grid error
        await this.page.waitForTimeout(1000);
        if (await this.benefitDuplicateError.isVisible()) {
            return await this.benefitDuplicateError.textContent();
        }
        return null;
    }

    // --- Methods for Deductions ---
    async addDeductionRow({ paymentItem, paymentBasis, rate, status }) {
        await this.deductionAddButton.click();
        await this.deductionRowPaymentItem.click();
        await this.page.getByRole('option', { name: paymentItem }).click();
        await this.page.waitForTimeout(500); // Wait for dropdown to update
        await this.deductionRowPaymentBasis.click();
        await this.page.getByRole('option', { name: paymentBasis }).click();
        await this.page.waitForTimeout(500);
        await this.deductionRowRate.click();
        await this.deductionRowRate.type(rate);
        await this.deductionRowStatus.click();
         await this.page.locator('#statusId_listbox').getByRole('option', { name: status, exact: true })
        .click();
        await this.page.locator("//button[@class='k-grid-save-command k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary k-icon-button']").click();
        await this.page.waitForTimeout(500);
    }
    async getDuplicateDeductionError() {
        await this.page.waitForTimeout(1000);
        if (await this.deductionDuplicateError.isVisible()) {
            return await this.deductionDuplicateError.textContent();
        }
        return null;
    }

    async addRebateRow({ insurance, insuranceAmount }) {
        await this.rebateAddButton.click();
        await this.rebateRowInsurance.click();
        await this.page.getByRole('option', { name: insurance }).click();
        await this.page.waitForTimeout(500);
        await this.rebateRowInsuranceAmount.click();
        await this.rebateRowInsuranceAmount.type(insuranceAmount);
        await this.page.waitForTimeout(500);

         await this.page.locator("//button[@class='k-grid-save-command k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary k-icon-button']").click();
        await this.page.waitForTimeout(1000);
    }

    async getDuplicateRebateError() {
        await this.page.waitForTimeout(1000);
        if (await this.rebateDuplicateError.isVisible()) {
            return await this.rebateDuplicateError.textContent();
        }
        return null;
    }
}

module.exports = ServiceAssignmentPage;
