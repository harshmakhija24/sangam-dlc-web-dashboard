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
  function tokenMatches(hay, t) {
    if (hay.includes(t)) return true;
    if (t.endsWith('es') && hay.includes(t.slice(0, -2))) return true;
    if (t.endsWith('s') && hay.includes(t.slice(0, -1))) return true;
    if (t.endsWith('ies') && hay.includes(t.slice(0, -3) + 'y')) return true;
    if (t.endsWith('ing') && hay.includes(t.slice(0, -3))) return true;
    if (hay.includes(t + 's') || hay.includes(t + 'es')) return true;
    return false;
  }
  // `skip` lets facet counts ignore their own dimension.
  const match = (it, skip) =>
    (skip === 'cat' || st.cat === 'all' || it.cat === st.cat) &&
    (skip === 'fmt' || !st.fmt.size || st.fmt.has(it.fmt)) &&
    (skip === 'lvl' || st.lvl === 'all' || it.lvl === st.lvl) &&
    (!st.saved || saved.has(it.id)) &&
    tokens.every(t => tokenMatches(it.hay, t));
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
    tokens = st.q.toLowerCase().replace(/#/g, ' ').split(/\s+/).filter(Boolean);
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
      st.cat = 'all';
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
    else if ('q' in d) { st.q = d.q; st.cat = 'all'; }
    else if ('remove' in d) {
      const k = d.remove;
      if (k === 'cat') st.cat = 'all'; else if (k === 'lvl') st.lvl = 'all'; else if (k === 'saved') st.saved = false;
      else if (k === 'q') { st.q = ''; st.cat = 'all'; $('#q').focus(); } else if (k.startsWith('fmt:')) st.fmt.delete(k.slice(4));
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
    q.placeholder = `Search ${ITEMS.length} resources…`;
    let timer;
    q.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        st.q = q.value.trim();
        if (st.q) st.cat = 'all';
        st.page = 1;
        update('search');
      }, 120);
    });
    q.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        clearTimeout(timer);
        st.q = q.value.trim();
        if (st.q) st.cat = 'all';
        st.page = 1;
        update('search');
        toResults(true);
      } else if (e.key === 'Escape' && q.value) {
        q.value = '';
        st.q = '';
        st.page = 1;
        update('filter');
      }
    });
    // shared nav behaviour
    const nav = $('#nav');
    const onScroll = () => nav.classList.toggle('scrolled', scrollY > 50);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const tg = $('#nav-toggle');
    if (tg) tg.addEventListener('click', () => { const o = nav.classList.toggle('open'); tg.setAttribute('aria-expanded', o); });
    update('init');
    if (st.item) openItem(st.item);
    liveSheetSync();
  };

  /* ---------- Live Browser Google Sheet Sync & Auto-Tagger (Zero-CLI / JSONP) ---------- */
  const SHEET_ID = '1GajZnd3DU5rvw1zo7Ag71cFotvTt7e3vSkuDFGEmRzY';
  const STOP = new Set(['the','and','for','with','from','that','this','into','your','what','when','where','which','while','about','how','why','who','are','was','were','been','have','has','had','will','would','could','should','can','may','not','but','our','their','more','most','some','such','than','then','them','these','those','using','used','use','through','between','within','across','over','under','after','before','during']);

  function autoTags(it) {
    const seed = [...(it.tags || [])];
    const words = it.title.replace(/[^\w\s-]/g, ' ').split(/\s+/).map(w => w.trim().toLowerCase()).filter(w => w.length > 3 && !STOP.has(w));
    seed.push(it.title.replace(/[:–—-]/g, ' ').replace(/\s+/g, ' ').trim());
    words.forEach((w, i) => {
      seed.push(`${w} in higher education`, `${w} pedagogy`, `faculty ${w} guide`);
      if (i + 1 < words.length) seed.push(`${w} ${words[i + 1]}`, `${w} ${words[i + 1]} strategies`);
    });
    const fmtPools = {
      Video: ['video lecture', 'watch faculty video', 'recorded teaching tip', 'audiovisual pedagogy', 'video masterclass', 'classroom video tutorial', 'IIMB video resource'],
      PDF: ['PDF monograph', 'downloadable faculty PDF', 'printable educator handbook', 'reference PDF guide', 'academic PDF resource', 'institutional PDF manual'],
      Template: ['downloadable teaching template', 'course planning worksheet', 'ready-to-use syllabus template', 'pedagogical matrix template', 'faculty design canvas'],
      Checklist: ['quality assurance checklist', 'faculty audit checklist', 'step-by-step teaching checklist', 'course evaluation checklist', 'instructional review rubric'],
      'Prompt Pack': ['AI prompt pack', 'copy-paste LLM prompt', 'ChatGPT prompt for educators', 'GenAI system prompt', 'pedagogical prompt template'],
      Guide: ['practical educator guide', 'instructional walkthrough', 'faculty step-by-step manual', 'best practice teaching guide', 'pedagogical playbook'],
      'Research Paper': ['peer-reviewed educational research', 'empirical learning science', 'academic journal article', 'evidence-based pedagogy paper', 'higher ed research study'],
      'Case Study': ['teaching case study', 'business school case method', 'real-world pedagogical case', 'institutional case analysis', 'classroom case vignette'],
      Article: ['faculty insights article', 'higher education commentary', 'pedagogical briefing note', 'teaching methodology article', 'academic practice essay']
    };
    const catPools = {
      swayam: ['SWAYAM onboarding', 'SWAYAM MOOC delivery', 'open educational resources OER', 'UGC online course compliance', 'four-quadrant MOOC model', 'digital assessment readiness', 'NTA exam preparation', 'online learner retention', 'inclusive Indian higher education', 'NEP 2020 digital learning', 'SWAYAM course coordinator guide', 'Academic Bank of Credits ABC', 'national digital repository'],
      curriculum: ['curriculum architecture', 'backward course design', 'constructive alignment Biggs', 'Bloom revised taxonomy verbs', 'measurable learning outcomes', 'ADDIE instructional design', 'Universal Design for Learning UDL', 'cognitive load management', 'syllabus engineering', 'module quality review', 'student persona mapping', 'experiential course sequencing', 'semester planning blueprint'],
      prompts: ['generative AI in education', 'ChatGPT for business schools', 'LLM hallucination mitigation', 'AI-resilient assessment design', 'chain of verification prompting', 'localized Indian case generation', 'Socratic AI tutor prompts', 'prompt engineering for professors', 'ethical AI classroom policy', 'automated rubric generation', 'human-in-the-loop AI grading', 'custom GPT teaching assistant'],
      tips: ['Teaching Tips on Tap', 'IIM Bangalore faculty wisdom', 'classroom energy and presence', 'student engagement techniques', 'active learning facilitation', 'case method questioning', 'Socratic classroom dialogue', 'managing lecture pacing', 'overcoming teaching anxiety', 'hybrid and Zoom teaching', 'empathetic rigorous teaching', 'session plan execution', 'handling tough student questions'],
      insights: ['Faculty Insights research', 'desirable difficulties in learning', 'retrieval practice and spacing', 'interleaved problem solving', 'cognitive psychology in college', 'research-teaching synergy', 'business simulation pedagogy', 'immersive XR learning labs', 'instructional continuity planning', 'AI workforce readiness', 'academic career sustainability', 'B-school digital transformation', 'evidence-based university teaching']
    };
    seed.push(...(fmtPools[it.fmt] || fmtPools.Article), ...(catPools[it.cat] || catPools.tips),
      'Sangam DLC resource', 'IIMBx digital learning community', 'higher education teaching excellence', 'faculty development program FDP',
      'university pedagogy innovation', 'student-centered learning', 'management education pedagogy', 'reflective teaching practice',
      'instructional design best practices', 'college classroom effectiveness', 'Indian higher education reform', 'autonomous learner development',
      'metacognitive skill building', 'collaborative learning environments', 'pedagogical scholarship', 'academic rigor and empathy',
      'course delivery optimization', 'educator professional growth', 'evidence-informed instruction', 'transformative classroom experience',
      'authentic assessment design', 'analytic grading rubric', 'formative feedback loops', 'Harvard case method facilitation', 'asynchronous cohort engagement'
    );
    const seen = new Set(), out = [];
    seed.forEach(raw => {
      const t = String(raw || '').trim().replace(/^#+/, '').replace(/\s+/g, ' ');
      if (t.length > 2 && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); out.push(t); }
    });
    return out.slice(0, 55);
  }

  function buildHay(it) {
    const c = catOf(it.cat);
    return [it.title, it.desc, it.author || '', it.sourceName || '', (it.tags || []).join(' '), c ? c.name : it.cat, it.fmt, it.lvl, it.summary || '', (it.takeaways || []).join(' '), it.implementation || '', it.prompt || ''].join(' ').toLowerCase();
  }

  function liveSheetSync() {
    window.__sangamSheetSync = function (res) {
      if (!res || !res.table || !Array.isArray(res.table.rows)) return;
      const byNum = new Map(ITEMS.map(i => [i.sheetNum, i]));
      const byTitle = new Map(ITEMS.map(i => [i.title.toLowerCase().trim(), i]));
      let changed = false;

      res.table.rows.forEach(r => {
        const c = (r && r.c) || [];
        const cell = idx => (c[idx] && c[idx].v != null) ? String(c[idx].v).trim() : '';
        const num = parseInt(cell(0), 10);
        const title = cell(1);
        if (!num || !title) return;
        const area = cell(2), edited = cell(3), raw = cell(4), catCol = cell(6), remarks = cell(7);
        const url = (edited && edited !== '-') ? edited : ((raw && raw !== '-') ? raw : (/^https?:\/\//.test(remarks) ? remarks : ''));
        const vidMatch = url.match(/(?:youtu\.be\/|v=|shorts\/)([a-zA-Z0-9_-]{6,15})/);
        const videoId = vidMatch ? vidMatch[1] : '';

        const existing = byNum.get(num) || byTitle.get(title.toLowerCase());
        if (existing) {
          if (url && !existing.sourceUrl) { existing.sourceUrl = url; changed = true; }
          if (videoId && !existing.videoId) { existing.videoId = videoId; changed = true; }
          return;
        }

        // Brand-new row added to Google Sheet: auto-classify, auto-tag (50+ tags), and inject live
        const blob = `${title} ${area} ${catCol} ${url}`.toLowerCase();
        const cat = /prompt|chatgpt|llm|generative ai|genai|\bai\b|scenario question/.test(blob) ? 'prompts'
          : /swayam|oer|open educational|credit transfer|accessibility|wcag|forum|ndli|inflibnet|blueprint|question bank|question quality/.test(blob) ? 'swayam'
          : /curriculum|addie|udl|universal design|design thinking|instructional design|elearning|learning outcome|oscqr|learner profile/.test(blob) ? 'curriculum'
          : /desirable|difficulty|interleav|retrieval|research|tenure|elective|simulation|continuity|hori|workforce|cognitive/.test(blob) ? 'insights' : 'tips';
        const fmt = (videoId || /video/i.test(catCol)) ? 'Video'
          : (/\.pdf$/i.test(url) || /pdf/i.test(catCol)) ? 'PDF'
          : /checklist/i.test(title + ' ' + catCol) ? 'Checklist'
          : /template|canvas|matrix/i.test(title + ' ' + catCol) ? 'Template'
          : /prompt/i.test(title + ' ' + catCol) ? 'Prompt Pack'
          : /case/i.test(title + ' ' + catCol) ? 'Case Study'
          : /paper|research/i.test(catCol) ? 'Research Paper'
          : /guide|playbook|handbook/i.test(title) ? 'Guide' : 'Article';

        const newItem = {
          sheetNum: num,
          id: `${cat}-sheet-${num}`,
          cat,
          title,
          desc: `${title} — curated pedagogical resource for ${catOf(cat).name}.`,
          fmt,
          lvl: 'Intermediate',
          len: fmt === 'Video' ? '6 min watch' : '8 min read',
          author: videoId ? 'IIM Bangalore Faculty' : 'Sangam DLC Faculty Contributor',
          authorRole: 'Faculty & Instructional Design Contributor',
          sourceName: videoId ? 'IIMBx / Sangam YouTube Channel' : 'Sangam Digital Learning Community',
          sourceUrl: url,
          videoId,
          embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : '',
          thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '../../assets/sangam/course_ai_guide_1.png',
          summary: `${title} provides actionable frameworks and evidence-based pedagogical guidance curated by the Sangam Digital Learning Community (IIMBx).`,
          takeaways: [
            `Core pedagogical focus: ${title}.`,
            'Aligns instructional delivery with measurable learner engagement and cognitive retention.',
            'Adaptable for both in-person cohorts and asynchronous SWAYAM courses.'
          ],
          implementation: `Apply the frameworks from "${title}" during your next module planning or live session debrief.`,
          legalAttribution: 'Curated for Sangam Digital Learning Community (IIMBx).',
          tags: [],
          order: ITEMS.length,
          added: Date.now(),
          isNew: true
        };
        newItem.tags = autoTags(newItem);
        newItem.hay = buildHay(newItem);
        ITEMS.push(newItem);
        byId[newItem.id] = newItem;
        byNum.set(num, newItem);
        changed = true;
      });

      if (changed) {
        const q = $('#q');
        if (q) q.placeholder = `Search ${ITEMS.length} resources…`;
        update('init');
      }
    };

    const s = document.createElement('script');
    s.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=responseHandler:__sangamSheetSync`;
    s.async = true;
    document.head.appendChild(s);
  }
})();
