const fs = require('fs');

const scrapedYt = require('./scraped_youtube.json');
const scrapedWeb = require('./scraped_web.json');
const sheetRows = require('./sheet_rows.json');

const ytByNum = {};
scrapedYt.forEach(y => ytByNum[y.num] = y);

const webByNum = {};
scrapedWeb.forEach(w => webByNum[w.num] = w);

console.log('Building complete 100 artifacts dataset...');
