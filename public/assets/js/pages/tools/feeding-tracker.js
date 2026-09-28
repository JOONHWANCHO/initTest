/**
 * 페이지 스크립트 — tools/feeding-tracker.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
let logs = JSON.parse(localStorage.getItem('feedingLogs')||'[]');
let startTime = null;
let timerInterval = null;
let currentSide = I18N.t('feeding-tracker.left_2');

function setSide(btn, side){
  document.querySelectorAll('.side-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  currentSide = side;
}

function pad(n){return String(n).padStart(2,'0');}
function fmtDur(ms){
  const s=Math.floor(ms/1000), m=Math.floor(s/60), sec=s%60;
  return `${pad(m)}:${pad(sec)}`;
}
function fmtTime(d){
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function startTimer(){
  if(timerInterval) return;
  startTime = new Date();
  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled = false;
  document.getElementById('timerStatus').textContent = I18N.t('feeding-tracker.feeding', {currentSide});
  timerInterval = setInterval(()=>{
    const elapsed = Date.now() - startTime.getTime();
    document.getElementById('clock').textContent = fmtDur(elapsed);
  },500);
}

function stopTimer(){
  if(!timerInterval) return;
  clearInterval(timerInterval); timerInterval=null;
  const endTime = new Date();
  const dur = endTime - startTime;
  logs.unshift({start: startTime.toISOString(), side: currentSide, dur});
  if(logs.length>100) logs = logs.slice(0,100);
  localStorage.setItem('feedingLogs', JSON.stringify(logs));
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
  document.getElementById('clock').textContent = '00:00';
  document.getElementById('timerStatus').textContent = I18N.t('feeding-tracker.done_feeding', {fmtDur: fmtDur(dur)});
  startTime = null;
  renderTable(); updateStats();
}

function deleteLog(i){
  logs.splice(i,1);
  localStorage.setItem('feedingLogs', JSON.stringify(logs));
  renderTable(); updateStats();
}

function renderTable(){
  const tbody = document.getElementById('logBody');
  if(!logs.length){
    tbody.innerHTML=`<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:1.5rem;">${I18N.t('common.no_records_yet')}</td></tr>`;
    return;
  }
  tbody.innerHTML = logs.map((l,i)=>{
    const d = new Date(l.start);
    const gap = i < logs.length-1 ? (d - new Date(logs[i+1].start)) : null;
    const gapStr = gap ? fmtDur(gap) : '—';
    return `<tr>
      <td style="color:var(--text-muted)">${logs.length-i}</td>
      <td>${fmtTime(d)}</td>
      <td>${I18N.d('side',l.side)}</td>
      <td><strong>${fmtDur(l.dur)}</strong></td>
      <td>${gapStr}</td>
      <td><button class="delete-btn" onclick="deleteLog(${i})">✕</button></td>
    </tr>`;
  }).join('');
}

function updateStats(){
  const today = new Date().toDateString();
  const todayLogs = logs.filter(l=>new Date(l.start).toDateString()===today);
  document.getElementById('statCount').textContent = I18N.t('common.times', {count: todayLogs.length});
  if(todayLogs.length){
    const avgDur = todayLogs.reduce((a,l)=>a+l.dur,0)/todayLogs.length;
    document.getElementById('statAvgDur').textContent = fmtDur(avgDur);
  } else {
    document.getElementById('statAvgDur').textContent = '--';
  }
  if(logs.length>1){
    let gaps=[];
    for(let i=0;i<logs.length-1;i++){
      gaps.push(new Date(logs[i].start)-new Date(logs[i+1].start));
    }
    const avg = gaps.reduce((a,b)=>a+b,0)/gaps.length;
    document.getElementById('statAvgGap').textContent = fmtDur(avg);
  } else {
    document.getElementById('statAvgGap').textContent = '--';
  }
}

function exportCSV(){
  if(!logs.length){ alert(I18N.t('feeding-tracker.no_records')); return; }
  const rows = [[I18N.t('feeding-tracker.no'),I18N.t('common.date'),I18N.t('feeding-tracker.start_time_2'),I18N.t('feeding-tracker.side'),I18N.t('feeding-tracker.duration_min')]];
  [...logs].reverse().forEach((l,i)=>{
    const d=new Date(l.start);
    rows.push([i+1,d.toLocaleDateString(I18N.locale),fmtTime(d),l.side,(l.dur/60000).toFixed(1)]);
  });
  const csv = rows.map(r=>r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=I18N.t('feeding-tracker.feeding_log_csv');
  a.click();
}

function clearAll(){
  if(!confirm(I18N.t('common.delete_all_records'))) return;
  logs=[];
  localStorage.removeItem('feedingLogs');
  renderTable(); updateStats();
}

renderTable(); updateStats();
