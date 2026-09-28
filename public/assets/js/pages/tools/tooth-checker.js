/**
 * 페이지 스크립트 — tools/tooth-checker.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
// 치아 정보: [이름, 상악 평균 개월, 하악 평균 개월]
const TEETH = [
  {name:I18N.t('tooth-checker.central_incisor'),upper:10,lower:8,emoji:'🦷'},
  {name:I18N.t('tooth-checker.lateral_incisor'),upper:11,lower:13,emoji:'🦷'},
  {name:I18N.t('tooth-checker.canine'),upper:19,lower:20,emoji:'🦷'},
  {name:I18N.t('tooth-checker.first_molar'),upper:16,lower:16,emoji:'🦷'},
  {name:I18N.t('tooth-checker.second_molar'),upper:29,lower:27,emoji:'🦷'},
];

const months=[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,20,22,24,28,32,36];
const labels={4:I18N.t('common.4_months'),5:I18N.t('common.5_months'),6:I18N.t('common.6_months'),7:I18N.t('common.7_months'),8:I18N.t('common.8_months'),9:I18N.t('common.9_months'),10:I18N.t('common.10_months'),11:I18N.t('common.11_months'),12:I18N.t('tooth-checker.12_months'),13:I18N.t('common.13_months'),14:I18N.t('common.14_months'),15:I18N.t('common.15_months'),16:I18N.t('common.16_months'),17:I18N.t('common.17_months'),18:I18N.t('common.18_months'),20:I18N.t('tooth-checker.20_months'),22:I18N.t('tooth-checker.22_months'),24:I18N.t('tooth-checker.24_months'),28:I18N.t('tooth-checker.28_months'),32:I18N.t('tooth-checker.32_months'),36:I18N.t('tooth-checker.36_months')};

const c=document.getElementById('monthBtns');
months.forEach(m=>{
  const b=document.createElement('button');
  b.className='pill-btn';b.textContent=labels[m];b.dataset.m=m;
  b.onclick=()=>{document.querySelectorAll('#monthBtns .pill-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(m);};
  c.appendChild(b);
});

function render(m){
  const upper=document.getElementById('upperTeeth');
  const lower=document.getElementById('lowerTeeth');
  // 좌우 대칭 5개씩 → 10개
  upper.innerHTML=[...TEETH].reverse().concat(TEETH).map((t,i)=>{
    const side=i<5?'R':'L';
    const status=m>t.upper+3?'erupted':m>=t.upper-2?'current':'';
    return `<div class="tooth-box ${status}">${t.emoji}<div class="tn">${t.name}</div></div>`;
  }).join('');
  lower.innerHTML=[...TEETH].reverse().concat(TEETH).map((t,i)=>{
    const status=m>t.lower+3?'erupted':m>=t.lower-2?'current':'';
    return `<div class="tooth-box ${status}">${t.emoji}<div class="tn">${t.name}</div></div>`;
  }).join('');

  const currentTeeth=TEETH.filter(t=>m>=t.upper-2&&m<=t.upper+3||m>=t.lower-2&&m<=t.lower+3);
  const totalErupted=TEETH.filter(t=>m>t.upper+3).length*2+TEETH.filter(t=>m>t.lower+3).length*2;
  const infoEl=document.getElementById('currentInfo');
  if(currentTeeth.length){
    infoEl.innerHTML=`<div class="result-label">${I18N.t('tooth-checker.teeth_coming_around_this_age')}</div>
      <div style="font-size:1.1rem;font-weight:800;color:#7A5710;margin-bottom:4px;">${currentTeeth.map(t=>t.name).join(', ')}</div>
      <div class="result-sub">${I18N.t('tooth-checker.teeth_so_far_about_20', {totalErupted})}</div>`;
  } else {
    infoEl.innerHTML=`<div class="result-label">${I18N.t('tooth-checker.tooth_status')}</div>
      <div style="font-size:14px;font-weight:700;color:#7A5710;">${I18N.t('tooth-checker.s_break_from_teething_right')}</div>
      <div class="result-sub">${I18N.t('tooth-checker.teeth_so_far_about_20', {totalErupted})}</div>`;
  }
  document.getElementById('result').classList.remove('hidden');
}
