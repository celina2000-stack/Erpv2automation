const { expect } = require('@playwright/test');

class SortPage {
    constructor(page) {
        this.page = page;
        this.table = page.locator('table');
        this.headers = this.table.locator('thead tr th'); // table headers
        this.rows = this.table.locator('tbody tr');      // table rows
    }

    // Step 1: Get total number of columns
    async getColumnCount() {
        const count = await this.headers.count();
        return count;
    }

    // Step 2: Get header text for a column
    async getHeaderText(columnIndex) {
        return (await this.headers.nth(columnIndex).textContent()).trim();
    }

    // Step 3: Get all values from a column (by index, 0-based)
    async getColumnValues(columnIndex) {
        const rowCount = await this.rows.count();
        const values = [];

        for (let i = 0; i < rowCount; i++) {
            const cellText = (await this.rows.nth(i)
                .locator(`td:nth-child(${columnIndex + 1})`)
                .textContent()).trim();
            values.push(cellText);
        }

        return values;
    }

    // Step 4: Click column header to sort
    async clickColumnHeader(columnIndex) {
        await this.headers.nth(columnIndex).click();
        await this.page.waitForTimeout(1000); // wait for table to refresh
    }
}

module.exports = SortPage;
