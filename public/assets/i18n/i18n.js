/* =====================================================================
   i18n.js — 아이로그 다국어 엔진
   =====================================================================
   전체 사용법·규칙은 저장소 루트의 README.md "다국어(i18n)" 섹션을 참고하세요.

   ▸ 각 HTML <head> 에서 다른 스크립트보다 먼저 로드합니다 (동기 로드 → 이후 스크립트가 바로 I18N.t() 사용 가능)
       <script src="assets/i18n/i18n.js" data-ns="페이지이름"></script>      (tools/ 는 ../assets/...)
     data-ns 는 locales/<언어>/<ns>.js 의 파일명입니다. common.js 는 항상 함께 로드됩니다.

   ▸ 새 언어 추가 (예: 독일어) — 코드/HTML 수정 없음
       1) npm run i18n:scaffold -- de       번역 대상 파일(ko/en 원문 주석 포함) 생성
       2) 아래 LANGUAGES 의 주석 처리된 de 줄을 풀기 (국기 SVG 는 FLAGS 에 이미 있음)
       3) locales/de/*.js 의 빈 값을 번역 → npm run check:i18n -- --lang=de
       번역이 비어 있는 키는 fallback 언어(en) → 원문(ko) 순서로 자동 대체됩니다.

   ▸ 사용법
       HTML : data-i18n="key"  /  data-i18n-html="key"(태그 포함)  /  data-i18n-attr="placeholder:key;title:key2"
       JS   : I18N.t(key, {name: value})   {name} 치환, {count} 가 있으면 key_one / key_other 복수형
              I18N.d(group, value)          한글로 저장·전달되는 식별자(카테고리 등)의 "표시용" 번역
              I18N.field(record, name)      시트의 title_en / title_ja 처럼 언어 접미사 열을 우선 사용
       언어 전환은 선택을 저장한 뒤 페이지를 새로 불러오는 방식입니다.
   ===================================================================== */(function (global) {
  'use strict';

  // ───────────────────────────────────────────────────────────────
  // 1. 설정 — 언어 목록은 여기만 고치면 됩니다
  // ───────────────────────────────────────────────────────────────
  var CONFIG = {
    sourceLang: 'ko',          // HTML에 원문이 적혀 있는 언어
    defaultLang: 'ko',         // 저장된 선택이 없을 때 사용할 언어
    fallbackLang: 'en',        // 번역이 없는 키의 1차 대체 언어 (그다음 sourceLang)
    storageKey: 'noriya_lang',
    queryParam: 'lang',        // ?lang=en 으로 바로 진입 가능 (공유 링크용)
    autoDetect: false,         // true 면 첫 방문 시 브라우저 언어 사용. 검색엔진 크롤러가 영어로
                               // 색인하는 것을 막기 위해 기본은 false(한국어 우선)입니다.
    maxInlineFlags: 4          // 이 수를 넘으면 국기 버튼이 드롭다운으로 접힙니다
  };

  var LANGUAGES = [
    { code: 'ko', name: '한국어',   htmlLang: 'ko', locale: 'ko-KR', og: 'ko_KR', flag: 'kr' },
    { code: 'en', name: 'English',  htmlLang: 'en', locale: 'en-US', og: 'en_US', flag: 'us' },
    { code: 'ja', name: '日本語',   htmlLang: 'ja', locale: 'ja-JP', og: 'ja_JP', flag: 'jp' }
    // { code: 'de', name: 'Deutsch',  htmlLang: 'de', locale: 'de-DE', og: 'de_DE', flag: 'de' },
    // { code: 'fr', name: 'Français', htmlLang: 'fr', locale: 'fr-FR', og: 'fr_FR', flag: 'fr' }
  ];

  // 국기 (둥근 SVG, 플랫폼별 이모지 국기 미지원 문제 방지). 새 국기는 여기에 추가.
  var FLAGS = {
    kr: '<rect width="24" height="24" fill="#fff"/><path d="M12 6.2a5.8 5.8 0 0 1 0 11.6 2.9 2.9 0 0 1 0-5.8 2.9 2.9 0 0 0 0-5.8z" fill="#0047A0"/><path d="M12 6.2a5.8 5.8 0 0 0 0 11.6 2.9 2.9 0 0 0 0-5.8 2.9 2.9 0 0 1 0-5.8z" fill="#CD2E3A"/><g stroke="#111" stroke-width="1.1"><path d="M3.6 5.2l2.6-1.5M4.4 6.6l2.6-1.5M2.8 3.9l2.6-1.5" transform="translate(0.6 1.2)"/><path d="M17.8 20.2l2.6-1.5M18.6 21.6l2.6-1.5M17 18.9l2.6-1.5" transform="translate(-0.6 -1.2)"/></g>',
    us: '<rect width="24" height="24" fill="#fff"/><g fill="#B22234"><rect y="0" width="24" height="2"/><rect y="4" width="24" height="2"/><rect y="8" width="24" height="2"/><rect y="12" width="24" height="2"/><rect y="16" width="24" height="2"/><rect y="20" width="24" height="2"/></g><rect width="11" height="12" fill="#3C3B6E"/><g fill="#fff"><circle cx="2.5" cy="2.5" r=".7"/><circle cx="5.5" cy="2.5" r=".7"/><circle cx="8.5" cy="2.5" r=".7"/><circle cx="4" cy="5.5" r=".7"/><circle cx="7" cy="5.5" r=".7"/><circle cx="2.5" cy="8.5" r=".7"/><circle cx="5.5" cy="8.5" r=".7"/><circle cx="8.5" cy="8.5" r=".7"/></g>',
    jp: '<rect width="24" height="24" fill="#fff"/><circle cx="12" cy="12" r="6" fill="#BC002D"/>',
    de: '<rect width="24" height="8" fill="#000"/><rect y="8" width="24" height="8" fill="#DD0000"/><rect y="16" width="24" height="8" fill="#FFCE00"/>',
    fr: '<rect width="8" height="24" fill="#0055A4"/><rect x="8" width="8" height="24" fill="#fff"/><rect x="16" width="8" height="24" fill="#EF4135"/>',
    gb: '<rect width="24" height="24" fill="#012169"/><path d="M0 0l24 24M24 0L0 24" stroke="#fff" stroke-width="4"/><path d="M0 0l24 24M24 0L0 24" stroke="#C8102E" stroke-width="1.6"/><path d="M12 0v24M0 12h24" stroke="#fff" stroke-width="7"/><path d="M12 0v24M0 12h24" stroke="#C8102E" stroke-width="4"/>'
  };

  // ───────────────────────────────────────────────────────────────
  // 2. 현재 언어 결정
  // ───────────────────────────────────────────────────────────────
  function byCode(code) {
    for (var i = 0; i < LANGUAGES.length; i++) if (LANGUAGES[i].code === code) return LANGUAGES[i];
    return null;
  }
  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function detectLang() {
    var q = null;
    try { q = new URLSearchParams(location.search).get(CONFIG.queryParam); } catch (e) {}
    if (q && byCode(q)) { safeSet(CONFIG.storageKey, q); return q; }
    var s = safeGet(CONFIG.storageKey);
    if (s && byCode(s)) return s;
    if (CONFIG.autoDetect && navigator.languages) {
      for (var i = 0; i < navigator.languages.length; i++) {
        var c = navigator.languages[i].toLowerCase().split('-')[0];
        if (byCode(c)) return c;
      }
    }
    return CONFIG.defaultLang;
  }

  var lang = detectLang();
  var meta = byCode(lang) || byCode(CONFIG.defaultLang);

  // ───────────────────────────────────────────────────────────────
  // 3. 사전 저장소 & 번역 함수
  // ───────────────────────────────────────────────────────────────
  var DICT = {};   // DICT[lang][key] = text
  function add(l, ns, dict) {
    var d = DICT[l] || (DICT[l] = {});
    for (var k in dict) if (Object.prototype.hasOwnProperty.call(dict, k)) d[k] = dict[k];
  }

  function chain() {
    var c = [lang];
    if (CONFIG.fallbackLang && c.indexOf(CONFIG.fallbackLang) < 0) c.push(CONFIG.fallbackLang);
    if (c.indexOf(CONFIG.sourceLang) < 0) c.push(CONFIG.sourceLang);
    return c;
  }
  var CHAIN = chain();

  function lookup(key) {
    for (var i = 0; i < CHAIN.length; i++) {
      var d = DICT[CHAIN[i]];
      if (d && d[key] !== undefined && d[key] !== '') return d[key];   // 빈 문자열 = 미번역 → 다음 fallback 언어로
    }
    return undefined;
  }

  var pluralRules = null;
  try { pluralRules = new Intl.PluralRules(meta.locale); } catch (e) {}

  function format(str, params) {
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, function (m, name) {
      return params[name] !== undefined && params[name] !== null ? params[name] : m;
    });
  }

  function t(key, params) {
    var s;
    if (params && params.count !== undefined && pluralRules) {
      s = lookup(key + '_' + pluralRules.select(Number(params.count)));
      if (s === undefined) s = lookup(key + '_other');
    }
    if (s === undefined) s = lookup(key);
    if (s === undefined) {
      if (global.console && console.warn) console.warn('[i18n] missing key:', key);
      return key;
    }
    return format(s, params);
  }

  // 시트/로컬저장소 등에 한글 식별자로 저장된 값의 "표시용" 번역. 사전에 없으면 원문 그대로.
  function d(group, value) {
    if (value === undefined || value === null) return value;
    var s = lookup(group + '.' + value);
    return s === undefined ? value : s;
  }

  // 시트 컬럼 title_en / summary_ja 처럼 언어 접미사가 붙은 값을 우선 사용
  function field(rec, name) {
    if (!rec) return '';
    if (lang !== CONFIG.sourceLang) {
      var v = rec[name + '_' + lang];
      if (v !== undefined && v !== null && String(v).trim() !== '') return v;
    }
    return rec[name];
  }
  var LOCALIZED_FIELDS = ['title', 'summary', 'content', 'name', 'location', 'tags', 'desc', 'description'];
  function localizeRecords(arr) {
    if (!Array.isArray(arr) || lang === CONFIG.sourceLang) return arr;
    arr.forEach(function (rec) {
      LOCALIZED_FIELDS.forEach(function (f) {
        var v = rec[f + '_' + lang];
        if (v !== undefined && v !== null && String(v).trim() !== '') rec[f] = v;
      });
    });
    return arr;
  }

  // ───────────────────────────────────────────────────────────────
  // 4. DOM 번역
  // ───────────────────────────────────────────────────────────────
  function apply(root) {
    root = root || document;
    var i, el, list;
    list = root.querySelectorAll('[data-i18n]');
    for (i = 0; i < list.length; i++) {
      el = list[i]; var s = lookup(el.getAttribute('data-i18n'));
      if (s !== undefined) el.textContent = s;
    }
    list = root.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < list.length; i++) {
      el = list[i]; var h = lookup(el.getAttribute('data-i18n-html'));
      if (h !== undefined) el.innerHTML = h;
    }
    list = root.querySelectorAll('[data-i18n-attr]');
    for (i = 0; i < list.length; i++) {
      el = list[i];
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); if (p.length < 2) return;
        var v = lookup(p.slice(1).join(':'));
        if (v !== undefined) el.setAttribute(p[0], v);
      });
    }
  }

  // <head> 정리: html lang, og:locale, hreflang, JSON-LD
  function localizeHead() {
    document.documentElement.setAttribute('lang', meta.htmlLang);
    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.setAttribute('content', meta.og);
    // hreflang 대체 링크 (?lang=xx)
    var base = location.origin + location.pathname;
    var head = document.head;
    LANGUAGES.forEach(function (L) {
      if (document.querySelector('link[rel="alternate"][hreflang="' + L.htmlLang + '"]')) return;
      var a = document.createElement('link');
      a.rel = 'alternate'; a.hreflang = L.htmlLang;
      a.href = base + (L.code === CONFIG.defaultLang ? '' : '?' + CONFIG.queryParam + '=' + L.code);
      head.appendChild(a);
    });
    // JSON-LD 문자열을 한글 원문 → 번역으로 치환
    if (lang === CONFIG.sourceLang) return;
    var src = DICT[CONFIG.sourceLang] || {};
    var rev = {};
    for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k) && rev[src[k]] === undefined) rev[src[k]] = k;
    function walk(o) {
      if (Array.isArray(o)) return o.map(walk);
      if (o && typeof o === 'object') {
        var out = {};
        for (var p in o) out[p] = (p === 'inLanguage') ? meta.htmlLang : walk(o[p]);
        return out;
      }
      if (typeof o === 'string' && rev[o] !== undefined) { var s = lookup(rev[o]); return s === undefined ? o : s; }
      return o;
    }
    var ld = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < ld.length; i++) {
      try { ld[i].textContent = JSON.stringify(walk(JSON.parse(ld[i].textContent))); } catch (e) {}
    }
  }

  // ───────────────────────────────────────────────────────────────
  // 5. 언어 전환 UI (국기 버튼)
  // ───────────────────────────────────────────────────────────────
  function flagSvg(code, size) {
    var L = byCode(code);
    var f = FLAGS[L ? L.flag : code] || '';
    return '<svg class="lang-flag-svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<defs><clipPath id="lc-' + code + '-' + size + '"><circle cx="12" cy="12" r="12"/></clipPath></defs>' +
      '<g clip-path="url(#lc-' + code + '-' + size + ')">' + f + '</g>' +
      '<circle cx="12" cy="12" r="11.5" fill="none" stroke="rgba(0,0,0,.18)"/></svg>';
  }

  function setLang(code) {
    if (!byCode(code) || code === lang) return;
    safeSet(CONFIG.storageKey, code);
    var u = new URL(location.href);
    u.searchParams.delete(CONFIG.queryParam);
    location.href = u.toString();   // 새로 불러와 모든 JS 렌더링을 새 언어로 다시 그립니다
  }

  function buildSwitcher(mode) {
    var wrap = document.createElement('div');
    var compact = LANGUAGES.length > CONFIG.maxInlineFlags && mode !== 'list';
    wrap.className = 'lang-switch' + (mode === 'list' ? ' lang-switch-list' : '') + (compact ? ' lang-switch-compact' : '');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language');
    var html = '';
    if (compact) {
      html += '<button type="button" class="lang-current" aria-haspopup="true" aria-expanded="false" title="' + meta.name + '">' +
        flagSvg(meta.code, 22) + '<span class="lang-code">' + meta.code.toUpperCase() + '</span><span class="lang-caret">▾</span></button>';
      html += '<div class="lang-menu">';
    }
    LANGUAGES.forEach(function (L) {
      var active = L.code === lang;
      html += '<button type="button" class="lang-btn' + (active ? ' is-active' : '') + '" data-lang="' + L.code + '"' +
        ' aria-pressed="' + active + '" aria-label="' + L.name + '" title="' + L.name + '">' +
        flagSvg(L.code, mode === 'list' ? 24 : 22) + (mode === 'list' || compact ? '<span class="lang-name">' + L.name + '</span>' : '') + '</button>';
    });
    if (compact) html += '</div>';
    wrap.innerHTML = html;
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b) return;
      if (b.classList.contains('lang-current')) {
        var open = !wrap.classList.contains('open');
        wrap.classList.toggle('open', open);
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        e.stopPropagation();
        return;
      }
      if (b.getAttribute('data-lang')) setLang(b.getAttribute('data-lang'));
    });
    return wrap;
  }

  function mountSwitchers() {
    var slots = document.querySelectorAll('[data-lang-switch]');
    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      if (slot.getAttribute('data-lang-mounted')) continue;
      slot.setAttribute('data-lang-mounted', '1');
      slot.appendChild(buildSwitcher(slot.getAttribute('data-lang-switch') === 'list' ? 'list' : 'inline'));
    }
  }
  document.addEventListener('click', function () {
    var open = document.querySelectorAll('.lang-switch.open');
    for (var i = 0; i < open.length; i++) open[i].classList.remove('open');
  });

  // ───────────────────────────────────────────────────────────────
  // 6. 사전 파일 로드 (동기) — 이 스크립트는 <head>에서 동기 실행되므로
  //    이후 스크립트(partials.js 등)와 페이지 인라인 스크립트가 바로 I18N.t()를 쓸 수 있습니다.
  // ───────────────────────────────────────────────────────────────
  var cs = document.currentScript;
  var baseUrl = cs ? cs.src.replace(/[^\/]*$/, '') : 'i18n/';
  var ns = (cs && cs.getAttribute('data-ns')) || '';
  var namespaces = ['common'].concat(ns ? ns.split(/[\s,]+/).filter(Boolean) : []);

  var pending = lang !== CONFIG.sourceLang;
  if (pending) {
    // 번역 적용 전 한글이 잠깐 보이는 현상 방지 (최대 3초 후 강제 해제)
    document.write('<style id="i18n-pending-style">html.i18n-pending body{visibility:hidden}</style>');
    document.documentElement.className += ' i18n-pending';
    setTimeout(release, 3000);
  }
  function release() {
    document.documentElement.className = document.documentElement.className.replace(/\s*i18n-pending/, '');
  }
  CHAIN.slice().reverse().forEach(function (l) {
    namespaces.forEach(function (n) {
      document.write('<script src="' + baseUrl + 'locales/' + l + '/' + n + '.js"><\/script>');
    });
  });

  function onReady() {
    mountSwitchers();
    localizeHead();
    if (lang !== CONFIG.sourceLang || CONFIG.applySource) apply(document);
    release();
    try { document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang: lang } })); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
  else onReady();

  global.I18N = {
    lang: lang,
    locale: meta.locale,
    languages: LANGUAGES,
    config: CONFIG,
    add: add, t: t, d: d, field: field, localizeRecords: localizeRecords,
    apply: apply, setLang: setLang, mountSwitchers: mountSwitchers,
    has: function (key) { return lookup(key) !== undefined; },
    n: function (x) { return Number(x).toLocaleString(meta.locale); }
  };
})(window);
