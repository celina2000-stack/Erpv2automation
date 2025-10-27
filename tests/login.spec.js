const { test, expect } = require('@playwright/test');
const loginData = require('../fixtures/loginData.json');
const LoginPage = require('../pages/common/LoginPage');
const { performLogin, performInvalidLogin, performEmptyLogin, performUsernameEmptyLogin, performPasswordEmptyLogin } = require('../utils/loginHelper');
test.use({
  ignoreHTTPSErrors: true,   // ✅ Allow navigation to sites with invalid SSL
});
test('Log in to the website with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Navigate to the website
    await loginPage.navigateTo('https://exolutusv2.exoerp.com/');

    // Perform login using helper function
    await performLogin(loginPage, loginData.valid);

    // Explicitly verify login
    await loginPage.verifyLogin();
});

test('Log in to the website with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Navigate to the website
    await loginPage.navigateTo('https://exolutusv2.exoerp.com/');

    // Perform invalid login using helper function
    await performInvalidLogin(loginPage, loginData.invalid); 
});

test('Log in to the website with empty credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    // Navigate to the website
    await page.goto('https://exolutusv2.exoerp.com/');
    // Perform empty login using helper function
    await performEmptyLogin(loginPage);
});

test('Log in to the website with username-only empty', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Navigate to the website
    await loginPage.navigateTo('https://exolutusv2.exoerp.com/');

    // Perform username-only empty login using helper function
    await performUsernameEmptyLogin(loginPage, loginData.valid);
});

test('Log in to the website with password-only empty', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Navigate to the website
    await loginPage.navigateTo('https://exolutusv2.exoerp.com/');

    // Perform password-only empty login using helper function
    await performPasswordEmptyLogin(loginPage, loginData.valid);
});
