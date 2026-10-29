/**
 * ============================================================================
 * PARADISE WHOLESALE CLOTHING (Paradise Turkey Wholesale)
 * Domain: https://paradisewholesaler.com
 * File: core.js — Core B2B Engine, Firebase v10, Dual-Title Shield, Cart & SEO
 * ============================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

/* ==========================================================================
   1. CORE CONSTANTS & FIREBASE INITIALIZATION
   ========================================================================== */
export const firebaseConfig = {
  apiKey: "AIzaSyCQyBszaUZ4FJX2OJw4YrcLMwUbk2BtxL4",
  authDomain: "paradise-wholesale.firebaseapp.com",
  projectId: "paradise-wholesale",
  storageBucket: "paradise-wholesale.firebasestorage.app",
  messagingSenderId: "516659166400",
  appId: "1:516659166400:web:9ac24230ebe5676cfe0125"
};

export const SUPER_ADMIN_EMAIL = "Paradise.men2019@gmail.com";
export const SITE_DOMAIN = "https://paradisewholesaler.com";

export const DEFAULT_PUBLIC_CONFIG = {
  whatsappRaw: "+905459099395",
  whatsappDisplay: "+90 545 909 93 95",
  instagramUrl: "https://instagram.com/paradisewholesaler",
  telegramUrl: "https://t.me/paradisewholesaler",
  tiktokUrl: "https://tiktok.com/@paradisewholesaler",
  facebookUrl: "https://facebook.com/paradisewholesaler",
  ga4MeasurementId: "",
  googleAdsId: "",
  googleAdsConversionLabel: "",
  currencySymbol: "€",
  currencyCode: "EUR",
  bestRateThreshold: 25
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const STORAGE_KEYS = {
  LANG: "paradise_b2b_lang",
  CART: "paradise_b2b_cart_v1",
  CONFIG: "paradise_public_config_v1",
  BUYER: "paradise_b2b_buyer_info"
};

/* ==========================================================================
   2. 5-DEPARTMENT B2B TAXONOMY & 3-LANGUAGE DICTIONARY (EN, IT, ES)
   ========================================================================== */
export const DEPARTMENTS_TAXONOMY = [
  {
    id: "men",
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
    label: {
      en: "Men",
      it: "Uomo",
      es: "Hombre"
    },
    subcategories: [
      { id: "men-tshirts", en: "T-Shirts", it: "T-Shirt", es: "Camisetas" },
      { id: "men-shirts", en: "Shirts", it: "Camicie", es: "Camisas" },
      { id: "men-knitwear", en: "Knitwear", it: "Maglieria", es: "Punto y Jerséis" },
      { id: "men-sweatshirts-hoodies", en: "Sweatshirts & Hoodies", it: "Felpe e Hoodie", es: "Sudaderas y Hoodies" },
      { id: "men-tracksuits", en: "Tracksuits", it: "Tute Sportive", es: "Chándales" },
      { id: "men-jeans", en: "Jeans", it: "Jeans", es: "Vaqueros" },
      { id: "men-trousers", en: "Trousers", it: "Pantaloni", es: "Pantalones" },
      { id: "men-jackets-coats", en: "Jackets & Coats", it: "Giacche e Cappotti", es: "Chaquetas y Abrigos" },
      { id: "men-suits-blazers", en: "Suits & Blazers", it: "Abiti e Blazer", es: "Trajes y Blazers" }
    ]
  },
  {
    id: "women",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    label: {
      en: "Women",
      it: "Donna",
      es: "Mujer"
    },
    subcategories: [
      { id: "women-tops-tshirts", en: "Tops & T-Shirts", it: "Top e T-Shirt", es: "Tops y Camisetas" },
      { id: "women-blouses-shirts", en: "Blouses & Shirts", it: "Bluse e Camicie", es: "Blusas y Camisas" },
      { id: "women-knitwear", en: "Knitwear", it: "Maglieria", es: "Punto" },
      { id: "women-sweatshirts-hoodies", en: "Sweatshirts & Hoodies", it: "Felpe e Hoodie", es: "Sudaderas y Hoodies" },
      { id: "women-dresses-jumpsuits", en: "Dresses & Jumpsuits", it: "Abiti e Tute Eleganti", es: "Vestidos y Monos" },
      { id: "women-skirts", en: "Skirts", it: "Gonne", es: "Faldas" },
      { id: "women-jeans-trousers", en: "Jeans & Trousers", it: "Jeans e Pantaloni", es: "Vaqueros y Pantalones" },
      { id: "women-tracksuits-loungewear", en: "Tracksuits & Loungewear", it: "Tute e Loungewear", es: "Chándales y Loungewear" },
      { id: "women-jackets-coats", en: "Jackets & Coats", it: "Giacche e Cappotti", es: "Chaquetas y Abrigos" },
      { id: "women-suits-coord", en: "Suits & Co-ord Sets", it: "Tailleur e Completi", es: "Trajes y Conjuntos" }
    ]
  },
  {
    id: "kids-baby",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80",
    label: {
      en: "Kids & Baby",
      it: "Bambini e Neonati",
      es: "Niños y Bebés"
    },
    subcategories: [
      { id: "kids-boys", en: "Boys Clothing", it: "Abbigliamento Bambino", es: "Ropa de Niño" },
      { id: "kids-girls", en: "Girls Clothing", it: "Abbigliamento Bambina", es: "Ropa de Niña" },
      { id: "kids-baby-sets", en: "Baby Sets", it: "Completi Neonato", es: "Conjuntos de Bebé" }
    ]
  },
  {
    id: "shoes",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    label: {
      en: "Shoes",
      it: "Scarpe",
      es: "Calzado"
    },
    subcategories: [
      { id: "shoes-men", en: "Men's Shoes", it: "Scarpe Uomo", es: "Calzado Hombre" },
      { id: "shoes-women", en: "Women's Shoes", it: "Scarpe Donna", es: "Calzado Mujer" }
    ]
  },
  {
    id: "bags-accessories",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    label: {
      en: "Bags & Accessories",
      it: "Borse e Accessori",
      es: "Bolsos y Accesorios"
    },
    subcategories: [
      { id: "bags-main", en: "Bags", it: "Borse", es: "Bolsos" },
      { id: "accessories-main", en: "Accessories", it: "Accessori", es: "Accesorios" }
    ]
  }
];

export const I18N_DICTIONARY = {
  en: {
    topBarBadge: "ISTANBUL FACTORY DIRECT",
    topBarMessage: "Flexible MOQ from 1 Pack • Best Wholesale Tier Rate for 25+ pcs • Express DHL/UPS Worldwide",
    searchPlaceholder: "Search catalog by SKU, style, fabric or brand tag...",
    searchEmpty: "No matching wholesale items found. Ask our Istanbul team on WhatsApp for full catalog.",
    allDepartments: "All Collections",
    allSubcategories: "All Styles",
    trust1Title: "Flexible MOQ (From 1 Pack)",
    trust1Sub: "Test quality with 1 serie pack",
    trust2Title: "Best Tier Price (25+ Pcs)",
    trust2Sub: "Maximum margin for boutiques",
    trust3Title: "Direct Istanbul Supply",
    trust3Sub: "100% Turkish craftsmanship",
    trust4Title: "Express Global Air Cargo",
    trust4Sub: "3–5 days to Italy, Spain, UK, USA",
    unitPriceLabel: "Unit Price",
    perPiece: "/ pc",
    packContains: "Serie Pack",
    pcsLabel: "pcs",
    packTotalLabel: "Pack Total",
    madeInTurkey: "Made in Turkey",
    addPackToCart: "Add 1 Pack",
    addedToCart: "Pack Added ✓",
    askOnWhatsApp: "Ask on WhatsApp",
    cartTitle: "Wholesale Order Bag",
    cartEmpty: "Your wholesale bag is currently empty. Add serie packs from the catalog.",
    tierProgressNeed: "Add {remaining} more pcs to unlock Best Wholesale Bulk Priority (25+ pcs)!",
    tierProgressUnlocked: "★ 25+ Pcs Bulk Wholesale Priority Unlocked! Maximum B2B Margin Applied.",
    totalPacks: "Total Serie Packs",
    totalPieces: "Total Pieces (Units)",
    estimatedSubtotal: "Estimated Wholesale Total",
    buyerNamePlaceholder: "Your Name / Boutique Name",
    buyerCountryPlaceholder: "Country & City (e.g. Milan, Italy)",
    buyerPhonePlaceholder: "WhatsApp Number (with country code)",
    sendOrderWhatsApp: "Send Order on WhatsApp",
    sendingOrder: "Generating B2B Order Link...",
    floatingWhatsAppText: "Wholesale Desk Online",
    zoomHint: "HD Fabric & Stitching Inspection"
  },
  it: {
    topBarBadge: "DIRETTO DA ISTANBUL",
    topBarMessage: "MOQ Flessibile da 1 Pacco • Miglior Prezzo Ingrosso per 25+ pezzi • Spedizione Express DHL/UPS",
    searchPlaceholder: "Cerca per codice SKU, modello, tessuto o brand...",
    searchEmpty: "Nessun articolo trovato. Contatta il nostro team su WhatsApp per il catalogo VIP completo.",
    allDepartments: "Tutti i Reparti",
    allSubcategories: "Tutti i Modelli",
    trust1Title: "MOQ Flessibile (Da 1 Pacco)",
    trust1Sub: "Testa la qualità con 1 serie",
    trust2Title: "Miglior Prezzo (25+ Pezzi)",
    trust2Sub: "Massimo margine per boutique",
    trust3Title: "Fornitura Diretta Istanbul",
    trust3Sub: "100% Qualità manifattura turca",
    trust4Title: "Corriere Espresso Globale",
    trust4Sub: "Consegna rapida in tutta Italia",
    unitPriceLabel: "Prezzo Unità",
    perPiece: "/ pz",
    packContains: "Pacco Serie",
    pcsLabel: "pz",
    packTotalLabel: "Totale Pacco",
    madeInTurkey: "Made in Turkey",
    addPackToCart: "Aggiungi 1 Pacco",
    addedToCart: "Aggiunto ✓",
    askOnWhatsApp: "Chiedi su WhatsApp",
    cartTitle: "Carrello Ingrosso B2B",
    cartEmpty: "Il tuo carrello B2B è vuoto. Aggiungi pacchi serie dal catalogo.",
    tierProgressNeed: "Aggiungi altri {remaining} pezzi per sbloccare la tariffa VIP Ingrosso (25+ pz)!",
    tierProgressUnlocked: "★ Tariffa Prioritaria 25+ Pezzi Sbloccata! Massimo sconto B2B attivo.",
    totalPacks: "Totale Pacchi Serie",
    totalPieces: "Totale Pezzi (Unità)",
    estimatedSubtotal: "Totale Stimato Ingrosso",
    buyerNamePlaceholder: "Tuo Nome / Nome Boutique",
    buyerCountryPlaceholder: "Città e Paese (es. Milano, Italia)",
    buyerPhonePlaceholder: "Numero WhatsApp",
    sendOrderWhatsApp: "Invia Ordine su WhatsApp",
    sendingOrder: "Creazione Ordine B2B...",
    floatingWhatsAppText: "Ufficio Ingrosso Online",
    zoomHint: "Ispezione HD Tessuto e Cuciture"
  },
  es: {
    topBarBadge: "DIRECTO DE FÁBRICA ESTAMBUL",
    topBarMessage: "MOQ Flexible desde 1 Paquete • Mejor Precio Mayorista (+25 uds) • Envío Express DHL/UPS",
    searchPlaceholder: "Buscar por código SKU, estilo, tejido o marca...",
    searchEmpty: "No se encontraron artículos. Escríbenos por WhatsApp para el catálogo VIP completo.",
    allDepartments: "Todos los Departamentos",
    allSubcategories: "Todos los Estilos",
    trust1Title: "MOQ Flexible (Desde 1 Pack)",
    trust1Sub: "Prueba calidad desde 1 serie",
    trust2Title: "Mejor Tarifa (+25 Unidades)",
    trust2Sub: "Máximo margen para tiendas",
    trust3Title: "Suministro Directo Estambul",
    trust3Sub: "100% Confección turca premium",
    trust4Title: "Envío Aéreo Express",
    trust4Sub: "3–5 días a España y Latinoamérica",
    unitPriceLabel: "Precio Unidad",
    perPiece: "/ ud",
    packContains: "Pack Serie",
    pcsLabel: "uds",
    packTotalLabel: "Total Pack",
    madeInTurkey: "Hecho en Turquía",
    addPackToCart: "Añadir 1 Pack",
    addedToCart: "Pack Añadido ✓",
    askOnWhatsApp: "Consultar WhatsApp",
    cartTitle: "Pedido Mayorista B2B",
    cartEmpty: "Tu bolsa mayorista está vacía. Añade paquetes serie del catálogo.",
    tierProgressNeed: "¡Añade {remaining} uds más para desbloquear el Mejor Precio Mayorista (+25 uds)!",
    tierProgressUnlocked: "★ ¡Tarifa Mayorista VIP (+25 uds) Desbloqueada! Prioridad B2B activa.",
    totalPacks: "Total Paquetes Serie",
    totalPieces: "Total Unidades (Piezas)",
    estimatedSubtotal: "Total Mayorista Estimado",
    buyerNamePlaceholder: "Tu Nombre / Nombre de Tienda",
    buyerCountryPlaceholder: "Ciudad y País (ej. Madrid, España)",
    buyerPhonePlaceholder: "Número de WhatsApp",
    sendOrderWhatsApp: "Enviar Pedido por WhatsApp",
    sendingOrder: "Generando Enlace de Pedido...",
    floatingWhatsAppText: "Ventas Mayoristas Online",
    zoomHint: "Inspección HD de Tejido y Costuras"
  }
};

/* ==========================================================================
   3. APPLICATION STATE & HELPERS
   ========================================================================== */
const state = {
  lang: localStorage.getItem(STORAGE_KEYS.LANG) || "en",
  config: { ...DEFAULT_PUBLIC_CONFIG },
  cart: [],
  catalogCache: [],
  isSearchOpen: false,
  gtagInjected: false
};

// Validate language
if (!["en", "it", "es"].includes(state.lang)) {
  state.lang = "en";
}

// Load cached public config immediately for zero-lag startup
try {
  const cachedCfg = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (cachedCfg) {
    state.config = { ...DEFAULT_PUBLIC_CONFIG, ...JSON.parse(cachedCfg) };
  }
} catch (err) {
  console.warn("Config cache read error:", err);
}

// Load saved cart
try {
  const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
  if (savedCart) {
    state.cart = JSON.parse(savedCart) || [];
  }
} catch (err) {
  state.cart = [];
}

export function t(key, replacements = {}) {
  const dict = I18N_DICTIONARY[state.lang] || I18N_DICTIONARY.en;
  let str = dict[key] || I18N_DICTIONARY.en[key] || key;
  Object.keys(replacements).forEach((k) => {
    str = str.replace(`{${k}}`, replacements[k]);
  });
  return str;
}

export function getLocalizedField(fieldObjOrStr, fallback = "") {
  if (!fieldObjOrStr) return fallback;
  if (typeof fieldObjOrStr === "string") return fieldObjOrStr;
  if (typeof fieldObjOrStr === "object") {
    return (
      fieldObjOrStr[state.lang] ||
      fieldObjOrStr.en ||
      fieldObjOrStr.it ||
      fieldObjOrStr.es ||
      fallback
    );
  }
  return fallback;
}

export function formatPrice(amount) {
  const num = Number(amount) || 0;
  const symbol = state.config.currencySymbol || "€";
  return `${symbol}${num.toFixed(2)}`;
}

export function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """)
    .replace(/'/g, "'");
}

/* ==========================================================================
   4. DYNAMIC PUBLIC CONFIG & GOOGLE ADS / GA4 CONVERSION ENGINE
   ========================================================================== */
export async function syncPublicConfig() {
  try {
    const ref = doc(db, "settings", "public_config");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const remoteData = snap.data();
      state.config = { ...DEFAULT_PUBLIC_CONFIG, ...remoteData };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(state.config));
    }
  } catch (err) {
    console.warn("Using cached/default public_config:", err.message);
  }
  applyPublicConfigToDOM();
  injectGoogleTags();
  return state.config;
}

export function applyPublicConfigToDOM() {
  const { whatsappDisplay, instagramUrl, telegramUrl, tiktokUrl, facebookUrl } = state.config;

  document.querySelectorAll("[data-config-whatsapp-display]").forEach((el) => {
    el.textContent = whatsappDisplay;
  });

  const socialMap = {
    "[data-config-instagram]": instagramUrl,
    "[data-config-telegram]": telegramUrl,
    "[data-config-tiktok]": tiktokUrl,
    "[data-config-facebook]": facebookUrl
  };

  Object.entries(socialMap).forEach(([selector, url]) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (url) {
        el.setAttribute("href", url);
        el.style.display = "";
      }
    });
  });
}

export function injectGoogleTags() {
  if (state.gtagInjected) return;
  const { ga4MeasurementId, googleAdsId } = state.config;
  const primaryTagId = (ga4MeasurementId || googleAdsId || "").trim();

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  if (!primaryTagId) return;

  state.gtagInjected = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryTagId)}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  if (ga4MeasurementId) {
    window.gtag("config", ga4MeasurementId.trim(), { send_page_view: true });
  }
  if (googleAdsId) {
    window.gtag("config", googleAdsId.trim());
  }
}

/**
 * Global WhatsApp Conversion Engine
 * Every WhatsApp click across the entire site routes through this function.
 */
export function openWhatsApp(customMessage = "", sourceLabel = "general_whatsapp_cta", estimatedValue = 0) {
  const rawPhone = (state.config.whatsappRaw || DEFAULT_PUBLIC_CONFIG.whatsappRaw).replace(/[^0-9]/g, "");
  const defaultGreeting = {
    en: "Hello Paradise Wholesale Istanbul! I would like to inquire about wholesale packs and catalog prices.",
    it: "Ciao Paradise Wholesale Istanbul! Vorrei informazioni sui pacchi serie all'ingrosso e sul catalogo.",
    es: "¡Hola Paradise Wholesale Estambul! Me gustaría consultar sobre paquetes mayoristas y precios."
  }[state.lang];

  const finalMessage = (customMessage || defaultGreeting).trim();
  const waUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(finalMessage)}`;

  // 1. Fire GA4 Custom Lead Event
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", "whatsapp_lead", {
        event_category: "B2B_Wholesale_Lead",
        event_label: sourceLabel,
        language: state.lang,
        value: Number(estimatedValue) || 1,
        currency: state.config.currencyCode || "EUR"
      });

      // 2. Fire Google Ads Conversion Event if configured
      const adsId = (state.config.googleAdsId || "").trim();
      const convLabel = (state.config.googleAdsConversionLabel || "").trim();
      if (adsId && convLabel) {
        window.gtag("event", "conversion", {
          send_to: `${adsId}/${convLabel}`,
          value: Number(estimatedValue) || 1.0,
          currency: state.config.currencyCode || "EUR"
        });
      }
    } catch (e) {
      console.warn("Tracking dispatch warning:", e);
    }
  }

  // 3. Open WhatsApp immediately
  window.open(waUrl, "_blank", "noopener,noreferrer");
}

/* ==========================================================================
   5. DUAL-TITLE BRAND PROTECTION & META ROBOTS SHIELD
   ========================================================================== */

/**
 * Toggles <meta name="robots"> between "noindex, nofollow" (when brand search is open)
 * and "index, follow" (normal browsing) to protect Google Ads & SEO compliance.
 */
export function setSearchRobotsShield(isSearchActive) {
  state.isSearchOpen = Boolean(isSearchActive);
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement("meta");
    metaRobots.setAttribute("name", "robots");
    document.head.appendChild(metaRobots);
  }
  metaRobots.setAttribute("content", isSearchActive ? "noindex, nofollow" : "index, follow");
}

/**
 * Dual-Title Product Card Renderer
 * - Normal Catalog Mode (isSearchResult === false): Displays ONLY `publicTitle` in card & alt tag.
 * - Live Search Mode (isSearchResult === true): Displays `brandTitle` to the customer.
 */
export function renderProductCard(product, isSearchResult = false) {
  if (!product) return "";

  const id = escapeHtml(product.id || product.sku || "item");
  const sku = escapeHtml(product.sku || "PRD-TR");
  const publicTitle = getLocalizedField(product.publicTitle, product.title || "Premium Turkish Wholesale Garment");
  const brandTitle = getLocalizedField(product.brandTitle, publicTitle);

  // Dual-Title Protection Rule:
  const displayTitle = isSearchResult && brandTitle ? brandTitle : publicTitle;
  const safeAltTitle = isSearchResult ? brandTitle : publicTitle;

  const unitPrice = Number(product.unitPrice ?? product.price ?? 0);
  const pcsPerPack = Math.max(1, parseInt(product.pcsPerPack ?? product.packSize ?? 6, 10));
  const packTotal = unitPrice * pcsPerPack;
  const sizeRange = escapeHtml(product.sizeRange || product.sizes || "S - M - L - XL");
  const imageUrl = escapeHtml(
    product.imageUrl ||
      (Array.isArray(product.images) && product.images[0]) ||
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80"
  );

  const productJsonAttr = escapeHtml(
    JSON.stringify({
      id: product.id || sku,
      sku: product.sku || sku,
      publicTitle,
      brandTitle,
      unitPrice,
      pcsPerPack,
      sizeRange: product.sizeRange || "S-XL",
      imageUrl
    })
  );

  return `
    <article class="product-card reveal-on-scroll" data-product-id="${id}" data-sku="${sku}">
      <div class="product-media aspect-3-4 is-loading">
        <div class="product-badges">
          <span class="badge-pack">${pcsPerPack} ${escapeHtml(t("pcsLabel"))} / ${escapeHtml(t("packContains"))}</span>
          <span class="badge-origin">${escapeHtml(t("madeInTurkey"))}</span>
        </div>
        <button type="button"
                class="zoom-trigger-btn"
                aria-label="${escapeHtml(t("zoomHint"))}"
                data-lightbox-img="${imageUrl}"
                data-lightbox-title="${escapeHtml(publicTitle)}"
                data-lightbox-sku="${sku}"
                data-lightbox-price="${formatPrice(unitPrice)}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <img src="${imageUrl}"
             alt="${escapeHtml(safeAltTitle)} - SKU ${sku}"
             loading="lazy"
             decoding="async"
             width="600"
             height="800"
             onload="this.parentElement.classList.remove('is-loading')" />
      </div>

      <div class="product-info">
        <div class="product-meta-top">
          <span class="product-sku">SKU: ${sku}</span>
          <span>${sizeRange}</span>
        </div>

        <h3 class="product-title">${escapeHtml(displayTitle)}</h3>

        <div class="b2b-pricing-box">
          <div class="price-row-unit">
            <span class="unit-price-label">${escapeHtml(t("unitPriceLabel"))}</span>
            <span class="unit-price-value">${formatPrice(unitPrice)} <small>${escapeHtml(t("perPiece"))}</small></span>
          </div>
          <div class="price-row-pack">
            <span class="pack-qty-info">${escapeHtml(t("packContains"))}: ${pcsPerPack} ${escapeHtml(t("pcsLabel"))}</span>
            <span class="pack-total-price">${escapeHtml(t("packTotalLabel"))}: ${formatPrice(packTotal)}</span>
          </div>
        </div>

        <div class="product-actions">
          <button type="button"
                  class="add-to-cart-btn"
                  data-add-pack="${productJsonAttr}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>${escapeHtml(t("addPackToCart"))}</span>
          </button>

          <button type="button"
                  class="whatsapp-direct-btn"
                  title="${escapeHtml(t("askOnWhatsApp"))}"
                  aria-label="${escapeHtml(t("askOnWhatsApp"))}"
                  data-wa-product="${productJsonAttr}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ==========================================================================
   6. WHOLESALE B2B CART ENGINE (PACK-BASED + FIRESTORE ORDER GENERATOR)
   ========================================================================== */
export function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(state.cart));
  } catch (e) {
    console.error("Failed to save cart:", e);
  }
  updateCartUI();
}

export function getCartTotals() {
  let totalPacks = 0;
  let totalPieces = 0;
  let totalAmount = 0;

  state.cart.forEach((item) => {
    const packs = Math.max(1, parseInt(item.packs, 10) || 1);
    const pcsPerPack = Math.max(1, parseInt(item.pcsPerPack, 10) || 1);
    const unitPrice = Number(item.unitPrice) || 0;

    const itemPieces = packs * pcsPerPack;
    const itemSubtotal = itemPieces * unitPrice;

    totalPacks += packs;
    totalPieces += itemPieces;
    totalAmount += itemSubtotal;
  });

  return {
    totalPacks,
    totalPieces,
    totalAmount: Number(totalAmount.toFixed(2))
  };
}

export function addToCart(productObj, packDelta = 1) {
  if (!productObj || !productObj.id) return;
  const existingIndex = state.cart.findIndex((i) => i.id === productObj.id);

  if (existingIndex > -1) {
    state.cart[existingIndex].packs += packDelta;
    if (state.cart[existingIndex].packs <= 0) {
      state.cart.splice(existingIndex, 1);
    }
  } else if (packDelta > 0) {
    state.cart.push({
      id: productObj.id,
      sku: productObj.sku || "PRD-TR",
      publicTitle: getLocalizedField(productObj.publicTitle, "Wholesale Item"),
      brandTitle: getLocalizedField(productObj.brandTitle, ""),
      unitPrice: Number(productObj.unitPrice) || 0,
      pcsPerPack: Math.max(1, parseInt(productObj.pcsPerPack, 10) || 6),
      sizeRange: productObj.sizeRange || "S-XL",
      imageUrl: productObj.imageUrl || "",
      packs: packDelta
    });
  }
  saveCart();
}

export function updateCartPackQty(productId, newPackCount) {
  const idx = state.cart.findIndex((i) => i.id === productId);
  if (idx === -1) return;
  if (newPackCount <= 0) {
    state.cart.splice(idx, 1);
  } else {
    state.cart[idx].packs = newPackCount;
  }
  saveCart();
}

export function clearCart() {
  state.cart = [];
  saveCart();
}

export function openCartDrawer() {
  const overlay = document.querySelector(".cart-overlay");
  const drawer = document.querySelector(".cart-drawer");
  if (overlay && drawer) {
    overlay.classList.add("active");
    drawer.classList.add("active");
    document.body.classList.add("lock-scroll");
  }
}

export function closeCartDrawer() {
  const overlay = document.querySelector(".cart-overlay");
  const drawer = document.querySelector(".cart-drawer");
  if (overlay && drawer) {
    overlay.classList.remove("active");
    drawer.classList.remove("active");
    document.body.classList.remove("lock-scroll");
  }
}

export function updateCartUI() {
  const { totalPacks, totalPieces, totalAmount } = getCartTotals();
  const threshold = Number(state.config.bestRateThreshold) || 25;

  // Update header badge counts
  document.querySelectorAll(".cart-count, .cart-badge, [data-cart-count]").forEach((el) => {
    el.textContent = totalPacks;
  });

  // Update tier progress bar (25+ pcs best wholesale rate)
  const tierTextEl = document.querySelector("[data-tier-message]");
  const tierFillEl = document.querySelector(".tier-progress-fill");
  if (tierTextEl && tierFillEl) {
    const pct = Math.min(100, Math.round((totalPieces / threshold) * 100));
    tierFillEl.style.width = `${pct}%`;
    if (totalPieces >= threshold) {
      tierTextEl.textContent = t("tierProgressUnlocked");
    } else {
      tierTextEl.textContent = t("tierProgressNeed", { remaining: threshold - totalPieces });
    }
  }

  // Render Cart Items List
  const listEl = document.querySelector(".cart-items-list, .cart-body");
  if (listEl) {
    if (state.cart.length === 0) {
      listEl.innerHTML = `<div class="search-empty">${escapeHtml(t("cartEmpty"))}</div>`;
    } else {
      listEl.innerHTML = state.cart
        .map((item) => {
          const itemPieces = item.packs * item.pcsPerPack;
          const itemTotal = itemPieces * item.unitPrice;
          return `
            <div class="cart-item" data-cart-item="${escapeHtml(item.id)}">
              <img class="cart-item-img" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.publicTitle)}" loading="lazy" />
              <div>
                <div class="cart-item-title">${escapeHtml(item.publicTitle)}</div>
                <div class="cart-item-pack">
                  SKU: ${escapeHtml(item.sku)} • ${item.packs} × (${item.pcsPerPack} ${escapeHtml(t("pcsLabel"))}) = <strong>${itemPieces} ${escapeHtml(t("pcsLabel"))}</strong>
                </div>
                <div class="cart-qty-controls">
                  <button type="button" class="cart-qty-btn" data-cart-dec="${escapeHtml(item.id)}">−</button>
                  <span class="cart-qty-val">${item.packs} Pack</span>
                  <button type="button" class="cart-qty-btn" data-cart-inc="${escapeHtml(item.id)}">+</button>
                </div>
              </div>
              <div style="text-align:right; font-weight:800; font-size:0.88rem; color:var(--charcoal);">
                ${formatPrice(itemTotal)}
              </div>
            </div>
          `;
        })
        .join("");
    }
  }

  // Update summary totals
  const packsEl = document.querySelector("[data-cart-total-packs]");
  const pcsEl = document.querySelector("[data-cart-total-pieces]");
  const subtotalEl = document.querySelector("[data-cart-subtotal]");

  if (packsEl) packsEl.textContent = `${totalPacks}`;
  if (pcsEl) pcsEl.textContent = `${totalPieces} ${t("pcsLabel")}`;
  if (subtotalEl) subtotalEl.textContent = formatPrice(totalAmount);
}

/**
 * Generates short order code (e.g. ORD-8492), saves to Firestore `orders` & `customers`,
 * fires Google Ads conversion, and opens WhatsApp with the order link.
 */
export async function submitWholesaleOrderToWhatsApp(buyerDetails = {}) {
  if (state.cart.length === 0) return;

  const { totalPacks, totalPieces, totalAmount } = getCartTotals();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const timeSuffix = String(Date.now()).slice(-2);
  const orderCode = `ORD-${randomDigits}${timeSuffix}`;
  const orderUrl = `${SITE_DOMAIN}/order.html?id=${orderCode}`;

  const buyerName = (buyerDetails.name || document.querySelector("#cart-buyer-name")?.value || "B2B Wholesale Buyer").trim();
  const buyerCountry = (buyerDetails.country || document.querySelector("#cart-buyer-country")?.value || "").trim();
  const buyerPhone = (buyerDetails.phone || document.querySelector("#cart-buyer-phone")?.value || "").trim();

  // Save buyer info locally for convenience
  try {
    localStorage.setItem(STORAGE_KEYS.BUYER, JSON.stringify({ name: buyerName, country: buyerCountry, phone: buyerPhone }));
  } catch (e) {}

  const orderPayload = {
    orderCode,
    orderUrl,
    buyerName,
    buyerCountry,
    buyerPhone,
    language: state.lang,
    currency: state.config.currencyCode || "EUR",
    totalPacks,
    totalPieces,
    totalAmount,
    qualifiesBulkTier: totalPieces >= (Number(state.config.bestRateThreshold) || 25),
    status: "pending_whatsapp",
    items: state.cart.map((i) => ({
      id: i.id,
      sku: i.sku,
      publicTitle: i.publicTitle,
      brandTitle: i.brandTitle || i.publicTitle,
      packs: i.packs,
      pcsPerPack: i.pcsPerPack,
      totalPieces: i.packs * i.pcsPerPack,
      unitPrice: i.unitPrice,
      lineTotal: Number((i.packs * i.pcsPerPack * i.unitPrice).toFixed(2)),
      imageUrl: i.imageUrl
    })),
    createdAt: serverTimestamp(),
    createdAtIso: new Date().toISOString()
  };

  // Save Order & Customer in Firestore (non-blocking fallback if offline)
  try {
    await setDoc(doc(db, "orders", orderCode), orderPayload);
    if (buyerPhone || buyerName !== "B2B Wholesale Buyer") {
      await addDoc(collection(db, "customers"), {
        name: buyerName,
        country: buyerCountry,
        phone: buyerPhone,
        lastOrderCode: orderCode,
        lastOrderAmount: totalAmount,
        lastOrderPieces: totalPieces,
        language: state.lang,
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn("Firestore order save warning (continuing to WhatsApp):", err);
  }

  // Build formatted WhatsApp B2B Invoice Message
  const itemLines = state.cart
    .map(
      (i, idx) =>
        `${idx + 1}. *${i.sku}* (${i.publicTitle})\n   • ${i.packs} Pack × ${i.pcsPerPack} pcs = ${i.packs * i.pcsPerPack} pcs — *${formatPrice(
          i.packs * i.pcsPerPack * i.unitPrice
        )}*`
    )
    .join("\n");

  const waMessage = [
    `🏛 *PARADISE WHOLESALE ISTANBUL — B2B ORDER*`,
    `🆔 *Order ID:* ${orderCode}`,
    buyerName ? `👤 *Buyer:* ${buyerName}` : null,
    buyerCountry ? `🌍 *Destination:* ${buyerCountry}` : null,
    buyerPhone ? `📱 *Contact:* ${buyerPhone}` : null,
    `────────────────────`,
    itemLines,
    `────────────────────`,
    `📦 *Total Packs:* ${totalPacks} Packs`,
    `👕 *Total Units:* ${totalPieces} pcs ${totalPieces >= 25 ? "(★ 25+ PCS BEST WHOLESALE TIER)" : ""}`,
    `💶 *Estimated Total:* ${formatPrice(totalAmount)}`,
    `────────────────────`,
    `🔗 *View Official Digital Invoice & Photos:*`,
    `${orderUrl}`
  ]
    .filter(Boolean)
    .join("\n");

  // Trigger Google Ads Conversion & Open WhatsApp
  openWhatsApp(waMessage, `b2b_order_${orderCode}`, totalAmount);
}

/* ==========================================================================
   7. 60FPS SCROLL REVEAL OBSERVER & HD LIGHTBOX CONTROLLER
   ========================================================================== */
let scrollObserver = null;

export function observeNewElements(root = document) {
  const elements = root.querySelectorAll(".reveal-on-scroll:not(.reveal-visible)");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("reveal-visible"));
    return;
  }

  if (!scrollObserver) {
    scrollObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.08 }
    );
  }

  elements.forEach((el) => scrollObserver.observe(el));
}

export function ensureCartAndLightboxDOM() {
  // 1. Ensure HD Lightbox Modal exists
  if (!document.querySelector(".lightbox-overlay")) {
    const lb = document.createElement("div");
    lb.className = "lightbox-overlay";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.innerHTML = `
      <div class="lightbox-content">
        <button type="button" class="lightbox-close" aria-label="Close Zoom">✕</button>
        <div class="lightbox-img-wrap">
          <img id="lightbox-main-img" src="" alt="HD Wholesale Garment Preview" />
        </div>
        <div class="lightbox-caption">
          <div>
            <strong id="lightbox-title" style="display:block; font-size:0.95rem;"></strong>
            <span id="lightbox-meta" style="font-size:0.78rem; color:#cbd5e1;"></span>
          </div>
          <button type="button" id="lightbox-wa-btn" class="btn btn-whatsapp" style="padding:8px 14px; font-size:0.8rem;">
            WhatsApp
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(lb);
  }

  // 2. Ensure Floating Pulsing WhatsApp CTA exists if not already in HTML
  if (!document.querySelector(".whatsapp-float") && !window.location.pathname.includes("admin")) {
    const floatBtn = document.createElement("button");
    floatBtn.type = "button";
    floatBtn.className = "whatsapp-float";
    floatBtn.setAttribute("aria-label", "Wholesale WhatsApp Desk");
    floatBtn.innerHTML = `
      <span class="whatsapp-online-dot"></span>
      <span data-i18n="floatingWhatsAppText">${escapeHtml(t("floatingWhatsAppText"))}</span>
    `;
    floatBtn.addEventListener("click", () => {
      openWhatsApp("", "floating_pulsing_whatsapp_cta");
    });
    document.body.appendChild(floatBtn);
  }
}

export function openLightbox({ img, title, sku, price }) {
  const overlay = document.querySelector(".lightbox-overlay");
  if (!overlay) return;
  const imgEl = overlay.querySelector("#lightbox-main-img");
  const titleEl = overlay.querySelector("#lightbox-title");
  const metaEl = overlay.querySelector("#lightbox-meta");
  const waBtn = overlay.querySelector("#lightbox-wa-btn");

  if (imgEl) imgEl.src = img;
  if (titleEl) titleEl.textContent = title || "";
  if (metaEl) metaEl.textContent = `SKU: ${sku || "PRD"} • ${price || ""}`;
  if (waBtn) {
    waBtn.onclick = () => {
      const msg = `Hello Paradise Wholesale! I am interested in SKU: ${sku} (${title}) - Unit Price: ${price}. Please send pack details.`;
      openWhatsApp(msg, `lightbox_inquiry_${sku}`);
    };
  }

  overlay.classList.add("active");
  document.body.classList.add("lock-scroll");
}

export function closeLightbox() {
  const overlay = document.querySelector(".lightbox-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    document.body.classList.remove("lock-scroll");
  }
}

/* ==========================================================================
   8. LIVE SEARCH ENGINE (DUAL-TITLE + NOINDEX SHIELD)
   ========================================================================== */
export function setCatalogCache(productsArray = []) {
  state.catalogCache = Array.isArray(productsArray) ? productsArray : [];
}

export function performLiveSearch(rawQuery) {
  const q = String(rawQuery || "").trim().toLowerCase();
  const dropdown = document.querySelector(".live-search-results, .search-results-dropdown");
  const clearBtn = document.querySelector(".search-clear-btn");

  if (clearBtn) {
    clearBtn.classList.toggle("visible", q.length > 0);
  }

  if (!q) {
    setSearchRobotsShield(false);
    if (dropdown) {
      dropdown.classList.remove("active");
      dropdown.innerHTML = "";
    }
    return [];
  }

  // Activate <meta name="robots" content="noindex, nofollow"> while searching brands
  setSearchRobotsShield(true);

  const matched = state.catalogCache.filter((p) => {
    const pub = getLocalizedField(p.publicTitle, "").toLowerCase();
    const brd = getLocalizedField(p.brandTitle, "").toLowerCase();
    const sku = String(p.sku || "").toLowerCase();
    const tags = Array.isArray(p.searchTags)
      ? p.searchTags.join(" ").toLowerCase()
      : String(p.searchTags || "").toLowerCase();

    return pub.includes(q) || brd.includes(q) || sku.includes(q) || tags.includes(q);
  });

  if (dropdown) {
    dropdown.classList.add("active");
    if (matched.length === 0) {
      dropdown.innerHTML = `<div class="search-empty">${escapeHtml(t("searchEmpty"))}</div>`;
    } else {
      dropdown.innerHTML = matched
        .slice(0, 12)
        .map((p) => {
          // In search results, explicitly reveal the real `brandTitle`!
          const brandName = getLocalizedField(p.brandTitle, getLocalizedField(p.publicTitle, "Wholesale Item"));
          const unitPrice = Number(p.unitPrice ?? p.price ?? 0);
          const pcsPerPack = Math.max(1, parseInt(p.pcsPerPack ?? 6, 10));
          const img =
            p.imageUrl ||
            (Array.isArray(p.images) && p.images[0]) ||
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80";

          const itemJson = escapeHtml(
            JSON.stringify({
              id: p.id || p.sku,
              sku: p.sku || "PRD-TR",
              publicTitle: getLocalizedField(p.publicTitle, brandName),
              brandTitle: brandName,
              unitPrice,
              pcsPerPack,
              sizeRange: p.sizeRange || "S-XL",
              imageUrl: img
            })
          );

          return `
            <div class="search-result-item" data-search-add="${itemJson}">
              <img class="search-item-thumb" src="${escapeHtml(img)}" alt="${escapeHtml(brandName)}" loading="lazy" />
              <div class="search-item-info">
                <div class="search-item-title">${escapeHtml(brandName)}</div>
                <div class="search-item-meta">
                  <span>SKU: ${escapeHtml(p.sku || "PRD")}</span>
                  <span>• ${pcsPerPack} ${escapeHtml(t("pcsLabel"))}/Pack</span>
                  <span class="search-item-price">${formatPrice(unitPrice)}${escapeHtml(t("perPiece"))}</span>
                </div>
              </div>
              <button type="button" class="btn btn-gold" style="padding:6px 12px; font-size:0.74rem;">
                + Pack
              </button>
            </div>
          `;
        })
        .join("");
    }
  }

  return matched;
}

/* ==========================================================================
   9. LANGUAGE SWITCHER & GLOBAL EVENT DELEGATION
   ========================================================================== */
export function setLanguage(newLang) {
  if (!["en", "it", "es"].includes(newLang)) return;
  state.lang = newLang;
  localStorage.setItem(STORAGE_KEYS.LANG, newLang);
  document.documentElement.setAttribute("lang", newLang);

  // Update active state on language buttons
  document.querySelectorAll(".lang-btn, [data-lang-switch]").forEach((btn) => {
    const btnLang = btn.getAttribute("data-lang-switch") || btn.getAttribute("data-lang");
    const isActive = btnLang === newLang;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-current", isActive ? "true" : "false");
  });

  // Translate static elements with [data-i18n]
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });

  // Translate placeholders with [data-i18n-placeholder]
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) el.setAttribute("placeholder", t(key));
  });

  updateCartUI();
  window.dispatchEvent(new CustomEvent("paradise:languageChanged", { detail: { lang: newLang } }));
}

function bindGlobalEvents() {
  // Sticky Header glass effect on scroll
  const header = document.querySelector(".site-header, .header");
  if (header) {
    window.addEventListener(
      "scroll",
      () => {
        header.classList.toggle("is-scrolled", window.scrollY > 18);
      },
      { passive: true }
    );
  }

  // Global Click Delegation
  document.addEventListener("click", (e) => {
    const target = e.target;

    // 1. Language Switcher
    const langBtn = target.closest("[data-lang-switch], .lang-btn[data-lang]");
    if (langBtn) {
      e.preventDefault();
      const chosen = langBtn.getAttribute("data-lang-switch") || langBtn.getAttribute("data-lang");
      setLanguage(chosen);
      return;
    }

    // 2. Add Pack to Cart
    const addPackBtn = target.closest("[data-add-pack]");
    if (addPackBtn) {
      e.preventDefault();
      try {
        const productData = JSON.parse(addPackBtn.getAttribute("data-add-pack"));
        addToCart(productData, 1);
        const span = addPackBtn.querySelector("span");
        if (span) {
          const original = span.textContent;
          span.textContent = t("addedToCart");
          setTimeout(() => {
            span.textContent = original;
          }, 1200);
        }
        openCartDrawer();
      } catch (err) {
        console.error("Add pack parse error:", err);
      }
      return;
    }

    // 3. Direct Product WhatsApp Inquiry
    const waProdBtn = target.closest("[data-wa-product]");
    if (waProdBtn) {
      e.preventDefault();
      try {
        const p = JSON.parse(waProdBtn.getAttribute("data-wa-product"));
        const msg = `Hello Paradise Wholesale Istanbul! I want to inquire about:\n• *SKU:* ${p.sku}\n• *Item:* ${p.publicTitle}\n• *Pack:* ${p.pcsPerPack} pcs (${formatPrice(p.unitPrice)}/pc)\nPlease share available colors and delivery time.`;
        openWhatsApp(msg, `product_card_${p.sku}`, p.unitPrice * p.pcsPerPack);
      } catch (err) {
        openWhatsApp("", "product_card_inquiry");
      }
      return;
    }

    // 4. Generic WhatsApp Trigger Attribute
    const genericWa = target.closest("[data-whatsapp-trigger]");
    if (genericWa) {
      e.preventDefault();
      const customMsg = genericWa.getAttribute("data-whatsapp-message") || "";
      const label = genericWa.getAttribute("data-whatsapp-trigger") || "site_whatsapp_button";
      openWhatsApp(customMsg, label);
      return;
    }

    // 5. Open / Close Cart Drawer
    if (target.closest(".cart-trigger, .cart-btn, [data-open-cart]")) {
      e.preventDefault();
      openCartDrawer();
      return;
    }
    if (target.closest(".cart-close-btn, .cart-overlay, [data-close-cart]")) {
      e.preventDefault();
      closeCartDrawer();
      return;
    }

    // 6. Cart Quantity Increment / Decrement
    const incBtn = target.closest("[data-cart-inc]");
    if (incBtn) {
      const id = incBtn.getAttribute("data-cart-inc");
      const item = state.cart.find((i) => i.id === id);
      if (item) updateCartPackQty(id, item.packs + 1);
      return;
    }
    const decBtn = target.closest("[data-cart-dec]");
    if (decBtn) {
      const id = decBtn.getAttribute("data-cart-dec");
      const item = state.cart.find((i) => i.id === id);
      if (item) updateCartPackQty(id, item.packs - 1);
      return;
    }

    // 7. Submit Cart to WhatsApp
    if (target.closest(".checkout-whatsapp-btn, [data-submit-whatsapp-order]")) {
      e.preventDefault();
      submitWholesaleOrderToWhatsApp();
      return;
    }

    // 8. Search Result Item Click (Add Pack)
    const searchItem = target.closest("[data-search-add]");
    if (searchItem) {
      e.preventDefault();
      try {
        const prod = JSON.parse(searchItem.getAttribute("data-search-add"));
        addToCart(prod, 1);
        openCartDrawer();
      } catch (err) {}
      return;
    }

    // 9. HD Lightbox Open & Close
    const zoomBtn = target.closest("[data-lightbox-img]");
    if (zoomBtn) {
      e.preventDefault();
      openLightbox({
        img: zoomBtn.getAttribute("data-lightbox-img"),
        title: zoomBtn.getAttribute("data-lightbox-title"),
        sku: zoomBtn.getAttribute("data-lightbox-sku"),
        price: zoomBtn.getAttribute("data-lightbox-price")
      });
      return;
    }
    if (target.closest(".lightbox-close") || target.classList.contains("lightbox-overlay")) {
      e.preventDefault();
      closeLightbox();
      return;
    }

    // 10. Close Live Search Dropdown when clicking outside
    if (!target.closest(".search-wrapper, .header-search")) {
      const dropdown = document.querySelector(".live-search-results, .search-results-dropdown");
      if (dropdown && dropdown.classList.contains("active")) {
        dropdown.classList.remove("active");
        setSearchRobotsShield(false);
      }
    }
  });

  // Live Search Input Listener
  const searchInput = document.querySelector("#live-search-input, .search-input");
  const clearSearchBtn = document.querySelector(".search-clear-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      performLiveSearch(e.target.value);
    });
    searchInput.addEventListener("focus", (e) => {
      if (e.target.value.trim().length > 0) {
        performLiveSearch(e.target.value);
      }
    });
  }

  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      performLiveSearch("");
    });
  }

  // Escape key closes modals & search shield
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLightbox();
      closeCartDrawer();
      const dropdown = document.querySelector(".live-search-results, .search-results-dropdown");
      if (dropdown) dropdown.classList.remove("active");
      setSearchRobotsShield(false);
    }
  });
}

/* ==========================================================================
   10. INITIALIZATION & GLOBAL WINDOW INTERFACE
   ========================================================================== */
export async function initParadiseCore() {
  ensureCartAndLightboxDOM();
  setLanguage(state.lang);
  bindGlobalEvents();
  observeNewElements(document);
  await syncPublicConfig();
}

// Expose global API on window.ParadiseApp for universal access
window.ParadiseApp = {
  firebaseConfig,
  SUPER_ADMIN_EMAIL,
  SITE_DOMAIN,
  db,
  auth,
  firestoreTools: {
    doc,
    getDoc,
    setDoc,
    addDoc,
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
  },
  authTools: {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
  },
  DEPARTMENTS_TAXONOMY,
  I18N_DICTIONARY,
  state,
  t,
  getLocalizedField,
  formatPrice,
  syncPublicConfig,
  openWhatsApp,
  setSearchRobotsShield,
  renderProductCard,
  setCatalogCache,
  performLiveSearch,
  addToCart,
  updateCartPackQty,
  clearCart,
  getCartTotals,
  openCartDrawer,
  closeCartDrawer,
  submitWholesaleOrderToWhatsApp,
  observeNewElements,
  openLightbox,
  closeLightbox,
  setLanguage
};

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initParadiseCore);
} else {
  initParadiseCore();
}
