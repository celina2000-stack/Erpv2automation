const { expect } = require('@playwright/test');
const SearchPage = require('../pages/common/SearchPage');

async function verifySearch(page, searchInputSelector, searchButtonSelector, searchValue) {
    const searchPage = new SearchPage(page, searchInputSelector, searchButtonSelector);
    // Step 1: Count rows before search
    const matchingRows = await searchPage.countRowsContaining(searchValue);
    console.log(`Number of rows containing "${searchValue}": ${matchingRows}`);
    expect(matchingRows).toBeGreaterThan(0);

    // Step 2: Perform search
    await searchPage.searchFor(searchValue);
    await page.waitForTimeout(1000);

    // Step 3: Count rows after search
    const aftersearch = await searchPage.getNumberOfRowsAfterSearch();
    console.log(`Rows containing "${searchValue}" after search: ${aftersearch}`);

    if (matchingRows !== aftersearch) {
        throw new Error(
              `Row count mismatch: before search = ${matchingRows}, after search = ${aftersearch}`
          );
      }

    // Step 5: Verify all rows contain the searched value
    const allRowsValid=await searchPage.doAllRowsContainValue(searchValue);
    expect(allRowsValid).toBe(true); 
}

async function  verifyinvalidsearch(page, searchInputSelector, searchButtonSelector, searchValue) {
    const searchPage = new SearchPage(page, searchInputSelector, searchButtonSelector);
    await searchPage.searchFor(searchValue);
    await page.waitForTimeout(1000);
    await  searchPage.verifyNoDataMessage();
}

module.exports = { verifySearch, verifyinvalidsearch };
