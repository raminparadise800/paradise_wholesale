/**
 * ============================================================================
 * PARADISE WHOLESALE CLOTHING ISTANBUL
 * Domain: https://paradisewholesaler.com
 * File: core.js (BLOCK 1 OF 3 — MODULES 01 & 02)
 * Architecture: Modular Section-Locked B2B Catalog, SSG Hydrator & Stepped Cart
 * ============================================================================
 */

/* ==========================================================================
   === شروع [MODULE-01: CONFIG, STATE & 3-LANG DICTIONARY] (ماژول ۱) ===
   راهنما: تنظیمات اتصال به فایربیس، حافظه وضعیت صفحه و ترجمه‌های ۳ زبانه
   ========================================================================== */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCQyBszaUZ4FJX2OJw4YrcLMwUbk2BtxL4",
  authDomain: "paradise-wholesale.firebaseapp.com",
  projectId: "paradise-wholesale",
  storageBucket: "paradise-wholesale.firebasestorage.app",
  messagingSenderId: "516659166400",
  appId: "1:516659166400:web:9ac24230ebe5676cfe0125"
};

export const SITE_DOMAIN = "https://paradisewholesaler.com";
export const DEFAULT_WHATSAPP = "+905459099395";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

/* دیکشنری کامل رابط کاربری به ۳ زبان (انگلیسی، ایتالیایی، اسپانیایی) */
export const UI_DICT = {
  en: {
    back: "Back",
    home: "Home",
    searchBtn: "Search",
    searchPlaceholder: "Search code (e.g. M12), Polo, Tracksuit, Jeans...",
    allCategories: "All Categories",
    allStyles: "All",
    allPrices: "All Prices",
    priceLabel: "💲 Price:",
    shareLink: "Share Link",
    copiedToast: "🔗 Direct link copied to clipboard!",
    addedToast: "✓ Pack added to wholesale order!",
    loadMore: "⬇️ Load More Products",
    modelsCount: "models",
    categoriesCount: "categories",
    perPc: "/ pc",
    packOf: "Pack:",
    pcsUnit: "pcs",
    sizesLabel: "Sizes:",
    addPackBtn: "🛒 Add 1 Pack",
    addPackModalBtn: "🛒 Add 1 Pack to Wholesale Order",
    watchVideo: "▶️ Watch Video",
    viewPhotos: "📸 View Photos",
    viewOrderBtn: "🛒 View & Send Order",
    cartTitle: "🛒 Wholesale Serie Pack Order",
    packsUnit: "Packs",
    piecesUnit: "Pieces",
    baseSubtotal: "Base Wholesale Subtotal:",
    smallOrderDiff: "Small-Order Tier Adjustment:",
    finalTotal: "Total Products Amount:",
    shippingNote: "✈️ Shipping / Air Cargo cost will be calculated on WhatsApp based on your destination country & total weight.",
    buyerNamePh: "Your Name / Shop Name",
    buyerCountryPh: "Country / City (e.g. Italy, Milan)",
    sendWhatsappBtn: "Send Order on WhatsApp (Instant Invoice)",
    floatingWa: "WhatsApp Direct",
    emptyCartMsg: "Your wholesale order list is currently empty. Tap '+ Add 1 Pack' on any product.",
    tierUnlockedMsg: "🎉 Best Factory Wholesale Rate Unlocked! ($0 small-order adjustment).",
    tierHintPrefix: "🔥 Add",
    tierHintMiddle: "more pcs to remove the",
    tierHintSuffix: "small-order adjustment & unlock the lowest factory price!",
    bottomBarBestRate: "✓ Best Factory Wholesale Rate Active!",
    bottomBarAddMore: "Add {rem} more pcs to unlock best factory rate!",
    switchCatBtn: "📂 Categories"
  },
  it: {
    back: "Indietro",
    home: "Home",
    searchBtn: "Cerca",
    searchPlaceholder: "Cerca codice (es. M12), Polo, Tuta, Jeans...",
    allCategories: "Tutte le Categorie",
    allStyles: "Tutti",
    allPrices: "Tutti i Prezzi",
    priceLabel: "💲 Prezzo:",
    shareLink: "Condividi Link",
    copiedToast: "🔗 Link diretto copiato!",
    addedToast: "✓ Pacco serie aggiunto all'ordine!",
    loadMore: "⬇️ Carica Altri Prodotti",
    modelsCount: "modelli",
    categoriesCount: "categorie",
    perPc: "/ pz",
    packOf: "Pacco:",
    pcsUnit: "pz",
    sizesLabel: "Taglie:",
    addPackBtn: "🛒 +1 Pacco Serie",
    addPackModalBtn: "🛒 Aggiungi 1 Pacco all'Ordine",
    watchVideo: "▶️ Guarda Video",
    viewPhotos: "📸 Vedi Foto",
    viewOrderBtn: "🛒 Vedi e Invia Ordine",
    cartTitle: "🛒 Ordine Ingrosso Pacchi Serie",
    packsUnit: "Pacchi",
    piecesUnit: "Pezzi",
    baseSubtotal: "Subtotale Base Ingrosso:",
    smallOrderDiff: "Supplemento Ordine Ridotto:",
    finalTotal: "Totale Prodotti:",
    shippingNote: "✈️ Il costo di spedizione / Cargo Aereo verrà calcolato su WhatsApp in base al paese di destinazione e al peso.",
    buyerNamePh: "Tuo Nome / Negozio",
    buyerCountryPh: "Paese / Città (es. Italia, Milano)",
    sendWhatsappBtn: "Invia Ordine su WhatsApp (Fattura Istantanea)",
    floatingWa: "WhatsApp Diretto",
    emptyCartMsg: "Il tuo carrello ingrosso è vuoto. Tocca '+1 Pacco Serie' sui prodotti.",
    tierUnlockedMsg: "🎉 Miglior Prezzo di Fabbrica Sbloccato! ($0 supplemento).",
    tierHintPrefix: "🔥 Aggiungi altri",
    tierHintMiddle: "pz per azzerare il supplemento di",
    tierHintSuffix: "e ottenere il prezzo di fabbrica più basso!",
    bottomBarBestRate: "✓ Miglior Prezzo di Fabbrica Attivo!",
    bottomBarAddMore: "Aggiungi {rem} pz per il miglior prezzo di fabbrica!",
    switchCatBtn: "📂 Categorie"
  },
  es: {
    back: "Atrás",
    home: "Inicio",
    searchBtn: "Buscar",
    searchPlaceholder: "Buscar código (ej. M12), Polo, Chándal, Vaqueros...",
    allCategories: "Todas las Categorías",
    allStyles: "Todos",
    allPrices: "Todos los Precios",
    priceLabel: "💲 Precio:",
    shareLink: "Compartir Enlace",
    copiedToast: "🔗 ¡Enlace directo copiado!",
    addedToast: "✓ ¡Paquete serie añadido al pedido!",
    loadMore: "⬇️ Cargar Más Productos",
    modelsCount: "modelos",
    categoriesCount: "categorías",
    perPc: "/ ud",
    packOf: "Paquete:",
    pcsUnit: "uds",
    sizesLabel: "Tallas:",
    addPackBtn: "🛒 +1 Paquete Serie",
    addPackModalBtn: "🛒 Añadir 1 Paquete al Pedido",
    watchVideo: "▶️ Ver Vídeo",
    viewPhotos: "📸 Ver Fotos",
    viewOrderBtn: "🛒 Ver y Enviar Pedido",
    cartTitle: "🛒 Pedido Mayorista por Paquetes",
    packsUnit: "Paquetes",
    piecesUnit: "Unidades",
    baseSubtotal: "Subtotal Base Mayorista:",
    smallOrderDiff: "Ajuste por Pedido Pequeño:",
    finalTotal: "Total Productos:",
    shippingNote: "✈️ El costo de envío / Carga Aérea se calculará por WhatsApp según su país de destino y peso total.",
    buyerNamePh: "Su Nombre / Tienda",
    buyerCountryPh: "País / Ciudad (ej. España, Madrid)",
    sendWhatsappBtn: "Enviar Pedido por WhatsApp (Factura Instantánea)",
    floatingWa: "WhatsApp Directo",
    emptyCartMsg: "Su pedido mayorista está vacío. Toque '+1 Paquete Serie' en cualquier producto.",
    tierUnlockedMsg: "🎉 ¡Mejor Precio de Fábrica Desbloqueado! ($0 ajuste).",
    tierHintPrefix: "🔥 ¡Añada",
    tierHintMiddle: "uds más para eliminar el ajuste de",
    tierHintSuffix: "y activar el precio más bajo de fábrica!",
    bottomBarBestRate: "✓ ¡Mejor Precio de Fábrica Activo!",
    bottomBarAddMore: "¡Añada {rem} uds más para el mejor precio!",
    switchCatBtn: "📂 Categorías"
  }
};

/* وضعیت مرکزی کاتالوگ، فیلترها و سبد خرید */
export const coreState = {
  lang: localStorage.getItem("paradise_lang") || "en",
  dept: "",        // سطح ۱: مثلاً "men"
  cat: "",         // سطح ۲: مثلاً "men-tshirts"
  sub: "",         // سطح ۳ (زیربخش): مثلاً "polo"
  price: null,     // فیلتر قیمت: مثلاً 10
  searchQuery: "", // عبارت جستجو
  activeProductSku: "", // اگر لینک مستقیم یک عکس باز شده باشد
  displayLimit: 48,
  cardSlideIndexMap: new Map(), // ذخیره شماره اسلاید عکس روی هر کارت کوچک
  lightboxProduct: null,
  lightboxSlideIdx: 0,
  lightboxVideoMode: false,
  cart: JSON.parse(localStorage.getItem("paradise_b2b_cart") || "[]"),
  taxonomy: [],
  allProducts: [],
  publicConfig: {
    logoUrl: "",
    whatsappRaw: DEFAULT_WHATSAPP,
    whatsappDisplay: "+90 545 909 93 95",
    bestRateThreshold: 25,
    underMoqMarkupPercent: 15,
    ga4MeasurementId: "",
    googleAdsId: "",
    googleAdsConversionLabel: "",
    instagramUrl: "https://instagram.com/paradisewholesaler",
    telegramUrl: "https://t.me/paradisewholesaler",
    tiktokUrl: "https://tiktok.com/@paradisewholesaler",
    androidAppUrl: ""
  }
};

export function t(key) {
  const dict = UI_DICT[coreState.lang] || UI_DICT.en;
  return dict[key] || UI_DICT.en[key] || key;
}

export function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;")
    .replace(/'/g, "&" + "#039;");
}

export function slugify(text, fallback = "item") {
  const s = String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return s || fallback;
}

export function showCatalogToast(msg, duration = 2800) {
  const el = document.getElementById("catalog-toast");
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = "1";
  el.style.transform = "translateX(-50%) translateY(0)";
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-50%) translateY(20px)";
  }, duration);
}
/* === پایان [MODULE-01: CONFIG, STATE & 3-LANG DICTIONARY] === */


/* ==========================================================================
   === شروع [MODULE-02: FIREBASE DATA LOADER, SSG ROUTER & EMPTY FILTER] (ماژول ۲) ===
   راهنما: خواندن تمام بخش‌ها و شاخه‌های دیتابیس پنل ادمین (مردانه، زنانه، بچگانه و...)،
   تشخیص هوشمند صفحات فیزیکی و فیلتر کردن زیربخش‌های خالی در سطح ۳.
   ========================================================================== */

/* دسته‌بندی پیش‌فرض پایه در صورتی که دیتابیس هنوز بارگذاری نشده باشد */
const FALLBACK_TAXONOMY = [
  { id: "men", labelFa: "مردانه", labelEn: "Men", labelIt: "Uomo", labelEs: "Hombre", hidden: false, subcategories: [] },
  { id: "women", labelFa: "زنانه", labelEn: "Women", labelIt: "Donna", labelEs: "Mujer", hidden: false, subcategories: [] },
  { id: "kids-baby", labelFa: "بچگانه", labelEn: "Kids & Baby", labelIt: "Bambini", labelEs: "Niños y Bebés", hidden: false, subcategories: [] },
  { id: "shoes", labelFa: "کفش", labelEn: "Shoes", labelIt: "Scarpe", labelEs: "Calzado", hidden: false, subcategories: [] },
  { id: "bags-accessories", labelFa: "کیف و اکسسوری", labelEn: "Bags & Accessories", labelIt: "Borse e Accessori", labelEs: "Bolsos y Accesorios", hidden: false, subcategories: [] }
];

/**
 * بارگذاری تنظیمات، کل درخت دسته‌بندی‌های پنل ادمین و محصولات از فایربیس
 */
export async function loadCoreCatalogData() {
  coreState.displayLimit = 12; // لود اولیه فقط ۱۲ عکس برای سرعت فوق‌العاده در موبایل

  // ۱. خواندن تنظیمات عمومی و تمام بخش‌ها و شاخه‌های ساخته شده در پنل ادمین
  try {
    const cfgSnap = await getDoc(doc(db, "settings", "public_config"));
    if (cfgSnap.exists()) {
      const data = cfgSnap.data();
      coreState.publicConfig = { ...coreState.publicConfig, ...data };
      if (Array.isArray(data.taxonomy) && data.taxonomy.length > 0) {
        coreState.taxonomy = data.taxonomy.filter((d) => !d.hidden);
      }
    }
  } catch (e) {
    console.warn("Config load warning:", e.message);
  }

  if (!Array.isArray(coreState.taxonomy) || coreState.taxonomy.length === 0) {
    coreState.taxonomy = FALLBACK_TAXONOMY;
  }

  // ۲. خواندن سریع محصولات از شاردهای کاتالوگ یا کالکشن products
  try {
    const productsMap = new Map();
    const deptIds = coreState.taxonomy.map((d) => d.id);
    const shardIds = Array.from(new Set(["master_catalog", ...deptIds]));

    const shardSnaps = await Promise.all(
      shardIds.map((sid) => getDoc(doc(db, "catalog_shards", sid)).catch(() => null))
    );

    const extraPagePromises = [];

    shardSnaps.forEach((snap) => {
      if (snap && snap.exists()) {
        const sData = snap.data();
        (sData.items || []).forEach((item) => {
          if (item && (item.id || item.sku) && item.stockStatus !== "out_of_stock") {
            productsMap.set(item.id || item.sku, item);
          }
        });

        const totalPages = Number(sData.totalPages) || 1;
        const deptId = sData.department;
        if (deptId && totalPages > 1) {
          for (let p = 2; p <= totalPages; p++) {
            extraPagePromises.push(getDoc(doc(db, "catalog_shards", `${deptId}_p${p}`)).catch(() => null));
          }
        }
      }
    });

    if (extraPagePromises.length > 0) {
      const extraSnaps = await Promise.all(extraPagePromises);
      extraSnaps.forEach((snap) => {
        if (snap && snap.exists()) {
          (snap.data().items || []).forEach((item) => {
            if (item && (item.id || item.sku) && item.stockStatus !== "out_of_stock") {
              productsMap.set(item.id || item.sku, item);
            }
          });
        }
      });
    }

    if (productsMap.size === 0) {
      const prodSnap = await getDocs(query(collection(db, "products"), orderBy("createdAtMillis", "desc"), limit(2500)));
      prodSnap.forEach((d) => {
        const item = { id: d.id, ...d.data() };
        if (item.stockStatus !== "out_of_stock") {
          productsMap.set(item.id || item.sku, item);
        }
      });
    }

    coreState.allProducts = Array.from(productsMap.values()).sort(
      (a, b) => (Number(b.createdAtMillis) || 0) - (Number(a.createdAtMillis) || 0)
    );
  } catch (err) {
    console.warn("Products load warning:", err.message);
  }
}

export function getProductsForDept(deptId) {
  return coreState.allProducts.filter((p) => p.department === deptId);
}

export function getProductsForSubcat(deptId, subcatId) {
  return coreState.allProducts.filter(
    (p) => (!deptId || p.department === deptId) && p.subcategory === subcatId
  );
}

export function getProductsForLeaf(deptId, subcatId, leafObj) {
  if (!leafObj) return [];
  const leafId = String(leafObj.id || "").toLowerCase();
  const leafEn = String(leafObj.labelEn || "").toLowerCase();
  return coreState.allProducts.filter((p) => {
    if (deptId && p.department !== deptId) return false;
    if (subcatId && p.subcategory !== subcatId) return false;
    const pLeaf = String(p.leafSub || "").toLowerCase();
    return pLeaf === leafId || (leafEn && pLeaf === leafEn);
  });
}

/**
 * سطح ۱ (بخش‌های اصلی مثل مردانه، زنانه، بچگانه...):
 * تمام بخش‌های فعالی که در پنل ادمین ساخته‌ای را بدون استثنا نمایش می‌دهد (حتی اگر هنوز عکسی در آن آپلود نکرده باشی).
 */
export function getNonEmptyDepartments() {
  return coreState.taxonomy.filter((d) => !d.hidden);
}

/**
 * سطح ۲ (شاخه‌ها مثل تیشرت، هودی، شلوار، کت‌وشلوار...):
 * تمام شاخه‌های فعالی که در پنل ادمین زیرمجموعه آن بخش ساخته‌ای را نمایش می‌دهد.
 */
export function getNonEmptySubcategories(deptId) {
  const deptObj = coreState.taxonomy.find((d) => d.id === deptId);
  if (!deptObj || !Array.isArray(deptObj.subcategories)) return [];
  return deptObj.subcategories.filter((sc) => !sc.hidden);
}

/**
 * سطح ۳ (زیربخش‌های جزئی در نوار شیشه‌ای مثل یقه گرد / یقه‌دار):
 * فقط زیربخش‌هایی که حداقل ۱ محصول داخلشان آپلود شده باشد در نوار شیشه‌ای نمایش داده می‌شوند تا مشتری با صفحه خالی روبرو نشود.
 */
export function getNonEmptyLeaves(deptId, subcatId) {
  const deptObj = coreState.taxonomy.find((d) => d.id === deptId);
  const subObj = (deptObj?.subcategories || []).find((s) => s.id === subcatId);
  if (!subObj || !Array.isArray(subObj.leaves)) return [];
  return subObj.leaves.filter((lf) => !lf.hidden && getProductsForLeaf(deptId, subcatId, lf).length > 0);
}

export function getLocalizedTaxonomyLabel(itemObj) {
  if (!itemObj) return "";
  if (coreState.lang === "it") return itemObj.labelIt || itemObj.labelEn || itemObj.label || itemObj.id;
  if (coreState.lang === "es") return itemObj.labelEs || itemObj.labelEn || itemObj.label || itemObj.id;
  return itemObj.labelEn || itemObj.label || itemObj.id;
}

export function resolveCurrentRouteFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname || "";

  const pathSegments = pathname.split("/").filter(Boolean);
  const langFromPath = ["en", "it", "es"].includes(pathSegments[0]) ? pathSegments[0] : "";
  const langParam = params.get("lang");

  if (langParam && ["en", "it", "es"].includes(langParam)) {
    coreState.lang = langParam;
  } else if (langFromPath) {
    coreState.lang = langFromPath;
  }
  localStorage.setItem("paradise_lang", coreState.lang);

  if (pathSegments[1] === "product" && pathSegments[2]) {
    coreState.activeProductSku = pathSegments[2].toUpperCase();
  } else if (params.get("product")) {
    coreState.activeProductSku = params.get("product").trim().toUpperCase();
  } else {
    coreState.activeProductSku = "";
  }

  coreState.dept = params.get("dept") || "";
  coreState.cat = params.get("cat") || "";
  coreState.sub = params.get("sub") || "";
  coreState.price = params.get("price") ? parseFloat(params.get("price")) : null;
  coreState.searchQuery = params.get("q") || "";

  if (!coreState.dept && langFromPath && pathSegments.length >= 2 && pathSegments[1] !== "product" && pathSegments[1] !== "blog") {
    const segDept = pathSegments[1].toLowerCase();
    const matchedDept = coreState.taxonomy.find(
      (d) =>
        d.id === segDept ||
        d.slugs?.en === segDept ||
        d.slugs?.it === segDept ||
        d.slugs?.es === segDept ||
        slugify(d.labelEn) === segDept
    );

    if (matchedDept) {
      coreState.dept = matchedDept.id;

      if (pathSegments.length >= 3) {
        const segCat = pathSegments[2].toLowerCase();
        const matchedCat = (matchedDept.subcategories || []).find(
          (sc) =>
            sc.id === segCat ||
            sc.slugs?.en === segCat ||
            sc.slugs?.it === segCat ||
            sc.slugs?.es === segCat ||
            slugify(sc.labelEn) === segCat
        );

        if (matchedCat) {
          coreState.cat = matchedCat.id;

          if (pathSegments.length >= 4) {
            const segLeaf = pathSegments[3].toLowerCase();
            const matchedLeaf = (matchedCat.leaves || []).find(
              (lf) =>
                lf.id === segLeaf ||
                lf.slugs?.en === segLeaf ||
                lf.slugs?.it === segLeaf ||
                lf.slugs?.es === segLeaf ||
                slugify(lf.labelEn) === segLeaf
            );
            if (matchedLeaf) {
              coreState.sub = matchedLeaf.id;
            }
          }
        }
      }
    }
  }
}

export function buildShareableUrl(overrides = {}) {
  const state = {
    lang: overrides.lang !== undefined ? overrides.lang : coreState.lang,
    dept: overrides.dept !== undefined ? overrides.dept : coreState.dept,
    cat: overrides.cat !== undefined ? overrides.cat : coreState.cat,
    sub: overrides.sub !== undefined ? overrides.sub : coreState.sub,
    price: overrides.price !== undefined ? overrides.price : coreState.price,
    product: overrides.product !== undefined ? overrides.product : coreState.activeProductSku
  };

  const url = new URL(`${SITE_DOMAIN}/category.html`);
  url.searchParams.set("lang", state.lang || "en");
  if (state.dept) url.searchParams.set("dept", state.dept);
  if (state.cat) url.searchParams.set("cat", state.cat);
  if (state.sub) url.searchParams.set("sub", state.sub);
  if (state.price !== null && state.price !== undefined && !isNaN(state.price)) {
    url.searchParams.set("price", String(state.price));
  }
  if (state.product) url.searchParams.set("product", state.product);
  return url.toString();
}

export function syncBrowserHistoryState() {
  const newUrl = buildShareableUrl();
  const rel = newUrl.replace(SITE_DOMAIN, "");
  try {
    window.history.replaceState({ ...coreState }, "", rel);
  } catch (e) {}
  updateDynamicSeoTags();
}

export function updateDynamicSeoTags() {
  const deptObj = coreState.taxonomy.find((d) => d.id === coreState.dept);
  const subObj = (deptObj?.subcategories || []).find((s) => s.id === coreState.cat);
  const leafObj = (subObj?.leaves || []).find((l) => l.id === coreState.sub);

  const deptName = getLocalizedTaxonomyLabel(deptObj);
  const subName = getLocalizedTaxonomyLabel(subObj);
  const leafName = getLocalizedTaxonomyLabel(leafObj);

  const parts = [];
  if (deptName) parts.push(deptName);
  if (subName && !subName.toLowerCase().includes((deptName || "").toLowerCase())) {
    parts.push(subName);
  } else if (subName && !deptName) {
    parts.push(subName);
  }
  if (leafName) parts.push(leafName);

  const hierarchyLabel = parts.join(" — ") || t("allCategories");
  const priceSuffix = coreState.price ? ` ($${coreState.price})` : "";

  const headingEl = document.getElementById("view-context-heading");
  if (headingEl) {
    headingEl.textContent = `${hierarchyLabel}${priceSuffix}`;
  }

  const seoTitleByLang = {
    en: `Wholesale ${hierarchyLabel}${priceSuffix} | Direct Istanbul Factory Supplier`,
    it: `Ingrosso ${hierarchyLabel}${priceSuffix} | Fornitore Diretto Istanbul Turchia`,
    es: `Mayorista ${hierarchyLabel}${priceSuffix} | Proveedor Directo Estambul Turquía`
  };

  const seoDescByLang = {
    en: `Buy wholesale ${hierarchyLabel} in serie packs directly from Istanbul, Turkey. Best factory prices & 3-5 day express air cargo.`,
    it: `Acquista ${hierarchyLabel} all'ingrosso in pacchi serie direttamente da Istanbul, Turchia. Prezzi di fabbrica e spedizione espressa in 3-5 giorni.`,
    es: `Compre ${hierarchyLabel} al por mayor en paquetes serie directo desde Estambul, Turquía. Precios de fábrica y envío exprés en 3-5 días.`
  };

  const pageTitle = seoTitleByLang[coreState.lang] || seoTitleByLang.en;
  const pageDesc = seoDescByLang[coreState.lang] || seoDescByLang.en;
  const canonicalUrl = buildShareableUrl();

  document.title = pageTitle;
  document.getElementById("seo-desc")?.setAttribute("content", pageDesc);
  document.getElementById("seo-canonical")?.setAttribute("href", canonicalUrl);
  document.getElementById("og-title")?.setAttribute("content", pageTitle);
  document.getElementById("og-desc")?.setAttribute("content", pageDesc);
  document.getElementById("og-url")?.setAttribute("content", canonicalUrl);

  const coverImg = leafObj?.image || subObj?.image || deptObj?.image;
  if (coverImg) {
    document.getElementById("og-image")?.setAttribute("content", coverImg);
  }

  ["en", "it", "es"].forEach((lng) => {
    const el = document.getElementById(`hreflang-${lng}`);
    if (el) el.setAttribute("href", buildShareableUrl({ lang: lng }));
  });

  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_DOMAIN}/` }
  ];
  if (deptObj) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: breadcrumbItems.length + 1,
      name: deptName,
      item: buildShareableUrl({ dept: deptObj.id, cat: "", sub: "", price: null })
    });
  }
  if (subObj) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: breadcrumbItems.length + 1,
      name: `${deptName} ${subName}`.trim(),
      item: buildShareableUrl({ dept: deptObj?.id, cat: subObj.id, sub: "", price: null })
    });
  }
  if (leafObj) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: breadcrumbItems.length + 1,
      name: `${deptName} ${subName} ${leafName}`.trim(),
      item: canonicalUrl
    });
  }

  const schemaEl = document.getElementById("seo-json-ld");
  if (schemaEl) {
    schemaEl.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems
    });
  }
}
/* === پایان [MODULE-02: FIREBASE DATA LOADER, SSG ROUTER & EMPTY FILTER] === */


/* ==========================================================================
   === شروع [MODULE-03: 3-STAGE ARCHITECTURE, VISUAL CARDS & GLASS BAR] (ماژول ۳) ===
   راهنما: پیاده‌سازی معماری ۳ مرحله‌ای:
   - مرحله ۱ (صفحه اول کاتالوگ): فقط کارت‌های بزرگ بخش‌های اصلی (مردانه، زنانه...). بدون محصول و بدون ریل!
   - مرحله ۲ (انتخاب بخش مثلاً مردانه): فقط کارت‌های بزرگ شاخه‌های آن بخش (تیشرت، سویشرت...). بدون محصول و بدون ریل!
   - مرحله ۳ (ورود به یک شاخه مثلاً تیشرت): نمایش محصولات + فعال شدن ریل شیشه‌ای زیربخش‌ها و ریل قیمت!
   ========================================================================== */

const LANG_FLAGS = { en: "🇬🇧", it: "🇮🇹", es: "🇪🇸" };

export function applyLocalizedStaticTexts() {
  const setTxt = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  };

  setTxt("txt-nav-back", "back");
  setTxt("txt-nav-home", "home");
  setTxt("txt-search-btn", "searchBtn");
  setTxt("txt-price-filter-label", "priceLabel");
  setTxt("txt-share-view", "shareLink");
  setTxt("btn-load-more-products", "loadMore");
  setTxt("txt-view-order-btn", "viewOrderBtn");
  setTxt("txt-cart-drawer-title", "cartTitle");
  setTxt("txt-base-subtotal-label", "baseSubtotal");
  setTxt("txt-small-order-diff-label", "smallOrderDiff");
  setTxt("txt-final-total-label", "finalTotal");
  setTxt("txt-shipping-whatsapp-note", "shippingNote");
  setTxt("txt-send-whatsapp-order", "sendWhatsappBtn");
  setTxt("txt-floating-wa", "floatingWa");

  const searchInput = document.getElementById("catalog-live-search");
  if (searchInput) searchInput.placeholder = t("searchPlaceholder");

  const nameInp = document.getElementById("cart-buyer-name");
  if (nameInp) nameInp.placeholder = t("buyerNamePh");

  const countryInp = document.getElementById("cart-buyer-country");
  if (countryInp) countryInp.placeholder = t("buyerCountryPh");

  // بروزرسانی دکمه پرچم و کد زبان در هدر بالا
  const flagEl = document.getElementById("current-lang-flag");
  const codeEl = document.getElementById("current-lang-code");
  if (flagEl) flagEl.textContent = LANG_FLAGS[coreState.lang] || "🇬🇧";
  if (codeEl) codeEl.textContent = (coreState.lang || "en").toUpperCase();

  document.querySelectorAll("#lang-dropdown-menu .lang-option-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === coreState.lang);
  });
}

export function updateBackButtonVisibility() {
  const backBtn = document.getElementById("btn-nav-back");
  if (!backBtn) return;

  const canGoBack = Boolean(coreState.dept || coreState.cat || coreState.sub || coreState.price || coreState.searchQuery);
  backBtn.style.display = canGoBack ? "inline-flex" : "none";
}

export function handleStepBackNavigation() {
  if (coreState.searchQuery) {
    coreState.searchQuery = "";
    const sInp = document.getElementById("catalog-live-search");
    if (sInp) sInp.value = "";
    document.getElementById("search-drawer-bar")?.classList.remove("open");
  } else if (coreState.price !== null) {
    coreState.price = null;
  } else if (coreState.sub) {
    coreState.sub = "";
  } else if (coreState.cat) {
    coreState.cat = "";
  } else if (coreState.dept) {
    coreState.dept = "";
  }

  coreState.displayLimit = 12;
  syncBrowserHistoryState();
  renderEntireCatalogView(true);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * آیا در مرحله ۳ (نمایش محصولات و ریل‌های بالا) هستیم؟
 * فقط زمانی که مشتری وارد یک شاخه (مثلاً تیشرت) شده باشد یا عبارتی را سرچ کرده باشد!
 */
export function isProductStageActive() {
  return Boolean((coreState.dept && coreState.cat) || coreState.searchQuery);
}

/**
 * رندر کارت‌های تصویری بزرگ ۲ ستونه:
 * - در مرحله ۱: نمایش تمام بخش‌های اصلی دیتابیس (مردانه، زنانه، بچگانه، کفش، کیف...)
 * - در مرحله ۲: نمایش تمام شاخه‌های بخش انتخاب‌شده (مثلاً تمام شاخه‌های مردانه)
 * - در مرحله ۳: مخفی کردن کارت‌های بزرگ (مگر اینکه مشتری روی دکمه میانبر 📂 Categories کلیک کند)
 */
export function renderVisualCategoryCards(forceShowSubcats = false) {
  const section = document.getElementById("visual-categories-section");
  const grid = document.getElementById("visual-categories-grid");
  if (!section || !grid) return;

  if (coreState.searchQuery) {
    section.style.display = "none";
    return;
  }

  // مرحله ۱: صفحه اول کاتالوگ (نمایش تمام بخش‌های اصلی دیتابیس)
  if (!coreState.dept) {
    const depts = getNonEmptyDepartments();
    section.style.display = "block";
    grid.innerHTML = depts
      .map((d) => {
        const title = escapeHtml(getLocalizedTaxonomyLabel(d));
        const subCount = getNonEmptySubcategories(d.id).length;
        const prodCount = getProductsForDept(d.id).length;
        const img = escapeHtml(
          d.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80"
        );

        return `
          <a href="${escapeHtml(buildShareableUrl({ dept: d.id, cat: "", sub: "", price: null }))}"
             class="visual-cat-card"
             data-select-dept="${escapeHtml(d.id)}">
            <img src="${img}" alt="${title}" loading="lazy" decoding="async" />
            <div class="visual-cat-overlay">
              <div class="visual-cat-name">${title}</div>
              <div class="visual-cat-meta">
                <span>${subCount > 0 ? `${subCount} ${t("categoriesCount")}` : `${prodCount} ${t("modelsCount")}`}</span>
                <span>➔</span>
              </div>
            </div>
          </a>
        `;
      })
      .join("");
    return;
  }

  // مرحله ۲: داخل یک بخش اصلی (مثلاً مردانه) هستیم و هنوز شاخه‌ای انتخاب نشده (یا دکمه میانبر شاخه‌ها زده شده)
  if (coreState.dept && (!coreState.cat || forceShowSubcats)) {
    const subcats = getNonEmptySubcategories(coreState.dept);
    if (subcats.length === 0) {
      section.style.display = "none";
      return;
    }

    section.style.display = "block";
    grid.innerHTML = subcats
      .map((sc) => {
        const title = escapeHtml(getLocalizedTaxonomyLabel(sc));
        const count = getProductsForSubcat(coreState.dept, sc.id).length;
        const isCurrent = coreState.cat === sc.id;
        const img = escapeHtml(
          sc.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80"
        );

        return `
          <a href="${escapeHtml(buildShareableUrl({ dept: coreState.dept, cat: sc.id, sub: "", price: null }))}"
             class="visual-cat-card"
             style="${isCurrent ? "border: 2.5px solid var(--gold);" : ""}"
             data-select-cat="${escapeHtml(sc.id)}">
            <img src="${img}" alt="${title}" loading="lazy" decoding="async" />
            <div class="visual-cat-overlay">
              <div class="visual-cat-name">${title}</div>
              <div class="visual-cat-meta">
                <span>${count} ${t("modelsCount")}</span>
                <span>➔</span>
              </div>
            </div>
          </a>
        `;
      })
      .join("");
    return;
  }

  // مرحله ۳: داخل یک شاخه خاص هستیم -> کارت‌های بزرگ جمع می‌شوند تا فقط محصولات دیده شوند
  section.style.display = "none";
}

/**
 * رندر نوار شیشه‌ای زیربخش‌ها (فقط در مرحله ۳ یعنی بعد از ورود به یک شاخه خاص روشن می‌شود!)
 * در مراحل ۱ و ۲ کاملاً مخفی است تا صفحه شلوغ و تکراری نشود.
 */
export function renderStickyGlassPills(triggerNudge = false) {
  const dock = document.getElementById("sticky-glass-dock");
  const subnavRow = document.getElementById("glass-subnav-row");
  const track = document.getElementById("glass-pills-track");
  if (!dock || !track) return;

  // اگر هنوز در مرحله ۱ (بخش‌های اصلی) یا مرحله ۲ (کارت‌های شاخه‌ها) هستیم، کل نوار شیشه‌ای را مخفی کن!
  if (!isProductStageActive()) {
    dock.style.display = "none";
    return;
  }

  dock.style.display = "block";

  // اگر در حالت جستجو هستیم و شاخه‌ای انتخاب نشده، ردیف زیربخش را مخفی کن و فقط ردیف قیمت را نگه دار
  if (!coreState.dept || !coreState.cat) {
    if (subnavRow) subnavRow.style.display = "none";
    return;
  }

  if (subnavRow) subnavRow.style.display = "flex";

  const deptObj = coreState.taxonomy.find((d) => d.id === coreState.dept);
  const subObj = (deptObj?.subcategories || []).find((s) => s.id === coreState.cat);
  const totalCatCount = getProductsForSubcat(coreState.dept, coreState.cat).length;
  const nonEmptyLeaves = getNonEmptyLeaves(coreState.dept, coreState.cat);

  const pillsHtml = [];

  // ۱. دکمه میانبر باز کردن سایر شاخه‌های همین بخش (مثلاً پریدن از تیشرت به سویشرت)
  pillsHtml.push(`
    <button type="button" class="glass-pill switch-cat-btn" data-glass-action="toggle-subcats">
      <span>${t("switchCatBtn")} ▾</span>
    </button>
  `);

  // ۲. دکمه «همه» برای شاخه فعلی (مثلاً: همه تیشرت‌ها)
  pillsHtml.push(`
    <button type="button" class="glass-pill ${!coreState.sub ? "active" : ""}" data-glass-leaf="">
      <span>${t("allStyles")} ${escapeHtml(getLocalizedTaxonomyLabel(subObj))}</span>
      <span class="pill-count">(${totalCatCount})</span>
    </button>
  `);

  // ۳. دکمه‌های زیربخش‌های داخلیِ دارای عکس (مثلاً: یقه گرد، یقه‌دار پلو)
  nonEmptyLeaves.forEach((lf) => {
    const leafCount = getProductsForLeaf(coreState.dept, coreState.cat, lf).length;
    const isSelected = coreState.sub === lf.id;
    const thumbHtml = lf.image ? `<img src="${escapeHtml(lf.image)}" class="pill-thumb" alt="" />` : "";

    pillsHtml.push(`
      <button type="button" class="glass-pill ${isSelected ? "active" : ""}" data-glass-leaf="${escapeHtml(lf.id)}">
        ${thumbHtml}
        <span>${escapeHtml(getLocalizedTaxonomyLabel(lf))}</span>
        <span class="pill-count">(${leafCount})</span>
      </button>
    `);
  });

  track.innerHTML = pillsHtml.join("");

  requestAnimationFrame(() => {
    updateGlassScrollIndicators();
    const activePill = track.querySelector(".glass-pill.active");
    if (activePill && coreState.sub) {
      activePill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    } else if (triggerNudge && track.scrollWidth > track.clientWidth + 24) {
      track.classList.remove("nudge-hint");
      void track.offsetWidth;
      track.classList.add("nudge-hint");
    }
  });
}

export function updateGlassScrollIndicators() {
  const track = document.getElementById("glass-pills-track");
  const leftBtn = document.getElementById("scroll-arrow-left");
  const rightBtn = document.getElementById("scroll-arrow-right");
  const barWrap = document.getElementById("micro-scroll-bar-wrap");
  const barFill = document.getElementById("micro-scroll-bar-fill");

  if (!track || !isProductStageActive()) {
    if (barWrap) barWrap.classList.remove("visible");
    return;
  }

  const maxScroll = track.scrollWidth - track.clientWidth;
  const isOverflowing = maxScroll > 12;

  if (leftBtn) leftBtn.classList.toggle("visible", isOverflowing && track.scrollLeft > 8);
  if (rightBtn) rightBtn.classList.toggle("visible", isOverflowing && track.scrollLeft < maxScroll - 8);
  if (barWrap) barWrap.classList.toggle("visible", isOverflowing);

  if (isOverflowing && barFill) {
    const visibleRatio = Math.max(0.18, Math.min(0.85, track.clientWidth / track.scrollWidth));
    const scrollRatio = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
    const widthPct = visibleRatio * 100;
    const translatePct = scrollRatio * ((1 - visibleRatio) / visibleRatio) * 100;
    barFill.style.width = `${widthPct}%`;
    barFill.style.transform = `translateX(${translatePct}%)`;
  }
}

export function bindSmartHeaderAndGlassEvents() {
  let lastScrollY = window.scrollY;
  const topHeader = document.getElementById("smart-top-header");
  const searchDrawer = document.getElementById("search-drawer-bar");
  const langMenu = document.getElementById("lang-dropdown-menu");

  window.addEventListener(
    "scroll",
    () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;

      if (currentY > 75 && delta > 7 && !searchDrawer?.classList.contains("open")) {
        topHeader?.classList.add("header-hidden");
        langMenu?.classList.remove("open");
        document.body.classList.add("scrolled-down");
      } else if (delta < -6 || currentY <= 40) {
        topHeader?.classList.remove("header-hidden");
        document.body.classList.remove("scrolled-down");
      }
      lastScrollY = currentY;
    },
    { passive: true }
  );

  document.getElementById("btn-nav-back")?.addEventListener("click", handleStepBackNavigation);

  // منوی کشویی انتخاب زبان با پرچم کشورها (🇬🇧 EN / 🇮🇹 IT / 🇪🇸 ES)
  document.getElementById("btn-lang-dropdown")?.addEventListener("click", (e) => {
    e.stopPropagation();
    langMenu?.classList.toggle("open");
  });

  document.getElementById("lang-dropdown-menu")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang]");
    if (!btn) return;
    coreState.lang = btn.getAttribute("data-lang") || "en";
    localStorage.setItem("paradise_lang", coreState.lang);
    langMenu?.classList.remove("open");
    applyLocalizedStaticTexts();
    syncBrowserHistoryState();
    renderEntireCatalogView(false);
    renderSteppedCartUI();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#lang-switcher-group")) {
      langMenu?.classList.remove("open");
    }
  });

  // باز و بسته کردن نوار جستجو
  document.getElementById("btn-toggle-search")?.addEventListener("click", () => {
    const drawer = document.getElementById("search-drawer-bar");
    if (!drawer) return;
    drawer.classList.toggle("open");
    if (drawer.classList.contains("open")) {
      document.getElementById("catalog-live-search")?.focus();
    }
  });

  document.getElementById("catalog-live-search")?.addEventListener("input", (e) => {
    coreState.searchQuery = e.target.value.trim();
    coreState.displayLimit = 12;
    renderEntireCatalogView(false);
  });

  document.getElementById("btn-clear-search")?.addEventListener("click", () => {
    coreState.searchQuery = "";
    const inp = document.getElementById("catalog-live-search");
    if (inp) inp.value = "";
    document.getElementById("search-drawer-bar")?.classList.remove("open");
    renderEntireCatalogView(false);
  });

  const track = document.getElementById("glass-pills-track");
  track?.addEventListener("scroll", updateGlassScrollIndicators, { passive: true });
  window.addEventListener("resize", updateGlassScrollIndicators);

  document.getElementById("scroll-arrow-left")?.addEventListener("click", () => {
    track?.scrollBy({ left: -180, behavior: "smooth" });
  });
  document.getElementById("scroll-arrow-right")?.addEventListener("click", () => {
    track?.scrollBy({ left: 180, behavior: "smooth" });
  });

  track?.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest('[data-glass-action="toggle-subcats"]');
    if (toggleBtn) {
      const sec = document.getElementById("visual-categories-section");
      const isHidden = sec?.style.display === "none";
      renderVisualCategoryCards(isHidden);
      if (isHidden) window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const leafBtn = e.target.closest("[data-glass-leaf]");
    if (leafBtn) {
      coreState.sub = leafBtn.getAttribute("data-glass-leaf") || "";
      coreState.price = null;
      coreState.displayLimit = 12;
      syncBrowserHistoryState();
      renderEntireCatalogView(false);
      return;
    }
  });

  // کلیک روی کارت‌های تصویری بزرگ ۲ ستونه (مراحل ۱ و ۲)
  document.getElementById("visual-categories-grid")?.addEventListener("click", (e) => {
    const deptCard = e.target.closest("[data-select-dept]");
    if (deptCard) {
      e.preventDefault();
      coreState.dept = deptCard.getAttribute("data-select-dept") || "";
      coreState.cat = "";
      coreState.sub = "";
      coreState.price = null;
      coreState.displayLimit = 12;
      syncBrowserHistoryState();
      renderEntireCatalogView(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const catCard = e.target.closest("[data-select-cat]");
    if (catCard) {
      e.preventDefault();
      coreState.cat = catCard.getAttribute("data-select-cat") || "";
      coreState.sub = "";
      coreState.price = null;
      coreState.displayLimit = 12;
      syncBrowserHistoryState();
      renderEntireCatalogView(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  document.getElementById("btn-share-current-view")?.addEventListener("click", async () => {
    const shareUrl = buildShareableUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: shareUrl });
        return;
      } catch (e) {}
    }
    await navigator.clipboard?.writeText(shareUrl).catch(() => {});
    showCatalogToast(t("copiedToast"));
  });
}
/* === پایان [MODULE-03: 3-STAGE ARCHITECTURE, VISUAL CARDS & GLASS BAR] === */


/* ==========================================================================
   === شروع [MODULE-04: DYNAMIC PRICE-TIER DETECTOR ($5 | $9 | $12)] (ماژول ۴) ===
   راهنما: تشخیص هوشمند قیمت‌های موجود در شاخه یا زیربخش فعلی از دیتابیس.
   فقط در مرحله ۳ (زمانی که محصولات نمایش داده می‌شوند) روشن می‌شود.
   ========================================================================== */

export function getProductsInCurrentScopeWithoutPrice() {
  if (!isProductStageActive()) return [];

  const deptObj = coreState.taxonomy.find((d) => d.id === coreState.dept);
  const subObj = (deptObj?.subcategories || []).find((s) => s.id === coreState.cat);
  const leafObj = (subObj?.leaves || []).find((l) => l.id === coreState.sub);
  const leafEnLower = String(leafObj?.labelEn || "").toLowerCase();
  const leafIdLower = String(coreState.sub || "").toLowerCase();
  const q = coreState.searchQuery.toLowerCase();

  return coreState.allProducts.filter((p) => {
    if (coreState.dept && p.department !== coreState.dept) return false;
    if (coreState.cat && p.subcategory !== coreState.cat) return false;
    if (coreState.sub) {
      const pLeaf = String(p.leafSub || "").toLowerCase();
      if (pLeaf !== leafIdLower && (!leafEnLower || pLeaf !== leafEnLower)) return false;
    }
    if (q) {
      const pub = `${p.publicTitle?.en || ""} ${p.publicTitle?.it || ""} ${p.publicTitle?.es || ""}`;
      const brd = `${p.brandTitle?.en || ""} ${p.detectedBrand || ""}`;
      const tags = Array.isArray(p.searchTags) ? p.searchTags.join(" ") : "";
      const hay = `${p.sku || ""} ${pub} ${brd} ${tags}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function renderDynamicPriceFilterBar() {
  const priceRow = document.getElementById("smart-price-row");
  const container = document.getElementById("price-chips-container");
  if (!priceRow || !container) return;

  // اگر هنوز وارد شاخه‌ای نشده‌ایم (مراحل ۱ و ۲)، ریل قیمت را کاملاً مخفی نگه دار!
  if (!isProductStageActive()) {
    priceRow.style.display = "none";
    return;
  }

  const scopedProducts = getProductsInCurrentScopeWithoutPrice();

  const priceCountMap = new Map();
  scopedProducts.forEach((p) => {
    const pr = Number(p.unitPrice);
    if (pr > 0) {
      priceCountMap.set(pr, (priceCountMap.get(pr) || 0) + 1);
    }
  });

  const sortedPrices = Array.from(priceCountMap.keys()).sort((a, b) => a - b);

  if (coreState.price !== null && !priceCountMap.has(coreState.price)) {
    coreState.price = null;
  }

  if (sortedPrices.length === 0) {
    priceRow.style.display = "none";
    return;
  }

  priceRow.style.display = "flex";

  const chipsHtml = [
    `<button type="button" class="price-chip-btn ${coreState.price === null ? "active" : ""}" data-select-price="">
      ${t("allPrices")} (${scopedProducts.length})
    </button>`
  ];

  sortedPrices.forEach((priceVal) => {
    const cnt = priceCountMap.get(priceVal) || 0;
    const isAct = coreState.price === priceVal;
    const formattedPrice = Number.isInteger(priceVal) ? `$${priceVal}` : `$${priceVal.toFixed(2)}`;
    chipsHtml.push(`
      <button type="button" class="price-chip-btn ${isAct ? "active" : ""}" data-select-price="${priceVal}">
        ${formattedPrice} <span style="opacity:0.75; font-weight:600;">(${cnt})</span>
      </button>
    `);
  });

  container.innerHTML = chipsHtml.join("");
}

export function bindPriceFilterEvents() {
  document.getElementById("price-chips-container")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-select-price]");
    if (!btn) return;
    const raw = btn.getAttribute("data-select-price");
    coreState.price = raw === "" ? null : parseFloat(raw);
    coreState.displayLimit = 12;
    updateBackButtonVisibility();
    syncBrowserHistoryState();
    renderDynamicPriceFilterBar();
    renderProductsCatalogGrid();
  });
}
/* === پایان [MODULE-04: DYNAMIC PRICE-TIER DETECTOR ($5 | $9 | $12)] === */

/* ==========================================================================
   === شروع [MODULE-05: PRODUCT CARD MINI-SLIDER & HD LIGHTBOX] (ماژول ۵) ===
   راهنما: نمایش محصولات فقط در مرحله ۳، لود پله‌ای ۱۲تایی عکس‌ها با اسکرول خودکار
   (بدون لود یکجای همه عکس‌ها در گوشی مشتری) و پنجره تمام‌صفحه HD عکس و ویدیو.
   ========================================================================== */

export function getFinalFilteredProducts() {
  if (!isProductStageActive()) return [];
  const scoped = getProductsInCurrentScopeWithoutPrice();
  if (coreState.price === null || isNaN(coreState.price)) return scoped;
  return scoped.filter((p) => Number(p.unitPrice) === Number(coreState.price));
}

export function getLocalizedProductTitle(prod) {
  const useBrand = Boolean(coreState.searchQuery);
  const titleObj = useBrand ? prod.brandTitle || prod.publicTitle : prod.publicTitle || prod.brandTitle;
  if (!titleObj) return `Premium Garment • Code ${prod.sku || prod.id}`;
  return titleObj[coreState.lang] || titleObj.en || `Premium Garment • Code ${prod.sku || prod.id}`;
}

export function getLocalizedProductDesc(prod) {
  const descObj = prod.description || {};
  return (
    descObj[coreState.lang] ||
    descObj.en ||
    `Direct Istanbul factory wholesale serie pack (${prod.pcsPerPack || 6} pcs/pack).`
  );
}

/**
 * رندر شبکه محصولات (فقط در مرحله ۳ یعنی بعد از ورود به یک شاخه خاص فعال می‌شود)
 * با تکنیک لود پله‌ای ۱۲تایی تا عکس‌ها یکجا در گوشی مشتری دانلود نشوند.
 */
export function renderProductsCatalogGrid() {
  const section = document.getElementById("products-catalog-section");
  const grid = document.getElementById("products-catalog-grid");
  const loadMoreBtn = document.getElementById("btn-load-more-products");
  if (!section || !grid) return;

  // اگر هنوز در صفحه اول (بخش‌های اصلی) یا صفحه کارت‌های شاخه‌ها هستیم، بخش محصولات کاملاً مخفی بماند!
  if (!isProductStageActive()) {
    section.style.display = "none";
    grid.innerHTML = "";
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  section.style.display = "block";
  const filtered = getFinalFilteredProducts();

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:42px 16px; background:#fff; border-radius:14px; border:1px solid var(--border); color:var(--text-muted); font-weight:700;">
        No products uploaded in this category yet.
      </div>
    `;
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  const visibleItems = filtered.slice(0, coreState.displayLimit);

  if (loadMoreBtn) {
    if (filtered.length > coreState.displayLimit) {
      loadMoreBtn.style.display = "inline-block";
      loadMoreBtn.textContent = `${t("loadMore")} (${visibleItems.length} / ${filtered.length})`;
    } else {
      loadMoreBtn.style.display = "none";
    }
  }

  grid.innerHTML = visibleItems
    .map((p, idx) => {
      const sku = escapeHtml(p.sku || p.id);
      const unitPrice = Number(p.unitPrice) || 0;
      const pcs = Math.max(1, parseInt(p.pcsPerPack, 10) || 6);
      const packTotal = (unitPrice * pcs).toFixed(0);
      const title = escapeHtml(getLocalizedProductTitle(p));
      const sizes = escapeHtml(p.sizeRange || "S - M - L - XL");
      const hasVideo = Boolean(p.videoUrl || p.youtubeId);

      const imagesList = Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.imageUrl];
      const currentSlideIdx = coreState.cardSlideIndexMap.get(p.id || p.sku) || 0;
      const activeImgSrc =
        currentSlideIdx === 0 ? p.thumbUrl || imagesList[0] || "" : imagesList[currentSlideIdx] || p.thumbUrl || "";

      // ۴ عکس اول در بالای صفحه با اولویت بالا و بقیه با لود تنبل (Lazy) بارگذاری می‌شوند
      const loadingAttr = idx < 4 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"';

      const multiImageControls =
        imagesList.length > 1
          ? `
            <button type="button" class="card-slider-arrow prev" data-card-slide="${sku}:-1" aria-label="Previous Photo">‹</button>
            <button type="button" class="card-slider-arrow next" data-card-slide="${sku}:1" aria-label="Next Photo">›</button>
            <div class="card-slider-dots">
              ${imagesList
                .map((_, dotIdx) => `<span class="card-slider-dot ${dotIdx === currentSlideIdx ? "active" : ""}"></span>`)
                .join("")}
            </div>
          `
          : "";

      return `
        <article class="prod-card" data-prod-card="${sku}">
          <div class="prod-media-box" data-open-lightbox="${sku}">
            <img src="${escapeHtml(activeImgSrc)}" alt="${title}" ${loadingAttr} />

            <div class="prod-top-badges">
              <div>
                ${hasVideo ? `<span class="badge-video-pill" data-open-video-direct="${sku}">▶️ Video</span>` : ""}
              </div>
              <button type="button" class="card-share-icon-btn" data-share-prod="${sku}" title="Copy direct link">🔗</button>
            </div>

            ${multiImageControls}
          </div>

          <div class="prod-info-body">
            <div>
              <div class="prod-price-pack-row">
                <span class="prod-unit-price">$${unitPrice} <small>${t("perPc")}</small></span>
                <span class="prod-pack-badge">${pcs} ${t("pcsUnit")} ($${packTotal})</span>
              </div>
              <div class="prod-title-line" title="${title}">${title}</div>
              <div class="prod-size-line">${t("sizesLabel")} ${sizes} • <strong>${sku}</strong></div>
            </div>

            <button type="button" class="btn-add-pack-card" data-add-pack="${sku}">
              <span>${t("addPackBtn")} (${pcs} ${t("pcsUnit")})</span>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

export function stepCardMiniSlider(sku, direction) {
  const prod = coreState.allProducts.find((p) => (p.sku || p.id) === sku);
  if (!prod) return;
  const imagesList = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.imageUrl];
  if (imagesList.length <= 1) return;

  const key = prod.id || prod.sku;
  const cur = coreState.cardSlideIndexMap.get(key) || 0;
  const nextIdx = (cur + direction + imagesList.length) % imagesList.length;
  coreState.cardSlideIndexMap.set(key, nextIdx);

  const cardEl = document.querySelector(`[data-prod-card="${CSS.escape(sku)}"]`);
  if (!cardEl) return;

  const imgEl = cardEl.querySelector(".prod-media-box img");
  if (imgEl) {
    imgEl.src = nextIdx === 0 ? prod.thumbUrl || imagesList[0] : imagesList[nextIdx];
  }

  cardEl.querySelectorAll(".card-slider-dot").forEach((dot, idx) => {
    dot.classList.toggle("active", idx === nextIdx);
  });
}

export function openProductLightbox(sku, startWithVideo = false) {
  const prod = coreState.allProducts.find((p) => (p.sku || p.id).toUpperCase() === String(sku).toUpperCase());
  if (!prod) return;

  coreState.lightboxProduct = prod;
  coreState.lightboxSlideIdx = 0;
  coreState.lightboxVideoMode = Boolean(startWithVideo && (prod.videoUrl || prod.youtubeId));
  coreState.activeProductSku = prod.sku || prod.id;
  syncBrowserHistoryState();

  renderLightboxStageContent();
  document.getElementById("hd-lightbox-modal")?.classList.add("open");
}

export function closeProductLightbox() {
  const modal = document.getElementById("hd-lightbox-modal");
  const stage = document.getElementById("lightbox-media-stage");
  if (stage) stage.innerHTML = "";
  modal?.classList.remove("open");
  coreState.lightboxProduct = null;
  coreState.activeProductSku = "";
  syncBrowserHistoryState();
}

export function renderLightboxStageContent() {
  const prod = coreState.lightboxProduct;
  if (!prod) return;

  const stage = document.getElementById("lightbox-media-stage");
  const counterEl = document.getElementById("lightbox-media-counter");
  const toggleVidBtn = document.getElementById("btn-lightbox-toggle-video");
  if (!stage) return;

  const imagesList = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.imageUrl];
  const hasVideo = Boolean(prod.videoUrl || prod.youtubeId);

  if (toggleVidBtn) {
    if (hasVideo) {
      toggleVidBtn.style.display = "inline-flex";
      toggleVidBtn.textContent = coreState.lightboxVideoMode ? t("viewPhotos") : t("watchVideo");
    } else {
      toggleVidBtn.style.display = "none";
    }
  }

  if (coreState.lightboxVideoMode && hasVideo) {
    if (prod.youtubeId) {
      stage.innerHTML = `
        <iframe
          src="https://www.youtube.com/embed/${escapeHtml(prod.youtubeId)}?autoplay=1&rel=0&playsinline=1"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
        ></iframe>
      `;
    } else {
      stage.innerHTML = `
        <video src="${escapeHtml(prod.videoUrl)}" controls autoplay playsinline poster="${escapeHtml(imagesList[0] || "")}"></video>
      `;
    }
    if (counterEl) counterEl.textContent = "🎬 Video";
  } else {
    const hdSrc = imagesList[coreState.lightboxSlideIdx] || prod.imageUrl || prod.thumbUrl || "";
    stage.innerHTML = `<img src="${escapeHtml(hdSrc)}" alt="${escapeHtml(prod.sku)}" />`;
    if (counterEl) counterEl.textContent = `${coreState.lightboxSlideIdx + 1} / ${imagesList.length}`;
  }

  const unitPrice = Number(prod.unitPrice) || 0;
  const pcs = Math.max(1, parseInt(prod.pcsPerPack, 10) || 6);
  const packTotal = (unitPrice * pcs).toFixed(2);

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("lightbox-unit-price", `$${unitPrice}`);
  setTxt("txt-lightbox-per-pc", t("perPc"));
  setTxt("lightbox-sku-badge", prod.sku || prod.id);
  setTxt("lightbox-prod-title", getLocalizedProductTitle(prod));
  setTxt("lightbox-prod-desc", getLocalizedProductDesc(prod));
  setTxt("txt-lightbox-pack-info", `${t("packOf")} ${pcs} ${t("pcsUnit")} ($${packTotal})`);
  setTxt("txt-lightbox-size-info", `${t("sizesLabel")} ${prod.sizeRange || "S-XXL"}`);
  setTxt("btn-lightbox-add-pack", `${t("addPackModalBtn")} (${pcs} ${t("pcsUnit")})`);
}

export function bindProductGridAndLightboxEvents() {
  const grid = document.getElementById("products-catalog-grid");
  const loadMoreBtn = document.getElementById("btn-load-more-products");

  let touchStartX = 0;
  let touchStartY = 0;

  grid?.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );

  grid?.addEventListener(
    "touchend",
    (e) => {
      const mediaBox = e.target.closest("[data-open-lightbox]");
      if (!mediaBox) return;
      const dx = e.changedTouches[0].screenX - touchStartX;
      const dy = e.changedTouches[0].screenY - touchStartY;
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
        const sku = mediaBox.getAttribute("data-open-lightbox");
        stepCardMiniSlider(sku, dx < 0 ? 1 : -1);
      }
    },
    { passive: true }
  );

  grid?.addEventListener("click", async (e) => {
    const slideBtn = e.target.closest("[data-card-slide]");
    if (slideBtn) {
      e.stopPropagation();
      const [sku, dirStr] = slideBtn.getAttribute("data-card-slide").split(":");
      stepCardMiniSlider(sku, parseInt(dirStr, 10));
      return;
    }

    const shareBtn = e.target.closest("[data-share-prod]");
    if (shareBtn) {
      e.stopPropagation();
      const sku = shareBtn.getAttribute("data-share-prod");
      const url = buildShareableUrl({ product: sku });
      if (navigator.share) {
        try {
          await navigator.share({ title: `Code ${sku}`, url });
          return;
        } catch (err) {}
      }
      await navigator.clipboard?.writeText(url).catch(() => {});
      showCatalogToast(t("copiedToast"));
      return;
    }

    const vidDirect = e.target.closest("[data-open-video-direct]");
    if (vidDirect) {
      e.stopPropagation();
      openProductLightbox(vidDirect.getAttribute("data-open-video-direct"), true);
      return;
    }

    const addBtn = e.target.closest("[data-add-pack]");
    if (addBtn) {
      const sku = addBtn.getAttribute("data-add-pack");
      const prod = coreState.allProducts.find((p) => (p.sku || p.id) === sku);
      if (prod) addPackToCart(prod, 1);
      return;
    }

    const mediaBox = e.target.closest("[data-open-lightbox]");
    if (mediaBox) {
      openProductLightbox(mediaBox.getAttribute("data-open-lightbox"), false);
    }
  });

  // لود پله‌ای ۱۲تایی با کلیک یا اسکرول خودکار به انتهای لیست (IntersectionObserver)
  loadMoreBtn?.addEventListener("click", () => {
    coreState.displayLimit += 12;
    renderProductsCatalogGrid();
  });

  if (loadMoreBtn && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && isProductStageActive()) {
            const total = getFinalFilteredProducts().length;
            if (coreState.displayLimit < total) {
              coreState.displayLimit += 12;
              renderProductsCatalogGrid();
            }
          }
        });
      },
      { rootMargin: "280px" }
    );
    observer.observe(loadMoreBtn);
  }

  document.getElementById("btn-close-lightbox")?.addEventListener("click", closeProductLightbox);
  document.getElementById("hd-lightbox-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "hd-lightbox-modal") closeProductLightbox();
  });

  document.getElementById("btn-lightbox-prev")?.addEventListener("click", () => {
    const prod = coreState.lightboxProduct;
    if (!prod) return;
    coreState.lightboxVideoMode = false;
    const imgs = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.imageUrl];
    coreState.lightboxSlideIdx = (coreState.lightboxSlideIdx - 1 + imgs.length) % imgs.length;
    renderLightboxStageContent();
  });

  document.getElementById("btn-lightbox-next")?.addEventListener("click", () => {
    const prod = coreState.lightboxProduct;
    if (!prod) return;
    coreState.lightboxVideoMode = false;
    const imgs = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.imageUrl];
    coreState.lightboxSlideIdx = (coreState.lightboxSlideIdx + 1) % imgs.length;
    renderLightboxStageContent();
  });

  document.getElementById("btn-lightbox-toggle-video")?.addEventListener("click", () => {
    coreState.lightboxVideoMode = !coreState.lightboxVideoMode;
    renderLightboxStageContent();
  });

  document.getElementById("btn-lightbox-share-item")?.addEventListener("click", async () => {
    const prod = coreState.lightboxProduct;
    if (!prod) return;
    const url = buildShareableUrl({ product: prod.sku || prod.id });
    await navigator.clipboard?.writeText(url).catch(() => {});
    showCatalogToast(t("copiedToast"));
  });

  document.getElementById("btn-lightbox-add-pack")?.addEventListener("click", () => {
    if (coreState.lightboxProduct) {
      addPackToCart(coreState.lightboxProduct, 1);
    }
  });
}
/* === پایان [MODULE-05: PRODUCT CARD MINI-SLIDER & HD LIGHTBOX] === */

/* ==========================================================================
   === پایان بلوک ۲ از ۳ فایل core.js ===
   راهنما: بلوک ۳ (ماژول‌های ۰۶ و ۰۷ — پایان فایل) را دقیقاً زیر این خط پیست کنید
   ========================================================================== */
/* ==========================================================================
   === شروع بلوک ۳ از ۳ فایل core.js (ماژول‌های ۰۶ و ۰۷ — پایان فایل) ===
   راهنما: این بلوک را دقیقاً زیر خط پایان بلوک ۲ پیست کنید
   ========================================================================== */

/* ==========================================================================
   === شروع [MODULE-06: STEPPED CART ENGINE & GOOGLE ADS CONVERSION] (ماژول ۶) ===
   راهنما: محاسبه هوشمند قیمت پله‌ای بر اساس حد نصاب پنل ادمین (۲۵ عدد)،
   مدیریت کشوی سبد خرید و ارسال کانورژن واقعی به گوگل ادز.
   ========================================================================== */

export function saveCartToStorage() {
  try {
    localStorage.setItem("paradise_b2b_cart", JSON.stringify(coreState.cart));
  } catch (e) {}
}

/**
 * محاسبه پله‌ای قیمت بر اساس حد نصاب تعیین شده در پنل ادمین (پیش‌فرض ۲۵ عدد):
 * - ۱۰۰٪ حد نصاب به بالا (مثلاً ۲۵+ عدد): +$0 (بهترین قیمت پایه کارخانه)
 * - ۸۰٪ تا ۹۹٪ حد نصاب (مثلاً ۲۰ تا ۲۴ عدد): +$1 روی هر عدد
 * - ۶۰٪ تا ۷۹٪ حد نصاب (مثلاً ۱۵ تا ۱۹ عدد): +$2 روی هر عدد
 * - ۴۰٪ تا ۵۹٪ حد نصاب (مثلاً ۱۰ تا ۱۴ عدد): +$3 روی هر عدد
 * - زیر ۴۰٪ حد نصاب (مثلاً ۱ تا ۹ عدد): +$5 روی هر عدد
 */
export function calculateSteppedCartTotals() {
  const threshold = Math.max(1, parseInt(coreState.publicConfig.bestRateThreshold, 10) || 25);

  let totalPacks = 0;
  let totalPieces = 0;
  let baseSubtotal = 0;

  coreState.cart.forEach((item) => {
    const packs = Math.max(1, parseInt(item.packs, 10) || 1);
    const pcsPerPack = Math.max(1, parseInt(item.pcsPerPack, 10) || 6);
    const unitPrice = Number(item.unitPrice) || 0;
    const itemPieces = packs * pcsPerPack;

    totalPacks += packs;
    totalPieces += itemPieces;
    baseSubtotal += itemPieces * unitPrice;
  });

  let surchargePerPc = 0;
  if (totalPieces > 0 && totalPieces < threshold) {
    const ratio = totalPieces / threshold;
    if (ratio >= 0.8) {
      surchargePerPc = 1;
    } else if (ratio >= 0.6) {
      surchargePerPc = 2;
    } else if (ratio >= 0.4) {
      surchargePerPc = 3;
    } else {
      surchargePerPc = 5;
    }
  }

  const smallOrderFee = totalPieces * surchargePerPc;
  const finalTotal = baseSubtotal + smallOrderFee;
  const remainingForBestRate = Math.max(0, threshold - totalPieces);

  return {
    threshold,
    totalPacks,
    totalPieces,
    baseSubtotal,
    surchargePerPc,
    smallOrderFee,
    finalTotal,
    remainingForBestRate
  };
}

/**
 * افزودن پک به سبد خرید و بروزرسانی زنده نوار پایین صفحه
 */
export function addPackToCart(prod, packsToAdd = 1) {
  if (!prod) return;
  const sku = prod.sku || prod.id;
  const existing = coreState.cart.find((c) => c.sku === sku);

  if (existing) {
    existing.packs = (Number(existing.packs) || 1) + packsToAdd;
    existing.unitPrice = Number(prod.unitPrice) || existing.unitPrice;
    existing.pcsPerPack = Math.max(1, parseInt(prod.pcsPerPack, 10) || existing.pcsPerPack || 6);
  } else {
    coreState.cart.push({
      sku,
      title: getLocalizedProductTitle(prod),
      unitPrice: Number(prod.unitPrice) || 5,
      pcsPerPack: Math.max(1, parseInt(prod.pcsPerPack, 10) || 6),
      sizeRange: prod.sizeRange || "S-XXL",
      thumbUrl: prod.thumbUrl || prod.imageUrl || "",
      packs: packsToAdd
    });
  }

  saveCartToStorage();
  renderSteppedCartUI();
  showCatalogToast(`${t("addedToast")} (${sku})`);
}

/**
 * رندر کامل نوار زنده پایین صفحه، بجِ هدر و کشوی سبد خرید پله‌ای
 */
export function renderSteppedCartUI() {
  const stats = calculateSteppedCartTotals();

  // ۱. بروزرسانی بج تعداد قطعات در هدر بالا
  const headerBadge = document.getElementById("header-cart-pcs-badge");
  if (headerBadge) headerBadge.textContent = `${stats.totalPieces} ${t("pcsUnit")}`;

  // ۲. بروزرسانی نوار زنده پایین صفحه
  const bottomBar = document.getElementById("live-bottom-cart-bar");
  const bottomPcs = document.getElementById("bottom-bar-pcs-count");
  const bottomTotal = document.getElementById("bottom-bar-total-amount");
  const bottomHint = document.getElementById("bottom-bar-tier-hint");

  if (bottomBar) {
    bottomBar.classList.toggle("visible", stats.totalPieces > 0);
  }
  if (bottomPcs) {
    bottomPcs.textContent = `${stats.totalPacks} ${t("packsUnit")} (${stats.totalPieces} ${t("pcsUnit")})`;
  }
  if (bottomTotal) {
    bottomTotal.textContent = `$${stats.finalTotal.toFixed(2)}`;
  }
  if (bottomHint) {
    if (stats.remainingForBestRate === 0) {
      bottomHint.textContent = t("bottomBarBestRate");
      bottomHint.style.color = "#6ee7b7";
    } else {
      bottomHint.textContent = t("bottomBarAddMore").replace("{rem}", String(stats.remainingForBestRate));
      bottomHint.style.color = "#fde047";
    }
  }

  // ۳. بروزرسانی هدر و بنر تشویقی داخل کشوی سبد خرید
  const headerSummary = document.getElementById("cart-header-summary");
  if (headerSummary) {
    headerSummary.textContent = `${stats.totalPacks} ${t("packsUnit")} • ${stats.totalPieces} ${t("piecesUnit")}`;
  }

  const bannerEl = document.getElementById("cart-tier-unlock-banner");
  if (bannerEl) {
    if (stats.totalPieces === 0) {
      bannerEl.style.background = "#f8fafc";
      bannerEl.style.color = "#475569";
      bannerEl.textContent = t("bottomBarAddMore").replace("{rem}", String(stats.threshold));
    } else if (stats.remainingForBestRate === 0) {
      bannerEl.style.background = "#ecfdf5";
      bannerEl.style.borderColor = "#6ee7b7";
      bannerEl.style.color = "#065f46";
      bannerEl.textContent = t("tierUnlockedMsg");
    } else {
      bannerEl.style.background = "#fffbeb";
      bannerEl.style.borderColor = "#fde68a";
      bannerEl.style.color = "#92400e";
      bannerEl.innerHTML = `${t("tierHintPrefix")} <strong>${stats.remainingForBestRate} ${t("pcsUnit")}</strong> ${t("tierHintMiddle")} <strong>+$${stats.smallOrderFee.toFixed(0)} (+$${stats.surchargePerPc}/${t("pcsUnit")})</strong> ${t("tierHintSuffix")}`;
    }
  }

  // ۴. رندر لیست آیتم‌های داخل سبد
  const listEl = document.getElementById("cart-items-list");
  if (listEl) {
    if (coreState.cart.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:36px 14px; color:var(--text-muted); font-size:0.84rem;">
          ${t("emptyCartMsg")}
        </div>
      `;
    } else {
      listEl.innerHTML = coreState.cart
        .map((item, idx) => {
          const itemPcs = item.packs * item.pcsPerPack;
          const effectiveUnit = item.unitPrice + stats.surchargePerPc;
          const itemTotal = (itemPcs * effectiveUnit).toFixed(0);

          return `
            <div style="display:flex; gap:10px; align-items:center; background:#f8fafc; padding:8px 10px; border-radius:12px; border:1px solid var(--border);">
              <img src="${escapeHtml(item.thumbUrl)}" alt="${escapeHtml(item.sku)}" style="width:50px; height:64px; object-fit:cover; border-radius:8px; border:1px solid var(--border);" />
              <div style="flex:1; min-width:0;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.84rem; color:var(--text-main);">${escapeHtml(item.sku)}</strong>
                  <strong style="font-size:0.88rem; color:var(--emerald-dark);">$${itemTotal}</strong>
                </div>
                <div style="font-size:0.72rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  Base: $${item.unitPrice}/${t("pcsUnit")} • ${item.pcsPerPack} ${t("pcsUnit")}/pack (${escapeHtml(item.sizeRange)})
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px;">
                  <div style="display:inline-flex; align-items:center; gap:6px; background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:2px 6px;">
                    <button type="button" data-cart-qty="${idx}:-1" style="border:none; background:none; font-weight:900; font-size:0.9rem; cursor:pointer; padding:0 4px;">−</button>
                    <span style="font-size:0.76rem; font-weight:800;">${item.packs} ${t("packsUnit")} (${itemPcs} ${t("pcsUnit")})</span>
                    <button type="button" data-cart-qty="${idx}:1" style="border:none; background:none; font-weight:900; font-size:0.9rem; cursor:pointer; padding:0 4px;">+</button>
                  </div>
                  <button type="button" data-cart-remove="${idx}" style="border:none; background:none; color:var(--danger); font-size:0.78rem; cursor:pointer; font-weight:700;">🗑</button>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    }
  }

  // ۵. بروزرسانی جمع پایه، مابه‌التفاوت پله‌ای و جمع نهایی
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("cart-base-subtotal", `$${stats.baseSubtotal.toFixed(2)}`);
  setTxt("cart-small-order-fee", `+$${stats.smallOrderFee.toFixed(2)} (+$${stats.surchargePerPc}/${t("pcsUnit")})`);
  setTxt("cart-final-total", `$${stats.finalTotal.toFixed(2)}`);

  const feeRow = document.getElementById("cart-small-order-fee-row");
  if (feeRow) {
    feeRow.style.display = stats.smallOrderFee > 0 ? "flex" : "none";
  }
}

/**
 * راه‌اندازی خودکار تگ گوگل ادز و آنالیتیکس (GA4 + Google Ads Conversion) از روی تنظیمات پنل ادمین
 */
export function initGoogleAdsAndAnalyticsTag() {
  const ga4Id = (coreState.publicConfig.ga4MeasurementId || "").trim();
  const gadsId = (coreState.publicConfig.googleAdsId || "").trim();
  const primaryTagId = gadsId || ga4Id;
  if (!primaryTagId || window._paradiseGtagLoaded) return;

  window._paradiseGtagLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  if (ga4Id) window.gtag("config", ga4Id);
  if (gadsId) window.gtag("config", gadsId);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryTagId)}`;
  document.head.appendChild(script);
}

/**
 * شلیک کانورژن اصلی گوگل ادز (هنگام ارسال سفارش سبد خرید به واتساپ با مبلغ دلاری واقعی)
 */
export function fireGoogleAdsOrderConversion(orderTotalUsd, orderCode) {
  if (typeof window.gtag !== "function") return;
  const gadsId = (coreState.publicConfig.googleAdsId || "").trim();
  const gadsLabel = (coreState.publicConfig.googleAdsConversionLabel || "").trim();

  if (gadsId && gadsLabel) {
    window.gtag("event", "conversion", {
      send_to: `${gadsId}/${gadsLabel}`,
      value: Number(orderTotalUsd) || 1.0,
      currency: "USD",
      transaction_id: orderCode
    });
  }

  window.gtag("event", "purchase_whatsapp_invoice", {
    value: Number(orderTotalUsd) || 1.0,
    currency: "USD",
    transaction_id: orderCode
  });
}

/**
 * رویداد جداگانه برای کلیک روی دکمه شناور واتساپ (بدون خراب کردن ارزش کانورژن سبد خرید)
 */
export function fireDirectWhatsappClickEvent() {
  if (typeof window.gtag === "function") {
    window.gtag("event", "whatsapp_direct_chat_click", {
      event_category: "engagement",
      value: 1.0,
      currency: "USD"
    });
  }
}
/* === پایان [MODULE-06: STEPPED CART ENGINE & GOOGLE ADS CONVERSION] === */


/* ==========================================================================
   === شروع [MODULE-07: WHATSAPP INVOICE, OFFICIAL SVG FOOTER & INITIALIZER] (ماژول ۷) ===
   راهنما: لوگوهای رسمی وکتور SVG شبکه‌های اجتماعی، یکسان‌سازی کامل شماره واتساپ
   از پنل ادمین در کل سایت، و ساخت پیش‌فاکتور واتساپ.
   ========================================================================== */

/* آیکون‌های وکتور رسمی و اورجینال شبکه‌های اجتماعی (SVG) */
const OFFICIAL_SOCIAL_SVGS = {
  instagram: `<svg viewBox="0 0 24 24" fill="none"><rect width="20" height="20" x="2" y="2" rx="5" stroke="#E1306C" stroke-width="2"/><circle cx="12" cy="12" r="4.5" stroke="#F77737" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="#E1306C"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" fill="#2AABEE"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.65-2.89 7.99-3.45 3.8-1.58 4.59-1.86 5.1-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .33z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="#ffffff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>`,
  android: `<svg viewBox="0 0 24 24" fill="#3DDC84"><path d="M17.523 15.341a.96.96 0 0 1-.959-.959c0-.53.43-.96.959-.96s.96.43.96.96-.43.959-.96.959m-11.046 0a.96.96 0 0 1-.96-.959c0-.53.43-.96.96-.96s.959.43.959.96-.43.959-.959.959m11.4-6.022l1.996-3.458a.416.416 0 0 0-.152-.567.416.416 0 0 0-.568.152L17.11 8.95a11.96 11.96 0 0 0-10.22 0L4.847 5.446a.416.416 0 0 0-.568-.152.416.416 0 0 0-.152.567l1.996 3.458C2.688 11.186.343 14.658 0 18.761h24c-.343-4.103-2.688-7.575-6.123-9.442"/></svg>`
};

/**
 * فرمت استاندارد شماره واتساپ به صورت یکسان برای کل سایت از روی شماره خام پنل ادمین
 */
export function getUnifiedWhatsAppInfo() {
  const pub = coreState.publicConfig;
  const raw = String(pub.whatsappRaw || DEFAULT_WHATSAPP).trim();
  const cleanDigits = raw.replace(/[^0-9]/g, "");

  // اگر شماره نمایشی با شماره اصلی یکی نباشد، خودکار از روی شماره اصلی فرمت خوانا بساز
  const displayClean = String(pub.whatsappDisplay || "").replace(/[^0-9]/g, "");
  let formattedDisplay = pub.whatsappDisplay;
  if (!formattedDisplay || displayClean !== cleanDigits) {
    formattedDisplay = `+${cleanDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5")}`;
  }

  return { cleanDigits, formattedDisplay };
}

/**
 * اعمال لوگو، شماره واتساپ یکپارچه و لوگوهای رسمی SVG شبکه‌های اجتماعی از تب ۸ پنل ادمین
 */
export function applyDynamicBrandingAndFooter() {
  const pub = coreState.publicConfig;
  const { cleanDigits, formattedDisplay } = getUnifiedWhatsAppInfo();

  // ۱. لوگوی تصویری هدر (فقط در صورت وجود در دیتابیس نمایش داده می‌شود)
  const logoImg = document.getElementById("header-logo-img");
  if (logoImg) {
    if (pub.logoUrl) {
      logoImg.src = pub.logoUrl;
      logoImg.style.display = "block";
    } else {
      logoImg.style.display = "none";
    }
  }

  // ۲. یکسان‌سازی شماره واتساپ در دکمه شناور و فوتر پایین صفحه
  const floatBtn = document.getElementById("floating-whatsapp-btn");
  if (floatBtn && cleanDigits) {
    const pageUrl = buildShareableUrl();
    const greet = `Hello Paradise Wholesale Istanbul! I am browsing your catalog (${pageUrl}) and have a wholesale inquiry.`;
    floatBtn.href = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(greet)}`;
  }

  const footerWa = document.getElementById("footer-wa-link");
  if (footerWa && cleanDigits) {
    footerWa.href = `https://wa.me/${cleanDigits}`;
    footerWa.textContent = formattedDisplay;
  }

  // ۳. لوگوهای رسمی و اورجینال SVG شبکه‌های اجتماعی در فوتر
  const socialBox = document.getElementById("footer-social-container");
  if (socialBox) {
    const links = [];
    if (pub.instagramUrl) {
      links.push(`
        <a href="${escapeHtml(pub.instagramUrl)}" target="_blank" rel="noopener" class="social-pill-link">
          ${OFFICIAL_SOCIAL_SVGS.instagram}
          <span>Instagram</span>
        </a>
      `);
    }
    if (pub.telegramUrl) {
      links.push(`
        <a href="${escapeHtml(pub.telegramUrl)}" target="_blank" rel="noopener" class="social-pill-link">
          ${OFFICIAL_SOCIAL_SVGS.telegram}
          <span>Telegram</span>
        </a>
      `);
    }
    if (pub.tiktokUrl) {
      links.push(`
        <a href="${escapeHtml(pub.tiktokUrl)}" target="_blank" rel="noopener" class="social-pill-link">
          ${OFFICIAL_SOCIAL_SVGS.tiktok}
          <span>TikTok</span>
        </a>
      `);
    }
    if (pub.androidAppUrl) {
      links.push(`
        <a href="${escapeHtml(pub.androidAppUrl)}" target="_blank" rel="noopener" class="social-pill-link" style="border-color:rgba(61,220,132,0.5);">
          ${OFFICIAL_SOCIAL_SVGS.android}
          <span>Android App</span>
        </a>
      `);
    }
    socialBox.innerHTML = links.join("");
  }
}

export async function submitCartOrderToWhatsApp() {
  if (coreState.cart.length === 0) {
    showCatalogToast(t("emptyCartMsg"));
    return;
  }

  const stats = calculateSteppedCartTotals();
  const buyerName = (document.getElementById("cart-buyer-name")?.value || "").trim() || "Wholesale Buyer";
  const buyerCountry = (document.getElementById("cart-buyer-country")?.value || "").trim() || "International";
  const orderCode = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const nowIso = new Date().toISOString();

  fireGoogleAdsOrderConversion(stats.finalTotal, orderCode);

  const itemLines = coreState.cart.map((item, idx) => {
    const itemPcs = item.packs * item.pcsPerPack;
    const effUnit = item.unitPrice + stats.surchargePerPc;
    const lineTotal = (itemPcs * effUnit).toFixed(2);
    const itemUrl = `${SITE_DOMAIN}/category.html?product=${encodeURIComponent(item.sku)}`;
    return `${idx + 1}. *${item.sku}* — ${item.packs} Pack (${itemPcs} pcs) × $${effUnit}/pc = *$${lineTotal}*\n   🔗 ${itemUrl}`;
  });

  const msgLines = [
    `🛍️ *NEW WHOLESALE ORDER (${orderCode})*`,
    `👤 *Buyer:* ${buyerName} (${buyerCountry})`,
    `────────────────────`,
    ...itemLines,
    `────────────────────`,
    `📦 *Total Quantity:* ${stats.totalPacks} Packs (${stats.totalPieces} Pieces)`,
    `💵 *Base Wholesale Subtotal:* $${stats.baseSubtotal.toFixed(2)}`
  ];

  if (stats.smallOrderFee > 0) {
    msgLines.push(`⚖️ *Small-Order Tier Adjustment (<${stats.threshold} pcs):* +$${stats.smallOrderFee.toFixed(2)} (+$${stats.surchargePerPc}/pc)`);
  } else {
    msgLines.push(`🎉 *VIP Factory Rate (${stats.threshold}+ pcs):* Unlocked ($0 adjustment)`);
  }

  msgLines.push(
    `💰 *TOTAL PRODUCTS AMOUNT:* *$${stats.finalTotal.toFixed(2)} USD*`,
    `✈️ *Delivery to Cargo / Shipping:* Please calculate shipping cost to ${buyerCountry} based on total weight.`
  );

  const { cleanDigits } = getUnifiedWhatsAppInfo();
  const waUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(msgLines.join("\n"))}`;

  const orderPayload = {
    orderCode,
    buyerName,
    buyerCountry,
    buyerPhone: "",
    totalPacks: stats.totalPacks,
    totalPieces: stats.totalPieces,
    baseSubtotal: stats.baseSubtotal,
    smallOrderFee: stats.smallOrderFee,
    totalAmount: stats.finalTotal,
    status: "pending_whatsapp",
    items: coreState.cart,
    createdAtIso: nowIso,
    createdAt: serverTimestamp()
  };

  setDoc(doc(db, "orders", orderCode), orderPayload).catch(() => {});
  window.open(waUrl, "_blank");
}

export function bindCartAndWhatsappEvents() {
  const openDrawer = () => {
    renderSteppedCartUI();
    document.getElementById("cart-drawer-backdrop")?.classList.add("open");
  };

  const closeDrawer = () => {
    document.getElementById("cart-drawer-backdrop")?.classList.remove("open");
  };

  document.getElementById("btn-header-cart")?.addEventListener("click", openDrawer);
  document.getElementById("btn-open-cart-drawer")?.addEventListener("click", openDrawer);
  document.getElementById("bottom-bar-open-trigger")?.addEventListener("click", openDrawer);
  document.getElementById("btn-close-cart-drawer")?.addEventListener("click", closeDrawer);

  document.getElementById("cart-drawer-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "cart-drawer-backdrop") closeDrawer();
  });

  document.getElementById("cart-items-list")?.addEventListener("click", (e) => {
    const qtyBtn = e.target.closest("[data-cart-qty]");
    if (qtyBtn) {
      const [idxStr, deltaStr] = qtyBtn.getAttribute("data-cart-qty").split(":");
      const idx = parseInt(idxStr, 10);
      const delta = parseInt(deltaStr, 10);
      if (!coreState.cart[idx]) return;

      coreState.cart[idx].packs += delta;
      if (coreState.cart[idx].packs <= 0) {
        coreState.cart.splice(idx, 1);
      }
      saveCartToStorage();
      renderSteppedCartUI();
      return;
    }

    const rmBtn = e.target.closest("[data-cart-remove]");
    if (rmBtn) {
      const idx = parseInt(rmBtn.getAttribute("data-cart-remove"), 10);
      coreState.cart.splice(idx, 1);
      saveCartToStorage();
      renderSteppedCartUI();
    }
  });

  document.getElementById("btn-submit-whatsapp-order")?.addEventListener("click", submitCartOrderToWhatsApp);
  document.getElementById("floating-whatsapp-btn")?.addEventListener("click", fireDirectWhatsappClickEvent);
}

export function renderEntireCatalogView(triggerNudge = false) {
  updateBackButtonVisibility();
  renderVisualCategoryCards(false);
  renderStickyGlassPills(triggerNudge);
  renderDynamicPriceFilterBar();
  renderProductsCatalogGrid();
  applyDynamicBrandingAndFooter();
}

export async function initParadiseCatalogCore() {
  applyLocalizedStaticTexts();
  bindSmartHeaderAndGlassEvents();
  bindPriceFilterEvents();
  bindProductGridAndLightboxEvents();
  bindCartAndWhatsappEvents();

  await loadCoreCatalogData();

  resolveCurrentRouteFromUrl();
  applyLocalizedStaticTexts();
  initGoogleAdsAndAnalyticsTag();
  syncBrowserHistoryState();
  renderEntireCatalogView(true);
  renderSteppedCartUI();

  if (coreState.activeProductSku) {
    openProductLightbox(coreState.activeProductSku, false);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initParadiseCatalogCore);
} else {
  initParadiseCatalogCore();
}

/* ==========================================================================
   === پایان بلوک ۳ از ۳ فایل core.js (پایان کل فایل) ===
   ========================================================================== */
