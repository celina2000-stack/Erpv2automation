const { verify } = require('crypto');
const employeeData = require('../../fixtures/humanresource/EmployeeData.json');

async function navigateToHumanResourceAndEmployees(employeePage) {
    await employeePage.navigateToHumanResource();
    await employeePage.navigateToEmployees();
}

async function createEmployee(employeePage, employeeData) {
    await employeePage.clickCreateButton();
    await employeePage.createEmployee(employeeData);
}

async function verifyRequiredFieldErrors(employeePage, expect) {
    const errors = await employeePage.getRequiredFieldErrors();
    // List of required fields to check for 'This field is required.'
    const requiredFields = [
        'firstName', 'lastName', 'citizenshipNumber', 'maritalStatus', 'address', 'phoneNumber', 'email', 'password'
    ];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        await expect(errors[field]).toHaveText(/This field is required\./);
    }
    // Username error message
    await expect(errors.username).toBeVisible();
    await expect(errors.username).toHaveText(/Username must include letters and not be numbers only\./);
    // Role error message
    await expect(errors.role).toBeVisible();
    await expect(errors.role).toHaveText(/Please select at least one role\./);
}

async function verifyInvalidFormatErrors(employeePage, expect) {
    const errors = await employeePage.getRequiredFieldErrors();
    // Email format error
    await expect(errors.email).toBeVisible();
    await expect(errors.email).toHaveText(/emailAddress is not valid email/);
    // Phone number format error
    await expect(errors.phoneNumber).toBeVisible();
    await expect(errors.phoneNumber).toHaveText("Enter a valid phone number (e.g., 9801234567, 014123456, +9779801234567).");
}
async function verifyPasswordMismatchError(employeePage, expect) {
    const errors = await employeePage.getRequiredFieldErrors();
    await expect(errors.repeatPassword).toBeVisible();
    await expect(errors.repeatPassword).toHaveText("Passwords do not match.");
}

async function verifyDuplicateUsernameError(employeePage, expect) {
    // Wait for dialog box to appear with the error message
    const dialog = employeePage.page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    // Get the username from the employeePage's last entered value or pass as argument
    const username = employeeData.duplicateUsernameEmployee.username;
    await expect(dialog).toContainText(`Username '${username}' is already taken`);
}

async function verifyDuplicateCitizenshipNumberError(employeePage, expect) {
    // Wait for dialog box to appear with the error message
    const dialog = employeePage.page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
   const  citizenshipNumber = employeeData.duplicateCitizenshipEmployee.citizenshipNumber;
    await expect(dialog).toContainText(`Employee with same Citizenship Number or PAN Number already exists.`);
}

async function verifyDuplicatePanNumberError(employeePage, expect) {
    // Wait for dialog box to appear with the error message
    const dialog = employeePage.page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    const panNumber = employeeData.duplicatepanEmployee.panNumber;
    await expect(dialog).toContainText(`Employee with same Citizenship Number or PAN Number already exists.`);
}

async function verifyInvalidCitizenshipNumberError(employeePage, expect) {
   const errors = await employeePage.getRequiredFieldErrors();
    await expect(errors.citizenshipNumber).toBeVisible();
    await expect(errors.citizenshipNumber).toHaveText("Citizenship No can only contain letters, numbers, '-' and '/'.");
}

async function verifyInvalidPanNumberError(employeePage, expect) {
   const errors = await employeePage.getRequiredFieldErrors();
    await expect(errors.panNumber).toBeVisible();
    await expect(errors.panNumber).toHaveText("PAN No can only contain letters, numbers, '-' and '/'.");
}

async function verifynumericusernameError(employeePage, expect) {
    const errors = await employeePage.getRequiredFieldErrors();
    await expect(errors.username).toBeVisible();
    await expect(errors.username).toHaveText("Username must include letters and not be numbers only.");
}
module.exports = { navigateToHumanResourceAndEmployees, createEmployee, verifyRequiredFieldErrors, verifyInvalidFormatErrors, verifyPasswordMismatchError, verifyDuplicateUsernameError, verifyDuplicateCitizenshipNumberError, 
    verifyDuplicatePanNumberError, verifyInvalidCitizenshipNumberError, verifyInvalidPanNumberError, verifynumericusernameError };
