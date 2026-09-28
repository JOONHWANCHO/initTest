#!/usr/bin/env node
// 새 언어 번역 파일 생성:  npm run i18n:scaffold -- de
//  · public/assets/i18n/locales/<lang>/ 에 ko 와 같은 파일 구조를 만들고, 값은 빈 문자열("")로 둡니다.
//  · 각 키 위에 ko(원문)와 en 을 주석으로 붙여 번역가가 바로 보고 작업할 수 있습니다.
//  · 빈 값은 "미번역"으로 취급되어 en → ko 순서로 자동 대체 표시됩니다 (사이트가 깨지지 않음).
//  · 이미 있는 파일은 건드리지 않습니다(--force 로 덮어쓰기).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { LOCALES_DIR, read } from './lib/paths.mjs';

const lang = process.argv[2];
const force = process.argv.includes('--force');
if (!lang || !/^[a-z]{2}(-[A-Z]{2})?$/.test(lang)) { console.error('사용법: npm run i18n:scaffold -- <언어코드>   예) de, fr, zh'); process.exit(1); }

const load = (l, f) => { let d = {}; const p = path.join(LOCALES_DIR, l, f); if (!fs.existsSync(p)) return d;
  vm.runInNewContext(read(p), { I18N: { add: (_a, _b, x) => { d = x; } } }); return d; };
const oneLine = (s) => String(s).replace(/\s+/g, ' ').slice(0, 300);

const dest = path.join(LOCALES_DIR, lang);
fs.mkdirSync(dest, { recursive: true });
let files = 0, keys = 0;
for (const f of fs.readdirSync(path.join(LOCALES_DIR, 'ko')).filter((x) => x.endsWith('.js'))) {
  const out = path.join(dest, f);
  if (fs.existsSync(out) && !force) { console.log(`  건너뜀(이미 있음): ${lang}/${f}`); continue; }
  const ns = f.slice(0, -3);
  const ko = load('ko', f), en = load('en', f);
  const lines = Object.keys(ko).map((k) => `  // ko: ${oneLine(ko[k])}\n  // en: ${oneLine(en[k] ?? '')}\n  ${JSON.stringify(k)}: ""`);
  keys += lines.length;
  fs.writeFileSync(out, `/* ${lang} — ${ns}  (값을 번역하세요. {placeholder} 와 <태그> 는 그대로 유지) */\nI18N.add(${JSON.stringify(lang)}, ${JSON.stringify(ns)}, {\n${lines.join(',\n')}\n});\n`);
  files++;
}
console.log(`\n✅ locales/${lang}: 파일 ${files}개, 키 ${keys}개 생성`);
console.log('다음: ① public/assets/i18n/i18n.js 의 LANGUAGES 에 언어 추가  ② scripts/i18n.config.json 의 optionalLangs 에 "' + lang + '" 추가  ③ 번역 후 npm run check:i18n -- --lang=' + lang);
