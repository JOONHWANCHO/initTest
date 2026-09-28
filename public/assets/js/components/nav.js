/**
 * nav.js — 전역 상단 메뉴바 동작
 * 메가 메뉴(도구 모음 드롭다운), 모바일 햄버거 메뉴, 검색 오버레이를 제어합니다.
 * 모든 페이지(index/play/tips/tools/*)에서 공통으로 사용합니다.
 */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var navToggle = document.getElementById('navToggleBtn');
    var mobileNav = document.getElementById('mobileNav');
    var searchBtn = document.getElementById('navSearchBtn');
    var searchOverlay = document.getElementById('navSearchOverlay');
    var searchInput = document.getElementById('navSearchInput');

    // ── GNB 드롭다운 4종 (육아 도구함 / 놀이&액티비티 / 쇼핑&도서 / 성장 일지) ──
    // 버튼id-메뉴id 쌍을 등록만 하면 동일 로직으로 열림/닫힘/외부클릭 처리됩니다.
    var dropdownPairs = [
      ['toolsMenuBtn', 'toolsMegaMenu'],
      ['playMenuBtn', 'playSimpleMenu'],
      ['shopMenuBtn', 'shopSimpleMenu'],
      ['growthMenuBtn', 'growthSimpleMenu']
    ];
    var openMenus = [];
    dropdownPairs.forEach(function (pair) {
      var btn = document.getElementById(pair[0]);
      var menu = document.getElementById(pair[1]);
      if (!btn || !menu) return;
      openMenus.push({ btn: btn, menu: menu });
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var willOpen = !menu.classList.contains('open');
        // 다른 드롭다운은 닫고 클릭한 것만 토글 (한 번에 하나만 열리도록)
        openMenus.forEach(function (m) {
          m.menu.classList.remove('open');
          m.btn.setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          menu.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
    document.addEventListener('click', function (e) {
      openMenus.forEach(function (m) {
        if (!m.menu.contains(e.target) && e.target !== m.btn) {
          m.menu.classList.remove('open');
          m.btn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // ── 모바일 메뉴 ──
    if (navToggle && mobileNav) {
      navToggle.addEventListener('click', function () {
        var isOpen = mobileNav.classList.toggle('open');
        navToggle.textContent = isOpen ? '✕' : '☰';
        navToggle.setAttribute('aria-label', isOpen ? I18N.t('common.close_menu') : I18N.t('common.open_menu'));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      mobileNav.querySelectorAll('.mn-cat-head').forEach(function (head) {
        head.addEventListener('click', function () {
          head.parentElement.classList.toggle('open');
        });
      });
    }

    // ── 검색 오버레이 ──
    if (searchBtn && searchOverlay) {
      function openSearch() {
        searchOverlay.classList.add('open');
        if (searchInput) setTimeout(function () { searchInput.focus(); }, 50);
      }
      function closeSearch() {
        searchOverlay.classList.remove('open');
      }
      searchBtn.addEventListener('click', openSearch);
      searchOverlay.addEventListener('click', function (e) {
        if (e.target === searchOverlay) closeSearch();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeSearch();
      });
    }

    // ── 야간 모드(다크 모드) ──
    // 새벽 수유·수면 중 눈부심을 줄이기 위한 다크 테마. localStorage에 기기별로 저장되며
    // 수유/수면 관련 도구 페이지( sleep-calculator / feeding-tracker / colic-checker )에서
    // <button onclick="toggleNightMode()">를 통해 켜고 끌 수 있습니다.
    var NIGHT_KEY = 'nightMode_v1';
    function applyNightMode(on) {
      document.body.classList.toggle('night-mode', !!on);
      document.querySelectorAll('.night-toggle-btn').forEach(function (b) {
        b.textContent = on ? I18N.t('common.light_mode') : I18N.t('common.night_mode');
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    try { applyNightMode(localStorage.getItem(NIGHT_KEY) === '1'); } catch (e) {}
    window.toggleNightMode = function () {
      var next = !document.body.classList.contains('night-mode');
      try { localStorage.setItem(NIGHT_KEY, next ? '1' : '0'); } catch (e) {}
      applyNightMode(next);
    };

    // ── 현재 페이지 강조 (상단 메뉴 + 하단 탭바) ──
    var path = location.pathname.replace(/\/+$/, '');
    document.querySelectorAll('.nav-link[href], .mn-link[href], .bn-item[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      var resolved = new URL(href, location.href).pathname.replace(/\/+$/, '');
      if (resolved === path || (resolved.endsWith('/index.html') === false && resolved === path)) {
        a.classList.add('is-active');
        if (a.classList.contains('bn-item')) a.classList.add('active');
      }
    });
  });
})();
