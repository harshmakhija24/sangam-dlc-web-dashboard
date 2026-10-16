const https = require('https');
const http = require('http');
const fs = require('fs');
const rows = require('./sheet_rows.json');

const ytRows = [];
rows.forEach(r => {
  const url = r.editedLink || r.rawLink || r.remarks || '';
  if (/youtu\.?be/i.test(url)) {
    let videoId = '';
    const m1 = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    const m2 = url.match(/v=([a-zA-Z0-9_-]+)/);
    const m3 = url.match(/shorts\/([a-zA-Z0-9_-]+)/);
    if (m1) videoId = m1[1];
    else if (m2) videoId = m2[1];
    else if (m3) videoId = m3[1];
    ytRows.push({ num: r.num, title: r.title, url, videoId, area: r.area, category: r.category });
  }
});

console.log('Total YT videos to scrape:', ytRows.length);

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', err => resolve({ status: 500, error: err.message, body: '' }));
    req.setTimeout(10000, () => { req.destroy(); resolve({ status: 408, body: '' }); });
  });
}

async function scrapeVideos() {
  const results = [];
  for (let i = 0; i < ytRows.length; i++) {
    const v = ytRows[i];
    console.log(`[${i+1}/${ytRows.length}] Scraping: ${v.title} (${v.videoId})...`);
    
    // 1. oEmbed
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v.videoId}&format=json`;
    const oembedRes = await fetchUrl(oembedUrl);
    let oembed = {};
    try {
      if (oembedRes.status === 200) oembed = JSON.parse(oembedRes.body);
    } catch(e) {}

    // 2. Watch page
    const pageUrl = `https://www.youtube.com/watch?v=${v.videoId}`;
    const pageRes = await fetchUrl(pageUrl);
    let description = '';
    let durationSeconds = 0;
    let channelTitle = oembed.author_name || 'IIM Bangalore';
    let keywords = [];

    if (pageRes.status === 200) {
      const descM = pageRes.body.match(/"shortDescription":"(.*?)"/);
      if (descM) {
        description = descM[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
      const durM = pageRes.body.match(/"approxDurationMs":"(\d+)"/);
      if (durM) {
        durationSeconds = Math.round(parseInt(durM[1], 10) / 1000);
      }
      const kwM = pageRes.body.match(/"keywords":\[(.*?)\]/);
      if (kwM) {
        try {
          keywords = JSON.parse('[' + kwM[1] + ']');
        } catch(e) {}
      }
    }

    results.push({
      num: v.num,
      sheetTitle: v.title,
      videoId: v.videoId,
      youtubeTitle: oembed.title || v.title,
      author: channelTitle,
      authorUrl: oembed.author_url || 'https://www.youtube.com/@IIMBofficial',
      thumbnail: oembed.thumbnail_url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
      description: description || oembed.title || v.title,
      durationSeconds,
      keywords,
      area: v.area,
      category: v.category,
      embedUrl: `https://www.youtube.com/embed/${v.videoId}`
    });

    // Small delay to be polite
    await new Promise(r => setTimeout(r, 200));
  }

  fs.writeFileSync('scratch/scraped_youtube.json', JSON.stringify(results, null, 2));
  console.log('Saved to scratch/scraped_youtube.json!');
}

scrapeVideos();
