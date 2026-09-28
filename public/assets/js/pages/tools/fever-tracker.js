/**
 * 페이지 스크립트 — tools/fever-tracker.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
let logs = JSON.parse(localStorage.getItem('tempLogs')||'[]');
const drugTimes = JSON.parse(localStorage.getItem('drugTimes')||'{}');
let timerInterval = null;

function pad(n){return String(n).padStart(2,'0');}
function fmtTime(d){const dt=new Date(d);return `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;}
function tempClass(t){return t>=38.5?'temp-hot':t>=37.5?'temp-warn':'temp-ok';}
function tempLabel(t){return t>=38.5?'🔴':t>=37.5?'🟡':'🟢';}

function addTemp(){
  const t = parseFloat(document.getElementById('tempInput').value);
  const m = document.getElementById('tempMethod').value;
  if(!t||t<35||t>42){alert(I18N.t('fever-tracker.please_enter_valid_temperature_35'));return;}
  logs.unshift({temp:t, method:m, time:Date.now()});
  if(logs.length>50) logs=logs.slice(0,50);
  localStorage.setItem('tempLogs',JSON.stringify(logs));
  document.getElementById('tempInput').value='';
  renderLogs();
}

function deleteLog(i){
  logs.splice(i,1);
  localStorage.setItem('tempLogs',JSON.stringify(logs));
  renderLogs();
}

function clearLogs(){
  if(!confirm(I18N.t('common.delete_all_records'))) return;
  logs=[];
  localStorage.removeItem('tempLogs');
  renderLogs();
}

function renderLogs(){
  const el=document.getElementById('logList');
  if(!logs.length){el.innerHTML=`<p style="text-align:center;color:var(--text-muted);padding:1.5rem;font-size:13px;">${I18N.t('common.no_records_yet')}</p>`;drawChart([]);return;}
  el.innerHTML=logs.map((l,i)=>`
    <div class="log-row">
      <span>${tempLabel(l.temp)}</span>
      <span class="log-temp ${tempClass(l.temp)}">${l.temp.toFixed(1)}°C</span>
      <span style="color:var(--text-muted);font-size:12px;">${I18N.d('method',l.method)}</span>
      <span style="color:var(--text-muted);font-size:12px;">${fmtTime(l.time)}</span>
      <button class="delete-btn" onclick="deleteLog(${i})">✕</button>
    </div>`).join('');
  drawChart([...logs].reverse().map(l=>l.temp));
}

function drawChart(temps){
  const canvas=document.getElementById('tempChart');
  const ctx=canvas.getContext('2d');
  canvas.width=canvas.offsetWidth*window.devicePixelRatio||600;
  canvas.height=100*window.devicePixelRatio||200;
  ctx.scale(window.devicePixelRatio||1,window.devicePixelRatio||1);
  const W=canvas.offsetWidth, H=100;
  ctx.clearRect(0,0,W,H);
  if(temps.length<2) return;
  const mn=Math.min(...temps)-0.5, mx=Math.max(...temps)+0.5;
  const toY=t=>H-10-(t-mn)/(mx-mn)*(H-20);
  const toX=(i,len)=>10+(i/(len-1))*(W-20);
  // danger line
  ctx.strokeStyle='rgba(197,48,48,.2)'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
  const dl=toY(38.5);
  ctx.beginPath();ctx.moveTo(0,dl);ctx.lineTo(W,dl);ctx.stroke();
  ctx.setLineDash([]);
  // line
  ctx.strokeStyle='#4A7C59'; ctx.lineWidth=2.5;
  ctx.beginPath();
  temps.forEach((t,i)=>{i===0?ctx.moveTo(toX(i,temps.length),toY(t)):ctx.lineTo(toX(i,temps.length),toY(t));});
  ctx.stroke();
  // dots
  temps.forEach((t,i)=>{
    ctx.fillStyle=t>=38.5?'#c53030':t>=37.5?'#E9A825':'#4A7C59';
    ctx.beginPath();ctx.arc(toX(i,temps.length),toY(t),4,0,Math.PI*2);ctx.fill();
  });
}

function startDrug(type){
  drugTimes[type]=Date.now();
  localStorage.setItem('drugTimes',JSON.stringify(drugTimes));
  updateTimers();
}

function updateTimers(){
  const now=Date.now();
  ['T','B'].forEach(type=>{
    const last=drugTimes[type];
    const maxMs=(type==='T'?240:360)*60000;
    const el=document.getElementById(type==='T'?'tCountdown':'bCountdown');
    const st=document.getElementById(type==='T'?'tStatus':'bStatus');
    if(!last){el.textContent='—';st.textContent=I18N.t('fever-tracker.not_given');return;}
    const elapsed=now-last;
    const remaining=maxMs-elapsed;
    if(remaining<=0){
      el.textContent=I18N.t('common.available');
      el.style.color='var(--primary)';
      st.textContent=I18N.t('fever-tracker.dose_available_now');
    } else {
      const h=Math.floor(remaining/3600000),m=Math.floor((remaining%3600000)/60000);
      el.textContent=`${h>0?h+'h ':''} ${pad(m)}m`;
      st.textContent=I18N.t('fever-tracker.given', {fmtTime: fmtTime(last)});
    }
  });
}
setInterval(updateTimers,30000);
renderLogs();
updateTimers();
