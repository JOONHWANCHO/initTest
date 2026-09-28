/**
 * 페이지 스크립트 — tools/__SLUG__.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 *
 * 규칙: 화면에 보이는 문구는 절대 직접 쓰지 말고 I18N.t 함수로 가져오세요.
 *       (문구는 assets/i18n/locales/<언어>/__SLUG__.js 에 ko/en/ja 로 추가)
 */
function calculate() {
  const v = parseFloat(document.getElementById('valueInput').value);
  if (!v || v <= 0) { alert(I18N.t('__SLUG__.enter_value')); return; }

  // TODO: 실제 계산 로직으로 교체
  const result = v * 2;

  document.getElementById('resultText').textContent = I18N.t('__SLUG__.result_text', { value: v, result: result });
  document.getElementById('results').classList.remove('hidden');
}
