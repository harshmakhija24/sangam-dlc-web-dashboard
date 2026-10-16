const fs = require('fs');

const scrapedYt = require('./scraped_youtube.json');
const scrapedWeb = require('./scraped_web.json');
const sheetRows = require('./sheet_rows.json');

// Map scraped data by sheetNum
const ytByNum = {};
scrapedYt.forEach(y => ytByNum[y.num] = y);

const webByNum = {};
scrapedWeb.forEach(w => webByNum[w.num] = w);

console.log('Loaded scraped YT:', Object.keys(ytByNum).length);
console.log('Loaded scraped Web:', Object.keys(webByNum).length);
