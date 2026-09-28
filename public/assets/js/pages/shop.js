/**
 * 페이지 스크립트 — shop.html
 * 공통 모듈(assets/i18n → config → analytics → partials → nav → baby)이 먼저 로드된 뒤 실행됩니다.
 */
/* ── 육아 쇼핑 & 도서 데이터 로드 (구글 시트 연동, 미설정 시 샘플 데이터) ── */
const SHOP_JSON_URL = (typeof CONFIG !== 'undefined') ? CONFIG.SHOP_SHEET_URL : '';

async function loadShop() {
  let items = [];
  if (SHOP_JSON_URL) {
    try {
      const res = await fetch(SHOP_JSON_URL);
      const data = await res.json();
      items = I18N.localizeRecords(Array.isArray(data) ? data : (data.items || []));
      if (!items.length) throw new Error('empty');
    } catch (e) {
      items = getSampleShopItems();
    }
  } else {
    items = getSampleShopItems();
  }
  renderShop(items);
}

function renderProductCard(p) {
  const hasDiscount = p.discount && p.price && p.discount < p.price;
  const priceHtml = p.price
    ? `<div class="shop-price-row">
         ${hasDiscount ? `<span class="shop-discount-badge">${Math.round((1 - p.discount / p.price) * 100)}%</span>` : ''}
         <span class="shop-price-now">${I18N.t('shop.s1799', {hasDiscount: (hasDiscount ? p.discount : p.price).toLocaleString()})}</span>
         ${hasDiscount ? `<span class="shop-price-was">${I18N.t('common.s0236', {p: p.price.toLocaleString()})}</span>` : ''}
       </div>`
    : '';
  const ageHtml = p.ageMonth ? `<span class="shop-age-tag">${p.ageMonth}</span>` : '';
  const href = p.link || ('https://www.google.com/search?q=' + encodeURIComponent(p.name));
  return `<a href="${href}" class="shop-product-card" target="_blank" rel="noopener nofollow sponsored">
    <span class="shop-product-emoji">${p.emoji || '🛍️'}</span>
    <span class="shop-product-name">${p.name}</span>
    <span class="shop-product-desc">${p.summary || ''}</span>
    ${priceHtml}
    ${ageHtml}
  </a>`;
}

function renderGrid(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.length
    ? items.map(renderProductCard).join('')
    : `<div class="tips-loading">${I18N.t('shop.coming_soon')}</div>`;
}

function renderShop(items) {
  const essentials = items.filter(i => i.section === 'essentials');
  const ebooks = items.filter(i => i.section === 'ebook');

  renderGrid('grid-diaper', essentials.filter(i => i.category === '기저귀'));
  renderGrid('grid-wipes', essentials.filter(i => i.category === '물티슈'));
  renderGrid('grid-weaning', essentials.filter(i => i.category === '이유식용품'));
  renderGrid('grid-formula', essentials.filter(i => i.category === '분유수유용품'));
  renderGrid('grid-ebook', ebooks);
}

function getSampleShopItems() {
  return [
    // 기저귀
    { id:'d1', section:'essentials', category:'기저귀', emoji:'🍼', name:I18N.t('shop.tape_diapers_bulk_box'), summary:I18N.t('shop.newborns_infants_highly_absorbent_bulk'), price:39900, discount:32900, ageMonth:I18N.t('shop.0_12_months') },
    { id:'d2', section:'essentials', category:'기저귀', emoji:'🩲', name:I18N.t('shop.pull_up_diapers_jumbo_pack'), summary:I18N.t('shop.comfortable_fit_active_kids'), price:42000, discount:35900, ageMonth:I18N.t('shop.12_months') },
    { id:'d3', section:'essentials', category:'기저귀', emoji:'🌙', name:I18N.t('shop.overnight_diapers'), summary:I18N.t('shop.no_worries_about_leaks_during'), price:36000, discount:29900, ageMonth:I18N.t('shop.6_months') },
    // 물티슈
    { id:'w1', section:'essentials', category:'물티슈', emoji:'🧻', name:I18N.t('shop.pure_baby_wipes_cap_10'), summary:I18N.t('shop.99_purified_water_gentle_low'), price:24900, discount:18900 },
    { id:'w2', section:'essentials', category:'물티슈', emoji:'🧴', name:I18N.t('shop.portable_wipes_20_single_packs'), summary:I18N.t('shop.portable_size_that_s_perfect'), price:15900, discount:12900 },
    { id:'w3', section:'essentials', category:'물티슈', emoji:'✨', name:I18N.t('shop.thick_embossed_wipes'), summary:I18N.t('shop.cleans_up_neatly_one_sheet'), price:21900, discount:17400 },
    // 이유식 용품
    { id:'m1', section:'essentials', category:'이유식용품', emoji:'🥣', name:I18N.t('shop.silicone_weaning_container_set'), summary:I18N.t('shop.freezer_safe_microwave_safe'), price:28000, discount:22900, ageMonth:I18N.t('shop.4_months') },
    { id:'m2', section:'essentials', category:'이유식용품', emoji:'🍽️', name:I18N.t('shop.early_weaning_high_chair_tray'), summary:I18N.t('shop.easy_clean_silicone_tray_mat'), price:19900, discount:15900, ageMonth:I18N.t('shop.6_months') },
    { id:'m3', section:'essentials', category:'이유식용품', emoji:'🥄', name:I18N.t('shop.stage_by_stage_weaning_spoon'), summary:I18N.t('shop.gum_friendly_material_organized_by'), price:12900, discount:9900, ageMonth:I18N.t('shop.4_months') },
    // 분유 & 수유용품
    { id:'f1', section:'essentials', category:'분유수유용품', emoji:'🥛', name:I18N.t('shop.stage_based_formula_bulk_can'), summary:I18N.t('shop.nutrition_designed_by_age_subscription'), price:45000, discount:39000, ageMonth:I18N.t('shop.0_12_months') },
    { id:'f2', section:'essentials', category:'분유수유용품', emoji:'🍼', name:I18N.t('shop.breast_pump_compatible_bottle_set'), summary:I18N.t('shop.designed_minimize_nipple_confusion_eas'), price:32000, discount:26900 },
    { id:'f3', section:'essentials', category:'분유수유용품', emoji:'🌡️', name:I18N.t('shop.formula_pot_purified_water_temperature'), summary:I18N.t('shop.must_have_that_greatly_shortens'), price:159000, discount:129000 },
    // E-Book
    { id:'e1', section:'ebook', category:'ebook', emoji:'😴', name:I18N.t('shop.our_baby_s_first_sleep'), summary:I18N.t('shop.how_build_sleep_habits_from'), price:12000, discount:0, ageMonth:I18N.t('shop.0_12_months') },
    { id:'e2', section:'ebook', category:'ebook', emoji:'🥦', name:I18N.t('shop.weaning_recipe_book_200'), summary:I18N.t('shop.complete_collection_early_mid_late'), price:15000, discount:0, ageMonth:I18N.t('shop.4_12_months') },
    { id:'e3', section:'ebook', category:'ebook', emoji:'🧭', name:I18N.t('shop.discipline_guide_by_age'), summary:I18N.t('shop.tantrums_stranger_anxiety_art_first'), price:13000, discount:0, ageMonth:I18N.t('shop.12_months') },
  ];
}

loadShop();
