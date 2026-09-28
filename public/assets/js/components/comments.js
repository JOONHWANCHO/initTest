/* =====================================================================
   comments.js — 익명 댓글 위젯 (play.html 액티비티 상세페이지용)
   =====================================================================
   · 댓글은 완전 익명입니다. 어떤 사용자 식별 정보도 수집/전송하지 않습니다.
   · 댓글 원문은 이 파일이 아니라 서버(Apps Script, apps-script/comments.gs)에서
     암호화되어 구글시트에 저장됩니다. 이 파일은 평문을 서버로 보내고,
     서버가 돌려준 평문(이미 복호화된 상태)만 화면에 표시합니다.
     → 즉, 암호화/복호화 키는 이 파일에도 브라우저에도 절대 존재하지 않습니다.
   · 최대 200자 (이모지 등 유니코드 코드포인트 기준으로 셉니다).
   · 댓글 텍스트는 항상 textContent로만 렌더링해 저장형 XSS를 방지합니다.

   ── 사용법 ──────────────────────────────────────────────────────────
   <script src="[prefix]assets/js/components/comments.js" defer></script> 를 config.js 이후,
   페이지 스크립트보다 먼저 추가한 뒤, 상세 화면을 그리는 코드에서:

     document.getElementById('someContainer').innerHTML += '<div id="commentsRoot"></div>';
     window.NoriyaComments.mount('commentsRoot', activityId);

   컨테이너를 다시 그릴 때(다른 글로 이동 등)마다 mount()를 다시 호출하면 됩니다.
   ===================================================================== */
(function () {
  'use strict';

  var MAX_LEN = 200;
  var ANIMALS = [
    { name: I18N.t('common.squirrel'), emoji: '🐿️' }, { name: I18N.t('common.rabbit'), emoji: '🐰' }, { name: I18N.t('common.cat'), emoji: '🐱' },
    { name: I18N.t('common.penguin'), emoji: '🐧' }, { name: I18N.t('common.duck'), emoji: '🦆' }, { name: I18N.t('common.teddy_bear'), emoji: '🐻' },
    { name: I18N.t('common.fox'), emoji: '🦊' }, { name: I18N.t('common.hedgehog'), emoji: '🦔' }, { name: I18N.t('common.otter'), emoji: '🦦' },
    { name: I18N.t('common.chick'), emoji: '🐤' }
  ];

  function countChars(str) { return Array.from(str || '').length; }
  function truncateChars(str, max) { return Array.from(str || '').slice(0, max).join(''); }

  function commentsUrl() {
    return (typeof CONFIG !== 'undefined' && CONFIG.COMMENTS_URL) ? CONFIG.COMMENTS_URL : '';
  }

  // 댓글 id를 시드로 익명 아바타/닉네임을 만듭니다.
  // (작성자를 추적하기 위함이 아니라, 매 댓글이 서로 구분되어 보이도록 하는 순수 표시용 장치입니다.)
  function anonPersona(seed) {
    var h = 0;
    var s = String(seed);
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    var a = ANIMALS[h % ANIMALS.length];
    var num = (h % 90) + 10;
    return { name: I18N.t('common.anonymous', {a: (a.name + num)}), emoji: a.emoji };
  }

  function timeAgo(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return I18N.t('common.just_now');
    if (diff < 3600) return I18N.t('common.min_ago', {floor: Math.floor(diff / 60)});
    if (diff < 86400) return I18N.t('common.hr_ago', {floor: Math.floor(diff / 3600)});
    if (diff < 2592000) return I18N.t('common.days_ago', {floor: Math.floor(diff / 86400)});
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }

  function widgetShell(count) {
    return `<h3 class="comments-title">${I18N.t('common.comments')} <span class="comments-count" data-role="count">${(count == null ? '' : count)}</span></h3><form class="comment-form" data-role="form">  <textarea class="comment-input" data-role="input" maxlength="${(MAX_LEN * 2)}" rows="2"     placeholder="${(I18N.t('common.been_this_place_leave_anonymous'))}"></textarea>  <div class="comment-form-foot">    <span class="comment-hint">${I18N.t('common.fully_anonymous_stored_encrypted')}</span>    <span class="comment-counter" data-role="counter">0/${MAX_LEN}</span>  </div>  <button type="submit" class="comment-submit-btn" data-role="submit">${I18N.t('common.leave_anonymous_comment')}</button></form><div class="comment-list" data-role="list">  <div class="comment-skeleton skeleton"></div>  <div class="comment-skeleton skeleton"></div></div>`;
  }

  function buildCommentEl(c) {
    var persona = anonPersona(c.id);
    var wrap = document.createElement('div');
    wrap.className = 'comment-item';
    wrap.innerHTML =
      '<div class="comment-avatar">' + persona.emoji + '</div>' +
      '<div class="comment-body">' +
      '  <div class="comment-meta"><span class="comment-author"></span><span class="comment-time"></span></div>' +
      '  <div class="comment-text"></div>' +
      '</div>';
    wrap.querySelector('.comment-author').textContent = persona.name;
    wrap.querySelector('.comment-time').textContent = timeAgo(c.created_at);
    wrap.querySelector('.comment-text').textContent = c.text; // textContent만 사용 (XSS 방지)
    return wrap;
  }

  async function fetchComments(activityId) {
    var url = commentsUrl();
    if (!url) return [];
    var res = await fetch(url + '?action=list&activity_id=' + encodeURIComponent(activityId));
    var data = await res.json();
    return (data && data.ok && Array.isArray(data.comments)) ? data.comments : [];
  }

  async function submitComment(activityId, text) {
    var url = commentsUrl();
    if (!url) throw new Error(I18N.t('common.comments_feature_hasn_t_been'));
    var res = await fetch(url + '?action=add&activity_id=' + encodeURIComponent(activityId) + '&text=' + encodeURIComponent(text));
    var data = await res.json();
    if (!data || !data.ok) throw new Error((data && data.error) || I18N.t('common.failed_post_comment_please_try'));
    return data.comment;
  }

  function renderList(root, comments) {
    var listEl = root.querySelector('[data-role="list"]');
    var countEl = root.querySelector('[data-role="count"]');
    countEl.textContent = comments.length;
    listEl.innerHTML = '';
    if (!comments.length) {
      listEl.innerHTML = `<div class="comment-empty">${I18N.t('common.no_comments_yet_be_first')}</div>`;
      return;
    }
    comments.forEach(function (c) { listEl.appendChild(buildCommentEl(c)); });
  }

  function mount(rootId, activityId) {
    var root = document.getElementById(rootId);
    if (!root) return;
    if (!activityId) { root.innerHTML = ''; return; }

    root.className = 'comments-section';
    root.setAttribute('data-activity-id', String(activityId));
    root.innerHTML = widgetShell(null);

    var form = root.querySelector('[data-role="form"]');
    var input = root.querySelector('[data-role="input"]');
    var counter = root.querySelector('[data-role="counter"]');
    var submitBtn = root.querySelector('[data-role="submit"]');
    var listEl = root.querySelector('[data-role="list"]');

    function updateCounter() {
      var n = countChars(input.value);
      if (n > MAX_LEN) {
        input.value = truncateChars(input.value, MAX_LEN);
        n = MAX_LEN;
      }
      counter.textContent = n + '/' + MAX_LEN;
      counter.classList.toggle('is-max', n >= MAX_LEN);
    }
    input.addEventListener('input', updateCounter);

    if (!commentsUrl()) {
      listEl.innerHTML = `<div class="comment-empty">${I18N.t('common.comments_will_be_opening_soon')}</div>`;
      submitBtn.disabled = true;
    } else {
      fetchComments(activityId).then(function (comments) {
        renderList(root, comments);
      }).catch(function () {
        listEl.innerHTML = `<div class="comment-empty">${I18N.t('common.couldn_t_load_comments_try')}</div>`;
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      if (countChars(text) > MAX_LEN) {
        alert(I18N.t('common.comments_can_be_up_characters', {MAX_LEN}));
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = I18N.t('common.posting');

      submitComment(activityId, text).then(function (comment) {
        input.value = '';
        updateCounter();
        if (listEl.querySelector('.comment-empty')) listEl.innerHTML = '';
        var el = buildCommentEl(comment);
        el.classList.add('is-new');
        listEl.insertBefore(el, listEl.firstChild);
        var countEl = root.querySelector('[data-role="count"]');
        countEl.textContent = (parseInt(countEl.textContent, 10) || 0) + 1;
      }).catch(function (err) {
        alert(err.message || I18N.t('common.failed_post_comment_please_try'));
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = I18N.t('common.leave_anonymous_comment');
      });
    });
  }

  window.NoriyaComments = { mount: mount, MAX_LEN: MAX_LEN };
})();
