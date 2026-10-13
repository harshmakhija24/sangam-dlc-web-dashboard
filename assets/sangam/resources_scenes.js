/* Sangam DLC - flat 2D "Google-style" scenes, one per journey stage.
   Pure SVG + CSS (see .sc / .s-* in resources_v2.css). Colours come from the category tokens
   (--c main, --c2 soft, --ct tint), so each scene recolours itself. */
(function () {
  const open = '<svg class="sc" viewBox="0 0 160 100" aria-hidden="true" focusable="false"><circle cx="80" cy="50" r="46" fill="#fff" opacity=".65"/>';
  const SCENES = {
    // 1 Get started: a flag planted on a hill, sun breathing, cloud drifting
    swayam: open +
      '<circle class="s-sun" cx="124" cy="28" r="11" fill="var(--c2)"/>' +
      '<g class="s-cloud"><rect x="26" y="22" width="26" height="8" rx="4" fill="#fff"/><rect x="34" y="16" width="16" height="8" rx="4" fill="#fff"/></g>' +
      '<path d="M-4 104V76c24-16 52-18 80-8s56 6 88-6v42z" fill="var(--c2)"/>' +
      '<path d="M-4 104V90c28-10 56-12 84-6s54 2 84-4v24z" fill="var(--c)"/>' +
      '<rect x="76" y="34" width="3.5" height="50" rx="1.75" fill="var(--c)"/>' +
      '<path class="s-flag" d="M79.5 36h30l-9 9.5 9 9.5h-30z" fill="var(--c)"/></svg>',
    // 2 Plan: a course outline filling in, then a tick pops
    curriculum: open +
      '<rect x="38" y="16" width="84" height="68" rx="9" fill="#fff"/>' +
      '<path d="M38 25a9 9 0 0 1 9-9h66a9 9 0 0 1 9 9v5H38z" fill="var(--c)"/>' +
      '<circle cx="48" cy="23" r="2.2" fill="#fff"/><circle cx="55" cy="23" r="2.2" fill="#fff" opacity=".6"/>' +
      '<rect class="s-bar b1" x="48" y="40" width="46" height="7" rx="3.5" fill="var(--c2)"/>' +
      '<rect class="s-bar b2" x="48" y="53" width="62" height="7" rx="3.5" fill="var(--c)"/>' +
      '<rect class="s-bar b3" x="48" y="66" width="34" height="7" rx="3.5" fill="var(--c2)"/>' +
      '<g class="s-tick"><circle cx="112" cy="70" r="9" fill="var(--c)"/><path d="m107.5 70 3 3 5-6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',
    // 3 Prepare: typing dots, an AI reply sliding in, sparkles twinkling
    prompts: open +
      '<rect x="24" y="20" width="76" height="40" rx="14" fill="#fff"/><path d="M40 60l-5 14 19-14z" fill="#fff"/>' +
      '<circle class="s-dot d1" cx="48" cy="40" r="4.5" fill="var(--c)"/><circle class="s-dot d2" cx="62" cy="40" r="4.5" fill="var(--c)"/><circle class="s-dot d3" cx="76" cy="40" r="4.5" fill="var(--c)"/>' +
      '<g class="s-reply"><rect x="78" y="56" width="58" height="26" rx="12" fill="var(--c)"/><rect x="88" y="65" width="30" height="4" rx="2" fill="#fff"/><rect x="88" y="73" width="20" height="4" rx="2" fill="#fff" opacity=".6"/></g>' +
      '<path class="s-spark" d="M128 16l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="var(--c)"/>' +
      '<path class="s-spark s2" d="M112 30l1.6 4.4L118 36l-4.4 1.6L112 42l-1.6-4.4L106 36l4.4-1.6z" fill="var(--c2)"/></svg>',
    // 4 Teach: a microphone bobbing, sound waves rippling outward
    tips: open +
      '<g class="s-waves" fill="none" stroke="var(--c2)" stroke-width="4" stroke-linecap="round">' +
      '<path class="s-wave wl w1" d="M60 38q-9 12 0 24"/><path class="s-wave wl w2" d="M50 30q-15 20 0 40"/>' +
      '<path class="s-wave wr w1" d="M100 38q9 12 0 24"/><path class="s-wave wr w2" d="M110 30q15 20 0 40"/></g>' +
      '<g class="s-mic"><rect x="70" y="20" width="20" height="38" rx="10" fill="var(--c)"/>' +
      '<path d="M62 48a18 18 0 0 0 36 0" fill="none" stroke="var(--c)" stroke-width="4.5" stroke-linecap="round"/>' +
      '<path d="M80 66v10M70 76h20" fill="none" stroke="var(--c)" stroke-width="4.5" stroke-linecap="round"/>' +
      '<rect x="75" y="27" width="4" height="12" rx="2" fill="#fff" opacity=".55"/></g></svg>',
    // 5 Reflect: a bulb with a pulsing glow and blinking rays
    insights: open +
      '<circle class="s-glow" cx="80" cy="42" r="30" fill="#fff" opacity=".85"/>' +
      '<g class="s-rays" fill="none" stroke="var(--c2)" stroke-width="4" stroke-linecap="round">' +
      '<path class="s-ray" d="M80 6v6"/><path class="s-ray r2" d="M54 14l4 4"/><path class="s-ray r3" d="M106 14l-4 4"/><path class="s-ray r4" d="M40 42h6"/><path class="s-ray r5" d="M114 42h6"/></g>' +
      '<path d="M80 18a22 22 0 0 0-12 40c3 2 4 5 4 8h16c0-3 1-6 4-8a22 22 0 0 0-12-40z" fill="var(--c)"/>' +
      '<path d="M74 40l6 8 6-8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="72" y="70" width="16" height="5" rx="2.5" fill="var(--c2)"/><rect x="74" y="78" width="12" height="5" rx="2.5" fill="var(--c2)"/></svg>'
  };
  window.SANGAM_RES.SCENES = SCENES;
})();
