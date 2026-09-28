/**
 * 페이지 스크립트 — tools/pregnancy-week.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
const FETAL = {
  4:{emoji:'🌱',size:'0.1cm',label:I18N.t('pregnancy-week.size_poppy_seed'),desc:I18N.t('pregnancy-week.implantation_complete_embryo_begins_fo')},
  5:{emoji:'🫐',size:'0.2cm',label:I18N.t('pregnancy-week.smaller_than_blueberry'),desc:I18N.t('pregnancy-week.heart_starts_beating_brain_spinal')},
  6:{emoji:'🫘',size:'0.6cm',label:I18N.t('pregnancy-week.size_kidney_bean'),desc:I18N.t('pregnancy-week.limb_buds_appear_facial_structures')},
  7:{emoji:'🫐',size:'1cm',label:I18N.t('pregnancy-week.size_blueberry'),desc:I18N.t('pregnancy-week.fingers_toes_begin_separate_brain')},
  8:{emoji:'🍇',size:'1.6cm',label:I18N.t('pregnancy-week.size_grape'),desc:I18N.t('pregnancy-week.all_major_organs_forming_movement')},
  9:{emoji:'🍒',size:'2.3cm',label:I18N.t('pregnancy-week.size_cherry'),desc:I18N.t('pregnancy-week.now_called_fetus_fingers_fully')},
  10:{emoji:'🍓',size:'3.1cm',label:I18N.t('pregnancy-week.size_strawberry'),desc:I18N.t('pregnancy-week.nails_grow_forehead_develops_swallowin')},
  11:{emoji:'🫑',size:'4.1cm',label:I18N.t('pregnancy-week.size_small_bell_pepper'),desc:I18N.t('pregnancy-week.genitals_begin_be_distinguishable_all')},
  12:{emoji:'🍋',size:'5.4cm',label:I18N.t('pregnancy-week.size_lime'),desc:I18N.t('pregnancy-week.first_trimester_complete_most_organs')},
  14:{emoji:'🍑',size:'8.7cm',label:I18N.t('pregnancy-week.size_peach'),desc:I18N.t('pregnancy-week.facial_muscles_develop_hair_begins')},
  16:{emoji:'🥑',size:'11.6cm',label:I18N.t('pregnancy-week.size_avocado'),desc:I18N.t('pregnancy-week.may_start_feel_baby_s')},
  20:{emoji:'🍌',size:'16.5cm',label:I18N.t('pregnancy-week.size_banana'),desc:I18N.t('pregnancy-week.gender_can_be_confirmed_detailed')},
  24:{emoji:'🌽',size:'21cm',label:I18N.t('pregnancy-week.size_ear_corn'),desc:I18N.t('pregnancy-week.viable_gestational_age_eyes_begin')},
  28:{emoji:'🥦',size:'25cm',label:I18N.t('pregnancy-week.size_head_broccoli'),desc:I18N.t('pregnancy-week.third_trimester_begins_baby_can')},
  32:{emoji:'🥥',size:'28cm',label:I18N.t('pregnancy-week.size_coconut'),desc:I18N.t('pregnancy-week.bones_begin_harden_fat_builds')},
  36:{emoji:'🎃',size:'33cm',label:I18N.t('pregnancy-week.size_small_pumpkin'),desc:I18N.t('pregnancy-week.lungs_nearly_mature_ready_birth')},
  40:{emoji:'👶',size:'51cm',label:I18N.t('pregnancy-week.due_date_2'),desc:I18N.t('pregnancy-week.baby_ready_come_out')}
};
const MILESTONES = [
  {week:4,text:I18N.t('pregnancy-week.pregnancy_confirmation_urine_test')},
  {week:6,text:I18N.t('pregnancy-week.first_ultrasound_check_heartbeat')},
  {week:10,text:I18N.t('pregnancy-week.first_trimester_screening_window')},
  {week:12,text:I18N.t('pregnancy-week.nuchal_translucency_test_down_syndrome')},
  {week:16,text:I18N.t('pregnancy-week.second_screening_quad_test')},
  {week:20,text:I18N.t('pregnancy-week.detailed_ultrasound_gender_can_be')},
  {week:24,text:I18N.t('pregnancy-week.gestational_diabetes_test_50g')},
  {week:28,text:I18N.t('pregnancy-week.anti_d_immunoglobulin_shot_rh')},
  {week:32,text:I18N.t('pregnancy-week.ultrasound_check_baby_s_weight')},
  {week:36,text:I18N.t('pregnancy-week.group_b_strep_test_gbs')},
  {week:38,text:I18N.t('pregnancy-week.delivery_prep_pack_hospital_bag')},
  {week:40,text:I18N.t('pregnancy-week.due_date')},
];

let calcTypeVal = 'lmp';
function setType(btn, type){
  document.querySelectorAll('#calcType .pill-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); calcTypeVal=type;
  document.getElementById('lmpInput').classList.toggle('hidden', type!=='lmp');
  document.getElementById('ultraInput').classList.toggle('hidden', type!=='ultrasound');
}

function addDays(d, n){const r=new Date(d);r.setDate(r.getDate()+n);return r;}
function fmtDate(d){return d.toLocaleDateString(I18N.locale,{year:'numeric',month:'long',day:'numeric',weekday:'short'});}

function calculate(){
  let conceptionBase;
  if(calcTypeVal==='lmp'){
    const lmp=document.getElementById('lmpDate').value;
    if(!lmp){alert(I18N.t('pregnancy-week.please_enter_date_last_period'));return;}
    conceptionBase=new Date(lmp);
  } else {
    const ud=document.getElementById('ultraDate').value;
    const uw=parseInt(document.getElementById('ultraWeek').value);
    if(!ud||!uw){alert(I18N.t('pregnancy-week.please_enter_ultrasound_date_weeks'));return;}
    conceptionBase=addDays(new Date(ud), -uw*7);
  }
  const now=new Date();
  const daysPassed=Math.floor((now-conceptionBase)/86400000);
  const weeksPassed=Math.floor(daysPassed/7);
  const dayExtra=daysPassed%7;
  const dueDate=addDays(conceptionBase, 280);
  const daysLeft=Math.floor((dueDate-now)/86400000);

  document.getElementById('currentWeek').textContent=I18N.t('pregnancy-week.weeks', {weeksPassed});
  document.getElementById('currentDays').textContent=I18N.t('pregnancy-week.day_days_total', {dayExtra, daysPassed});
  document.getElementById('dueDate').textContent=fmtDate(dueDate);
  document.getElementById('dueDays').textContent=daysLeft>0?`D-${daysLeft}`:(daysLeft===0?I18N.t('pregnancy-week.today_due_date'):I18N.t('pregnancy-week.due_date_days', {abs: Math.abs(daysLeft)}));

  let trimLabel='';
  if(weeksPassed<=12) trimLabel=I18N.t('pregnancy-week.1st_trimester_early_time_strong');
  else if(weeksPassed<=27) trimLabel=I18N.t('pregnancy-week.2nd_trimester_middle_can_feel');
  else trimLabel=I18N.t('pregnancy-week.3rd_trimester_late_time_start');
  document.getElementById('trimesterLabel').textContent=trimLabel;

  // fetal info — closest week key
  const fkeys=Object.keys(FETAL).map(Number).sort((a,b)=>a-b);
  let fk=fkeys[0];
  for(const k of fkeys){if(weeksPassed>=k) fk=k;}
  const fi=FETAL[fk];
  document.getElementById('fetalInfo').innerHTML=`
    <span class="fs-emoji">${fi.emoji}</span>
    <div class="fs-info"><div class="fs-size">${I18N.t('pregnancy-week.about', {size: fi.size})}</div><div class="fs-label">${fi.label}</div></div>`;
  document.getElementById('weeklyDesc').textContent=fi.desc;

  document.getElementById('milestoneList').innerHTML=MILESTONES.map(m=>{
    const done=weeksPassed>m.week;
    const current=weeksPassed===m.week;
    return `<li style="${current?'color:var(--primary-dark);font-weight:700;':done?'opacity:.5;text-decoration:line-through;':''}">
      <span class="mw">${I18N.t('pregnancy-week.week', {week: m.week})}</span><span>${current?'👉 '+m.text:m.text}</span></li>`;
  }).join('');

  document.getElementById('results').classList.remove('hidden');
}
const today=new Date().toISOString().split('T')[0];
document.getElementById('lmpDate').max=today;
document.getElementById('ultraDate').max=today;
