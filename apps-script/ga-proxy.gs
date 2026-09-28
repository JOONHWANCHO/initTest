/**
 * GA4 Data API 프록시 (선택 · 현재 사이트 코드에서는 참조하지 않음)
 * =====================================================================
 * 서비스 계정 비공개키를 브라우저에 노출하지 않고 GA4 리포트를 조회하기 위한 중계 서버입니다.
 * 배포 절차는 README.md 의 "Google Analytics 연동" 섹션을 참고하세요.
 *
 * 비밀값은 코드가 아니라 [프로젝트 설정 → 스크립트 속성]에 저장하세요.
 *   SERVICE_ACCOUNT_EMAIL / PRIVATE_KEY (줄바꿈은 \n 그대로) / GA_PROPERTY_ID
 * appsscript.json 에 다음 권한이 필요합니다:
 *   "oauthScopes": ["https://www.googleapis.com/auth/analytics.readonly", "https://www.googleapis.com/auth/script.external_request"]
 * =====================================================================
 */
function prop_(name) {
  return PropertiesService.getScriptProperties().getProperty(name) || '';
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const token = getServiceAccountToken_();
    const payload = {
      dateRanges: [{ startDate: body.dateRange.start, endDate: body.dateRange.end }],
      metrics: body.metrics.map(function (m) { return { name: m }; }),
      dimensions: body.dimensions.map(function (d) { return { name: d }; }),
      limit: body.limit || 50,
    };
    const res = UrlFetchApp.fetch(
      'https://analyticsdata.googleapis.com/v1beta/properties/' + prop_('GA_PROPERTY_ID') + ':runReport',
      {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + token },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      }
    );
    return ContentService.createTextOutput(res.getContentText()).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getServiceAccountToken_() {
  const now = Math.floor(Date.now() / 1000);
  const header = Utilities.base64EncodeWebSafe(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = Utilities.base64EncodeWebSafe(JSON.stringify({
    iss: prop_('SERVICE_ACCOUNT_EMAIL'),
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));
  const key = prop_('PRIVATE_KEY').replace(/\\n/g, '\n');
  const signature = Utilities.base64EncodeWebSafe(Utilities.computeRsaSha256Signature(header + '.' + claim, key));
  const tokenRes = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    payload: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: header + '.' + claim + '.' + signature },
  });
  return JSON.parse(tokenRes.getContentText()).access_token;
}

// 헬스 체크용
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
}
