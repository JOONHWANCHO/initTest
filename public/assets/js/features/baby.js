/**
 * baby.js — 아이로그 개인화 엔진
 * 내 아이 프로필 / 성장 기록 / 예방접종 D-day / 연속 방문 스트릭을
 * localStorage에 저장하고, 여러 페이지(도구/홈/성장기록)에서 공통으로 사용합니다.
 * 서버에 아무것도 전송하지 않으며, 이 브라우저(기기)에만 저장됩니다.
 */
(function (global) {
  'use strict';

  var PROFILE_KEY = 'babyProfile_v1';
  var RECORDS_KEY = 'growthRecords_v1';
  var VACCINE_KEY = 'vaccineDone_v1';
  var STREAK_KEY = 'visitStreak_v1';

  // ── 유틸 ──────────────────────────────────────────────
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysBetween(a, b) {
    var da = new Date(a + 'T00:00:00');
    var db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000);
  }
  function addMonths(dateStr, months) {
    var d = new Date(dateStr + 'T00:00:00');
    d.setMonth(d.getMonth() + months);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  // ── 프로필 ────────────────────────────────────────────
  function getProfile() { return readJSON(PROFILE_KEY, null); }
  function saveProfile(p) {
    var cur = getProfile() || {};
    var next = {
      name: (p.name || cur.name || '').trim(),
      birthdate: p.birthdate || cur.birthdate || '',
      gender: p.gender !== undefined ? p.gender : (cur.gender || ''),
      createdAt: cur.createdAt || todayStr(),
    };
    writeJSON(PROFILE_KEY, next);
    return next;
  }
  function clearProfile() {
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(RECORDS_KEY);
      localStorage.removeItem(VACCINE_KEY);
    } catch (e) {}
  }

  // ── 나이 계산 ─────────────────────────────────────────
  function ageInfo(birthdate) {
    if (!birthdate) return null;
    var days = daysBetween(birthdate, todayStr());
    if (days < 0) return { days: days, months: 0, years: 0, text: I18N.t('common.d_until_due_date', {abs: Math.abs(days)}), isUnborn: true };
    var years = Math.floor(days / 365);
    var months = Math.floor(days / 30.44);
    var text;
    if (months < 1) text = I18N.t('common.days_old', {days});
    else if (months < 24) text = I18N.t('common.months_days', {months, days});
    else text = I18N.t('common.y_m', {years, months: (months - years * 12)});
    return { days: days, months: months, years: years, text: text, isUnborn: false };
  }

  // ── 성장 기록 ─────────────────────────────────────────
  function getRecords() {
    var arr = readJSON(RECORDS_KEY, []);
    return arr.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  }
  function addRecord(rec) {
    var arr = readJSON(RECORDS_KEY, []);
    arr.push({
      id: uid(),
      date: rec.date || todayStr(),
      weight: rec.weight ? Number(rec.weight) : null,
      height: rec.height ? Number(rec.height) : null,
      note: (rec.note || '').trim(),
    });
    writeJSON(RECORDS_KEY, arr);
    return arr;
  }
  function deleteRecord(id) {
    var arr = readJSON(RECORDS_KEY, []).filter(function (r) { return r.id !== id; });
    writeJSON(RECORDS_KEY, arr);
    return arr;
  }

  // ── 예방접종 D-day (질병관리청 표준 일정 간소화 — 참고용) ──
  var VACCINE_SCHEDULE = window.NORIYA_DATA.vaccineSchedule;   // 원본: assets/js/data/baby-data.js
  function getVaccineDone() { return readJSON(VACCINE_KEY, {}); }
  function setVaccineDone(key, done) {
    var m = getVaccineDone();
    if (done) m[key] = true; else delete m[key];
    writeJSON(VACCINE_KEY, m);
    return m;
  }
  function getVaccineList(birthdate) {
    if (!birthdate) return [];
    var done = getVaccineDone();
    var today = todayStr();
    return VACCINE_SCHEDULE.map(function (v) {
      var dueDate = addMonths(birthdate, v.monthsAge);
      var dday = daysBetween(today, dueDate);
      return {
        key: v.key, name: v.name, dueDate: dueDate, dday: dday,
        done: !!done[v.key],
        status: done[v.key] ? 'done' : (dday < 0 ? 'overdue' : (dday <= 14 ? 'soon' : 'upcoming')),
      };
    }).sort(function (a, b) { return a.dueDate < b.dueDate ? -1 : 1; });
  }
  function nextVaccine(birthdate) {
    var list = getVaccineList(birthdate).filter(function (v) { return !v.done; });
    return list.length ? list[0] : null;
  }

  // ── 연속 방문 스트릭 & 뱃지 ───────────────────────────
  var BADGES = window.NORIYA_DATA.badges;   // 원본: assets/js/data/baby-data.js
  function getStreak() {
    return readJSON(STREAK_KEY, { lastVisit: '', current: 0, longest: 0, totalDays: 0, badges: [] });
  }
  function recordVisitToday() {
    var s = getStreak();
    var today = todayStr();
    if (s.lastVisit === today) return { streak: s, newBadge: null }; // 오늘 이미 기록됨

    var gap = s.lastVisit ? daysBetween(s.lastVisit, today) : null;
    if (gap === 1) s.current += 1;
    else s.current = 1; // 처음 방문 or 하루 이상 공백 → 스트릭 리셋

    s.totalDays = (s.totalDays || 0) + 1;
    s.longest = Math.max(s.longest || 0, s.current);
    s.lastVisit = today;

    var newBadge = null;
    BADGES.forEach(function (b) {
      if (s.current >= b.days && s.badges.indexOf(b.id) === -1) {
        s.badges.push(b.id);
        newBadge = b;
      }
    });

    writeJSON(STREAK_KEY, s);
    return { streak: s, newBadge: newBadge };
  }
  function getBadgeDefs() { return BADGES; }

  // ── 자동 입력: 아이 월령/생년월일을 도구 페이지 입력값에 반영 ──
  // 특정 id의 input/select가 있는 페이지에서만 동작 (없으면 조용히 무시)
  function autofillAgeInputs() {
    var profile = getProfile();
    if (!profile || !profile.birthdate) return;
    var info = ageInfo(profile.birthdate);
    if (!info || info.isUnborn) return;
    var months = info.months;
    var filled = false;

    // 1) type="date" 생년월일 입력 (school-date, subsidy-calculator 등)
    var bd = document.getElementById('birthDate');
    if (bd && bd.tagName === 'INPUT' && !bd.value) {
      bd.value = profile.birthdate;
      filled = true;
      // 이 계산기는 생년월일 하나만 있으면 결과가 나오므로 바로 계산까지 실행
      if (typeof global.calculate === 'function') {
        try { global.calculate(); } catch (e) {}
      }
    }

    // 2) 월령 숫자 입력 (growth-percentile, fever-medicine 등)
    var am = document.getElementById('ageMonth');
    if (am && am.tagName === 'INPUT' && !am.value) {
      am.value = months;
      filled = true;
    }

    // 3) 성별 셀렉트 (growth-percentile)
    if (profile.gender) {
      var gs = document.getElementById('genderSel');
      if (gs && gs.tagName === 'SELECT') {
        gs.value = profile.gender;
        if (typeof global.syncGender === 'function') { try { global.syncGender(profile.gender); } catch (e) {} }
      }
    }

    // 4) 월령 드롭다운 (milk-calculator)
    var ms = document.getElementById('monthSel');
    if (ms && ms.tagName === 'SELECT') {
      var opts = Array.prototype.map.call(ms.options, function (o) { return parseInt(o.value, 10); }).filter(function (n) { return !isNaN(n); });
      if (opts.length) {
        var closest = opts.reduce(function (a, b) { return Math.abs(b - months) < Math.abs(a - months) ? b : a; });
        ms.value = String(closest);
        filled = true;
      }
    }

    // 5) 월령 버튼그룹 + 전역 render(m) 함수 (tooth-checker, milestone-checker, weaning-checker)
    var btnGroup = document.getElementById('monthBtns');
    if (btnGroup) {
      var btns = Array.prototype.slice.call(btnGroup.querySelectorAll('.pill-btn'));
      if (btns.length) {
        var best = null, bestDiff = Infinity;
        btns.forEach(function (b) {
          var m = parseInt(b.dataset.m, 10);
          if (!isNaN(m)) {
            var diff = Math.abs(m - months);
            if (diff < bestDiff) { bestDiff = diff; best = b; }
          }
        });
        if (best) { best.click(); filled = true; }
      }
    }

    if (filled) showAutofillToast(profile);
  }

  function showAutofillToast(profile) {
    if (document.getElementById('babyAutofillToast')) return;
    var el = document.createElement('div');
    el.id = 'babyAutofillToast';
    el.className = 'baby-toast';
    var label = profile.name ? profile.name : I18N.t('common.my_baby');
    el.innerHTML = I18N.t('common.auto_filled_s_info', {label});
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  }

  // ── 내비게이션 뱃지 렌더 (모든 페이지 공통) ────────────
  function renderNavBadge() {
    var slots = document.querySelectorAll('[data-baby-badge]');
    if (!slots.length) return;
    var profile = getProfile();
    var streak = getStreak();
    var rootPrefix = document.body.getAttribute('data-root-prefix') || '';
    var growthUrl = rootPrefix + 'growth.html';

    slots.forEach(function (slot) {
      if (profile && profile.birthdate) {
        var info = ageInfo(profile.birthdate);
        var name = profile.name || I18N.t('common.our_baby');
        var streakPart = streak.current > 1 ? ' · 🔥' + streak.current : '';
        slot.innerHTML = '<a href="' + growthUrl + '" class="baby-badge-link">' +
          '<span class="bb-emoji">🍼</span><span class="bb-text">' + name + ' · ' + info.text + streakPart + '</span></a>';
      } else {
        slot.innerHTML = `<a href="${growthUrl}" class="baby-badge-link bb-cta"><span class="bb-emoji">🍼</span><span class="bb-text">${I18N.t('common.register_my_child')}</span></a>`;
      }
    });
  }

  // ── 월령별 오늘의 추천 (홈 히어로 카드 문구) ──
  var RECO_TABLE = [
    { max: 1, text: I18N.t('common.check_feeding_intervals_newborn_sleep'), href: 'tools/sleep-calculator.html', emoji: '😴' },
    { max: 3, text: I18N.t('common.if_suspect_infant_colic_check'), href: 'tools/colic-checker.html', emoji: '😭' },
    { max: 6, text: I18N.t('common.s_good_time_track_feeding'), href: 'tools/feeding-tracker.html', emoji: '🍼' },
    { max: 9, text: I18N.t('common.when_starting_weaning_check_ingredient'), href: 'tools/weaning-checker.html', emoji: '🥦' },
    { max: 13, text: I18N.t('common.time_check_developmental_milestones'), href: 'tools/milestone-checker.html', emoji: '🧩' },
    { max: 24, text: I18N.t('common.curious_about_when_teeth_come'), href: 'tools/tooth-checker.html', emoji: '🦷' },
    { max: 999, text: I18N.t('common.check_daycare_school_admission_schedul'), href: 'tools/school-date.html', emoji: '🏫' },
  ];
  function todaysRecommendation(months) {
    for (var i = 0; i < RECO_TABLE.length; i++) {
      if (months <= RECO_TABLE[i].max) return RECO_TABLE[i];
    }
    return RECO_TABLE[RECO_TABLE.length - 1];
  }

  // ── 홈 대시보드 렌더 (index.html 전용, #babyDashboard 있을 때만) ──
  function renderHomeDashboard() {
    var el = document.getElementById('babyDashboard');
    if (!el) return;
    var rootPrefix = document.body.getAttribute('data-root-prefix') || '';
    var profile = getProfile();
    var streak = getStreak();

    if (!profile || !profile.birthdate) {
      el.innerHTML =
        `<div class="baby-dash-card baby-dash-empty">  <div class="bd-emoji">🍼</div>  <div class="bd-empty-text">    <div class="bd-empty-title">${I18N.t('common.register_child_s_info')}</div>    <div class="bd-empty-desc">${I18N.t('common.register_just_birth_date_age')}</div>  </div>  <a href="${rootPrefix}growth.html" class="bd-cta-btn">${I18N.t('common.register_now')}</a></div>`;
      return;
    }

    var info = ageInfo(profile.birthdate);
    var nv = nextVaccine(profile.birthdate);
    var records = getRecords();
    var lastRecord = records.length ? records[records.length - 1] : null;

    var vaccineHtml = nv
      ? ('<div class="bd-stat-value">' + nv.name + '</div><div class="bd-stat-sub">' + (nv.dday <= 0 ? I18N.t('common.d_day_passed') : 'D-' + nv.dday) + ' · ' + nv.dueDate + '</div>')
      : `<div class="bd-stat-value">${I18N.t('common.no_upcoming_items_registered')}</div><div class="bd-stat-sub">${I18N.t('common.all_done_past_target_age')}</div>`;

    var recordHtml = lastRecord
      ? ('<div class="bd-stat-value">' + lastRecord.date + '</div><div class="bd-stat-sub">' + (lastRecord.weight ? lastRecord.weight + 'kg ' : '') + (lastRecord.height ? lastRecord.height + 'cm' : '') + '</div>')
      : `<div class="bd-stat-value">${I18N.t('common.no_records')}</div><div class="bd-stat-sub">${I18N.t('common.add_first_record')}</div>`;

    var reco = info.isUnborn ? null : todaysRecommendation(info.months);
    var recoHtml = reco
      ? ('<a href="' + rootPrefix + reco.href + '" class="bd-reco">' +
         '<span class="bd-reco-emoji">' + reco.emoji + '</span>' +
         '<span class="bd-reco-text"><b>' + (profile.name || I18N.t('common.our_baby')) + '</b>' + reco.text + '</span>' +
         '<span class="bd-reco-arrow">→</span></a>')
      : '';

    el.innerHTML =
      `${recoHtml}<div class="baby-dash-card">  <div class="bd-head">    <div class="bd-head-emoji">🍼</div>    <div>      <div class="bd-name">${(profile.name || I18N.t('common.our_baby'))}</div>      <div class="bd-age">${info.text}</div>    </div>    <div class="bd-streak">${I18N.t('common.day_streak', {current: streak.current})}</div>  </div>  <div class="bd-stats">    <div class="bd-stat"><div class="bd-stat-label">${I18N.t('common.next_vaccination')}</div>${vaccineHtml}</div>    <div class="bd-stat"><div class="bd-stat-label">${I18N.t('common.latest_growth_record')}</div>${recordHtml}</div>  </div>  <a href="${rootPrefix}growth.html" class="bd-cta-btn bd-cta-full">${I18N.t('common.view_growth_records')}</a></div>`;
  }

  // ── 초기화 ────────────────────────────────────────────
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    recordVisitToday();
    renderNavBadge();
    renderHomeDashboard();
    autofillAgeInputs();
  });

  // ── 외부 공개 API ─────────────────────────────────────
  global.BabyProfile = {
    getProfile: getProfile,
    saveProfile: saveProfile,
    clearProfile: clearProfile,
    ageInfo: ageInfo,
    getRecords: getRecords,
    addRecord: addRecord,
    deleteRecord: deleteRecord,
    getVaccineList: getVaccineList,
    setVaccineDone: setVaccineDone,
    nextVaccine: nextVaccine,
    getStreak: getStreak,
    recordVisitToday: recordVisitToday,
    getBadgeDefs: getBadgeDefs,
    renderNavBadge: renderNavBadge,
    renderHomeDashboard: renderHomeDashboard,
    todayStr: todayStr,
    daysBetween: daysBetween,
  };
})(window);
