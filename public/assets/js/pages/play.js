/**
 * 페이지 스크립트 — play.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
  // ══════════════════════════════════════════
  // Sheet2 에서 액티비티 데이터를 가져와요.
  // config.js 의 PLAY_SHEET_URL 에 Apps Script URL 을 입력하세요.
  // Apps Script 코드에서 getActiveSheet() 대신
  // SpreadsheetApp.getActiveSpreadsheet().getSheets()[1] 로 변경하세요.
  // ══════════════════════════════════════════
  const PLAY_JSON_URL = (typeof CONFIG !== 'undefined') ? CONFIG.PLAY_SHEET_URL : '';

  // 색상은 계열별로 묶어서 재사용합니다 (테마파크 계열=코랄, 워터파크 계열=아쿠아,
  // 동물/자연 계열=그린, 식물원/정원 계열=올리브, 박물관 계열=퍼플, 클래스 계열=핑크, 기타=블루)
  const _THEME  = {bg:'#FFF1EC', color:'#8A3A1A'};
  const _WATER  = {bg:'#E0F2F7', color:'#0B5C7A'};
  const _NATURE = {bg:'#EFF7F1', color:'#33573F'};
  const _GARDEN = {bg:'#F3F9E8', color:'#4A6B1A'};
  const _MUSEUM = {bg:'#f5f0ff', color:'#3c1a8a'};
  const _CLASS  = {bg:'#fef0f5', color:'#8a1a55'};
  const _MISC   = {bg:'#f0f4ff', color:'#0a2d7a'};

  const CAT_COLORS = {
    // 예시/폴백 데이터에서 쓰는 구 카테고리 (그대로 유지)
    '실내놀이':   {bg:'#f0f4ff', color:'#0a2d7a'},
    '실외놀이':   {bg:'#EFF7F1', color:'#33573F'},
    '미술/만들기':{bg:'#FBF4E4', color:'#7A5710'},
    '음악/율동':  {bg:'#fef0f5', color:'#8a1a55'},
    '교육/놀이터':{bg:'#f5f0ff', color:'#3c1a8a'},
    // 실제 구글시트 카테고리 (2026-08 기준)
    '테마파크': _THEME, '테마파크/동물원': _THEME, '미디어아트/테마파크': _THEME,
    '미디어파크': _THEME, '키즈파크': _THEME,
    '물놀이터/파크': _WATER, '워터파크/스파': _WATER, '워터파크': _WATER,
    '아쿠아리움/동물원': _NATURE, '자연/체험농장': _NATURE, '자연체험관': _NATURE,
    '자연/목장': _NATURE, '농촌체험': _NATURE, '목장체험': _NATURE, '갯벌체험/자연': _NATURE,
    '식물원/새정원': _GARDEN, '식물원': _GARDEN, '수목원': _GARDEN, '수목원/자연': _GARDEN,
    '가드닝클래스': _GARDEN,
    '과학관/박물관': _MUSEUM, '박물관/체험': _MUSEUM, '박물관/체험관': _MUSEUM,
    '자연사박물관': _MUSEUM, '과학/항공박물관': _MUSEUM, '박물관/전시관': _MUSEUM,
    '역사박물관': _MUSEUM, '해양박물관': _MUSEUM, '미술관/건축박물관': _MUSEUM,
    '어린이박물관': _MUSEUM,
    '공예클래스': _CLASS, '생태클래스': _CLASS, '수상레저클래스': _CLASS,
    '쿠킹클래스': _CLASS, 'IT/코딩클래스': _CLASS, '목공클래스': _CLASS, '댄스클래스': _CLASS,
    '키즈카페/실내놀이터': _MISC, '직업체험': _MISC, '키즈스포츠': _MISC, '레저/캠핑': _MISC,
    '기타': {bg:'#f8f8f6', color:'#3f3f3b'},
  };
  const CAT_EMOJI = {
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

  const AGE_BRACKETS = [6, 12, 24, 36, 48, 60].map(n => ({key:String(n), label:I18N.t('play.months', {n}), months:n}));
  let currentAgeKey = '전체';
  let liveRecItems = [];
  
  let allItems = [];
  let filteredItems = [];
  let displayCount = 12;
  let currentCat = '전체';
  let currentItem = null;
  let likedIds = JSON.parse(localStorage.getItem('playLikes') || '[]');
  
  // ── 샘플 데이터 ──────────────────────────────
  function getSampleData() {
    return [
      {id:'p1',category:'실내놀이',emoji:'🧩',name:I18N.t('common.lego_duplo_block_play'),summary:I18N.t('common.creative_play_large_blocks_enjoyable'),age:24,link:'https://www.lego.com/ko-kr',price:45900,discount:39900,views:8200,address:I18N.t('play.240_olympic_ro_songpa_gu'),
       content:`<h2>${I18N.t('play.what_lego_duplo')}</h2><p>${I18N.t('play.duplo_bricks_twice_size_regular')}</p><h2>${I18N.t('play.developmental_benefits')}</h2><ul><li>${I18N.t('play.builds_fine_motor_skills_hand')}</li><li>${I18N.t('play.learn_recognize_colors_shapes_sizes')}</li><li>${I18N.t('play.sparks_imagination_through_creative_bu')}</li><li>${I18N.t('play.improves_concentration')}</li></ul><blockquote>${I18N.t('play.block_play_lays_foundation_mathematica')}</blockquote><div class="tip-box">${I18N.t('play.tip_sorting_blocks_by_color')}</div>`},
      {id:'p2',category:'실외놀이',emoji:'🌳',name:I18N.t('common.children_s_grand_park_outing'),summary:I18N.t('common.seoul_s_best_free_play'),age:12,link:'https://www.childrenpark.or.kr',price:0,discount:0,views:15200,address:I18N.t('play.216_neungdong_ro_gwangjin_gu'),
       content:`<h2>${I18N.t('play.about_children_s_grand_park')}</h2><p>${I18N.t('play.located_gwangjin_gu_seoul_children')}</p><h2>${I18N.t('play.what_can_enjoy_kids')}</h2><ul><li>${I18N.t('play.zoo_see_lions_giraffes_elephants')}</li><li>${I18N.t('play.forest_dreams_playground_large_multi')}</li><li>${I18N.t('play.botanical_garden_explore_flowers_trees')}</li><li>${I18N.t('play.performance_hall_free_children_s')}</li></ul><div class="tip-box">${I18N.t('play.parking_gets_crowded_so_take')}</div>`},
      {id:'p3',category:'미술/만들기',emoji:'🎨',name:I18N.t('common.finger_painting_experience'),summary:I18N.t('common.sensory_art_play_hands_18'),age:24,link:'',price:12000,discount:9900,views:5400,address:I18N.t('play.396_world_cup_buk_ro'),
       content:`<h2>${I18N.t('play.what_finger_painting')}</h2><p>${I18N.t('play.s_sensory_art_where_dip')}</p><h2>${I18N.t('play.what_ll_need')}</h2><ul><li>${I18N.t('play.non_toxic_finger_paint_food')}</li><li>${I18N.t('play.large_drawing_paper_bathroom_tiles')}</li><li>${I18N.t('play.wet_wipes_apron')}</li></ul><h2>${I18N.t('play.how_play')}</h2><ul><li>${I18N.t('play.spread_paper_out_wide_floor')}</li><li>${I18N.t('play.put_paints_several_colors_small')}</li><li>${I18N.t('play.freely_dab_fingers_palms_soles')}</li><li>${I18N.t('play.once_dry_frame_as_precious')}</li></ul><blockquote>${I18N.t('play.tree_made_handprints_animal_made')}</blockquote>`},
      {id:'p4',category:'음악/율동',emoji:'🎵',name:I18N.t('common.gymboree_music_class'),summary:I18N.t('common.music_movement_program_made_infants'),age:6,link:'https://www.gymboree.co.kr',price:33000,discount:29000,views:6100,address:I18N.t('play.152_teheran_ro_gangnam_gu'),
       content:`<h2>${I18N.t('play.what_gymboree')}</h2><p>${I18N.t('play.infant_only_play_music_program')}</p><h2>${I18N.t('play.target_ages')}</h2><ul><li>${I18N.t('play.play_music_6_months_5')}</li><li>${I18N.t('play.gymnastics_15_months_5_years')}</li></ul><h2>${I18N.t('play.expected_benefits')}</h2><ul><li>${I18N.t('play.hearing_development_sense_rhythm')}</li><li>${I18N.t('play.social_interaction_peers')}</li><li>${I18N.t('play.gross_fine_motor_development_together')}</li></ul><div class="tip-box">${I18N.t('play.many_centers_offer_free_trial')}</div>`},
      {id:'p5',category:'교육/놀이터',emoji:'📚',name:I18N.t('common.national_children_s_science_museum'),summary:I18N.t('common.located_hwarang_ro_seoul_free'),age:36,link:'https://www.csc.go.kr',price:0,discount:0,views:9800,address:I18N.t('play.215_changgyeonggung_ro_jongno_gu'),
       content:`<h2>${I18N.t('play.about_national_children_s_science')}</h2><p>${I18N.t('play.located_hwarang_ro_seoul_national')}</p><h2>${I18N.t('play.main_exhibits')}</h2><ul><li>${I18N.t('play.toddler_only_hands_zone_under')}</li><li>${I18N.t('play.robot_coding_experiences_recommended_a')}</li><li>${I18N.t('play.space_nature_exploration_exhibits')}</li><li>${I18N.t('play.4d_theater')}</li></ul><div class="tip-box">${I18N.t('play.weekends_very_crowded_arrive_opening')}</div>`},
      {id:'p6',category:'실내놀이',emoji:'🏊',name:I18N.t('common.baby_swimming_baby_swim'),summary:I18N.t('common.water_adjustment_program_available_fro'),age:6,link:'',price:88000,discount:79000,views:4200,address:I18N.t('play.235_banpo_daero_seocho_gu'),
       content:`<h2>${I18N.t('play.what_baby_swimming')}</h2><p>${I18N.t('play.infant_swimming_program_where_get')}</p><h2>${I18N.t('play.benefits')}</h2><ul><li>${I18N.t('play.gross_motor_development_arm_leg')}</li><li>${I18N.t('play.overcoming_fear_water')}</li><li>${I18N.t('play.better_sleep_quality')}</li><li>${I18N.t('play.stronger_parent_baby_bonding')}</li></ul><h2>${I18N.t('play.precautions')}</h2><ul><li>${I18N.t('play.pool_water_temperature_32_34')}</li><li>${I18N.t('play.avoid_feeding_least_1_hour')}</li><li>${I18N.t('play.skip_swimming_when_there_ear')}</li></ul>`},
      {id:'p7',category:'미술/만들기',emoji:'🧸',name:I18N.t('common.clay_play'),summary:I18N.t('common.clay_modeling_play_that_s'),age:48,link:'',price:9900,discount:7900,views:3800,address:I18N.t('play.176_yanghwa_ro_mapo_gu'),
       content:`<h2>${I18N.t('play.benefits_clay_play')}</h2><p>${I18N.t('play.squeezing_shaping_clay_builds_fine')}</p><h2>${I18N.t('play.recommended_types_clay')}</h2><ul><li>${I18N.t('play.flour_dough_safest_can_make')}</li><li>${I18N.t('play.natural_clay_can_be_kept')}</li><li>${I18N.t('play.air_dry_clay_light_available')}</li></ul><div class="tip-box">${I18N.t('play.making_colored_dough_food_coloring')}</div>`},
      {id:'p8',category:'실외놀이',emoji:'🚲',name:I18N.t('common.cycling_hangang_park'),summary:I18N.t('common.intro_tricycles_scooters_family_rides'),age:60,link:'https://hangang.seoul.go.kr',price:0,discount:0,views:7300,address:I18N.t('play.330_yeoui_dong_ro_yeongdeungpo'),
       content:`<h2>${I18N.t('play.hangang_park_cycling_routes')}</h2><p>${I18N.t('play.riverside_bike_paths_along_han')}</p><h2>${I18N.t('play.recommended_routes')}</h2><ul><li>${I18N.t('play.yeouido_hangang_park_wide_plaza')}</li><li>${I18N.t('play.ttukseom_hangang_park_bike_rentals')}</li><li>${I18N.t('play.banpo_hangang_park_moonlight_rainbow')}</li></ul><h2>${I18N.t('play.what_ll_need')}</h2><ul><li>${I18N.t('play.helmet_must_knee_elbow_pads')}</li><li>${I18N.t('play.water_snacks_sunscreen')}</li><li>${I18N.t('play.tricycle_scooter')}</li></ul><blockquote>${I18N.t('play.starting_balance_bike_that_kids')}</blockquote>`},
    ];
  }
  
  // ── 초기화 ───────────────────────────────────
  async function init() {
    const params = new URLSearchParams(location.search);
    const itemId = params.get('id');
    await loadAllData();
    if (itemId) showDetail(itemId);
    else showList();
  }
  
  // Google Apps Script 웹앱은 콜드 스타트 시 2~5초 이상 걸릴 수 있어요.
  // localStorage에 결과를 캐시해두고, 캐시가 있으면 즉시 화면을 그린 뒤
  // 백그라운드에서 최신 데이터로 조용히 갱신합니다(stale-while-revalidate).
  const PLAY_CACHE_KEY = 'playDataCache_v1';
  const PLAY_CACHE_FRESH_MS = 5 * 60 * 1000;   // 5분 이내면 재조회 없이 그대로 사용
  const PLAY_CACHE_MAX_MS = 24 * 60 * 60 * 1000; // 24시간 넘은 캐시는 폐기

  function readPlayCache() {
    try {
      const raw = localStorage.getItem(PLAY_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed.items || !parsed.items.length) return null;
      if (Date.now() - parsed.ts > PLAY_CACHE_MAX_MS) return null;
      return parsed;
    } catch { return null; }
  }
  function writePlayCache(items) {
    try { localStorage.setItem(PLAY_CACHE_KEY, JSON.stringify({ items, ts: Date.now() })); } catch {}
  }
  async function fetchPlayJSON() {
    const res = await fetch(PLAY_JSON_URL);
    const data = await res.json();
    const items = I18N.localizeRecords(Array.isArray(data) ? data : (data.activities || data.tips || []));
    if (!items.length) throw new Error('empty');
    return items;
  }

  async function loadAllData() {
    if (allItems.length) return;
    if (!PLAY_JSON_URL) { allItems = getSampleData(); return; }

    const cached = readPlayCache();
    if (cached) {
      // 1) 캐시를 즉시 사용해 화면을 빠르게 보여줌
      allItems = cached.items;
      // 2) 캐시가 살짝 오래됐으면 백그라운드에서만 조용히 갱신 (화면 깜빡임 없음)
      if (Date.now() - cached.ts > PLAY_CACHE_FRESH_MS) {
        fetchPlayJSON()
          .then((items) => { writePlayCache(items); })
          .catch(() => {});
      }
      return;
    }

    // 캐시가 전혀 없는 최초 방문: 어쩔 수 없이 응답을 기다림
    try {
      const items = await fetchPlayJSON();
      allItems = items;
      writePlayCache(items);
    } catch { allItems = getSampleData(); }
  }
  
  // ── 목록 화면 ────────────────────────────────
  function showList(e) {
    if (e) e.preventDefault();
    history.pushState({}, '', 'play.html');
    document.getElementById('listView').classList.remove('hidden');
    document.getElementById('detailView').classList.add('hidden');
    document.getElementById('actionBar').classList.add('hidden');
    document.title = I18N.t('play.recommended_activities_kids_ailog');
    if (window.BTAnalytics) window.BTAnalytics.trackContentView('', '', '');
    renderCatFilter();
    renderGrid(currentCat);
    renderQuickSections();
  }
  
  function renderCatFilter() {
    const cats = ['전체', ...new Set(allItems.map(t => t.category || '기타'))];
    document.getElementById('playCatFilter').innerHTML = cats.map((c, i) =>
      `<button class="cf-btn${(i===0&&currentCat==='전체')||(c===currentCat)?' active':''}" onclick="changeCat('${c}',this)">
        ${CAT_EMOJI[c]||'🎪'} ${I18N.d('cat',c)}
      </button>`
    ).join('');
  }
  
  function changeCat(cat, btn) {
    currentCat = cat; displayCount = 12;
    document.querySelectorAll('.cf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid(cat);
  }
  
  function renderGrid(cat) {
    filteredItems = cat === '전체' ? allItems : allItems.filter(t => t.category === cat);
    const slice = filteredItems.slice(0, displayCount);
    const grid = document.getElementById('listGrid');
    if (!slice.length) { grid.innerHTML = `<div class="empty-state">${I18N.t('common.there_no_activities_this_category')}</div>`; return; }
    grid.innerHTML = `<div class="play-grid">${slice.map(playCardHTML).join('')}</div>`;
    filteredItems.length > displayCount
      ? document.getElementById('loadMoreBtn').classList.remove('hidden')
      : document.getElementById('loadMoreBtn').classList.add('hidden');
  }
  
  function playCardHTML(item) {
    const cat = item.category || '기타';
    const col = CAT_COLORS[cat] || CAT_COLORS['기타'];
    const emoji = item.emoji || CAT_EMOJI[cat] || '🎪';
    return `<a href="play.html?id=${item.id}" class="play-card" onclick="openDetail(event,'${item.id}')">
      <div class="play-thumb" style="background:${col.bg}">${emoji}</div>
      <div class="play-body">
        <div class="play-cat" style="color:${col.color}">${I18N.d('cat',cat)}</div>
        <div class="play-title">${item.title || item.name}</div>
        <div class="play-summary">${item.summary || ''}</div>
        ${item.age ? `<span class="play-age-badge">👶 ${fmtAge(item.age)}</span>` : ''}
      </div>
    </a>`;
  }
  
  function loadMore() { displayCount += 12; renderGrid(currentCat); }

  // ══════════════════════════════════════════
  // 빠른 섹션: 랭킹 / 연령별 / 실시간 추천 / 최저가
  // ══════════════════════════════════════════
  function renderQuickSections() {
    renderRanking();
    renderAgeFilter();
    renderAgeGrid();
    initLiveRecs();
    renderPriceList();
    setupNearMapLazyLoad();
  }

  function fmtViews(n) {
    n = Number(n) || 0;
    return n >= 10000 ? I18N.t('play.k_views', {n: (n/10000).toFixed(1).replace(/\.0$/,''), k: (Math.round(n/100)/10).toString().replace(/\.0$/,'')}) : I18N.t('play.views', {n: n.toLocaleString(I18N.locale)});
  }
  function fmtPrice(p) {
    p = Number(p) || 0;
    return p <= 0 ? I18N.t('play.free') : I18N.t('common.s0236', {p: p.toLocaleString(I18N.locale)});
  }
  function fmtAge(ageVal) {
    if (ageVal === undefined || ageVal === null || ageVal === '') return '';
    return typeof ageVal === 'number' ? I18N.t('play.months_2', {ageVal}) : String(ageVal);
  }
  function discountPct(orig, sale) {
    orig = Number(orig) || 0; sale = Number(sale) || 0;
    if (orig <= 0 || sale >= orig) return 0;
    return Math.round((1 - sale / orig) * 100);
  }
  function getAgeMonths(ageVal) {
    if (ageVal === undefined || ageVal === null || ageVal === '') return null;
    if (typeof ageVal === 'number') return ageVal;
    const m = String(ageVal).match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  }

  // ── 랭킹 (조회수 기준 상위 5) ──
  function renderRanking() {
    const ranked = [...allItems].sort((a, b) => (Number(b.views)||0) - (Number(a.views)||0)).slice(0, 5);
    const wrap = document.getElementById('rankingList');
    if (!ranked.length) { wrap.innerHTML = `<div class="empty-state">${I18N.t('play.no_ranking_data_yet')}</div>`; return; }
    wrap.innerHTML = ranked.map((item, i) => {
      const cat = item.category || '기타';
      const col = CAT_COLORS[cat] || CAT_COLORS['기타'];
      const emoji = item.emoji || CAT_EMOJI[cat] || '🎪';
      return `<a href="play.html?id=${item.id}" class="rank-card top${i+1}" onclick="openDetail(event,'${item.id}')">
        <div class="rank-num">${i+1}</div>
        <div class="rank-emoji">${emoji}</div>
        <div class="rank-name">${item.title || item.name}</div>
        <div class="rank-views">${fmtViews(item.views)}</div>
      </a>`;
    }).join('');
  }

  // ── 연령별 필터 ──
  function renderAgeFilter() {
    const wrap = document.getElementById('ageFilter');
    const chips = [{key:'전체', label:I18N.d('cat','전체')}, ...AGE_BRACKETS];
    wrap.innerHTML = chips.map(c =>
      `<button class="age-btn${c.key===currentAgeKey?' active':''}" onclick="changeAge('${c.key}', this)">${c.label}</button>`
    ).join('');
  }

  function changeAge(key, btn) {
    currentAgeKey = key;
    document.querySelectorAll('.age-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderAgeGrid();
  }

  function renderAgeGrid() {
    const grid = document.getElementById('ageGrid');
    let items;
    if (currentAgeKey === '전체') {
      items = allItems.slice(0, 6);
    } else {
      const bracket = AGE_BRACKETS.find(b => b.key === currentAgeKey);
      items = allItems.filter(it => getAgeMonths(it.age) === bracket.months).slice(0, 6);
    }
    grid.innerHTML = items.length
      ? items.map(playCardHTML).join('')
      : `<div class="age-empty">${I18N.t('play.there_no_activities_this_age')}</div>`;
  }

  // ── 실시간 추천 (랜덤 4개, 새로고침 가능) ──
  function initLiveRecs() { pickLiveRecs(); renderLiveGrid(); }

  function pickLiveRecs() {
    const pool = [...allItems];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    liveRecItems = pool.slice(0, 4);
  }

  function renderLiveGrid() {
    const grid = document.getElementById('liveGrid');
    grid.innerHTML = liveRecItems.length
      ? liveRecItems.map(playCardHTML).join('')
      : `<div class="empty-state">${I18N.t('play.no_activities_recommend')}</div>`;
  }

  function refreshLiveRecs() { pickLiveRecs(); renderLiveGrid(); }

  // ── 최저가 (discount 필드 기준 오름차순 상위 5, 없으면 price로 대체) ──
  function getSalePrice(it) {
    if (it.discount !== undefined && it.discount !== null && it.discount !== '') return Number(it.discount);
    if (it.price !== undefined && it.price !== null && it.price !== '') return Number(it.price);
    return null;
  }

  function renderPriceList() {
    const priced = allItems.filter(it => getSalePrice(it) !== null);
    const sorted = [...priced].sort((a, b) => getSalePrice(a) - getSalePrice(b)).slice(0, 5);
    const wrap = document.getElementById('priceList');
    if (!sorted.length) { wrap.innerHTML = `<div class="empty-state">${I18N.t('play.no_price_information')}</div>`; return; }
    wrap.innerHTML = sorted.map(item => {
      const cat = item.category || '기타';
      const col = CAT_COLORS[cat] || CAT_COLORS['기타'];
      const emoji = item.emoji || CAT_EMOJI[cat] || '🎪';
      const sale = getSalePrice(item) || 0;
      const orig = Number(item.price) || 0;
      const hasDiscount = item.discount !== undefined && item.discount !== null && item.discount !== '' && orig > sale;
      const pct = hasDiscount ? discountPct(orig, sale) : 0;
      return `<a href="play.html?id=${item.id}" class="price-row" onclick="openDetail(event,'${item.id}')">
        <div class="price-row-emoji" style="background:${col.bg}">${emoji}</div>
        <div class="price-row-body">
          <div class="price-row-name">${item.title || item.name}</div>
          <div class="price-row-cat">${I18N.d('cat',cat)}${hasDiscount ? ` · <s>${fmtPrice(orig)}</s>` : ''}</div>
        </div>
        <div class="price-row-tag${sale<=0?' free':''}">${pct > 0 ? `<span class="discount-pct">${pct}%</span>` : ''}${fmtPrice(sale)}</div>
      </a>`;
    }).join('');
  }

  // ══════════════════════════════════════════
  // 내 주변 추천 (카카오맵) — 현재 위치 기준 가장 가까운 5개
  // config.js 에 CONFIG.KAKAO_MAP_KEY 를 추가하세요.
  // (카카오 개발자센터 → 내 애플리케이션 → JavaScript 키, 플랫폼에 사이트 도메인 등록 필요)
  // ══════════════════════════════════════════
  const DEFAULT_USER_LOCATION = { lat: 37.5665, lng: 126.9780 }; // 위치 권한이 없을 때 서울시청 기준
  let nearMapInitialized = false;
  let kakaoSDKLoading = false;

  // 분석 로그 훅이 따로 없다면 조용히 무시
  if (typeof window.sendUserActionLog !== 'function') {
    window.sendUserActionLog = function () {};
  }

  function haversineDistanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function fmtDistance(km) {
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
  }

  function getUserLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve({ ...DEFAULT_USER_LOCATION, isDefault: true }); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, isDefault: false }),
        () => resolve({ ...DEFAULT_USER_LOCATION, isDefault: true }),
        { timeout: 5000 }
      );
    });
  }

  function ensureKakaoSDK(callback) {
    if (typeof kakao !== 'undefined' && kakao.maps) { callback(); return; }
    if (typeof CONFIG === 'undefined' || !CONFIG.KAKAO_MAP_KEY) {
      console.error(I18N.t('play.kakao_map_kakao_map_key'), {
        CONFIG_defined: typeof CONFIG !== 'undefined',
        KAKAO_MAP_KEY: typeof CONFIG !== 'undefined' ? CONFIG.KAKAO_MAP_KEY : undefined,
      });
      const slider = document.getElementById('map-spots-slider');
      if (slider) slider.innerHTML = `<div class="map-loading-msg" style="color:red;">${I18N.t('play.kakao_map_api_key_isn')}</div>`;
      return;
    }
    if (kakaoSDKLoading) return;
    kakaoSDKLoading = true;
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${CONFIG.KAKAO_MAP_KEY}&libraries=services&autoload=false`;
    console.log(I18N.t('play.kakao_map_attempting_load_sdk'), script.src);
    script.onload = function () {
      console.log(I18N.t('play.kakao_map_sdk_loaded_successfully'));
      callback();
    };
    script.onerror = (event) => {
    const slider = document.getElementById('map-spots-slider');

    // 에러의 원인이 config 변수 때문인지, 네트워크 문제인지 화면에 직접 표시합니다.
    let errorMsg = I18N.t('play.failed_load_kakao_map_script');
    if (typeof CONFIG === 'undefined') {
      errorMsg += ` ${I18N.t('play.reason_config_js_file_not')}`;
    } else if (!CONFIG.KAKAO_MAP_KEY) {
      errorMsg += ` ${I18N.t('play.reason_key_value_config_empty')}`;
    } else {
      errorMsg += ` ${I18N.t('play.reason_kakao_domain_not_registered')}`;
    }
    console.error(I18N.t('play.kakao_map', {errorMsg}), script.src);

    if (slider) {
      slider.innerHTML = `<div class="map-loading-msg" style="color:red; font-size:14px; text-align:center;">${errorMsg}</div>`;
    }
  };
    document.head.appendChild(script);
  }

  function initNearMap() {
    if (nearMapInitialized) return; // 지도는 한 번만 생성
    if (!allItems.length) return;
    nearMapInitialized = true;
    ensureKakaoSDK(() => renderNearLocationMap(allItems));
  }

  // 지도는 무겁고(SDK + 지오코딩 다건 호출) 대부분의 사용자가 스크롤하지 않는 페이지
  // 하단에 있으므로, 화면 근처에 들어올 때만 로드합니다. 이렇게 하면 첫 화면(랭킹/연령별/
  // 실시간 추천/최저가)이 카카오맵을 기다리지 않고 훨씬 빠르게 표시됩니다.
  function setupNearMapLazyLoad() {
    const section = document.querySelector('.near-map-section');
    if (!section) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            initNearMap();
            io.disconnect();
          }
        });
      }, { rootMargin: '400px 0px' }); // 화면에 닿기 전 미리 로드 시작
      io.observe(section);
    } else {
      initNearMap(); // 구형 브라우저는 즉시 로드 (폴백)
    }
  }

  function goToDetail(id) {
    openDetail({ preventDefault(){} }, id);
  }

  function renderNearLocationMap(posts) {
    const mapContainer = document.getElementById('near-map');
    const slider = document.getElementById('map-spots-slider');
    if (!mapContainer || !slider) return;

    if (!posts || posts.length === 0) {
      slider.innerHTML = `<div class="map-loading-msg">${I18N.t('play.there_no_activity_data')}</div>`;
      return;
    }
    if (typeof kakao === 'undefined') {
      slider.innerHTML = `<div class="map-loading-msg" style="color:red;">${I18N.t('play.failed_load_kakao_script')}</div>`;
      return;
    }

    kakao.maps.load(async function () {
      const userLoc = await getUserLocation();
      const geocoder = new kakao.maps.services.Geocoder();

      // 주소 → 위경도 변환 결과를 localStorage에 캐시해서 재방문 시 카카오 지오코딩 API를
      // 다시 호출하지 않도록 합니다. (매 방문마다 N번의 API 왕복이 발생하던 것이 느린 원인이었음)
      const GEOCODE_CACHE_KEY = 'kakaoGeocodeCache_v1';
      const GEOCODE_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7일 — 주소는 자주 바뀌지 않음
      let geocodeCache = {};
      try { geocodeCache = JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || '{}'); } catch {}
      let cacheDirty = false;

      // 지오코딩 API 호출 건수를 제한해 최초 방문(캐시 미스) 시에도 응답이 늦어지지 않도록 함.
      // 5개만 보여주면 되므로 충분히 넉넉한 24개까지만 대상으로 삼습니다.
      const candidates = posts.slice(0, 24);

      // 데이터 내 액티비티의 주소를 위경도로 변환 (캐시 우선, 미스만 실제 API 호출)
      const convertedSpotsPromises = candidates.map((spot) => {
        return new Promise((resolve) => {
          const keys = Object.keys(spot);
          const addressKey = keys.find(k => k.toLowerCase().includes('address') || k.includes(I18N.t('play.address')) || k.includes(I18N.t('play.location')));
          const titleKey = keys.find(k => k.toLowerCase().includes('title') || k.includes(I18N.t('play.title')) || k.toLowerCase().includes('name'));

          if (!addressKey) { resolve(null); return; }
          const spotAddress = String(spot[addressKey]).trim();
          const spotTitle = titleKey ? spot[titleKey] : (spot.title || spot.name || I18N.t('play.recommended_place'));

          const cached = geocodeCache[spotAddress];
          if (cached && (Date.now() - cached.ts) < GEOCODE_CACHE_TTL) {
            resolve({ ...spot, title: spotTitle, lat: cached.lat, lng: cached.lng });
            return;
          }

          geocoder.addressSearch(spotAddress, function (result, status) {
            if (status === kakao.maps.services.Status.OK) {
              const lat = parseFloat(result[0].y);
              const lng = parseFloat(result[0].x);
              geocodeCache[spotAddress] = { lat, lng, ts: Date.now() };
              cacheDirty = true;
              resolve({ ...spot, title: spotTitle, lat, lng });
            } else {
              resolve(null);
            }
          });
        });
      });

      const geocoded = (await Promise.all(convertedSpotsPromises)).filter(s => s !== null);
      if (cacheDirty) {
        try { localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(geocodeCache)); } catch {}
      }
      if (geocoded.length === 0) {
        slider.innerHTML = `<div class="map-loading-msg">${I18N.t('play.no_data_valid_address')}</div>`;
        return;
      }

      // 현재 위치 기준 거리 계산 후 가장 가까운 5개만 채택
      const withDistance = geocoded.map(spot => ({
        ...spot,
        distanceKm: haversineDistanceKm(userLoc.lat, userLoc.lng, spot.lat, spot.lng)
      }));
      const validSpots = withDistance.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 5);

      // 1. 초기 지도 생성 (사용자 위치 또는 첫 번째 장소 중심)
      const centerLoc = userLoc.isDefault ? validSpots[0] : userLoc;
      const initialPosition = new kakao.maps.LatLng(centerLoc.lat, centerLoc.lng);
      const mapOption = { center: initialPosition, level: 6 };
      const map = new kakao.maps.Map(mapContainer, mapOption);

      // 사용자 위치 마커 (내 위치를 실제로 확인했을 때만 표시)
      if (!userLoc.isDefault) {
        new kakao.maps.Marker({
          position: new kakao.maps.LatLng(userLoc.lat, userLoc.lng),
          map,
          image: new kakao.maps.MarkerImage(
            'data:image/svg+xml;base64,' + btoa('<svg xmlns="https://www.w3.org/2000/svg" width="26" height="26"><circle cx="13" cy="13" r="8" fill="#4A7C59" stroke="#fff" stroke-width="3"/></svg>'),
            new kakao.maps.Size(26, 26)
          )
        });
      }

      const markers = [];
      const infowindows = [];

      // 2. 지도에 마커와 인포윈도우 그리기
      validSpots.forEach((spot, idx) => {
        const position = new kakao.maps.LatLng(spot.lat, spot.lng);
        const marker = new kakao.maps.Marker({ position, map });

        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px; font-size:11px; font-weight:700; color:#222; text-align:center; width:130px;">${spot.title}</div>`
        });
        if (idx === 0) infowindow.open(map, marker);

        markers.push(marker);
        infowindows.push(infowindow);

        // 마커 클릭 시 해당 액티비티 상세페이지로 이동
        kakao.maps.event.addListener(marker, 'click', function () {
          sendUserActionLog(spot.id, spot.title, 'marker_click');
          goToDetail(spot.id);
        });
      });

      // 3. 하단 슬라이더 카드 HTML 구성
      slider.innerHTML = validSpots.map((spot, idx) => {
        const cat = spot.category || '기타';
        const col = CAT_COLORS[cat] || CAT_COLORS['기타'];
        const emoji = spot.emoji || CAT_EMOJI[cat] || '🎪';
        const isActive = idx === 0 ? 'active' : '';
        const safeSpotTitle = spot.title ? String(spot.title).replace(/'/g, "\\'") : I18N.t('play.recommended_place');
        const spotId = spot.id ?? `map-${idx}`;

        return `
          <div class="map-recommend-card ${isActive}" id="map-card-${idx}" onclick="sendUserActionLog('${spotId}', '${safeSpotTitle}', 'click'); goToDetail('${spotId}')">
            <div class="play-thumb" style="background:${col.bg};height:84px;font-size:2.2rem;">${emoji}</div>
            <div class="info">
              <div class="badge-tag">${I18N.t('play.top_near_me', {idx: idx + 1})}</div>
              <div class="place-name">${spot.title}</div>
              <div class="place-distance">📍 ${fmtDistance(spot.distanceKm)}</div>
            </div>
          </div>
        `;
      }).join('');

      // 4. 카드 클릭 시 지도 위 마커도 함께 하이라이트 (호버 프리뷰용, 이동은 goToDetail이 담당)
      window.mapSelectEngine = function (index) {
        const target = validSpots[index];
        if (!target) return;
        document.querySelectorAll('.map-recommend-card').forEach(card => card.classList.remove('active'));
        const activeCard = document.getElementById(`map-card-${index}`);
        if (activeCard) activeCard.classList.add('active');
        infowindows.forEach(info => info.close());
        infowindows[index].open(map, markers[index]);
        map.panTo(new kakao.maps.LatLng(target.lat, target.lng));
      };
    });
  }

  // ── 마크다운 → HTML 변환 (콘텐츠가 이미 HTML이면 그대로 통과) ──
  function inlineMd(s) {
    return String(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  }
  function mdToHtml(raw) {
    if (!raw) return '';
    const text0 = String(raw);
    if (/<\/?(p|h[1-6]|ul|ol|li|div|blockquote|br)[\s>]/i.test(text0)) return text0; // 이미 HTML
    const text = text0.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\r/g, '\n').replace(/\r\n/g, '\n');
    const lines = text.split('\n');
    let html = '', inList = false, inQuote = false;
    const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };
    const closeQuote = () => { if (inQuote) { html += '</blockquote>'; inQuote = false; } };
    lines.forEach(line => {
      const l = line.trim();
      let m;
      if (!l) { closeList(); closeQuote(); return; }
      if ((m = l.match(/^>\s?(.*)$/))) { closeList(); if (!inQuote) { html += '<blockquote>'; inQuote = true; } html += `<p>${inlineMd(m[1])}</p>`; return; }
      closeQuote();
      if ((m = l.match(/^###\s+(.*)$/))) { closeList(); html += `<h3>${inlineMd(m[1])}</h3>`; return; }
      if ((m = l.match(/^##\s+(.*)$/))) { closeList(); html += `<h2>${inlineMd(m[1])}</h2>`; return; }
      if ((m = l.match(/^[*\-]\s+(.*)$/))) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${inlineMd(m[1])}</li>`; return; }
      closeList();
      html += `<p>${inlineMd(l)}</p>`;
    });
    closeList();
    closeQuote();
    return html;
  }

  // ── 상세 화면 ────────────────────────────────
  function openDetail(e, id) {
    e.preventDefault();
    history.pushState({id}, '', `play.html?id=${id}`);
    showDetail(id);
    window.scrollTo({top:0, behavior:'smooth'});
  }
  
  function showDetail(id) {
    const item = allItems.find(t => String(t.id) === String(id));
    currentItem = item;
    document.getElementById('listView').classList.add('hidden');
    document.getElementById('detailView').classList.remove('hidden');

    if (!item) {
      if (window.BTAnalytics) window.BTAnalytics.trackContentView('activity', id, '');
      document.getElementById('detailContent').innerHTML = `<div class="empty-state">${I18N.t('play.we_couldn_t_find_that')}</div>`;
      document.getElementById('actionBar').classList.add('hidden');
      return;
    }
    if (window.BTAnalytics) window.BTAnalytics.trackContentView('activity', item.id, item.name || item.title || '');
  
    const cat = item.category || '기타';
    const col = CAT_COLORS[cat] || CAT_COLORS['기타'];
    const emoji = item.emoji || CAT_EMOJI[cat] || '🎪';
    const related = allItems.filter(t => t.category === cat && t.id !== item.id).slice(0, 3);
  
    document.title = I18N.t('play.ailog_activities', {item: item.title || item.name});
  
    document.getElementById('detailContent').innerHTML = `
      <div class="detail-thumb-big" style="background:${col.bg}">${emoji}</div>
      <span class="detail-cat-badge" style="background:${col.bg};color:${col.color}">${CAT_EMOJI[cat]||'🎪'} ${I18N.d('cat',cat)}</span>
      <h1 class="detail-title">${item.title || item.name}</h1>
      <div class="detail-meta">
        ${item.age ? `<span class="meta-chip">👶 ${fmtAge(item.age)}</span>` : ''}
        ${item.location ? `<span class="meta-chip">📍 ${item.location}</span>` : ''}
        ${(() => {
          const sale = getSalePrice(item);
          if (sale === null) return '';
          const orig = Number(item.price) || 0;
          const hasDiscount = item.discount !== undefined && item.discount !== null && item.discount !== '' && orig > sale;
          const pct = hasDiscount ? discountPct(orig, sale) : 0;
          return `<span class="meta-chip">💰 ${pct > 0 ? `<span class="discount-pct">${pct}%</span>` : ''}${hasDiscount ? `<s>${fmtPrice(orig)}</s> ` : ''}${fmtPrice(sale)}</span>`;
        })()}
      </div>
      <div class="detail-content">${mdToHtml(item.content) || `<p>${item.summary || I18N.t('play.no_detailed_information_yet')}</p>`}</div>
      ${item.tags ? `<div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid var(--gray-100);">
        ${item.tags.split(',').map(t=>`<span style="padding:4px 12px;border-radius:99px;background:var(--gray-50);border:1px solid var(--gray-100);font-size:12px;color:var(--text-muted);">#${t.trim()}</span>`).join('')}
      </div>` : ''}
      <div id="commentsRoot"></div>
      ${related.length ? `<div class="related-section">
        <h3>${I18N.t('play.similar_activities')}</h3>
        <div class="related-grid">${related.map(playCardHTML).join('')}</div>
      </div>` : ''}
    `;

    if (window.NoriyaComments) window.NoriyaComments.mount('commentsRoot', 'play-' + item.id);
  
    // 액션 바 설정
    const actionBar = document.getElementById('actionBar');
    actionBar.classList.remove('hidden');
    updateHeartBtn(item.id);
  
    const bookBtn = document.getElementById('bookBtn');
    if (item.link) {
      bookBtn.href = item.link;
      bookBtn.classList.remove('disabled');
      bookBtn.onclick = null;
    } else {
      bookBtn.href = '#';
      bookBtn.classList.add('disabled');
      bookBtn.onclick = (e) => { e.preventDefault(); alert(I18N.t('play.there_s_no_booking_link')); };
    }
  }
  
  // ── 하트(찜) 기능 ─────────────────────────────
  function updateHeartBtn(id) {
    const btn = document.getElementById('heartBtn');
    const liked = likedIds.includes(String(id));
    btn.textContent = liked ? '❤️' : '🤍';
    btn.classList.toggle('liked', liked);
  }
  
  function toggleHeart() {
    if (!currentItem) return;
    const id = String(currentItem.id);
    const idx = likedIds.indexOf(id);
    if (idx === -1) likedIds.push(id);
    else likedIds.splice(idx, 1);
    localStorage.setItem('playLikes', JSON.stringify(likedIds));
    updateHeartBtn(id);
  }
  
  // ── 뒤로가기 처리 ─────────────────────────────
  window.addEventListener('popstate', () => {
    const id = new URLSearchParams(location.search).get('id');
    if (id) showDetail(id);
    else showList();
  });
  
  init();
  
