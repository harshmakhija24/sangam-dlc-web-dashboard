const https = require('https');
const http = require('http');
const fs = require('fs');
const rows = require('./sheet_rows.json');

const webRows = [];
rows.forEach(r => {
  const url = r.editedLink || r.rawLink || r.remarks || '';
  if (!/youtu\.?be/i.test(url) && !/drive\.google/i.test(url) && url && url !== '-') {
    webRows.push({ num: r.num, title: r.title, url, area: r.area, category: r.category, remarks: r.remarks });
  }
});

console.log('Total Web / PDF URLs to scrape:', webRows.length);

function fetchUrl(url, redirectCount = 0) {
  return new Promise((resolve) => {
    if (redirectCount > 5) return resolve({ status: 500, error: 'Too many redirects', body: '' });
    try {
      const u = new URL(url);
      const client = u.protocol === 'https:' ? https : http;
      const options = {
        hostname: u.hostname,
        path: u.pathname + u.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 10000
      };
      const req = client.get(options, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const nextUrl = new URL(res.headers.location, url).href;
          return resolve(fetchUrl(nextUrl, redirectCount + 1));
        }
        let data = '';
        res.on('data', chunk => {
          if (data.length < 500000) data += chunk; // Cap at 500KB
        });
        res.on('end', () => resolve({ status: res.statusCode, contentType: res.headers['content-type'], body: data }));
      });
      req.on('error', err => resolve({ status: 500, error: err.message, body: '' }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 408, error: 'Timeout', body: '' }); });
    } catch (e) {
      resolve({ status: 500, error: e.message, body: '' });
    }
  });
}

function cleanText(str) {
  return str.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

async function scrapeWeb() {
  const results = [];
  for (let i = 0; i < webRows.length; i++) {
    const item = webRows[i];
    console.log(`[${i+1}/${webRows.length}] Fetching ${item.title} -> ${item.url}...`);
    const res = await fetchUrl(item.url);
    let pageTitle = '';
    let metaDescription = '';
    let headings = [];
    let textExcerpt = '';

    if (res.status === 200 && res.body) {
      const isPdf = (res.contentType && res.contentType.includes('application/pdf')) || item.url.endsWith('.pdf');
      if (isPdf) {
        textExcerpt = `PDF Document: ${item.title}`;
      } else {
        const titleM = res.body.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleM) pageTitle = cleanText(titleM[1]);
        
        const descM = res.body.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) ||
                      res.body.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i) ||
                      res.body.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i);
        if (descM) metaDescription = cleanText(descM[1]);

        // extract h1, h2
        const hMatches = [...res.body.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi)].map(m => cleanText(m[1])).filter(Boolean).slice(0, 6);
        headings = hMatches;

        // extract paragraphs
        const pMatches = [...res.body.matchAll(/<p[^>]*>(.*?)<\/p>/gi)].map(m => cleanText(m[1])).filter(p => p.length > 40).slice(0, 5);
        textExcerpt = pMatches.join('\n\n');
      }
    }

    results.push({
      num: item.num,
      title: item.title,
      url: item.url,
      area: item.area,
      category: item.category,
      status: res.status,
      contentType: res.contentType,
      pageTitle: pageTitle || item.title,
      metaDescription,
      headings,
      textExcerpt: textExcerpt.slice(0, 1000)
    });

    await new Promise(r => setTimeout(r, 150));
  }

  fs.writeFileSync('scratch/scraped_web.json', JSON.stringify(results, null, 2));
  console.log('Saved scraped web results to scratch/scraped_web.json!');
}

scrapeWeb();
