// 공용 경로/파일 유틸 — 모든 scripts/*.mjs 가 사용합니다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const PUBLIC = path.join(ROOT, 'public');
export const I18N_DIR = path.join(PUBLIC, 'assets', 'i18n');
export const LOCALES_DIR = path.join(I18N_DIR, 'locales');
export const SITE_ORIGIN = 'https://noriya.kr';

export const read = (p) => fs.readFileSync(p, 'utf8');
export const rel = (p) => path.relative(PUBLIC, p).split(path.sep).join('/');

export function walk(dir, filter = () => true, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, filter, out);
    else if (filter(p)) out.push(p);
  }
  return out;
}

/** public/ 아래의 모든 HTML 페이지 (admin 제외 옵션) */
export function htmlPages({ includeAdmin = false } = {}) {
  return walk(PUBLIC, (p) => p.endsWith('.html'))
    .filter((p) => includeAdmin || !rel(p).startsWith('admin/'))
    .sort();
}

export const jsFiles = () => walk(path.join(PUBLIC, 'assets'), (p) => p.endsWith('.js'));

/** HTML 문자열에서 인라인 <script> 본문(JSON-LD 제외) 목록 */
export function inlineScripts(html) {
  const out = [];
  const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (/type=["']application\/ld\+json["']/i.test(m[1])) continue;
    out.push({ code: m[2], line: html.slice(0, m.index).split('\n').length });
  }
  return out;
}

export class Reporter {
  constructor(title) { this.title = title; this.errors = []; this.warnings = []; }
  error(msg) { this.errors.push(msg); }
  warn(msg) { this.warnings.push(msg); }
  finish() {
    for (const w of this.warnings.slice(0, 40)) console.log(`  ⚠️  ${w}`);
    if (this.warnings.length > 40) console.log(`  … 경고 ${this.warnings.length - 40}건 더`);
    for (const e of this.errors.slice(0, 60)) console.log(`  ❌ ${e}`);
    if (this.errors.length > 60) console.log(`  … 오류 ${this.errors.length - 60}건 더`);
    const ok = this.errors.length === 0;
    console.log(`${ok ? '✅' : '❌'} ${this.title}: 오류 ${this.errors.length}건, 경고 ${this.warnings.length}건`);
    return ok;
  }
}
