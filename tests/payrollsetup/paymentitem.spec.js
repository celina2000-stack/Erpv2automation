const { test, expect } = require('@playwright/test');
const PaymentitemPage = require('../../pages/payrollsetup/PaymentitemPage');
const {
    navigateToPaymentItems,
    openCreateNewPaymentItem,
    clickSave,
    fillPaymentItemForm,
    verifyRequiredFieldErrors,
    verifymessage
} = require('../../utils/payrollsetup/PaymentitemHelper');
const LoginPage = require('../../pages/common/LoginPage');
const loginData = require('../../fixtures/loginData.json');
const paymentItemData = require('../../fixtures/payrollsetup/PaymentitemData.json');
const { performLogin } = require('../../utils/loginHelper');
const { verifySearch, verifyinvalidsearch } = require('../../utils/searchHelper');
const SortPage = require('../../pages/common/SortingPage');
const { verifySortColumn, verifySortForAllColumns } = require('../../utils/sortingHelper');

test.use({
  ignoreHTTPSErrors: true,   // ✅ Allow navigation to sites with invalid SSL
});
test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await page.goto('https://exolutusv2.exoerp.com');
    await performLogin(loginPage, loginData.admin);
});
test('Payment Item: required field validation on empty save', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await openCreateNewPaymentItem(paymentitemPage);
    await clickSave(paymentitemPage);
    await page.waitForTimeout(1000);
    await verifyRequiredFieldErrors(paymentitemPage);
});
test('Payment Item: duplicate entry validation', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await openCreateNewPaymentItem(paymentitemPage);
    await fillPaymentItemForm(paymentitemPage, paymentItemData.duplicatePaymentItem);
    await clickSave(paymentitemPage);
    await verifymessage(paymentitemPage, 'Payment Item Name already Exists');
});
test('Payment Item: save valid taxable data and verify in table', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    //await openCreateNewPaymentItem(paymentitemPage);
    //const orderNumber = await paymentitemPage.getDefaultOrderNumberFromForm(); // Prints order number
    //await fillPaymentItemForm(paymentitemPage, paymentItemData.validtaxablePaymentItem);
    //await clickSave(paymentitemPage);
    await page.waitForTimeout(1000); // Wait for table to update
    //await verifymessage(paymentitemPage, 'Saved Successfully');
    await paymentitemPage.verifyPaymentItemTableRow(paymentItemData.validtaxablePaymentItem, "10");
});
test('Payment Item: save valid non-taxable data and verify in table', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await openCreateNewPaymentItem(paymentitemPage);
    const orderNumber = await paymentitemPage.getDefaultOrderNumberFromForm(); // Prints order number
    await fillPaymentItemForm(paymentitemPage, paymentItemData.validnontaxablePaymentItem);
    await clickSave(paymentitemPage);
    await page.waitForTimeout(1000); // Wait for table to update
    await verifymessage(paymentitemPage, 'Saved Successfully!');
    await paymentitemPage.verifyPaymentItemTableRow(paymentItemData.validnontaxablePaymentItem, orderNumber);
});
test('Payment Item: save valid deduction data and verify in table', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await openCreateNewPaymentItem(paymentitemPage);
    const orderNumber = await paymentitemPage.getDefaultOrderNumberFromForm(); // Prints order number
    await fillPaymentItemForm(paymentitemPage, paymentItemData.validdeductionPaymentItem);
    await clickSave(paymentitemPage);
    await page.waitForTimeout(1000); // Wait for table to update
    await verifymessage(paymentitemPage, 'Saved Successfully!');
    await paymentitemPage.verifyPaymentItemTableRow(paymentItemData.validdeductionPaymentItem, orderNumber);
});

test('Payment Item search functionality by Payment Item name', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    const searchValue = paymentItemData.searchitem.paymentItemName;
    await verifySearch(
        page,
        '#PaymentItemsTableFilter',
        '#GetPaymentItemsButton',
        searchValue
    );
});
test('Payment Item search functionality by system name', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    const searchValue = paymentItemData.searchitem.systemname;
    await verifySearch(
        page,
        '#PaymentItemsTableFilter',
        '#GetPaymentItemsButton',
        searchValue
    );
});
test('Payment Item search functionality by order number', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    const searchValue = paymentItemData.searchitem.orderNo;
    await verifySearch(
        page,
        '#PaymentItemsTableFilter',
        '#GetPaymentItemsButton',
        searchValue
    );
});
test('Payment Item search functionality by Payment Item type', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    const searchValue = paymentItemData.searchitem.paymentItemType;
    await verifySearch(
        page,
        '#PaymentItemsTableFilter',
        '#GetPaymentItemsButton',
        searchValue
    );
});
test('Payment Item search functionality by Payment type name', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    const searchValue = paymentItemData.searchitem.paymenttypeName;
    await verifySearch(
        page,
        '#PaymentItemsTableFilter',
        '#GetPaymentItemsButton',
        searchValue
    );
});
test('Payment Item search functionality by taxable type name', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    const searchValue = paymentItemData.searchitem.taxabletype;
    await verifySearch(
        page,
        '#PaymentItemsTableFilter',
        '#GetPaymentItemsButton',
        searchValue
    );
});
test('Payment Item search functionality by payment basis', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    const searchValue = paymentItemData.searchitem.paymentbasis
    await verifySearch(
        page,
        '#PaymentItemsTableFilter',
        '#GetPaymentItemsButton',
        searchValue
    );
});
test('Payment Item invalid search', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    const searchValue = paymentItemData.searchitem.invalid;
    await verifyinvalidsearch(
        page,
        '#PaymentItemsTableFilter',
        '#GetPaymentItemsButton',
        searchValue
    ); 
});
test.only('Verify sorting for all columns in Payment Item module', async ({ page }) => {
    const paymentitemPage = new PaymentitemPage(page);
    const sortPage = new SortPage(page);
    await navigateToPaymentItems(paymentitemPage);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    await verifySortForAllColumns(sortPage);
});
