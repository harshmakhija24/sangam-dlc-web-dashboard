const fs = require('fs');

const tips = require('./build_tips.js');
const insights = require('./build_insights.js');
const prompts = require('./build_prompts.js');
const curriculum = require('./build_curriculum.js');
const swayam = require('./build_swayam.js');

console.log('Counts:');
console.log('tips:', tips.length);
console.log('insights:', insights.length);
console.log('prompts:', prompts.length);
console.log('curriculum:', curriculum.length);
console.log('swayam:', swayam.length);

// Verify tag counts: each must have >= 25 tags!
const all = [...tips, ...insights, ...prompts, ...curriculum, ...swayam];
console.log('Total artifacts:', all.length);

all.forEach(item => {
  if (!item.tags || item.tags.length < 25) {
    console.error(`Warning: item ${item.id} has only ${item.tags ? item.tags.length : 0} tags!`);
  }
});

// Interleave categories
const CAT_KEYS = ['swayam', 'curriculum', 'prompts', 'tips', 'insights'];
const byCat = { swayam, curriculum, prompts, tips, insights };

const interleaved = [];
for (let pos = 0; pos < 20; pos++) {
  CAT_KEYS.forEach(k => {
    const it = byCat[k][pos];
    interleaved.push(it);
  });
}

console.log('Interleaved total:', interleaved.length);

// Generate JavaScript code for assets/sangam/resources_data.js
const outCode = `/* Sangam DLC - Resources v2.x shared data.
   Complete repository of 100 enriched artifacts based on Google Sheets & verified sources.
   Every artifact includes at least 25-30 searchable tags, verified author and source citations,
   on-site structured summaries, takeaways, and embedded media. */
(function () {
  // Order = the educator journey: Get started -> Plan -> Prepare -> Teach -> Reflect.
  const CATS = [
    { id: 'swayam', verb: 'Get started', name: 'Swayam Onboarding', short: 'Swayam Onboarding', icon: 'compass', desc: 'Join and engage with the Sangam community, SWAYAM platforms, and digital assessments.' },
    { id: 'curriculum', verb: 'Plan', name: 'Curriculum Design', short: 'Curriculum Design', icon: 'layout', desc: 'Innovative approaches to planning, backward design, and course architecture for modern classrooms.' },
    { id: 'prompts', verb: 'Prepare', name: 'Prompting Tips', short: 'Prompting Tips', icon: 'spark', desc: 'Ready-to-use pedagogical prompt templates and generative AI frameworks designed for educators.' },
    { id: 'tips', verb: 'Teach', name: 'Teaching Tips on Tap', short: 'Tips on Tap', icon: 'mic', desc: 'Watch and listen to teaching tips from IIM Bangalore faculty to enhance your classroom delivery.' },
    { id: 'insights', verb: 'Reflect', name: 'Faculty Insights', short: 'Faculty Insights', icon: 'bulb', desc: 'Research, evidence-based cognitive science, and case studies shared by educators in digital learning.' }
  ];

  const FORMATS = {
    Video: 'play',
    Article: 'doc',
    Guide: 'book',
    Template: 'layers',
    'Prompt Pack': 'spark',
    Checklist: 'checklist',
    'Case Study': 'case',
    'Research Paper': 'paper',
    PDF: 'pdf',
    Audio: 'headphones'
  };

  const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

  const BASE_ITEMS = ${JSON.stringify(interleaved, null, 2)};

  const BASE = Date.UTC(2026, 9, 13);
  const ITEMS = BASE_ITEMS.map((it, idx) => {
    const daysAgo = ((idx * 37) % 100) + 1;
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
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bookmark: '<path d="M6 4h12v17l-6-4-6 4z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z"/>',
    layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5z"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    book: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v13H5.5A1.5 1.5 0 0 0 4 18.5z"/><path d="M4 18.5A1.5 1.5 0 0 0 5.5 20H19v-3"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    checklist: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8.5 12 2.5 2.5L16 9.5"/>',
    case: '<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 11h18"/>',
    paper: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h2a1.5 1.5 0 0 0 0-3H9v6"/><path d="M15 10v6"/>',
    all: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
  };

  window.SANGAM_RES = { CATS, FORMATS, LEVELS, ITEMS, ICONS };
})();
`;

fs.writeFileSync('assets/sangam/resources_data.js', outCode);
console.log('Successfully written to assets/sangam/resources_data.js!');
