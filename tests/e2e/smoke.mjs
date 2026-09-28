#!/usr/bin/env node
// E2E 스모크 테스트 (Playwright) — npm run test:e2e   |   더 깊게: npm run test:e2e -- --deep
//  모든 페이지 × (ko/en/ja) 를 실제 브라우저로 열어 확인합니다.
//   1. JS 오류·누락된 번역 키·로컬 4xx 요청이 없는가
//   2. <html lang>, <title> 이 언어에 맞게 바뀌었는가
//   3. en/ja 화면에 한글이 남아 있지 않은가 (번역 누락 감지)
//   4. 국기 버튼으로 언어를 바꾸면 저장되고 다른 페이지에서도 유지되는가
//   --deep : 입력창을 채우고 모든 버튼을 눌러 본 뒤 3번을 다시 검사 (계산 결과 화면의 번역 누락 감지)
import { chromium } from 'playwright';
import { startServer } from '../../scripts/lib/server.mjs';
import { htmlPages, rel } from '../../scripts/lib/paths.mjs';

const DEEP = process.argv.includes('--deep');
const LANGS = ['ko', 'en', 'ja'];
const HANGUL_OK = ['처음학교로'];
// 외부 요청을 차단한 테스트 환경에서 당연히 발생하는 오류 (카카오맵 SDK 로드 실패 안내)
const EXPECTED_ERRORS = [/카카오|Kakao|カカオ/];                   // 공식 명칭이라 번역하지 않는 단어
const pages = htmlPages({ includeAdmin: false }).map(rel);

const server = await startServer({ port: 0, quiet: true });
const base = `http://localhost:${server.address().port}`;
const browser = await chromium.launch();

const birth = new Date(Date.now() - 200 * 864e5).toISOString().slice(0, 10);
const PROFILE = JSON.stringify({ name: 'Mina', birthdate: birth, gender: 'F' });

const FILL = () => {
  const vis = (e) => e.offsetParent !== null;
  document.querySelectorAll('input').forEach((i) => {
    if (!vis(i)) return;
    const fire = () => ['input', 'change'].forEach((t) => i.dispatchEvent(new Event(t, { bubbles: true })));
    if (i.type === 'number') { i.value = i.min ? Math.max(+i.min, 6) : /salary|wage|sal/i.test(i.id) ? 350 : 7; fire(); }
    else if (i.type === 'date') { i.value = '2026-05-01'; fire(); }
    else if (i.type === 'time') { i.value = '20:30'; fire(); }
  });
  document.querySelectorAll('select').forEach((s) => { if (vis(s) && s.options.length > 1) { s.selectedIndex = 1; s.dispatchEvent(new Event('change', { bubbles: true })); } });
};

const hangulLeaks = (page) => page.evaluate((ok) => {
  const out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const p = n.parentElement;
    if (!/[가-힣]/.test(n.textContent) || ['SCRIPT', 'STYLE'].includes(p.tagName) || p.closest('pre,.lang-name,textarea')) continue;
    if (ok.some((x) => n.textContent.includes(x))) continue;
    out.push(n.textContent.trim().slice(0, 60));
  }
  document.querySelectorAll('[placeholder],[title],[aria-label]').forEach((e) => {
    if (e.closest('.lang-switch')) return;
    for (const a of ['placeholder', 'title', 'aria-label']) { const v = e.getAttribute(a); if (v && /[가-힣]/.test(v)) out.push(`[${a}] ${v.slice(0, 50)}`); }
  });
  return out;
}, HANGUL_OK);

async function run(pagePath, lang) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push(`JS 오류: ${String(e).slice(0, 120)}`));
  page.on('console', (m) => {
    const t = m.text();
    if (/missing key/.test(t)) problems.push(`번역 키 누락: ${t.slice(0, 100)}`);
    else if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(t) && !EXPECTED_ERRORS.some((re) => re.test(t))) problems.push(`console.error: ${t.slice(0, 120)}`);
  });
  page.on('response', (r) => { if (r.url().startsWith(base) && r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url().replace(base, '')}`); });
  page.on('dialog', (d) => d.accept());
  await page.route('**/*', (r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));       // 외부 요청 차단(재현성)
  await page.addInitScript((p) => { try { if (!localStorage.getItem('babyProfile_v1')) localStorage.setItem('babyProfile_v1', p); } catch (e) {} }, PROFILE);
  await page.goto(`${base}/${pagePath}?lang=${lang}`);
  await page.waitForTimeout(700);

  const htmlLang = await page.evaluate(() => document.documentElement.lang);
  if (htmlLang !== lang) problems.push(`<html lang>="${htmlLang}" (기대 ${lang})`);
  if (!(await page.title()).trim()) problems.push('<title> 비어 있음');
  if (lang !== 'ko') for (const h of await hangulLeaks(page)) problems.push(`한글 잔존: ${h}`);

  if (DEEP) {
    await page.evaluate(FILL);
    const buttons = await page.$$('button:not(.lang-btn):not(.nav-toggle):not(.nav-search-btn), .calc-btn');
    for (const b of buttons.slice(0, 60)) {
      try { if (await b.isVisible()) { await b.click({ timeout: 800 }); await page.waitForTimeout(100); } } catch (e) {}
      try { await page.evaluate(FILL); } catch (e) {}
    }
    await page.waitForTimeout(400);
    if (lang !== 'ko') for (const h of await hangulLeaks(page)) if (!/^김/.test(h)) problems.push(`(deep) 한글 잔존: ${h}`);
  }
  await ctx.close();
  return [...new Set(problems)];
}

let failed = 0;
for (const p of pages) {
  const row = [];
  for (const l of LANGS) {
    const probs = await run(p, l);
    row.push(`${l}:${probs.length ? '❌' : '✓'}`);
    if (probs.length) { failed++; probs.slice(0, 4).forEach((x) => console.log(`   [${p} · ${l}] ${x}`)); }
  }
  console.log(`${p.padEnd(34)} ${row.join('  ')}`);
}

// 언어 전환 흐름
{
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.route('**/*', (r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  const check = async (label, cond) => { if (!cond) { failed++; console.log(`   ❌ 언어 전환: ${label}`); } else console.log(`   ✓ 언어 전환: ${label}`); };
  await page.goto(`${base}/index.html`); await page.waitForTimeout(500);
  await check('기본 언어는 한국어', (await page.evaluate('I18N.lang')) === 'ko');
  await page.click('.nav-lang .lang-btn[data-lang="ja"]'); await page.waitForLoadState(); await page.waitForTimeout(600);
  await check('일본 국기 클릭 → 일본어', (await page.evaluate('I18N.lang')) === 'ja');
  await page.goto(`${base}/tools/milk-calculator.html`); await page.waitForTimeout(500);
  await check('다른 페이지에서도 일본어 유지', (await page.evaluate('I18N.lang')) === 'ja');
  await page.click('.nav-lang .lang-btn[data-lang="en"]'); await page.waitForLoadState(); await page.waitForTimeout(600);
  await check('미국 국기 클릭 → 영어', (await page.evaluate('I18N.lang')) === 'en');
  await ctx.close();
}

await browser.close(); server.close();
console.log(failed ? `\n❌ 실패 ${failed}건` : '\n✅ E2E 스모크 테스트 통과');
process.exit(failed ? 1 : 0);
