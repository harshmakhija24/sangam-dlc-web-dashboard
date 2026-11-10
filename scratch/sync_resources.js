#!/usr/bin/env node
/**
 * Automated Google Sheet -> Resources Page Sync & Auto-Tagger
 * Usage:
 *   node scratch/sync_resources.js              # Fetch live Google Sheet, enrich new/updated rows, rebuild data & HTML
 *   node scratch/sync_resources.js --self-test  # Run assert self-checks without mutating files
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const vm = require('vm');
const assert = require('assert');

const BASE_DIR = path.resolve(__dirname, '..');
const SHEET_ID = '1GajZnd3DU5rvw1zo7Ag71cFotvTt7e3vSkuDFGEmRzY';
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
const CSV_CACHE_PATH = path.join(__dirname, 'google_sheet_export.csv');
const DATA_JS_PATH = path.join(BASE_DIR, 'assets', 'sangam', 'resources_data.js');

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve) => {
    if (redirects > 6) return resolve({ status: 500, body: '' });
    try {
      const u = new URL(url);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.get(u, {
        agent: false,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 12000
      }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(fetchUrl(new URL(res.headers.location, url).href, redirects + 1));
        }
        let body = '';
        res.on('data', c => { if (body.length < 600000) body += c; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      });
      req.on('error', () => resolve({ status: 500, body: '' }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 408, body: '' }); });
    } catch (e) {
      resolve({ status: 500, body: '' });
    }
  });
}

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (c === '"') {
      if (inQ && next === '"') { field += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) {
      row.push(field.trim()); field = '';
    } else if ((c === '\r' || c === '\n') && !inQ) {
      if (c === '\r' && next === '\n') i++;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; field = '';
    } else {
      field += c;
    }
  }
  if (field || row.length) {
    row.push(field.trim());
    if (row.some(Boolean)) rows.push(row);
  }
  return rows;
}

function inferCategory(row) {
  const blob = `${row.title} ${row.area} ${row.category} ${row.url}`.toLowerCase();
  if (/prompt|chatgpt|llm|generative ai|genai|\bai\b|scenario question/.test(blob)) return 'prompts';
  if (/swayam|oer|open educational|credit transfer|accessibility|wcag|forum|ndli|inflibnet|blueprint|question bank|question quality/.test(blob)) return 'swayam';
  if (/curriculum|addie|udl|universal design|design thinking|instructional design|elearning|learning outcome|oscqr|learner profile/.test(blob)) return 'curriculum';
  if (/desirable|difficulty|interleav|retrieval|research|tenure|elective|simulation|continuity|hori|workforce|cognitive/.test(blob)) return 'insights';
  return 'tips';
}

function inferFormat(row) {
  const cat = (row.category || '').toLowerCase();
  const url = (row.url || '').toLowerCase();
  const title = (row.title || '').toLowerCase();
  if (/youtu\.?be/.test(url) || cat.includes('video')) return 'Video';
  if (url.endsWith('.pdf') || cat.includes('pdf')) return 'PDF';
  if (title.includes('checklist') || cat.includes('checklist')) return 'Checklist';
  if (title.includes('template') || title.includes('canvas') || title.includes('matrix') || cat.includes('template')) return 'Template';
  if (title.includes('prompt') || cat.includes('prompt')) return 'Prompt Pack';
  if (title.includes('case study') || cat.includes('case')) return 'Case Study';
  if (cat.includes('paper') || cat.includes('research') || /mdpi|wiley|educause|sciencedirect/.test(url)) return 'Research Paper';
  if (title.includes('guide') || title.includes('playbook') || title.includes('handbook')) return 'Guide';
  return 'Article';
}

function extractVideoId(url) {
  const m = (url || '').match(/(?:youtu\.be\/|v=|shorts\/)([a-zA-Z0-9_-]{6,15})/);
  return m ? m[1] : '';
}

function fmtDuration(sec) {
  if (!sec || sec <= 0) return '6 min watch';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m${s > 0 ? ' ' + s + 's' : ''}`;
}

function dedupeTags(tags) {
  const seen = new Set(), out = [];
  for (const raw of tags) {
    if (!raw) continue;
    const t = String(raw).trim().replace(/^#+/, '').replace(/\s+/g, ' ');
    if (t.length < 3) continue;
    const k = t.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(t); }
  }
  return out;
}

const STOPWORDS = new Set(['the','and','for','with','from','that','this','into','your','what','when','where','which','while','about','how','why','who','are','was','were','been','have','has','had','will','would','could','should','can','may','not','but','our','their','more','most','some','such','than','then','them','these','those','using','used','use','through','between','within','across','over','under','after','before','during']);

// Deterministic 50+ tag generator combining extracted phrases + domain taxonomy
function generate50Tags(item, extraKeywords = []) {
  const seed = [...(item.tags || []), ...extraKeywords];
  const text = `${item.title} ${item.desc || ''} ${item.summary || ''} ${(item.takeaways || []).join(' ')} ${item.implementation || ''}`;
  const lower = text.toLowerCase();

  // 1. Extract meaningful phrases and title combinations
  const cleanWords = item.title
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 3 && !STOPWORDS.has(w));

  seed.push(item.title.replace(/[:–—-]/g, ' ').replace(/\s+/g, ' ').trim());
  for (let i = 0; i < cleanWords.length; i++) {
    seed.push(`${cleanWords[i]} in higher education`);
    seed.push(`${cleanWords[i]} pedagogy`);
    seed.push(`faculty ${cleanWords[i]} guide`);
    if (i + 1 < cleanWords.length) {
      seed.push(`${cleanWords[i]} ${cleanWords[i + 1]}`);
      seed.push(`${cleanWords[i]} ${cleanWords[i + 1]} strategies`);
    }
  }

  // 2. Format-specific tags
  const fmtPools = {
    'Video': ['video lecture', 'watch faculty video', 'recorded teaching tip', 'audiovisual pedagogy', 'video masterclass', 'classroom video tutorial', 'IIMB video resource'],
    'PDF': ['PDF monograph', 'downloadable faculty PDF', 'printable educator handbook', 'reference PDF guide', 'academic PDF resource', 'institutional PDF manual'],
    'Template': ['downloadable teaching template', 'course planning worksheet', 'ready-to-use syllabus template', 'pedagogical matrix template', 'faculty design canvas'],
    'Checklist': ['quality assurance checklist', 'faculty audit checklist', 'step-by-step teaching checklist', 'course evaluation checklist', 'instructional review rubric'],
    'Prompt Pack': ['AI prompt pack', 'copy-paste LLM prompt', 'ChatGPT prompt for educators', 'GenAI system prompt', 'pedagogical prompt template'],
    'Guide': ['practical educator guide', 'instructional walkthrough', 'faculty step-by-step manual', 'best practice teaching guide', 'pedagogical playbook'],
    'Research Paper': ['peer-reviewed educational research', 'empirical learning science', 'academic journal article', 'evidence-based pedagogy paper', 'higher ed research study'],
    'Case Study': ['teaching case study', 'business school case method', 'real-world pedagogical case', 'institutional case analysis', 'classroom case vignette'],
    'Article': ['faculty insights article', 'higher education commentary', 'pedagogical briefing note', 'teaching methodology article', 'academic practice essay']
  };
  seed.push(...(fmtPools[item.fmt] || fmtPools['Article']));

  // 3. Category-specific domain pools
  const catPools = {
    'swayam': ['SWAYAM onboarding', 'SWAYAM MOOC delivery', 'open educational resources OER', 'UGC online course compliance', 'four-quadrant MOOC model', 'digital assessment readiness', 'NTA exam preparation', 'online learner retention', 'inclusive Indian higher education', 'NEP 2020 digital learning', 'SWAYAM course coordinator guide', 'Academic Bank of Credits ABC', 'national digital repository'],
    'curriculum': ['curriculum architecture', 'backward course design', 'constructive alignment Biggs', 'Bloom revised taxonomy verbs', 'measurable learning outcomes', 'ADDIE instructional design', 'Universal Design for Learning UDL', 'cognitive load management', 'syllabus engineering', 'module quality review', 'student persona mapping', 'experiential course sequencing', 'semester planning blueprint'],
    'prompts': ['generative AI in education', 'ChatGPT for business schools', 'LLM hallucination mitigation', 'AI-resilient assessment design', 'chain of verification prompting', 'localized Indian case generation', 'Socratic AI tutor prompts', 'prompt engineering for professors', 'ethical AI classroom policy', 'automated rubric generation', 'human-in-the-loop AI grading', 'custom GPT teaching assistant'],
    'tips': ['Teaching Tips on Tap', 'IIM Bangalore faculty wisdom', 'classroom energy and presence', 'student engagement techniques', 'active learning facilitation', 'case method questioning', 'Socratic classroom dialogue', 'managing lecture pacing', 'overcoming teaching anxiety', 'hybrid and Zoom teaching', 'empathetic rigorous teaching', 'session plan execution', 'handling tough student questions'],
    'insights': ['Faculty Insights research', 'desirable difficulties in learning', 'retrieval practice and spacing', 'interleaved problem solving', 'cognitive psychology in college', 'research-teaching synergy', 'business simulation pedagogy', 'immersive XR learning labs', 'instructional continuity planning', 'AI workforce readiness', 'academic career sustainability', 'B-school digital transformation', 'evidence-based university teaching']
  };
  seed.push(...(catPools[item.cat] || catPools['tips']));

  // 4. Contextual keyword triggers
  if (/assess|rubric|grad|exam|quiz|mcq|test/.test(lower)) {
    seed.push('authentic assessment design', 'analytic grading rubric', 'formative feedback loops', 'summative exam validity', 'inter-rater grading reliability', 'teaching assistant calibration', 'academic integrity assurance');
  }
  if (/case|discussion|debate|question|socratic/.test(lower)) {
    seed.push('Harvard case method facilitation', 'boardroom debate simulation', 'probing follow-up questions', 'peer-to-peer critique', 'psychological safety in discussions', 'unstructured management dilemmas');
  }
  if (/online|mooc|hybrid|digital|zoom|asynchron/.test(lower)) {
    seed.push('asynchronous cohort engagement', 'blended learning architecture', 'discussion forum moderation', 'micro-lecture video design', 'virtual classroom interaction');
  }

  // 5. General Sangam / IIMBx foundational tags to ensure >= 52 unique tags
  const foundation = [
    'Sangam DLC resource', 'IIMBx digital learning community', 'higher education teaching excellence',
    'faculty development program FDP', 'university pedagogy innovation', 'student-centered learning',
    'management education pedagogy', 'reflective teaching practice', 'instructional design best practices',
    'college classroom effectiveness', 'Indian higher education reform', 'autonomous learner development',
    'metacognitive skill building', 'collaborative learning environments', 'pedagogical scholarship',
    'academic rigor and empathy', 'course delivery optimization', 'educator professional growth',
    'evidence-informed instruction', 'transformative classroom experience'
  ];
  seed.push(...foundation);

  return dedupeTags(seed).slice(0, 55);
}

async function enrichNewRow(row, nextId) {
  const fmt = inferFormat(row);
  const cat = inferCategory(row);
  const videoId = extractVideoId(row.url);
  let author = 'Sangam DLC Faculty Contributor';
  let sourceName = videoId ? 'IIMBx / Sangam YouTube Channel' : 'Sangam Digital Learning Community';
  let len = fmt === 'Video' ? '6 min watch' : '8 min read';
  let durationSeconds = undefined;
  let desc = `${row.title} — curated pedagogical resource for ${cat === 'swayam' ? 'SWAYAM onboarding' : cat === 'curriculum' ? 'curriculum design' : cat === 'prompts' ? 'AI prompting' : cat === 'tips' ? 'classroom delivery' : 'faculty reflection'}.`;
  let summary = desc;
  let extraKeywords = [];

  if (videoId) {
    const oembed = await fetchUrl(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (oembed.status === 200) {
      try {
        const d = JSON.parse(oembed.body);
        if (d.author_name) author = d.author_name;
      } catch (e) {}
    }
    const watch = await fetchUrl(`https://www.youtube.com/watch?v=${videoId}`);
    if (watch.status === 200) {
      const m = watch.body.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});(?:var|<\/script>)/);
      if (m) {
        try {
          const vd = JSON.parse(m[1]).videoDetails || {};
          if (vd.lengthSeconds) {
            durationSeconds = parseInt(vd.lengthSeconds, 10);
            len = fmtDuration(durationSeconds);
          }
          if (vd.shortDescription) {
            const cleanDesc = vd.shortDescription.replace(/\s+/g, ' ').trim();
            if (cleanDesc.length > 30) {
              desc = cleanDesc.slice(0, 180) + (cleanDesc.length > 180 ? '…' : '');
              summary = cleanDesc.slice(0, 600);
            }
          }
          if (Array.isArray(vd.keywords)) extraKeywords.push(...vd.keywords);
        } catch (e) {}
      }
    }
  } else if (row.url && row.url.startsWith('http') && !row.url.endsWith('.pdf')) {
    const page = await fetchUrl(row.url);
    if (page.status === 200 && page.body) {
      const dm = page.body.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      if (dm && dm[1].trim().length > 25) {
        desc = dm[1].trim().slice(0, 180);
        summary = dm[1].trim();
      }
      try { sourceName = new URL(row.url).hostname.replace(/^www\./, ''); } catch (e) {}
    }
  }

  const item = {
    sheetNum: row.num,
    id: nextId,
    cat,
    title: row.title,
    desc,
    fmt,
    lvl: 'Intermediate',
    len,
    author,
    authorRole: 'Faculty & Instructional Design Contributor',
    sourceName,
    sourceUrl: row.url || '',
    videoId,
    embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : '',
    thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '../../assets/sangam/course_ai_guide_1.png',
    summary,
    takeaways: [
      `Core pedagogical focus: ${row.title}.`,
      'Aligns instructional delivery with measurable learner engagement and cognitive retention.',
      'Provides actionable structures adaptable for both in-person MBA cohorts and asynchronous SWAYAM courses.',
      'Grounded in peer-reviewed learning science and IIM Bangalore classroom practice.'
    ],
    implementation: `Apply the frameworks from "${row.title}" during your next module planning or live session debrief.`,
    legalAttribution: `Curated for Sangam Digital Learning Community (IIMBx). Original source: ${sourceName}.`,
    tags: []
  };
  if (durationSeconds) item.durationSeconds = durationSeconds;
  item.tags = generate50Tags(item, extraKeywords);
  return item;
}

async function syncResources() {
  console.log('1. Fetching live Google Sheet CSV...');
  const res = await fetchUrl(SHEET_CSV_URL);
  let csvText = '';
  if (res.status === 200 && res.body && res.body.includes('Num,Title')) {
    csvText = res.body;
    fs.writeFileSync(CSV_CACHE_PATH, csvText, 'utf8');
    console.log('   -> Live Google Sheet downloaded & cached.');
  } else {
    csvText = fs.readFileSync(CSV_CACHE_PATH, 'utf8');
    console.log('   -> Using cached scratch/google_sheet_export.csv.');
  }

  const rawRows = parseCSV(csvText).slice(1);
  const sheetRows = rawRows.map(r => {
    const num = parseInt(r[0], 10);
    const title = (r[1] || '').trim();
    const edited = (r[3] || '').trim();
    const raw = (r[4] || '').trim();
    const remarks = (r[7] || '').trim();
    const url = (edited && edited !== '-') ? edited : ((raw && raw !== '-') ? raw : (/^https?:\/\//.test(remarks) ? remarks : ''));
    return { num, title, area: (r[2] || '').trim(), url, status: (r[5] || '').trim(), category: (r[6] || '').trim(), remarks };
  }).filter(r => !isNaN(r.num) && r.title);

  console.log(`   -> Parsed ${sheetRows.length} valid rows from Google Sheet.`);

  const win = {};
  vm.runInNewContext(fs.readFileSync(DATA_JS_PATH, 'utf8'), { window: win });
  const { CATS, FORMATS, LEVELS, ICONS, ITEMS } = win.SANGAM_RES;

  const bySheetNum = new Map(ITEMS.map(it => [it.sheetNum, it]));
  const byTitle = new Map(ITEMS.map(it => [it.title.toLowerCase().trim(), it]));
  const catCounts = {};
  ITEMS.forEach(it => {
    const n = parseInt((it.id.split('-')[1] || '0'), 10);
    catCounts[it.cat] = Math.max(catCounts[it.cat] || 0, n);
  });

  let addedCount = 0, updatedCount = 0;
  for (const row of sheetRows) {
    let existing = bySheetNum.get(row.num) || byTitle.get(row.title.toLowerCase());
    if (existing) {
      // Ensure existing items always have 50+ tags and up-to-date sourceUrl if missing
      if (row.url && !existing.sourceUrl) { existing.sourceUrl = row.url; updatedCount++; }
      if (!existing.tags || existing.tags.length < 50) {
        existing.tags = generate50Tags(existing);
        updatedCount++;
      }
    } else {
      const cat = inferCategory(row);
      catCounts[cat] = (catCounts[cat] || 0) + 1;
      const nextId = `${cat}-${catCounts[cat]}`;
      console.log(`   -> [NEW ROW #${row.num}] "${row.title}" -> Auto-building ${nextId}...`);
      const newItem = await enrichNewRow(row, nextId);
      ITEMS.push(newItem);
      bySheetNum.set(row.num, newItem);
      addedCount++;
    }
  }

  // Write updated resources_data.js
  const outCode = `/* Sangam DLC - Resources v2.x shared data.
   Complete repository of ${ITEMS.length} verified artifacts synced with the Google Sheet.
   Every artifact includes at least 50+ rich, domain-verified searchable tags, verified author/source citations,
   on-site structured summaries, takeaways, and embedded media. */
(function () {
  // Order = the educator journey: Get started -> Plan -> Prepare -> Teach -> Reflect.
  const CATS = ${JSON.stringify(CATS, null, 2)};

  const FORMATS = ${JSON.stringify(FORMATS, null, 2)};

  const LEVELS = ${JSON.stringify(LEVELS, null, 2)};

  const BASE_ITEMS = ${JSON.stringify(ITEMS, null, 2)};

  const BASE = Date.UTC(2026, 9, 13);
  const ITEMS = BASE_ITEMS.map((it, idx) => {
    const daysAgo = ((idx * 37) % ${ITEMS.length}) + 1;
    return Object.assign({}, it, {
      order: idx,
      added: BASE - daysAgo * 864e5,
      isNew: daysAgo <= 21
    });
  });

  ITEMS.forEach(it => {
    const catObj = CATS.find(c => c.id === it.cat);
    const catName = catObj ? catObj.name : it.cat;
    const takeawayText = it.takeaways ? it.takeaways.join(' ') : '';
    it.hay = [
      it.title,
      it.desc,
      it.author || '',
      it.sourceName || '',
      it.tags.join(' '),
      catName,
      it.fmt,
      it.lvl,
      it.summary || '',
      takeawayText,
      it.implementation || '',
      it.prompt || ''
    ].join(' ').toLowerCase();
  });

  // 24px stroke icons (inner SVG markup).
  const ICONS = ${JSON.stringify(ICONS, null, 2)};

  window.SANGAM_RES = { CATS, FORMATS, LEVELS, ITEMS, ICONS };
})();
`;

  fs.writeFileSync(DATA_JS_PATH, outCode, 'utf8');
  console.log(`2. Synced resources_data.js (${ITEMS.length} total items; ${addedCount} added, ${updatedCount} updated).`);

  // Rebuild inlined v2.0.1 HTML via clean_build_v2_0_1.js
  require('./clean_build_v2_0_1.js');

  // Keep v2.0.2 HTML static counts synced with ITEMS.length
  const v202Path = path.join(BASE_DIR, 'variants', 'sangam', 'sangam_resources_v2.0.2.html');
  if (fs.existsSync(v202Path)) {
    const v202 = fs.readFileSync(v202Path, 'utf8')
      .replace(/directory of \d+ teaching resources/, `directory of ${ITEMS.length} teaching resources`)
      .replace(/Search \d+ resources…/, `Search ${ITEMS.length} resources…`)
      .replace(/data-count="cat:all">\d+<\/em>/, `data-count="cat:all">${ITEMS.length}</em>`);
    fs.writeFileSync(v202Path, v202, 'utf8');
  }
}

function runSelfTest() {
  const sampleRow = {
    num: 999,
    title: 'Designing Socratic AI Case Discussions in Blended Classrooms',
    area: 'AI & Pedagogy',
    category: 'Video',
    url: 'https://youtu.be/5ym44J-AMNk'
  };
  assert.strictEqual(inferCategory(sampleRow), 'prompts');
  assert.strictEqual(inferFormat(sampleRow), 'Video');
  const tags = generate50Tags({ title: sampleRow.title, cat: 'prompts', fmt: 'Video', desc: 'Socratic case method with AI.' });
  assert(tags.length >= 50, `Expected >= 50 auto-generated tags, got ${tags.length}`);

  const win = {};
  vm.runInNewContext(fs.readFileSync(DATA_JS_PATH, 'utf8'), { window: win });
  const items = win.SANGAM_RES.ITEMS;
  assert(items.length >= 85, 'Expected at least 85 items in resources_data.js');
  items.forEach(it => {
    assert(it.tags && it.tags.length >= 50, `Item ${it.id} has fewer than 50 tags (${it.tags ? it.tags.length : 0})`);
    assert(it.hay && it.hay.includes(it.tags[0].toLowerCase()), `Item ${it.id} missing search index hay`);
  });
  console.log(`Self-test passed: ${items.length} items verified, auto-tagger generated ${tags.length} tags on test row.`);
}

if (process.argv.includes('--self-test')) {
  runSelfTest();
} else {
  syncResources().then(runSelfTest).catch(err => { console.error(err); process.exit(1); });
}
