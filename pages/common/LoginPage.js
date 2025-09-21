const { expect } = require('@playwright/test');

class LoginPage {
    constructor(page) {
        this.page = page;
        this.usernameInput = page.locator('input[name="usernameOrEmailAddress"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.loginButton = page.locator('button#kt_login_signin_submit');
    }
    async navigateTo(url) {
    await this.page.goto(url);
    await this.page.waitForTimeout(2000);
  }
    async login(username, password) {
        await this.usernameInput.fill(username);
        await this.page.waitForTimeout(300);
        await this.passwordInput.fill(password);
        await this.page.waitForTimeout(1000);
        await this.loginButton.click();
        await this.page.waitForTimeout(8000);
    }

    async verifyLogin() {
        const welcomeMessage = this.page.locator('h4:has-text("Welcome!")');
        await expect(welcomeMessage).toBeVisible();
    }

    async verifyEmptyLoginError() {
        const usernameError = this.page.locator('div:has-text("This field is required.")').nth(0);
        const passwordError = this.page.locator('div:has-text("This field is required.")').nth(1);
        await expect(usernameError).toBeVisible();
        await expect(passwordError).toBeVisible();
    }

    async verifyUsernameEmptyError() {
        const usernameError = this.page.locator('div:has-text("This field is required.")').nth(0);
        await expect(usernameError).toBeVisible();
    }

    async verifyPasswordEmptyError() {
        const passwordError = this.page.locator('div:has-text("This field is required.")').nth(1);
        await expect(passwordError).toBeVisible();
    }
}

module.exports = LoginPage;
