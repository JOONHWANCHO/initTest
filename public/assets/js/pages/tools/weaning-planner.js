/**
 * 페이지 스크립트 — tools/weaning-planner.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
const STAGES = {
  '4-5': {label:I18N.t('weaning-planner.early_4_5_months'),meals:1,formula:5,weanAmount:I18N.t('weaning-planner.1_2_tbsp'),weanMenu:[I18N.t('weaning-planner.rice_pur_e'),I18N.t('weaning-planner.kabocha_pur_e'),I18N.t('weaning-planner.potato_pur_e'),I18N.t('weaning-planner.sweet_potato_pur_e'),I18N.t('weaning-planner.broccoli_pur_e'),I18N.t('weaning-planner.zucchini_pur_e'),I18N.t('weaning-planner.carrot_pur_e')],note:I18N.t('weaning-planner.5_milk_feedings_1_weaning')},
  '6':   {label:I18N.t('weaning-planner.early_advanced_6_months'),meals:1,formula:5,weanAmount:'30~80ml',weanMenu:[I18N.t('weaning-planner.rice_porridge'),I18N.t('weaning-planner.beef_pur_e'),I18N.t('weaning-planner.chicken_breast_porridge'),I18N.t('weaning-planner.spinach_porridge'),I18N.t('weaning-planner.tofu_porridge'),I18N.t('weaning-planner.green_pea_porridge'),I18N.t('weaning-planner.enoki_mushroom_porridge')],note:I18N.t('weaning-planner.stage_expanding_variety_ingredients_ad')},
  '7-8': {label:I18N.t('weaning-planner.mid_7_8_months'),meals:2,formula:4,weanAmount:'80~120ml',weanMenu:[I18N.t('weaning-planner.beef_vegetable_porridge'),I18N.t('weaning-planner.chicken_porridge'),I18N.t('weaning-planner.tofu_vegetable_porridge'),I18N.t('weaning-planner.cod_porridge'),I18N.t('weaning-planner.egg_yolk_porridge'),I18N.t('weaning-planner.silken_tofu_porridge'),I18N.t('weaning-planner.mushroom_vegetable_porridge')],note:I18N.t('weaning-planner.time_increase_2_weaning_meals')},
  '9-11':{label:I18N.t('weaning-planner.late_9_11_months'),meals:3,formula:3,weanAmount:'120~180ml',weanMenu:[I18N.t('weaning-planner.beef_soft_cooked_rice'),I18N.t('weaning-planner.salmon_vegetable_rice'),I18N.t('weaning-planner.chicken_vegetable_porridge'),I18N.t('weaning-planner.egg_vegetable_rice'),I18N.t('weaning-planner.tofu_soybean_paste_porridge'),I18N.t('weaning-planner.tuna_vegetable_rice'),I18N.t('weaning-planner.pork_vegetable_rice')],note:I18N.t('weaning-planner.3_weaning_meals_day_getting')},
  '12+': {label:I18N.t('weaning-planner.completion_12_months'),meals:3,formula:2,weanAmount:'180~240ml',weanMenu:[I18N.t('weaning-planner.soft_rice'),I18N.t('weaning-planner.bibimbap_seasoned_vegetables'),I18N.t('weaning-planner.egg_fried_rice'),I18N.t('weaning-planner.tofu_soybean_paste_soup_rice'),I18N.t('weaning-planner.beef_vegetable_fried_rice'),I18N.t('weaning-planner.grilled_salmon_rice'),I18N.t('weaning-planner.chicken_vegetable_fried_rice')],note:I18N.t('weaning-planner.three_meals_day_similar_adults')},
};
const DAYS = [I18N.t('weaning-planner.weekday_mon'),I18N.t('weaning-planner.tue'),I18N.t('weaning-planner.wed'),I18N.t('weaning-planner.thu'),I18N.t('weaning-planner.fri'),I18N.t('weaning-planner.sat'),I18N.t('weaning-planner.sun')];
let selectedStage = '4-5';

const months = [['4-5',I18N.t('weaning-planner.4_5_months')],['6',I18N.t('common.6_months')],['7-8',I18N.t('weaning-planner.7_8_months')],['9-11',I18N.t('weaning-planner.9_11_months')],['12+',I18N.t('weaning-planner.12_months')]];
const c = document.getElementById('monthBtns');
months.forEach(([v,l],i)=>{
  const b=document.createElement('button');
  b.className='pill-btn'+(i===0?' active':'');
  b.textContent=l; b.dataset.v=v;
  b.onclick=()=>{document.querySelectorAll('#monthBtns .pill-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');selectedStage=v;};
  c.appendChild(b);
});

function addMin(time, mins){
  const [h,m]=time.split(':').map(Number);
  const t=(h*60+m+mins)%1440;
  return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
}

function generate(){
  const stage=STAGES[selectedStage];
  const first=document.getElementById('firstFeed').value||'07:00';

  // 시간 계산: 수유 간격 약 3~4시간
  const feedInterval = selectedStage==='4-5'||selectedStage==='6' ? 210 : selectedStage==='12+' ? 360 : 240;
  const feedTimes=[];
  for(let i=0;i<stage.formula;i++) feedTimes.push(addMin(first,feedInterval*i));

  // 이유식 타임: 수유 직전 (오전 첫·두번째 수유 앞)
  const weanTimes=[];
  if(stage.meals>=1) weanTimes.push(addMin(feedTimes[1]||feedTimes[0], -30));
  if(stage.meals>=2) weanTimes.push(addMin(feedTimes[2]||feedTimes[1], -30));
  if(stage.meals>=3) weanTimes.push(addMin(feedTimes[stage.formula-1], -30));

  // 전체 이벤트 정렬
  const events=[];
  feedTimes.forEach(t=>events.push({time:t,type:'수유',content:I18N.t('weaning-planner.breast_milk_formula')}));
  weanTimes.forEach((t,i)=>events.push({time:t,type:'이유식',content:stage.weanMenu[i%stage.weanMenu.length]}));
  events.sort((a,b)=>a.time.localeCompare(b.time));

  // 테이블 생성
  document.getElementById('scheduleTitle').textContent=I18N.t('weaning-planner.weekly_schedule', {label: stage.label});
  document.getElementById('stageNote').innerHTML=I18N.t('weaning-planner.guide_this_stage', {note: stage.note});

  const thead=`<thead><tr><th>${I18N.t('weaning-planner.time')}</th><th>${I18N.t('common.category')}</th>${DAYS.map(d=>`<th>${d}</th>`).join('')}</tr></thead>`;
  const tbody=events.map((e,idx)=>{
    const menus=DAYS.map((_,di)=>{
      if(e.type==='이유식'){
        const menuIdx=(idx+di)%stage.weanMenu.length;
        return `<td class="meal-cell"><div class="meal-name">${stage.weanMenu[menuIdx]}</div><div class="meal-amount">${stage.weanAmount}</div></td>`;
      }
      return `<td class="meal-cell"><div class="meal-name">${I18N.t('weaning-planner.feeding')}</div><div class="meal-amount">${I18N.t('weaning-planner.suitable_amount')}</div></td>`;
    }).join('');
    const badge=e.type==='이유식'?`<span class="chip chip-green" style="font-size:10px;padding:2px 7px;">${I18N.t('weaning-planner.weaning')}</span>`:`<span class="chip chip-gray" style="font-size:10px;padding:2px 7px;">${I18N.t('weaning-planner.feeding')}</span>`;
    return `<tr><td class="time-cell">${e.time}</td><td>${badge}</td>${menus}</tr>`;
  }).join('');

  document.getElementById('scheduleTable').innerHTML=thead+`<tbody>${tbody}</tbody>`;
  document.getElementById('result').classList.remove('hidden');
}
