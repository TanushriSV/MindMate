import ExcelJS from 'exceljs';
import * as path from 'path';

export interface TestResult {
  step: string;
  expected: string;
  actual: string;
  status: 'Pass' | 'Fail';
  durationMs: number;
}

export async function generateExcelReport(
  results: TestResult[],
  filename = 'e2e-report.xlsx'
) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'MindMate E2E Suite';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Test Results');

  sheet.columns = [
    { header: 'Test Step', key: 'step', width: 30 },
    { header: 'Expected Outcome', key: 'expected', width: 40 },
    { header: 'Actual Outcome', key: 'actual', width: 40 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Duration (ms)', key: 'durationMs', width: 15 },
  ];

  // Add rows
  results.forEach((result) => {
    sheet.addRow(result);
  });

  // Header style
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Status coloring
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const statusCell = row.getCell(4);

    if (statusCell.value === 'Pass') {
      statusCell.font = { color: { argb: 'FF008000' }, bold: true };
    } else if (statusCell.value === 'Fail') {
      statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
    }
  });

  // Auto filter
  sheet.autoFilter = {
    from: 'A1',
    to: 'E1',
  };

  // Save file
  const outputPath = path.resolve(process.cwd(), filename);
  await workbook.xlsx.writeFile(outputPath);

  console.log(`✅ Excel report generated at: ${outputPath}`);
}