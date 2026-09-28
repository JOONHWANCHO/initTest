#!/usr/bin/env node
// 번역 무결성 점검 (npm run check:i18n)
//  1) 모든 언어가 ko(원문)와 같은 키를 갖는지   2) {placeholder} 일치   3) 번역문에 한글이 남아 있지 않은지(미번역 감지)
//  4) 코드(HTML/JS)에서 쓰는 키가 실제 사전에 있는지   5) 어디서도 안 쓰는 키(경고)
// 옵션:  node scripts/check-i18n.mjs [--lang=de]   특정 언어만 대조
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, PUBLIC, LOCALES_DIR, htmlPages, jsFiles, read, rel, Reporter } from './lib/paths.mjs';

const cfg = JSON.parse(read(path.join(ROOT, 'scripts', 'i18n.config.json')));
const only = (process.argv.find((a) => a.startsWith('--lang=')) || '').split('=')[1];
const HANGUL = /[가-힣]/;
const r = new Reporter('번역 무결성 점검');

function loadLang(lang) {
  const dict = {};
  const dir = path.join(LOCALES_DIR, lang);
  if (!fs.existsSync(dir)) return dict;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const sandbox = { I18N: { add: (_l, ns, d) => { dict[ns] = Object.assign(dict[ns] || {}, d); } } };
    try { vm.runInNewContext(read(path.join(dir, f)), sandbox, { filename: `${lang}/${f}` }); }
    catch (e) { r.error(`${lang}/${f}: 로드 실패 — ${e.message}`); }
  }
  return dict;
}
const ph = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(',');
const langsOnDisk = fs.readdirSync(LOCALES_DIR).filter((d) => fs.statSync(path.join(LOCALES_DIR, d)).isDirectory());
const targetLangs = (only ? [only] : [...cfg.requiredLangs, ...cfg.optionalLangs]).filter((l) => l !== cfg.sourceLang);
for (const l of cfg.requiredLangs) if (!langsOnDisk.includes(l)) r.error(`필수 언어 폴더 없음: locales/${l}`);

const src = loadLang(cfg.sourceLang);
const srcKeys = {};                       // key -> ns
for (const [ns, d] of Object.entries(src)) for (const k of Object.keys(d)) srcKeys[k] = ns;

// ── 1~3. 언어별 대조 ─────────────────────────────────────────
for (const lang of targetLangs) {
  const required = cfg.requiredLangs.includes(lang);
  const report = (m) => (required ? r.error(m) : r.warn(m));
  if (!langsOnDisk.includes(lang)) { if (!required) r.warn(`locales/${lang} 폴더 없음`); continue; }
  const t = loadLang(lang);
  let missing = 0, untranslated = 0;
  for (const [ns, d] of Object.entries(src)) {
    for (const [k, v] of Object.entries(d)) {
      const tv = t[ns] && t[ns][k];
      if (tv === undefined || tv === '') { missing++; if (missing <= 8) report(`[${lang}] 누락: ${ns}.js → ${k}`); continue; }
      if (ph(v) !== ph(tv) && !cfg.placeholderExceptions.includes(k)) report(`[${lang}] {placeholder} 불일치: ${k}  (ko ${ph(v) || '-'} / ${lang} ${ph(tv) || '-'})`);
      if (HANGUL.test(tv) && !cfg.hangulAllowedInTranslations.some((w) => tv.includes(w))) { untranslated++; if (untranslated <= 8) report(`[${lang}] 한글이 남아 있음(미번역?): ${k} = ${tv.slice(0, 40)}`); }
    }
    for (const k of Object.keys(t[ns] || {})) if (d[k] === undefined) r.warn(`[${lang}] ko에 없는 키: ${ns}.js → ${k}`);
  }
  if (missing > 8) report(`[${lang}] 누락 키 총 ${missing}개`);
  if (untranslated > 8) report(`[${lang}] 미번역(한글 잔존) 총 ${untranslated}개`);
}

// ── 4~5. 코드에서 사용하는 키 ─────────────────────────────────
const used = new Set();
function pageNsOfJs(p) {
  const m = p.match(/^assets\/js\/pages\/(?:tools\/)?([^/]+)\.js$/);
  return m ? m[1] : null;
}
function visible(ns) { return (k) => srcKeys[k] && (srcKeys[k] === 'common' || srcKeys[k] === ns); }
function checkKey(key, ns, where) {
  if (!key || /[${}]/.test(key)) return;
  used.add(key);
  if (!visible(ns)(key)) {
    if (srcKeys[key]) r.error(`${where}: 키 "${key}" 는 ${srcKeys[key]}.js 에 있어 이 페이지(${ns || 'common'})에서 로드되지 않습니다`);
    else r.error(`${where}: 사전에 없는 키 "${key}"`);
  }
}
for (const f of htmlPages({ includeAdmin: false })) {
  const html = read(f), p = rel(f);
  const ns = (html.match(/data-ns="([^"]*)"/) || [])[1] || null;
  for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) checkKey(m[1], ns, p);
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g))
    for (const pair of m[1].split(';')) checkKey(pair.slice(pair.indexOf(':') + 1), ns, p);
  for (const m of html.matchAll(/I18N\.t\(\s*['"]([^'"]+)['"]/g)) checkKey(m[1], ns, p);
}
for (const f of jsFiles()) {
  const p = rel(f);
  if (p.startsWith('assets/i18n/')) continue;
  const ns = pageNsOfJs(p);
  for (const m of read(f).matchAll(/I18N\.(?:t|has)\(\s*['"]([^'"]+)['"]/g)) checkKey(m[1], ns, p);
}
let unused = 0;
for (const k of Object.keys(srcKeys)) {
  if (used.has(k) || cfg.dynamicKeyPrefixes.some((pre) => k.startsWith(pre))) continue;
  unused++; if (unused <= 10) r.warn(`사용되지 않는 키: ${k}`);
}
if (unused > 10) r.warn(`사용되지 않는 키 총 ${unused}개`);

console.log(`원문 키 ${Object.keys(srcKeys).length}개 · 대상 언어 ${targetLangs.join(', ') || '(없음)'} · 코드에서 참조된 키 ${used.size}개`);
process.exit(r.finish() ? 0 : 1);
