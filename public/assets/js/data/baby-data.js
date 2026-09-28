/**
 * 내 아이 시스템 데이터 — 예방접종 일정 · 연속 방문 뱃지
 * ------------------------------------------------------------------
 * · vaccineSchedule : 질병관리청 국가필수예방접종 표준 일정을 "간소화한 참고용" 정보입니다.
 *                     수정할 때는 growth.html 의 안내 문구도 함께 검토하세요.
 * · badges          : 연속 방문 일수(days)별 뱃지.
 * 문구는 I18N.t(키) 로 다국어 처리됩니다.
 * 로드 순서: i18n.js → (이 파일) → baby.js
 */
window.NORIYA_DATA = window.NORIYA_DATA || {};
window.NORIYA_DATA.vaccineSchedule = [
    { key: 'hepb1', name: I18N.t('common.hepatitis_b_dose_1'), monthsAge: 0 },
    { key: 'bcg', name: I18N.t('common.bcg_tuberculosis'), monthsAge: 1 },
    { key: 'hepb2', name: I18N.t('common.hepatitis_b_dose_2'), monthsAge: 1 },
    { key: 'dtap1', name: I18N.t('common.dtap_dose_1_diphtheria_tetanus'), monthsAge: 2 },
    { key: 'ipv1', name: I18N.t('common.ipv_dose_1_polio'), monthsAge: 2 },
    { key: 'hib1', name: I18N.t('common.hib_dose_1'), monthsAge: 2 },
    { key: 'pcv1', name: I18N.t('common.pneumococcal_dose_1'), monthsAge: 2 },
    { key: 'rv1', name: I18N.t('common.rotavirus_dose_1'), monthsAge: 2 },
    { key: 'dtap2', name: I18N.t('common.dtap_dose_2'), monthsAge: 4 },
    { key: 'ipv2', name: I18N.t('common.ipv_dose_2'), monthsAge: 4 },
    { key: 'hib2', name: I18N.t('common.hib_dose_2'), monthsAge: 4 },
    { key: 'pcv2', name: I18N.t('common.pneumococcal_dose_2'), monthsAge: 4 },
    { key: 'dtap3', name: I18N.t('common.dtap_dose_3'), monthsAge: 6 },
    { key: 'hepb3', name: I18N.t('common.hepatitis_b_dose_3'), monthsAge: 6 },
    { key: 'hib3', name: I18N.t('common.hib_dose_3'), monthsAge: 6 },
    { key: 'pcv3', name: I18N.t('common.pneumococcal_dose_3'), monthsAge: 6 },
    { key: 'flu', name: I18N.t('common.influenza_yearly'), monthsAge: 6 },
    { key: 'mmr1', name: I18N.t('common.mmr_dose_1_measles_mumps'), monthsAge: 12 },
    { key: 'varicella', name: I18N.t('common.chickenpox'), monthsAge: 12 },
    { key: 'hepa1', name: I18N.t('common.hepatitis_dose_1'), monthsAge: 12 },
    { key: 'je1', name: I18N.t('common.japanese_encephalitis_inactivated_dose'), monthsAge: 12 },
    { key: 'pcv4', name: I18N.t('common.pneumococcal_dose_4'), monthsAge: 12 },
    { key: 'hib4', name: I18N.t('common.hib_dose_4'), monthsAge: 12 },
    { key: 'dtap4', name: I18N.t('common.dtap_dose_4'), monthsAge: 15 },
    { key: 'hepa2', name: I18N.t('common.hepatitis_dose_2'), monthsAge: 18 },
  ];
window.NORIYA_DATA.badges = [
    { id: 'd3', days: 3, emoji: '🌱', name: I18N.t('common.sprout_visitor'), desc: I18N.t('common.3_day_visit_streak') },
    { id: 'd7', days: 7, emoji: '🔥', name: I18N.t('common.week_champion'), desc: I18N.t('common.7_day_visit_streak') },
    { id: 'd14', days: 14, emoji: '⭐', name: I18N.t('common.2_week_perfect_attendance'), desc: I18N.t('common.14_day_visit_streak') },
    { id: 'd30', days: 30, emoji: '🏆', name: I18N.t('common.monthly_master'), desc: I18N.t('common.30_day_visit_streak') },
    { id: 'd100', days: 100, emoji: '💎', name: I18N.t('common.100_day_record'), desc: I18N.t('common.100_day_visit_streak') },
    { id: 'd365', days: 365, emoji: '👑', name: I18N.t('common.year_together'), desc: I18N.t('common.365_day_visit_streak') },
  ];
