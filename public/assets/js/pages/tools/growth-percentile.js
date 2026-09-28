/**
 * 페이지 스크립트 — tools/growth-percentile.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
// WHO 참조치 (평균, 표준편차 근사값 — 실제 구현 시 WHO LMS 파라미터 사용 권장)
// height: [mean_cm, sd] / weight: [mean_kg, sd] by month, gender
const REF = {
  M: {
    height: [[49.9,1.9],[54.7,2.0],[58.4,2.2],[61.4,2.3],[63.9,2.4],[65.9,2.5],[67.6,2.5],[69.2,2.6],[70.6,2.7],[72.0,2.7],[73.3,2.8],[74.5,2.8],[75.7,2.9],[79.1,3.1],[82.3,3.3],[86.4,3.5],[89.1,3.6],[91.2,3.7],[93.9,3.8],[95.2,3.9],[96.1,4.0],[97.6,4.1],[99.1,4.2],[100.4,4.3],[101.6,4.3]],
    weight: [[3.3,.6],[4.5,.7],[5.6,.8],[6.4,.9],[7.0,1.0],[7.5,1.0],[7.9,1.1],[8.3,1.1],[8.6,1.2],[8.9,1.2],[9.2,1.2],[9.4,1.3],[9.6,1.3],[10.2,1.4],[10.9,1.5],[11.5,1.5],[11.8,1.6],[12.1,1.6],[12.5,1.7],[12.7,1.7],[12.9,1.8],[13.2,1.8],[13.4,1.9],[13.6,1.9],[13.9,2.0]]
  },
  F: {
    height: [[49.1,1.9],[53.7,2.0],[57.1,2.1],[59.8,2.2],[62.1,2.3],[64.0,2.3],[65.7,2.4],[67.3,2.5],[68.7,2.5],[70.1,2.6],[71.5,2.6],[72.8,2.7],[74.0,2.7],[77.5,3.0],[80.7,3.1],[84.2,3.3],[86.5,3.4],[88.5,3.5],[91.2,3.7],[92.9,3.8],[94.2,3.9],[95.6,4.0],[97.1,4.1],[98.4,4.2],[99.7,4.2]],
    weight: [[3.2,.6],[4.2,.7],[5.1,.8],[5.8,.9],[6.4,.9],[6.9,1.0],[7.3,1.0],[7.6,1.1],[7.9,1.1],[8.2,1.2],[8.5,1.2],[8.7,1.2],[8.9,1.3],[9.5,1.4],[10.2,1.4],[10.7,1.5],[11.1,1.5],[11.4,1.6],[11.8,1.6],[12.0,1.7],[12.3,1.7],[12.5,1.8],[12.7,1.8],[13.0,1.9],[13.2,1.9]]
  }
};
let gender = 'M';
function setGender(btn,g){
  document.querySelectorAll('.pill-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  gender=g;
  document.getElementById('genderSel').value=g;
}
function syncGender(g){
  gender=g;
  document.getElementById('g'+g).click();
}
function zToPct(z){
  // Φ(z) approximation
  const t=1/(1+0.2316419*Math.abs(z));
  const d=0.3989422*Math.exp(-z*z/2);
  const p=d*t*(0.3193815+t*(-0.3565638+t*(1.7814779+t*(-1.8212560+t*1.3302744))));
  return z>=0 ? Math.round((1-p)*100) : Math.round(p*100);
}
function interpret(pct){
  if(pct>=97) return {text:I18N.t('growth-percentile.very_large_top_3'),cls:'chip-blue'};
  if(pct>=85) return {text:I18N.t('growth-percentile.large_top_15'),cls:'chip-blue'};
  if(pct>=15) return {text:I18N.t('growth-percentile.average_range_2'),cls:'chip-green'};
  if(pct>=3) return {text:I18N.t('growth-percentile.small_bottom_15'),cls:'chip-amber'};
  return {text:I18N.t('growth-percentile.very_small_pediatric_consultation_reco'),cls:'chip-red'};
}
function calculate(){
  const m=parseInt(document.getElementById('ageMonth').value);
  const h=parseFloat(document.getElementById('height').value);
  const w=parseFloat(document.getElementById('weight').value);
  if(isNaN(m)||m<0||m>24){alert(I18N.t('growth-percentile.please_enter_age_between_0'));return;}
  if(!h&&!w){alert(I18N.t('growth-percentile.please_enter_height_weight'));return;}
  const ref=REF[gender];
  let hPct=null,wPct=null;
  if(h&&ref.height[m]){const [mean,sd]=ref.height[m];hPct=zToPct((h-mean)/sd);}
  if(w&&ref.weight[m]){const [mean,sd]=ref.weight[m];wPct=zToPct((w-mean)/sd);}
  if(hPct!==null){
    const r=interpret(hPct);
    document.getElementById('heightPct').textContent=hPct+'%';
    document.getElementById('heightBadge').innerHTML=`<span class="interp-badge ${r.cls}">${r.text}</span>`;
    const pct=Math.min(Math.max(hPct,2),98);
    document.getElementById('hBar').style.width=pct+'%';
    document.getElementById('hMarker').style.left=pct+'%';
  }
  if(wPct!==null){
    const r=interpret(wPct);
    document.getElementById('weightPct').textContent=wPct+'%';
    document.getElementById('weightBadge').innerHTML=`<span class="interp-badge ${r.cls}">${r.text}</span>`;
    const pct=Math.min(Math.max(wPct,2),98);
    document.getElementById('wBar').style.width=pct+'%';
    document.getElementById('wMarker').style.left=pct+'%';
  }
  const notes=[];
  if(hPct!==null&&wPct!==null){
    const diff=Math.abs(hPct-wPct);
    if(diff>30) notes.push(I18N.t('growth-percentile.gap_between_height_weight_percentiles', {hPct, wPct, diff}));
    else notes.push(I18N.t('growth-percentile.height_weight_percentiles_well_balance'));
  }
  notes.push(I18N.t('growth-percentile.percentiles_not_absolute_standard_meas'));
  document.getElementById('interpretation').innerHTML=`<p>${notes.join('<br>')}</p>`;
  document.getElementById('results').classList.remove('hidden');
}
