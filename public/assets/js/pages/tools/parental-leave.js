/**
 * 페이지 스크립트 — tools/parental-leave.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
function fmt(n){return I18N.t('parental-leave.krw_0k', {round: Math.round(n).toLocaleString()});}
function clamp(v,min,max){return Math.min(Math.max(v,min),max);}

function calculate(){
  const sal=parseFloat(document.getElementById('salary').value);
  if(!sal||sal<1){alert(I18N.t('parental-leave.please_enter_ordinary_wage'));return;}
  const isBoth=document.getElementById('leaveType').value==='both';

  const SIX_CAPS=[200,250,300,350,400,450]; // 6+6 월별 상한
  const rows=[];
  let totalPay=0, totalPost=0;

  for(let m=1;m<=12;m++){
    let pay,label;
    if(isBoth&&m<=6){
      const cap=SIX_CAPS[m-1];
      pay=clamp(sal,0,cap); // 100%
      label=I18N.t('parental-leave.6_6_special_rule_month_7', {m});
    } else if(m<=3){
      pay=clamp(sal*0.8,70,150);
      label=I18N.t('parental-leave.standard_month_80', {m});
    } else {
      pay=clamp(sal*0.5,70,120);
      label=I18N.t('parental-leave.standard_month_50', {m});
    }
    const immediate=pay*0.75, post=pay*0.25;
    totalPay+=immediate; totalPost+=post;
    rows.push({m,label,pay,immediate,post});
  }

  document.getElementById('summaryBox').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="result-box">
        <div class="result-label">${I18N.t('parental-leave.12_month_immediate_payment_total')}</div>
        <div class="result-value" style="font-size:1.4rem;">${fmt(totalPay)}</div>
        <div class="result-sub">${I18N.t('parental-leave.deferred_payment_after_return', {fmt: fmt(totalPost)})}</div>
      </div>
      <div class="result-box amber">
        <div class="result-label">${I18N.t('parental-leave.12_month_total_estimated_pay')}</div>
        <div class="result-value" style="font-size:1.4rem;">${fmt(totalPay+totalPost)}</div>
        <div class="result-sub">${I18N.t('parental-leave.based_ordinary_wage_krw_0k', {sal})}</div>
      </div>
    </div>`;

  document.getElementById('monthTable').innerHTML=`
    <thead><tr><th>${I18N.t('parental-leave.month_2')}</th><th>${I18N.t('common.category')}</th><th>${I18N.t('parental-leave.pay')}</th><th>${I18N.t('parental-leave.immediate_75')}</th><th>${I18N.t('parental-leave.deferred_25')}</th></tr></thead>
    <tbody>${rows.map(r=>`<tr>
      <td style="font-weight:700;">${I18N.t('parental-leave.month', {m: r.m})}</td>
      <td style="font-size:11px;color:var(--text-muted);">${r.label}</td>
      <td><strong>${fmt(r.pay)}</strong></td>
      <td>${fmt(r.immediate)}</td>
      <td style="color:var(--text-muted);">${fmt(r.post)}</td>
    </tr>`).join('')}</tbody>`;

  document.getElementById('results').classList.remove('hidden');
}
