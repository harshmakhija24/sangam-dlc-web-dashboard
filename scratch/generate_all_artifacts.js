// Generator for all 100 artifacts for Sangam DLC Resources v2.0.1
const fs = require('fs');

const scrapedYt = require('./scraped_youtube.json');
const scrapedWeb = require('./scraped_web.json');
const sheetRows = require('./sheet_rows.json');

const ytByNum = {};
scrapedYt.forEach(y => ytByNum[y.num] = y);

const webByNum = {};
scrapedWeb.forEach(w => webByNum[w.num] = w);

console.log('Generating complete dataset...');
