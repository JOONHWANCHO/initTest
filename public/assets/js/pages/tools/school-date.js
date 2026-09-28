/**
 * 페이지 스크립트 — tools/school-date.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
document.getElementById('birthDate').max = new Date().toISOString().split('T')[0];

function diffDays(a, b){ return Math.round((b-a)/(1000*60*60*24)); }
function addMonths(d, m){ const r=new Date(d); r.setMonth(r.getMonth()+m); return r; }
function fmtDate(d){ return d.toLocaleDateString(I18N.locale,{year:'numeric',month:'long',day:'numeric'}); }
function fmtYM(d){ const now=new Date(); const months=Math.floor((now-d)/1000/60/60/24/30.44); return months>=12?I18N.t('school-date.y_m', {floor: Math.floor(months/12), months: months%12}):I18N.t('school-date.months', {months}); }

function calculate(){
  const bv = document.getElementById('birthDate').value;
  if(!bv){alert(I18N.t('common.please_enter_birth_date'));return;}
  const birth = new Date(bv);
  const now = new Date();
  const ageMonths = Math.floor((now-birth)/1000/60/60/24/30.44);
  const ageYears = Math.floor(ageMonths/12);

  document.getElementById('currentAge').innerHTML = `
    <div class="result-label">${I18N.t('school-date.current_age')}</div>
    <div class="result-value" style="font-size:1.5rem;">${ageYears > 0 ? I18N.t('school-date.y_m_2', {ageYears, ageMonths: (ageMonths%12)}) : I18N.t('school-date.months_2', {ageMonths})}</div>
    <div class="result-sub">${I18N.t('school-date.birth_date', {fmtDate: fmtDate(birth)})}</div>`;

  // 어린이집 만 0세반: 생후 6개월부터 입소 가능
  const creche0 = addMonths(birth, 6);
  // 어린이집 만 1세반: 만 1세 되는 날
  const creche1 = new Date(birth.getFullYear()+1, birth.getMonth(), birth.getDate());
  // 어린이집 만 2세반
  const creche2 = new Date(birth.getFullYear()+2, birth.getMonth(), birth.getDate());
  // 어린이집 만 3세반
  const creche3 = new Date(birth.getFullYear()+3, birth.getMonth(), birth.getDate());
  // 유치원: 만 3세 (생일이 속한 해의 3월 1일)
  const kinder3yr = birth.getFullYear() + 3;
  const kinder = new Date(kinder3yr, 2, 1); // March 1
  // 초등학교: 만 6세 되는 해의 3월 1일
  const elemYr = birth.getFullYear() + 6 + (birth.getMonth() >= 3 ? 1 : 0); // 4월생부터 +1
  // 실제 초등 기준: 해당 연도 1월1일~12월31일생 → 다음해 3월 입학
  // 정확 기준: 만 6세 도달하는 해의 이듬해 3월
  const birthYear = birth.getFullYear();
  const elemEnterYear = birthYear + 7; // 대략 생년+7 = 초등입학년도 (3월2일 이후 출생 기준 보정 필요)
  // 정확: 3월2일 이후 출생이면 +1년
  const birthMD = birth.getMonth()*100+birth.getDate();
  const exactElemYear = (birthMD > 301) ? birthYear+7 : birthYear+6; // 3월2일 이후면 +7
  const elementary = new Date(exactElemYear, 2, 1);

  function dDayLabel(date){
    const diff = diffDays(now, date);
    if(diff < 0) return {text:I18N.t('school-date.reached_days_ago', {abs: Math.abs(diff)}), cls:'badge-past'};
    if(diff === 0) return {text:I18N.t('school-date.today'), cls:'badge-now'};
    return {text:`D-${diff}`, cls:'badge-future'};
  }

  const cards = [
    {label:I18N.t('school-date.eligible_daycare_age_0_class'), value: fmtDate(creche0), sub:I18N.t('school-date.admission_possible_after_6_months'), date: creche0},
    {label:I18N.t('school-date.eligible_daycare_age_1_class'), value: fmtDate(creche1), sub:I18N.t('school-date.age_1_by_birthday'), date: creche1},
    {label:I18N.t('school-date.eligible_daycare_age_2_class'), value: fmtDate(creche2), sub:I18N.t('school-date.age_2_by_birthday'), date: creche2},
    {label:I18N.t('school-date.eligible_daycare_age_3_class'), value: fmtDate(creche3), sub:I18N.t('school-date.age_3_kindergarten_admission_also'), date: creche3},
    {label:I18N.t('school-date.eligible_kindergarten_age_3'), value: I18N.t('school-date.march_1', {kinder3yr}), sub:I18N.t('school-date.based_age_3_applications_open', {kinder3yr}), date: kinder},
    {label:I18N.t('school-date.expected_elementary_school_entry_year'), value: I18N.t('school-date.march', {exactElemYear}), sub:I18N.t('school-date.school_enrollment_notices_expected_be', {exactElemYear: exactElemYear-1}), date: elementary},
  ];

  document.getElementById('dateCards').innerHTML = cards.map(c=>{
    const dd = dDayLabel(c.date);
    const isPast = diffDays(now, c.date) < 0;
    return `<div class="date-result-card${!isPast?' highlight':''}">
      <div class="drc-label${!isPast?' green':''}">${c.label}</div>
      <div class="drc-value">${c.value}</div>
      <div class="drc-sub">${c.sub}</div>
      <span class="dday-badge ${dd.cls}">${dd.text}</span>
    </div>`;
  }).join('');

  document.getElementById('results').classList.remove('hidden');
}
