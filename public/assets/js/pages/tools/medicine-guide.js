/**
 * 페이지 스크립트 — tools/medicine-guide.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
const DRUGS = [
  {id:'antibiotic',emoji:'💊',name:I18N.t('medicine-guide.antibiotics'),color:'var(--primary)',
   points:[I18N.t('medicine-guide.finish_entire_prescribed_period_never'),I18N.t('medicine-guide.can_be_taken_regardless_meals'),I18N.t('medicine-guide.diarrhea_may_occur_during_treatment'),I18N.t('medicine-guide.check_whether_refrigeration_needed_syr'),I18N.t('medicine-guide.don_t_reuse_leftover_medicine')],
   qa:[{q:I18N.t('medicine-guide.why_does_my_child_get'),a:I18N.t('medicine-guide.because_antibiotics_also_kill_benefici')},{q:I18N.t('medicine-guide.can_i_use_leftover_antibiotics'),a:I18N.t('medicine-guide.no_antibiotics_differ_by_type')}]},
  {id:'digestive',emoji:'🫄',name:I18N.t('medicine-guide.digestive_aids_stomach_bug_meds'),color:'var(--amber)',
   points:[I18N.t('medicine-guide.take_after_meals_as_rule'),I18N.t('medicine-guide.early_gastroenteritis_feeding_small_am'),I18N.t('medicine-guide.when_vomiting_severe_start_small'),I18N.t('medicine-guide.using_electrolyte_drink_such_as'),I18N.t('medicine-guide.never_give_anti_diarrheals_children')],
   qa:[{q:I18N.t('medicine-guide.should_my_child_drink_lots'),a:I18N.t('medicine-guide.drinking_lot_once_can_trigger')},{q:I18N.t('medicine-guide.my_child_threw_up_whole'),a:I18N.t('medicine-guide.if_they_vomited_within_30')}]},
  {id:'steroid',emoji:'💉',name:I18N.t('medicine-guide.steroids_inhaled_oral'),color:'var(--red)',
   points:[I18N.t('medicine-guide.follow_prescribed_period_dose_exactly'),I18N.t('medicine-guide.rinse_mouth_after_using_inhaled'),I18N.t('medicine-guide.oral_steroids_best_taken_after'),I18N.t('medicine-guide.long_term_use_may_affect'),I18N.t('medicine-guide.meant_acute_treatment_so_stop')],
   qa:[{q:I18N.t('medicine-guide.aren_t_steroids_dangerous_children'),a:I18N.t('medicine-guide.short_term_prescriptions_safe_stopping')},{q:I18N.t('medicine-guide.do_i_have_use_inhaled'),a:I18N.t('medicine-guide.preventive_inhalers_only_work_if')}]},
  {id:'antihistamine',emoji:'🌸',name:I18N.t('medicine-guide.antihistamines_allergy_runny_nose'),color:'var(--purple)',
   points:[I18N.t('medicine-guide.first_generation_antihistamines_cause'),I18N.t('medicine-guide.second_generation_ones_cetirizine_lora'),I18N.t('medicine-guide.can_be_taken_before_after'),I18N.t('medicine-guide.antihistamines_alone_may_not_fix'),I18N.t('medicine-guide.under_2_years_old_use')],
   qa:[{q:I18N.t('medicine-guide.my_child_s_nose_very'),a:I18N.t('medicine-guide.under_2_years_old_never')},{q:I18N.t('medicine-guide.do_allergy_meds_need_be'),a:I18N.t('medicine-guide.allergic_reactions_build_up_continued')}]},
  {id:'nebulizer',emoji:'🌬️',name:I18N.t('medicine-guide.inhalation_therapy_nebulizer'),color:'var(--blue)',
   points:[I18N.t('medicine-guide.mask_must_cover_both_nose'),I18N.t('medicine-guide.each_session_takes_about_5'),I18N.t('medicine-guide.wash_cup_mask_under_running'),I18N.t('medicine-guide.have_them_blow_their_nose'),I18N.t('medicine-guide.inhalation_less_effective_while_crying')],
   qa:[{q:I18N.t('medicine-guide.my_child_cries_won_t'),a:I18N.t('medicine-guide.showing_favorite_video_distracting_toy')},{q:I18N.t('medicine-guide.how_often_should_i_clean'),a:I18N.t('medicine-guide.wash_cup_mask_after_every')}]},
];

const tabsEl=document.getElementById('drugTabs');
const panelsEl=document.getElementById('drugPanels');
DRUGS.forEach((d,i)=>{
  const tab=document.createElement('button');
  tab.className='drug-tab'+(i===0?' active':'');
  tab.textContent=`${d.emoji} ${d.name}`;
  tab.onclick=()=>{
    document.querySelectorAll('.drug-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.drug-panel').forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-'+d.id).classList.add('active');
  };
  tabsEl.appendChild(tab);

  const panel=document.createElement('div');
  panel.className='drug-panel'+(i===0?' active':'');
  panel.id='panel-'+d.id;
  panel.innerHTML=`
    <div class="drug-header"><span class="drug-emoji">${d.emoji}</span><h2>${d.name}</h2></div>
    <h3 class="sub-title">${I18N.t('medicine-guide.dosing_rules')}</h3>
    <ul class="point-list">${d.points.map(p=>`<li>${p}</li>`).join('')}</ul>
    <h3 class="sub-title" style="margin-top:1rem;">${I18N.t('medicine-guide.faq')}</h3>
    ${d.qa.map(q=>`<div class="info-box" style="margin-bottom:8px;"><p><strong>Q. ${q.q}</strong><br>${q.a}</p></div>`).join('')}
  `;
  panelsEl.appendChild(panel);
});
