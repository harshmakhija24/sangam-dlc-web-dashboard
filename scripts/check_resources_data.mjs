// Sanity check for the Resources v2.x dataset. Run: node scripts/check_resources_data.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const win = {};
vm.runInNewContext(readFileSync(new URL('../assets/sangam/resources_data.js', import.meta.url), 'utf8'), { window: win });
const { CATS, FORMATS, LEVELS, ITEMS, ICONS } = win.SANGAM_RES;

assert.equal(ITEMS.length, 100, 'expected 100 artifacts');
assert.equal(new Set(ITEMS.map(i => i.id)).size, 100, 'ids must be unique');
assert.equal(new Set(ITEMS.map(i => i.title)).size, 100, 'titles must be unique');
for (const c of CATS) assert.equal(ITEMS.filter(i => i.cat === c.id).length, 20, `${c.id} should have 20`);
for (const i of ITEMS) {
  assert.ok(i.fmt in FORMATS, `${i.id}: bad format ${i.fmt}`);
  assert.ok(LEVELS.includes(i.lvl), `${i.id}: bad level ${i.lvl}`);
  assert.ok(i.title && i.desc && i.len && i.tags.length, `${i.id}: missing field`);
  if (i.cat === 'prompts' && i.fmt !== 'Checklist') assert.ok(i.prompt, `${i.id}: prompt item needs prompt text`);
}
for (const n of [...Object.values(FORMATS), ...CATS.map(c => c.icon)]) assert.ok(ICONS[n], `missing icon ${n}`);
console.log('OK: 100 artifacts, 5 categories x 20, ids/titles unique, icons present');
