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
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', err => resolve({ status: 500, error: err.message, body: '' }));
    req.setTimeout(12000, () => { req.destroy(); resolve({ status: 408, body: '' }); });
  });
}

function cleanXmlText(xml) {
  return xml
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function scrapeAll() {
  const results = [];
  for (let i = 0; i < ytRows.length; i++) {
    const v = ytRows[i];
    console.log(`[${i + 1}/${ytRows.length}] Scraping: Row ${v.num} - ${v.title} (${v.videoId})...`);

    // 1. oEmbed
    const oembedRes = await fetchUrl(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v.videoId}&format=json`);
    let oembed = {};
    try {
      if (oembedRes.status === 200) oembed = JSON.parse(oembedRes.body);
    } catch (e) {}

    // 2. Watch page
    const pageRes = await fetchUrl(`https://www.youtube.com/watch?v=${v.videoId}`);
    let description = '';
    let durationSeconds = 0;
    let channelTitle = oembed.author_name || 'IIM Bangalore';
    let keywords = [];
    let ytTitle = oembed.title || v.title;
    let transcript = '';

    if (pageRes.status === 200) {
      const prM = pageRes.body.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});(?:var|<\/script>)/);
      if (prM) {
        try {
          const pData = JSON.parse(prM[1]);
          const vd = pData.videoDetails || {};
          if (vd.title) ytTitle = vd.title;
          if (vd.author) channelTitle = vd.author;
          if (vd.shortDescription) description = vd.shortDescription;
          if (vd.lengthSeconds) durationSeconds = parseInt(vd.lengthSeconds, 10);
          if (Array.isArray(vd.keywords)) keywords = vd.keywords;

          // Transcript
          const tracks = pData.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
          if (tracks.length > 0 && tracks[0].baseUrl) {
            const capRes = await fetchUrl(tracks[0].baseUrl);
            if (capRes.status === 200 && capRes.body) {
              transcript = cleanXmlText(capRes.body);
            }
          }
        } catch (e) {
          console.log(`  Error parsing player response for ${v.videoId}:`, e.message);
        }
      }

      // Fallback description regex if not found in player response
      if (!description) {
        const descM = pageRes.body.match(/"shortDescription":"(.*?)"/);
        if (descM) description = descM[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
    }

    console.log(`  -> Title: ${ytTitle}`);
    console.log(`  -> Duration: ${durationSeconds}s | Desc len: ${description.length} | Transcript words: ${transcript ? transcript.split(' ').length : 0}`);

    results.push({
      num: v.num,
      sheetTitle: v.title,
      videoId: v.videoId,
      youtubeTitle: ytTitle,
      author: channelTitle,
      authorUrl: oembed.author_url || 'https://www.youtube.com/@IIMBofficial',
      thumbnail: oembed.thumbnail_url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
      description: description || oembed.title || v.title,
      durationSeconds,
      keywords,
      transcript: transcript || '',
      area: v.area,
      category: v.category,
      embedUrl: `https://www.youtube.com/embed/${v.videoId}`
    });

    await new Promise(r => setTimeout(r, 250));
  }

  fs.writeFileSync('scratch/scraped_youtube_v2.json', JSON.stringify(results, null, 2));
  console.log('Successfully saved to scratch/scraped_youtube_v2.json!');
}

scrapeAll();
