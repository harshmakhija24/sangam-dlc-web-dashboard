const fs = require('fs');
const html = fs.readFileSync('C:/Users/harsh/.gemini/antigravity-ide/brain/a159ef76-c069-43db-9039-ab0a23517215/.system_generated/steps/25/content.md', 'utf8');
const regex = /docs-sheet-tab-caption">([^<]+)<\/span>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('Tab:', m[1]);
}
