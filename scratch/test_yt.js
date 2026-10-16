const https = require('https');

https.get('https://www.youtube.com/watch?v=5ym44J-AMNk', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const descMatch = d.match(/"shortDescription":"(.*?)"/);
    console.log('Desc:', descMatch ? descMatch[1].slice(0, 300) : 'none');
    const capMatch = d.match(/captionTracks":\[(.*?)\]/);
    console.log('Captions:', capMatch ? capMatch[1].slice(0, 300) : 'none');
  });
});
