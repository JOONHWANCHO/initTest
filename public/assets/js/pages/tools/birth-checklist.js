/**
 * 페이지 스크립트 — tools/birth-checklist.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
const CHECKLIST = [
  {cat:I18N.t('birth-checklist.hospital_documents_valuables'),items:[I18N.t('birth-checklist.id_card_mother_guardian'),I18N.t('birth-checklist.maternity_health_handbook'),I18N.t('birth-checklist.health_insurance_card'),I18N.t('birth-checklist.hospital_appointment_confirmation'),I18N.t('birth-checklist.card_cash_delivery_costs'),I18N.t('birth-checklist.smartphone_charger')]},
  {cat:I18N.t('birth-checklist.mom_s_clothing_hygiene'),items:[I18N.t('birth-checklist.2_3_nursing_bras'),I18N.t('birth-checklist.2_front_opening_pajamas'),I18N.t('birth-checklist.postpartum_pads_large'),I18N.t('birth-checklist.toiletries_toothbrush_toothpaste_face'),I18N.t('birth-checklist.slippers'),I18N.t('birth-checklist.2_travel_towels'),I18N.t('birth-checklist.postpartum_belly_band')]},
  {cat:I18N.t('birth-checklist.newborn_clothing_diapers'),items:[I18N.t('birth-checklist.5_newborn_gowns'),I18N.t('birth-checklist.3_undershirts_newborn_1_month'),I18N.t('birth-checklist.2_sets_mittens_booties'),I18N.t('birth-checklist.2_hats'),I18N.t('birth-checklist.1_pack_newborn_diapers'),I18N.t('birth-checklist.2_3_packs_wipes'),I18N.t('birth-checklist.1_2_receiving_blankets')]},
  {cat:I18N.t('birth-checklist.feeding_bedding'),items:[I18N.t('birth-checklist.nursing_pillow'),I18N.t('birth-checklist.breast_milk_storage_bags'),I18N.t('birth-checklist.nipple_cream_lanolin'),I18N.t('birth-checklist.2_4_baby_bottles_check'),I18N.t('birth-checklist.bottle_cleaner'),I18N.t('birth-checklist.baby_bed_bumbo_seat'),I18N.t('birth-checklist.sleep_vest_inner_swaddle')]},
  {cat:I18N.t('birth-checklist.bath_skin_care'),items:[I18N.t('birth-checklist.baby_bathtub'),I18N.t('birth-checklist.baby_shampoo_body_wash'),I18N.t('birth-checklist.baby_lotion'),I18N.t('birth-checklist.newborn_bath_robe'),I18N.t('birth-checklist.cotton_swabs_baby'),I18N.t('birth-checklist.nail_scissors_baby'),I18N.t('birth-checklist.umbilical_cord_disinfecting_set')]},
  {cat:I18N.t('birth-checklist.going_out_transport'),items:[I18N.t('birth-checklist.car_seat_newborn_installed'),I18N.t('birth-checklist.stroller_baby_carrier'),I18N.t('birth-checklist.diaper_bag'),I18N.t('birth-checklist.travel_bottles_thermos'),I18N.t('birth-checklist.2_spare_outfits_outings'),I18N.t('birth-checklist.car_seat_cover_blanket')]},
  {cat:I18N.t('birth-checklist.home_prep'),items:[I18N.t('birth-checklist.baby_bed_set_up'),I18N.t('birth-checklist.thermo_hygrometer_installed_baby_s'),I18N.t('birth-checklist.air_purifier_installed'),I18N.t('birth-checklist.baby_laundry_detergent_ready'),I18N.t('birth-checklist.baby_sink_tub_set_up'),I18N.t('birth-checklist.anti_fall_pads_installed'),I18N.t('birth-checklist.humidifier_filter_replaced')]},
  {cat:I18N.t('birth-checklist.admin_insurance'),items:[I18N.t('birth-checklist.birth_registration_documents_ready'),I18N.t('birth-checklist.check_how_apply_child_allowance'),I18N.t('birth-checklist.check_how_apply_parental_pay'),I18N.t('birth-checklist.prepare_apply_first_meeting_voucher'),I18N.t('birth-checklist.book_postpartum_newborn_care_worker'),I18N.t('birth-checklist.confirm_infant_insurance_enrollment'),I18N.t('birth-checklist.check_national_happiness_card_balance')]},
];

let checks = JSON.parse(localStorage.getItem('birthChecks')||'{}');

function render(){
  const wrap=document.getElementById('checklistWrap');
  let totalItems=0,totalChecked=0;
  wrap.innerHTML=CHECKLIST.map((cat,ci)=>{
    const items=cat.items;
    const catChecked=items.filter((_,ii)=>checks[`${ci}-${ii}`]).length;
    totalItems+=items.length; totalChecked+=catChecked;
    return `<div class="card check-category">
      <h3>${cat.cat} <span style="margin-left:auto;font-size:11px;font-weight:500;color:var(--text-muted);">${catChecked}/${items.length}</span></h3>
      <div class="progress-wrap" style="height:6px;margin-bottom:.75rem;"><div class="progress-fill" style="width:${items.length?catChecked/items.length*100:0}%"></div></div>
      <div class="check-items">${items.map((item,ii)=>{
        const key=`${ci}-${ii}`;
        const done=!!checks[key];
        return `<div class="check-item${done?' done':''}" onclick="toggle('${key}',this)">
          <input type="checkbox" ${done?'checked':''} onclick="event.stopPropagation()">
          <label>${item}</label>
        </div>`;
      }).join('')}</div>
    </div>`;
  }).join('');
  const pct=totalItems?Math.round(totalChecked/totalItems*100):0;
  document.getElementById('totalBar').style.width=pct+'%';
  document.getElementById('totalText').textContent=I18N.t('birth-checklist.items_done', {totalChecked, totalItems, pct});
}

function toggle(key,el){
  checks[key]=!checks[key];
  localStorage.setItem('birthChecks',JSON.stringify(checks));
  el.classList.toggle('done',checks[key]);
  el.querySelector('input').checked=checks[key];
  updateTotal();
}

function updateTotal(){
  let total=0,done=0;
  CHECKLIST.forEach((c,ci)=>c.items.forEach((_,ii)=>{total++;if(checks[`${ci}-${ii}`])done++;}));
  const pct=Math.round(done/total*100);
  document.getElementById('totalBar').style.width=pct+'%';
  document.getElementById('totalText').textContent=I18N.t('birth-checklist.items_done_2', {done, total, pct});
}

function resetAll(){
  if(!confirm(I18N.t('birth-checklist.reset_all_checks')))return;
  checks={};localStorage.removeItem('birthChecks');render();
}

render();
