/**
 * ============================================================================
 * PARADISE WHOLESALE CLOTHING ISTANBUL
 * Domain: https://paradisewholesaler.com
 * File: core.js (MODULE-01 — AUTH, EUR/USD ENGINE, BIG CIRCLE LOGO & 3-LANG DICT)
 * ============================================================================
 */

/* ==========================================================================
   === شروع [MODULE-01: CONFIG, AUTH, ONLINE CURRENCY ENGINE & 3-LANG DICT] (ماژول ۱) ===
   راهنما: اتصال به Firebase Auth، موتور آنلاین تبدیل دلار به یورو (+۵٪ حاشیه امن
   و رند رو به بالا تا ۰.۵ یورو)، قاب دایره‌ای بزرگ و بدون کادر اضافه برای لوگو،
   نام پله‌کانی PARADISE / WHOLESALE، اسکلتون لودینگ منوها و دیکشنری ۳ زبانه.
   ========================================================================== */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
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
export const CURRENCY_SAFETY_BUFFER = 1.05; // ۵٪ حاشیه امن تبدیل ارز

const EUROPEAN_COUNTRY_CODES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "GB", "UK", "CH", "NO", "IS", "LI", "MC", "SM", "VA",
  "AD", "AL", "BA", "ME", "MK", "RS", "UA", "MD", "BY"
]);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* دیکشنری کامل ۱۰۰٪ رابط کاربری، صفحه اصلی، ریویو، FAQ و فوتر به ۳ زبان (EN / IT / ES) */
export const UI_DICT = {
  en: {
    back: "Back",
    home: "Home",
    searchBtn: "Search",
    searchPlaceholder: "Search code (e.g. M12), Polo, Tracksuit, Jeans...",
    homeSubtitle: "Direct Istanbul Luxury & Premium Apparel Supplier",
    trust1Title: "🏭 Direct Supplier",
    trust1Sub: "Istanbul Wholesale",
    trust2Title: "✈️ 3–5 Days Cargo",
    trust2Sub: "Express Worldwide",
    trust3Title: "📦 Serie Packs",
    trust3Sub: "Premium B2B Rates",
    hubReviewsTitle: "⭐ Client Reviews",
    hubReviewsSub: "Videos, Packing & Quality",
    hubBlogTitle: "📝 B2B Blog",
    hubBlogSub: "Cargo & Wholesale Guides",
    homeReviewsHeading: "⭐ Verified Customer Reviews",
    viewAllReviews: "View All",
    heroVideoHeading: "🎬 About Paradise Wholesale & Istanbul Showroom",
    homeFaqHeading: "❓ Wholesale FAQ — Ordering & Cargo",
    homeBlogsHeading: "📝 B2B Wholesale & Customs Guides",
    viewAllGuides: "View All",
    footerAboutDesc:
      "Direct Turkish luxury & premium quality apparel wholesale supplier based in Istanbul. Supplying boutiques and distributors across Europe, UK, USA & worldwide with factory-direct serie packs and 3–5 day express air cargo.",
    footerLinksTitle: "Explore Catalog & Trust",
    footerLinkCatalog: "🛍️ Wholesale Catalog (Men, Women, Kids)",
    footerLinkReviews: "⭐ Customer Reviews, Packing & Product Quality",
    footerLinkBlog: "📝 Wholesale Ordering & Cargo Shipping Guides",
    footerContactTitle: "📍 Istanbul Showroom & Direct Support",
    footerAddress: "🏢 Merter & Laleli Wholesale Hub, Istanbul, Turkey",
    footerWaLabel: "WhatsApp B2B Desk:",
    footerCargoNote: "✈️ Express Air Cargo & Door-to-Door Delivery (3–5 Business Days)",
    footerCopyright: "© 2026 Paradise Wholesale Clothing Istanbul. All Rights Reserved.",
    allCategories: "All Categories",
    allStyles: "All",
    allPrices: "All Prices",
    priceLabel: "💲 Price:",
    shareLink: "Share Link",
    copiedToast: "🔗 Direct link copied to clipboard!",
    addedToast: "✓ Pack added to wholesale order!",
    removedToast: "🗑 Removed from order",
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
    sendWhatsappBtn: "Send Order on WhatsApp (Instant Link)",
    floatingWa: "WhatsApp Direct",
    emptyCartMsg: "Your wholesale order list is currently empty. Tap '+ Add 1 Pack' on any product.",
    tierUnlockedMsg: "🎉 Best Factory Wholesale Rate Unlocked! (0 small-order adjustment).",
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
    homeSubtitle: "Fornitore Diretto di Abbigliamento di Lusso e Premium a Istanbul",
    trust1Title: "🏭 Fornitore Diretto",
    trust1Sub: "Ingrosso Istanbul",
    trust2Title: "✈️ Cargo 3–5 Giorni",
    trust2Sub: "Spedizione Rapida",
    trust3Title: "📦 Pacchi Serie",
    trust3Sub: "Prezzi B2B Fabbrica",
    hubReviewsTitle: "⭐ Recensioni Clienti",
    hubReviewsSub: "Video, Imballaggio e Qualità",
    hubBlogTitle: "📝 Blog B2B",
    hubBlogSub: "Guide Cargo e Ingrosso",
    homeReviewsHeading: "⭐ Recensioni Verificate dei Clienti",
    viewAllReviews: "Vedi Tutte",
    heroVideoHeading: "🎬 Chi Siamo — Showroom e Magazzino Istanbul",
    homeFaqHeading: "❓ Domande Frequenti (FAQ) — Ordini e Spedizioni",
    homeBlogsHeading: "📝 Guide all'Ingrosso e Dogana",
    viewAllGuides: "Vedi Tutte",
    footerAboutDesc:
      "Fornitore diretto all'ingrosso di abbigliamento turco di lusso e qualità premium con sede a Istanbul. Riforniamo boutique e distributori in Italia, Europa, Regno Unito e USA con pacchi serie diretti e cargo aereo espresso in 3–5 giorni.",
    footerLinksTitle: "Esplora Catalogo e Garanzie",
    footerLinkCatalog: "🛍️ Catalogo Ingrosso (Uomo, Donna, Bambini)",
    footerLinkReviews: "⭐ Recensioni Clienti, Imballaggio e Qualità",
    footerLinkBlog: "📝 Guide Ordini Ingrosso e Spedizioni Cargo",
    footerContactTitle: "📍 Showroom Istanbul e Assistenza Diretta",
    footerAddress: "🏢 Polo Ingrosso Merter e Laleli, Istanbul, Turchia",
    footerWaLabel: "Ufficio B2B WhatsApp:",
    footerCargoNote: "✈️ Cargo Aereo Espresso e Consegna Porta a Porta (3–5 Giorni Lavorativi)",
    footerCopyright: "© 2026 Paradise Wholesale Clothing Istanbul. Tutti i diritti riservati.",
    allCategories: "Tutte le Categorie",
    allStyles: "Tutti",
    allPrices: "Tutti i Prezzi",
    priceLabel: "💲 Prezzo:",
    shareLink: "Condividi Link",
    copiedToast: "🔗 Link diretto copiato!",
    addedToast: "✓ Pacco serie aggiunto all'ordine!",
    removedToast: "🗑 Rimosso dall'ordine",
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
    sendWhatsappBtn: "Invia Ordine su WhatsApp (Link Diretto)",
    floatingWa: "WhatsApp Diretto",
    emptyCartMsg: "Il tuo carrello ingrosso è vuoto. Tocca '+1 Pacco Serie' sui prodotti.",
    tierUnlockedMsg: "🎉 Miglior Prezzo di Fabbrica Sbloccato! (0 supplemento).",
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
    homeSubtitle: "Proveedor Mayorista Directo de Ropa de Lujo y Premium en Estambul",
    trust1Title: "🏭 Proveedor Directo",
    trust1Sub: "Mayorista Estambul",
    trust2Title: "✈️ Carga 3–5 Días",
    trust2Sub: "Envío Exprés Mundial",
    trust3Title: "📦 Paquetes Serie",
    trust3Sub: "Precios B2B Fábrica",
    hubReviewsTitle: "⭐ Reseñas Clientes",
    hubReviewsSub: "Vídeos, Embalaje y Calidad",
    hubBlogTitle: "📝 Blog B2B",
    hubBlogSub: "Guías de Carga y Mayorista",
    homeReviewsHeading: "⭐ Reseñas Verificadas de Clientes",
    viewAllReviews: "Ver Todas",
    heroVideoHeading: "🎬 Sobre Paradise Wholesale y Showroom en Estambul",
    homeFaqHeading: "❓ Preguntas Frecuentes (FAQ) — Pedidos y Carga",
    homeBlogsHeading: "📝 Guías de Compra al por Mayor y Aduanas",
    viewAllGuides: "Ver Todas",
    footerAboutDesc:
      "Proveedor mayorista directo de ropa turca de lujo y calidad premium con sede en Estambul. Abastecemos boutiques y distribuidores en España, Europa, Reino Unido y EE. UU. con paquetes serie directos y carga aérea exprés en 3–5 días.",
    footerLinksTitle: "Explorar Catálogo y Confianza",
    footerLinkCatalog: "🛍️ Catálogo Mayorista (Hombre, Mujer, Niños)",
    footerLinkReviews: "⭐ Reseñas de Clientes, Embalaje y Calidad",
    footerLinkBlog: "📝 Guías de Pedidos Mayoristas y Carga Aérea",
    footerContactTitle: "📍 Showroom Estambul y Soporte Directo",
    footerAddress: "🏢 Centro Mayorista Merter y Laleli, Estambul, Turquía",
    footerWaLabel: "Atención B2B WhatsApp:",
    footerCargoNote: "✈️ Carga Aérea Exprés y Entrega Puerta a Puerta (3–5 Días Hábiles)",
    footerCopyright: "© 2026 Paradise Wholesale Clothing Istanbul. Todos los derechos reservados.",
    allCategories: "Todas las Categorías",
    allStyles: "Todos",
    allPrices: "Todos los Precios",
    priceLabel: "💲 Precio:",
    shareLink: "Compartir Enlace",
    copiedToast: "🔗 ¡Enlace directo copiado!",
    addedToast: "✓ ¡Paquete serie añadido al pedido!",
    removedToast: "🗑 Eliminado del pedido",
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
    sendWhatsappBtn: "Enviar Pedido por WhatsApp (Enlace Directo)",
    floatingWa: "WhatsApp Directo",
    emptyCartMsg: "Su pedido mayorista está vacío. Toque '+1 Paquete Serie' en cualquier producto.",
    tierUnlockedMsg: "🎉 ¡Mejor Precio de Fábrica Desbloqueado! (0 ajuste).",
    tierHintPrefix: "🔥 ¡Añada",
    tierHintMiddle: "uds más para eliminar el ajuste de",
    tierHintSuffix: "y activar el precio más bajo de fábrica!",
    bottomBarBestRate: "✓ ¡Mejor Precio de Fábrica Activo!",
    bottomBarAddMore: "¡Añada {rem} uds más para el mejor precio!",
    switchCatBtn: "📂 Categorías"
  }
};

export const coreState = {
  lang: localStorage.getItem("paradise_lang") || "en",
  currency: localStorage.getItem("paradise_currency_manual") || "USD",
  eurRate: Number(localStorage.getItem("paradise_eur_rate_cached")) || 0.92,
  currencyLockedByOrder: false,
  isAdminLoggedIn: false,
  activeOrderCode: "",
  lastExportedFingerprint: "",
  lastExportedAt: "",
  activeReelsList: [],
  dept: "",
  cat: "",
  sub: "",
  price: null,
  searchQuery: "",
  activeProductSku: "",
  displayLimit: 12,
  cardSlideIndexMap: new Map(),
  lightboxProduct: null,
  lightboxSlideIdx: 0,
  lightboxVideoMode: false,
  cart: JSON.parse(localStorage.getItem("paradise_b2b_cart") || "[]"),
  taxonomy: [],
  allProducts: [],
  blogs: [],
  publicConfig: {
    logoUrl: "",
    whatsappRaw: DEFAULT_WHATSAPP,
    whatsappDisplay: "+90 545 909 93 95",
    bestRateThreshold: 25,
    underMoqMarkupPercent: 15,
    ga4MeasurementId: "",
    googleAdsId: "",
    googleAdsConversionLabel: "",
    instagramUrl: "https://www.instagram.com/paradisewholesaleclothing5401",
    youtubeUrl: "https://www.youtube.com/@paradisewholesaleclothing5401",
    telegramUrl: "https://t.me/paradisewholesaler",
    tiktokUrl: "https://tiktok.com/@paradisewholesaler",
    androidAppUrl: "",
    faqs: []
  }
};

export function t(key) {
  const dict = UI_DICT[coreState.lang] || UI_DICT.en;
  return dict[key] || UI_DICT.en[key] || key;
}

export function getCurrencySymbol() {
  return coreState.currency === "EUR" ? "€" : "$";
}

export function convertUsdToDisplay(usdVal) {
  const num = Number(usdVal) || 0;
  if (num <= 0) return 0;
  if (coreState.currency !== "EUR") {
    return Math.round(num * 100) / 100;
  }
  const rate = Number(coreState.eurRate) || 0.92;
  const buffered = num * rate * CURRENCY_SAFETY_BUFFER;
  return Math.ceil(buffered * 2 - 1e-9) / 2;
}

export function formatMoney(amount, forceDecimals = false) {
  const num = Number(amount) || 0;
  const sym = getCurrencySymbol();
  const str = forceDecimals || !Number.isInteger(num) ? num.toFixed(2) : String(num);
  return `${sym}${str}`;
}

/**
 * قرار دادن لوگو در قاب دایره‌ای تمام‌ارتفاع (۴۶×۴۶ پیکسل) و حذف کامل مستطیل زرد و حاشیه اضافی
 */
function ensureCircularLogoFrame() {
  const logoImg = document.getElementById("header-logo-img");
  if (!logoImg || logoImg.dataset.circleWrapped) return;
  logoImg.dataset.circleWrapped = "1";

  const frame = document.createElement("span");
  frame.id = "header-logo-circle-frame";
  frame.className = "brand-logo-circle-frame";
  logoImg.parentNode.insertBefore(frame, logoImg);
  frame.appendChild(logoImg);

  const syncFrameVisibility = () => {
    const isHidden = logoImg.style.display === "none" || !logoImg.getAttribute("src");
    frame.style.display = isHidden ? "none" : "inline-flex";
  };

  syncFrameVisibility();
  const obs = new MutationObserver(syncFrameVisibility);
  obs.observe(logoImg, { attributes: true, attributeFilter: ["style", "src"] });
}

/**
 * استایل‌های بهینه هدر (لوگوی دایره‌ای بزرگ بدون کادر زرد + نام پله‌کانی PARADISE / WHOLESALE)،
 * اسکلتون لودینگ آنی منوها و کنترلر تعداد سری (+ / - / 🗑) روی کارت محصول
 */
export function injectResponsiveHeaderAndStepperStyles() {
  ensureCircularLogoFrame();
  if (document.getElementById("paradise-ux-enhancements-css")) return;

  const style = document.createElement("style");
  style.id = "paradise-ux-enhancements-css";
  style.textContent = `
    /* اسکلتون لودینگ فوری برای دسته‌بندی‌ها در اولین بازدید (جلوگیری از صفحه خالی) */
    .cat-skeleton-card {
      aspect-ratio: 3 / 3.8;
      border-radius: 16px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: paradiseCatShimmer 1.15s infinite linear;
      border: 1.5px solid rgba(255, 255, 255, 0.85);
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
    }
    @keyframes paradiseCatShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* چیدمان حرفه‌ای لوگو: دایره بزرگ تقریباً تمام‌ارتفاع نوار هدر و بدون کادر مستطیلی زرد */
    #header-brand-link {
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
      text-decoration: none;
      min-width: 0;
      height: 100%;
      border: none !important;
      background: transparent !important;
      padding: 0 !important;
    }
    .brand-logo-circle-frame {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
    }
    .brand-logo-circle-frame #header-logo-img {
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      object-fit: cover !important;
      object-position: center !important;
      transform: scale(1.3) !important;
      border: none !important;
      outline: none !important;
      border-radius: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      background: transparent !important;
    }

    /* نام برند پله‌کانی (PARADISE بالا، WHOLESALE کمی جلوتر در خط پایین) */
    #home-brand-badge {
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      line-height: 1.12;
      gap: 1px;
    }
    .brand-line-main {
      color: var(--gold, #d4af37);
      font-size: 0.92rem;
      font-weight: 800;
      letter-spacing: 0.45px;
      white-space: nowrap;
    }
    .brand-line-sub {
      color: #e2e8f0;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.95px;
      white-space: nowrap;
      opacity: 0.94;
      padding-left: 18px;
    }
    .brand-mobile-only { display: none; }
    .brand-desktop-only { display: inline; }

    /* کنترلر حرفه‌ای تعداد سری (+ / - / سطل آشغال) روی کارت محصول و پنجره لایت‌باکس */
    .prod-card-cart-slot {
      margin-top: 4px;
      width: 100%;
    }
    .prod-card-cart-slot .btn-add-pack-card {
      margin-top: 0;
    }
    .card-qty-stepper {
      width: 100%;
      height: 34px;
      border-radius: 8px;
      background: #ecfdf5;
      border: 1.5px solid #10b981;
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.14);
    }
    .card-qty-stepper.lightbox-stepper {
      height: 44px;
      border-radius: 12px;
      border-width: 2px;
    }
    .stepper-btn {
      width: 34px;
      height: 100%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 1rem;
      flex-shrink: 0;
      transition: background 0.15s, transform 0.1s;
      user-select: none;
    }
    .card-qty-stepper.lightbox-stepper .stepper-btn {
      width: 48px;
      font-size: 1.15rem;
    }
    .stepper-btn:active {
      transform: scale(0.92);
    }
    .stepper-btn.trash-mode {
      background: #fef2f2;
      color: #dc2626;
      border-right: 1px solid #fecaca;
      font-size: 0.88rem;
    }
    .stepper-btn.minus-mode {
      background: #d1fae5;
      color: #065f46;
      border-right: 1px solid #a7f3d0;
    }
    .stepper-btn.plus-mode {
      background: #10b981;
      color: #ffffff;
    }
    .stepper-count-label {
      flex: 1;
      min-width: 0;
      text-align: center;
      font-size: 0.74rem;
      font-weight: 800;
      color: #065f46;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 3px;
    }
    .card-qty-stepper.lightbox-stepper .stepper-count-label {
      font-size: 0.88rem;
    }
    .stepper-count-label small {
      font-weight: 700;
      opacity: 0.82;
      font-size: 0.67rem;
    }

    /* بهینه‌سازی دقیق هدر موبایل: دایره لوگو بزرگ (46px) + نام پله‌کانی + بدون بیرون‌زدگی */
    @media (max-width: 600px) {
      .smart-top-header {
        padding: 0 6px !important;
        gap: 4px !important;
      }
      .nav-left-group {
        gap: 5px !important;
        min-width: 0;
        flex: 1 1 auto;
      }
      .nav-right-group {
        gap: 4px !important;
        flex-shrink: 0;
      }
      #header-brand-link {
        gap: 7px !important;
      }
      .brand-logo-circle-frame {
        width: 46px !important;
        height: 46px !important;
      }
      .brand-desktop-only { display: none !important; }
      .brand-mobile-only { display: inline !important; }
      .brand-line-main {
        font-size: 0.82rem !important;
        letter-spacing: 0.35px !important;
      }
      .brand-line-sub {
        font-size: 0.6rem !important;
        letter-spacing: 0.85px !important;
        padding-left: 14px !important;
      }
      #txt-search-btn {
        display: none !important;
      }
      #btn-toggle-search {
        width: 30px !important;
        padding: 0 !important;
      }
      .minimal-nav-btn {
        height: 31px !important;
        padding: 0 7px !important;
        font-size: 0.7rem !important;
        gap: 3px !important;
      }
      .lang-trigger-btn {
        height: 31px !important;
        padding: 0 7px !important;
        font-size: 0.7rem !important;
        gap: 3px !important;
      }
      #btn-currency-toggle {
        min-width: 28px !important;
        padding: 0 7px !important;
      }
      .cur-code-txt {
        display: none !important;
      }
      #btn-header-cart {
        padding: 0 7px !important;
      }
    }

    @media (max-width: 370px) {
      .brand-logo-circle-frame {
        width: 42px !important;
        height: 42px !important;
      }
      .brand-line-main {
        font-size: 0.74rem !important;
      }
      .brand-line-sub {
        font-size: 0.54rem !important;
        padding-left: 10px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * دریافت نرخ رسمی یورو از بانک مرکزی اروپا (Frankfurter API با پشتیبان خودکار) + تشخیص اروپا
 */
export async function initLiveCurrencyAndRegion(hasIncomingOrder = false) {
  injectResponsiveHeaderAndStepperStyles();

  try {
    const cached = JSON.parse(localStorage.getItem("paradise_fx_cache") || "null");
    const twelveHours = 12 * 60 * 60 * 1000;
    if (cached && cached.rate > 0.5 && cached.rate < 1.8 && Date.now() - cached.ts < twelveHours) {
      if (!coreState.currencyLockedByOrder) coreState.eurRate = Number(cached.rate);
    } else {
      let freshRate = null;
      try {
        const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR");
        const data = await res.json();
        if (data?.rates?.EUR) freshRate = Number(data.rates.EUR);
      } catch (e) {}

      if (!freshRate) {
        try {
          const res2 = await fetch("https://open.er-api.com/v6/latest/USD");
          const data2 = await res2.json();
          if (data2?.rates?.EUR) freshRate = Number(data2.rates.EUR);
        } catch (e) {}
      }

      if (freshRate && freshRate > 0.5 && freshRate < 1.8) {
        if (!coreState.currencyLockedByOrder) coreState.eurRate = freshRate;
        localStorage.setItem("paradise_eur_rate_cached", String(freshRate));
        localStorage.setItem("paradise_fx_cache", JSON.stringify({ rate: freshRate, ts: Date.now() }));
      }
    }
  } catch (e) {}

  const manualChoice = localStorage.getItem("paradise_currency_manual");
  if (!manualChoice && !hasIncomingOrder && !coreState.currencyLockedByOrder) {
    let isEurope = false;
    try {
      const cachedRegion = JSON.parse(localStorage.getItem("paradise_region_cache") || "null");
      if (cachedRegion && Date.now() - cachedRegion.ts < 24 * 60 * 60 * 1000) {
        isEurope = Boolean(cachedRegion.isEurope);
      } else {
        const geoRes = await Promise.race([
          fetch("https://get.geojs.io/v1/ip/country.json"),
          new Promise((_, rej) => setTimeout(() => rej(new Error("geo timeout")), 2500))
        ]);
        const geoData = await geoRes.json();
        const cc = String(geoData?.country || "").toUpperCase();
        isEurope = EUROPEAN_COUNTRY_CODES.has(cc);
        localStorage.setItem("paradise_region_cache", JSON.stringify({ isEurope, cc, ts: Date.now() }));
      }
    } catch (e) {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        isEurope = tz.startsWith("Europe/") && tz !== "Europe/Istanbul";
      } catch (tzErr) {}
    }

    if (!coreState.currencyLockedByOrder) {
      coreState.currency = isEurope ? "EUR" : "USD";
    }
  }

  injectAndSyncHeaderCurrencyToggle();
}

export function injectAndSyncHeaderCurrencyToggle() {
  injectResponsiveHeaderAndStepperStyles();

  let btn = document.getElementById("btn-currency-toggle");
  if (!btn) {
    const langGroup = document.getElementById("lang-switcher-group");
    const parent = langGroup?.parentElement || document.querySelector(".nav-right-group");
    if (parent) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "btn-currency-toggle";
      btn.className = "lang-trigger-btn";
      btn.style.cssText = "padding:0 9px; font-size:0.74rem; min-width:48px; justify-content:center;";
      btn.title = "Switch Currency (EUR / USD)";
      if (langGroup) parent.insertBefore(btn, langGroup);
      else parent.appendChild(btn);

      btn.addEventListener("click", () => {
        coreState.currencyLockedByOrder = false;
        coreState.currency = coreState.currency === "EUR" ? "USD" : "EUR";
        localStorage.setItem("paradise_currency_manual", coreState.currency);
        coreState.price = null;
        injectAndSyncHeaderCurrencyToggle();
        if (typeof window._paradiseRefreshCurrencyUI === "function") {
          window._paradiseRefreshCurrencyUI();
        }
      });
    }
  }
  if (btn) {
    btn.innerHTML =
      coreState.currency === "EUR"
        ? `<span>€</span><span class="cur-code-txt"> EUR</span>`
        : `<span>$</span><span class="cur-code-txt"> USD</span>`;
  }
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
/* === پایان [MODULE-01: CONFIG, AUTH, ONLINE CURRENCY ENGINE & 3-LANG DICT] === */

/* ==========================================================================
   === شروع [MODULE-02: FIREBASE DATA LOADER, SSG ROUTER & EMPTY FILTER] (ماژول ۲) ===
   راهنما: خواندن دسته‌بندی‌ها، محصولات، ویدیوها، سوالات متداول (FAQ) و وبلاگ
   از فایربیس و حفظ پارامتر سفارش در آدرس مرورگر.
   ========================================================================== */

const FALLBACK_TAXONOMY = [
  { id: "men", labelFa: "مردانه", labelEn: "Men", labelIt: "Uomo", labelEs: "Hombre", hidden: false, subcategories: [] },
  { id: "women", labelFa: "زنانه", labelEn: "Women", labelIt: "Donna", labelEs: "Mujer", hidden: false, subcategories: [] },
  { id: "kids-baby", labelFa: "بچگانه", labelEn: "Kids & Baby", labelIt: "Bambini", labelEs: "Niños y Bebés", hidden: false, subcategories: [] }
];

const REMOVED_ROOT_DEPT_IDS = new Set(["shoes", "bags-accessories", "bags", "footwear", "accessories"]);

export function getBaseRootUrl() {
  if (typeof window !== "undefined" && window.location.hostname.includes("github.io")) {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const repoPart = parts[0] && !parts[0].endsWith(".html") && !["en", "it", "es"].includes(parts[0]) ? `/${parts[0]}` : "";
    return `${window.location.origin}${repoPart}/`;
  }
  return `${SITE_DOMAIN}/`;
}

export async function loadCoreCatalogData() {
  coreState.displayLimit = 12;
  coreState.blogs = [];

  try {
    const [cfgSnap, blogSnap] = await Promise.all([
      getDoc(doc(db, "settings", "public_config")).catch(() => null),
      getDoc(doc(db, "settings", "blog_index")).catch(() => null)
    ]);

    if (cfgSnap && cfgSnap.exists()) {
      const data = cfgSnap.data();
      coreState.publicConfig = { ...coreState.publicConfig, ...data };
      if (Array.isArray(data.taxonomy) && data.taxonomy.length > 0) {
        coreState.taxonomy = data.taxonomy.filter(
          (d) => !d.hidden && !REMOVED_ROOT_DEPT_IDS.has(String(d.id || "").toLowerCase())
        );
      }
    }

    if (blogSnap && blogSnap.exists()) {
      const bData = blogSnap.data();
      if (Array.isArray(bData.articles)) {
        coreState.blogs = bData.articles.slice(0, 6);
      }
    }
  } catch (e) {
    console.warn("Config/Blog load warning:", e.message);
  }

  if (!Array.isArray(coreState.taxonomy) || coreState.taxonomy.length === 0) {
    coreState.taxonomy = FALLBACK_TAXONOMY;
  }

  preloadCategoryMenuImages();

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

export function preloadCategoryMenuImages() {
  try {
    const urls = [];
    coreState.taxonomy.forEach((d) => {
      if (d.image) urls.push(d.image);
      (d.subcategories || []).slice(0, 8).forEach((sc) => {
        if (sc.image) urls.push(sc.image);
      });
    });
    urls.slice(0, 18).forEach((u) => {
      const img = new Image();
      img.decoding = "async";
      img.src = u;
    });
  } catch (e) {}
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

export function getNonEmptyDepartments() {
  return coreState.taxonomy.filter(
    (d) => !d.hidden && !REMOVED_ROOT_DEPT_IDS.has(String(d.id || "").toLowerCase())
  );
}

export function getNonEmptySubcategories(deptId) {
  const deptObj = coreState.taxonomy.find((d) => d.id === deptId);
  if (!deptObj || !Array.isArray(deptObj.subcategories)) return [];
  return deptObj.subcategories.filter((sc) => !sc.hidden);
}

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

  let pathSegments = pathname.split("/").filter(Boolean);
  if (pathSegments[0] === "paradise_wholesale") {
    pathSegments = pathSegments.slice(1);
  }

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

  const url = new URL(getBaseRootUrl());
  if (state.lang && state.lang !== "en") {
    url.searchParams.set("lang", state.lang);
  }
  if (state.dept) url.searchParams.set("dept", state.dept);
  if (state.cat) url.searchParams.set("cat", state.cat);
  if (state.sub) url.searchParams.set("sub", state.sub);
  if (state.price !== null && state.price !== undefined && !isNaN(state.price)) {
    url.searchParams.set("price", String(state.price));
  }
  if (state.product) url.searchParams.set("product", state.product);

  // حفظ پارامترهای سفارش در صورت وجود
  if (typeof window !== "undefined") {
    const curParams = new URLSearchParams(window.location.search);
    if (curParams.get("order")) url.searchParams.set("order", curParams.get("order"));
    if (curParams.get("items")) url.searchParams.set("items", curParams.get("items"));
  }

  return url.toString();
}

export function syncBrowserHistoryState() {
  const newUrl = buildShareableUrl();
  try {
    const parsed = new URL(newUrl);
    window.history.replaceState({ ...coreState }, "", `${parsed.pathname}${parsed.search}`);
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
  if (headingEl && !isRootHomeStage()) {
    headingEl.textContent = `${hierarchyLabel}${priceSuffix}`;
  }

  const seoTitleByLang = {
    en: isRootHomeStage()
      ? "Paradise Wholesale Clothing Istanbul | Direct Luxury & Premium Apparel Supplier"
      : `Wholesale ${hierarchyLabel}${priceSuffix} | Direct Istanbul Factory Supplier`,
    it: isRootHomeStage()
      ? "Paradise Wholesale Clothing Istanbul | Fornitore Diretto Abbigliamento di Lusso Ingrosso"
      : `Ingrosso ${hierarchyLabel}${priceSuffix} | Fornitore Diretto Istanbul Turchia`,
    es: isRootHomeStage()
      ? "Paradise Wholesale Clothing Istanbul | Proveedor Mayorista Ropa de Lujo y Premium"
      : `Mayorista ${hierarchyLabel}${priceSuffix} | Proveedor Directo Estambul Turquía`
  };

  const seoDescByLang = {
    en: isRootHomeStage()
      ? "Paradise Wholesale Clothing Istanbul: Direct Turkish luxury & premium apparel supplier. Factory-direct serie packs for boutiques with 3–5 day express air cargo worldwide."
      : `Buy wholesale ${hierarchyLabel} in serie packs directly from Istanbul, Turkey. Best factory prices & 3-5 day express air cargo.`,
    it: isRootHomeStage()
      ? "Paradise Wholesale Clothing Istanbul: Fornitore diretto di abbigliamento turco di lusso e qualità premium. Pacchi serie diretti e spedizione espressa in 3–5 giorni."
      : `Acquista ${hierarchyLabel} all'ingrosso in pacchi serie direttamente da Istanbul, Turchia. Prezzi di fabbrica e spedizione espressa in 3-5 giorni.`,
    es: isRootHomeStage()
      ? "Paradise Wholesale Clothing Istanbul: Proveedor directo de ropa turca de lujo y calidad premium. Paquetes serie directos de fábrica y carga aérea exprés en 3–5 días."
      : `Compre ${hierarchyLabel} al por mayor en paquetes serie directo desde Estambul, Turquía. Precios de fábrica y envío exprés en 3-5 días.`
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
   === شروع [MODULE-03: 100% 3-LANG UI, REELS PLAYER, COUNTRY REVIEWS & FAQ] (ماژول ۳) ===
   راهنما: ترجمه کامل تمام المان‌های صفحه (data-i18n)، توزیع یکی‌درمیان کشورها
   فقط برای ویدیوهای رضایت مشتری در صفحه اول، پلیر تمام‌صفحه ریلز (سوایپ بالا/پایین
   با پخش خودکار) و آکاردئون پرسش و پاسخ + اسکیمای گوگل.
   ========================================================================== */

const LANG_FLAGS = { en: "🇬🇧", it: "🇮🇹", es: "🇪🇸" };

export function extractCleanYoutubeId(input) {
  const raw = String(input || "").trim();
  if (!raw || raw === "dQw4w9WgXcQ") return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

export function shuffleArrayRandomly(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * الگوریتم توزیع هوشمند کشورها (Country Interleaving):
 * ویدیوها را بر اساس کشور گروه‌بندی می‌کند (ایتالیا، اسپانیا، انگلیس، آلمان...)
 * و به صورت یکی‌درمیان می‌چیند تا هرگز چند ویدیوی یک کشور پشت سر هم نیفتد.
 */
export function interleaveReviewsByCountry(reviewsList, randomizeWithinCountry = true) {
  if (!Array.isArray(reviewsList) || reviewsList.length <= 1) return reviewsList || [];

  const buckets = new Map();
  reviewsList.forEach((item) => {
    const countryKey = String(item.country || item.badge || "INTERNATIONAL").trim().toUpperCase();
    if (!buckets.has(countryKey)) buckets.set(countryKey, []);
    buckets.get(countryKey).push(item);
  });

  let countryKeys = Array.from(buckets.keys());
  if (randomizeWithinCountry) {
    countryKeys = shuffleArrayRandomly(countryKeys);
    countryKeys.forEach((k) => {
      buckets.set(k, shuffleArrayRandomly(buckets.get(k)));
    });
  }

  const interleaved = [];
  let added = true;
  let round = 0;

  while (added) {
    added = false;
    for (const k of countryKeys) {
      const list = buckets.get(k);
      if (round < list.length) {
        interleaved.push(list[round]);
        added = true;
      }
    }
    round++;
  }

  return interleaved;
}

export function getLocalizedField(valObj, fallback = "") {
  if (!valObj) return fallback;
  if (typeof valObj === "string") return valObj;
  return valObj[coreState.lang] || valObj.en || fallback;
}

/**
 * ترجمه ۱۰۰٪ تمام متون ثابت صفحه، دکمه‌ها، فوتر و لینک‌های داخلی بر اساس زبان انتخاب‌شده
 */
export function applyLocalizedStaticTexts() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      el.textContent = t(key);
    }
  });

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

  const flagEl = document.getElementById("current-lang-flag");
  const codeEl = document.getElementById("current-lang-code");
  if (flagEl) flagEl.textContent = LANG_FLAGS[coreState.lang] || "🇬🇧";
  if (codeEl) codeEl.textContent = (coreState.lang || "en").toUpperCase();

  document.querySelectorAll("#lang-dropdown-menu .lang-option-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === coreState.lang);
  });

  const langSuffix = coreState.lang && coreState.lang !== "en" ? `?lang=${coreState.lang}` : "";
  ["home-quick-reviews-link", "btn-view-all-reviews", "footer-reviews-link"].forEach((id) => {
    const a = document.getElementById(id);
    if (a) a.href = `reviews.html${langSuffix}`;
  });
  ["home-quick-blog-link", "btn-view-all-blogs", "footer-blog-link"].forEach((id) => {
    const a = document.getElementById(id);
    if (a) a.href = `blog.html${langSuffix}`;
  });
}

export function isRootHomeStage() {
  return Boolean(!coreState.dept && !coreState.cat && !coreState.sub && coreState.price === null && !coreState.searchQuery);
}

export function isProductStageActive() {
  return Boolean((coreState.dept && coreState.cat) || coreState.searchQuery);
}

export function updateBackButtonVisibility() {
  const backBtn = document.getElementById("btn-nav-back");
  const homeBtn = document.getElementById("btn-nav-home");
  const brandBadge = document.getElementById("home-brand-badge");
  const logoImg = document.getElementById("header-logo-img");
  const headingEl = document.getElementById("view-context-heading");
  const subtitleEl = document.getElementById("view-context-subtitle");

  const inInnerPage = !isRootHomeStage();

  if (backBtn) backBtn.style.display = inInnerPage ? "inline-flex" : "none";
  if (homeBtn) homeBtn.style.display = inInnerPage ? "inline-flex" : "none";

  if (brandBadge) {
    brandBadge.style.display = inInnerPage ? "none" : "flex";
  }
  if (logoImg) {
    const hasLogo = Boolean(coreState.publicConfig.logoUrl);
    logoImg.style.display = !inInnerPage && hasLogo ? "block" : "none";
  }

  if (!inInnerPage) {
    if (headingEl) headingEl.textContent = "Paradise Wholesale Clothing";
    if (subtitleEl) {
      subtitleEl.textContent = t("homeSubtitle");
      subtitleEl.style.display = "block";
    }
  } else {
    if (subtitleEl) subtitleEl.style.display = "none";
  }
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

export function resetToRootHome(e) {
  if (e) e.preventDefault();
  coreState.dept = "";
  coreState.cat = "";
  coreState.sub = "";
  coreState.price = null;
  coreState.searchQuery = "";
  const sInp = document.getElementById("catalog-live-search");
  if (sInp) sInp.value = "";
  document.getElementById("search-drawer-bar")?.classList.remove("open");
  coreState.displayLimit = 12;
  syncBrowserHistoryState();
  renderEntireCatalogView(true);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * رندر ریل رضایت مشتریان در صفحه اول (فقط بخش رضایت مشتری + توزیع هوشمند کشورها)
 */
export function renderRandomReviewsReel() {
  const reelsBlock = document.getElementById("home-reels-video-block");
  const reelsTrack = document.getElementById("home-videos-reel-track");
  const rightArrow = document.getElementById("btn-reels-scroll-right");
  if (!reelsBlock || !reelsTrack) return;

  const pub = coreState.publicConfig;
  const cVids = Array.isArray(pub.cargoVideos) ? pub.cargoVideos : [];
  const sVids = Array.isArray(pub.showroomVideos) ? pub.showroomVideos : [];

  const customerReviewsOnly = [...cVids, ...sVids].filter((v) => {
    if (!v) return false;
    const cat = String(v.category || "reviews").toLowerCase();
    if (cat !== "reviews") return false;
    const ytId = extractCleanYoutubeId(v.ytId || v.url);
    return Boolean(ytId || v.url);
  });

  if (customerReviewsOnly.length === 0) {
    reelsBlock.style.display = "none";
    coreState.activeReelsList = [];
    return;
  }

  reelsBlock.style.display = "block";
  const distributedReviews = interleaveReviewsByCountry(customerReviewsOnly, true);
  coreState.activeReelsList = distributedReviews;

  if (rightArrow) {
    rightArrow.style.display = distributedReviews.length > 2 ? "inline-flex" : "none";
  }

  reelsTrack.innerHTML = distributedReviews
    .map((v, idx) => {
      const ytId = extractCleanYoutubeId(v.ytId || v.url);
      const thumb =
        v.thumb ||
        (ytId
          ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
          : "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=75");
      const badge = v.countryLabel || v.badge || "⭐ CLIENT REVIEW";
      const title = getLocalizedField(v.title, `Verified Wholesale Client #${idx + 1}`);

      return `
        <div class="reel-video-card" data-reel-idx="${idx}">
          <img src="${escapeHtml(thumb)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" />
          <div class="reel-video-overlay">
            <span style="font-size:0.62rem; background:var(--gold); color:#090d16; font-weight:900; padding:2px 7px; border-radius:6px; align-self:flex-start;">
              ${escapeHtml(badge)}
            </span>
            <div class="reel-play-center-icon">▶</div>
            <strong style="font-size:0.75rem; line-height:1.25; text-shadow:0 2px 4px rgba(0,0,0,0.8);">
              ${escapeHtml(title)}
            </strong>
          </div>
        </div>
      `;
    })
    .join("");
}

/* ==================== موتور پلیر تمام‌صفحه شبیه Reels اینستاگرام ==================== */
let reelsState = {
  index: 0,
  muted: false,
  paused: false,
  bound: false,
  wheelLock: false
};

function sendYoutubeCommand(funcName) {
  const iframe = document.getElementById("active-reel-iframe");
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: funcName, args: "" }),
      "*"
    );
  }
}

function flashReelTapIcon(symbol) {
  const fb = document.getElementById("reels-tap-feedback");
  if (!fb) return;
  fb.textContent = symbol;
  fb.classList.add("show");
  clearTimeout(fb._t);
  fb._t = setTimeout(() => fb.classList.remove("show"), 550);
}

function renderActiveReelSlide(index, animDir = "none") {
  const list = coreState.activeReelsList || [];
  if (list.length === 0) return;

  const clamped = Math.max(0, Math.min(list.length - 1, index));
  reelsState.index = clamped;
  reelsState.paused = false;

  const item = list[clamped];
  const ytId = extractCleanYoutubeId(item.ytId || item.url);
  const directUrl = !ytId ? item.url || "" : "";
  const badge = item.countryLabel || item.badge || "⭐ CLIENT REVIEW";
  const title = getLocalizedField(item.title, `Verified Client Review #${clamped + 1}`);

  const holder = document.getElementById("reels-media-holder");
  if (!holder) return;

  holder.classList.remove("reel-anim-up", "reel-anim-down");
  void holder.offsetWidth;
  if (animDir === "up") holder.classList.add("reel-anim-up");
  if (animDir === "down") holder.classList.add("reel-anim-down");

  const muteParam = reelsState.muted ? 1 : 0;
  if (ytId) {
    holder.innerHTML = `
      <iframe
        id="active-reel-iframe"
        src="https://www.youtube.com/embed/${escapeHtml(ytId)}?autoplay=1&mute=${muteParam}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&loop=1&playlist=${escapeHtml(ytId)}"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
      ></iframe>
    `;
  } else if (directUrl) {
    holder.innerHTML = `
      <video id="active-reel-video" src="${escapeHtml(directUrl)}" autoplay playsinline loop ${reelsState.muted ? "muted" : ""}></video>
    `;
  }

  const countryEl = document.getElementById("reels-active-country");
  const counterEl = document.getElementById("reels-active-counter");
  const titleEl = document.getElementById("reels-active-title");
  const prevBtn = document.getElementById("btn-reels-prev");
  const nextBtn = document.getElementById("btn-reels-next");
  const soundBtn = document.getElementById("btn-reels-sound");
  const hintEl = document.getElementById("reels-swipe-hint-text");

  if (countryEl) countryEl.textContent = badge;
  if (counterEl) counterEl.textContent = `${clamped + 1} / ${list.length}`;
  if (titleEl) titleEl.textContent = title;
  if (prevBtn) prevBtn.disabled = clamped === 0;
  if (nextBtn) nextBtn.disabled = clamped === list.length - 1;
  if (soundBtn) soundBtn.textContent = reelsState.muted ? "🔇" : "🔊";

  const hints = {
    en: list.length > 1 ? "⬆ Swipe up / down for next review" : "Tap video to pause / play",
    it: list.length > 1 ? "⬆ Scorri su / giù per altri video" : "Tocca per pausa / play",
    es: list.length > 1 ? "⬆ Desliza arriba / abajo para más vídeos" : "Toca para pausar / reproducir"
  };
  if (hintEl) hintEl.textContent = hints[coreState.lang] || hints.en;
}

function closeReelsPlayerModal() {
  const modal = document.getElementById("reels-fullscreen-modal");
  const holder = document.getElementById("reels-media-holder");
  if (holder) holder.innerHTML = "";
  modal?.classList.remove("open");
  document.body.style.overflow = "";
}

function bindReelsPlayerControlsOnce() {
  if (reelsState.bound) return;
  reelsState.bound = true;

  const modal = document.getElementById("reels-fullscreen-modal");
  const gestureLayer = document.getElementById("reels-gesture-layer");
  const holder = document.getElementById("reels-media-holder");

  const goNext = () => {
    if (reelsState.index < (coreState.activeReelsList?.length || 0) - 1) {
      renderActiveReelSlide(reelsState.index + 1, "up");
    }
  };

  const goPrev = () => {
    if (reelsState.index > 0) {
      renderActiveReelSlide(reelsState.index - 1, "down");
    }
  };

  document.getElementById("btn-close-reels-modal")?.addEventListener("click", closeReelsPlayerModal);
  document.getElementById("btn-reels-prev")?.addEventListener("click", goPrev);
  document.getElementById("btn-reels-next")?.addEventListener("click", goNext);

  document.getElementById("btn-reels-sound")?.addEventListener("click", () => {
    reelsState.muted = !reelsState.muted;
    const btn = document.getElementById("btn-reels-sound");
    if (btn) btn.textContent = reelsState.muted ? "🔇" : "🔊";

    const vid = document.getElementById("active-reel-video");
    if (vid) {
      vid.muted = reelsState.muted;
    } else {
      sendYoutubeCommand(reelsState.muted ? "mute" : "unMute");
    }
  });

  // تشخیص سوایپ بالا/پایین مثل ریلز اینستاگرام و ضربه برای توقف/پخش
  let startY = 0;
  let startX = 0;
  let startTime = 0;

  gestureLayer?.addEventListener(
    "touchstart",
    (e) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      startTime = Date.now();
      if (holder) holder.style.transition = "none";
    },
    { passive: true }
  );

  gestureLayer?.addEventListener(
    "touchmove",
    (e) => {
      const dy = e.touches[0].clientY - startY;
      if (Math.abs(dy) > 8) {
        e.preventDefault();
        if (holder) holder.style.transform = `translateY(${dy * 0.32}px)`;
      }
    },
    { passive: false }
  );

  gestureLayer?.addEventListener("touchend", (e) => {
    const endY = e.changedTouches[0].clientY;
    const endX = e.changedTouches[0].clientX;
    const dy = endY - startY;
    const dx = endX - startX;
    const dt = Date.now() - startTime;

    if (holder) {
      holder.style.transition = "transform 0.2s ease";
      holder.style.transform = "translateY(0)";
    }

    if (dy < -50 && Math.abs(dy) > Math.abs(dx)) {
      goNext();
    } else if (dy > 50 && Math.abs(dy) > Math.abs(dx)) {
      goPrev();
    } else if (Math.abs(dy) < 12 && Math.abs(dx) < 12 && dt < 350) {
      toggleActiveReelPlayback();
    }
  });

  gestureLayer?.addEventListener("click", (e) => {
    if (e.pointerType === "touch") return;
    toggleActiveReelPlayback();
  });

  function toggleActiveReelPlayback() {
    reelsState.paused = !reelsState.paused;
    const vid = document.getElementById("active-reel-video");
    if (vid) {
      if (reelsState.paused) vid.pause();
      else vid.play();
    } else {
      sendYoutubeCommand(reelsState.paused ? "pauseVideo" : "playVideo");
    }
    flashReelTapIcon(reelsState.paused ? "⏸" : "▶");
  }

  modal?.addEventListener(
    "wheel",
    (e) => {
      if (!modal.classList.contains("open")) return;
      e.preventDefault();
      if (reelsState.wheelLock) return;
      if (e.deltaY > 25) {
        reelsState.wheelLock = true;
        goNext();
        setTimeout(() => (reelsState.wheelLock = false), 450);
      } else if (e.deltaY < -25) {
        reelsState.wheelLock = true;
        goPrev();
        setTimeout(() => (reelsState.wheelLock = false), 450);
      }
    },
    { passive: false }
  );

  window.addEventListener("keydown", (e) => {
    if (!modal?.classList.contains("open")) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      goNext();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "Escape") {
      closeReelsPlayerModal();
    }
  });
}

export function openInSiteReviewVideoModal(startIndex = 0) {
  const modal = document.getElementById("reels-fullscreen-modal");
  if (!modal || !coreState.activeReelsList?.length) return;

  bindReelsPlayerControlsOnce();
  document.body.style.overflow = "hidden";
  modal.classList.add("open");
  renderActiveReelSlide(startIndex, "none");
}

/**
 * رندر آکاردئون پرسش و پاسخ‌های متداول (FAQ) از پنل ادمین + تزریق اسکیمای Organization & FAQPage برای گوگل
 */
export function renderHomeFaqSection() {
  const faqBlock = document.getElementById("home-faq-block");
  const faqList = document.getElementById("home-faq-list");
  const rawFaqs = Array.isArray(coreState.publicConfig.faqs) ? coreState.publicConfig.faqs : [];

  const validFaqs = rawFaqs
    .map((item) => ({
      q: getLocalizedField(item.question, ""),
      a: getLocalizedField(item.answer, "")
    }))
    .filter((f) => f.q && f.a);

  if (faqBlock && faqList) {
    if (validFaqs.length === 0) {
      faqBlock.style.display = "none";
    } else {
      faqBlock.style.display = "block";
      faqList.innerHTML = validFaqs
        .map(
          (f, idx) => `
          <div class="faq-item ${idx === 0 ? "open" : ""}">
            <button type="button" class="faq-question-btn" data-toggle-faq="${idx}">
              <span>${escapeHtml(f.q)}</span>
              <span class="faq-chevron">▾</span>
            </button>
            <div class="faq-answer-body">${escapeHtml(f.a)}</div>
          </div>
        `
        )
        .join("");
    }
  }

  const schemaEl = document.getElementById("seo-org-faq-json-ld");
  if (schemaEl) {
    const graph = [
      {
        "@type": "WholesaleStore",
        name: "Paradise Wholesale Clothing Istanbul",
        url: SITE_DOMAIN,
        logo: coreState.publicConfig.logoUrl || `${SITE_DOMAIN}/favicon.ico`,
        telephone: coreState.publicConfig.whatsappRaw || DEFAULT_WHATSAPP,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Istanbul",
          addressCountry: "TR"
        },
        sameAs: [
          coreState.publicConfig.instagramUrl || "https://www.instagram.com/paradisewholesaleclothing5401",
          coreState.publicConfig.youtubeUrl || "https://www.youtube.com/@paradisewholesaleclothing5401"
        ]
      }
    ];

    if (validFaqs.length > 0) {
      graph.push({
        "@type": "FAQPage",
        mainEntity: validFaqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a
          }
        }))
      });
    }

    schemaEl.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph
    });
  }
}

export function renderHomeExclusiveShowcase() {
  const showcaseSec = document.getElementById("home-exclusive-showcase");
  if (!showcaseSec) return;

  if (!isRootHomeStage()) {
    showcaseSec.style.display = "none";
    return;
  }

  showcaseSec.style.display = "flex";
  const pub = coreState.publicConfig;

  // ۱. رندر ریل رضایت مشتریان با توزیع یکی‌درمیان کشورها
  renderRandomReviewsReel();

  // ۲. رندر ویدیوی بزرگ آشنایی با مجموعه و انبار استانبول
  const heroBlock = document.getElementById("home-hero-video-block");
  const heroStage = document.getElementById("home-hero-video-stage");
  if (heroBlock && heroStage) {
    const hv = pub.heroVideo || {};
    const cleanYtId = extractCleanYoutubeId(hv.ytId || hv.url);
    const directMp4 = !cleanYtId && hv.ytId && hv.ytId.startsWith("http") ? hv.ytId : "";

    if (cleanYtId || directMp4) {
      heroBlock.style.display = "block";
      const heroTitle = getLocalizedField(hv.title, "Watch Our Istanbul Showroom & Live Order Packing");
      const posterUrl =
        hv.poster ||
        (cleanYtId
          ? `https://i.ytimg.com/vi/${cleanYtId}/hqdefault.jpg`
          : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80");

      heroStage.innerHTML = `
        <img src="${escapeHtml(posterUrl)}" alt="${escapeHtml(heroTitle)}" loading="lazy" />
        <div class="hero-play-overlay" data-play-inline-yt="${escapeHtml(cleanYtId)}" data-play-inline-mp4="${escapeHtml(directMp4)}">
          <div class="play-pulse-circle">▶</div>
          <strong style="font-size:0.95rem; text-shadow:0 2px 6px rgba(0,0,0,0.7);">
            ${escapeHtml(heroTitle)}
          </strong>
        </div>
      `;
    } else {
      heroBlock.style.display = "none";
    }
  }

  // ۳. رندر پرسش و پاسخ‌های متداول عمده‌فروشی (FAQ)
  renderHomeFaqSection();

  // ۴. رندر آخرین مقالات سئو
  const blogsBlock = document.getElementById("home-blogs-block");
  const blogsGrid = document.getElementById("home-blogs-grid");
  if (blogsBlock && blogsGrid) {
    const articles = Array.isArray(coreState.blogs) ? coreState.blogs.slice(0, 3) : [];
    if (articles.length > 0) {
      blogsBlock.style.display = "block";
      blogsGrid.innerHTML = articles
        .map((b) => {
          const title = b.title?.[coreState.lang] || b.title?.en || "Wholesale Guide";
          const slug = b.slugs?.[coreState.lang] || b.slug || b.id;
          const img = b.coverImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=75";
          return `
            <a href="blog.html?slug=${encodeURIComponent(slug)}&lang=${coreState.lang}" class="home-blog-card">
              <img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" loading="lazy" />
              <div>
                <strong style="font-size:0.82rem; display:block; margin-bottom:3px;">${escapeHtml(title)}</strong>
                <span style="font-size:0.7rem; color:var(--emerald-dark); font-weight:700;">${t("viewAllGuides")} ➔</span>
              </div>
            </a>
          `;
        })
        .join("");
    } else {
      blogsBlock.style.display = "none";
    }
  }
}

export function renderVisualCategoryCards() {
  const section = document.getElementById("visual-categories-section");
  const grid = document.getElementById("visual-categories-grid");
  if (!section || !grid) return;

  if (coreState.searchQuery) {
    section.style.display = "none";
    return;
  }

  if (!coreState.dept) {
    const depts = getNonEmptyDepartments();
    section.style.display = "block";
    grid.innerHTML = depts
      .map((d, idx) => {
        const title = escapeHtml(getLocalizedTaxonomyLabel(d));
        const subCount = getNonEmptySubcategories(d.id).length;
        const prodCount = getProductsForDept(d.id).length;
        const img = escapeHtml(
          d.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=75"
        );
        const prioAttr = idx < 6 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"';

        return `
          <a href="${escapeHtml(buildShareableUrl({ dept: d.id, cat: "", sub: "", price: null }))}"
             class="visual-cat-card"
             data-select-dept="${escapeHtml(d.id)}">
            <img src="${img}" alt="${title}" ${prioAttr} />
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

  if (coreState.dept && !coreState.cat) {
    const subcats = getNonEmptySubcategories(coreState.dept);
    if (subcats.length === 0) {
      section.style.display = "none";
      return;
    }

    section.style.display = "block";
    grid.innerHTML = subcats
      .map((sc, idx) => {
        const title = escapeHtml(getLocalizedTaxonomyLabel(sc));
        const count = getProductsForSubcat(coreState.dept, sc.id).length;
        const img = escapeHtml(
          sc.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=450&q=75"
        );
        const prioAttr = idx < 6 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"';

        return `
          <a href="${escapeHtml(buildShareableUrl({ dept: coreState.dept, cat: sc.id, sub: "", price: null }))}"
             class="visual-cat-card"
             data-select-cat="${escapeHtml(sc.id)}">
            <img src="${img}" alt="${title}" ${prioAttr} />
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

  section.style.display = "none";
}

export function renderStickyGlassPills(triggerNudge = false) {
  const dock = document.getElementById("sticky-glass-dock");
  const subnavRow = document.getElementById("glass-subnav-row");
  const track = document.getElementById("glass-pills-track");
  if (!dock || !track) return;

  if (!isProductStageActive()) {
    dock.style.display = "none";
    return;
  }

  dock.style.display = "block";

  if (!coreState.dept || !coreState.cat) {
    if (subnavRow) subnavRow.style.display = "none";
    return;
  }

  const deptObj = coreState.taxonomy.find((d) => d.id === coreState.dept);
  const subObj = (deptObj?.subcategories || []).find((s) => s.id === coreState.cat);
  const totalCatCount = getProductsForSubcat(coreState.dept, coreState.cat).length;
  const nonEmptyLeaves = getNonEmptyLeaves(coreState.dept, coreState.cat);

  if (nonEmptyLeaves.length === 0) {
    if (subnavRow) subnavRow.style.display = "none";
    updateGlassScrollIndicators();
    return;
  }

  if (subnavRow) subnavRow.style.display = "flex";

  const pillsHtml = [];

  pillsHtml.push(`
    <button type="button" class="glass-pill ${!coreState.sub ? "active" : ""}" data-glass-leaf="">
      <span>${t("allStyles")} ${escapeHtml(getLocalizedTaxonomyLabel(subObj))}</span>
      <span class="pill-count">(${totalCatCount})</span>
    </button>
  `);

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
    } else if (triggerNudge && track.scrollWidth > track.clientWidth + 20) {
      const maxDist = track.scrollWidth - track.clientWidth;
      const demoDist = Math.min(260, maxDist);
      clearTimeout(track._nudgeTimer1);
      clearTimeout(track._nudgeTimer2);

      track._nudgeTimer1 = setTimeout(() => {
        track.scrollTo({ left: demoDist, behavior: "smooth" });
        track._nudgeTimer2 = setTimeout(() => {
          track.scrollTo({ left: 0, behavior: "smooth" });
        }, 950);
      }, 320);
    }
  });
}

export function updateGlassScrollIndicators() {
  const track = document.getElementById("glass-pills-track");
  const subnavRow = document.getElementById("glass-subnav-row");
  const leftBtn = document.getElementById("scroll-arrow-left");
  const rightBtn = document.getElementById("scroll-arrow-right");
  const barWrap = document.getElementById("micro-scroll-bar-wrap");
  const barFill = document.getElementById("micro-scroll-bar-fill");

  if (!track || !isProductStageActive() || subnavRow?.style.display === "none") {
    if (leftBtn) leftBtn.classList.remove("visible");
    if (rightBtn) rightBtn.classList.remove("visible");
    if (barWrap) barWrap.classList.remove("visible");
    return;
  }

  const maxScroll = track.scrollWidth - track.clientWidth;
  const isOverflowing = maxScroll > 10;

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
  document.getElementById("btn-nav-home")?.addEventListener("click", resetToRootHome);
  document.getElementById("header-brand-link")?.addEventListener("click", resetToRootHome);

  // باز و بسته کردن آکاردئون پرسش و پاسخ (FAQ)
  document.getElementById("home-faq-list")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-toggle-faq]");
    if (!btn) return;
    const item = btn.closest(".faq-item");
    if (item) item.classList.toggle("open");
  });

  // پخش درجا برای ویدیوی بزرگ معرفی شرکت و انبار در صفحه اول
  document.getElementById("home-hero-video-stage")?.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-play-inline-yt], [data-play-inline-mp4]");
    if (!trigger) return;
    const ytId = trigger.getAttribute("data-play-inline-yt");
    const mp4Url = trigger.getAttribute("data-play-inline-mp4");
    const stage = document.getElementById("home-hero-video-stage");
    if (!stage) return;

    if (ytId) {
      stage.innerHTML = `<iframe src="https://www.youtube.com/embed/${escapeHtml(ytId)}?autoplay=1&rel=0&playsinline=1" style="width:100%;height:100%;border:none;" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else if (mp4Url) {
      stage.innerHTML = `<video src="${escapeHtml(mp4Url)}" controls autoplay playsinline style="width:100%;height:100%;object-fit:contain;"></video>`;
    }
  });

  // باز کردن پلیر تمام‌صفحه ریلز از روی ویدیوی انتخاب‌شده
  document.getElementById("home-videos-reel-track")?.addEventListener("click", (e) => {
    const card = e.target.closest("[data-reel-idx]");
    if (!card) return;
    const idx = parseInt(card.getAttribute("data-reel-idx"), 10) || 0;
    openInSiteReviewVideoModal(idx);
  });

  document.getElementById("btn-reels-scroll-right")?.addEventListener("click", () => {
    document.getElementById("home-videos-reel-track")?.scrollBy({ left: 220, behavior: "smooth" });
  });

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
    track?.scrollBy({ left: -200, behavior: "smooth" });
  });
  document.getElementById("scroll-arrow-right")?.addEventListener("click", () => {
    track?.scrollBy({ left: 200, behavior: "smooth" });
  });

  track?.addEventListener("click", (e) => {
    const leafBtn = e.target.closest("[data-glass-leaf]");
    if (leafBtn) {
      coreState.sub = leafBtn.getAttribute("data-glass-leaf") || "";
      coreState.price = null;
      coreState.displayLimit = 12;
      syncBrowserHistoryState();
      renderEntireCatalogView(false);
    }
  });

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
/* === پایان [MODULE-03: 100% 3-LANG UI, REELS PLAYER, COUNTRY REVIEWS & FAQ] === */
/* ==========================================================================
   === شروع [MODULE-04: DYNAMIC PRICE-TIER DETECTOR (EUR / USD)] (ماژول ۴) ===
   راهنما: تشخیص هوشمند قیمت‌های موجود در شاخه فعلی بر اساس ارز فعال (€ یا $).
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

  if (!isProductStageActive()) {
    priceRow.style.display = "none";
    return;
  }

  const scopedProducts = getProductsInCurrentScopeWithoutPrice();

  const priceCountMap = new Map();
  scopedProducts.forEach((p) => {
    const baseUsd = Number(p.unitPrice);
    if (baseUsd > 0) {
      const displayPr = convertUsdToDisplay(baseUsd);
      priceCountMap.set(displayPr, (priceCountMap.get(displayPr) || 0) + 1);
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
    const formattedPrice = formatMoney(priceVal, false);
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
/* === پایان [MODULE-04: DYNAMIC PRICE-TIER DETECTOR (EUR / USD)] === */


/* ==========================================================================
   === شروع [MODULE-05: PRODUCT CARD MINI-SLIDER, INLINE QTY STEPPER & LIGHTBOX] (ماژول ۵) ===
   راهنما: نمایش دکمه‌های Prev/Next، کنترلر زنده تعداد (+ / - / سطل آشغال) روی
   کارت محصول و پنجره بزرگ‌نمایی (Lightbox) با همگام‌سازی فوری بدون لود مجدد عکس‌ها.
   ========================================================================== */

export function getFinalFilteredProducts() {
  if (!isProductStageActive()) return [];
  const scoped = getProductsInCurrentScopeWithoutPrice();
  if (coreState.price === null || isNaN(coreState.price)) return scoped;
  return scoped.filter((p) => convertUsdToDisplay(Number(p.unitPrice)) === Number(coreState.price));
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

function getCartPacksForSku(sku) {
  const target = String(sku || "").trim().toUpperCase();
  if (!target) return 0;
  const found = coreState.cart.find((c) => String(c.sku || "").trim().toUpperCase() === target);
  return found ? Math.max(0, parseInt(found.packs, 10) || 0) : 0;
}

/**
 * ساخت دکمه افزودن یا کنترلر حرفه‌ای تعداد (+ / - / 🗑) برای کارت محصول
 */
function buildCardCartActionHtml(rawSku, pcs, packs) {
  const escSku = escapeHtml(rawSku);
  if (packs <= 0) {
    return `
      <button type="button" class="btn-add-pack-card" data-add-pack="${escSku}">
        <span>${t("addPackBtn")} (${pcs} ${t("pcsUnit")})</span>
      </button>
    `;
  }

  const totalPcs = packs * pcs;
  const isSingle = packs === 1;
  const leftBtnClass = isSingle ? "trash-mode" : "minus-mode";
  const leftIcon = isSingle ? "🗑" : "−";

  return `
    <div class="card-qty-stepper">
      <button type="button" class="stepper-btn ${leftBtnClass}" data-card-qty-step="${escSku}:-1" aria-label="Decrease or Remove">${leftIcon}</button>
      <span class="stepper-count-label"><strong>${packs}</strong> <small>(${totalPcs} ${t("pcsUnit")})</small></span>
      <button type="button" class="stepper-btn plus-mode" data-card-qty-step="${escSku}:1" aria-label="Add 1 Pack">+</button>
    </div>
  `;
}

/**
 * همگام‌سازی فوری دکمه‌های تعداد در لایت‌باکس بازشده
 */
export function syncLightboxCartControl() {
  const prod = coreState.lightboxProduct;
  const addBtn = document.getElementById("btn-lightbox-add-pack");
  if (!addBtn) return;

  let stepperEl = document.getElementById("lightbox-qty-stepper");
  if (!stepperEl) {
    stepperEl = document.createElement("div");
    stepperEl.id = "lightbox-qty-stepper";
    stepperEl.className = "card-qty-stepper lightbox-stepper";
    stepperEl.style.display = "none";
    addBtn.insertAdjacentElement("afterend", stepperEl);

    stepperEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-lightbox-qty-step]");
      if (!btn || !coreState.lightboxProduct) return;
      const delta = parseInt(btn.getAttribute("data-lightbox-qty-step"), 10) || 0;
      const sku = coreState.lightboxProduct.sku || coreState.lightboxProduct.id;
      if (delta !== 0) updateCartPackQtyBySku(sku, delta);
    });
  }

  if (!prod) {
    stepperEl.style.display = "none";
    addBtn.style.display = "flex";
    return;
  }

  const sku = prod.sku || prod.id;
  const pcs = Math.max(1, parseInt(prod.pcsPerPack, 10) || 6);
  const packs = getCartPacksForSku(sku);

  if (packs > 0) {
    const totalPcs = packs * pcs;
    const isSingle = packs === 1;
    addBtn.style.display = "none";
    stepperEl.style.display = "flex";
    stepperEl.innerHTML = `
      <button type="button" class="stepper-btn ${isSingle ? "trash-mode" : "minus-mode"}" data-lightbox-qty-step="-1" aria-label="Decrease or Remove">${isSingle ? "🗑" : "−"}</button>
      <span class="stepper-count-label"><strong>${packs} ${t("packsUnit")}</strong> <small>(${totalPcs} ${t("pcsUnit")})</small></span>
      <button type="button" class="stepper-btn plus-mode" data-lightbox-qty-step="1" aria-label="Add 1 Pack">+</button>
    `;
  } else {
    stepperEl.style.display = "none";
    addBtn.style.display = "flex";
    addBtn.textContent = `${t("addPackModalBtn")} (${pcs} ${t("pcsUnit")})`;
  }
}

/**
 * آپدیت همزمان تمام کارت‌های محصول قابل مشاهده و لایت‌باکس (بدون رندر مجدد عکس‌ها)
 */
export function syncAllProductCardCartControls() {
  document.querySelectorAll("[data-cart-slot]").forEach((slotEl) => {
    const sku = slotEl.getAttribute("data-cart-slot") || "";
    const pcs = Math.max(1, parseInt(slotEl.getAttribute("data-cart-pcs"), 10) || 6);
    const packs = getCartPacksForSku(sku);
    slotEl.innerHTML = buildCardCartActionHtml(sku, pcs, packs);
  });

  syncLightboxCartControl();
}

export function renderProductsCatalogGrid() {
  const section = document.getElementById("products-catalog-section");
  const grid = document.getElementById("products-catalog-grid");
  const loadMoreBtn = document.getElementById("btn-load-more-products");
  if (!section || !grid) return;

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
      const rawSku = p.sku || p.id;
      const sku = escapeHtml(rawSku);
      const displayUnit = convertUsdToDisplay(Number(p.unitPrice) || 0);
      const pcs = Math.max(1, parseInt(p.pcsPerPack, 10) || 6);
      const packTotal = displayUnit * pcs;
      const title = escapeHtml(getLocalizedProductTitle(p));
      const sizes = escapeHtml(p.sizeRange || "S - M - L - XL");
      const hasVideo = Boolean(p.videoUrl || p.youtubeId);
      const inCartPacks = getCartPacksForSku(rawSku);

      const imagesList = Array.isArray(p.images) && p.images.length > 0 ? p.images.filter(Boolean) : [p.imageUrl];
      const currentSlideIdx = coreState.cardSlideIndexMap.get(p.id || p.sku) || 0;
      const activeImgSrc =
        currentSlideIdx === 0 ? p.thumbUrl || imagesList[0] || "" : imagesList[currentSlideIdx] || p.thumbUrl || "";

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
                <span class="prod-unit-price">${formatMoney(displayUnit, false)} <small>${t("perPc")}</small></span>
                <span class="prod-pack-badge">${pcs} ${t("pcsUnit")} (${formatMoney(packTotal, false)})</span>
              </div>
              <div class="prod-title-line" title="${title}">${title}</div>
              <div class="prod-size-line">${t("sizesLabel")} ${sizes} • <strong>${sku}</strong></div>
            </div>

            <div class="prod-card-cart-slot" data-cart-slot="${sku}" data-cart-pcs="${pcs}">
              ${buildCardCartActionHtml(rawSku, pcs, inCartPacks)}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

export function stepCardMiniSlider(sku, direction) {
  const prod = coreState.allProducts.find((p) => (p.sku || p.id) === sku);
  if (!prod) return;
  const imagesList = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images.filter(Boolean) : [prod.imageUrl];
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
  syncLightboxCartControl();
  syncBrowserHistoryState();
}

export function renderLightboxStageContent() {
  const prod = coreState.lightboxProduct;
  if (!prod) return;

  const stage = document.getElementById("lightbox-media-stage");
  const multiNavGroup = document.getElementById("lightbox-multi-nav-group");
  const counterEl = document.getElementById("lightbox-media-counter");
  const toggleVidBtn = document.getElementById("btn-lightbox-toggle-video");
  if (!stage) return;

  const imagesList = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images.filter(Boolean) : [prod.imageUrl];
  const hasVideo = Boolean(prod.videoUrl || prod.youtubeId);

  if (multiNavGroup) {
    if (!coreState.lightboxVideoMode && imagesList.length > 1) {
      multiNavGroup.style.display = "flex";
    } else {
      multiNavGroup.style.display = "none";
    }
  }

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
  } else {
    const hdSrc = imagesList[coreState.lightboxSlideIdx] || prod.imageUrl || prod.thumbUrl || "";
    stage.innerHTML = `<img src="${escapeHtml(hdSrc)}" alt="${escapeHtml(prod.sku)}" />`;
    if (counterEl && imagesList.length > 1) {
      counterEl.textContent = `${coreState.lightboxSlideIdx + 1} / ${imagesList.length}`;
    }
  }

  const displayUnit = convertUsdToDisplay(Number(prod.unitPrice) || 0);
  const pcs = Math.max(1, parseInt(prod.pcsPerPack, 10) || 6);
  const packTotal = displayUnit * pcs;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("lightbox-unit-price", formatMoney(displayUnit, false));
  setTxt("txt-lightbox-per-pc", t("perPc"));
  setTxt("lightbox-sku-badge", prod.sku || prod.id);
  setTxt("lightbox-prod-title", getLocalizedProductTitle(prod));
  setTxt("lightbox-prod-desc", getLocalizedProductDesc(prod));
  setTxt("txt-lightbox-pack-info", `${t("packOf")} ${pcs} ${t("pcsUnit")} (${formatMoney(packTotal, false)})`);
  setTxt("txt-lightbox-size-info", `${t("sizesLabel")} ${prod.sizeRange || "S-XXL"}`);

  syncLightboxCartControl();
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
    const qtyStepBtn = e.target.closest("[data-card-qty-step]");
    if (qtyStepBtn) {
      e.stopPropagation();
      const rawAttr = qtyStepBtn.getAttribute("data-card-qty-step") || "";
      const sepIdx = rawAttr.lastIndexOf(":");
      if (sepIdx > -1) {
        const sku = rawAttr.slice(0, sepIdx);
        const delta = parseInt(rawAttr.slice(sepIdx + 1), 10) || 0;
        if (delta !== 0) updateCartPackQtyBySku(sku, delta);
      }
      return;
    }

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
    const imgs = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images.filter(Boolean) : [prod.imageUrl];
    coreState.lightboxSlideIdx = (coreState.lightboxSlideIdx - 1 + imgs.length) % imgs.length;
    renderLightboxStageContent();
  });

  document.getElementById("btn-lightbox-next")?.addEventListener("click", () => {
    const prod = coreState.lightboxProduct;
    if (!prod) return;
    coreState.lightboxVideoMode = false;
    const imgs = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images.filter(Boolean) : [prod.imageUrl];
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
/* === پایان [MODULE-05: PRODUCT CARD MINI-SLIDER, INLINE QTY STEPPER & LIGHTBOX] === */


/* ==========================================================================
   === شروع [MODULE-06: STEPPED CART ENGINE (EUR/USD), LIVE SYNC & GOOGLE ADS] (ماژول ۶) ===
   راهنما: مدیریت سبد خرید پله‌ای، همگام‌سازی فوری دکمه‌های تعداد روی کارت‌های محصول
   و لایت‌باکس، و ارسال زنده تغییرات روی لینک سفارش فایربیس.
   ========================================================================== */

export function saveCartToStorage(syncToCloud = true) {
  try {
    localStorage.setItem("paradise_b2b_cart", JSON.stringify(coreState.cart));
  } catch (e) {}

  if (coreState.cart.length === 0) {
    coreState.activeOrderCode = "";
    coreState.lastExportedFingerprint = "";
    coreState.lastExportedAt = "";
    try {
      localStorage.removeItem("paradise_active_order_code");
    } catch (e) {}
    return;
  }

  if (syncToCloud && typeof scheduleLiveOrderSyncToFirestore === "function") {
    scheduleLiveOrderSyncToFirestore();
  }
}

export function calculateSteppedCartTotals() {
  const threshold = Math.max(1, parseInt(coreState.publicConfig.bestRateThreshold, 10) || 25);

  let totalPacks = 0;
  let totalPieces = 0;
  let baseSubtotal = 0;

  coreState.cart.forEach((item) => {
    const packs = Math.max(1, parseInt(item.packs, 10) || 1);
    const pcsPerPack = Math.max(1, parseInt(item.pcsPerPack, 10) || 6);
    const displayUnit = convertUsdToDisplay(Number(item.unitPrice) || 0);
    const itemPieces = packs * pcsPerPack;

    totalPacks += packs;
    totalPieces += itemPieces;
    baseSubtotal += itemPieces * displayUnit;
  });

  let surchargeUsdPerPc = 0;
  if (totalPieces > 0 && totalPieces < threshold) {
    const ratio = totalPieces / threshold;
    if (ratio >= 0.8) {
      surchargeUsdPerPc = 1;
    } else if (ratio >= 0.6) {
      surchargeUsdPerPc = 2;
    } else if (ratio >= 0.4) {
      surchargeUsdPerPc = 3;
    } else {
      surchargeUsdPerPc = 5;
    }
  }

  const surchargePerPc = surchargeUsdPerPc > 0 ? convertUsdToDisplay(surchargeUsdPerPc) : 0;
  const smallOrderFee = Math.round(totalPieces * surchargePerPc * 100) / 100;
  baseSubtotal = Math.round(baseSubtotal * 100) / 100;
  const finalTotal = Math.round((baseSubtotal + smallOrderFee) * 100) / 100;
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

export function addPackToCart(prod, packsToAdd = 1) {
  if (!prod) return;
  const sku = prod.sku || prod.id;
  const existing = coreState.cart.find((c) => String(c.sku || "").trim().toUpperCase() === String(sku).trim().toUpperCase());

  if (existing) {
    existing.packs = (Number(existing.packs) || 1) + packsToAdd;
    existing.unitPrice = Number(prod.unitPrice) || existing.unitPrice;
    existing.pcsPerPack = Math.max(1, parseInt(prod.pcsPerPack, 10) || existing.pcsPerPack || 6);
    if (prod.department) existing.department = prod.department;
    if (prod.subcategory) existing.subcategory = prod.subcategory;
  } else {
    coreState.cart.push({
      sku,
      title: getLocalizedProductTitle(prod),
      department: prod.department || "",
      subcategory: prod.subcategory || "",
      unitPrice: Number(prod.unitPrice) || 5,
      pcsPerPack: Math.max(1, parseInt(prod.pcsPerPack, 10) || 6),
      sizeRange: prod.sizeRange || "S-XXL",
      thumbUrl: prod.thumbUrl || prod.imageUrl || "",
      packs: packsToAdd
    });
  }

  saveCartToStorage(true);
  renderSteppedCartUI();
  showCatalogToast(`${t("addedToast")} (${sku})`);
}

/**
 * کم/زیاد کردن یا حذف مستقیم یک محصول از روی کارت محصول یا پنجره لایت‌باکس
 */
export function updateCartPackQtyBySku(sku, delta) {
  const target = String(sku || "").trim().toUpperCase();
  if (!target) return;

  const idx = coreState.cart.findIndex((c) => String(c.sku || "").trim().toUpperCase() === target);
  if (idx === -1) {
    if (delta > 0) {
      const prod = coreState.allProducts.find((p) => String(p.sku || p.id || "").trim().toUpperCase() === target);
      if (prod) addPackToCart(prod, delta);
    }
    return;
  }

  coreState.cart[idx].packs = (Number(coreState.cart[idx].packs) || 1) + delta;
  if (coreState.cart[idx].packs <= 0) {
    const removedSku = coreState.cart[idx].sku;
    coreState.cart.splice(idx, 1);
    showCatalogToast(`${t("removedToast")} (${removedSku})`);
  }

  saveCartToStorage(true);
  renderSteppedCartUI();
}

export function renderSteppedCartUI() {
  const stats = calculateSteppedCartTotals();

  const headerBadge = document.getElementById("header-cart-pcs-badge");
  if (headerBadge) headerBadge.textContent = `${stats.totalPieces} ${t("pcsUnit")}`;

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
    bottomTotal.textContent = formatMoney(stats.finalTotal, true);
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

  const headerSummary = document.getElementById("cart-header-summary");
  if (headerSummary) {
    headerSummary.textContent = `${stats.totalPacks} ${t("packsUnit")} • ${stats.totalPieces} ${t("piecesUnit")} (${coreState.currency})`;
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
      bannerEl.innerHTML = `${t("tierHintPrefix")} <strong>${stats.remainingForBestRate} ${t("pcsUnit")}</strong> ${t("tierHintMiddle")} <strong>+${formatMoney(stats.smallOrderFee, false)} (+${formatMoney(stats.surchargePerPc, false)}/${t("pcsUnit")})</strong> ${t("tierHintSuffix")}`;
    }
  }

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
          const displayBaseUnit = convertUsdToDisplay(Number(item.unitPrice) || 0);
          const effectiveUnit = Math.round((displayBaseUnit + stats.surchargePerPc) * 100) / 100;
          const itemTotal = itemPcs * effectiveUnit;

          return `
            <div style="display:flex; gap:10px; align-items:center; background:#f8fafc; padding:8px 10px; border-radius:12px; border:1px solid var(--border);">
              <img src="${escapeHtml(item.thumbUrl)}" alt="${escapeHtml(item.sku)}" style="width:50px; height:64px; object-fit:cover; border-radius:8px; border:1px solid var(--border);" />
              <div style="flex:1; min-width:0;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.84rem; color:var(--text-main);">${escapeHtml(item.sku)}</strong>
                  <strong style="font-size:0.88rem; color:var(--emerald-dark);">${formatMoney(itemTotal, false)}</strong>
                </div>
                <div style="font-size:0.72rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  Unit: ${formatMoney(effectiveUnit, false)}/${t("pcsUnit")} • ${item.pcsPerPack} ${t("pcsUnit")}/pack (${escapeHtml(item.sizeRange)})
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

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("cart-base-subtotal", formatMoney(stats.baseSubtotal, true));
  setTxt("cart-small-order-fee", `+${formatMoney(stats.smallOrderFee, true)} (+${formatMoney(stats.surchargePerPc, false)}/${t("pcsUnit")})`);
  setTxt("cart-final-total", formatMoney(stats.finalTotal, true));

  const feeRow = document.getElementById("cart-small-order-fee-row");
  if (feeRow) {
    feeRow.style.display = stats.smallOrderFee > 0 ? "flex" : "none";
  }

  if (typeof renderAdminInvoiceExportBox === "function") {
    renderAdminInvoiceExportBox();
  }

  if (typeof syncAllProductCardCartControls === "function") {
    syncAllProductCardCartControls();
  }
}

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

export function fireGoogleAdsOrderConversion(orderTotalAmount, orderCode) {
  if (typeof window.gtag !== "function") return;
  const gadsId = (coreState.publicConfig.googleAdsId || "").trim();
  const gadsLabel = (coreState.publicConfig.googleAdsConversionLabel || "").trim();
  const activeCurrency = coreState.currency === "EUR" ? "EUR" : "USD";

  if (gadsId && gadsLabel) {
    window.gtag("event", "conversion", {
      send_to: `${gadsId}/${gadsLabel}`,
      value: Number(orderTotalAmount) || 1.0,
      currency: activeCurrency,
      transaction_id: orderCode
    });
  }

  window.gtag("event", "purchase_whatsapp_invoice", {
    value: Number(orderTotalAmount) || 1.0,
    currency: activeCurrency,
    transaction_id: orderCode
  });
}

export function fireDirectWhatsappClickEvent() {
  if (typeof window.gtag === "function") {
    window.gtag("event", "whatsapp_direct_chat_click", {
      event_category: "engagement",
      value: 1.0,
      currency: coreState.currency === "EUR" ? "EUR" : "USD"
    });
  }
}
/* === پایان [MODULE-06: STEPPED CART ENGINE (EUR/USD), LIVE SYNC & GOOGLE ADS] === */

/* ==========================================================================
   === شروع [MODULE-07: INSTANT BOOT, LIVE ORDER SYNC & ACCOUNTING EXPORT] (ماژول ۷) ===
   راهنما: نمایش آنی منوها و لوگو بدون صفحه خالی (Instant Boot Cache + Skeleton)،
   اجرای غیرمسدودکننده نرخ ارز، همگام‌سازی زنده سفارش و انتقال هوشمند به فاکتورساز.
   ========================================================================== */

const OFFICIAL_SOCIAL_SVGS = {
  instagram: `<svg viewBox="0 0 24 24" fill="none"><rect width="20" height="20" x="2" y="2" rx="5" stroke="#E1306C" stroke-width="2"/><circle cx="12" cy="12" r="4.5" stroke="#F77737" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="#E1306C"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" fill="#2AABEE"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.65-2.89 7.99-3.45 3.8-1.58 4.59-1.86 5.1-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .33z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="#ffffff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  android: `<svg viewBox="0 0 24 24" fill="#3DDC84"><path d="M17.523 15.341a.96.96 0 0 1-.959-.959c0-.53.43-.96.959-.96s.96.43.96.96-.43.959-.96.959m-11.046 0a.96.96 0 0 1-.96-.959c0-.53.43-.96.96-.96s.959.43.959.96-.43.959-.959.959m11.4-6.022l1.996-3.458a.416.416 0 0 0-.152-.567.416.416 0 0 0-.568.152L17.11 8.95a11.96 11.96 0 0 0-10.22 0L4.847 5.446a.416.416 0 0 0-.568-.152.416.416 0 0 0-.152.567l1.996 3.458C2.688 11.186.343 14.658 0 18.761h24c-.343-4.103-2.688-7.575-6.123-9.442"/></svg>`
};

export const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/paradisewholesaleclothing5401";
export const DEFAULT_YOUTUBE_URL = "https://www.youtube.com/@paradisewholesaleclothing5401";
const INVOICE_PANEL_BASE_URL = "https://raminparadise800.github.io/Paradise_panel/retail.html";
const INSTANT_BOOT_CACHE_KEY = "paradise_instant_boot_v1";

let liveSyncTimer = null;

export function getUnifiedWhatsAppInfo() {
  const pub = coreState.publicConfig;
  const raw = String(pub.whatsappRaw || DEFAULT_WHATSAPP).trim();
  const cleanDigits = raw.replace(/[^0-9]/g, "");

  const displayClean = String(pub.whatsappDisplay || "").replace(/[^0-9]/g, "");
  let formattedDisplay = pub.whatsappDisplay;
  if (!formattedDisplay || displayClean !== cleanDigits) {
    formattedDisplay = `+${cleanDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5")}`;
  }

  return { cleanDigits, formattedDisplay };
}

export function applyDynamicBrandingAndFooter() {
  const pub = coreState.publicConfig;
  const { cleanDigits, formattedDisplay } = getUnifiedWhatsAppInfo();
  const onHome = isRootHomeStage();

  const logoImg = document.getElementById("header-logo-img");
  const brandBadge = document.getElementById("home-brand-badge");

  if (logoImg) {
    if (pub.logoUrl && onHome) {
      if (logoImg.getAttribute("src") !== pub.logoUrl) {
        logoImg.src = pub.logoUrl;
      }
      logoImg.style.display = "block";
    } else {
      logoImg.style.display = "none";
    }
  }

  if (brandBadge) {
    if (!brandBadge.dataset.cleanedBrand) {
      brandBadge.dataset.cleanedBrand = "1";
      brandBadge.innerHTML = `
        <span class="brand-line-main">PARADISE<span class="brand-desktop-only"> WHOLESALE</span></span>
        <span class="brand-line-sub"><span class="brand-mobile-only">WHOLESALE</span><span class="brand-desktop-only">CLOTHING ISTANBUL</span></span>
      `;
    }
    brandBadge.style.display = onHome ? "flex" : "none";
  }

  const floatBtn = document.getElementById("floating-whatsapp-btn");
  if (floatBtn && cleanDigits) {
    const pageUrl = getBaseRootUrl();
    const greet = `Hello Paradise Wholesale Istanbul! I am browsing your catalog (${pageUrl}) and have a wholesale inquiry.`;
    floatBtn.href = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(greet)}`;
  }

  const footerWa = document.getElementById("footer-wa-link");
  if (footerWa && cleanDigits) {
    footerWa.href = `https://wa.me/${cleanDigits}`;
    footerWa.textContent = formattedDisplay;
  }

  const socialBox = document.getElementById("footer-social-container");
  if (socialBox) {
    const igUrl =
      pub.instagramUrl && !pub.instagramUrl.endsWith("/paradisewholesaler")
        ? pub.instagramUrl
        : DEFAULT_INSTAGRAM_URL;
    const tgUrl = pub.telegramUrl || "https://t.me/paradisewholesaler";
    const tkUrl = pub.tiktokUrl || "https://tiktok.com/@paradisewholesaler";
    const ytUrl = pub.youtubeUrl || DEFAULT_YOUTUBE_URL;
    const appUrl = pub.androidAppUrl || "https://play.google.com/store/search?q=PARADISE+WHOLESALE+CLOTHING&c=apps";

    const links = [
      `<a href="${escapeHtml(igUrl)}" target="_blank" rel="noopener" class="social-pill-link">
        ${OFFICIAL_SOCIAL_SVGS.instagram}
        <span>Instagram</span>
      </a>`,
      `<a href="${escapeHtml(ytUrl)}" target="_blank" rel="noopener" class="social-pill-link" style="border-color:rgba(255,0,0,0.4);">
        ${OFFICIAL_SOCIAL_SVGS.youtube}
        <span>YouTube</span>
      </a>`,
      `<a href="${escapeHtml(tgUrl)}" target="_blank" rel="noopener" class="social-pill-link">
        ${OFFICIAL_SOCIAL_SVGS.telegram}
        <span>Telegram</span>
      </a>`,
      `<a href="${escapeHtml(tkUrl)}" target="_blank" rel="noopener" class="social-pill-link">
        ${OFFICIAL_SOCIAL_SVGS.tiktok}
        <span>TikTok</span>
      </a>`,
      `<a href="${escapeHtml(appUrl)}" target="_blank" rel="noopener" class="social-pill-link" style="border-color:rgba(61,220,132,0.5);">
        ${OFFICIAL_SOCIAL_SVGS.android}
        <span>Android App</span>
      </a>`
    ];

    socialBox.innerHTML = links.join("");
  }
}

/* ==========================================================================
   === سیستم بارگذاری آنی (Instant Boot Cache + Skeleton Placeholders) ===
   ========================================================================== */

function renderInitialCategorySkeletons() {
  const section = document.getElementById("visual-categories-section");
  const grid = document.getElementById("visual-categories-grid");
  if (!section || !grid || grid.children.length > 0) return;
  section.style.display = "block";
  grid.innerHTML = `
    <div class="cat-skeleton-card"></div>
    <div class="cat-skeleton-card"></div>
    <div class="cat-skeleton-card"></div>
    <div class="cat-skeleton-card"></div>
  `;
}

function hydrateInstantBootCache(canRenderHomeCards) {
  try {
    const raw = localStorage.getItem(INSTANT_BOOT_CACHE_KEY);
    if (!raw) return false;
    const snap = JSON.parse(raw);
    if (!snap || typeof snap !== "object") return false;

    if (snap.publicConfig && typeof snap.publicConfig === "object") {
      coreState.publicConfig = { ...coreState.publicConfig, ...snap.publicConfig };
    }
    if (Array.isArray(snap.taxonomy) && snap.taxonomy.length > 0) {
      coreState.taxonomy = snap.taxonomy;
    }
    if (Array.isArray(snap.blogs) && snap.blogs.length > 0) {
      coreState.blogs = snap.blogs;
    }

    applyDynamicBrandingAndFooter();

    if (
      canRenderHomeCards &&
      Array.isArray(snap.taxonomy) &&
      snap.taxonomy.length > 0 &&
      Array.isArray(snap.lightProducts) &&
      snap.lightProducts.length > 0
    ) {
      coreState.allProducts = snap.lightProducts;
      renderVisualCategoryCards();
      renderHomeExclusiveShowcase();
      // پاک کردن آرایه موقت قبل از خواندن دیتابیس زنده تا هیچ تداخلی با loadCoreCatalogData پیش نیاید
      coreState.allProducts = [];
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

function saveInstantBootCache() {
  try {
    const lightProducts = (coreState.allProducts || []).map((p) => ({
      id: p.id || "",
      sku: p.sku || "",
      department: p.department || "",
      subcategory: p.subcategory || "",
      leafSub: p.leafSub || "",
      unitPrice: p.unitPrice,
      status: p.status,
      active: p.active,
      inStock: p.inStock
    }));
    const snap = {
      ts: Date.now(),
      publicConfig: coreState.publicConfig,
      taxonomy: coreState.taxonomy,
      blogs: (coreState.blogs || []).slice(0, 3),
      lightProducts
    };
    localStorage.setItem(INSTANT_BOOT_CACHE_KEY, JSON.stringify(snap));
  } catch (e) {}
}

/* ==========================================================================
   === مدیریت کد سفارش ثابت + همگام‌سازی زنده در فایربیس (Live Sync) ===
   ========================================================================== */

function setStableActiveOrderCode(code) {
  const clean = String(code || "").trim().toUpperCase();
  if (!clean) return "";
  coreState.activeOrderCode = clean;
  try {
    localStorage.setItem("paradise_active_order_code", clean);
  } catch (e) {}
  return clean;
}

function getOrCreateStableOrderCode() {
  if (coreState.activeOrderCode && /^ORD-\d+$/i.test(coreState.activeOrderCode)) {
    return setStableActiveOrderCode(coreState.activeOrderCode);
  }
  const params = new URLSearchParams(window.location.search);
  const urlCode = (params.get("order") || "").trim().toUpperCase();
  if (urlCode && /^ORD-\d+$/i.test(urlCode)) {
    return setStableActiveOrderCode(urlCode);
  }
  try {
    const savedCode = (localStorage.getItem("paradise_active_order_code") || "").trim().toUpperCase();
    if (savedCode && /^ORD-\d+$/i.test(savedCode)) {
      return setStableActiveOrderCode(savedCode);
    }
  } catch (e) {}

  return setStableActiveOrderCode(`ORD-${Math.floor(10000 + Math.random() * 90000)}`);
}

function pushActiveOrderSnapshotToFirestore() {
  const orderCode = coreState.activeOrderCode;
  if (!orderCode || !/^ORD-\d+$/i.test(orderCode) || coreState.cart.length === 0) return;

  const stats = calculateSteppedCartTotals();
  const buyerName = (document.getElementById("cart-buyer-name")?.value || "").trim() || "Wholesale Buyer";
  const buyerCountry = (document.getElementById("cart-buyer-country")?.value || "").trim() || "International";

  setDoc(
    doc(db, "orders", orderCode),
    {
      orderCode,
      buyerName,
      buyerCountry,
      currency: coreState.currency,
      currencySymbol: getCurrencySymbol(),
      eurRate: coreState.eurRate,
      totalPacks: stats.totalPacks,
      totalPieces: stats.totalPieces,
      baseSubtotal: stats.baseSubtotal,
      smallOrderFee: stats.smallOrderFee,
      totalAmount: stats.finalTotal,
      items: coreState.cart,
      updatedAtIso: new Date().toISOString()
    },
    { merge: true }
  ).catch((err) => {
    console.warn("Live order sync warning:", err.message);
  });
}

export function scheduleLiveOrderSyncToFirestore() {
  if (!coreState.activeOrderCode || coreState.cart.length === 0) return;
  clearTimeout(liveSyncTimer);
  liveSyncTimer = setTimeout(() => {
    liveSyncTimer = null;
    pushActiveOrderSnapshotToFirestore();
  }, 350);
}

/* ==========================================================================
   === سیستم انتقال هوشمند به فاکتورساز آنلاین (نام کوتاه Category-Code + Fingerprint) ===
   ========================================================================== */

function getProductMainCategoryName(item) {
  const skuUpper = String(item.sku || "").trim().toUpperCase();
  const prod = coreState.allProducts.find(
    (p) =>
      String(p.sku || "").trim().toUpperCase() === skuUpper ||
      String(p.id || "").trim().toUpperCase() === skuUpper
  );

  const deptId = item.department || prod?.department || "";
  const subcatId = item.subcategory || prod?.subcategory || "";

  if (subcatId && Array.isArray(coreState.taxonomy)) {
    const deptObj = coreState.taxonomy.find((d) => d.id === deptId);
    const inDept = (deptObj?.subcategories || []).find(
      (sc) => String(sc.id || "").toLowerCase() === String(subcatId).toLowerCase()
    );
    if (inDept) {
      return (inDept.labelEn || inDept.label || subcatId).trim();
    }

    for (const d of coreState.taxonomy) {
      const inAny = (d.subcategories || []).find(
        (sc) => String(sc.id || "").toLowerCase() === String(subcatId).toLowerCase()
      );
      if (inAny) {
        return (inAny.labelEn || inAny.label || subcatId).trim();
      }
    }
    return String(subcatId).trim();
  }

  if (deptId && Array.isArray(coreState.taxonomy)) {
    const deptObj = coreState.taxonomy.find((d) => d.id === deptId);
    if (deptObj) return (deptObj.labelEn || deptObj.label || deptId).trim();
  }

  return "Product";
}

export function buildAccountingExportPayload() {
  const stats = calculateSteppedCartTotals();
  const websiteOrderId = getOrCreateStableOrderCode();
  const currencySymbol = getCurrencySymbol();

  const rawName = (document.getElementById("cart-buyer-name")?.value || "").trim();
  const rawCountry = (document.getElementById("cart-buyer-country")?.value || "").trim();

  const items = coreState.cart.map((item) => {
    const packs = Math.max(1, parseInt(item.packs, 10) || 1);
    const pcsPerPack = Math.max(1, parseInt(item.pcsPerPack, 10) || 6);
    const totalQty = Number(packs * pcsPerPack);
    const displayBaseUnit = convertUsdToDisplay(Number(item.unitPrice) || 0);
    const effectiveUnitPrice = Number((displayBaseUnit + stats.surchargePerPc).toFixed(2));
    const mainCategory = getProductMainCategoryName(item);
    const itemName = `${mainCategory}-${item.sku}`;

    return {
      name: itemName,
      price: effectiveUnitPrice,
      qty: totalQty,
      weight: 0
    };
  });

  return {
    websiteOrderId,
    invoiceType: "wholesale",
    fromWebsite: true,
    currency: currencySymbol,
    customerName: rawName === "Wholesale Buyer" ? "" : rawName,
    customerPhone: "",
    customerCountry: rawCountry === "International" ? "" : rawCountry,
    customerAddress: "",
    shippingCost: 0,
    items
  };
}

export function computeOrderFingerprint(payload) {
  const normalized = {
    currency: payload.currency,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    customerCountry: payload.customerCountry,
    customerAddress: payload.customerAddress,
    shippingCost: Number(payload.shippingCost) || 0,
    items: (payload.items || []).map((it) => ({
      name: it.name,
      price: Number(it.price) || 0,
      qty: Number(it.qty) || 0,
      weight: Number(it.weight) || 0
    }))
  };
  return JSON.stringify(normalized);
}

function buildAccountingTargetUrl(orderPayload) {
  const jsonStr = JSON.stringify(orderPayload);
  const bytes = new TextEncoder().encode(jsonStr);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const encoded = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${INVOICE_PANEL_BASE_URL}#import=${encoded}`;
}

export function renderAdminInvoiceExportBox() {
  const box = document.getElementById("admin-invoice-export-box");
  if (!box) return;

  if (!coreState.isAdminLoggedIn || coreState.cart.length === 0) {
    box.style.display = "none";
    box.innerHTML = "";
    return;
  }

  box.style.display = "block";
  const payload = buildAccountingExportPayload();
  const currentFingerprint = computeOrderFingerprint(payload);
  const lastFp = String(coreState.lastExportedFingerprint || "");

  if (!lastFp) {
    box.innerHTML = `
      <button
        type="button"
        data-export-invoice="send"
        style="width:100%; padding:11px 12px; border-radius:11px; border:none; background:linear-gradient(135deg, #059669 0%, #047857 100%); color:#ffffff; font-size:0.84rem; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 4px 12px rgba(5,150,105,0.28);"
      >
        <span>📤 ارسال به سیستم فاکتورساز</span>
      </button>
    `;
  } else if (lastFp === currentFingerprint) {
    box.innerHTML = `
      <div style="background:#ecfdf5; border:1px solid #6ee7b7; border-radius:10px; padding:9px 11px; display:flex; flex-direction:column; gap:7px;">
        <div style="font-size:0.78rem; font-weight:800; color:#065f46;">
          ✅ ارسال شده به فاکتورساز (بدون تغییر)
        </div>
        <button
          type="button"
          data-export-invoice="reopen"
          style="width:100%; padding:7px 10px; border-radius:8px; border:1px solid #34d399; background:#ffffff; color:#047857; font-size:0.75rem; font-weight:800; cursor:pointer;"
        >
          باز کردن مجدد در فاکتورساز
        </button>
      </div>
    `;
  } else {
    box.innerHTML = `
      <div style="background:#fff7ed; border:1px solid #fdba74; border-radius:10px; padding:9px 11px; display:flex; flex-direction:column; gap:8px;">
        <div style="font-size:0.77rem; font-weight:800; color:#c2410c;">
          ⚠️ سفارش توسط مشتری تغییر کرده و نیاز به آپدیت دارد
        </div>
        <button
          type="button"
          data-export-invoice="update"
          style="width:100%; padding:10px 12px; border-radius:9px; border:none; background:linear-gradient(135deg, #f97316 0%, #ea580c 100%); color:#ffffff; font-size:0.82rem; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(234,88,12,0.28);"
        >
          🔄 آپدیت فاکتور در سیستم حسابداری
        </button>
      </div>
    `;
  }
}

export function handleAdminExportToAccounting() {
  if (!coreState.isAdminLoggedIn || coreState.cart.length === 0) return;

  const orderPayload = buildAccountingExportPayload();
  const currentFingerprint = computeOrderFingerprint(orderPayload);
  const targetUrl = buildAccountingTargetUrl(orderPayload);

  window.open(targetUrl, "_blank");

  const exportedAtIso = new Date().toISOString();
  coreState.lastExportedFingerprint = currentFingerprint;
  coreState.lastExportedAt = exportedAtIso;
  renderAdminInvoiceExportBox();

  const stats = calculateSteppedCartTotals();
  const orderCode = orderPayload.websiteOrderId;
  setDoc(
    doc(db, "orders", orderCode),
    {
      orderCode,
      buyerName: orderPayload.customerName || "Wholesale Buyer",
      buyerCountry: orderPayload.customerCountry || "International",
      currency: coreState.currency,
      currencySymbol: orderPayload.currency,
      eurRate: coreState.eurRate,
      totalPacks: stats.totalPacks,
      totalPieces: stats.totalPieces,
      baseSubtotal: stats.baseSubtotal,
      smallOrderFee: stats.smallOrderFee,
      totalAmount: stats.finalTotal,
      items: coreState.cart,
      lastExportedFingerprint: currentFingerprint,
      lastExportedAt: exportedAtIso,
      updatedAtIso: exportedAtIso
    },
    { merge: true }
  ).catch((err) => {
    console.warn("Background fingerprint save warning:", err.message);
  });
}

export function buildVisualOrderCartUrl(orderCode) {
  const url = new URL(getBaseRootUrl());
  url.searchParams.set("order", orderCode);
  if (coreState.lang && coreState.lang !== "en") {
    url.searchParams.set("lang", coreState.lang);
  }
  return url.toString();
}

export async function submitCartOrderToWhatsApp() {
  if (coreState.cart.length === 0) {
    showCatalogToast(t("emptyCartMsg"));
    return;
  }

  const submitBtn = document.getElementById("btn-submit-whatsapp-order");
  const stats = calculateSteppedCartTotals();
  const buyerName = (document.getElementById("cart-buyer-name")?.value || "").trim() || "Wholesale Buyer";
  const buyerCountry = (document.getElementById("cart-buyer-country")?.value || "").trim() || "International";

  const orderCode = getOrCreateStableOrderCode();
  const nowIso = new Date().toISOString();

  fireGoogleAdsOrderConversion(stats.finalTotal, orderCode);

  const orderPayload = {
    orderCode,
    buyerName,
    buyerCountry,
    buyerPhone: "",
    currency: coreState.currency,
    currencySymbol: getCurrencySymbol(),
    eurRate: coreState.eurRate,
    totalPacks: stats.totalPacks,
    totalPieces: stats.totalPieces,
    baseSubtotal: stats.baseSubtotal,
    smallOrderFee: stats.smallOrderFee,
    totalAmount: stats.finalTotal,
    status: "pending_whatsapp",
    items: coreState.cart,
    updatedAtIso: nowIso,
    createdAt: serverTimestamp()
  };

  if (submitBtn) submitBtn.disabled = true;

  try {
    await Promise.race([
      setDoc(doc(db, "orders", orderCode), orderPayload, { merge: true }),
      new Promise((resolve) => setTimeout(resolve, 4000))
    ]);
  } catch (e) {
    console.warn("Order save fallback:", e.message);
  }

  if (submitBtn) submitBtn.disabled = false;

  const visualCartLink = buildVisualOrderCartUrl(orderCode);

  const waTemplates = {
    en: [
      `🛍️ *WHOLESALE ORDER (${orderCode})*`,
      `👤 *Customer:* ${buyerName} (${buyerCountry})`,
      ``,
      `🔗 *Tap link below to view & edit my visual order cart (photos, quantities & total):*`,
      visualCartLink,
      ``,
      `✈️ Please calculate the shipping / air cargo cost to *${buyerCountry}* and send me the final total invoice.`
    ],
    it: [
      `🛍️ *ORDINE INGROSSO (${orderCode})*`,
      `👤 *Cliente:* ${buyerName} (${buyerCountry})`,
      ``,
      `🔗 *Tocca il link qui sotto per vedere e modificare il mio carrello visivo (foto, quantità e totale):*`,
      visualCartLink,
      ``,
      `✈️ Per favore calcolate il costo di spedizione / cargo per *${buyerCountry}* e inviatemi la fattura finale.`
    ],
    es: [
      `🛍️ *PEDIDO MAYORISTA (${orderCode})*`,
      `👤 *Cliente:* ${buyerName} (${buyerCountry})`,
      ``,
      `🔗 *Toque el enlace de abajo para ver y editar mi carrito visual (fotos, cantidades y total):*`,
      visualCartLink,
      ``,
      `✈️ Por favor calcule el costo de envío / carga aérea a *${buyerCountry}* y envíeme la factura total final.`
    ]
  };

  const msgLines = waTemplates[coreState.lang] || waTemplates.en;
  const { cleanDigits } = getUnifiedWhatsAppInfo();
  const waUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(msgLines.join("\n"))}`;

  window.location.href = waUrl;
}

export async function loadSharedOrderFromUrlIfPresent(
  capturedOrderCode = "",
  capturedItemsParam = "",
  capturedCurParam = ""
) {
  const params = new URLSearchParams(window.location.search);
  const orderCode = (capturedOrderCode || params.get("order") || "").trim().toUpperCase();
  const compactItemsParam = (capturedItemsParam || params.get("items") || "").trim();
  const urlCur = (capturedCurParam || params.get("cur") || "").trim().toUpperCase();

  if (!orderCode && !compactItemsParam) return;

  if (orderCode) {
    setStableActiveOrderCode(orderCode);
  }

  let loadedItems = [];
  let loadedBuyerName = "";
  let loadedBuyerCountry = "";
  let orderCurrency = urlCur === "EUR" || urlCur === "USD" ? urlCur : "";
  let orderEurRate = 0;

  if (orderCode) {
    try {
      const snap = await getDoc(doc(db, "orders", orderCode));
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.items) && data.items.length > 0) {
          loadedItems = data.items;
        }
        loadedBuyerName = data.buyerName || "";
        loadedBuyerCountry = data.buyerCountry || "";
        coreState.lastExportedFingerprint = data.lastExportedFingerprint || "";
        coreState.lastExportedAt = data.lastExportedAt || "";

        if (data.currency === "EUR" || data.currency === "USD") {
          orderCurrency = data.currency;
        } else if (data.currencySymbol === "€") {
          orderCurrency = "EUR";
        } else if (data.currencySymbol === "$") {
          orderCurrency = "USD";
        }
        if (Number(data.eurRate) > 0.5 && Number(data.eurRate) < 1.8) {
          orderEurRate = Number(data.eurRate);
        }
      }
    } catch (e) {
      console.warn("Firestore order lookup fallback:", e.message);
    }
  }

  if (orderCurrency) {
    coreState.currency = orderCurrency;
    coreState.currencyLockedByOrder = true;
    if (orderEurRate > 0) coreState.eurRate = orderEurRate;
    injectAndSyncHeaderCurrencyToggle();
  }

  if (loadedItems.length === 0 && compactItemsParam) {
    const pairs = compactItemsParam.split(",").map((s) => s.trim()).filter(Boolean);
    pairs.forEach((pair) => {
      const sepIdx = pair.lastIndexOf(":");
      const rawSku = sepIdx > -1 ? pair.slice(0, sepIdx) : pair;
      const rawPacks = sepIdx > -1 ? pair.slice(sepIdx + 1) : "1";
      const sku = decodeURIComponent(rawSku || "").trim();
      const packs = Math.max(1, parseInt(rawPacks, 10) || 1);

      const prod = coreState.allProducts.find(
        (p) =>
          String(p.sku || "").trim().toUpperCase() === sku.toUpperCase() ||
          String(p.id || "").trim().toUpperCase() === sku.toUpperCase()
      );

      if (prod) {
        loadedItems.push({
          sku: prod.sku || prod.id,
          title: getLocalizedProductTitle(prod),
          department: prod.department || "",
          subcategory: prod.subcategory || "",
          unitPrice: Number(prod.unitPrice) || 5,
          pcsPerPack: Math.max(1, parseInt(prod.pcsPerPack, 10) || 6),
          sizeRange: prod.sizeRange || "S-XXL",
          thumbUrl: prod.thumbUrl || prod.imageUrl || "",
          packs
        });
      }
    });
  }

  if (loadedItems.length > 0) {
    coreState.cart = loadedItems;
    saveCartToStorage(false);

    const nameInp = document.getElementById("cart-buyer-name");
    const countryInp = document.getElementById("cart-buyer-country");
    if (nameInp && loadedBuyerName && loadedBuyerName !== "Wholesale Buyer") {
      nameInp.value = loadedBuyerName;
    }
    if (countryInp && loadedBuyerCountry && loadedBuyerCountry !== "International") {
      countryInp.value = loadedBuyerCountry;
    }

    renderEntireCatalogView(false);
    renderSteppedCartUI();
    document.getElementById("cart-drawer-backdrop")?.classList.add("open");
    showCatalogToast(`🛒 ${orderCode || "Order"} (${loadedItems.length} items)`);
  }
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

  const restoreAddBtn = () => {
    const addBtn = document.getElementById("btn-lightbox-add-pack");
    if (addBtn) addBtn.style.display = "flex";
  };
  document.getElementById("btn-close-lightbox")?.addEventListener("click", restoreAddBtn);
  document.getElementById("hd-lightbox-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "hd-lightbox-modal") restoreAddBtn();
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
      saveCartToStorage(true);
      renderSteppedCartUI();
      return;
    }

    const rmBtn = e.target.closest("[data-cart-remove]");
    if (rmBtn) {
      const idx = parseInt(rmBtn.getAttribute("data-cart-remove"), 10);
      coreState.cart.splice(idx, 1);
      saveCartToStorage(true);
      renderSteppedCartUI();
      return;
    }

    const clickedImg = e.target.closest("img");
    if (clickedImg && clickedImg.alt) {
      restoreAddBtn();
      openProductLightbox(clickedImg.alt, false);
    }
  });

  const onBuyerFieldChange = () => {
    renderAdminInvoiceExportBox();
    scheduleLiveOrderSyncToFirestore();
  };
  document.getElementById("cart-buyer-name")?.addEventListener("input", onBuyerFieldChange);
  document.getElementById("cart-buyer-country")?.addEventListener("input", onBuyerFieldChange);

  window.addEventListener("pagehide", () => {
    if (liveSyncTimer) {
      clearTimeout(liveSyncTimer);
      liveSyncTimer = null;
      pushActiveOrderSnapshotToFirestore();
    }
  });

  document.getElementById("admin-invoice-export-box")?.addEventListener("click", (e) => {
    const exportBtn = e.target.closest("[data-export-invoice]");
    if (!exportBtn) return;
    handleAdminExportToAccounting();
  });

  document.getElementById("btn-submit-whatsapp-order")?.addEventListener("click", submitCartOrderToWhatsApp);
  document.getElementById("floating-whatsapp-btn")?.addEventListener("click", fireDirectWhatsappClickEvent);
}

export function renderEntireCatalogView(triggerNudge = false) {
  updateBackButtonVisibility();
  renderVisualCategoryCards();
  renderHomeExclusiveShowcase();
  renderStickyGlassPills(triggerNudge);
  renderDynamicPriceFilterBar();
  renderProductsCatalogGrid();
  applyDynamicBrandingAndFooter();
}

export async function initParadiseCatalogCore() {
  const initialParams = new URLSearchParams(window.location.search);
  const initialOrderCode = (initialParams.get("order") || "").trim();
  const initialItemsParam = (initialParams.get("items") || "").trim();
  const initialCurParam = (initialParams.get("cur") || "").trim().toUpperCase();

  // ۱. اجرای آنی استایل هدر بزرگ، نام تمیز برند و دکمه ارز در میلی‌ثانیه اول
  injectResponsiveHeaderAndStepperStyles();
  injectAndSyncHeaderCurrencyToggle();

  if (!initialOrderCode) {
    try {
      const savedOrder = (localStorage.getItem("paradise_active_order_code") || "").trim().toUpperCase();
      if (savedOrder && /^ORD-\d+$/i.test(savedOrder) && coreState.cart.length > 0) {
        coreState.activeOrderCode = savedOrder;
      }
    } catch (e) {}
  }

  window._paradiseRefreshCurrencyUI = () => {
    renderDynamicPriceFilterBar();
    renderProductsCatalogGrid();
    if (coreState.lightboxProduct) renderLightboxStageContent();
    renderSteppedCartUI();
    scheduleLiveOrderSyncToFirestore();
  };

  onAuthStateChanged(auth, (user) => {
    coreState.isAdminLoggedIn = Boolean(user);
    renderAdminInvoiceExportBox();
  });

  applyLocalizedStaticTexts();
  applyDynamicBrandingAndFooter();
  bindSmartHeaderAndGlassEvents();
  bindPriceFilterEvents();
  bindProductGridAndLightboxEvents();
  bindCartAndWhatsappEvents();

  // ۲. نمایش آنی منوها از کش محلی (۰ میلی‌ثانیه) یا اسکلتون شیشه‌ای در اولین بازدید (هرگز صفحه خالی نمی‌ماند)
  const isPlainHomeLanding =
    !initialOrderCode &&
    !initialItemsParam &&
    !initialParams.get("dept") &&
    !initialParams.get("cat") &&
    !initialParams.get("product") &&
    !initialParams.get("search");

  const hydratedInstant = hydrateInstantBootCache(isPlainHomeLanding);
  if (!hydratedInstant && !initialParams.get("product")) {
    renderInitialCategorySkeletons();
  }
  renderSteppedCartUI();

  // ۳. دریافت غیرمسدودکننده نرخ ارز و موقعیت مکانی در پس‌زمینه (بدون معطل کردن نمایش کاتالوگ)
  initLiveCurrencyAndRegion(Boolean(initialOrderCode || initialItemsParam)).then(() => {
    if (typeof window._paradiseRefreshCurrencyUI === "function") {
      window._paradiseRefreshCurrencyUI();
    }
  });

  // ۴. دریافت داده‌های زنده فایربیس و ذخیره در کش آنی برای بازدیدهای بعدی
  await loadCoreCatalogData();
  saveInstantBootCache();

  resolveCurrentRouteFromUrl();
  applyLocalizedStaticTexts();
  initGoogleAdsAndAnalyticsTag();
  syncBrowserHistoryState();
  renderEntireCatalogView(true);
  renderSteppedCartUI();

  await loadSharedOrderFromUrlIfPresent(initialOrderCode, initialItemsParam, initialCurParam);

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
