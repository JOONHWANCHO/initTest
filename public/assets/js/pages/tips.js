/**
 * 페이지 스크립트 — tips.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
// ══════════════════════════════════════════
// ▼▼▼ 여기에 구글 Apps Script 웹앱 URL 입력 ▼▼▼
const SHEET_JSON_URL = (typeof CONFIG !== 'undefined') ? CONFIG.SHEET_JSON_URL : '';
// ▲▲▲ 예: 'https://script.google.com/macros/s/AKfy.../exec'
// ══════════════════════════════════════════

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
let filteredTips = [];
let displayCount = 12;
let currentCat = '전체';

// ── 샘플 데이터 (구글 시트 연결 전 미리보기용) ──
function getSampleTips() {
  return [
    {id:'s1',category:'수면',emoji:'😴',title:I18N.t('common.real_reason_baby_wakes_up'),summary:I18N.t('common.waking_end_sleep_cycle_normal'),tags:I18N.t('tips.sleep_newborn_night_feeding'),date:'2026-01-10',
     content:`<h2>${I18N.t('tips.what_baby_sleep_cycle')}</h2><p>${I18N.t('tips.baby_s_sleep_cycle_45')}</p><h2>${I18N.t('tips.why_babies_wake_often_night')}</h2><ul><li>${I18N.t('tips.hunger_newborns_4_months_have')}</li><li>${I18N.t('tips.sleep_associations_if_they_get')}</li><li>${I18N.t('tips.environment_changes_they_react_sensiti')}</li><li>${I18N.t('tips.developmental_leaps_sleep_regressions')}</li></ul><blockquote>${I18N.t('tips.sleep_regression_sign_that_development')}</blockquote><h2>${I18N.t('tips.practical_tips')}</h2><ul><li>${I18N.t('tips.gradually_change_conditions_falling_as')}</li><li>${I18N.t('tips.block_light_blackout_curtains_use')}</li><li>${I18N.t('tips.even_if_they_wake_wait')}</li><li>${I18N.t('tips.keep_naps_regular_prevent_overtirednes')}</li></ul><div class="tip-box">${I18N.t('tips.tip_if_do_bedtime_routine')}</div>`},
    {id:'s2',category:'이유식',emoji:'🥦',title:I18N.t('common.complete_guide_freezing_baby_food'),summary:I18N.t('common.how_long_keeps_plus_how'),tags:I18N.t('tips.weaning_freezing_storage'),date:'2026-01-15',
     content:`<h2>${I18N.t('tips.how_long_freeze_baby_food')}</h2><p>${I18N.t('tips.prepared_baby_food_keeps_24')}</p><h2>${I18N.t('tips.right_way_freeze')}</h2><ul><li>${I18N.t('tips.portion_into_single_servings_silicone')}</li><li>${I18N.t('tips.freeze_only_after_has_fully')}</li><li>${I18N.t('tips.writing_date_contents_label_makes')}</li><li>${I18N.t('tips.s_best_freeze_within_24')}</li></ul><div class="warn-box">${I18N.t('tips.never_refreeze_baby_food_that')}</div><h2>${I18N.t('tips.safe_ways_thaw')}</h2><ul><li>${I18N.t('tips.fridge_thawing_moving_fridge_night')}</li><li>${I18N.t('tips.water_bath_thawing_place_container')}</li><li>${I18N.t('tips.microwave_heat_briefly_then_stir')}</li></ul><blockquote>${I18N.t('tips.throw_away_any_leftover_thawed')}</blockquote>`},
    {id:'s3',category:'건강',emoji:'🌡️',title:I18N.t('common.febrile_seizures_stay_calm_do'),summary:I18N.t('common.what_parents_should_shouldn_t'),tags:I18N.t('tips.health_seizure_fever'),date:'2026-01-20',
     content:`<h2>${I18N.t('tips.what_febrile_seizure')}</h2><p>${I18N.t('tips.febrile_seizure_happens_when_brain')}</p><h2>${I18N.t('tips.what_do_during_seizure')}</h2><ul><li>${I18N.t('tips.lay_child_floor_clear_away')}</li><li>${I18N.t('tips.turn_their_head_side_so')}</li><li>${I18N.t('tips.note_time_keep_track_how')}</li><li>${I18N.t('tips.if_possible_take_video_helps')}</li></ul><div class="warn-box">${I18N.t('tips.never_do_this_don_t')}</div><h2>${I18N.t('tips.when_call_119')}</h2><ul><li>${I18N.t('tips.seizure_lasts_5_minutes_more')}</li><li>${I18N.t('tips.seizure_stops_then_starts_again')}</li><li>${I18N.t('tips.child_doesn_t_regain_consciousness')}</li><li>${I18N.t('tips.baby_under_6_months_old')}</li></ul>`},
    {id:'s4',category:'발달',emoji:'🗣️',title:I18N.t('common.slow_language_development_when_should'),summary:I18N.t('common.language_milestones_by_age_signs'),tags:I18N.t('tips.development_language_late_talker'),date:'2026-01-25',
     content:`<h2>${I18N.t('tips.language_milestones_by_age')}</h2><ul><li>${I18N.t('tips.6_months_begins_babbling_responds')}</li><li>${I18N.t('tips.12_months_1_2_meaningful')}</li><li>${I18N.t('tips.18_months_10_words_points')}</li><li>${I18N.t('tips.24_months_two_word_combinations')}</li><li>${I18N.t('tips.36_months_three_word_sentences')}</li></ul><h2>${I18N.t('tips.signs_should_consult_specialist')}</h2><ul><li>${I18N.t('tips.12_months_no_babbling_no')}</li><li>${I18N.t('tips.16_months_not_single_meaningful')}</li><li>${I18N.t('tips.24_months_no_two_word')}</li><li>${I18N.t('tips.any_age_losing_words_they')}</li></ul><blockquote>${I18N.t('tips.language_development_varies_lot_betwee')}</blockquote><div class="tip-box">${I18N.t('tips.ways_support_language_development_read')}</div>`},
    {id:'s5',category:'이유식',emoji:'🐟',title:I18N.t('common.fish_baby_food_when_how'),summary:I18N.t('common.why_start_white_fish_plus'),tags:I18N.t('tips.weaning_fish_protein'),date:'2026-02-01',
     content:`<h2>${I18N.t('tips.when_start_fish')}</h2><p>${I18N.t('tips.white_fish_cod_flounder_pollock')}</p><h2>${I18N.t('tips.when_introduce_each_type')}</h2><ul><li>${I18N.t('tips.white_fish_cod_flounder_pollock_2')}</li><li>${I18N.t('tips.salmon_from_late_weaning_9')}</li><li>${I18N.t('tips.blue_backed_fish_mackerel_saury')}</li><li>${I18N.t('tips.shrimp_shellfish_small_amounts_after')}</li></ul><div class="warn-box">${I18N.t('tips.don_t_give_raw_fish')}</div><h2>${I18N.t('tips.simple_fish_baby_food_recipe')}</h2><p><strong>${I18N.t('tips.cod_zucchini_porridge_7_months')}</strong></p><ul><li>${I18N.t('tips.ingredients_30g_soaked_rice_20g')}</li><li>${I18N.t('tips.steam_cod_over_boiling_water')}</li><li>${I18N.t('tips.boil_rice_water_150ml_then')}</li><li>${I18N.t('tips.blend_strain_adjust_consistency')}</li></ul>`},
    {id:'s6',category:'수면',emoji:'🌙',title:I18N.t('common.nap_refusal_phase_how_respond'),summary:I18N.t('common.how_keep_sleep_routine_going'),tags:I18N.t('tips.sleep_nap_18_months'),date:'2026-02-05',
     content:`<h2>${I18N.t('tips.when_does_nap_refusal_start')}</h2><p>${I18N.t('tips.many_children_start_refusing_naps')}</p><h2>${I18N.t('tips.causes_nap_refusal')}</h2><ul><li>${I18N.t('tips.more_activity_keeps_them_wound')}</li><li>${I18N.t('tips.growing_independence_shows_up_as')}</li><li>${I18N.t('tips.nap_routine_has_fallen_apart')}</li></ul><h2>${I18N.t('tips.practical_tips')}</h2><ul><li>${I18N.t('tips.quiet_time_instead_forcing_sleep')}</li><li>${I18N.t('tips.move_nap_time_earlier_try')}</li><li>${I18N.t('tips.move_bedtime_earlier_days_without')}</li></ul><blockquote>${I18N.t('tips.children_fully_drop_naps_3')}</blockquote>`},
    {id:'s7',category:'지원금',emoji:'💰',title:I18N.t('common.5_government_parenting_benefits_ll'),summary:I18N.t('common.roundup_hidden_benefits_many_parents'),tags:I18N.t('tips.benefits_support_subsidy'),date:'2026-02-10',
     content:`<h2>${I18N.t('tips.5_easy_miss_parenting_benefits')}</h2><h3>${I18N.t('tips.1_postpartum_newborn_care_worker')}</h3><p>${I18N.t('tips.after_birth_care_worker_visits')}</p><h3>${I18N.t('tips.2_first_birth_support_payment')}</h3><p>${I18N.t('tips.local_governments_such_as_seoul')}</p><h3>${I18N.t('tips.3_pregnancy_birth_medical_voucher')}</h3><p>${I18N.t('tips.once_pregnancy_confirmed_get_national')}</p><h3>${I18N.t('tips.4_spouse_s_childbirth_leave')}</h3><p>${I18N.t('tips.when_spouse_gives_birth_can')}</p><h3>${I18N.t('tips.5_reduced_working_hours_parenting')}</h3><p>${I18N.t('tips.if_have_child_aged_8')}</p><div class="tip-box">${I18N.t('tips.try_welfare_service_simulation_bokjiro')}</div>`},
    {id:'s8',category:'임신',emoji:'🤰',title:I18N.t('common.complete_list_foods_avoid_during'),summary:I18N.t('common.list_foods_avoid_from_caffeine'),tags:I18N.t('tips.pregnancy_food_caution'),date:'2026-02-15',
     content:`<h2>${I18N.t('common.caffeine')}</h2><p>${I18N.t('tips.limit_200mg_less_per_day')}</p><h2>${I18N.t('tips.fish_high_mercury')}</h2><ul><li>${I18N.t('tips.avoid_shark_swordfish_large_mackerel')}</li><li>${I18N.t('tips.once_week_less_tuna_sashimi')}</li><li>${I18N.t('tips.fine_eat_freely_shrimp_squid')}</li></ul><h2>${I18N.t('tips.foods_not_eat_raw')}</h2><ul><li>${I18N.t('tips.raw_oysters_shellfish_raw_fish')}</li><li>${I18N.t('tips.soft_boiled_eggs_raw_eggs')}</li><li>${I18N.t('tips.raw_meat_p_t')}</li><li>${I18N.t('tips.unpasteurized_dairy_some_cheeses')}</li></ul><div class="warn-box">${I18N.t('tips.honey_safe_during_pregnancy_but')}</div><h2>${I18N.t('tips.herbal_medicine_supplements')}</h2><p>${I18N.t('tips.s_easy_think_s_natural')}</p>`},
  ];
}

// ── 초기화 ──
async function init() {
  const params = new URLSearchParams(location.search);
  const tipId = params.get('id');

  if (tipId) {
    await loadAllTips();
    showDetail(tipId);
  } else {
    await loadAllTips();
    showList();
  }
}

async function loadAllTips() {
  if (allTips.length) return; // 이미 로드됨

  if (!SHEET_JSON_URL) {
    allTips = getSampleTips();
    return;
  }

  try {
    const res = await fetch(SHEET_JSON_URL);
    if (!res.ok) throw new Error();
    const data = await res.json();
    allTips = I18N.localizeRecords(Array.isArray(data) ? data : (data.tips || []));
    if (!allTips.length) throw new Error();
  } catch {
    allTips = getSampleTips();
    // 실제 URL인데 실패한 경우만 안내
    if (SHEET_JSON_URL) {
      console.warn(I18N.t('tips.failed_load_google_sheet_showing'));
    }
  }
}

// ── 목록 화면 ──
function showList(e) {
  if (e) e.preventDefault();
  history.pushState({}, '', 'tips.html');
  document.getElementById('listView').classList.remove('hidden');
  document.getElementById('detailView').classList.add('hidden');
  document.title = I18N.t('tips.parenting_tips_collection_ailog');
  if (window.BTAnalytics) window.BTAnalytics.trackContentView('', '', '');

  if (!SHEET_JSON_URL) {
    document.getElementById('setupGuide').classList.remove('hidden');
  }

  renderCatFilter();
  renderGrid(currentCat);
}

function renderCatFilter() {
  const cats = ['전체', ...new Set(allTips.map(t => t.category || '기타'))];
  document.getElementById('catFilter').innerHTML = cats.map((c, i) =>
    `<button class="cf-btn${i===0&&currentCat==='전체'?' active':c===currentCat?' active':''}" onclick="changeCat('${c}',this)">
      ${CAT_EMOJI[c]||'📌'} ${I18N.d('cat',c)}
    </button>`
  ).join('');
}

function changeCat(cat, btn) {
  currentCat = cat;
  displayCount = 12;
  document.querySelectorAll('.cf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGrid(cat);
}

function renderGrid(cat) {
  filteredTips = cat === '전체' ? allTips : allTips.filter(t => t.category === cat);
  const slice = filteredTips.slice(0, displayCount);
  const grid = document.getElementById('listGrid');

  if (!slice.length) {
    grid.innerHTML = `<div class="empty-state">${I18N.t('tips.there_no_tips_this_category')}</div>`;
    document.getElementById('loadMoreBtn').classList.add('hidden');
    return;
  }

  grid.innerHTML = `<div class="tips-grid">${slice.map(tip => tipCardHTML(tip)).join('')}</div>`;
  const btn = document.getElementById('loadMoreBtn');
  filteredTips.length > displayCount ? btn.classList.remove('hidden') : btn.classList.add('hidden');
}

function readTimeLabel(tip) {
  const chars = (tip.content || tip.summary || '').replace(/<[^>]*>/g, '').length;
  const mins = Math.max(1, Math.round(chars / 500));
  return I18N.t('tips.min_read', {mins});
}

function tipCardHTML(tip) {
  const cat = tip.category || '기타';
  const col = CAT_COLORS[cat] || CAT_COLORS['기타'];
  const emoji = tip.emoji || CAT_EMOJI[cat] || '💡';
  return `<a href="tips.html?id=${tip.id}" class="tip-card" onclick="openDetail(event,'${tip.id}')">
    <div class="tip-thumb" style="background:${col.bg}">${emoji}</div>
    <div class="tip-body">
      <div class="tip-cat" style="color:${col.color}">${I18N.d('cat',cat)}</div>
      <div class="tip-title">${tip.title}</div>
      <div class="tip-summary">${tip.summary || ''}</div>
      <div class="tip-date">${readTimeLabel(tip)}${tip.date ? ' · ' + tip.date : ''}</div>
    </div>
  </a>`;
}

function loadMore() {
  displayCount += 12;
  renderGrid(currentCat);
}

// ── 상세 화면 ──
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

function openDetail(e, id) {
  e.preventDefault();
  history.pushState({id}, '', `tips.html?id=${id}`);
  showDetail(id);
  window.scrollTo({top:0, behavior:'smooth'});
}

function showDetail(id) {
  const tip = allTips.find(t => String(t.id) === String(id));
  document.getElementById('listView').classList.add('hidden');
  document.getElementById('detailView').classList.remove('hidden');

  if (!tip) {
    document.getElementById('detailContent').innerHTML = `<div class="empty-state">${I18N.t('tips.we_couldn_t_find_that')}</div>`;
    return;
  }

  const cat = tip.category || '기타';
  const col = CAT_COLORS[cat] || CAT_COLORS['기타'];
  const tags = tip.tags ? tip.tags.split(',').map(t => t.trim()) : [];

  // 관련 꿀팁 (같은 카테고리, 자기 자신 제외, 최대 3개)
  const related = allTips.filter(t => t.category === cat && t.id !== tip.id).slice(0, 3);

  document.title = I18N.t('tips.ailog_tips', {title: tip.title});
  if (window.BTAnalytics) window.BTAnalytics.trackContentView('tip', tip.id, tip.title);
  document.getElementById('detailContent').innerHTML = `
    <span class="detail-cat-badge" style="background:${col.bg};color:${col.color}">
      ${CAT_EMOJI[cat]||'💡'} ${I18N.d('cat',cat)}
    </span>
    <h1 class="detail-title">${tip.emoji||''} ${tip.title}</h1>
    <div class="detail-meta">
      <span>${tip.date || ''}</span>
      ${tip.summary ? `<span style="color:var(--gray-200)">|</span><span>${tip.summary}</span>` : ''}
    </div>
    <div class="detail-content">${mdToHtml(tip.content) || `<p>${I18N.t('tips.there_s_no_content')}</p>`}</div>
    ${tags.length ? `<div class="detail-tags">${tags.map(t=>`<span class="tag-chip">#${t}</span>`).join('')}</div>` : ''}
    <div id="commentsRoot"></div>
    ${related.length ? `
    <div class="related-section">
      <h3>${I18N.t('tips.related_tips')}</h3>
      <div class="related-grid">${related.map(t=>tipCardHTML(t)).join('')}</div>
    </div>` : ''}
  `;

  if (window.NoriyaComments) window.NoriyaComments.mount('commentsRoot', 'tip-' + tip.id);
}

// 브라우저 뒤로가기 처리
window.addEventListener('popstate', (e) => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (id) showDetail(id);
  else showList();
});

init();
