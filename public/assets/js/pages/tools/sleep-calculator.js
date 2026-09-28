/**
 * 페이지 스크립트 — tools/sleep-calculator.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
let cycleMin = 50;
let ageLabel = I18N.t('sleep-calculator.infant_4_6_months');

function selectAge(btn, id, label, cycle){
  document.querySelectorAll('#ageGroup .pill-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  ageLabel = label;
  cycleMin = cycle;
}

function addMins(time, mins){
  const [h,m] = time.split(':').map(Number);
  const total = h*60 + m + mins;
  const nh = Math.floor(total/60)%24;
  const nm = total%60;
  return `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`;
}

function fmt12(t){
  const [h,m] = t.split(':').map(Number);
  const period = h<12 ? I18N.t('sleep-calculator.am') : I18N.t('sleep-calculator.pm');
  const hh = h%12||12;
  return `${period} ${hh}:${String(m).padStart(2,'0')}`;
}

function calculate(){
  const bed = document.getElementById('bedtime').value;
  if(!bed) return;
  const cycles = [];
  for(let i=3;i<=7;i++){
    const wake = addMins(bed, cycleMin*i);
    const hrs = (cycleMin*i/60).toFixed(1);
    cycles.push({wake, hrs, cycles:i, ideal: i===5||i===6});
  }
  const html = cycles.map(c=>`
    <div class="cycle-row">
      <div class="cycle-num">${c.cycles}</div>
      <div class="cycle-time">${fmt12(c.wake)}</div>
      <div class="cycle-label">${I18N.t('sleep-calculator.hours_sleep_cycles', {hrs: c.hrs, cycles: c.cycles})}</div>
      ${c.ideal ? `<span class="cycle-badge badge-ideal">${I18N.t('sleep-calculator.ideal')}</span>` : `<span class="cycle-badge badge-ok">${I18N.t('common.available')}</span>`}
    </div>`).join('');
  document.getElementById('cycleList').innerHTML = `<div class="card">${html}</div>`;

  const naps = [
    {age:I18N.t('sleep-calculator.newborn_0_3_months'),count:I18N.t('common.4_5_times'),total:I18N.t('sleep-calculator.16_17_hours_day')},
    {age:I18N.t('common.4_6_months'),count:I18N.t('common.3_4_times'),total:I18N.t('sleep-calculator.14_15_hours_day')},
    {age:I18N.t('sleep-calculator.7_12_months'),count:I18N.t('common.2_3_times'),total:I18N.t('sleep-calculator.12_15_hours_day')},
    {age:I18N.t('sleep-calculator.1_2_years'),count:I18N.t('sleep-calculator.1_2_times'),total:I18N.t('sleep-calculator.11_14_hours_day')},
    {age:I18N.t('sleep-calculator.2_3_years'),count:I18N.t('sleep-calculator.1_time'),total:I18N.t('sleep-calculator.11_13_hours_day')},
    {age:I18N.t('sleep-calculator.3_5_years'),count:I18N.t('sleep-calculator.0_1_times'),total:I18N.t('sleep-calculator.10_13_hours_day')},
  ];
  document.getElementById('napGuide').innerHTML = naps.map(n=>`
    <div class="nap-card">
      <div class="nap-age">${n.age}</div>
      <div class="nap-count">${n.count}</div>
      <div class="nap-total">${n.total}</div>
    </div>`).join('');

  document.getElementById('results').classList.remove('hidden');
}
