/**
 * 페이지 스크립트 — tools/milestone-checker.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
const MILESTONES = {
  2: {
    '🏃 운동 발달': [I18N.t('milestone-checker.can_briefly_lift_head_when'),I18N.t('milestone-checker.follows_objects_eyes'),I18N.t('milestone-checker.stretches_out_arms_legs')],
    '🗣️ 언어·소통': [I18N.t('milestone-checker.responds_voices'),I18N.t('milestone-checker.makes_sounds_cooing'),I18N.t('milestone-checker.has_variety_cries')],
    '👥 사회성': [I18N.t('milestone-checker.smiles_when_seeing_faces'),I18N.t('milestone-checker.makes_eye_contact')],
    '🧠 인지': [I18N.t('milestone-checker.shifts_gaze_follow_light_movement'),I18N.t('milestone-checker.responds_play_stimulation')]
  },
  4: {
    '🏃 운동 발달': [I18N.t('milestone-checker.lifts_head_chest_when_tummy'),I18N.t('milestone-checker.holds_head_steady'),I18N.t('milestone-checker.brings_hands_mouth'),I18N.t('milestone-checker.kicks_feet')],
    '🗣️ 언어·소통': [I18N.t('milestone-checker.babbles'),I18N.t('milestone-checker.takes_turns_making_sounds_conversation'),I18N.t('milestone-checker.laughs_out_loud')],
    '👥 사회성': [I18N.t('milestone-checker.recognizes_parents'),I18N.t('milestone-checker.reacts_differently_strangers'),I18N.t('milestone-checker.shows_interest_people_s_faces')],
    '🧠 인지': [I18N.t('milestone-checker.looks_interesting_objects_long_time'),I18N.t('milestone-checker.starts_understand_cause_effect')]
  },
  6: {
    '🏃 운동 발달': [I18N.t('milestone-checker.sits_briefly_without_help'),I18N.t('milestone-checker.scoots_tummy_belly_crawl'),I18N.t('milestone-checker.picks_up_objects_both_hands'),I18N.t('milestone-checker.passes_objects_from_one_hand')],
    '🗣️ 언어·소통': [I18N.t('milestone-checker.makes_consonant_sounds_ba_ma'),I18N.t('milestone-checker.responds_own_name'),I18N.t('milestone-checker.varies_pitch_voice')],
    '👥 사회성': [I18N.t('milestone-checker.starts_showing_stranger_anxiety'),I18N.t('milestone-checker.reacts_self_mirror'),I18N.t('milestone-checker.reaches_out_favorite_people')],
    '🧠 인지': [I18N.t('milestone-checker.explores_objects_mouth'),I18N.t('milestone-checker.looks_dropped_objects'),I18N.t('milestone-checker.shows_interest_cause_effect_toys')]
  },
  9: {
    '🏃 운동 발달': [I18N.t('milestone-checker.can_sit_alone'),I18N.t('milestone-checker.crawls'),I18N.t('milestone-checker.tries_pull_up_stand'),I18N.t('milestone-checker.picks_up_index_finger_thumb')],
    '🗣️ 언어·소통': [I18N.t('milestone-checker.says_words_like_mama_dada'),I18N.t('milestone-checker.understands_gestures_bye_bye'),I18N.t('milestone-checker.responds_speech')],
    '👥 사회성': [I18N.t('milestone-checker.afraid_strangers'),I18N.t('milestone-checker.has_favorite_toys_people'),I18N.t('milestone-checker.enjoys_peekaboo')],
    '🧠 인지': [I18N.t('milestone-checker.knows_object_still_exists_when'),I18N.t('milestone-checker.imitates_actions'),I18N.t('milestone-checker.takes_objects_out_cup')]
  },
  12: {
    '🏃 운동 발달': [I18N.t('milestone-checker.stands_alone'),I18N.t('milestone-checker.walks_alone_while_holding'),I18N.t('milestone-checker.crawls_up_stairs'),I18N.t('milestone-checker.puts_objects_out_container')],
    '🗣️ 언어·소통': [I18N.t('milestone-checker.says_least_1_meaningful_word'),I18N.t('milestone-checker.calls_mama_dada_distinctly'),I18N.t('milestone-checker.points_gestures_what_they_want')],
    '👥 사회성': [I18N.t('milestone-checker.cries_when_attachment_figure_leaves'),I18N.t('milestone-checker.shows_interest_other_children'),I18N.t('milestone-checker.copies_adults_actions')],
    '🧠 인지': [I18N.t('milestone-checker.likes_turning_book_pages'),I18N.t('milestone-checker.uses_objects_properly_like_combing'),I18N.t('milestone-checker.follows_simple_instructions_give_me')]
  },
  18: {
    '🏃 운동 발달': [I18N.t('milestone-checker.walks_well_alone'),I18N.t('milestone-checker.starts_run'),I18N.t('milestone-checker.climbs_stairs_holding_hand'),I18N.t('milestone-checker.feeds_self_spoon')],
    '🗣️ 언어·소통': [I18N.t('milestone-checker.says_10_more_words'),I18N.t('milestone-checker.points_body_parts'),I18N.t('milestone-checker.starts_combining_two_words')],
    '👥 사회성': [I18N.t('milestone-checker.plays_alone_but_wants_play'),I18N.t('milestone-checker.shows_empathy'),I18N.t('milestone-checker.has_separation_anxiety')],
    '🧠 인지': [I18N.t('milestone-checker.plays_pretend'),I18N.t('milestone-checker.points_objects_picture_books'),I18N.t('milestone-checker.completes_simple_puzzles')]
  },
  24: {
    '🏃 운동 발달': [I18N.t('milestone-checker.runs_well'),I18N.t('milestone-checker.can_kick_ball'),I18N.t('milestone-checker.climbs_stairs_alone'),I18N.t('milestone-checker.draws_lines_pencil')],
    '🗣️ 언어·소통': [I18N.t('milestone-checker.speaks_two_word_sentences_mama'),I18N.t('milestone-checker.knows_own_name_age_gender'),I18N.t('milestone-checker.says_50_more_words')],
    '👥 사회성': [I18N.t('milestone-checker.plays_other_children'),I18N.t('milestone-checker.develops_idea_mine'),I18N.t('milestone-checker.expresses_variety_emotions')],
    '🧠 인지': [I18N.t('milestone-checker.plays_imaginative_games'),I18N.t('milestone-checker.follows_two_step_instructions'),I18N.t('milestone-checker.starts_sorting_by_color_shape')]
  }
};
const months = [2,4,6,9,12,18,24];
const labels = {2:I18N.t('common.2_months'),4:I18N.t('common.4_months'),6:I18N.t('common.6_months'),9:I18N.t('common.9_months'),12:I18N.t('common.12_months_1_yr'),18:I18N.t('common.18_months'),24:I18N.t('milestone-checker.24_months_2_yrs')};
let checkedItems = {};
let currentMonth = null;

function render(m){
  currentMonth = m;
  document.querySelectorAll('#monthBtns .pill-btn').forEach(b=>b.classList.toggle('active',parseInt(b.dataset.m)===m));
  const data = MILESTONES[m];
  if(!checkedItems[m]) checkedItems[m] = {};
  let html = '';
  let total = 0, checked = 0;
  for(const [cat, items] of Object.entries(data)){
    total += items.length;
    html += `<div class="milestone-group"><div class="mg-header"><span class="mg-icon">${cat.split(' ')[0]}</span><span class="mg-title">${I18N.d('domain', cat.split(' ').slice(1).join(' '))}</span><span class="mg-count" id="cat_${encodeURIComponent(cat)}_count"></span></div>`;
    items.forEach((item,i)=>{
      const key = `${m}_${cat}_${i}`;
      const isChecked = !!checkedItems[m][key];
      if(isChecked) checked++;
      html += `<div class="check-item${isChecked?' checked':''}" onclick="toggleItem('${key}','${m}','${encodeURIComponent(cat)}',${i})">
        <input type="checkbox" ${isChecked?'checked':''} onclick="event.stopPropagation()">
        <label>${item}</label>
      </div>`;
    });
    html += '</div>';
  }
  document.getElementById('milestoneContent').innerHTML = html;
  updateProgress(m, total, checked);
  document.getElementById('results').classList.remove('hidden');
}

function toggleItem(key, m, cat, i){
  checkedItems[m] = checkedItems[m] || {};
  checkedItems[m][key] = !checkedItems[m][key];
  render(parseInt(m));
}

function updateProgress(m, total, checked){
  const pct = total ? Math.round(checked/total*100) : 0;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressText').textContent = I18N.t('milestone-checker.items_checked', {checked, total, pct});
  document.getElementById('concernBox').style.display = (pct < 50 && checked > 0) ? 'block' : 'none';
}

const c = document.getElementById('monthBtns');
months.forEach(m=>{
  const b = document.createElement('button');
  b.className = 'pill-btn';
  b.textContent = labels[m];
  b.dataset.m = m;
  b.onclick = ()=>render(m);
  c.appendChild(b);
});
