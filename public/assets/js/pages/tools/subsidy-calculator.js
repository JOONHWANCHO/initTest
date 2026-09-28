/**
 * 페이지 스크립트 — tools/subsidy-calculator.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
document.getElementById('birthDate').max = new Date().toISOString().split('T')[0];

function calculate(){
  const bv = document.getElementById('birthDate').value;
  if(!bv){alert(I18N.t('common.please_enter_birth_date'));return;}
  const birth = new Date(bv);
  const now = new Date();
  const ageMonths = Math.floor((now-birth)/1000/60/60/24/30.44);
  const ageYears = Math.floor(ageMonths/12);

  const subsidies = [];
  let totalReceived = 0, totalRemaining = 0;

  // 1. 첫만남이용권 200만원 (출생 시 1회)
  const welcome = 200;
  const welcomeDone = ageMonths >= 0;
  subsidies.push({
    name:I18N.t('subsidy-calculator.first_meeting_voucher'), icon:'🎁',
    desc:I18N.t('subsidy-calculator.one_time_voucher_birth_krw'),
    amount: I18N.t('subsidy-calculator.krw_0k_one_time', {welcome}),
    status: welcomeDone ? 'done' : 'future',
    statusLabel: welcomeDone ? I18N.t('subsidy-calculator.paid') : I18N.t('subsidy-calculator.received_birth'),
    total: welcome
  });
  totalReceived += welcome;

  // 2. 부모급여 (0세: 월 100만, 1세: 월 50만)
  let parentPay = 0, parentPayRemaining = 0;
  const months0 = Math.min(Math.max(12-ageMonths, 0), 12); // remaining 0세 months
  const months1 = Math.min(Math.max(24-ageMonths, 0), 12); // remaining 1세 months
  if(ageMonths < 12) {
    parentPay = (12-months0)*100 + 0; // received so far as 0세
    parentPayRemaining = months0*100 + months1*50;
  } else if(ageMonths < 24) {
    parentPay = 12*100 + (ageMonths-12)*50;
    parentPayRemaining = months1*50;
  } else {
    parentPay = 12*100 + 12*50;
    parentPayRemaining = 0;
  }
  subsidies.push({
    name:I18N.t('subsidy-calculator.parental_pay'), icon:'👨‍👩‍👧',
    desc:I18N.t('subsidy-calculator.krw_1m_month_age_0'),
    amount:I18N.t('subsidy-calculator.12_months_age_0_krw'),
    status: ageMonths >= 24 ? 'done' : 'active',
    statusLabel: ageMonths >= 24 ? I18N.t('subsidy-calculator.received') : I18N.t('subsidy-calculator.about_krw_0k_left_receive', {parentPayRemaining}),
    total: 1800
  });
  totalReceived += parentPay;
  totalRemaining += parentPayRemaining;

  // 3. 아동수당 (만 0~7세 월 10만원 = 최대 96개월)
  const childAllowanceMonths = 96; // 8년
  const caReceived = Math.min(ageMonths, childAllowanceMonths) * 10;
  const caRemaining = Math.max(childAllowanceMonths - ageMonths, 0) * 10;
  subsidies.push({
    name:I18N.t('subsidy-calculator.child_allowance'), icon:'👶',
    desc:I18N.t('subsidy-calculator.krw_100k_month_under_age'),
    amount:I18N.t('subsidy-calculator.krw_100k_month_up_96'),
    status: ageMonths >= 96 ? 'done' : 'active',
    statusLabel: ageMonths >= 96 ? I18N.t('subsidy-calculator.received') : I18N.t('subsidy-calculator.about_krw_0k_left_receive_2', {caRemaining}),
    total: 960
  });
  totalReceived += caReceived;
  totalRemaining += caRemaining;

  // 4. 영아기 특례 보육료 (0~1세 어린이집)
  subsidies.push({
    name:I18N.t('subsidy-calculator.infant_childcare_fee_support'), icon:'🏫',
    desc:I18N.t('subsidy-calculator.when_using_daycare_krw_540k'),
    amount:I18N.t('subsidy-calculator.varies_depending_daycare_use'),
    status: ageMonths < 24 ? 'active' : 'done',
    statusLabel: ageMonths < 24 ? I18N.t('subsidy-calculator.available') : I18N.t('subsidy-calculator.period_ended'),
    total: 0
  });

  // 5. 산모·신생아 건강관리 서비스
  subsidies.push({
    name:I18N.t('subsidy-calculator.postpartum_newborn_care_worker'), icon:'🏥',
    desc:I18N.t('subsidy-calculator.home_visit_service_after_birth'),
    amount:I18N.t('subsidy-calculator.5_25_days_support_government'),
    status: ageMonths < 3 ? 'active' : 'done',
    statusLabel: ageMonths < 3 ? I18N.t('subsidy-calculator.can_apply') : I18N.t('subsidy-calculator.application_period_ended'),
    total: 0
  });

  const total = totalReceived + totalRemaining;

  document.getElementById('subsidyList').innerHTML = subsidies.map(s=>`
    <div class="subsidy-card ${s.status==='active'?'active':s.status==='future'?'':'inactive'}">
      <div class="sc-left">
        <div class="sc-name">${s.icon} ${s.name}</div>
        <div class="sc-desc">${s.desc}</div>
        <div style="margin-top:5px;">
          <span class="progress-pill ${s.status==='active'?'pill-ok':s.status==='future'?'pill-future':'pill-done'}">${s.statusLabel}</span>
        </div>
      </div>
      <div class="sc-right">
        <div class="sc-amount">${s.total > 0 ? I18N.t('subsidy-calculator.krw_0k', {s: s.total.toLocaleString()}) : '—'}</div>
        <div class="sc-period" style="max-width:130px;text-align:right;">${s.amount}</div>
      </div>
    </div>`).join('');

  document.getElementById('totalBox').innerHTML = `
    <div class="tl">${I18N.t('subsidy-calculator.benefits_received_so_far_estimated')}</div>
    <div class="tv">${I18N.t('subsidy-calculator.krw_0k_2', {totalReceived: (totalReceived).toLocaleString()})}</div>
    <div class="ts">${I18N.t('subsidy-calculator.about_krw_0k_more_benefits', {totalRemaining: (totalRemaining).toLocaleString()})}</div>`;

  document.getElementById('results').classList.remove('hidden');
}
