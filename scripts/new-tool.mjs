#!/usr/bin/env node
// 새 도구 페이지 스캐폴딩:
//   npm run new:tool -- <slug> --title "도구 이름" --category sleep [--desc "한 줄 설명"] [--emoji 🧷] [--badge new]
// 만들어 주는 것: HTML · CSS · JS · 다국어(ko/en/ja) 파일 · sitemap.xml 항목 · 도구 카탈로그 항목 · common 문구
// 카테고리: sleep(수면수유) weaning(이유식영양) growth(성장발달) health(건강응급) pregnancy(임신행정)  또는 카탈로그의 id 그대로
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, PUBLIC, LOCALES_DIR, read } from './lib/paths.mjs';

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const slug = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const title = flag('title'), desc = flag('desc'), catArg = flag('category'), emoji = flag('emoji') || '🧩', badge = flag('badge');
const ALIAS = { sleep: '수면수유', weaning: '이유식영양', growth: '성장발달', health: '건강응급', pregnancy: '임신행정' };
const die = (m) => { console.error(`\n❌ ${m}\n`); process.exit(1); };

if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) die('slug 는 영문 소문자·숫자·하이픈만 가능합니다. 예) npm run new:tool -- twin-growth --title "쌍둥이 성장 비교" --category growth');
if (!title) die('--title "도구 이름(한국어)" 이 필요합니다.');

const P = {
  html: path.join(PUBLIC, 'tools', `${slug}.html`),
  css: path.join(PUBLIC, 'assets/css/pages/tools', `${slug}.css`),
  js: path.join(PUBLIC, 'assets/js/pages/tools', `${slug}.js`),
  catalog: path.join(PUBLIC, 'assets/js/data/tool-catalog.js'),
  sitemap: path.join(PUBLIC, 'sitemap.xml'),
};
if (fs.existsSync(P.html)) die(`이미 존재합니다: public/tools/${slug}.html`);

// ── 카탈로그/카테고리 읽기 ─────────────────────────────
const sb = { window: {}, I18N: { t: (k) => k } };
vm.runInNewContext(read(P.catalog), sb);
const cats = sb.window.NORIYA_DATA.toolCategories;
const koCommon = {};
vm.runInNewContext(read(path.join(LOCALES_DIR, 'ko', 'common.js')), { I18N: { add: (_l, _n, d) => Object.assign(koCommon, d) } });
const catId = ALIAS[catArg] || catArg;
const cat = cats.find((c) => c.id === catId);
if (!cat) die(`--category 가 필요합니다. 선택지:\n${cats.map((c) => `   ${Object.entries(ALIAS).find(([, v]) => v === c.id)?.[0] || ''}\t${c.id}\t(${koCommon[c.title] || c.title})`).join('\n')}`);
const catName = koCommon[cat.title];

// ── 문구 ───────────────────────────────────────────────
const descKo = desc || `${title} — 아이로그에서 무료로 계산해 보세요.`;
const metaTitle = `${title} | 아이로그`;
const nameKey = `tool_${slug.replace(/-/g, '_')}`;
const T = (ko) => ({ ko, en: `TODO: ${ko}`, ja: `TODO: ${ko}` });      // 번역 전에는 check:i18n 이 실패하도록 TODO 표시
const nsText = {
  meta_title: T(metaTitle), meta_description: T(descKo), intro: T(descKo),
  input_label: T('값 입력'), input_placeholder: T('0'), calc_button: T('계산하기'),
  result_title: T('결과'), result_text: T('입력값 {value} → 결과 {result}'),
  enter_value: T('값을 올바르게 입력해 주세요.'),
  disclaimer: T('이 도구는 일반적인 참고 정보이며 의학적 조언을 대체하지 않습니다.'),
};
const commonText = {
  [`${nameKey}_name`]: T(title), [`${nameKey}_desc`]: T(descKo.length > 40 ? title : descKo), [`${nameKey}_keywords`]: T(`${title} ${slug.replace(/-/g, ' ')}`),
};

// ── 템플릿 → 파일 ──────────────────────────────────────
const TPL = path.join(ROOT, 'templates', 'tool');
const fill = (s) => s
  .replaceAll('__SLUG__', slug).replaceAll('__TITLE__', title).replaceAll('__META_TITLE__', metaTitle)
  .replaceAll('__DESC__', descKo).replaceAll('__INTRO__', descKo).replaceAll('__CAT_ID__', cat.id)
  .replaceAll('__CAT_NAME__', catName).replaceAll('__CAT_KEY__', cat.title).replaceAll('__NAME_KEY__', `${nameKey}_name`)
  .replaceAll('__INPUT_LABEL__', nsText.input_label.ko).replaceAll('__CALC_BUTTON__', nsText.calc_button.ko)
  .replaceAll('__RESULT_TITLE__', nsText.result_title.ko).replaceAll('__DISCLAIMER__', nsText.disclaimer.ko);
const write = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
write(P.html, fill(read(path.join(TPL, 'tool.html'))));
write(P.css, fill(read(path.join(TPL, 'tool.css'))));
write(P.js, fill(read(path.join(TPL, 'tool.js'))));

// ── locales ────────────────────────────────────────────
const q = (s) => JSON.stringify(s);
for (const lang of ['ko', 'en', 'ja']) {
  const lines = Object.entries(nsText).map(([k, v]) => `  ${q(`${slug}.${k}`)}: ${q(v[lang])}`);
  write(path.join(LOCALES_DIR, lang, `${slug}.js`), `/* ${lang} — ${slug} */\nI18N.add(${q(lang)}, ${q(slug)}, {\n${lines.join(',\n')}\n});\n`);
  const cp = path.join(LOCALES_DIR, lang, 'common.js');
  let c = read(cp);
  const add = Object.entries(commonText).map(([k, v]) => `  ${q(`common.${k}`)}: ${q(v[lang])}`).join(',\n');
  c = c.replace(/\n\}\);\s*$/, `,\n${add}\n});\n`);
  fs.writeFileSync(cp, c);
}

// ── 카탈로그 항목 삽입 ─────────────────────────────────
let catalog = read(P.catalog);
const at = catalog.indexOf(`id: '${cat.id}'`);
const toolsAt = catalog.indexOf('tools: [', at);
let depth = 0, end = -1;
for (let i = toolsAt + 'tools: '.length; i < catalog.length; i++) {
  if (catalog[i] === '[') depth++;
  else if (catalog[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
}
const lastBrace = catalog.lastIndexOf('}', end);
const entry = `{ href: 'tools/${slug}.html', emoji: '${emoji}', name: I18N.t('common.${nameKey}_name'), desc: I18N.t('common.${nameKey}_desc'), ` +
  `${badge ? `badge: '${badge}', ` : ''}kwKo: '${title} ${slug.replace(/-/g, ' ')}', keywords: I18N.t('common.${nameKey}_keywords') }`;
catalog = catalog.slice(0, lastBrace + 1) + `,\n        ${entry}` + catalog.slice(lastBrace + 1);
fs.writeFileSync(P.catalog, catalog);

// ── sitemap ────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
let sm = read(P.sitemap);
sm = sm.replace('</urlset>', `  <url>\n    <loc>https://noriya.kr/tools/${slug}.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`);
fs.writeFileSync(P.sitemap, sm);

console.log(`
✅ 새 도구 "${title}" 를 만들었습니다.

  생성/수정된 파일
   + public/tools/${slug}.html
   + public/assets/css/pages/tools/${slug}.css
   + public/assets/js/pages/tools/${slug}.js
   + public/assets/i18n/locales/{ko,en,ja}/${slug}.js
   ~ public/assets/i18n/locales/{ko,en,ja}/common.js   (도구 이름·설명·검색어 키 3개 추가)
   ~ public/assets/js/data/tool-catalog.js             (${catName} 카테고리에 항목 추가 → 메뉴/홈/검색에 자동 노출)
   ~ public/sitemap.xml

  다음 할 일
   1) ${slug}.js 의 calculate() 와 HTML 입력 카드를 실제 도구에 맞게 작성
   2) en/ja 번역의 "TODO: " 를 실제 번역으로 교체  (npm run check:i18n 이 남은 항목을 알려줍니다)
   3) 홈/메뉴의 "도구 N개" 문구가 있다면 갱신 (locales/*/common.js, index.js 에서 숫자 검색)
   4) npm run check && npm run dev 로 확인
`);
