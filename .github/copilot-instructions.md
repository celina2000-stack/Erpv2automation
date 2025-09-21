# Copilot Instructions for Erpv2automation

## Overview
This project is an automation framework for testing the ERPv2 application using Playwright. The codebase is organized into distinct directories for fixtures, pages, tests, and utilities, each serving a specific purpose in the testing workflow.

### Key Directories
- **`fixtures/`**: Contains test data and configurations used across tests.
- **`pages/`**: Implements the Page Object Model (POM) pattern. Subdirectories like `common/` and `humanresource/` represent different modules of the application.
- **`tests/`**: Contains test scripts written in Playwright. Example: `example.spec.js`.
- **`utils/`**: Utility functions and helpers to support test execution.

## Developer Workflows

### Running Tests
To execute tests, use the following command:
```bash
npx playwright test
```
This will run all tests in the `tests/` directory.

### Debugging Tests
Run tests in headed mode for debugging:
```bash
npx playwright test --headed
```

### Generating Reports
Playwright generates HTML reports by default. After running tests, view the report with:
```bash
npx playwright show-report
```

## Project-Specific Conventions

### Page Object Model (POM)
- Each page class is located in the `pages/` directory.
- Page classes encapsulate locators and methods for interacting with specific pages.
- Example structure for a page class:
  ```javascript
  class LoginPage {
      constructor(page) {
          this.page = page;
          this.usernameInput = page.locator('input[name="username"]');
          this.passwordInput = page.locator('input[name="password"]');
          this.loginButton = page.locator('button[type="submit"]');
      }

      async login(username, password) {
          await this.usernameInput.fill(username);
          await this.passwordInput.fill(password);
          await this.loginButton.click();
      }
  }
  module.exports = LoginPage;
  ```

### Test Structure
- Tests are located in the `tests/` directory.
- Each test file should focus on a specific feature or module.
- Example test structure:
  ```javascript
  const { test, expect } = require('@playwright/test');
  const LoginPage = require('../pages/common/LoginPage');

  test('Login test', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.login('username', 'password');
      await expect(page).toHaveURL('/dashboard');
  });
  ```

## External Dependencies
- **Playwright**: Core library for browser automation.
- Install dependencies with:
  ```bash
  npm install
  ```

## Integration Points
- The framework integrates with the ERPv2 application for end-to-end testing.
- Test data and configurations are managed in the `fixtures/` directory.

## Notes
- Follow the POM pattern for maintainable and reusable test code.
- Use `utils/` for shared helper functions to avoid duplication.

---
Feel free to update this document as the project evolves.
