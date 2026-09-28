/**
 * 페이지 스크립트 — tools/colic-checker.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
function calcScore(){
  const checks = document.querySelectorAll('#checkList input[type=checkbox]');
  const score = [...checks].filter(c=>c.checked).length;
  document.getElementById('scoreNum').textContent = `${score} / 8`;
  let label='', color='', html='';
  if(score===0){label=I18N.t('colic-checker.check_boxes_then_see_result');color='';}
  else if(score<=2){label=I18N.t('colic-checker.infant_colic_unlikely');color='var(--primary-dark)';}
  else if(score<=5){label=I18N.t('colic-checker.infant_colic_possible_pediatric_consul');color='var(--amber)';}
  else{label=I18N.t('colic-checker.infant_colic_likely_pediatric_visit');color='var(--red)';}
  document.getElementById('scoreLabel').textContent=label;
  if(score>0){
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('resultBox').innerHTML = score<=2
      ? `<div class="result-box"><div class="result-label">${I18N.t('colic-checker.result')}</div><div class="result-sub">${I18N.t('colic-checker.few_items_checked_right_now')}</div></div>`
      : score<=5
      ? `<div class="result-box amber"><div class="result-label">${I18N.t('colic-checker.result')}</div><div class="result-sub">${I18N.t('colic-checker.infant_colic_possible_try_5')}</div></div>`
      : `<div class="result-box red"><div class="result-label">${I18N.t('colic-checker.result')}</div><div class="result-sub">${I18N.t('colic-checker.infant_colic_likely_visit_pediatrician')}</div></div>`;
  }
}
