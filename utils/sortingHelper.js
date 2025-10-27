const { expect } = require('@playwright/test');

// Normalize value for comparison
function normalizeValue(value, isNumeric = false) {
    if (value === null || value === undefined) return '';
    let cleaned = value.toString().trim();
    if (isNumeric) return cleaned.replace(/,/g, '');
    return cleaned.toLowerCase().replace(/\s+/g, ' ');
}

// Sort comparison specifically for numeric values (special columns)
function isSortedForNumbers(arr, order = 'asc') {
    const nums = arr.map(v => Number(v.toString().replace(/,/g, '').trim()));
    const sorted = [...nums].sort((a, b) => a - b);
    if (order === 'desc') sorted.reverse();
    return nums.every((v, i) => v === sorted[i]);
}

// Detect if a column is numeric (PAN, Account Number, etc.)
function detectNumericColumn(values) {
    const nonEmpty = values.filter(v => v.trim() !== '');
    if (nonEmpty.length === 0) return false;
    return nonEmpty.every(v => /^\d+$/.test(v.replace(/,/g, '')));
}

// Sort comparison for dates (assumes MM/DD/YYYY format)
function isSortedForDates(arr, order = 'asc') {
    const timestamps = arr.map(d => {
        const parts = d.split('/');
        const dateObj = new Date(parts[2], parts[0] - 1, parts[1]);
        return dateObj.getTime();
    });
    const sorted = [...timestamps].sort((a, b) => a - b);
    if (order === 'desc') sorted.reverse();
    return timestamps.every((v, i) => v === sorted[i]);
}

// Check if array is sorted (text/general numeric)
function isSorted(arr, order = 'asc', numeric = false) {
    const normalized = arr.map(v => normalizeValue(v, numeric));
    const sortedArr = [...normalized].sort((a, b) => a.localeCompare(b));
    if (order === 'desc') sortedArr.reverse();
    return normalized.every((v, i) => v === sortedArr[i]);
}

// Special numeric columns
const specialNumericColumns = ['order num', 'debit amount', 'credit amount', 'next voucher num'];
// Date columns
const specialDateColumns = ['date of birth', 'contract start date', 'contract end date'];

// Safe click header with swal2 error handling
async function safeClickHeader(sortPage, columnIndex, headerText) {
    try {
        await sortPage.clickColumnHeader(columnIndex);
        await sortPage.page.waitForTimeout(500);

        const errorModal = sortPage.page.locator("(//div[@role='dialog'])[1]");
        if (await errorModal.isVisible()) {
            const message = await sortPage.page.locator('#swal2-html-container').innerText();
            console.error(` Internal error while sorting "${headerText}": ${message}`);
            const okButton = sortPage.page.locator('.swal2-confirm');
            await okButton.click();
            return message; // return the internal error message
        }
        return true;
    } catch (err) {
        console.error(` Failed to click header "${headerText}": ${err.message}`);
        return err.message;
    }
}

// Verify sort for a single column
async function verifySortColumn(sortPage, columnIndex) {
    const headerText = await sortPage.getHeaderText(columnIndex);
    let values = await sortPage.getColumnValues(columnIndex);

    const isSpecialNumeric = specialNumericColumns.some(name =>
        headerText.toLowerCase().includes(name)
    );

    const isDateColumn = specialDateColumns.some(name =>
        headerText.toLowerCase().includes(name)
    );

    // PAN/Account numbers handled by detectNumericColumn
    const numeric = detectNumericColumn(values);

    console.log(`\n Verifying sort for column: "${headerText}" (${numeric || isSpecialNumeric || isDateColumn ? 'numeric/date' : 'text'})`);

    const failedOrders = [];

    // Ascending
    const ascResult = await safeClickHeader(sortPage, columnIndex, headerText);
    if (ascResult === true) {
        values = await sortPage.getColumnValues(columnIndex);
        let ascSorted;
        if (isDateColumn) ascSorted = isSortedForDates(values, 'asc');
        else if (isSpecialNumeric) ascSorted = isSortedForNumbers(values, 'asc');
        else ascSorted = isSorted(values, 'asc', numeric);

        if (values.length > 1 && !ascSorted) {
            failedOrders.push('ASCENDING');
            console.error(` Column "${headerText}" is NOT sorted in ASCENDING order.\nValues: ${values.join(', ')}`);
        } else {
            console.log(` Column "${headerText}" sorted ASCENDING correctly.`);
        }
    } else {
        // Internal error or click failure
        throw new Error(`Internal error while sorting "${headerText}": ${ascResult}`);
    }

    // Descending
    const descResult = await safeClickHeader(sortPage, columnIndex, headerText);
    if (descResult === true) {
        values = await sortPage.getColumnValues(columnIndex);
        let descSorted;
        if (isDateColumn) descSorted = isSortedForDates(values, 'desc');
        else if (isSpecialNumeric) descSorted = isSortedForNumbers(values, 'desc');
        else descSorted = isSorted(values, 'desc', numeric);

        if (values.length > 1 && !descSorted) {
            failedOrders.push('DESCENDING');
            console.error(` Column "${headerText}" is NOT sorted in DESCENDING order.\nValues: ${values.join(', ')}`);
        } else {
            console.log(` Column "${headerText}" sorted DESCENDING correctly.`);
        }
    } else {
        throw new Error(`Internal error while sorting "${headerText}": ${descResult}`);
    }

    if (failedOrders.length > 0) throw new Error(headerText);
    return 'success';
}

// Verify sorting for all columns except first two
async function verifySortForAllColumns(sortPage) {
    const colCount = await sortPage.getColumnCount();
    const failedColumns = [];

    for (let i = 2; i < colCount; i++) {
        try {
            await verifySortColumn(sortPage, i);
        } catch (error) {
            failedColumns.push(error.message);
        }
    }

    if (failedColumns.length > 0) {
        console.error(`\n Sorting failed for columns/errors:\n- ${failedColumns.join('\n- ')}`);
        throw new Error(`Sorting issues detected:\n${failedColumns.join('\n')}`);
    } else {
        console.log(`\n All sortable columns verified successfully.`);
    }
}

module.exports = { verifySortColumn, verifySortForAllColumns };
