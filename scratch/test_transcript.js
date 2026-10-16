const https = require('https');

https.get('https://www.youtube.com/watch?v=5ym44J-AMNk', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const descMatch = d.match(/"shortDescription":"(.*?)"/);
    console.log('Desc:', descMatch ? descMatch[1].replace(/\\n/g, '\n').slice(0, 300) : 'none');
    const capMatch = d.match(/"captionTracks":\[\{"baseUrl":"(.*?)"/);
    if (capMatch) {
      let captionUrl = capMatch[1].replace(/\\u0026/g, '&');
      console.log('Caption URL:', captionUrl.slice(0, 100));
      https.get(captionUrl, cres => {
        let cd = '';
        cres.on('data', c => cd += c);
        cres.on('end', () => {
          const text = cd.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ');
          console.log('Transcript sample:', text.slice(0, 300));
        });
      });
    }
  });
});
