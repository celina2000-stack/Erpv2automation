const { expect } = require('@playwright/test');

class EmployeePage {
    constructor(page) {
        this.page = page;
        this.createButton = page.locator('button:has-text("Create new employee")');
        this.firstNameInput = page.locator('#Employee_FirstName');
        this.lastNameInput = page.locator('#Employee_SurName');
        this.genderSelect = page.locator('#GenderListItemId');
        this.citizenshipNumberInput = page.locator('#Employee_CitizenshipNumber');
        this.panNumberInput = page.locator('#Employee_PANNumber');
        this.maritalStatusSelect = page.locator('#maritalStatusListItemId');
        this.dateOfBirthInput = page.locator('#Dob');
        this.roleSelect = page.locator('//*[@id="basicInformationDiv"]/div[10]/span[1]');
        this.addressInput = page.locator('#Employee_Address');
        this.phoneNumberInput = page.locator('#Employee_PhoneNumber');
        this.emailInput = page.locator('#Employee_EmailAddress');
        this.dateOfHireInput = page.locator('#DateOfHire');
        this.usernameInput = page.locator('#Employee_UserName');
        this.passwordInput = page.locator('#Employee_Password');
        this.repeatPasswordInput = page.locator('#Employee_PasswordRepeat');
        this.humanResourceMenu = page.locator('//*[@id="#kt_app_sidebar_menu"]/div[1]/span');
        this.employeesMenu = page.locator('a[href="/App/Employees"]');
        this.next=page.locator('[data-kt-stepper-action="next"]');
    }

    async navigateToHumanResource() {
        await this.humanResourceMenu.click();
    }

    async navigateToEmployees() {
        await this.employeesMenu.click();
        await this.page.waitForTimeout(2000);
        await expect(this.page).toHaveURL(/.*Employees.*/);
    }
    async setShowEntriesTo25(showentries) {
        // Select '25' from the Show entries dropdown
        const showEntriesDropdown = this.page.locator(showentries);
        await showEntriesDropdown.selectOption('25');
        await this.page.waitForTimeout(500); // Wait for grid to update
    }
    async clickCreateButton() {
        await this.createButton.click();
        await this.page.waitForTimeout(5000); // Wait for the create button action to complete
    }
    async createEmployee(employeeData) {
        await this.firstNameInput.fill(employeeData.firstName);
        await this.lastNameInput.fill(employeeData.lastName);
        await this.genderSelect.selectOption({ label: employeeData.gender });
        await this.citizenshipNumberInput.fill(employeeData.citizenshipNumber);
        await this.panNumberInput.fill(employeeData.panNumber);
        await this.maritalStatusSelect.selectOption({ label: employeeData.maritalStatus });
        await this.dateOfBirthInput.fill(employeeData.dateOfBirth);
        await this.selectRole(employeeData.role); // Updated to use selectRole method
        await this.addressInput.fill(employeeData.address);
        await this.phoneNumberInput.fill(employeeData.phoneNumber);
        await this.emailInput.fill(employeeData.email);
        await this.dateOfHireInput.fill(employeeData.dateOfHire);
        await this.usernameInput.fill(employeeData.username);
        await this.passwordInput.fill(employeeData.password);
        await this.repeatPasswordInput.fill(employeeData.repeatPassword);

        await this.page.waitForTimeout(2000); // Adjust timeout as necessary
    }
    async clicknext() {
        await this.next.click();
        await this.page.waitForTimeout(3000); // Adjust timeout as necessary
    }

    async getRequiredFieldErrors() {
        // Returns an object with locators for each required field error message using error message IDs
        return {
            firstName: this.page.locator('#firstName-error'),
            lastName: this.page.locator('#lastName-error'),
            citizenshipNumber: this.page.locator('#citizenshipNumber-error'),
            panNumber: this.page.locator('#panNumber-error'),
            maritalStatus: this.page.locator('#maritalStatusListItemId-error'),
            address: this.page.locator('#address-error'),
            phoneNumber: this.page.locator('#phoneNumber-error'),
            email: this.page.locator('#emailAddress-error'),
            role: this.page.locator('#assignedRoles-error'),
            username: this.page.locator('#userName-error'),
            password: this.page.locator('#password-error'),
            repeatPassword: this.page.locator('#passwordRepeat-error'),
        };
    }

    async selectRole(role) {
        await this.roleSelect.click();
        await this.page.getByRole('option', { name: role}).click();
    }

    async editEmployeeByName(employeeName) {
        const employeeRow = this.page.locator(`text=${employeeName}`).locator('..').locator('button:has-text("Actions")');
        await employeeRow.click();

        const editLink = this.page.locator(`text=${employeeName}`).locator('..').locator('text=Edit');
        await editLink.click();
        await this.page.waitForTimeout(5000); // Wait for the edit form to load
    }
}

module.exports = EmployeePage;
