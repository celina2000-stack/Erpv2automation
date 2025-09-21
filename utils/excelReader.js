const xlsx = require('xlsx');

function readExcelDataBySheetName(filePath, sheetName) {
  const workbook = xlsx.readFile(filePath);
  //console.log('Available Excel Sheet Names:', workbook.SheetNames);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  return xlsx.utils.sheet_to_json(sheet, { header: 1 });
}

// Find value only below the month label section
function findValueByLabel(data, label, monthLabel) {
  let startIndex = 0;

  if (monthLabel) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].some(cell => typeof cell === 'string' && cell.includes(monthLabel))) {
        startIndex = i + 1; // Start looking for label after the month row
        break;
      }
    }
  }

  for (let i = startIndex; i < data.length; i++) {
    const row = data[i];
    for (let j = 0; j < row.length; j++) {
      if (typeof row[j] === 'string' && row[j].trim() === label) {
        return row[j + 1] !== undefined ? row[j + 1] : null;
      }
    }
  }

  return null; // Label not found
}

module.exports = { readExcelDataBySheetName, findValueByLabel };
