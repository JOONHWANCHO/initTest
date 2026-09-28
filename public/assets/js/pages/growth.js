/**
 * 페이지 스크립트 — growth.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  const WEANING_STAGES = [
    { max: 4, label: I18N.t('growth.breast_milk_formula_stage'), desc: I18N.t('growth.weaning_usually_starts_around_4') },
    { max: 6, label: I18N.t('growth.early_weaning_pur_e'), desc: I18N.t('growth.try_one_food_time_watch') },
    { max: 9, label: I18N.t('growth.mid_weaning_porridge'), desc: I18N.t('growth.stage_gradually_adding_more_texture') },
    { max: 12, label: I18N.t('growth.late_weaning_thick_porridge'), desc: I18N.t('growth.stage_where_practicing_chewing_their') },
    { max: 999, label: I18N.t('growth.toddler_food'), desc: I18N.t('growth.transition_soft_rice_side_dishes') },
  ];
  function weaningStage(months) {
    return WEANING_STAGES.find((s) => months < s.max) || WEANING_STAGES[WEANING_STAGES.length - 1];
  }

  let chartInstance = null;

  function render() {
    if (!window.BabyProfile) return;
    const BP = window.BabyProfile;
    const profile = BP.getProfile();

    renderProfileDisplay(profile);
    renderTodaySection(profile);
    renderStreakAndBadges();
    renderVaccineSection(profile);
    renderGrowthSection(profile);
  }

  function renderProfileDisplay(profile) {
    const el = document.getElementById('profileDisplay');
    const genderGroup = document.getElementById('pfGenderGroup');
    if (profile && profile.birthdate) {
      const info = window.BabyProfile.ageInfo(profile.birthdate);
      el.innerHTML =
        `<div class="profile-chip-row"><div class="profile-chip"><span class="pc-emoji">${(profile.gender === 'F' ? '👧' : profile.gender === 'M' ? '👦' : '👶')}</span><div><div class="pc-name">${escapeHtml(profile.name || I18N.t('common.our_baby'))}</div><div class="pc-age">${(info ? info.text : '')}</div></div></div><div class="profile-chip-actions"><button type="button" id="pfResetBtn">${I18N.t('growth.delete_info')}</button></div></div>`;

      const resetBtn = document.getElementById('pfResetBtn');
      if (resetBtn) {
        resetBtn.onclick = function () {
          if (confirm(I18N.t('growth.this_will_delete_all_saved'))) {
            window.BabyProfile.clearProfile();
            document.getElementById('profileForm').reset();
            render();
          }
        };
      }

      document.getElementById('pfName').value = profile.name || '';
      document.getElementById('pfBirthdate').value = profile.birthdate || '';
      Array.from(genderGroup.children).forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.g === (profile.gender || ''));
      });
    } else {
      el.innerHTML = '';
    }
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('#pfGenderGroup .pill-btn');
    if (!btn) return;
    Array.from(btn.parentElement.children).forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  });

  ready(function () {
    const form = document.getElementById('profileForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('pfName').value.trim();
      const birthdate = document.getElementById('pfBirthdate').value;
      const genderBtn = document.querySelector('#pfGenderGroup .pill-btn.active');
      const gender = genderBtn ? genderBtn.dataset.g : '';
      if (!birthdate) { alert(I18N.t('growth.please_enter_birth_date_due')); return; }
      window.BabyProfile.saveProfile({ name: name, birthdate: birthdate, gender: gender });
      window.BabyProfile.renderNavBadge();
      if (typeof window.BabyProfile.renderHomeDashboard === 'function') window.BabyProfile.renderHomeDashboard();
      render();
    });

    document.getElementById('growthForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const date = document.getElementById('grDate').value || window.BabyProfile.todayStr();
      const weight = document.getElementById('grWeight').value;
      const height = document.getElementById('grHeight').value;
      const note = document.getElementById('grNote').value;
      if (!weight && !height) { alert(I18N.t('growth.please_enter_least_weight_height')); return; }
      window.BabyProfile.addRecord({ date: date, weight: weight, height: height, note: note });
      this.reset();
      renderStreakAndBadges();
      renderGrowthSection(window.BabyProfile.getProfile());
    });

    render();
  });

  function renderTodaySection(profile) {
    const section = document.getElementById('todaySection');
    if (!profile || !profile.birthdate) { section.classList.add('hidden'); return; }
    const info = window.BabyProfile.ageInfo(profile.birthdate);
    section.classList.remove('hidden');
    document.getElementById('tcAge').textContent = info.text;
    document.getElementById('tcAgeSub').textContent = info.isUnborn ? I18N.t('growth.not_born_yet') : (I18N.t('growth.day_since_birth', {days: info.days}));

    if (info.isUnborn) {
      document.getElementById('tcWeaning').textContent = I18N.t('growth.preparing_birth');
      document.getElementById('tcWeaningSub').textContent = I18N.t('growth.check_birth_preparation_checklist');
    } else {
      const stage = weaningStage(info.months);
      document.getElementById('tcWeaning').textContent = stage.label;
      document.getElementById('tcWeaningSub').textContent = stage.desc;
    }
  }

  function renderStreakAndBadges() {
    const streak = window.BabyProfile.getStreak();
    document.getElementById('streakCurrent').textContent = I18N.t('growth.day_visit_streak', {current: streak.current});
    document.getElementById('streakSub').textContent = I18N.t('growth.total_visits_best_streak_days', {streak: (streak.totalDays || 0), streak2: (streak.longest || 0)});

    const defs = window.BabyProfile.getBadgeDefs();
    const grid = document.getElementById('badgeGrid');
    grid.innerHTML = defs.map((b) => {
      const earned = streak.badges && streak.badges.indexOf(b.id) !== -1;
      return '<div class="badge-item' + (earned ? '' : ' locked') + '">' +
        '<div class="bi-emoji">' + b.emoji + '</div>' +
        '<div class="bi-name">' + b.name + '</div>' +
        '<div class="bi-desc">' + b.desc + '</div></div>';
    }).join('');
  }

  function renderVaccineSection(profile) {
    const section = document.getElementById('vaccineSection');
    if (!profile || !profile.birthdate) { section.classList.add('hidden'); return; }
    const info = window.BabyProfile.ageInfo(profile.birthdate);
    if (info.isUnborn) { section.classList.add('hidden'); return; }
    section.classList.remove('hidden');

    const list = window.BabyProfile.getVaccineList(profile.birthdate);
    const upcoming = list.filter((v) => !v.done);
    const done = list.filter((v) => v.done);

    document.getElementById('vacUpcoming').innerHTML = upcoming.length
      ? upcoming.map(vacRowHtml).join('')
      : `<div class="empty-note">${I18N.t('growth.ve_completed_all_registered_vaccinatio')}</div>`;
    document.getElementById('vacDone').innerHTML = done.map(vacRowHtml).join('');
    document.getElementById('vacDoneSummary').textContent = I18N.t('growth.show_completed_vaccinations_2', {count: done.length});

    document.querySelectorAll('.vac-check').forEach((cb) => {
      cb.addEventListener('change', function () {
        window.BabyProfile.setVaccineDone(this.dataset.key, this.checked);
        renderVaccineSection(window.BabyProfile.getProfile());
      });
    });
  }

  function vacRowHtml(v) {
    let dueBadgeClass = 'chip-gray', dueText = v.dueDate;
    if (v.done) { dueBadgeClass = 'chip-green'; dueText = I18N.t('growth.done'); }
    else if (v.status === 'overdue') { dueBadgeClass = 'chip-red'; dueText = I18N.t('growth.d_overdue', {abs: Math.abs(v.dday)}); }
    else if (v.status === 'soon') { dueBadgeClass = 'chip-amber'; dueText = 'D-' + v.dday; }
    else { dueBadgeClass = 'chip-blue'; dueText = v.dueDate; }
    return '<div class="vac-row' + (v.done ? ' is-done' : '') + '">' +
      '<input type="checkbox" class="vac-check" data-key="' + v.key + '" ' + (v.done ? 'checked' : '') + '>' +
      '<span class="vac-name">' + v.name + '</span>' +
      '<span class="vac-due chip ' + dueBadgeClass + '">' + dueText + '</span></div>';
  }

  function renderGrowthSection(profile) {
    const section = document.getElementById('growthLogSection');
    if (!profile || !profile.birthdate) { section.classList.add('hidden'); return; }
    section.classList.remove('hidden');

    const records = window.BabyProfile.getRecords();
    const historyEl = document.getElementById('growthHistory');
    historyEl.innerHTML = records.length
      ? records.slice().reverse().map((r) => {
          const vals = [r.weight ? r.weight + 'kg' : '', r.height ? r.height + 'cm' : ''].filter(Boolean).join(' · ');
          return '<div class="gh-row"><span class="gh-date">' + r.date + '</span>' +
            '<span class="gh-vals">' + vals + (r.note ? ' <span class="gh-note">— ' + escapeHtml(r.note) + '</span>' : '') + '</span>' +
            '<button class="gh-del" data-id="' + r.id + '" aria-label="' + (I18N.t('growth.delete')) + '">✕</button></div>';
        }).join('')
      : `<div class="empty-note">${I18N.t('growth.no_records_yet_add_first')}</div>`;

    historyEl.querySelectorAll('.gh-del').forEach((btn) => {
      btn.addEventListener('click', function () {
        window.BabyProfile.deleteRecord(this.dataset.id);
        renderGrowthSection(window.BabyProfile.getProfile());
      });
    });

    drawChart(records);
  }

  function drawChart(records) {
    const canvas = document.getElementById('growthChart');
    if (!canvas || typeof Chart === 'undefined') return;
    const labels = records.map((r) => r.date.slice(5));
    const weights = records.map((r) => (r.weight != null ? r.weight : null));
    const heights = records.map((r) => (r.height != null ? r.height : null));

    if (chartInstance) chartInstance.destroy();
    if (!records.length) return;

    chartInstance = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: I18N.t('growth.weight_kg'), data: weights, yAxisID: 'y', spanGaps: true,
            borderColor: '#4A7C59', backgroundColor: '#4A7C59', tension: .3, pointRadius: 3,
          },
          {
            label: I18N.t('growth.height_cm'), data: heights, yAxisID: 'y1', spanGaps: true,
            borderColor: '#E9A825', backgroundColor: '#E9A825', tension: .3, pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
        scales: {
          y: { type: 'linear', position: 'left', title: { display: true, text: 'kg', font: { size: 10 } }, ticks: { font: { size: 10 } } },
          y1: { type: 'linear', position: 'right', title: { display: true, text: 'cm', font: { size: 10 } }, ticks: { font: { size: 10 } }, grid: { drawOnChartArea: false } },
          x: { ticks: { font: { size: 10 } } },
        },
      },
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
})();
