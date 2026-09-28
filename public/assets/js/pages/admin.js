/**
 * 페이지 스크립트 — admin/index.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
// ══════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════
const CFG = (typeof CONFIG !== 'undefined') ? CONFIG : {};
const ADMIN_PW = CFG.ADMIN_PASSWORD || 'babytools2024!';
let TRACKER  = CFG.TRACKER_URL || sessionStorage.getItem('tracker_url') || '';

// ── 로그인 ────────────────────────────────────────────
function tryLogin() {
  if (document.getElementById('pwInput').value === ADMIN_PW) {
    document.getElementById('loginWrap').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    sessionStorage.setItem('admin_ok','1');
    renderConfigStatus();
    loadData();
  } else {
    document.getElementById('errMsg').style.display = 'block';
    document.getElementById('pwInput').value = '';
  }
}
if (sessionStorage.getItem('admin_ok')==='1') {
  document.getElementById('loginWrap').style.display='none';
  document.getElementById('app').style.display='block';
  renderConfigStatus();
  loadData();
}
function logout(){ sessionStorage.clear(); location.reload(); }

// ── 패널 전환 ─────────────────────────────────────────
function showPanel(id, btn) {
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('on'));
  document.getElementById('panel-'+id).classList.add('on');
  btn.classList.add('on');
  if (id==='raw') loadRaw();
}

// ── 날짜 범위 ─────────────────────────────────────────
let days = 7;
function setDays(d, btn) {
  days = d;
  document.querySelectorAll('.dbar-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  loadData();
}

// ── API 호출 ──────────────────────────────────────────
async function callTracker(action, extraParams={}) {
  if (!TRACKER) throw new Error('TRACKER_URL이 설정되지 않았어요.');

  const url = `${TRACKER}?action=${action}&days=${days}&${new URLSearchParams(extraParams)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const text = await res.text();
    try { return JSON.parse(text); }
    catch (_) { throw new Error(`JSON 파싱 실패 — 응답: ${text.slice(0, 100)}`); }
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('요청 시간 초과 (15초). 네트워크 또는 Apps Script URL을 확인하세요.');
    throw err;
  }
}

// ── 전체 데이터 로드 ──────────────────────────────────
let cached = null;
let chartInst = {};

async function loadData() {
  const btn = document.getElementById('reloadBtn');
  btn.disabled = true; btn.textContent = '⏳ 로드 중...';
  document.querySelectorAll('.notice,.errbox').forEach(el => el.remove());

  if (!TRACKER) {
    showNotice('📊 TRACKER_URL 미연결 — 설정 탭에서 Apps Script 웹앱 URL을 연결해주세요.');
    renderAll(emptyStats());
    btn.disabled = false; btn.textContent = '🔄 새로고침';
    return;
  }

  try {
    const data = await callTracker('stats');
    if (data.error) throw new Error(data.error);
    cached = data;
    renderAll(data);
    document.getElementById('aiBtn').disabled = false;
  } catch(err) {
    const msg = err.message || String(err);
    showErr(`시트 연결 실패: ${msg}`);
    showDebugInfo(msg);
    renderAll(emptyStats());
  } finally {
    btn.disabled = false; btn.textContent = '🔄 새로고침';
  }
}

function emptyStats() {
  return {
    totals: {}, daily: [], devices: [], os: [], browsers: [], countries: [],
    referrers: [], ref_sources: [], entry_pages: [], exit_pages: [],
    content: [], tools: [], ads: { by_slot: [] }, affiliates: [], searches: [], errors: { recent: [] },
  };
}

function showDebugInfo(errMsg) {
  const wrap = document.querySelector('.wrap');
  const el = document.createElement('div');
  el.style.cssText = 'background:#f5f0ff;border:1px solid #d5c6f5;border-radius:8px;padding:12px 16px;margin-bottom:1rem;font-size:12px;color:#3c1a8a;line-height:1.9;';

  let hint = '';
  if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError') || errMsg.includes('CORS')) {
    hint = `<strong>🔍 CORS 에러 가능성</strong><br>
Apps Script 배포 설정을 확인하세요:<br>
· 액세스 권한: <strong>모든 사용자</strong> (익명 포함)<br>
· 실행 계정: <strong>나 (본인 계정)</strong><br>
· 코드 수정 후엔 반드시 <strong>새 배포</strong>를 만들어야 해요 (기존 배포 수정 X)`;
  } else if (errMsg.includes('404') || errMsg.includes('not found')) {
    hint = `<strong>🔍 URL 오류</strong><br>TRACKER_URL이 올바른지 확인하세요.<br>config.js의 TRACKER_URL 값: <code>${TRACKER}</code>`;
  } else if (errMsg.includes('시트') || errMsg.includes('sheet')) {
    hint = `<strong>🔍 시트 없음</strong><br>tracker.gs의 insertSampleData()를 먼저 실행해서 시트를 생성해주세요.`;
  } else {
    hint = `<strong>🔍 현재 TRACKER_URL</strong><br><code style="word-break:break-all">${TRACKER}</code><br><br>
브라우저 콘솔(F12 → Console)에서 상세 에러를 확인해보세요.`;
  }
  el.innerHTML = hint;
  wrap.prepend(el);
}

// ── 렌더링 ──────────────────────────────────────────
function fmtN(n){ return Math.round(n||0).toLocaleString('ko-KR'); }
function fmtW(n){ return fmtN(n)+'원'; }
function fmtDate(s){ return (s||'').slice(5); }
function fmtSec(s){
  s = Math.round(s||0);
  if (s < 60) return s+'초';
  return Math.floor(s/60)+'분 '+(s%60)+'초';
}

function renderAll(data) {
  renderKPI(data);
  renderDailyChart(data.daily||[]);
  renderEntryExit(data.entry_pages||[], data.exit_pages||[]);
  renderTrafficCharts(data);
  renderContentTable(data.content||[]);
  renderSearchTable(data.searches||[]);
  renderToolCharts(data.tools||[]);
  renderToolTable(data.tools||[]);
  renderRevenue(data);
}

function renderKPI(data) {
  const t = data.totals||{};
  setText('kv-ss',  fmtN(t.sessions));   setText('ks-ss', `최근 ${days}일`);
  setText('kv-pv',  fmtN(t.pageviews));  setText('ks-pv', `최근 ${days}일`);
  setText('kv-dur', fmtSec(t.avg_session_duration));
  setText('kv-bounce', (t.bounce_rate||0)+'%');
  setText('kv-pps', t.avg_pages_per_session||0);
  setText('kv-tc',  fmtN(t.tool_calculates));
  setText('kv-ad',  `${fmtN(t.ad_impressions)} / ${fmtN(t.ad_clicks)}`);
  setText('ks-ad',  `CTR ${t.ad_ctr||0}%`);
  setText('kv-af',  fmtN(t.affiliate_clicks));
}

function renderDailyChart(daily) {
  const labels = daily.map(r=>fmtDate(r.date));
  const pvs    = daily.map(r=>r.pageviews||0);
  const sess   = daily.map(r=>r.sessions||0);
  const ctx    = document.getElementById('cDaily').getContext('2d');
  if (chartInst.daily) chartInst.daily.destroy();
  chartInst.daily = new Chart(ctx,{
    type:'line',
    data:{labels,datasets:[
      {label:'페이지뷰',data:pvs,borderColor:'#4A7C59',backgroundColor:'rgba(61,122,94,.08)',tension:.35,fill:true,pointRadius:3},
      {label:'세션',    data:sess,borderColor:'#E9A825',backgroundColor:'rgba(200,127,26,.04)',tension:.35,fill:false,pointRadius:3},
    ]},
    options:{responsive:true,plugins:{legend:{position:'top'}},scales:{y:{beginAtZero:true}}},
  });
}

function renderEntryExit(entry, exit) {
  const rowsHtml = (arr) => arr.length
    ? arr.slice(0,8).map(r=>`<tr><td>${r.label||'—'}</td><td style="text-align:right;font-weight:700;">${fmtN(r.count)}</td></tr>`).join('')
    : `<tr><td class="empty-row">데이터 없음</td></tr>`;
  document.getElementById('entryBody').innerHTML = rowsHtml(entry);
  document.getElementById('exitBody').innerHTML  = rowsHtml(exit);
}

// ── 트래픽 탭 ──────────────────────────────────────────
const PALETTE = ['#4A7C59','#5a9e7e','#E9A825','#1a5fc8','#6b3dbe','#c53030','#0aa','#e07a5f','#81b29a','#f2cc8f'];

function doughnut(canvasId, key, rows, labelKey='label', valueKey='count') {
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (chartInst[key]) chartInst[key].destroy();
  const top = rows.slice(0,7);
  chartInst[key] = new Chart(ctx,{
    type:'doughnut',
    data:{
      labels: top.length ? top.map(r=>r[labelKey]||'미상') : ['데이터 없음'],
      datasets:[{
        data: top.length ? top.map(r=>r[valueKey]||0) : [1],
        backgroundColor: top.length ? PALETTE : ['#e5e5e0'],
        borderWidth:2, borderColor:'#fff',
      }],
    },
    options:{responsive:true,plugins:{legend:{position:'right',labels:{boxWidth:10,font:{size:10}}}}},
  });
}

function renderTrafficCharts(data) {
  doughnut('cDevice',   'device',  data.devices||[]);
  doughnut('cOS',       'os',      data.os||[]);
  doughnut('cBrowser',  'browser', data.browsers||[]);

  const refLabelMap = { direct:'직접 방문', search:'검색엔진', social:'소셜/커뮤니티', ad:'광고', internal:'내부 이동', external:'기타 외부' };
  const refs = (data.referrers||[]).map(r=>({label: refLabelMap[r.label]||r.label, count:r.count}));
  doughnut('cRefType', 'refType', refs);

  const countries = data.countries||[];
  const totalC = countries.reduce((s,r)=>s+(r.count||0),0);
  document.getElementById('countryBody').innerHTML = countries.length
    ? countries.map((r,i)=>`<tr><td class="rn">${i+1}</td><td>${countryFlag(r.label)} ${r.label||'미상'}</td><td>${fmtN(r.count)}</td><td>${totalC?Math.round(r.count/totalC*100):0}%</td></tr>`).join('')
    : `<tr><td colspan="4" class="empty-row">데이터 없음</td></tr>`;

  const sources = data.ref_sources||[];
  document.getElementById('refSourceBody').innerHTML = sources.length
    ? sources.map((r,i)=>`<tr><td class="rn">${i+1}</td><td>${r.label}</td><td>${fmtN(r.count)}</td></tr>`).join('')
    : `<tr><td colspan="3" class="empty-row">데이터 없음</td></tr>`;
}

function countryFlag(code) {
  if (!code || code.length !== 2) return '🌐';
  const cc = code.toUpperCase();
  try { return String.fromCodePoint(...[...cc].map(c=>127397+c.charCodeAt())); } catch(_) { return '🌐'; }
}

// ── 콘텐츠 탭 ──────────────────────────────────────────
function renderContentTable(content) {
  document.getElementById('contentBody').innerHTML = content.length
    ? content.map((r,i)=>`<tr>
        <td class="rn">${i+1}</td>
        <td><strong>${r.name||r.path}</strong><div style="font-size:10px;color:var(--g400)">${r.path||''}</div></td>
        <td>${fmtN(r.pageviews)}</td>
        <td>${fmtN(r.unique_sessions)}</td>
        <td>${fmtSec(r.avg_time_on_page)}</td>
        <td>${r.avg_scroll||0}%</td>
        <td>${r.exit_rate||0}%</td>
      </tr>`).join('')
    : `<tr><td colspan="7" class="empty-row">데이터 없음 — 트래픽이 쌓이면 표시됩니다</td></tr>`;
}

function renderSearchTable(searches) {
  document.getElementById('searchBody').innerHTML = searches.length
    ? searches.map((r,i)=>`<tr><td class="rn">${i+1}</td><td>${r.label||'—'}</td><td>${fmtN(r.count)}</td></tr>`).join('')
    : `<tr><td colspan="3" class="empty-row">데이터 없음</td></tr>`;
}

// ── 툴 탭 ──────────────────────────────────────────────
function renderToolCharts(tools) {
  const ctx = document.getElementById('cToolBar').getContext('2d');
  if (chartInst.toolBar) chartInst.toolBar.destroy();
  chartInst.toolBar = new Chart(ctx,{
    type:'bar',
    data:{
      labels: tools.length ? tools.slice(0,7).map(t=>t.tool) : ['데이터 없음'],
      datasets:[{label:'누적 사용',data: tools.length ? tools.slice(0,7).map(t=>t.total||0) : [0],backgroundColor:'#4A7C59',borderRadius:4}],
    },
    options:{responsive:true,indexAxis:'y',plugins:{legend:{display:false}}},
  });
  const ctx2 = document.getElementById('cTools').getContext('2d');
  if (chartInst.tools) chartInst.tools.destroy();
  chartInst.tools = new Chart(ctx2,{
    type:'doughnut',
    data:{
      labels: tools.length ? tools.slice(0,5).map(t=>t.tool) : ['데이터 없음'],
      datasets:[{data: tools.length ? tools.slice(0,5).map(t=>t.total||0) : [1],backgroundColor: tools.length ? PALETTE : ['#e5e5e0'],borderWidth:2,borderColor:'#fff'}],
    },
    options:{responsive:true,plugins:{legend:{position:'right'}}},
  });
}

function renderToolTable(tools) {
  document.getElementById('toolBody').innerHTML = tools.length ? tools.map((t,i)=>`<tr>
    <td class="rn">${i+1}</td>
    <td><strong>${t.tool}</strong></td>
    <td>${fmtN(t.total)}</td>
    <td>${fmtN(t.today)}</td>
    <td style="color:var(--muted)">${(t.last_used||'').slice(0,10)}</td>
  </tr>`).join('') : `<tr><td colspan="5" class="empty-row">데이터 없음</td></tr>`;
}

// ── 수익 탭 ──────────────────────────────────────────
function renderRevenue(data) {
  const t   = data.totals||{};
  const d   = data.daily||[];
  const ads = data.ads||{by_slot:[]};
  const affiliates = data.affiliates||[];

  setText('rv-ad',      fmtN(t.ad_impressions));
  setText('rv-adclick', fmtN(t.ad_clicks));
  setText('rv-ctr',     (t.ad_ctr||0)+'%');
  setText('rv-af',      fmtN(t.affiliate_clicks));

  const ctx = document.getElementById('cRevenue').getContext('2d');
  if (chartInst.rev) chartInst.rev.destroy();
  chartInst.rev = new Chart(ctx,{
    type:'bar',
    data:{
      labels:d.map(r=>fmtDate(r.date)),
      datasets:[{
        label:'AdSense 노출 추정(원)',
        data:d.map(r=>Math.round((r.pageviews||0)/1000*3500)),
        backgroundColor:'#4A7C59',borderRadius:3,
      }],
    },
    options:{responsive:true,plugins:{legend:{position:'top'}},scales:{y:{beginAtZero:true}}},
  });

  document.getElementById('adSlotBody').innerHTML = ads.by_slot.length
    ? ads.by_slot.map(r=>`<tr><td>${r.slot}</td><td>${fmtN(r.impressions)}</td><td>${fmtN(r.clicks)}</td><td>${r.impressions?Math.round(r.clicks/r.impressions*1000)/10:0}%</td></tr>`).join('')
    : `<tr><td colspan="4" class="empty-row">데이터 없음</td></tr>`;

  document.getElementById('affBody').innerHTML = affiliates.length
    ? affiliates.map((r,i)=>`<tr><td class="rn">${i+1}</td><td>${r.domain}</td><td>${fmtN(r.clicks)}</td><td>${fmtW(Math.round((r.clicks||0)*0.02*3000))}</td></tr>`).join('')
    : `<tr><td colspan="4" class="empty-row">데이터 없음</td></tr>`;
}

// ── 원본 데이터 탭 ────────────────────────────────────
async function loadRaw() {
  const sheet = document.getElementById('rawSheetSel').value;
  const wrap  = document.getElementById('rawTable');
  wrap.innerHTML = '<div class="loading"><span class="spin">⏳</span> 로드 중...</div>';
  if (!TRACKER) { wrap.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--muted);">TRACKER_URL을 먼저 설정 탭에서 연결하세요.</p>'; return; }
  try {
    const data = await callTracker('raw', { sheet, limit: 30 });
    if (!data.headers || !data.rows) throw new Error(data.error || '데이터 없음');
    if (!data.rows.length) { wrap.innerHTML = `<p style="text-align:center;padding:2rem;color:var(--muted);">'${sheet}' 시트에 아직 데이터가 없어요.</p>`; return; }
    wrap.innerHTML = `<div style="overflow-x:auto"><table>
      <thead><tr>${data.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${data.rows.slice(0,30).map(r=>`<tr>${r.map(c=>`<td>${c===''||c===null||c===undefined?'':c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
  } catch(err) {
    wrap.innerHTML = `<p style="text-align:center;padding:2rem;color:var(--muted);">데이터를 불러올 수 없어요: ${err.message}</p>`;
  }
}

// ── AI 분석 ──────────────────────────────────────────
async function runAI() {
  const btn = document.getElementById('aiBtn');
  btn.disabled=true; btn.textContent='분석 중...';
  document.getElementById('aiText').innerHTML='<em style="color:var(--muted)">🤖 분석 중이에요...</em>';

  const t = (cached&&cached.totals)||{};
  const tools = ((cached&&cached.tools)||[]).slice(0,3).map(t=>t.tool).join(', ');
  const devices = ((cached&&cached.devices)||[]).slice(0,3).map(d=>`${d.label}(${d.count})`).join(', ');
  const countries = ((cached&&cached.countries)||[]).slice(0,3).map(c=>`${c.label}(${c.count})`).join(', ');
  const refs = ((cached&&cached.referrers)||[]).slice(0,3).map(r=>`${r.label}(${r.count})`).join(', ');
  const topContent = ((cached&&cached.content)||[]).slice(0,3).map(c=>c.name).join(', ');

  const prompt = `육아 웹서비스 '아이로그' 데이터 분석가로서 아래 데이터를 보고 한국어로 답해주세요.

[기간] 최근 ${days}일
[세션] ${fmtN(t.sessions)} / [페이지뷰] ${fmtN(t.pageviews)}
[평균 체류] ${fmtSec(t.avg_session_duration)} / [이탈률] ${t.bounce_rate||0}%
[디바이스 TOP3] ${devices}
[국가 TOP3] ${countries}
[유입경로 TOP3] ${refs}
[인기 콘텐츠 TOP3] ${topContent}
[인기 툴 TOP3] ${tools}
[광고] 노출 ${fmtN(t.ad_impressions)} / 클릭 ${fmtN(t.ad_clicks)} / CTR ${t.ad_ctr||0}%
[어필리에이트 클릭] ${fmtN(t.affiliate_clicks)}

다음을 간결하게 작성해주세요:
1. 📊 핵심 인사이트 3가지 (각 1~2줄)
2. ⚡ 즉시 실행 가능한 액션 2가지
3. 💰 수익(광고·어필리에이트) 개선 포인트 1가지`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:600,messages:[{role:'user',content:prompt}]}),
    });
    const json = await res.json();
    const text = json.content?.[0]?.text||'분석 결과 없음';
    document.getElementById('aiText').innerHTML = text.replace(/\n/g,'<br>');
  } catch(err) {
    document.getElementById('aiText').textContent = '오류: '+err.message;
  }
  btn.disabled=false; btn.textContent='✨ 분석 요청';
}

// ── 설정 ─────────────────────────────────────────────
async function saveTrackerUrl() {
  const url = document.getElementById('trackerUrlInput').value.trim();
  if (!url) { alert('URL을 입력해주세요.'); return; }

  TRACKER = url;
  sessionStorage.setItem('tracker_url', url);
  renderConfigStatus();

  const testBtn = document.querySelector('[onclick="saveTrackerUrl()"]');
  if (testBtn) { testBtn.disabled = true; testBtn.textContent = '연결 테스트 중...'; }

  try {
    const res = await fetch(`${url}?action=ping`, { redirect: 'follow' });
    const text = await res.text();
    const json = JSON.parse(text);
    if (json.status === 'ok') {
      alert('✅ 연결 성공!\n\n' + json.message + '\n\n개요 탭에서 데이터를 확인하세요.');
      loadData();
    } else {
      alert('⚠️ 응답은 왔지만 예상과 다른 형태예요:\n' + text.slice(0, 200));
    }
  } catch (err) {
    alert('❌ 연결 실패: ' + err.message + '\n\nApps Script 배포 설정(액세스: 모든 사용자)을 확인해주세요.');
  } finally {
    if (testBtn) { testBtn.disabled = false; testBtn.textContent = '저장 & 연결 테스트'; }
  }
}

function renderConfigStatus() {
  const el = document.getElementById('cfgStatus');
  if (!el) return;
  const items = [
    {label:'TRACKER_URL (시트 수집)',   ok:!!TRACKER},
    {label:'GA_ID (Google Analytics)', ok:!!(CFG.GA_ID)},
    {label:'AdSense Client ID',         ok:!!(CFG.ADSENSE_CLIENT&&CFG.ADSENSE_CLIENT!=='ca-pub-XXXXXXXXXXXXXXXXX')},
    {label:'관리자 비밀번호 변경 여부',  ok:ADMIN_PW!=='babytools2024!'},
  ];
  el.innerHTML = items.map(i=>`<span class="badge ${i.ok?'bg':'br'}">${i.ok?'✅':'❌'}</span>${i.label}<br>`).join('');
  if (document.getElementById('trackerUrlInput'))
    document.getElementById('trackerUrlInput').value = TRACKER||'';
}

// ── 유틸 ─────────────────────────────────────────────
function setText(id,v){ const el=document.getElementById(id); if(el) el.textContent=v; }
function showErr(msg){
  const el=document.createElement('div');el.className='errbox';el.textContent='⚠️ '+msg;
  document.querySelector('.wrap').prepend(el);setTimeout(()=>el.remove(),5000);
}
function showNotice(msg){
  const el=document.createElement('div');el.className='notice';el.textContent=msg;
  document.querySelector('.wrap').prepend(el);
}
