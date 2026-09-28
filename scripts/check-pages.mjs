#!/usr/bin/env node
// 페이지 규약 점검 — 새 페이지가 지켜야 할 "약속"을 자동으로 확인합니다.
//   · <title>/description/canonical/og:url, <html lang="ko">, body[data-root-prefix]
//   · i18n 스크립트의 data-ns 와 locales 파일 존재, 공통 스크립트 로드 순서
//   · sitemap.xml 등재 여부
import fs from 'node:fs';
import path from 'node:path';
import { PUBLIC, LOCALES_DIR, SITE_ORIGIN, htmlPages, read, rel, Reporter } from './lib/paths.mjs';

const r = new Reporter('페이지 규약 점검');
const sitemap = read(path.join(PUBLIC, 'sitemap.xml'));
const langs = fs.readdirSync(LOCALES_DIR);

// 공통 스크립트 로드 순서 (앞 → 뒤)
const ORDER = [
  'assets/i18n/i18n.js', 'assets/js/config.js', 'assets/js/core/analytics.js',
  'assets/js/data/tool-catalog.js', 'assets/js/components/partials.js', 'assets/js/components/nav.js',
  'assets/js/data/baby-data.js', 'assets/js/features/baby.js',
];

for (const f of htmlPages()) {
  const p = rel(f);
  const html = read(f);
  const isTool = p.startsWith('tools/');
  const name = path.basename(p, '.html');
  const at = (msg) => r.error(`${p}: ${msg}`);

  if (!/<html lang="ko"/.test(html)) at('<html lang="ko"> 필요 (실제 언어는 i18n.js 가 교체)');
  if (!/<title[^>]*>[^<]+<\/title>/.test(html)) at('<title> 없음');
  if (!/<meta name="description" content="[^"]+"/.test(html)) at('meta description 없음');
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  if (!canonical) at('canonical 없음');
  else if (canonical !== `${SITE_ORIGIN}/${p}` && !(p === 'index.html' && canonical === `${SITE_ORIGIN}/`)) at(`canonical 불일치: ${canonical}`);
  const ogUrl = (html.match(/<meta property="og:url" content="([^"]+)"/) || [])[1];
  if (canonical && ogUrl && ogUrl !== canonical) at(`og:url(${ogUrl}) ≠ canonical`);
  const prefix = (html.match(/<body[^>]*data-root-prefix="([^"]*)"/) || [])[1];
  if (prefix === undefined) at('<body data-root-prefix="…"> 필요');
  else if (prefix !== (isTool ? '../' : '')) at(`data-root-prefix 가 "${prefix}" (기대: "${isTool ? '../' : ''}")`);
  if (!/id="siteHeader"/.test(html)) at('<div id="siteHeader"> 자리표시자 없음');
  if (!/id="siteFooter"/.test(html)) at('<div id="siteFooter"> 자리표시자 없음');

  // i18n 네임스페이스
  const ns = (html.match(/<script src="[^"]*assets\/i18n\/i18n\.js" data-ns="([^"]*)"/) || [])[1];
  if (!ns) at('i18n 스크립트(data-ns) 없음');
  else {
    if (ns !== name) at(`data-ns("${ns}") 는 파일명("${name}")과 같아야 합니다`);
    for (const l of langs) if (!fs.existsSync(path.join(LOCALES_DIR, l, `${ns}.js`))) at(`locales/${l}/${ns}.js 없음`);
  }

  // 스크립트 순서
  const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1].replace(/^(\.\.\/)?/, ''));
  let last = -1;
  for (const s of srcs) {
    const i = ORDER.indexOf(s);
    if (i === -1) continue;
    if (i < last) { at(`스크립트 순서 오류: ${s} 는 ${ORDER[last]} 보다 앞에 와야 합니다`); break; }
    last = i;
  }
  for (const must of ['assets/i18n/i18n.js', 'assets/js/config.js', 'assets/js/components/partials.js', 'assets/js/components/nav.js', 'assets/js/features/baby.js', 'assets/js/data/tool-catalog.js', 'assets/js/data/baby-data.js'])
    if (!srcs.includes(must)) at(`공통 스크립트 누락: ${must}`);
  if (!/href="(\.\.\/)?assets\/css\/style\.css"/.test(html)) at('assets/css/style.css 누락');

  // sitemap
  const url = p === 'index.html' ? [`${SITE_ORIGIN}/`, `${SITE_ORIGIN}/index.html`] : [`${SITE_ORIGIN}/${p}`];
  if (!url.some((u) => sitemap.includes(`<loc>${u}</loc>`))) at('sitemap.xml 에 등재되지 않음');
}
console.log(`점검한 페이지 ${htmlPages().length}개`);
process.exit(r.finish() ? 0 : 1);
