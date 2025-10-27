const { expect } = require('@playwright/test');
class OfficePage {
    constructor(page) {
        this.page = page;
        this.payrollSetupMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[8]/span/span[2]');
        this.officesMenu = page.locator('a[href="/App/Offices"]');
        this.pageHeading = page.locator('//*[@id="kt_app_toolbar_container"]/div[1]/h1');
        this.createNewOfficeButton = page.getByRole('button', { name: '+ Create new office' });
        this.saveButton = page.getByRole('button', { name: ' Save' });
        this.officeNameInput = page.getByRole('textbox', { name: 'Office name' });
        this.statusDropdown = page.locator('#OfficeStatusListItemId');
        this.weekendDayDropdown = page.locator('//*[@id="officeForm"]/div/div[10]/span/div');
        this.createOfficeDialog = page.locator('div[role="dialog"]:has-text("Create new office")');
        this.officeDropdown = page.locator('#parentOfficeId');
        this.officeStartTimeInput = page.getByRole('textbox', { name: 'Office Start Time' });
        this.officeEndTimeInput = page.getByRole('textbox', { name: 'Office End Time' });
        this.breakStartTimeInput = page.getByRole('textbox', { name: 'Break Start Time' });
        this.breakEndTimeInput = page.getByRole('textbox', { name: 'Break End Time' });
        this.weekendDayOption = name => page.getByRole('option', { name });
        this.errorDialog = page.locator('.swal2-popup .swal2-html-container');
        this.workingHoursInput = page.locator('#Office_WorkingHours');
        this.workingDaysPerMonthInput = page.locator('#Office_WorkingDaysPerMonth')
        this.warningMessageLocator = this.page.locator('.toast-message, .k-notification-error, .k-grid .k-grid-content .k-grid-norecords');
    }

    async openCreateNewOfficeDialog() {
        await this.createNewOfficeButton.click();
    }

    async clickSave() {
        await this.saveButton.click();
        await this.page.waitForTimeout(1000); // Wait for potential validation messages to appear
    }

    async getRequiredFieldErrors() {
        // Returns an object with locators for each required field error message using error message IDs
        return {
            office: this.page.locator('#office-error'),
            officeName: this.page.locator('#officeName-error'),
            status: this.page.locator('#OfficeStatusListItemId-error'),
            weekendDay: this.page.locator('#weekendDay-error'),
        };
    }

    async navigateToPayrollSetup() {
        await this.payrollSetupMenu.click();
    }

    async navigateToOffices() {
        await this.officesMenu.click();
        await this.page.waitForTimeout(2000);
        await expect(this.pageHeading).toBeVisible();
    }

    async fillOfficeForm(officeData) {
        await this.officeDropdown.selectOption({ label: officeData.office });
        await this.officeNameInput.fill(officeData.officeName);
        await this.officeStartTimeInput.fill(officeData.startTime);
        await this.officeEndTimeInput.fill(officeData.endTime);
        await this.breakStartTimeInput.fill(officeData.breakStartTime);
        await this.breakEndTimeInput.fill(officeData.breakEndTime);
        await this.statusDropdown.selectOption({ label: officeData.status });
        for (const day of officeData.weekendDays) {
            await this.weekendDayDropdown.click();
            await this.weekendDayOption(day).click();
            await this.page.waitForTimeout(500); // Small delay to ensure the dropdown processes each selection
        }
        if (officeData.workingHours) await this.workingHoursInput.fill(officeData.workingHours);
        if (officeData.workingDaysPerMonth) await this.workingDaysPerMonthInput.fill(officeData.workingDaysPerMonth);
    }

    to12HourFormat(time24) {
        let [hour, minute] = time24.split(':').map(Number);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12; // convert 0 -> 12, 13 -> 1, etc.
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}${suffix}`;
    }
    async verifyOfficeTableRow(data) {
        // Assumes first row is the newly added office
        const firstRow = this.page.locator('table tbody tr').first();
        await expect(firstRow.locator('td').nth(2)).toHaveText(data.officeName);
        await expect(firstRow.locator('td').nth(3)).toHaveText(this.to12HourFormat(data.startTime));
        await expect(firstRow.locator('td').nth(4)).toHaveText(this.to12HourFormat(data.endTime));
        await expect(firstRow.locator('td').nth(5)).toHaveText(data.workingDaysPerMonth);
        await expect(firstRow.locator('td').nth(6)).toHaveText(data.workingHours);
        await expect(firstRow.locator('td').nth(7)).toHaveText(data.office);
        await expect(firstRow.locator('td').nth(8)).toHaveText(data.status);
    }

    async getWarningMessage() {
        await this.page.waitForTimeout(1000);
        if (await this.warningMessageLocator.isVisible()) {
            return await this.warningMessageLocator.textContent();
        }
        return null;
    }
}

module.exports = OfficePage;
