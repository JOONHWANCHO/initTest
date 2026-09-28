/* =====================================================================
   partials.js — 사이트 공통 컴포넌트 단일 소스 (Single Source of Truth)
   =====================================================================
   이 파일 하나만 수정하면 다음이 전 페이지(22개 HTML)에 한 번에 반영됩니다.

     · 상단 내비게이션 (로고 · 메뉴 · 도구 모음 메가메뉴)
     · 모바일 슬라이드 메뉴
     · 검색 오버레이
     · 하단 탭바 (홈 / 놀이 / 꿀팁 / 내 아이)
     · 푸터 (사이트용 / 도구페이지용 2종)
     · 홈 화면 카테고리 칩 스크롤
     · 홈 화면 18종 도구 전체 그리드 (+ 인피드 광고 위치)

   ── 사용법 ──────────────────────────────────────────────────────────
   각 HTML의 <head>에 (nav.js보다 먼저) 아래를 추가하고,
     <script src="assets/js/components/partials.js" defer></script>

   <body> 안에는 아래 자리표시자(placeholder)만 남겨두면 됩니다.

     <div id="siteHeader"></div>                       → nav+모바일메뉴+검색오버레이
     <div id="siteFooter" data-footer="tool"></div>     → 도구 페이지용 짧은 푸터
     <div id="siteFooter" data-footer="site"           → 사이트 공통 푸터
          data-home-label="홈으로"></div>                (data-home-label 없으면 홈 링크 생략 = index.html용)
     <div class="cat-chip-scroll" id="catChipsRoot"></div>   → 홈 카테고리 칩 (index.html)
     <div class="cat-section" id="toolHub"></div>            → 홈 18종 도구 전체 그리드 (index.html)

   하단 탭바는 별도 placeholder 없이 partials.js가 </body> 직전에 자동 삽입합니다.

   ── 도구를 추가/수정/삭제하려면 ────────────────────────────────────
   assets/js/data/tool-catalog.js 의 TOOL_CATEGORIES 배열 항목만 고치면 메가메뉴·모바일메뉴·
   홈 카테고리 칩·홈 전체 그리드·검색(data-name)까지 자동으로 동기화됩니다.
   ===================================================================== */
(function () {
  'use strict';

  // ───────────────────────────────────────────────────────────────
  // 18종 도구 마스터 데이터 (여기만 고치면 전체 페이지에 반영됩니다)
  // ───────────────────────────────────────────────────────────────
  var TOOL_CATEGORIES = (window.NORIYA_DATA && window.NORIYA_DATA.toolCategories) || [];   // 원본: assets/js/data/tool-catalog.js

  var BADGE_LABEL = { hot: I18N.t('common.popular'), new: 'NEW', popular: I18N.t('common.recommended') };

  function withPrefix(prefix, href) { return prefix + href; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // ── 상단 메가메뉴 ──
  function buildMegaMenu(prefix) {
    return TOOL_CATEGORIES.map(function (cat) {
      var links = cat.tools.map(function (t) {
        return '<a href="' + withPrefix(prefix, t.href) + '">' + esc(t.name) + '</a>';
      }).join('');
      var emergency = cat.id === '건강응급';
      return '<div class="mega-cat' + (emergency ? ' mega-cat-emergency' : '') + '">' +
        '<a href="' + withPrefix(prefix, 'index.html#cat-' + cat.id) + '" class="mega-cat-title" style="text-decoration:none;">' +
        '<span class="mc-icon">' + cat.icon + '</span>' + esc(cat.title) + '</a>' + links + '</div>';
    }).join('');
  }

  // ── 모바일 메뉴 카테고리 아코디언 ──
  function buildMobileCats(prefix) {
    return TOOL_CATEGORIES.map(function (cat, i) {
      var links = cat.tools.map(function (t) {
        return '<a href="' + withPrefix(prefix, t.href) + '">' + esc(t.name) + '</a>';
      }).join('');
      var emergency = cat.id === '건강응급';
      return '<div class="mn-cat' + (i === 0 ? ' open' : '') + (emergency ? ' mn-cat-emergency' : '') + '">' +
        '<div class="mn-cat-head">' + cat.icon + ' ' + esc(cat.title) + ' <span class="mn-caret">▾</span></div>' +
        links + '</div>';
    }).join('');
  }

  // ── 홈 화면 카테고리 칩 스크롤 ──
  function buildCatChips() {
    return TOOL_CATEGORIES.map(function (cat) {
      return '<a href="#cat-' + cat.id + '" class="cat-chip">' + cat.icon + ' ' + esc(cat.title) + '</a>';
    }).join('');
  }

  // ── 인피드 광고 슬롯 (홈 도구 그리드 사이) ──
  function buildInfeedAd(slotKey) {
    return '' +
      '<div class="ad-slot ad-infeed">' +
      '  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX" data-ad-slot="0000000000" data-ad-format="fluid" data-ad-layout="in-article"></ins>' +
      '  <script>if(typeof CONFIG!=="undefined"){var _ins=document.currentScript.previousElementSibling;_ins.setAttribute("data-ad-client",CONFIG.ADSENSE_CLIENT);_ins.setAttribute("data-ad-slot",CONFIG.AD_SLOTS.' + slotKey + ');}</' + 'script>' +
      '  <script>(adsbygoogle=window.adsbygoogle||[]).push({});</' + 'script>' +
      '</div>';
  }

  // ── 홈 화면 18종 도구 전체 그리드 ──
  function buildToolHub(prefix) {
    return TOOL_CATEGORIES.map(function (cat) {
      var cards = cat.tools.map(function (t) {
        var badgeCls = t.badge ? 'badge-' + t.badge : '';
        var badgeTxt = t.badge ? (BADGE_LABEL[t.badge] || '') : '';
        return '<a href="' + withPrefix(prefix, t.href) + '" class="tool-card" data-name="' + esc((t.keywords || t.name) + ' ' + (t.kwKo || '')) + '">' +
          '<span class="tc-emoji">' + t.emoji + '</span>' +
          '<span class="tc-name">' + esc(t.name) + '</span>' +
          '<span class="tc-desc">' + esc(t.desc) + '</span>' +
          (t.badge ? '<span class="tc-badge ' + badgeCls + '">' + badgeTxt + '</span>' : '') +
          '</a>';
      }).join('');
      var block = '' +
        '<div class="cat-block" data-cat="' + cat.id + '" id="cat-' + cat.id + '">' +
        '  <div class="cat-header">' +
        '    <div class="cat-icon" style="background:' + cat.iconBg + ';">' + cat.icon + '</div>' +
        '    <div><h2>' + esc(cat.title) + '</h2><div class="cat-desc">' + esc(cat.desc) + '</div></div>' +
        '  </div>' +
        '  <div class="tool-grid">' + cards + '</div>' +
        '</div>';
      return block + (cat.adSlotAfter ? buildInfeedAd(cat.adSlotAfter) : '');
    }).join('');
  }

  // ── GNB 서브메뉴 마스터 데이터 ──
  // ① 육아 도구함 = TOOL_CATEGORIES (메가메뉴)
  // ② 놀이 & 액티비티 = play.html 내 앵커 섹션으로 이동하는 단순 드롭다운
  var PLAY_MENU = [
    { emoji: '🎪', name: I18N.t('common.play_picked_just_child_right'), desc: I18N.t('common.live_recommended_activities'), href: 'play.html#liveGrid' },
    { emoji: '👶', name: I18N.t('common.play_guide_by_age'), desc: I18N.t('common.play_filtered_by_age_months'), href: 'play.html#ageFilter' },
    { emoji: '🏆', name: I18N.t('common.this_week_s_popular_ranking'), desc: I18N.t('common.live_ranking_by_view_count'), href: 'play.html#rankingList' },
    { emoji: '💰', name: I18N.t('common.activity_hot_deals'), desc: I18N.t('common.lowest_price_activities_class_booking'), href: 'play.html#priceList' }
  ];
  // ③ 쇼핑 & 도서 = shop.html 내 앵커 섹션으로 이동하는 단순 드롭다운
  var SHOP_MENU = [
    { emoji: '🛒', name: I18N.t('common.baby_essentials'), desc: I18N.t('common.diapers_wipes_weaning_supplies_formula'), href: 'shop.html#essentials' },
    { emoji: '📚', name: I18N.t('common.parenting_e_books'), desc: I18N.t('common.must_read_parenting_books_by'), href: 'shop.html#ebooks' }
  ];
  // ④ 성장 일지 = growth.html(마이페이지) 내 앵커 섹션으로 이동
  var GROWTH_MENU = [
    { emoji: '👶', name: I18N.t('common.child_profile_management'), desc: I18N.t('common.register_edit_name_birth_date'), href: 'growth.html#profileSection' },
    { emoji: '🗓️', name: I18N.t('common.today_s_log'), desc: I18N.t('common.feeding_sleep_temperature_logs_glance'), href: 'growth.html#todaySection' },
    { emoji: '📈', name: I18N.t('common.milestones_growth_log'), desc: I18N.t('common.growth_percentile_vaccinations_tooth_e'), href: 'growth.html#growthLogSection' }
  ];

  function buildSimpleDropdown(prefix, items) {
    return items.map(function (it) {
      return '<a href="' + withPrefix(prefix, it.href) + '" class="simple-menu-item">' +
        '<span class="smi-emoji">' + it.emoji + '</span>' +
        '<span class="smi-body"><span class="smi-name">' + esc(it.name) + '</span><span class="smi-desc">' + esc(it.desc) + '</span></span>' +
        '</a>';
    }).join('');
  }

  // ── 상단 내비게이션 (로고=홈 + 5메뉴 GNB + 아이 배지 + 검색/햄버거 버튼) ──
  function buildSiteNav(prefix) {
    return `<nav class="site-nav">  <div class="nav-inner">    <a href="${withPrefix(prefix, 'index.html')}" class="logo"><span class="logo-mark">🍼</span>${I18N.t('common.ailog')}</a>    <div class="nav-links">      <div class="nav-item">        <button class="nav-link" id="toolsMenuBtn" type="button" aria-expanded="false" aria-haspopup="true">${I18N.t('common.parenting_toolbox')} <span class="caret">▾</span></button>        <div class="mega-menu" id="toolsMegaMenu" role="menu">          <div class="mega-grid">${buildMegaMenu(prefix)}</div>          <div class="mega-menu-footer"><a href="${withPrefix(prefix, 'index.html#toolHub')}">${I18N.t('common.view_all_18_tools_glance')}</a></div>        </div>      </div>      <div class="nav-item">        <button class="nav-link" id="playMenuBtn" type="button" aria-expanded="false" aria-haspopup="true">${I18N.t('common.play_activities_2')} <span class="caret">▾</span></button>        <div class="mega-menu mega-menu-simple" id="playSimpleMenu" role="menu">${buildSimpleDropdown(prefix, PLAY_MENU)}</div>      </div>      <div class="nav-item">        <button class="nav-link" id="shopMenuBtn" type="button" aria-expanded="false" aria-haspopup="true">${I18N.t('common.shopping_books_2')} <span class="caret">▾</span></button>        <div class="mega-menu mega-menu-simple" id="shopSimpleMenu" role="menu">${buildSimpleDropdown(prefix, SHOP_MENU)}</div>      </div>      <div class="nav-item">        <button class="nav-link" id="growthMenuBtn" type="button" aria-expanded="false" aria-haspopup="true">${I18N.t('common.growth_log_2')} <span class="caret">▾</span></button>        <div class="mega-menu mega-menu-simple" id="growthSimpleMenu" role="menu">${buildSimpleDropdown(prefix, GROWTH_MENU)}</div>      </div>    </div>    <div class="nav-spacer"></div>    <span class="nav-baby-badge" data-baby-badge></span>    <div class="nav-lang" data-lang-switch></div>    <button class="nav-search-btn" id="navSearchBtn" type="button" aria-label="${(I18N.t('common.search_tools'))}">🔍</button>    <button class="nav-toggle" id="navToggleBtn" type="button" aria-label="${(I18N.t('common.open_menu'))}">☰</button>  </div></nav>`;
  }

  // ── 모바일 슬라이드 메뉴 (5메뉴 구조 그대로 아코디언화) ──
  function buildMobileNav(prefix) {
    function buildMobileSimpleGroup(title, groupId, items, isOpen) {
      var links = items.map(function (it) {
        return '<a href="' + withPrefix(prefix, it.href) + '">' + it.emoji + ' ' + esc(it.name) + '</a>';
      }).join('');
      return '<div class="mn-cat' + (isOpen ? ' open' : '') + '" id="' + groupId + '">' +
        '<div class="mn-cat-head">' + esc(title) + ' <span class="mn-caret">▾</span></div>' +
        links + '</div>';
    }
    return `<div class="mobile-nav" id="mobileNav">  <div class="nav-baby-badge" data-baby-badge></div>  <div class="mn-lang" data-lang-switch="list"></div>  <a href="${withPrefix(prefix, 'index.html')}" class="mn-link">${I18N.t('common.home')}</a>  <div class="mn-group-title">${I18N.t('common.parenting_toolbox_18')}</div>${buildMobileCats(prefix)}  <div class="mn-group-title">${I18N.t('common.play_activities_2')}</div>${buildMobileSimpleGroup(I18N.t('common.play_activities'), 'mnPlayGroup', PLAY_MENU, false)}  <div class="mn-group-title">${I18N.t('common.shopping_books_2')}</div>${buildMobileSimpleGroup(I18N.t('common.shopping_books'), 'mnShopGroup', SHOP_MENU, false)}  <div class="mn-group-title">${I18N.t('common.growth_log_2')}</div>${buildMobileSimpleGroup(I18N.t('common.growth_log'), 'mnGrowthGroup', GROWTH_MENU, false)}  <div class="mn-group-title">${I18N.t('common.more')}</div>  <a href="${withPrefix(prefix, 'tips.html')}" class="mn-link" style="font-size:13.5px;padding:10px 1.25rem;">${I18N.t('common.parenting_tips')}</a></div>`;
  }

  // ── 검색 오버레이 ──
  function buildSearchOverlay(prefix) {
    return `<div class="nav-search-overlay" id="navSearchOverlay">  <div class="nav-search-box">    <form id="navSearchForm" action="${withPrefix(prefix, 'index.html')}" method="get">      <input type="text" name="q" id="navSearchInput" placeholder="${(I18N.t('common.search_tools_e_g_sleep'))}" autocomplete="off">      <button type="submit">${I18N.t('common.search')}</button>    </form>    <div class="nav-search-hint">${I18N.t('common.press_esc_close_linked_home')}</div>  </div></div>`;
  }

  // ── 하단 탭바 (모바일 원핸드 5탭: 홈/도구함/놀이/쇼핑/성장) ──
  function buildBottomNav(prefix) {
    return `<nav class="bottom-nav" aria-label="${(I18N.t('common.main_menu'))}">  <a href="${withPrefix(prefix, 'index.html')}" class="bn-item"><span class="bn-icon">🏠</span>${I18N.t('common.home_2')}</a>  <a href="${withPrefix(prefix, 'index.html#toolHub')}" class="bn-item"><span class="bn-icon">🧰</span>${I18N.t('common.toolbox')}</a>  <a href="${withPrefix(prefix, 'play.html')}" class="bn-item"><span class="bn-icon">🧸</span>${I18N.t('common.play')}</a>  <a href="${withPrefix(prefix, 'shop.html')}" class="bn-item"><span class="bn-icon">🛍️</span>${I18N.t('common.shop')}</a>  <a href="${withPrefix(prefix, 'growth.html')}" class="bn-item"><span class="bn-icon">👶</span>${I18N.t('common.growth')}</a></nav>`;
  }

  // ── 푸터: 도구 페이지용(짧은 버전) ──
  function buildToolFooter(prefix) {
    return `<footer>${I18N.t('common.2026_ailog')} <a href="${withPrefix(prefix, 'index.html')}">${I18N.t('common.view_all_tools')}</a></footer>`;
  }

  // ── 푸터: 사이트 공통(안내문 + 정책 링크) ──
  function buildSiteFooter(prefix, homeLabel) {
    var homeLink = homeLabel ? '<a href="' + withPrefix(prefix, 'index.html') + '">' + esc(homeLabel) + '</a> &nbsp;·&nbsp; ' : '';
    return `<footer>  <p>${I18N.t('common.2026_ailog_all_information_reference')}</p>  <p style="margin-top:4px;">${homeLink}<a href="#">${I18N.t('common.privacy_policy')}</a> &nbsp;·&nbsp; <a href="#">${I18N.t('common.contact_us')}</a></p></footer>`;
  }

  // ───────────────────────────────────────────────────────────────
  // 마운트: data-root-prefix 를 읽어 상대경로를 자동 계산하고,
  // 페이지에 남겨둔 자리표시자를 실제 마크업으로 교체합니다.
  // ───────────────────────────────────────────────────────────────
  function mount() {
    var body = document.body;
    var prefix = (body && body.getAttribute('data-root-prefix')) || '';

    var headerRoot = document.getElementById('siteHeader');
    if (headerRoot) {
      headerRoot.outerHTML = buildSiteNav(prefix) + buildMobileNav(prefix) + buildSearchOverlay(prefix);
    }

    var footerRoot = document.getElementById('siteFooter');
    if (footerRoot) {
      var kind = footerRoot.getAttribute('data-footer') || 'tool';
      footerRoot.outerHTML = (kind === 'tool')
        ? buildToolFooter(prefix)
        : buildSiteFooter(prefix, footerRoot.getAttribute('data-home-label') && I18N.t('common.back_home'));
    }

    var chipsRoot = document.getElementById('catChipsRoot');
    if (chipsRoot) chipsRoot.innerHTML = buildCatChips();

    var hubRoot = document.getElementById('toolHub');
    if (hubRoot && hubRoot.getAttribute('data-generated') !== 'false' && !hubRoot.hasChildNodes()) {
      hubRoot.innerHTML = buildToolHub(prefix);
    }

    if (window.I18N && I18N.mountSwitchers) I18N.mountSwitchers();

    // 하단 탭바는 별도 자리표시자 없이 항상 자동으로 붙입니다.
    if (!document.querySelector('.bottom-nav') && body) {
      body.insertAdjacentHTML('beforeend', buildBottomNav(prefix));
    }
  }

  mount();

  // 다른 스크립트에서도 동일한 카테고리/도구 데이터를 재사용할 수 있도록 노출
  window.NORIYA_TOOL_CATEGORIES = TOOL_CATEGORIES;
})();
