#!/usr/bin/env node
// 내부 링크 점검 — HTML 의 href/src, CSS 의 url() 이 실제 파일을 가리키는지, sitemap 의 URL 이 실존하는지
import fs from 'node:fs';
import path from 'node:path';
import { PUBLIC, SITE_ORIGIN, htmlPages, walk, read, rel, Reporter } from './lib/paths.mjs';

const r = new Reporter('내부 링크 점검');
const skip = (u) => !u || /^(https?:|\/\/|mailto:|tel:|data:|javascript:|#)/i.test(u) || /[${}]/.test(u);

function resolveLocal(fromFile, url) {
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return null;
  const base = clean.startsWith('/') ? path.join(PUBLIC, clean) : path.resolve(path.dirname(fromFile), clean);
  return base;
}
function exists(p) {
  if (!p) return true;
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return fs.existsSync(path.join(p, 'index.html'));
  return fs.existsSync(p);
}

let checked = 0;
for (const f of htmlPages({ includeAdmin: true })) {
  const html = read(f).replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => m.match(/^<script[^>]*\bsrc=/i) ? m.replace(/>[\s\S]*$/, '></script>') : '');
  for (const m of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
    if (skip(m[1])) continue;
    checked++;
    if (!exists(resolveLocal(f, m[1]))) r.error(`${rel(f)} → ${m[1]} (파일 없음)`);
  }
}
for (const f of walk(path.join(PUBLIC, 'assets'), (p) => p.endsWith('.css'))) {
  for (const m of read(f).matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    if (skip(m[1])) continue;
    checked++;
    if (!exists(resolveLocal(f, m[1]))) r.error(`${rel(f)} → url(${m[1]}) (파일 없음)`);
  }
}
// sitemap.xml
const sm = read(path.join(PUBLIC, 'sitemap.xml'));
for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const u = m[1].trim();
  if (!u.startsWith(SITE_ORIGIN)) { r.warn(`sitemap: 다른 도메인 URL ${u}`); continue; }
  const p = u.slice(SITE_ORIGIN.length) || '/';
  checked++;
  if (!exists(path.join(PUBLIC, p.endsWith('/') ? p + 'index.html' : p))) r.error(`sitemap.xml → ${u} (파일 없음)`);
}
console.log(`확인한 링크 ${checked}개`);
process.exit(r.finish() ? 0 : 1);
