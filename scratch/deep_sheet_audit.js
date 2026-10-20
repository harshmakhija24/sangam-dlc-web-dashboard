const fs = require('fs');
const vm = require('vm');

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

const rows = parseCSV(content).slice(1);

const win = {};
vm.runInNewContext(fs.readFileSync('assets/sangam/resources_data.js', 'utf8'), { window: win });
const items = win.SANGAM_RES.ITEMS;

console.log('Comparing 85 Google Sheet rows against repo items using sourceUrl...');
let missingUrls = 0;
let urlDiffs = 0;

rows.forEach((r, idx) => {
  const num = parseInt(r[0], 10);
  const title = (r[1] || '').trim();
  if (!title) return;

  const item = items.find(it => it.sheetNum === num);
  if (!item) {
    console.log(`[MISSING ITEM] Sheet Num ${num}: "${title}"`);
    return;
  }

  const sheetEditedLink = (r[3] || '').trim();
  const sheetRawLink = (r[4] || '').trim();
  const sheetLink = sheetEditedLink && sheetEditedLink !== '-' ? sheetEditedLink : (sheetRawLink && sheetRawLink !== '-' ? sheetRawLink : '');

  if (sheetLink && !item.sourceUrl) {
    console.log(`[EMPTY SOURCE_URL] #${num} (${title}): Sheet has "${sheetLink}" but item.sourceUrl is empty`);
    missingUrls++;
  } else if (sheetLink && item.sourceUrl && sheetLink !== item.sourceUrl) {
    console.log(`[DIFF URL] #${num}: Sheet="${sheetLink}" vs Repo="${item.sourceUrl}"`);
    urlDiffs++;
  }
});

console.log(`Audit complete: missingUrls=${missingUrls}, urlDiffs=${urlDiffs}`);
