const loginData = require('../fixtures/loginData.json');
const { expect } = require('@playwright/test');

async function performLogin(loginPage,loginData) {
    await loginPage.login(loginData.username, loginData.password);
}

async function performInvalidLogin(loginPage, loginData) {
    await loginPage.login(loginData.username, loginData.password);
    const errorMessage = loginPage.page.locator('div[role="dialog"]');
    // Verify error message for invalid login
    await expect(errorMessage).toContainText('Invalid user name or password');
}

async function performEmptyLogin(loginPage) {
    await loginPage.login('', '');
    await loginPage.verifyEmptyLoginError(); // Use the validation method from LoginPage
}

async function performUsernameEmptyLogin(loginPage, loginData) {
    await loginPage.login('', loginData.password);
    await loginPage.verifyUsernameEmptyError();
}

async function performPasswordEmptyLogin(loginPage, loginData) {
    await loginPage.login(loginData.username, '');
    await loginPage.verifyPasswordEmptyError();
}

module.exports = { performLogin, performInvalidLogin, performEmptyLogin, performUsernameEmptyLogin, performPasswordEmptyLogin };
