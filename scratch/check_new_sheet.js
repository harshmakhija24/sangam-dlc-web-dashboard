const fs = require('fs');
const content = fs.readFileSync('scratch/google_sheet_export.csv', 'utf8');

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f.length > 0)) {
      rows.push(currentRow);
    }
  }
  return rows;
}

const rows = parseCSV(content);
console.log('Total rows parsed:', rows.length);
console.log('Header:', rows[0]);

const dataRows = rows.slice(1);
console.log('Data rows count:', dataRows.length);

// Compare against current 85 items in resources_data.js
const vm = require('vm');
const win = {};
vm.runInNewContext(fs.readFileSync('assets/sangam/resources_data.js', 'utf8'), { window: win });
const currentItems = win.SANGAM_RES.ITEMS;
const currentSheetNums = new Set(currentItems.map(i => i.sheetNum));
const currentTitles = new Set(currentItems.map(i => i.title.toLowerCase().trim()));

console.log('Current items in repo:', currentItems.length);
console.log('Current sheetNums in repo:', [...currentSheetNums].sort((a,b)=>a-b));

console.log('\n--- Checking for rows not in current repo ---');
const newRows = [];
dataRows.forEach((r, idx) => {
  const num = parseInt(r[0], 10);
  const title = (r[1] || '').trim();
  if (!title) return;

  const titleLower = title.toLowerCase();
  const existsByNum = currentSheetNums.has(num);
  const existsByTitle = currentTitles.has(titleLower);

  if (!existsByNum && !existsByTitle) {
    newRows.push({ rowIdx: idx + 2, num, rawNum: r[0], title, area: r[2], editedLink: r[3], rawLink: r[4], status: r[5], category: r[6], remarks: r[7] });
  } else if (!existsByNum && existsByTitle) {
    console.log(`Matched by title but diff num: Sheet #${r[0]} "${title}"`);
  } else if (existsByNum && !existsByTitle) {
    // Check if title changed significantly
    const current = currentItems.find(i => i.sheetNum === num);
    console.log(`Same num #${num} but different title:`);
    console.log(`  Sheet:   "${title}"`);
    console.log(`  Current: "${current ? current.title : 'NONE'}"`);
  }
});

console.log(`\nFound ${newRows.length} BRAND NEW rows from Google Sheet:`);
newRows.forEach((nr, i) => {
  console.log(`${i+1}. [Row ${nr.rowIdx}] Num: ${nr.rawNum} | Title: "${nr.title}" | Category: ${nr.category} | Link: ${nr.editedLink || nr.rawLink || nr.remarks}`);
});

fs.writeFileSync('scratch/new_sheet_rows.json', JSON.stringify(newRows, null, 2));
