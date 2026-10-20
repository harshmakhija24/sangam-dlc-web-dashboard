const https = require('https');
const url = 'https://docs.google.com/spreadsheets/d/1GajZnd3DU5rvw1zo7Ag71cFotvTt7e3vSkuDFGEmRzY/htmlview';

function fetch(u) {
  https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return fetch(res.headers.location);
    }
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log('Fetched HTML view. Length:', d.length);
      const sheetMatches = [];
      const regex = /id="sheet-button-([^"]+)"[^>]*>([^<]+)</g;
      let m;
      while ((m = regex.exec(d)) !== null) {
        sheetMatches.push({ id: m[1], name: m[2].trim() });
      }
      console.log('Sheet buttons found:', sheetMatches);
      
      const gidRegex = /gid=(\d+)/g;
      const gids = new Set();
      while ((m = gidRegex.exec(d)) !== null) {
        gids.add(m[1]);
      }
      console.log('GIDs found in page:', Array.from(gids));
    });
  }).on('error', e => console.error(e));
}
fetch(url);
