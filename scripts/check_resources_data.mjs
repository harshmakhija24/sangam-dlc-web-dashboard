// Sanity check for the Resources v2.x dataset. Run: node scripts/check_resources_data.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const win = {};
vm.runInNewContext(readFileSync(new URL('../assets/sangam/resources_data.js', import.meta.url), 'utf8'), { window: win });
const { CATS, FORMATS, LEVELS, ITEMS, ICONS } = win.SANGAM_RES;

assert.equal(ITEMS.length, 85, 'expected 85 artifacts');
assert.equal(new Set(ITEMS.map(i => i.id)).size, 85, 'ids must be unique');
assert.equal(new Set(ITEMS.map(i => i.title)).size, 85, 'titles must be unique');
for (const i of ITEMS) {
  assert.ok(i.fmt in FORMATS, `${i.id}: bad format ${i.fmt}`);
  assert.ok(LEVELS.includes(i.lvl), `${i.id}: bad level ${i.lvl}`);
  assert.ok(i.title && i.desc && i.len && i.tags.length, `${i.id}: missing field`);
  assert.ok(i.tags.length >= 25, `${i.id}: expected at least 25 tags, got ${i.tags.length}`);
  if (i.cat === 'prompts' && i.fmt !== 'Checklist') assert.ok(i.prompt, `${i.id}: prompt item needs prompt text`);
}
for (const n of [...Object.values(FORMATS), ...CATS.map(c => c.icon)]) assert.ok(ICONS[n], `missing icon ${n}`);
console.log('OK: 85 artifacts strictly from Google Sheet, ids/titles unique, all tags >= 25, icons present');
