#!/usr/bin/env node
// JS 문법 검사 — assets/js, assets/i18n(locales 포함) 전체 + 각 HTML의 인라인 <script> + apps-script/*.gs
import vm from 'node:vm';
import { htmlPages, jsFiles, inlineScripts, read, rel, Reporter } from './lib/paths.mjs';
import { walk, ROOT } from './lib/paths.mjs';
import path from 'node:path';

const r = new Reporter('JS 문법 검사');
const check = (code, name) => { try { new vm.Script(code, { filename: name }); } catch (e) { r.error(`${name}: ${e.message}`); } };

let n = 0;
for (const f of jsFiles()) { check(read(f), rel(f)); n++; }
for (const f of htmlPages({ includeAdmin: true })) {
  for (const s of inlineScripts(read(f))) { check(s.code, `${rel(f)}:${s.line}(inline)`); n++; }
}
for (const f of walk(path.join(ROOT, 'apps-script'), (p) => p.endsWith('.gs'))) { check(read(f), `apps-script/${path.basename(f)}`); n++; }
console.log(`검사한 스크립트 ${n}개`);
process.exit(r.finish() ? 0 : 1);
