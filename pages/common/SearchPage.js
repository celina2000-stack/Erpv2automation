const { expect } = require('@playwright/test');

class SearchPage {
    constructor(page, searchInputSelector, searchButtonSelector) {
        this.page = page;
        this.searchInput = page.locator(searchInputSelector);
        this.searchButton = page.locator(searchButtonSelector);
        this.resultTable = page.locator('table tbody'); // generic table
        this.tableRows = this.resultTable.locator('tr'); // table rows
        
    }

    // Function to count number of rows containing the searched value in any column
    async countRowsContaining(value) {
        const searchValue = value.toLowerCase();
        const rowCount = await this.tableRows.count();
        let matchingCount = 0;

        for (let i = 0; i < rowCount; i++) {
            const row = this.tableRows.nth(i);
            const cols = row.locator('td');
            const colCount = await cols.count();

            for (let j = 0; j < colCount; j++) {
                const colText = (await cols.nth(j).textContent()).trim().toLowerCase();
                if (colText.includes(searchValue)) {
                    matchingCount++;
                    break; // move to next row after first match in this row
                }
            }
        }

        console.log(`Rows containing "${value}": ${matchingCount}`);
        return matchingCount;
    }
    async searchFor(value) {
        console.log(`Searching for: "${value}"`);
        await this.searchInput.fill(value);
        await this.searchButton.click();
        await this.page.waitForTimeout(1000); // wait for table to refresh
    }

    async getNumberOfRowsAfterSearch() {
        const rowCount = await this.tableRows.count();
        console.log(`Number of rows after search: ${rowCount}`);
        return rowCount;
    }

    async doAllRowsContainValue(value) {
        const searchValue = value.toLowerCase();
        const rowCount = await this.tableRows.count();
        for (let i = 0; i < rowCount; i++) {
            const row = this.tableRows.nth(i);
            const cols = row.locator('td');
            const colCount = await cols.count();

            let rowHasValue = false;
            for (let j = 0; j < colCount; j++) {
                const colText = (await cols.nth(j).textContent()).trim().toLowerCase();
                if (colText.includes(searchValue)) {
                    rowHasValue = true;
                    break;
                }
            }

            if (!rowHasValue) {
                throw new Error(`Row ${i + 1} does NOT contain the searched value "${value}"`);
            }
        }

        console.log(`All ${rowCount} rows contain "${value}"`);
        return true;
    }

    async verifyNoDataMessage() {
        const noDataCell = this.page.locator('table tbody tr td.dataTables_empty');
        const isVisible = await noDataCell.isVisible();
        await expect(noDataCell, 'Incorrect message text').toHaveText(/No data available in table/i);
    }
    
    
}

module.exports = SearchPage;
