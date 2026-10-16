const fs = require('fs');

// We will construct the 100 items dataset.
// Let's create helper functions for tags and metadata.

const scrapedYt = require('./scraped_youtube.json');
const scrapedWeb = require('./scraped_web.json');
const sheetRows = require('./sheet_rows.json');

const ytByNum = {};
scrapedYt.forEach(y => ytByNum[y.num] = y);

const webByNum = {};
scrapedWeb.forEach(w => webByNum[w.num] = w);

console.log('Script initialized.');
