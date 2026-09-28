/**
 * 도구 카탈로그 — 사이트에서 제공하는 계산기/체크리스트의 유일한 원본 데이터
 * ------------------------------------------------------------------
 * 이 배열 하나를 고치면 다음이 자동으로 함께 바뀝니다.
 *   · 상단 메가메뉴 / 모바일 슬라이드 메뉴 / 검색 오버레이
 *   · 홈 카테고리 칩, 홈 도구 카드 그리드, 카테고리 사이 인피드 광고 위치
 *   · 도구 검색(data-name) 키워드
 * 문구는 모두 I18N.t(키) 로 다국어 처리됩니다
 * (assets/i18n/locales/<언어>/common.js). kwKo 는 한국어 검색어(언어와 무관하게 검색되도록 유지).
 *
 * 로드 순서: i18n.js → config.js → (이 파일) → partials.js  (모두 defer 이므로 문서 순서대로 실행)
 * 새 도구 추가: `npm run new:tool` 이 이 파일에 넣을 코드 조각을 안내해 줍니다. (README 참고)
 */
window.NORIYA_DATA = window.NORIYA_DATA || {};
window.NORIYA_DATA.toolCategories = [
    {
      id: '수면수유', icon: '🌙', title: I18N.t('common.feeding_sleep'), iconBg: 'var(--primary-light)',
      desc: I18N.t('common.how_many_times_day_feed'),
      tools: [
        { href: 'tools/sleep-calculator.html', emoji: '😴', name: I18N.t('common.baby_sleep_cycle_calculator'), desc: I18N.t('common.bedtime_calculate_best_wake_up'), badge: 'hot', kwKo: '아기 수면 사이클 계산기 취침 기상 낮잠', keywords: I18N.t('common.baby_sleep_cycle_calculator_bedtime') },
        { href: 'tools/feeding-tracker.html', emoji: '🍼', name: I18N.t('common.feeding_interval_timer_log'), desc: I18N.t('common.log_feeding_times_calculate_average'), badge: 'hot', kwKo: '수유 간격 타이머 모유 분유 기록', keywords: I18N.t('common.feeding_interval_timer_breast_milk') },
        { href: 'tools/colic-checker.html', emoji: '😭', name: I18N.t('common.infant_colic_checker_soothing_guide'), desc: I18N.t('common.check_colic_5s_soothing_methods'), badge: 'new', kwKo: '영아산통 체크 달래기 이유없이 울어요 보챔', keywords: I18N.t('common.infant_colic_check_soothing_crying') }
      ]
    },
    {
      id: '이유식영양', icon: '🥣', title: I18N.t('common.weaning_nutrition'), iconBg: 'var(--amber-light)',
      desc: I18N.t('common.age_appropriate_ingredients_nutrition'),
      tools: [
        { href: 'tools/weaning-checker.html', emoji: '🥦', name: I18N.t('common.weaning_ingredient_age_checker'), desc: I18N.t('common.sorted_into_foods_safe_by'), badge: 'popular', kwKo: '이유식 재료 월령 체커 알레르기 초기 중기 후기', keywords: I18N.t('common.weaning_ingredient_age_checker_allergy') },
        { href: 'tools/milk-calculator.html', emoji: '🥛', name: I18N.t('common.formula_feeding_amount_calculator'), desc: I18N.t('common.automatic_daily_recommended_feeding_am'), badge: 'new', kwKo: '분유 모유 수유량 계산기 하루 권장량', keywords: I18N.t('common.formula_breast_milk_feeding_amount') },
        { href: 'tools/weaning-planner.html', emoji: '📅', name: I18N.t('common.weaning_schedule_planner'), desc: I18N.t('common.automatically_generate_weekly_weaning'), badge: 'new', kwKo: '이유식 스케줄 플래너 주간 계획표 식단', keywords: I18N.t('common.weaning_schedule_planner_weekly_plan') }
      ],
      adSlotAfter: 'INFEED_1'
    },
    {
      id: '성장발달', icon: '📏', title: I18N.t('common.growth_development'), iconBg: 'var(--blue-light)',
      desc: I18N.t('common.check_height_weight_developmental_mile'),
      tools: [
        { href: 'tools/growth-percentile.html', emoji: '📊', name: I18N.t('common.child_growth_percentile_calculator'), desc: I18N.t('common.enter_height_weight_who_based'), badge: 'hot', kwKo: '성장 백분위수 키 몸무게 머리둘레 WHO', keywords: I18N.t('common.growth_percentile_height_weight_head') },
        { href: 'tools/milestone-checker.html', emoji: '✅', name: I18N.t('common.developmental_milestone_checklist'), desc: I18N.t('common.check_motor_language_social_developmen'), badge: 'popular', kwKo: '발달 마일스톤 체크리스트 월령 언어 운동', keywords: I18N.t('common.developmental_milestone_checklist_age') },
        { href: 'tools/tooth-checker.html', emoji: '🦷', name: I18N.t('common.tooth_eruption_checker'), desc: I18N.t('common.when_teeth_come_by_age'), badge: 'new', kwKo: '유치 발육 이앓이 시기 체커 이가 나요', keywords: I18N.t('common.tooth_eruption_teething_timing_checker') }
      ]
    },
    {
      id: '건강응급', icon: '💊', title: I18N.t('common.health_emergency'), iconBg: 'var(--red-light)',
      desc: I18N.t('common.tools_use_right_away_when'),
      tools: [
        { href: 'tools/fever-medicine.html', emoji: '🌡️', name: I18N.t('common.pediatric_fever_medicine_dose_calculat'), desc: I18N.t('common.enter_weight_instantly_calculate_exact'), badge: 'hot', kwKo: '소아 해열제 용량 계산기 타이레놀 부루펜 체중', keywords: I18N.t('common.pediatric_fever_medicine_dose_calculat_2') },
        { href: 'tools/fever-tracker.html', emoji: '📋', name: I18N.t('common.temperature_log_fever_medicine_alterna'), desc: I18N.t('common.log_temperature_changes_tylenol_brufen'), badge: 'new', kwKo: '체온 기록 열 추이 그래프 해열제 교차', keywords: I18N.t('common.temperature_log_fever_trend_chart') },
        { href: 'tools/medicine-guide.html', emoji: '💉', name: I18N.t('common.pediatric_medicine_guide_by_type'), desc: I18N.t('common.guidance_proper_use_antibiotics_digest'), badge: 'new', kwKo: '소아 약 종류 복용 가이드 항생제 소화제 흡입', keywords: I18N.t('common.pediatric_medicine_type_dosing_guide') }
      ],
      adSlotAfter: 'INFEED_2'
    },
    {
      id: '임신행정', icon: '🤰', title: I18N.t('common.pregnancy_admin'), iconBg: '#FDEFF3',
      desc: I18N.t('common.from_pregnancy_prep_government_benefit'),
      tools: [
        { href: 'tools/pregnancy-week.html', emoji: '🤰', name: I18N.t('common.pregnancy_week_due_date_calculator'), desc: I18N.t('common.period_ultrasound_date_current_week'), badge: 'hot', kwKo: '임신 주수 계산기 출산 예정일 태아 크기', keywords: I18N.t('common.pregnancy_week_calculator_due_date') },
        { href: 'tools/birth-checklist.html', emoji: '🎒', name: I18N.t('common.birth_preparation_checklist'), desc: I18N.t('common.from_hospital_bag_newborn_essentials'), badge: 'new', kwKo: '출산 준비물 체크리스트 입원 가방 신생아 용품', keywords: I18N.t('common.birth_preparation_checklist_hospital_b') },
        { href: 'tools/subsidy-calculator.html', emoji: '💰', name: I18N.t('common.parenting_benefits_calculator'), desc: I18N.t('common.total_amounts_can_receive_parental'), badge: 'hot', kwKo: '아동수당 부모급여 육아지원금 계산기 첫만남이용권', keywords: I18N.t('common.child_allowance_parental_pay_parenting') },
        { href: 'tools/parental-leave.html', emoji: '📝', name: I18N.t('common.parental_leave_pay_calculator'), desc: I18N.t('common.enter_ordinary_wage_monthly_parental'), badge: 'new', kwKo: '육아휴직 급여 계산기 통상임금 6+6', keywords: I18N.t('common.parental_leave_pay_calculator_ordinary') },
        { href: 'tools/school-date.html', emoji: '🎒', name: I18N.t('common.admission_date_calculator'), desc: I18N.t('common.birth_date_automatically_calculate_day'), badge: 'popular', kwKo: '어린이집 유치원 입소 날짜 초등학교 입학 연도', keywords: I18N.t('common.daycare_kindergarten_admission_date_el') },
        { href: 'tools/baby-name.html', emoji: '✨', name: I18N.t('common.baby_name_helper'), desc: I18N.t('common.surname_desired_feel_name_candidates'), badge: 'popular', kwKo: '아기 이름 짓기 한자 획수 뜻 태명', keywords: I18N.t('common.baby_naming_hanja_strokes_meaning') }
      ]
    }
  ];
