/**
 * 페이지 스크립트 — index.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
// 상단 메뉴바 검색창(?q=)으로 들어온 경우 홈 검색창에 반영
(function applyQueryFromNav(){
  const params = new URLSearchParams(location.search);
  const q = params.get('q');
  if (q) {
    const input = document.getElementById('searchInput');
    if (input) {
      input.value = q;
      filterTools();
      setTimeout(() => document.getElementById('toolHub').scrollIntoView({behavior:'smooth', block:'start'}), 100);
    }
  }
})();

function filterTools(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  document.querySelectorAll('.cat-block').forEach(block => {
    let blockVisible = false;
    block.querySelectorAll('.tool-card').forEach(card => {
      const text = (card.dataset.name + card.querySelector('.tc-name').textContent + card.querySelector('.tc-desc').textContent).toLowerCase();
      const match = !q || text.includes(q);
      card.style.display = match ? '' : 'none';
      if(match) blockVisible = true;
    });
    block.style.display = (!q || blockVisible) ? '' : 'none';
  });
}

/* ── 꿀팁 섹션 ── */
// ▼ 구글 시트 JSON URL을 여기에 입력하세요
// 설정 방법: tips.html 파일 상단 주석 참고
const TIPS_JSON_URL = (typeof CONFIG !== 'undefined') ? CONFIG.SHEET_JSON_URL : '';

const CAT_COLORS = {
  '수면':   {bg:'#EFF7F1', color:'#33573F'},
  '이유식': {bg:'#FBF4E4', color:'#7A5710'},
  '건강':   {bg:'#fff1f1', color:'#7a1010'},
  '발달':   {bg:'#f0f4ff', color:'#0a2d7a'},
  '지원금': {bg:'#f5f0ff', color:'#3c1a8a'},
  '임신':   {bg:'#fef0f5', color:'#8a1a55'},
  '훈육':   {bg:'#EAFAF7', color:'#0F6B5C'},
  '애착관계': {bg:'#FFF1EC', color:'#8A3A1A'},
  '놀이':   {bg:'#FFF0E0', color:'#8A4A10'},
  '영양':   {bg:'#F3F9E8', color:'#4A6B1A'},
  '신생아': {bg:'#F0F4FF', color:'#1A3D8A'},
  '예방접종': {bg:'#FDF0EE', color:'#8A2A1A'},
  '위생':   {bg:'#E8F7FB', color:'#0A5C73'},
  '안전':   {bg:'#FFF4E0', color:'#8A5A10'},
  '구강관리': {bg:'#F0FBFF', color:'#0A4D7A'},
  '피부':   {bg:'#FFF1F5', color:'#8A1A4A'},
  '용품':   {bg:'#F5F5F0', color:'#5A5A4A'},
  '기타':   {bg:'#f8f8f6', color:'#3f3f3b'},
};
const CAT_EMOJI = {'수면':'🌙','이유식':'🥣','건강':'💊','발달':'📏','지원금':'💰','임신':'🤰','훈육':'🧭','애착관계':'🤗','놀이':'🧸','영양':'🍎','신생아':'👶','예방접종':'💉','위생':'🧼','안전':'🛡️','구강관리':'🦷','피부':'🧴','용품':'🛒','기타':'💡'};

let allTips = [];

async function loadTips() {
  const grid = document.getElementById('tipsGrid');

  if (!TIPS_JSON_URL) {
    // URL 미설정 → 샘플 데이터로 미리보기
    allTips = getSampleTips();
    renderTipTabs(allTips);
    renderTipCards(allTips.slice(0, 9));
    return;
  }

  try {
    const res = await fetch(TIPS_JSON_URL);
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    // 구글 Apps Script 응답: { tips: [...] } 또는 배열 직접
    allTips = I18N.localizeRecords(Array.isArray(data) ? data : (data.tips || []));
    if (!allTips.length) throw new Error('empty');
    renderTipTabs(allTips);
    renderTipCards(allTips.slice(0, 9));
  } catch(e) {
    grid.innerHTML = '';
    document.getElementById('tipsSetupGuide').classList.remove('hidden');
  }
}

function renderTipTabs(tips) {
  const cats = ['전체', ...new Set(tips.map(t => t.category || '기타'))];
  const tabsEl = document.getElementById('tipsTabs');
  tabsEl.innerHTML = cats.map((c,i) =>
    `<button class="tips-tab${i===0?' active':''}" data-cat="${c}" onclick="filterTips('${c}',this)">${CAT_EMOJI[c]||'📌'} ${I18N.d('cat',c)}</button>`
  ).join('');
}

function filterTips(cat, btn) {
  document.querySelectorAll('.tips-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = cat === '전체' ? allTips : allTips.filter(t => t.category === cat);
  renderTipCards(filtered.slice(0, 9));
}

function renderTipCards(tips) {
  const grid = document.getElementById('tipsGrid');
  if (!tips.length) { grid.innerHTML = `<div class="tips-loading">${I18N.t('index.there_no_tips_this_category')}</div>`; return; }
  grid.innerHTML = `<div class="tips-grid">${tips.map(tip => {
    const cat = tip.category || '기타';
    const col = CAT_COLORS[cat] || CAT_COLORS['기타'];
    const emoji = CAT_EMOJI[cat] || '💡';
    return `<a href="tips.html?id=${tip.id}" class="tip-card">
      <div class="tip-card-thumb" style="background:${col.bg}">${tip.emoji || emoji}</div>
      <div class="tip-card-body">
        <div class="tip-cat-badge" style="color:${col.color}">${I18N.d('cat',cat)}</div>
        <div class="tip-title">${tip.title}</div>
        <div class="tip-summary">${tip.summary || ''}</div>
      </div>
    </a>`;
  }).join('')}</div>`;
}

function getSampleTips() {
  return [
    {id:'s1',category:'수면',emoji:'😴',title:I18N.t('common.real_reason_baby_wakes_up'),summary:I18N.t('common.waking_end_sleep_cycle_normal')},
    {id:'s2',category:'이유식',emoji:'🥦',title:I18N.t('common.complete_guide_freezing_baby_food'),summary:I18N.t('common.how_long_keeps_plus_how')},
    {id:'s3',category:'건강',emoji:'🌡️',title:I18N.t('common.febrile_seizures_stay_calm_do'),summary:I18N.t('common.what_parents_should_shouldn_t')},
    {id:'s4',category:'발달',emoji:'🗣️',title:I18N.t('common.slow_language_development_when_should'),summary:I18N.t('common.language_milestones_by_age_signs')},
    {id:'s5',category:'이유식',emoji:'🐟',title:I18N.t('common.fish_baby_food_when_how'),summary:I18N.t('common.why_start_white_fish_plus')},
    {id:'s6',category:'수면',emoji:'🌙',title:I18N.t('common.nap_refusal_phase_how_respond'),summary:I18N.t('common.how_keep_sleep_routine_going')},
    {id:'s7',category:'지원금',emoji:'💰',title:I18N.t('common.5_government_parenting_benefits_ll'),summary:I18N.t('common.roundup_hidden_benefits_many_parents')},
    {id:'s8',category:'임신',emoji:'🤰',title:I18N.t('common.complete_list_foods_avoid_during'),summary:I18N.t('common.list_foods_avoid_from_caffeine')},
    {id:'s9',category:'임신',emoji:'🤰',title:I18N.t('common.complete_list_foods_avoid_during'),summary:I18N.t('common.list_foods_avoid_from_caffeine')},
  ];
}

loadTips();

/* ── 액티비티 섹션 ── */
const PLAY_JSON_URL = (typeof CONFIG !== 'undefined') ? CONFIG.PLAY_SHEET_URL : '';

// 색상은 계열별로 묶어서 재사용합니다 (play.html과 동일한 매핑)
const _PTHEME  = {bg:'#FFF1EC', color:'#8A3A1A'};
const _PWATER  = {bg:'#E0F2F7', color:'#0B5C7A'};
const _PNATURE = {bg:'#EFF7F1', color:'#33573F'};
const _PGARDEN = {bg:'#F3F9E8', color:'#4A6B1A'};
const _PMUSEUM = {bg:'#f5f0ff', color:'#3c1a8a'};
const _PCLASS  = {bg:'#fef0f5', color:'#8a1a55'};
const _PMISC   = {bg:'#f0f4ff', color:'#0a2d7a'};

const PLAY_CAT_COLORS = {
  '실내놀이':   {bg:'#f0f4ff', color:'#0a2d7a'},
  '실외놀이':   {bg:'#EFF7F1', color:'#33573F'},
  '미술/만들기':{bg:'#FBF4E4', color:'#7A5710'},
  '음악/율동':  {bg:'#fef0f5', color:'#8a1a55'},
  '교육/놀이터':{bg:'#f5f0ff', color:'#3c1a8a'},
  '테마파크': _PTHEME, '테마파크/동물원': _PTHEME, '미디어아트/테마파크': _PTHEME,
  '미디어파크': _PTHEME, '키즈파크': _PTHEME,
  '물놀이터/파크': _PWATER, '워터파크/스파': _PWATER, '워터파크': _PWATER,
  '아쿠아리움/동물원': _PNATURE, '자연/체험농장': _PNATURE, '자연체험관': _PNATURE,
  '자연/목장': _PNATURE, '농촌체험': _PNATURE, '목장체험': _PNATURE, '갯벌체험/자연': _PNATURE,
  '식물원/새정원': _PGARDEN, '식물원': _PGARDEN, '수목원': _PGARDEN, '수목원/자연': _PGARDEN,
  '가드닝클래스': _PGARDEN,
  '과학관/박물관': _PMUSEUM, '박물관/체험': _PMUSEUM, '박물관/체험관': _PMUSEUM,
  '자연사박물관': _PMUSEUM, '과학/항공박물관': _PMUSEUM, '박물관/전시관': _PMUSEUM,
  '역사박물관': _PMUSEUM, '해양박물관': _PMUSEUM, '미술관/건축박물관': _PMUSEUM,
  '어린이박물관': _PMUSEUM,
  '공예클래스': _PCLASS, '생태클래스': _PCLASS, '수상레저클래스': _PCLASS,
  '쿠킹클래스': _PCLASS, 'IT/코딩클래스': _PCLASS, '목공클래스': _PCLASS, '댄스클래스': _PCLASS,
  '키즈카페/실내놀이터': _PMISC, '직업체험': _PMISC, '키즈스포츠': _PMISC, '레저/캠핑': _PMISC,
  '기타':       {bg:'#f8f8f6', color:'#3f3f3b'},
};
const PLAY_CAT_EMOJI = {
  '실내놀이':'🏠','실외놀이':'🌳','미술/만들기':'🎨','음악/율동':'🎵','교육/놀이터':'📚',
  '테마파크':'🎡','테마파크/동물원':'🐯','미디어아트/테마파크':'🔮','미디어파크':'🌌','키즈파크':'☁️',
  '물놀이터/파크':'⛲','워터파크/스파':'🏊‍♂️','워터파크':'🏄‍♂️',
  '아쿠아리움/동물원':'🐠','자연/체험농장':'🐑','자연체험관':'🦎','자연/목장':'🐄',
  '농촌체험':'🍠','목장체험':'🧀','갯벌체험/자연':'🦀',
  '식물원/새정원':'🦜','식물원':'🌺','수목원':'🌲','수목원/자연':'🍃','가드닝클래스':'🌱',
  '과학관/박물관':'🚀','박물관/체험':'💡','박물관/체험관':'🏛️','자연사박물관':'🦴',
  '과학/항공박물관':'✈️','박물관/전시관':'🎨','역사박물관':'📜','해양박물관':'🐋',
  '미술관/건축박물관':'📐','어린이박물관':'🎈',
  '공예클래스':'🏺','생태클래스':'🐚','수상레저클래스':'🚣‍♀️','쿠킹클래스':'🍲',
  'IT/코딩클래스':'🤖','목공클래스':'🪵','댄스클래스':'🕺',
  '키즈카페/실내놀이터':'🐧','직업체험':'👩‍🚒','키즈스포츠':'🤸‍♂️','레저/캠핑':'🚃',
  '기타':'🎪',
};
let allPlays = [];

async function loadPlay() {
  if (!PLAY_JSON_URL) { allPlays = getSamplePlay(); renderPlayTabs(allPlays); renderPlayCards(allPlays.slice(0,8)); return; }
  try {
    const res = await fetch(PLAY_JSON_URL);
    const data = await res.json();
    allPlays = I18N.localizeRecords(Array.isArray(data) ? data : (data.tips || []));
    if (!allPlays.length) throw new Error();
    renderPlayTabs(allPlays); renderPlayCards(allPlays.slice(0,9));
  } catch { allPlays = getSamplePlay(); renderPlayTabs(allPlays); renderPlayCards(allPlays.slice(0,9)); }
}
function renderPlayTabs(items) {
  const cats = ['전체', ...new Set(items.map(t => t.category || '기타'))];
  document.getElementById('playTabs').innerHTML = cats.map((c,i) =>
    `<button class="tips-tab${i===0?' active':''}" onclick="filterPlay('${c}',this)">${PLAY_CAT_EMOJI[c]||'🎪'} ${I18N.d('cat',c)}</button>`
  ).join('');
}
function filterPlay(cat, btn) {
  document.querySelectorAll('#playTabs .tips-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPlayCards((cat==='전체'?allPlays:allPlays.filter(t=>t.category===cat)).slice(0,9));
}
function renderPlayCards(items) {
  const grid = document.getElementById('playGrid');
  if (!items.length) { grid.innerHTML = `<div class="tips-loading">${I18N.t('common.there_no_activities_this_category')}</div>`; return; }
  grid.innerHTML = `<div class="tips-grid">${items.map(p => {
    const cat = p.category||'기타', col = PLAY_CAT_COLORS[cat]||PLAY_CAT_COLORS['기타'];
    return `<a href="play.html?id=${p.id}" class="tip-card">
      <div class="tip-card-thumb" style="background:${col.bg}">${p.emoji||PLAY_CAT_EMOJI[cat]||'🎪'}</div>
      <div class="tip-card-body">
        <div class="tip-cat-badge" style="color:${col.color}">${I18N.d('cat',cat)}</div>
        <div class="tip-title">${p.title}</div>
        <div class="tip-summary">${p.summary||''}</div>
      </div>
    </a>`;
  }).join('')}</div>`;
}
function getSamplePlay() {
  return [
    {id:'p1',category:'실내놀이',emoji:'🧩',name:I18N.t('common.lego_duplo_block_play'),summary:I18N.t('common.creative_play_large_blocks_enjoyable')},
    {id:'p2',category:'실외놀이',emoji:'🌳',name:I18N.t('common.children_s_grand_park_outing'),summary:I18N.t('common.seoul_s_best_free_play')},
    {id:'p3',category:'미술/만들기',emoji:'🎨',name:I18N.t('common.finger_painting_experience'),summary:I18N.t('common.sensory_art_play_hands_18')},
    {id:'p4',category:'음악/율동',emoji:'🎵',name:I18N.t('common.gymboree_music_class'),summary:I18N.t('common.music_movement_program_made_infants')},
    {id:'p5',category:'교육/놀이터',emoji:'📚',name:I18N.t('common.national_children_s_science_museum'),summary:I18N.t('common.located_hwarang_ro_seoul_free')},
    {id:'p6',category:'실내놀이',emoji:'🏊',name:I18N.t('common.baby_swimming_baby_swim'),summary:I18N.t('common.water_adjustment_program_available_fro')},
    {id:'p7',category:'미술/만들기',emoji:'🧸',name:I18N.t('common.clay_play'),summary:I18N.t('common.clay_modeling_play_that_s')},
    {id:'p8',category:'실외놀이',emoji:'🚲',name:I18N.t('common.cycling_hangang_park'),summary:I18N.t('common.intro_tricycles_scooters_family_rides')},
  ];
}
loadPlay();
