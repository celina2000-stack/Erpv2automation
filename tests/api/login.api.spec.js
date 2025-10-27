const { test, expect, request } = require('@playwright/test');
const loginData = require('../../fixtures/loginData.json');
const { log } = require('console');

const BASE_URL = 'https://exolutusv2.exoerp.com';
const LOGIN_PAGE = BASE_URL + '/Account/Login';
const CURRENT_LOGIN_INFO_API = BASE_URL + '/api/services/app/Session/GetCurrentLoginInformations';

test.describe('Backend Login API Tests', () => {
  test('Login with valid credentials', async () => {
    const apiContext = await request.newContext({ ignoreHTTPSErrors: true });

    // Step 1: GET login page to get CSRF token
    const getResponse = await apiContext.get(LOGIN_PAGE);
    const html = await getResponse.text();
    const tokenMatch = html.match(/name="__RequestVerificationToken" type="hidden" value="([^"]+)"/);
    expect(tokenMatch).not.toBeNull();
    const csrfToken = tokenMatch[1];

    // Step 2: POST login form data with token
    const postResponse = await apiContext.post(LOGIN_PAGE, {
      form: {
        __RequestVerificationToken: csrfToken,
        usernameOrEmailAddress: loginData.valid.username,
        password: loginData.valid.password,
        returnUrl: '/App'
      }
    });

        // Check status is 200
    expect(postResponse.status()).toBe(200);

    /// 3. Now call the current login info API to get user details
  const userInfoResponse = await apiContext.get(CURRENT_LOGIN_INFO_API);
  expect(userInfoResponse.ok()).toBeTruthy();

  const userInfo = await userInfoResponse.json();

  // 4. Verify the username from the response matches expected username
  expect(userInfo.result.user.userName).toBe(loginData.valid.username);
  expect(userInfo.result.user.name).toBe('Celina'); // or expected first name

  });

  test('Login with invalid credentials', async () => {
  const apiContext = await request.newContext({ ignoreHTTPSErrors: true });

  // Get CSRF token
  const getResponse = await apiContext.get(LOGIN_PAGE);
  const html = await getResponse.text();
  const tokenMatch = html.match(/name="__RequestVerificationToken" type="hidden" value="([^"]+)"/);
  expect(tokenMatch).not.toBeNull();
  const csrfToken = tokenMatch[1];

  // Post login with invalid credentials
  const postResponse = await apiContext.post(LOGIN_PAGE, {
    form: {
      __RequestVerificationToken: csrfToken,
      usernameOrEmailAddress: loginData.invalid.username,
      password: loginData.invalid.password,
      returnUrl: '/App'
    }
  });

  expect(postResponse.status()).toBe(401); // Backend returns 200 even on failure

  const responseBody = await postResponse.json();

  // Check success is false and error message is as expected
  expect(responseBody.success).toBe(false);
  expect(responseBody.error).toBeDefined();
  expect(responseBody.error.message).toBe('Invalid user name or password');
  expect(responseBody.targetUrl).toBeNull(); 
});


  
});
