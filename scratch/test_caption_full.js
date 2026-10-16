const https = require('https');

https.get('https://www.youtube.com/watch?v=5ym44J-AMNk', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const idx = d.indexOf('"captionTracks"');
    if (idx !== -1) {
      const slice = d.slice(idx, idx + 2000);
      const urlMatch = slice.match(/"baseUrl":"(https:[^"]+)"/);
      if (urlMatch) {
        const fullUrl = urlMatch[1].replace(/\\u0026/g, '&');
        console.log('Full caption url:', fullUrl);
        https.get(fullUrl, cres => {
          let cd = '';
          cres.on('data', c => cd += c);
          cres.on('end', () => {
            console.log('Caption status:', cres.statusCode);
            console.log('Caption response:', cd.slice(0, 300));
          });
        });
      }
    }
  });
});
