/**
 * 페이지 스크립트 — tools/fever-medicine.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
const timers = {};
function calculate(){
  const w = parseFloat(document.getElementById('weight').value);
  const m = parseInt(document.getElementById('ageMonth').value);
  if(!w||w<3){alert(I18N.t('fever-medicine.please_enter_valid_weight'));return;}
  // 타이레놀: 10~15mg/kg, 160mg/5ml → 5ml당 160mg
  const tMin = Math.round(w*10/160*5*10)/10;
  const tMax = Math.round(w*15/160*5*10)/10;
  const tDose = Math.round((tMin+tMax)/2*10)/10;
  document.getElementById('tylenolMl').textContent = tDose;
  document.getElementById('tylenolRange').textContent = I18N.t('fever-medicine.recommended_range_ml_10_15mg', {tMin, tMax});
  // 부루펜: 5~10mg/kg, 100mg/5ml
  const bMin = Math.round(w*5/100*5*10)/10;
  const bMax = Math.round(w*10/100*5*10)/10;
  const bDose = Math.round((bMin+bMax)/2*10)/10;
  document.getElementById('brufenMl').textContent = m>=6 ? bDose : '—';
  document.getElementById('brufenRange').textContent = m>=6
    ? I18N.t('fever-medicine.recommended_range_ml_5_10mg', {bMin, bMax})
    : I18N.t('fever-medicine.not_use_under_6_months');
  document.getElementById('results').classList.remove('hidden');
}
function startTimer(type){
  const id = type;
  if(timers[id]) clearInterval(timers[id]);
  const start = Date.now();
  const intervalMin = type==='T' ? 240 : 360; // 4h or 6h in minutes
  const el = document.getElementById(type==='T'?'tTimer':'bTimer');
  const ring = document.getElementById(type==='T'?'tRing':'bRing');
  const ringText = document.getElementById(type==='T'?'tRingText':'bRingText');
  function tick(){
    const elapsed = Math.floor((Date.now()-start)/60000);
    const remaining = intervalMin - elapsed;
    if(remaining <= 0){
      clearInterval(timers[id]);
      el.textContent = I18N.t('fever-medicine.next_dose_available');
      el.style.color = 'var(--primary)';
      if(ring){ ring.style.setProperty('--pct',100); ring.classList.add('done'); }
      if(ringText) ringText.innerHTML = I18N.t('fever-medicine.done');
    } else {
      const h = Math.floor(remaining/60), m = remaining%60;
      el.textContent = I18N.t('fever-medicine.next_dose_min', {h: h>0?`${I18N.t('fever-medicine.h', {h})} `:'', m});
      const pct = Math.min(100, Math.round((elapsed/intervalMin)*100));
      if(ring) ring.style.setProperty('--pct', pct);
      if(ringText) ringText.innerHTML = `${(h>0?`${I18N.t('fever-medicine.h', {h})}<br>`:'')}<span class="rt-big">${I18N.t('fever-medicine.min', {m})}</span>`;
    }
  }
  timers[id] = setInterval(tick, 5000);
  if(ring){ ring.classList.remove('done'); ring.style.setProperty('--pct',0); }
  tick();
  el.textContent = I18N.t('fever-medicine.given_now_can_dose_again', {type: type==='T'?I18N.t('fever-medicine.4_hours'):I18N.t('fever-medicine.6_hours')});
}
