import fs from 'fs';
import Papa from 'papaparse';

export function parseCSVFile(path: string): any[] {
  const fileContent = fs.readFileSync(path, 'utf8');

  const result = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    console.error('CSV parsing errors:', result.errors);
    throw new Error('Failed to parse CSV.');
  }

  return result.data;
}
