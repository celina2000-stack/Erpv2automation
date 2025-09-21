const { test, expect } = require('@playwright/test');
const ServiceAssignmentPage = require('../../pages/humanresource/ServiceAssignmentPage');
const EmployeePage = require('../../pages/humanresource/EmployeePage');
const LoginPage = require('../../pages/common/LoginPage');
const { performLogin } = require('../../utils/loginHelper');
const {
    navigateToHumanResourceAndEmployees,
    createEmployee, verifyRequiredFieldErrors,
    verifyInvalidFormatErrors, verifyPasswordMismatchError, verifyDuplicateUsernameError, 
    verifyDuplicateCitizenshipNumberError, verifyDuplicatePanNumberError,
    verifyInvalidCitizenshipNumberError, verifyInvalidPanNumberError, verifynumericusernameError
} = require('../../utils/humanresource/EmployeeHelper');
const {
  verifyRequiredFieldErrorsOnServiceAssignment,
  fillServiceAssignmentData,
  getBenefitsGridRows,
  switchToDeductionsTab,
  getDeductionsGridRows,
  getRebateGridRows,
  verifyrebateGridData,
  verifyGridData,
  calculateContractSalaryFromFixture,
  contractdate, verifycontractdate
} = require('../../utils/humanresource/serviceAssignmentHelper');

const loginData = require('../../fixtures/loginData.json');
const employeeData = require('../../fixtures/humanresource/EmployeeData.json');
const contractProfileData = require('../../fixtures/payrollsetup/ContractprofileData.json');
const serviceassignmentdata = require('../../fixtures/humanresource/ServiceAssignmentData.json');
const benefitsDeductionsData = require('../../fixtures/humanresource/benefitsDeductionsData.json');

test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await page.goto('https://exolutusv2.exoerp.com');
    await performLogin(loginPage, loginData.valid);
    await loginPage.verifyLogin();
  });

test.describe.skip('Employee creation tests', () => {
  test.skip('Create a valid employee', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await createEmployee(employeePage, employeeData.validEmployee);
  });

  test('Verify validation errors when required fields are blank', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await employeePage.clickCreateButton();
    await employeePage.clicknext();
    await verifyRequiredFieldErrors(employeePage, expect);
  });

  test('Verify invalid email and phone number formats', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await createEmployee(employeePage, employeeData.invalidEmailPhone);
    await employeePage.clicknext();
    await verifyInvalidFormatErrors(employeePage, expect);
  });

  test('Verify mismatched password and repeat password', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await createEmployee(employeePage, employeeData.PasswordMismatch);
    await employeePage.clicknext();
    await verifyPasswordMismatchError(employeePage, expect);
  });

  test('Verify Citizenship Number rejects special characters and letters', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await createEmployee(employeePage, employeeData.invalidCitizenshipNumber);
    await employeePage.clicknext();
    await verifyInvalidCitizenshipNumberError(employeePage, expect);
  });
  test('Verify PAN Number rejects special characters and letters', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await createEmployee(employeePage, employeeData.invalidPanNumber);
    await employeePage.clicknext();
    await verifyInvalidPanNumberError(employeePage, expect);
  });
  test('Verify that User Name cannot have numeric-only values', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await createEmployee(employeePage, employeeData.invalidNumericUsername);
    await employeePage.clicknext();
    await verifynumericusernameError(employeePage, expect);
  });

  test('Verify duplicate Username', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await createEmployee(employeePage, employeeData.duplicateUsernameEmployee);
    await employeePage.clicknext();
    await verifyDuplicateUsernameError(employeePage, expect);
  });

  test('Verify duplicate Citizenship Number', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await createEmployee(employeePage, employeeData.duplicateCitizenshipEmployee);
    await employeePage.clicknext();
    await verifyDuplicateCitizenshipNumberError(employeePage, expect);
  });

  test('Verify duplicate Pan Number', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await createEmployee(employeePage, employeeData.duplicatepanEmployee);
    //await employeePage.clicknext();
    await verifyDuplicatePanNumberError(employeePage, expect);
  });

});

test.describe.serial('Employee service assignment tests', () => {
  test('Verify that the service assignment form shows validation errors when required fields are left blank', async ({ page }) => {
      const serviceAssignmentPage = new ServiceAssignmentPage(page);
      const employeePage = new EmployeePage(page);
      await navigateToHumanResourceAndEmployees(employeePage);
      await employeePage.editEmployeeByName(employeeData.validEmployeeName);
      await employeePage.clicknext();
      await serviceAssignmentPage.clickCreateButton();
      await page.waitForTimeout(2000); // Wait for the create button action to complete
      await serviceAssignmentPage.clickSaveButton();
      await page.waitForTimeout(2000);
      // Use helper to verify required field errors
      await verifyRequiredFieldErrorsOnServiceAssignment(serviceAssignmentPage, expect);
    });

  test('Verify that Contract End Date cannot be same as Contract Start Date in service assignment', async ({ page }) => {
      const serviceAssignmentPage = new ServiceAssignmentPage(page);
      const employeePage = new EmployeePage(page);
      await navigateToHumanResourceAndEmployees(employeePage);
      await employeePage.editEmployeeByName(employeeData.validEmployeeName);
      await employeePage.clicknext();
      await contractdate(serviceAssignmentPage, serviceassignmentdata.sameStartEndDateAssignment);
      await page.waitForTimeout(1000); // Wait for the date inputs to be filled
      await verifycontractdate(serviceAssignmentPage, expect)
      
  });


  test('Verify that Contract End Date cannot be date after Contract Start Date in service assignment', async ({ page }) => {
    const serviceAssignmentPage = new ServiceAssignmentPage(page);
    const employeePage = new EmployeePage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await employeePage.editEmployeeByName(employeeData.validEmployeeName);
    await employeePage.clicknext();
    await contractdate(serviceAssignmentPage, serviceassignmentdata.endBeforeStartAssignment);
    await page.waitForTimeout(1000); // Wait for the date inputs to be filled
    await verifycontractdate(serviceAssignmentPage, expect)
  });



  test('Verify benefits and deductions from contract profile', async ({ page }) => {
      const employeePage = new EmployeePage(page);
      const serviceAssignmentPage = new ServiceAssignmentPage(page);

      await navigateToHumanResourceAndEmployees(employeePage);
      await employeePage.editEmployeeByName(employeeData.validEmployeeName);
      await employeePage.clicknext();

      await fillServiceAssignmentData(serviceAssignmentPage,serviceassignmentdata.validServiceAssignment);

      const selectedProfile = contractProfileData[serviceassignmentdata.validServiceAssignment.contractProfile];

      // ✅ Verify Benefits Grid
      const benefitRows = await getBenefitsGridRows(serviceAssignmentPage);
      await verifyGridData(benefitRows, selectedProfile.benefits, 'Benefits');

      // ✅ Verify Deductions Grid
      await switchToDeductionsTab(serviceAssignmentPage);
      const deductionRows = await getDeductionsGridRows(serviceAssignmentPage);
      await verifyGridData(deductionRows, selectedProfile.deductions, 'Deductions');
  });

  test('Verify that Contract Salary auto-updates based on selected Contract Profile', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    const serviceAssignmentPage = new ServiceAssignmentPage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await employeePage.editEmployeeByName(employeeData.validEmployeeName);
    await employeePage.clicknext();

    await fillServiceAssignmentData(serviceAssignmentPage, serviceassignmentdata.validServiceAssignment);

    const profileName = serviceassignmentdata.validServiceAssignment.contractProfile;

    // ✅ Verify Benefits Grid
    const benefitRows = await getBenefitsGridRows(serviceAssignmentPage);
    await verifyGridData(benefitRows, contractProfileData[profileName].benefits, 'Benefits');

    // ✅ Verify Deductions Grid
    await switchToDeductionsTab(serviceAssignmentPage);
    const deductionRows = await getDeductionsGridRows(serviceAssignmentPage);
    await verifyGridData(deductionRows, contractProfileData[profileName].deductions, 'Deductions');

    // ✅ Verify Contract Salary
    const expectedSalary = await calculateContractSalaryFromFixture(profileName);
    console.log(`Expected Contract Salary for profile '${profileName}':`, expectedSalary);

    const contractSalaryValue = await serviceAssignmentPage.getContractSalaryValue();
    console.log(`Actual Contract Salary Value: ${contractSalaryValue}`);


    expect(Number(contractSalaryValue)).toBeCloseTo(expectedSalary, 2);
  });

  test('Verify that duplicate Benefit and Deduction items cannot be added (with all required fields)', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    const serviceAssignmentPage = new ServiceAssignmentPage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await employeePage.editEmployeeByName(employeeData.validEmployeeName);
    await employeePage.clicknext();

    // Fill valid service assignment data to load default benefits/deductions
    await fillServiceAssignmentData(serviceAssignmentPage, serviceassignmentdata.validServiceAssignment);

    // --- Benefits Tab: Try to add a duplicate benefit ---
    const benefitRows = await getBenefitsGridRows(serviceAssignmentPage);
    const duplicateBenefit = benefitRows[1]?.PaymentItem || 'SSF Benefit';

    await serviceAssignmentPage.addBenefitRow({
      paymentItem: duplicateBenefit,
      paymentBasis: 'Percentage of Basic',
      rate: '10',
      status: 'Active'
    });
    await page.waitForTimeout(2000); // Wait for the grid to update
    // Expect an error or validation message (UI or toast)
    const duplicateBenefitError = await serviceAssignmentPage.getDuplicateBenefitError();
    expect(duplicateBenefitError).toBeTruthy();
    expect(duplicateBenefitError).toContain('This Payment Item already exists!');
    await page.locator("//button[@class='k-grid-cancel-command k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-icon-button']").click();
    // --- Deductions Tab: Try to add a duplicate deduction ---
    await switchToDeductionsTab(serviceAssignmentPage);
    const deductionRows = await getDeductionsGridRows(serviceAssignmentPage);
    const duplicateDeduction = deductionRows[0]?.PaymentItem || 'SSF Deduction';

    await serviceAssignmentPage.addDeductionRow({
      paymentItem: duplicateDeduction,
      paymentBasis: 'Percentage of Basic',
      rate: '10',
      status: 'Active'
    });

    const duplicateDeductionError = await serviceAssignmentPage.getDuplicateDeductionError();
    expect(duplicateDeductionError).toBeTruthy();
    expect(duplicateDeductionError).toContain('This Payment Item already exists!');
  });

  test('Verify that benefits and deductions can be added and displayed correctly in the grid', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    const serviceAssignmentPage = new ServiceAssignmentPage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await employeePage.editEmployeeByName(employeeData.validEmployeeName);
    await employeePage.clicknext();

    await fillServiceAssignmentData(serviceAssignmentPage, serviceassignmentdata.validServiceAssignment2);

    // --- Add Benefits ---
    for (const benefit of benefitsDeductionsData.validData.benefits) {
      await serviceAssignmentPage.addBenefitRow(benefit);
    }
    const benefitRows = await getBenefitsGridRows(serviceAssignmentPage);
    await verifyGridData(benefitRows, benefitsDeductionsData.validData.benefits, 'Benefits');

    // --- Add Deductions ---
    await switchToDeductionsTab(serviceAssignmentPage);
    for (const deduction of benefitsDeductionsData.validData.deductions) {
      await serviceAssignmentPage.addDeductionRow(deduction);
    }
    const deductionRows = await getDeductionsGridRows(serviceAssignmentPage);
    await verifyGridData(deductionRows, benefitsDeductionsData.validData.deductions, 'Deductions');
  });

  test('Verify that duplicate Insurance entries cannot be added in Rebate', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    const serviceAssignmentPage = new ServiceAssignmentPage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await employeePage.editEmployeeByName(employeeData.validEmployeeName);
    await employeePage.clicknext();

    await fillServiceAssignmentData(serviceAssignmentPage, serviceassignmentdata.validServiceAssignment2);
    await serviceAssignmentPage.switchToRebateTab();
    // Add first Rebate row
    await serviceAssignmentPage.addRebateRow(benefitsDeductionsData.validRebate);
    // Try adding duplicate Rebate row
    await serviceAssignmentPage.addRebateRow(benefitsDeductionsData.validRebate);
    // Capture duplicate error
    const errorMessage = await serviceAssignmentPage.getDuplicateRebateError();
    // Assertion
    expect(errorMessage).toContain('This Item is already saved!'); // Adjust text based on actual app toast
    await page.waitForTimeout(2000); // Wait for the error to be displayed
  });

  test('Verify that user can successfully add a Rebate with valid Insurance and Amount', async ({ page }) => {
    const employeePage = new EmployeePage(page);
    const serviceAssignmentPage = new ServiceAssignmentPage(page);
    await navigateToHumanResourceAndEmployees(employeePage);
    await employeePage.editEmployeeByName(employeeData.validEmployeeName);
    await employeePage.clicknext();

    await fillServiceAssignmentData(serviceAssignmentPage, serviceassignmentdata.validServiceAssignment2);
    await serviceAssignmentPage.switchToRebateTab();
    // Add first Rebate row
    for (const rebate of benefitsDeductionsData.validRebate) {
      await serviceAssignmentPage.addRebateRow(rebate);
    }
    const benefitRows = await getRebateGridRows(serviceAssignmentPage);
    await verifyrebateGridData(benefitRows, benefitsDeductionsData.validRebate, 'Rebate');

  });

  test('Verify that system prevents duplicate Service Assignment for same date', async ({ page }) => {
  const employeePage = new EmployeePage(page);
  const serviceAssignmentPage = new ServiceAssignmentPage(page);
  await navigateToHumanResourceAndEmployees(employeePage);
  await employeePage.editEmployeeByName(employeeData.validEmployeeName);
  await employeePage.clicknext();

  await fillServiceAssignmentData(serviceAssignmentPage, serviceassignmentdata.samedate);
  await serviceAssignmentPage.clickSaveButton();
  // Optionally, handle any success toast/dialog here
  await page.waitForTimeout(2000);

  // Assert the error dialog appears
  const warningDialog = page.locator('//*[@id="kt_app_body"]/div[23]/div');
  await expect(warningDialog).toBeVisible();
  await expect(warningDialog).toContainText('There is an existing Service assignment for given date!');
});

test('Verify that system prevents two active service assignment.', async ({ page }) => {
  const employeePage = new EmployeePage(page);
  const serviceAssignmentPage = new ServiceAssignmentPage(page);
  await navigateToHumanResourceAndEmployees(employeePage);
  await employeePage.editEmployeeByName(employeeData.validEmployeeName);
  await employeePage.clicknext();

  await fillServiceAssignmentData(serviceAssignmentPage, serviceassignmentdata.samedate);
  await serviceAssignmentPage.clickSaveButton();
  // Optionally, handle any success toast/dialog here
  await page.waitForTimeout(2000);

  // Assert the error dialog appears
  const warningDialog = page.locator('//*[@id="kt_app_body"]/div[23]/div');
  await expect(warningDialog).toBeVisible();
  await expect(warningDialog).toContainText('There is an existing active service assignment for this employee!');
});
});

