/**
 * 페이지 스크립트 — tools/baby-name.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
const VIBES = [I18N.t('baby-name.bright_lively'),I18N.t('baby-name.wise_bright'),I18N.t('baby-name.strong_brave'),I18N.t('baby-name.warm_gentle'),I18N.t('baby-name.noble_dignified'),I18N.t('baby-name.nature_inspired'),I18N.t('baby-name.pure_clear'),I18N.t('baby-name.blessed_fortune')];
let selectedVibes = [];
let genderVal = 'both';

const NAMES = {
  boy: [
    {name:I18N.t('baby-name.junhyeok'),hanja:'俊赫',meaning:I18N.t('baby-name.outstanding_talent_shining_fame'),vibes:[I18N.t('baby-name.bright_lively'),I18N.t('baby-name.wise_bright')],stroke:14},
    {name:I18N.t('baby-name.siwoo'),hanja:'時雨',meaning:I18N.t('baby-name.blessing_like_rain_that_comes'),vibes:[I18N.t('baby-name.blessed_fortune'),I18N.t('baby-name.warm_gentle')],stroke:8},
    {name:I18N.t('baby-name.doyun'),hanja:'道允',meaning:I18N.t('baby-name.child_who_follows_right_path'),vibes:[I18N.t('baby-name.wise_bright'),I18N.t('baby-name.noble_dignified')],stroke:11},
    {name:I18N.t('baby-name.hajun'),hanja:'夏俊',meaning:I18N.t('baby-name.abundant_talent_like_summer'),vibes:[I18N.t('baby-name.bright_lively'),I18N.t('baby-name.strong_brave')],stroke:13},
    {name:I18N.t('baby-name.jiho'),hanja:'智浩',meaning:I18N.t('baby-name.wise_broad_heart'),vibes:[I18N.t('baby-name.wise_bright'),I18N.t('baby-name.warm_gentle')],stroke:13},
    {name:I18N.t('baby-name.seojun'),hanja:'敍俊',meaning:I18N.t('baby-name.child_who_will_write_shining'),vibes:[I18N.t('baby-name.bright_lively'),I18N.t('baby-name.noble_dignified')],stroke:12},
    {name:I18N.t('baby-name.geonwoo'),hanja:'健宇',meaning:I18N.t('baby-name.child_who_embraces_world_good'),vibes:[I18N.t('baby-name.strong_brave'),I18N.t('baby-name.blessed_fortune')],stroke:10},
    {name:I18N.t('baby-name.yuchan'),hanja:'裕燦',meaning:I18N.t('baby-name.child_who_abundant_radiant'),vibes:[I18N.t('baby-name.bright_lively'),I18N.t('baby-name.blessed_fortune')],stroke:15},
    {name:I18N.t('baby-name.minjae'),hanja:'敏才',meaning:I18N.t('baby-name.quick_talented_child'),vibes:[I18N.t('baby-name.wise_bright'),I18N.t('baby-name.strong_brave')],stroke:12},
    {name:I18N.t('baby-name.taeyang'),hanja:'泰陽',meaning:I18N.t('baby-name.child_like_big_bright_sun'),vibes:[I18N.t('baby-name.bright_lively'),I18N.t('baby-name.nature_inspired')],stroke:9},
    {name:I18N.t('baby-name.ian'),hanja:'怡安',meaning:I18N.t('baby-name.joyful_peaceful_child'),vibes:[I18N.t('baby-name.warm_gentle'),I18N.t('baby-name.pure_clear')],stroke:8},
    {name:I18N.t('baby-name.hyeonjun'),hanja:'賢俊',meaning:I18N.t('baby-name.wise_outstanding_child'),vibes:[I18N.t('baby-name.wise_bright'),I18N.t('baby-name.noble_dignified')],stroke:16},
    {name:I18N.t('baby-name.taeo'),hanja:'泰悟',meaning:I18N.t('baby-name.child_great_deep_insight'),vibes:[I18N.t('baby-name.nature_inspired'),I18N.t('baby-name.wise_bright')],stroke:11},
    {name:I18N.t('baby-name.gangsan'),hanja:'江山',meaning:I18N.t('baby-name.child_as_steadfast_as_rivers'),vibes:[I18N.t('baby-name.nature_inspired'),I18N.t('baby-name.strong_brave')],stroke:7},
    {name:I18N.t('baby-name.onyu'),hanja:'溫柔',meaning:I18N.t('baby-name.warm_gentle_nature'),vibes:[I18N.t('baby-name.warm_gentle'),I18N.t('baby-name.pure_clear')],stroke:11},
  ],
  girl: [
    {name:I18N.t('baby-name.seoyeon'),hanja:'瑞妍',meaning:I18N.t('baby-name.auspicious_beautiful_child'),vibes:[I18N.t('baby-name.noble_dignified'),I18N.t('baby-name.bright_lively')],stroke:13},
    {name:I18N.t('baby-name.haeun'),hanja:'夏恩',meaning:I18N.t('baby-name.warm_grace_like_summer'),vibes:[I18N.t('baby-name.warm_gentle'),I18N.t('baby-name.blessed_fortune')],stroke:12},
    {name:I18N.t('baby-name.jia'),hanja:'智雅',meaning:I18N.t('baby-name.wise_graceful_child'),vibes:[I18N.t('baby-name.wise_bright'),I18N.t('baby-name.noble_dignified')],stroke:12},
    {name:I18N.t('baby-name.chaewon'),hanja:'彩媛',meaning:I18N.t('baby-name.splendid_beautiful_colors'),vibes:[I18N.t('baby-name.bright_lively'),I18N.t('baby-name.noble_dignified')],stroke:14},
    {name:I18N.t('baby-name.sua'),hanja:'秀雅',meaning:I18N.t('baby-name.outstanding_graceful_child'),vibes:[I18N.t('baby-name.noble_dignified'),I18N.t('baby-name.pure_clear')],stroke:11},
    {name:I18N.t('baby-name.yerin'),hanja:'藝璘',meaning:I18N.t('baby-name.artistic_sensibility_shining_talent'),vibes:[I18N.t('baby-name.bright_lively'),I18N.t('baby-name.wise_bright')],stroke:15},
    {name:I18N.t('baby-name.naeun'),hanja:'娜恩',meaning:I18N.t('baby-name.beautiful_gracious_child'),vibes:[I18N.t('baby-name.warm_gentle'),I18N.t('baby-name.blessed_fortune')],stroke:11},
    {name:I18N.t('baby-name.soyul'),hanja:'小律',meaning:I18N.t('baby-name.small_but_rhythmic_life'),vibes:[I18N.t('baby-name.pure_clear'),I18N.t('baby-name.warm_gentle')],stroke:8},
    {name:I18N.t('baby-name.harin'),hanja:'夏璘',meaning:I18N.t('baby-name.child_who_sparkles_like_summer'),vibes:[I18N.t('baby-name.bright_lively'),I18N.t('baby-name.nature_inspired')],stroke:13},
    {name:I18N.t('baby-name.daon'),hanja:'多溫',meaning:I18N.t('baby-name.child_full_warmth'),vibes:[I18N.t('baby-name.warm_gentle'),I18N.t('baby-name.blessed_fortune')],stroke:9},
    {name:I18N.t('baby-name.sieun'),hanja:'詩恩',meaning:I18N.t('baby-name.child_beautiful_gracious_as_poem'),vibes:[I18N.t('baby-name.noble_dignified'),I18N.t('baby-name.pure_clear')],stroke:12},
    {name:I18N.t('baby-name.gaon'),hanja:'佳溫',meaning:I18N.t('baby-name.beautiful_warm_child'),vibes:[I18N.t('baby-name.warm_gentle'),I18N.t('baby-name.nature_inspired')],stroke:9},
    {name:I18N.t('baby-name.iden'),hanja:'二燉',meaning:I18N.t('baby-name.child_place_abundant_as_eden'),vibes:[I18N.t('baby-name.blessed_fortune'),I18N.t('baby-name.pure_clear')],stroke:8},
    {name:I18N.t('baby-name.yoona'),hanja:'尹雅',meaning:I18N.t('baby-name.upright_graceful_child'),vibes:[I18N.t('baby-name.noble_dignified'),I18N.t('baby-name.wise_bright')],stroke:9},
    {name:I18N.t('baby-name.sori'),hanja:'率伊',meaning:I18N.t('baby-name.child_as_upright_as_pine'),vibes:[I18N.t('baby-name.nature_inspired'),I18N.t('baby-name.strong_brave')],stroke:8},
  ]
};

const vg = document.getElementById('vibeGrid');
VIBES.forEach(v=>{
  const btn = document.createElement('button');
  btn.className='vibe-btn'; btn.textContent=v;
  btn.onclick=()=>{
    btn.classList.toggle('active');
    selectedVibes = selectedVibes.includes(v) ? selectedVibes.filter(x=>x!==v) : [...selectedVibes, v];
  };
  vg.appendChild(btn);
});

function setGender(btn, g){
  document.querySelectorAll('.gender-row .pill-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); genderVal=g;
}

function generate(){
  const surname = document.getElementById('surname').value.trim() || '';
  let pool = [];
  if(genderVal==='boy') pool = NAMES.boy;
  else if(genderVal==='girl') pool = NAMES.girl;
  else pool = [...NAMES.boy, ...NAMES.girl];

  let filtered = pool;
  if(selectedVibes.length > 0){
    filtered = pool.filter(n => selectedVibes.some(v => n.vibes.includes(v)));
  }
  if(!filtered.length) filtered = pool;

  // shuffle
  filtered = filtered.sort(()=>Math.random()-.5).slice(0,6);

  document.getElementById('resultTitle').textContent = I18N.t('baby-name.name_suggestions', {surname: surname ? surname+' ' : '', count: filtered.length});
  document.getElementById('nameList').innerHTML = filtered.map(n=>`
    <div class="name-card">
      <div class="name-full">${surname}${n.name}</div>
      <div class="name-hanja">${I18N.t('baby-name.strokes', {hanja: n.hanja, stroke: n.stroke})}</div>
      <div class="name-meaning">${n.meaning}</div>
      <span class="name-stroke">${n.vibes.join(' · ')}</span>
    </div>`).join('');

  document.getElementById('results').classList.remove('hidden');
}
