const fs = require('fs');

const content = fs.readFileSync('C:/Users/harsh/.gemini/antigravity-ide/brain/a159ef76-c069-43db-9039-ab0a23517215/.system_generated/steps/21/content.md', 'utf8');
const lines = content.split('\n').slice(8);

const rows = [];
// Parse CSV respecting quotes if any
function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i+1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

lines.forEach((l) => {
  if (!l.trim()) return;
  const p = parseCSVLine(l);
  const num = parseInt(p[0]);
  if (!isNaN(num) && p[1] && p[1].trim()) {
    rows.push({
      num,
      title: p[1].trim(),
      area: (p[2] || '').trim(),
      editedLink: (p[3] || '').trim(),
      rawLink: (p[4] || '').trim(),
      status: (p[5] || '').trim(),
      category: (p[6] || '').trim(),
      remarks: (p[7] || '').trim()
    });
  }
});

console.log('Valid rows count:', rows.length);
console.log(JSON.stringify(rows.slice(0, 5), null, 2));
fs.writeFileSync('scratch/sheet_rows.json', JSON.stringify(rows, null, 2));
