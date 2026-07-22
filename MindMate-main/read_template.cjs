const ExcelJS = require('exceljs');

async function checkTemplate() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('C:\\Users\\Tanushri\\Downloads\\selenium report.xlsx');
  const worksheet = workbook.worksheets[0];
  const headers = worksheet.getRow(1).values;
  console.log("Headers:", headers);
}
checkTemplate();
