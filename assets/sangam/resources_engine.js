/* Sangam DLC - Resources v2.x shared engine.
   State -> filter/search/sort -> render, with URL-hash persistence, saved items (localStorage),
   a native <dialog> detail view, and a toast. Pages supply markup + optional App.render(ctx). */
(function () {
  const { CATS, FORMATS, LEVELS, ITEMS, ICONS } = window.SANGAM_RES;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const svg = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const catOf = id => CATS.find(c => c.id === id);
  const byId = Object.fromEntries(ITEMS.map(i => [i.id, i]));
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ACTION = { Audio: 'Listen now', Video: 'Watch now', Article: 'Read now', Guide: 'Open guide', Template: 'Get template', 'Prompt Pack': 'Get prompts', Checklist: 'Get checklist' };

  const App = (window.SangamResources = { per: 12, defaultView: 'grid', render: null, svg, esc, cats: CATS });

  /* ---------- state ---------- */
  const st = { q: '', cat: 'all', fmt: new Set(), lvl: 'all', sort: 'featured', page: 1, view: 'grid', saved: false, item: '' };
  App.state = st;
  const KEY = 'sangam_res_saved_v2';
  let saved = new Set();
  try { saved = new Set(JSON.parse(localStorage.getItem(KEY) || '[]').filter(id => byId[id])); } catch (e) { /* storage blocked: session only */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify([...saved])); } catch (e) { /* ignore */ } };

  function readHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    const cat = p.get('cat'); if (cat && catOf(cat)) st.cat = cat;
    st.q = (p.get('q') || '').slice(0, 80);
    st.fmt = new Set((p.get('fmt') || '').split(',').filter(f => f in FORMATS));
    if (LEVELS.includes(p.get('lvl'))) st.lvl = p.get('lvl');
    if (['featured', 'new', 'az'].includes(p.get('sort'))) st.sort = p.get('sort');
    st.page = Math.max(1, parseInt(p.get('page'), 10) || 1);
    if (['grid', 'list'].includes(p.get('view'))) st.view = p.get('view');
    st.saved = p.get('saved') === '1';
    st.item = byId[p.get('item')] ? p.get('item') : '';
  }
  function writeHash() {
    const p = new URLSearchParams();
    if (st.q) p.set('q', st.q);
    if (st.cat !== 'all') p.set('cat', st.cat);
    if (st.fmt.size) p.set('fmt', [...st.fmt].join(','));
    if (st.lvl !== 'all') p.set('lvl', st.lvl);
    if (st.sort !== 'featured') p.set('sort', st.sort);
    if (st.page > 1) p.set('page', st.page);
    if (st.view !== App.defaultView) p.set('view', st.view);
    if (st.saved) p.set('saved', '1');
    if (st.item) p.set('item', st.item);
    const h = p.toString();
    history.replaceState(null, '', location.pathname + location.search + (h ? '#' + h : ''));
  }

  /* ---------- filtering ---------- */
  let tokens = [], hlRe = null;
  // `skip` lets facet counts ignore their own dimension.
  const match = (it, skip) =>
    (skip === 'cat' || st.cat === 'all' || it.cat === st.cat) &&
    (skip === 'fmt' || !st.fmt.size || st.fmt.has(it.fmt)) &&
    (skip === 'lvl' || st.lvl === 'all' || it.lvl === st.lvl) &&
    (!st.saved || saved.has(it.id)) &&
    tokens.every(t => it.hay.includes(t));
  const sorters = { featured: (a, b) => a.order - b.order, new: (a, b) => b.added - a.added, az: (a, b) => a.title.localeCompare(b.title) };
  const hl = s => hlRe ? String(s).split(hlRe).map((p, i) => i % 2 ? `<mark>${esc(p)}</mark>` : esc(p)).join('') : esc(s);
  const fmtDate = ms => new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

  /* ---------- markup ---------- */
  const saveBtn = (it, s) => `<button type="button" class="save" data-save="${it.id}" aria-pressed="${s}" aria-label="${s ? 'Remove from saved' : 'Save'}: ${esc(it.title)}" title="${s ? 'Saved' : 'Save for later'}">${svg('bookmark')}</button>`;
  const newTag = it => it.isNew ? '<span class="new"><i></i>New</span>' : '';
  App.card = (it, i) => {
    const c = catOf(it.cat);
    return `<article class="rc c-${it.cat}" style="--i:${Math.min(i, 11)}">
      <div class="rc-top"><span class="chip-cat">${svg(c.icon)}${esc(c.short)}</span>${newTag(it)}</div>
      <h3 class="rc-title"><button type="button" class="rc-open" data-open="${it.id}">${hl(it.title)}</button></h3>
      <p class="rc-desc">${hl(it.desc)}</p>
      <div class="rc-foot"><span class="rc-meta">${svg(FORMATS[it.fmt])}<b>${it.fmt}</b><i>·</i>${esc(it.len)}<i>·</i>${it.lvl}</span>${saveBtn(it, saved.has(it.id))}</div>
    </article>`;
  };
  App.row = (it, i) => {
    const c = catOf(it.cat);
    return `<article class="rw c-${it.cat}" style="--i:${Math.min(i, 11)}">
      <span class="rw-ico">${svg(FORMATS[it.fmt])}</span>
      <div class="rw-main"><h3 class="rw-title"><button type="button" class="rc-open" data-open="${it.id}">${hl(it.title)}</button>${newTag(it)}</h3><p>${hl(it.desc)}</p></div>
      <span class="rw-cat"><span class="chip-cat">${esc(c.short)}</span></span>
      <span class="rw-fmt">${it.fmt}</span><span class="rw-lvl">${it.lvl}</span><span class="rw-len">${esc(it.len)}</span>
      ${saveBtn(it, saved.has(it.id))}
    </article>`;
  };
  App.flat = items => items.map((it, i) => (st.view === 'list' ? App.row : App.card)(it, i)).join('');
  const emptyHTML = () => {
    const none = st.saved && !saved.size;
    return `<div class="empty"><div class="empty-ic">${svg(none ? 'bookmark' : 'search')}</div>
      <h3>${none ? 'Nothing saved yet' : 'No artifacts match'}</h3>
      <p>${none ? 'Tap the bookmark on any artifact to keep it here.' : 'Try fewer filters or a different word.'}</p>
      <button type="button" class="btn btn-ghost" data-reset>${none ? 'Browse everything' : 'Clear all filters'}</button></div>`;
  };
  const pagerHTML = ctx => {
    if (ctx.hidePager || ctx.pages < 2) return '';
    const p = st.page, n = ctx.pages;
    const nums = [...new Set([1, n, p - 1, p, p + 1])].filter(x => x >= 1 && x <= n).sort((a, b) => a - b);
    let out = `<button type="button" class="pg" data-page="${p - 1}" ${p === 1 ? 'disabled' : ''}>${svg('arrow', 'flip')}<span>Previous</span></button>`, prev = 0;
    nums.forEach(x => {
      if (x - prev > 1) out += '<span class="pg-gap" aria-hidden="true">…</span>';
      out += `<button type="button" class="pg num" data-page="${x}" ${x === p ? 'aria-current="page"' : ''} aria-label="Page ${x}">${x}</button>`;
      prev = x;
    });
    return out + `<button type="button" class="pg" data-page="${p + 1}" ${p === n ? 'disabled' : ''}><span>Next</span>${svg('arrow')}</button>`;
  };

  /* ---------- update cycle ---------- */
  function update(reason) {
    tokens = st.q.toLowerCase().split(/\s+/).filter(Boolean);
    hlRe = tokens.length ? new RegExp('(' + tokens.map(escRe).join('|') + ')', 'gi') : null;
    const items = ITEMS.filter(i => match(i)).sort(sorters[st.sort]);
    const pages = Math.max(1, Math.ceil(items.length / App.per));
    st.page = Math.min(st.page, pages);
    const ctx = { items, pageItems: items.slice((st.page - 1) * App.per, st.page * App.per), total: items.length, pages, st, reason, hidePager: false };
    paint(ctx); sync(ctx); writeHash();
  }
  function paint(ctx) {
    const box = $('#results');
    box.classList.toggle('animate', !reduceMotion() && ['filter', 'page', 'init'].includes(ctx.reason));
    box.dataset.view = st.view;
    if (!ctx.total) { box.innerHTML = emptyHTML(); ctx.hidePager = true; return; }
    if (!(App.render && App.render(ctx))) box.innerHTML = App.flat(ctx.pageItems);
  }
  function sync(ctx) {
    const q = $('#q');
    if (q.value.trim() !== st.q) q.value = st.q;
    const qc = $('#q-clear'); if (qc) qc.hidden = !st.q;
    $$('[data-cat]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === st.cat));
    $$('[data-fmt]').forEach(b => b.setAttribute('aria-pressed', st.fmt.has(b.dataset.fmt)));
    $$('[data-lvl]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lvl === st.lvl));
    $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === st.view));
    $$('[data-saved-toggle]').forEach(b => b.setAttribute('aria-pressed', st.saved));
    $$('[data-bind]').forEach(s => { s.value = st[s.dataset.bind]; });
    $$('[data-saved-count]').forEach(el => { el.textContent = saved.size; });
    // faceted counts
    const cnt = (skip, key) => { const m = {}; ITEMS.forEach(i => { if (match(i, skip)) m[i[key]] = (m[i[key]] || 0) + 1; }); return m; };
    const cc = cnt('cat', 'cat'), fc = cnt('fmt', 'fmt'), lc = cnt('lvl', 'lvl');
    const all = ITEMS.filter(i => match(i, 'cat')).length;
    $$('[data-count]').forEach(el => {
      const [k, v] = el.dataset.count.split(':');
      el.textContent = k === 'cat' ? (v === 'all' ? all : cc[v] || 0) : k === 'fmt' ? fc[v] || 0 : lc[v] || 0;
    });
    const cd = $('#cat-desc'); if (cd) cd.textContent = st.cat === 'all' ? 'Browse everything, or pick a category.' : catOf(st.cat).desc;
    // summary line
    const sum = $('#summary');
    if (sum) {
      const a = (st.page - 1) * App.per + 1, b = a + ctx.pageItems.length - 1;
      sum.textContent = !ctx.total ? '0 artifacts'
        : ctx.hidePager ? `${ctx.total} artifacts in ${CATS.length} categories`
        : `Showing ${a}–${b} of ${ctx.total} artifact${ctx.total === 1 ? '' : 's'}`;
    }
    // removable active filters
    const act = $('#active');
    if (act) {
      const chips = [];
      if (st.cat !== 'all') chips.push(['cat', catOf(st.cat).name]);
      st.fmt.forEach(f => chips.push(['fmt:' + f, f]));
      if (st.lvl !== 'all') chips.push(['lvl', st.lvl]);
      if (st.q) chips.push(['q', '\u201C' + st.q + '\u201D']);
      if (st.saved) chips.push(['saved', 'Saved only']);
      act.hidden = !chips.length;
      act.innerHTML = chips.map(([k, l]) => `<button type="button" class="fchip" data-remove="${esc(k)}" aria-label="Remove filter: ${esc(l)}">${esc(l)}${svg('x')}</button>`).join('') + (chips.length ? '<button type="button" class="link-btn" data-reset>Clear all</button>' : '');
    }
    const pg = $('#pager'); if (pg) pg.innerHTML = pagerHTML(ctx);
  }

  function toResults(force, sel) {
    const el = (sel && $(sel)) || $('#results-top') || $('#results');
    const y = el.getBoundingClientRect().top + scrollY - 88;
    if (force || y < scrollY) scrollTo({ top: y, behavior: reduceMotion() ? 'auto' : 'smooth' });
  }
  function resetFilters() { st.q = ''; st.cat = 'all'; st.fmt = new Set(); st.lvl = 'all'; st.saved = false; st.page = 1; }

  /* ---------- toast (popover => stays above the open <dialog>) ---------- */
  const toastEl = document.createElement('div');
  toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('popover', 'manual');
  let tt;
  function toast(msg) {
    clearTimeout(tt); toastEl.textContent = msg;
    try { if (!toastEl.matches(':popover-open')) toastEl.showPopover(); } catch (e) { /* no popover support */ }
    requestAnimationFrame(() => toastEl.classList.add('show'));
    tt = setTimeout(() => { toastEl.classList.remove('show'); setTimeout(() => { try { toastEl.hidePopover(); } catch (e) { /* ignore */ } }, 200); }, 1800);
  }
  async function copy(text, done) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (e2) { toast('Copy blocked by browser'); t.remove(); return; }
      t.remove();
    }
    toast(done);
  }

  /* ---------- detail dialog ---------- */
  const dlg = document.createElement('dialog');
  dlg.className = 'dlg'; dlg.setAttribute('aria-labelledby', 'dlg-title');
  function openItem(id) {
    const it = byId[id]; if (!it) return;
    const c = catOf(it.cat), s = saved.has(id);
    st.item = id; writeHash();

    // Structured plain-text notes for one-click copy
    const notesLines = [
      `TITLE: ${it.title}`,
      `CATEGORY: ${c.name} | FORMAT: ${it.fmt} | LEVEL: ${it.lvl} | LENGTH: ${it.len}`,
      it.author ? `AUTHOR / FACULTY: ${it.author}${it.authorRole ? ` (${it.authorRole})` : ''}` : '',
      it.sourceName ? `SOURCE: ${it.sourceName}` : '',
      '',
      'SUMMARY & PEDAGOGICAL CONTEXT:',
      it.summary || it.desc,
      '',
      it.takeaways && it.takeaways.length ? `KEY TAKEAWAYS & ACTIONABLE INSIGHTS:\n${it.takeaways.map(t => '• ' + t).join('\n')}` : '',
      '',
      it.implementation ? `CLASSROOM / SWAYAM IMPLEMENTATION:\n${it.implementation}` : '',
      '',
      it.prompt ? `PROMPT TEMPLATE:\n${it.prompt}` : '',
      '',
      `SEARCH TAGS:\n${it.tags.map(t => '#' + t).join(' ')}`,
      '',
      'CITATION & ATTRIBUTION:',
      it.legalAttribution || `Educational fair use resource curated for Sangam Digital Learning Community (IIMBx). Original source: ${it.sourceName || 'Sangam DLC'}.`,
      it.sourceUrl ? `Original reference URL: ${it.sourceUrl}` : ''
    ].filter(Boolean).join('\n');
    dlg._notesText = notesLines;

    dlg.innerHTML = `<div class="dlg-inner c-${it.cat}">
      <button type="button" class="dlg-x" data-dlg-close aria-label="Close">${svg('x')}</button>
      <div class="dlg-top-bar">
        <span class="chip-cat">${svg(c.icon)}${esc(c.name)}</span>
        ${it.author ? `<span class="dlg-author-chip">${svg('user')}${esc(it.author)}</span>` : ''}
      </div>
      <h2 id="dlg-title">${esc(it.title)}</h2>
      <p class="dlg-desc">${esc(it.desc)}</p>
      
      <dl class="dlg-meta">
        <div><dt>Format</dt><dd>${svg(FORMATS[it.fmt] || 'doc')}${it.fmt}</dd></div>
        <div><dt>Level</dt><dd>${it.lvl}</dd></div>
        <div><dt>Length</dt><dd>${esc(it.len)}</dd></div>
        <div><dt>Added</dt><dd>${fmtDate(it.added)}</dd></div>
      </dl>

      ${it.videoId ? `
        <div class="dlg-video-container">
          <iframe src="https://www.youtube-nocookie.com/embed/${esc(it.videoId)}?rel=0" title="${esc(it.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
        </div>
      ` : ''}

      ${(it.summary || it.desc) ? `
        <div class="dlg-section dlg-summary">
          <h4>Summary &amp; Pedagogical Context</h4>
          <p>${esc(it.summary || it.desc)}</p>
        </div>
      ` : ''}

      ${it.takeaways && it.takeaways.length ? `
        <div class="dlg-section dlg-takeaways">
          <h4>Key Takeaways &amp; Actionable Insights</h4>
          <ul>${it.takeaways.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        </div>
      ` : ''}

      ${it.implementation ? `
        <div class="dlg-section dlg-implementation">
          <h4>Classroom &amp; SWAYAM Implementation</h4>
          <p>${esc(it.implementation)}</p>
        </div>
      ` : ''}

      ${it.prompt ? `
        <div class="dlg-prompt">
          <div class="dlg-prompt-h">
            <span>Pedagogical Prompt Template</span>
            <button type="button" class="link-btn" data-copy-prompt>${svg('copy')}Copy prompt</button>
          </div>
          <pre>${esc(it.prompt)}</pre>
        </div>
      ` : ''}

      <div class="dlg-legal">
        <div class="dlg-legal-title">Citation &amp; Source Attribution</div>
        <p>
          ${it.author ? `<strong>Author / Creator:</strong> ${esc(it.author)}${it.authorRole ? ` (${esc(it.authorRole)})` : ''}<br>` : ''}
          ${it.sourceName ? `<strong>Source / Platform:</strong> ${esc(it.sourceName)}<br>` : ''}
          <em>${esc(it.legalAttribution || 'Curated under educational fair use for academic teaching and instructional development. Content, video streams, and structured learning notes remain hosted directly on this portal.')}</em>
        </p>
        ${it.sourceUrl ? `<div><a href="${esc(it.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="dlg-source-link">${svg('external')}View original reference citation (${esc(it.sourceName || 'Source')})</a></div>` : ''}
      </div>

      <div class="dlg-tags-wrap">
        <div class="dlg-tags-head">
          <span class="dlg-tags-label">Search Tags (${it.tags.length})</span>
          <span class="dlg-tags-hint">Click any tag to search</span>
        </div>
        <div class="dlg-tags">
          ${it.tags.map(t => `<button type="button" class="dlg-tag" data-tag-filter="${esc(t)}">#${esc(t)}</button>`).join('')}
        </div>
      </div>

      <div class="dlg-actions">
        <button type="button" class="btn btn-primary" data-copy-notes="${id}">${svg('copy')}Copy Notes &amp; Takeaways</button>
        <button type="button" class="btn btn-ghost" data-save="${id}" aria-pressed="${s}">${svg('bookmark')}<span class="save-label">${s ? 'Saved' : 'Save'}</span></button>
        <button type="button" class="btn btn-ghost" data-copy-link>${svg('link')}Copy link</button>
      </div>
    </div>`;

    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
  }
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { st.item = ''; writeHash(); });

  function toggleSave(id) {
    const on = !saved.has(id);
    on ? saved.add(id) : saved.delete(id);
    persist();
    toast(on ? 'Saved for later' : 'Removed from saved');
    $$(`[data-save="${id}"]`).forEach(b => {
      b.setAttribute('aria-pressed', on);
      const l = $('.save-label', b); if (l) l.textContent = on ? 'Saved' : 'Save';
      else b.setAttribute('aria-label', (on ? 'Remove from saved' : 'Save') + ': ' + byId[id].title);
    });
    $$('[data-saved-count]').forEach(el => { el.textContent = saved.size; });
    if (st.saved) update('save');              // list itself changes
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-cat],[data-fmt],[data-lvl],[data-view],[data-page],[data-open],[data-save],[data-saved-toggle],[data-reset],[data-remove],[data-q],[data-dlg-close],[data-copy-prompt],[data-copy-link],[data-copy-notes],[data-tag-filter]');
    if (!t) return;
    const d = t.dataset;
    if ('dlgClose' in d) return dlg.close();
    if ('copyPrompt' in d) return copy(byId[st.item].prompt, 'Prompt copied');
    if ('copyLink' in d) return copy(location.href, 'Link copied');
    if ('copyNotes' in d) return copy(dlg._notesText || '', 'Notes & takeaways copied');
    if ('tagFilter' in d) {
      dlg.close();
      st.q = d.tagFilter;
      st.page = 1;
      const q = $('#q');
      if (q) q.value = st.q;
      update('search');
      toResults(true);
      toast(`Filtering by #${d.tagFilter}`);
      return;
    }
    if ('open' in d) return openItem(d.open);
    if ('save' in d) return toggleSave(d.save);
    if ('view' in d) { st.view = d.view; return update('view'); }
    if ('cat' in d) st.cat = ('toggle' in d && st.cat === d.cat) ? 'all' : d.cat;
    else if ('fmt' in d) st.fmt.has(d.fmt) ? st.fmt.delete(d.fmt) : st.fmt.add(d.fmt);
    else if ('lvl' in d) st.lvl = d.lvl;
    else if ('savedToggle' in t.dataset) st.saved = !st.saved;
    else if ('reset' in d) resetFilters();
    else if ('q' in d) { st.q = d.q; }
    else if ('remove' in d) {
      const k = d.remove;
      if (k === 'cat') st.cat = 'all'; else if (k === 'lvl') st.lvl = 'all'; else if (k === 'saved') st.saved = false;
      else if (k === 'q') { st.q = ''; $('#q').focus(); } else if (k.startsWith('fmt:')) st.fmt.delete(k.slice(4));
    }
    if ('page' in d) { st.page = Number(d.page); update('page'); return toResults(); }
    st.page = 1; update('filter');
    if ('scroll' in d) toResults(true, d.scroll);
  });
  document.addEventListener('change', e => {
    const b = e.target.closest('[data-bind]'); if (!b) return;
    st[b.dataset.bind] = b.value; st.page = 1; update('filter');
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !dlg.open && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { e.preventDefault(); $('#q').focus(); }
  });

  App.init = function (cfg) {
    Object.assign(App, cfg);
    st.view = App.defaultView;
    document.body.append(dlg, toastEl);
    $$('[data-icon]').forEach(el => el.insertAdjacentHTML('afterbegin', svg(el.dataset.icon)));
    readHash();
    const q = $('#q');
    q.value = st.q;
    let timer;
    q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { st.q = q.value.trim(); st.page = 1; update('search'); }, 120); });
    q.addEventListener('keydown', e => { if (e.key === 'Escape' && q.value) { q.value = ''; st.q = ''; st.page = 1; update('filter'); } });
    // shared nav behaviour
    const nav = $('#nav');
    const onScroll = () => nav.classList.toggle('scrolled', scrollY > 50);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const tg = $('#nav-toggle');
    if (tg) tg.addEventListener('click', () => { const o = nav.classList.toggle('open'); tg.setAttribute('aria-expanded', o); });
    update('init');
    if (st.item) openItem(st.item);
  };
})();
