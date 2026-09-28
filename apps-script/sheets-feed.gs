/**
 * 구글 시트 → JSON 피드 (꿀팁 / 놀이 / 쇼핑 공용 Apps Script)
 * =====================================================================
 * 사이트는 이 웹앱이 돌려주는 JSON 을 fetch 해서 화면을 그립니다.
 *   꿀팁(tips.html)  → config.js 의 SHEET_JSON_URL   → { "tips":       [...] }
 *   놀이(play.html)  → config.js 의 PLAY_SHEET_URL   → { "activities": [...] }
 *   쇼핑(shop.html)  → config.js 의 SHOP_SHEET_URL   → { "items":      [...] }
 *
 * 사용법 (시트마다 한 번씩)
 *   1) 해당 스프레드시트에서 확장 프로그램 → Apps Script → 아래 코드 붙여넣기
 *   2) 아래 두 상수(SHEET_INDEX, RESPONSE_KEY)를 시트에 맞게 수정
 *   3) 배포 → 새 배포 → 웹 앱 (실행: 나 / 액세스: 모든 사용자) → URL 을 config.js 에 입력
 *   ※ 열(헤더)을 추가한 뒤에는 "새 버전"으로 다시 배포해야 반영됩니다.
 *
 * 시트 열(첫 행 = 헤더)
 *   공통 : id, category, emoji, title, summary, content, tags, date ...
 *   다국어: 화면에 보이는 텍스트 열에 `_en`, `_ja` 를 붙인 열을 추가하면 자동 적용됩니다.
 *          예) title_en, title_ja, summary_en, content_ja  (README > 다국어 > 시트 콘텐츠)
 *          비워 두면 한국어 원문이 표시됩니다. id/emoji/date/price/link 등은 번역 열이 필요 없습니다.
 * =====================================================================
 */

// ── 이 웹앱이 담당하는 시트 ──────────────────────────────
const SHEET_INDEX  = 0;         // 0 = 첫 번째 탭(꿀팁), 1 = 두 번째 탭(놀이), 2 = 세 번째 탭(쇼핑)
const RESPONSE_KEY = 'tips';    // 'tips' | 'activities' | 'items'  (사이트 코드가 기대하는 키)

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[SHEET_INDEX];
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(String);

  const records = rows.slice(1)
    .map(function (r) {
      const obj = {};
      headers.forEach(function (h, i) { if (h) obj[h.trim()] = r[i]; });
      return obj;
    })
    .filter(function (o) { return o.id !== '' && o.id !== undefined; });   // id 없는 행 제외

  const body = {};
  body[RESPONSE_KEY] = records;
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
