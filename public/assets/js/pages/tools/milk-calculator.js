/**
 * 페이지 스크립트 — tools/milk-calculator.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
let feedTypeVal = 'formula';
function setType(btn, type){
  document.querySelectorAll('#feedType .pill-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  feedTypeVal = type;
}
function calculate(){
  const month = parseInt(document.getElementById('monthSel').value);
  const weight = parseFloat(document.getElementById('weight').value);
  if(!weight || weight < 1){ alert(I18N.t('milk-calculator.please_enter_weight')); return; }

  let daily, perFeed, count, note;
  if(feedTypeVal === 'formula'){
    const rate = month <= 1 ? 150 : month <= 3 ? 155 : 160;
    daily = Math.round(weight * rate);
    if(month === 0) count = 8;
    else if(month <= 1) count = 7;
    else if(month <= 3) count = 6;
    else if(month <= 5) count = 5;
    else if(month <= 8) count = 4;
    else count = 3;
    perFeed = Math.round(daily / count / 10) * 10;
    note = I18N.t('milk-calculator.weight_kg_about_ml_formula', {weight, daily, perFeed, count});
  } else {
    if(month <= 1) count = 8, perFeed = 90, daily = 720;
    else if(month <= 3) count = 7, perFeed = 110, daily = 770;
    else if(month <= 5) count = 6, perFeed = 130, daily = 780;
    else if(month <= 8) count = 5, perFeed = 150, daily = 750;
    else count = 4, perFeed = 160, daily = 640;
    note = I18N.t('milk-calculator.basic_rule_breastfeeding_feed_demand', {count});
  }
  document.getElementById('dailyTotal').textContent = daily + 'ml';
  document.getElementById('perFeed').textContent = perFeed + 'ml';
  document.getElementById('feedCount').textContent = I18N.t('common.times', {count});
  document.getElementById('resultNote').textContent = note;
  document.getElementById('results').classList.remove('hidden');
}
