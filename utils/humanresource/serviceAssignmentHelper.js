const { test, expect } = require('@playwright/test');
const { get } = require('http');
// Verifies required field errors for the service assignment form using field-specific locators
async function verifyRequiredFieldErrorsOnServiceAssignment(serviceAssignmentPage, expect) {
    const errors = await serviceAssignmentPage.getRequiredFieldErrors();
    const requiredFields = [
        'office', 'jobPosition', 'supervisor', 'contractType', 'employeeStatus'
    ];
    for (const field of requiredFields) {
        await expect(errors[field]).toBeVisible();
        // Supervisor error message is different
        if (field === 'supervisor') {
            await expect(errors[field]).toHaveText(/Supervisor is required/);
        } else {
            await expect(errors[field]).toHaveText(/This field is required\./);
        }
    }
}

async function fillServiceAssignmentData(serviceAssignmentPage,serviceassignmentdata) {
    await serviceAssignmentPage.clickCreateButton();
    await serviceAssignmentPage.fillServiceAssignmentForm(serviceassignmentdata);
}

async function getBenefitsGridRows(serviceAssignmentPage) {
    return await serviceAssignmentPage.getBenefitsGridRows();
}

async function switchToDeductionsTab(serviceAssignmentPage) {
    await serviceAssignmentPage.switchToDeductionsTab();
}

async function getDeductionsGridRows(serviceAssignmentPage) {
    return await serviceAssignmentPage.getDeductionsGridRows();
}
async function getRebateGridRows(serviceAssignmentPage) {
    return await serviceAssignmentPage.getRebateGridRows();
}
// ✅ Reusable grid verification function
async function verifyGridData(gridRows, expectedData, label) {
    console.log(`${label} Grid Rows:`, gridRows);

    expect(gridRows.length).toBe(expectedData.length);

    for (let i = 0; i < expectedData.length; i++) {
        const expected = expectedData[i];
        const actual = gridRows[i];

        expect(actual.paymentItem).toBe(expected.paymentItem);
        expect(actual.paymentType).toBe(expected.paymentType);
        expect(actual.paymentBasis).toBe(expected.paymentBasis);
        expect(actual.rate).toBe(expected.rate);
    }
}

async function verifyrebateGridData(gridRows, expectedData) {
    console.log(`Rebate Grid Rows:`, gridRows);

    expect(gridRows.length).toBe(expectedData.length);

    for (let i = 0; i < expectedData.length; i++) {
        const expected = expectedData[i];
        const actual = gridRows[i];

        expect(actual.insurance).toBe(expected.insurance);
        expect(actual.insuranceAmount).toBe(expected.insuranceAmount);
        // Action column is not verified here as it may vary
    }

}

// Calculates contract salary based on contract profile name using fixture data
function calculateContractSalaryFromFixture(profileName) {
  const contractProfileData = require('../../fixtures/payrollsetup/ContractprofileData.json');
  const profile = contractProfileData[profileName];
  if (!profile) {
    throw new Error(`Profile '${profileName}' not found in fixture.`);
  }

  const benefits = profile.benefits || [];

  // 1. Get basic salary (convert to number)
  const basicSalary = Number(
    benefits.find(b => b.paymentItem === 'Basic Salary')?.rate
  ) || 0;

  // 2. Identify PF or SSF benefit
  const pfOrSsfBenefit = benefits.find(b =>
    b.paymentItem.toLowerCase().includes('provident fund benefit') ||
    b.paymentItem.toLowerCase().includes('ssf benefit')
  );

  let additionalAmount = 0;
  if (pfOrSsfBenefit) {
    const pfRate = Number(pfOrSsfBenefit.rate) || 0;

    if (pfOrSsfBenefit.paymentBasis === 'Percentage of Basic') {
      additionalAmount = (basicSalary * pfRate) / 100;
    } else {
      additionalAmount = pfRate;
    }
  }

  // 3. Contract salary = Basic + PF or SSF
  return basicSalary + additionalAmount;
}

async function contractdate(serviceAssignmentPage, serviceassignmentdata) {
    await serviceAssignmentPage.clickCreateButton();
    await serviceAssignmentPage.startDateInput.type(serviceassignmentdata.startDate);
    await serviceAssignmentPage.endDateInput.type(serviceassignmentdata.endDate);
    await serviceAssignmentPage.supervisorInput.click();
    
}
async function verifycontractdate(serviceAssignmentPage, expect) {
    await expect(serviceAssignmentPage.body).toContainText(/End Date must be greater than Start Date!|Start Date must be smaller than End Date!/);
}

module.exports = {
    verifyRequiredFieldErrorsOnServiceAssignment,
    fillServiceAssignmentData,
    getBenefitsGridRows,
    switchToDeductionsTab,
    getDeductionsGridRows,
    getRebateGridRows,
    verifyGridData,
    verifyrebateGridData,
    calculateContractSalaryFromFixture, contractdate, verifycontractdate
};
