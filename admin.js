/**
 * ============================================================================
 * PARADISE WHOLESALE CLOTHING (Paradise Turkey Wholesale)
 * Domain: https://paradisewholesaler.com
 * File: admin.js (BLOCK 1 OF 2 — AUDITED & OPTIMIZED)
 *       8x Parallel Uploader, Dual-WebP (Thumb + HD), CORS-Free Gemini Vision,
 *       Visual Category Manager, Vendor CRM & Strict Role Security
 * ============================================================================
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

/* ==========================================================================
   1. CORE CONFIGURATION & DEFAULT VISUAL TAXONOMY
   ========================================================================== */
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
export const SHARD_CHUNK_SIZE = 100;
export const PARALLEL_UPLOAD_LIMIT = 8; // آپلود موازی ۸تا ۸تا همزمان

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* درخت پیش‌فرض بخش‌ها، شاخه‌ها، زیرمجموعه‌ها و عکس‌های کاتالوگ (قابل ویرایش کامل از تب ۳) */
export const DEFAULT_TAXONOMY = [
  {
    id: "men",
    labelFa: "مردانه",
    label: "Men",
    labelItEs: "Uomo / Hombre",
    hidden: false,
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80",
    subcategories: [
      {
        id: "men-tshirts",
        labelFa: "تیشرت مردانه",
        label: "T-Shirts",
        en: "Premium Turkish Cotton Men's T-Shirt",
        it: "T-Shirt Uomo in Cotone Turco Premium",
        es: "Camiseta Hombre de Algodón Turco Premium",
        hidden: false,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
        leaves: ["Oversize", "Regular", "Polo"]
      },
      {
        id: "men-sweatshirts-hoodies",
        labelFa: "هودی و دورس مردانه",
        label: "Sweatshirts & Hoodies",
        en: "Heavyweight Turkish Cotton Men's Hoodie & Sweatshirt",
        it: "Felpa e Hoodie Uomo Cotone Turco",
        es: "Sudadera y Hoodie Hombre Algodón Turco",
        hidden: false,
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80",
        leaves: ["Hoodie", "Sweatshirt", "Zip-Up"]
      },
      {
        id: "men-tracksuits",
        labelFa: "ست ورزشی و ترک‌سوئیت مردانه",
        label: "Tracksuits",
        en: "2-Piece Luxury Men's Tracksuit Set",
        it: "Tuta Completa Uomo 2 Pezzi",
        es: "Conjunto Chándal Hombre 2 Piezas",
        hidden: false,
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80",
        leaves: ["2-Piece Set", "3-Piece Set"]
      },
      {
        id: "men-shirts",
        labelFa: "پیراهن مردانه",
        label: "Shirts",
        en: "Luxury Tailored Men's Shirt",
        it: "Camicia Uomo Sartoriale",
        es: "Camisa Hombre Corte Sastre",
        hidden: false,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80",
        leaves: ["Classic", "Linen", "Casual"]
      },
      {
        id: "men-knitwear",
        labelFa: "بافت و پلیور مردانه",
        label: "Knitwear",
        en: "Fine Turkish Men's Knitwear & Sweater",
        it: "Maglieria Uomo Fine",
        es: "Punto y Jersey Hombre",
        hidden: false,
        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=500&q=80",
        leaves: ["Pullover", "Turtleneck", "Cardigan"]
      },
      {
        id: "men-jeans",
        labelFa: "شلوار جین مردانه",
        label: "Jeans",
        en: "Turkish Denim Men's Jeans",
        it: "Jeans Uomo Denim Turco",
        es: "Pantalón Vaquero Denim Hombre",
        hidden: false,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80",
        leaves: ["Slim Fit", "Baggy", "Straight"]
      },
      {
        id: "men-trousers",
        labelFa: "شلوار کتان، پارچه‌ای و جاگر مردانه",
        label: "Trousers & Joggers",
        en: "Tailored Men's Trousers & Joggers",
        it: "Pantaloni e Jogger Uomo",
        es: "Pantalón y Jogger Hombre",
        hidden: false,
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=500&q=80",
        leaves: ["Jogger", "Cargo", "Chino"]
      },
      {
        id: "men-jackets-coats",
        labelFa: "کاپشن و پالتو مردانه",
        label: "Jackets & Coats",
        en: "Designer Men's Outerwear Jacket",
        it: "Giacca e Capospalla Uomo",
        es: "Chaqueta y Abrigo Hombre",
        hidden: false,
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
        leaves: ["Puffer", "Bomber", "Leather Jacket"]
      },
      {
        id: "men-suits-blazers",
        labelFa: "کت و شلوار مردانه",
        label: "Suits & Blazers",
        en: "Executive Men's Suit & Blazer",
        it: "Abito e Blazer Uomo",
        es: "Traje y Blazer Hombre",
        hidden: false,
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80",
        leaves: ["Full Suit", "Blazer"]
      }
    ]
  },
  {
    id: "women",
    labelFa: "زنانه",
    label: "Women",
    labelItEs: "Donna / Mujer",
    hidden: false,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
    subcategories: [
      {
        id: "women-tops-tshirts",
        labelFa: "تاپ و تیشرت زنانه",
        label: "Tops & T-Shirts",
        en: "Boutique Women's Cotton Top & T-Shirt",
        it: "Top e T-Shirt Donna Boutique",
        es: "Top y Camiseta Mujer Boutique",
        hidden: false,
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=500&q=80",
        leaves: ["T-Shirt", "Crop Top", "Bodysuit"]
      },
      {
        id: "women-blouses-shirts",
        labelFa: "بلوز و شومیز زنانه",
        label: "Blouses & Shirts",
        en: "Elegant Women's Satin & Poplin Blouse",
        it: "Camicia e Blusa Elegante Donna",
        es: "Blusa y Camisa Elegante Mujer",
        hidden: false,
        image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=500&q=80",
        leaves: ["Satin Blouse", "Shirt"]
      },
      {
        id: "women-sweatshirts-hoodies",
        labelFa: "هودی و سوئیشرت زنانه",
        label: "Sweatshirts & Hoodies",
        en: "Luxury Women's Hoodie & Sweatshirt",
        it: "Felpa e Hoodie Donna",
        es: "Sudadera y Hoodie Mujer",
        hidden: false,
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80",
        leaves: ["Hoodie", "Sweatshirt"]
      },
      {
        id: "women-dresses-jumpsuits",
        labelFa: "پیراهن، مجلسی و سرهمی",
        label: "Dresses & Jumpsuits",
        en: "Boutique Women's Evening & Day Dress",
        it: "Abito Elegante Donna",
        es: "Vestido Elegante Mujer",
        hidden: false,
        image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=500&q=80",
        leaves: ["Midi Dress", "Maxi Dress", "Jumpsuit"]
      },
      {
        id: "women-tracksuits-loungewear",
        labelFa: "ست راحتی و ترک‌سوئیت زنانه",
        label: "Tracksuits & Loungewear",
        en: "2-Piece Women's Tracksuit Set",
        it: "Completo Tuta Donna",
        es: "Conjunto Chándal Mujer",
        hidden: false,
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=500&q=80",
        leaves: ["Tracksuit", "Lounge Set"]
      },
      {
        id: "women-jeans-trousers",
        labelFa: "شلوار و جین زنانه",
        label: "Jeans & Trousers",
        en: "High-Waist Women's Denim & Trousers",
        it: "Jeans e Pantaloni Donna",
        es: "Jeans y Pantalón Mujer",
        hidden: false,
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80",
        leaves: ["Wide Leg", "Jogger", "Skinny"]
      },
      {
        id: "women-skirts",
        labelFa: "دامن زنانه",
        label: "Skirts",
        en: "Tailored Women's Boutique Skirt",
        it: "Gonna Sartoriale Donna",
        es: "Falda de Boutique Mujer",
        hidden: false,
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=500&q=80",
        leaves: ["Mini", "Midi"]
      },
      {
        id: "women-knitwear",
        labelFa: "بافت زنانه",
        label: "Knitwear",
        en: "Soft Touch Women's Knitwear",
        it: "Maglieria Morbida Donna",
        es: "Punto Suave Mujer",
        hidden: false,
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80",
        leaves: ["Cardigan", "Sweater"]
      },
      {
        id: "women-jackets-coats",
        labelFa: "کاپشن و پالتو زنانه",
        label: "Jackets & Coats",
        en: "Boutique Women's Coat & Jacket",
        it: "Cappotto e Giacca Donna",
        es: "Abrigo y Chaqueta Mujer",
        hidden: false,
        image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=500&q=80",
        leaves: ["Trench Coat", "Puffer"]
      },
      {
        id: "women-suits-coord",
        labelFa: "ست دو تکه و کت‌شلوار زنانه",
        label: "Suits & Co-ord Sets",
        en: "2-Piece Women's Tailored Co-ord Suit",
        it: "Tailleur e Completo Donna",
        es: "Conjunto Sastre Mujer",
        hidden: false,
        image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=500&q=80",
        leaves: ["Blazer Set", "Skirt Set"]
      }
    ]
  },
  {
    id: "kids-baby",
    labelFa: "بچگانه",
    label: "Kids & Baby",
    labelItEs: "Bambini / Niños",
    hidden: false,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80",
    subcategories: [
      {
        id: "kids-boys",
        labelFa: "پسرانه",
        label: "Boys Clothing",
        en: "Turkish Cotton Boys Wholesale Set",
        it: "Completo Bambino Cotone Turco",
        es: "Conjunto Niño Algodón Turco",
        hidden: false,
        image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=500&q=80",
        leaves: ["Tracksuit", "T-Shirt Set"]
      },
      {
        id: "kids-girls",
        labelFa: "دخترانه",
        label: "Girls Clothing",
        en: "Boutique Girls Dress & Set",
        it: "Completo e Abito Bambina",
        es: "Conjunto y Vestido Niña",
        hidden: false,
        image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=500&q=80",
        leaves: ["Dress", "2-Piece Set"]
      },
      {
        id: "kids-baby-sets",
        labelFa: "ست نوزادی",
        label: "Baby Sets",
        en: "Organic Combed Cotton Baby Serie Pack",
        it: "Set Neonato Cotone Organico",
        es: "Set Bebé Algodón Orgánico",
        hidden: false,
        image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=500&q=80",
        leaves: ["Newborn Set", "Romper"]
      }
    ]
  },
  {
    id: "shoes",
    labelFa: "کفش",
    label: "Shoes",
    labelItEs: "Scarpe / Calzado",
    hidden: false,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
    subcategories: [
      {
        id: "shoes-men",
        labelFa: "کفش و کتانی مردانه",
        label: "Men's Shoes",
        en: "Handcrafted Leather Men's Sneaker & Loafer",
        it: "Sneaker e Mocassino Uomo",
        es: "Zapatilla y Mocasín Hombre",
        hidden: false,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
        leaves: ["Sneakers", "Loafers", "Boots"]
      },
      {
        id: "shoes-women",
        labelFa: "کفش و کتانی زنانه",
        label: "Women's Shoes",
        en: "Luxury Women's Footwear & Sneakers",
        it: "Calzature e Sneaker Donna",
        es: "Calzado y Zapatilla Mujer",
        hidden: false,
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80",
        leaves: ["Sneakers", "Heels", "Boots"]
      }
    ]
  },
  {
    id: "bags-accessories",
    labelFa: "کیف و اکسسوری",
    label: "Bags & Accessories",
    labelItEs: "Borse / Bolsos",
    hidden: false,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
    subcategories: [
      {
        id: "bags-main",
        labelFa: "کیف",
        label: "Bags",
        en: "Structured Luxury Leather Handbag & Tote",
        it: "Borsa in Pelle di Lusso",
        es: "Bolso de Piel de Lujo",
        hidden: false,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80",
        leaves: ["Handbag", "Crossbody", "Backpack"]
      },
      {
        id: "accessories-main",
        labelFa: "اکسسوری، کمربند و کلاه",
        label: "Accessories",
        en: "Luxury Belt, Cap & Boutique Accessory",
        it: "Cintura, Cappello e Accessori",
        es: "Cinturón, Gorra y Accesorios",
        hidden: false,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
        leaves: ["Belts", "Hats & Caps", "Wallets"]
      }
    ]
  }
];

export const DEPARTMENTS_TAXONOMY = DEFAULT_TAXONOMY;

/* ==========================================================================
   2. APPLICATION STATE
   ========================================================================== */
const adminState = {
  user: null,
  role: "super_admin", // "super_admin" | "assistant"
  taxonomy: structuredClone(DEFAULT_TAXONOMY),
  orders: [],
  customers: [],
  products: [],
  blogs: [],
  vendors: [{ code: "PRD", name: "تامین‌کننده اصلی پارادایس" }],
  vendorSecrets: {}, // { [code]: { phone, address } } -> فقط برای مدیر کل
  selectedProductIds: new Set(), // حفظ تیک محصولات در اسکرول و صفحه‌بندی ۱۰۰تایی
  catalogDisplayLimit: 100,
  sessionAiBase64Map: new Map(), // کش موقت تصویر برای جلوگیری ۱۰۰٪ از خطای CORS در جمنای
  stagedImages: [],
  failedUploadQueue: [],
  lastUploadReport: {
    totalSelected: 0,
    successItems: [],
    failedItems: [],
    duplicateItems: []
  },
  aiWorkerRunning: false,
  aiWorkerStopRequested: false,
  publicConfig: {
    logoUrl: "",
    whatsappRaw: "+905459099395",
    whatsappDisplay: "+90 545 909 93 95",
    currencySymbol: "$",
    currencyCode: "USD",
    bestRateThreshold: 25,
    underMoqMarkupPercent: 15,
    ga4MeasurementId: "",
    googleAdsId: "",
    googleAdsConversionLabel: "",
    googleSiteVerification: "",
    instagramUrl: "https://instagram.com/paradisewholesaler",
    telegramUrl: "https://t.me/paradisewholesaler",
    tiktokUrl: "https://tiktok.com/@paradisewholesaler",
    androidAppUrl: "",
    vendors: [{ code: "PRD", name: "تامین‌کننده اصلی پارادایس" }],
    assistantEmails: [],
    superAdminEmails: [],
    taxonomy: null,
    heroVideo: {
      ytId: "dQw4w9WgXcQ",
      poster: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=85",
      title: "Istanbul Warehouse & Live Order Packing"
    },
    cargoVideos: [],
    showroomVideos: []
  },
  adminSecrets: {
    geminiKeys: [],
    geminiModel: "gemini-2.5-flash",
    githubToken: "",
    githubRepo: "",
    githubBranch: "main",
    superAdminEmails: [],
    assistantEmails: [],
    vendorSecrets: {}
  },
  geminiKeyCursor: 0
};

/* ==========================================================================
   3. UTILITIES, SMART FALLBACK TITLES & FINGERPRINT
   ========================================================================== */
function cleanDuplicateDomNodes() {
  const seenIds = new Set();
  document.querySelectorAll("[id]").forEach((el) => {
    const id = el.getAttribute("id");
    if (!id) return;
    if (seenIds.has(id)) {
      el.remove();
    } else {
      seenIds.add(id);
    }
  });
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;")
    .replace(/'/g, "&" + "#039;");
}

function showAdminToast(message, duration = 3800) {
  const toast = document.getElementById("admin-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

function slugify(text, fallback = "wholesale-item") {
  const s = String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return s || fallback;
}

function extractYouTubeId(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function formatMoney(amount) {
  return `$${(Number(amount) || 0).toFixed(2)}`;
}

function getFileFingerprint(file) {
  if (!file) return "";
  const cleanName = String(file.name || "").trim().toLowerCase();
  const size = Number(file.size) || 0;
  return `${cleanName}__${size}`;
}

function findDuplicateProductByFingerprint(fingerprint) {
  if (!fingerprint) return null;
  return adminState.products.find(
    (p) =>
      p.fileFingerprint === fingerprint ||
      (Array.isArray(p.fileFingerprints) && p.fileFingerprints.includes(fingerprint))
  );
}

function buildSmartFallbackContent(deptId, subcatId, leafSub, sku, pcsPerPack) {
  const deptObj = adminState.taxonomy.find((d) => d.id === deptId) || adminState.taxonomy[0];
  const subObj = deptObj?.subcategories?.find((s) => s.id === subcatId) || deptObj?.subcategories?.[0] || {};
  const leafSuffix = leafSub ? ` (${leafSub})` : "";

  const enBase = subObj.en || `Luxury Turkish Wholesale ${subObj.label || "Garment"}`;
  const itBase = subObj.it || `Abbigliamento Ingrosso Turco ${subObj.label || ""}`;
  const esBase = subObj.es || `Ropa Mayorista Turca ${subObj.label || ""}`;

  const enTitle = `${enBase}${leafSuffix} • Code ${sku}`;
  const itTitle = `${itBase}${leafSuffix} • Cod. ${sku}`;
  const esTitle = `${esBase}${leafSuffix} • Cód. ${sku}`;

  return {
    publicTitle: { en: enTitle, it: itTitle, es: esTitle },
    brandTitle: { en: enTitle, it: itTitle, es: esTitle },
    description: {
      en: `Direct Istanbul factory wholesale pack (${pcsPerPack} pcs serie pack). Master quality fabric & stitching. Fast 3-5 day express air cargo to Europe, UK & USA.`,
      it: `Pacco serie ingrosso diretto da Istanbul (${pcsPerPack} pezzi per pacco). Qualità master e spedizione espressa in 3-5 giorni in tutta Italia ed Europa.`,
      es: `Paquete serie al por mayor directo desde Estambul (${pcsPerPack} piezas por paquete). Calidad maestra y envío exprés en 3-5 días a España y Europa.`
    }
  };
}

/* ==========================================================================
   4. FIREBASE AUTHENTICATION, PERSISTENCE & STRICT ROLE SECURITY (RBAC)
   ========================================================================== */
function applyRolePermissionsUI() {
  const isSuper = adminState.role === "super_admin";
  const badge = document.getElementById("sidebar-admin-role-badge");
  if (badge) {
    badge.textContent = isSuper ? "👑 مدیر کل (دسترسی کامل)" : "📸 دستیار آپلود (دسترسی محدود)";
    badge.style.background = isSuper ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)";
    badge.style.color = isSuper ? "#6ee7b7" : "#fde047";
  }

  // اگر کاربر دستیار است، تمام بخش‌های حساس مدیر کل به طور کامل از DOM حذف می‌شوند
  if (!isSuper) {
    document.querySelectorAll('[data-super-only="true"]').forEach((el) => {
      el.remove();
    });
  }
}

function bindAuthEvents() {
  const loginForm = document.getElementById("admin-login-form");
  const passInput = document.getElementById("admin-login-password");
  const togglePassBtn = document.getElementById("toggle-pass-visibility");
  const logoutBtn = document.getElementById("admin-logout-btn");

  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener("click", () => {
      const isPass = passInput.type === "password";
      passInput.type = isPass ? "text" : "password";
      togglePassBtn.textContent = isPass ? "مخفی" : "نمایش";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("admin-login-email").value.trim();
      const password = document.getElementById("admin-login-password").value;
      const rememberMe = Boolean(document.getElementById("admin-remember-me")?.checked);
      const submitBtn = document.getElementById("admin-login-submit-btn");
      const errBox = document.getElementById("admin-login-error");

      if (errBox) errBox.style.display = "none";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "در حال بررسی امنیت و ورود...";
      }

      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        await signInWithEmailAndPassword(auth, email, password);
        showAdminToast("✓ ورود با موفقیت انجام شد.");
      } catch (err) {
        if (errBox) {
          errBox.style.display = "block";
          errBox.textContent = "ایمیل یا رمز عبور اشتباه است.";
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "🔐 ورود به سیستم";
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.reload();
    });
  }

  onAuthStateChanged(auth, async (user) => {
    adminState.user = user;
    const authScreen = document.getElementById("admin-auth-screen");
    const appShell = document.getElementById("admin-app-shell");
    const emailLabel = document.getElementById("sidebar-admin-email");

    if (user) {
      if (authScreen) authScreen.style.display = "none";
      if (appShell) appShell.style.display = "flex";
      if (emailLabel) emailLabel.textContent = user.email || "";
      await loadAllAdminData();
    } else {
      if (authScreen) authScreen.style.display = "flex";
      if (appShell) appShell.style.display = "none";
    }
  });
}

async function loadAllAdminData() {
  await loadSettingsFromFirestore();

  await Promise.all([
    loadProductsCatalog(),
    adminState.role === "super_admin" ? loadOrdersAndCustomers() : Promise.resolve(),
    adminState.role === "super_admin" ? loadPublishedBlogs() : Promise.resolve()
  ]);

  syncVendorsFromProductsAndConfig();
  renderCategoriesManagerUI();
  updateDashboardKPIs();
  updateAiQueueCounters();
}

function updateDashboardKPIs() {
  const prodCount = adminState.products.length;
  const ordCount = adminState.orders.length;
  const custCount = adminState.customers.length;
  const blogCount = adminState.blogs.length;
  const vendCount = adminState.vendors.length;

  const totalVolume = adminState.orders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("kpi-total-products", String(prodCount));
  setTxt("kpi-total-orders", String(ordCount));
  setTxt("kpi-orders-volume", formatMoney(totalVolume));
  setTxt("kpi-total-customers", String(custCount));

  setTxt("nav-badge-orders", String(ordCount));
  setTxt("nav-badge-products", String(prodCount));
  setTxt("nav-badge-blogs", String(blogCount));
  setTxt("nav-badge-vendors", String(vendCount));
}

/* ==========================================================================
   5. NAVIGATION & SIDEBAR TABS CONTROLLER
   ========================================================================== */
function bindNavigationEvents() {
  const sidebar = document.getElementById("admin-sidebar");
  const backdrop = document.getElementById("admin-sidebar-backdrop");
  const openBtn = document.getElementById("sidebar-open-btn");
  const closeBtn = document.getElementById("sidebar-close-btn");

  const closeMobileSidebar = () => {
    sidebar?.classList.remove("open");
    backdrop?.classList.remove("active");
  };

  openBtn?.addEventListener("click", () => {
    sidebar?.classList.add("open");
    backdrop?.classList.add("active");
  });
  closeBtn?.addEventListener("click", closeMobileSidebar);
  backdrop?.addEventListener("click", closeMobileSidebar);

  const tabTitles = {
    "ai-uploader": "➕ ۱. آپلود سریع محصول (۸تایی موازی)",
    catalog: "🗂️ ۲. مدیریت محصولات، قیمت و انتخاب تیکی",
    categories: "🌿 ۳. مدیریت بخش‌ها، شاخه‌ها و عکس دسته‌ها",
    vendors: "🏪 ۴. مدیریت عمده‌فروشان و کدهای اختصاصی",
    orders: "📦 ۵. سفارشات و مشتریان واتساپ",
    videos: "🎬 ۶. ویدیوهای ویترین و رضایت مشتریان",
    blog: "📝 ۷. مقالات سئو ۳ زبانه",
    settings: "⚙️ ۸. تنظیمات، لوگو، فرمول ۲۵ عدد و ادمین‌ها"
  };

  document.querySelectorAll("[data-admin-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-admin-tab");
      if (!targetTab) return;

      if (adminState.role === "assistant" && btn.getAttribute("data-super-only") === "true") {
        showAdminToast("⛔ دسترسی محدود به مدیر کل.");
        return;
      }

      document.querySelectorAll("[data-admin-tab]").forEach((b) => {
        b.classList.toggle("active", b === btn);
      });

      document.querySelectorAll(".admin-tab-section").forEach((sec) => {
        sec.classList.toggle("active", sec.id === `tab-${targetTab}`);
      });

      const titleEl = document.getElementById("topbar-active-title");
      if (titleEl && tabTitles[targetTab]) {
        titleEl.textContent = tabTitles[targetTab];
      }

      closeMobileSidebar();
    });
  });
}

/* ==========================================================================
   6. DUAL-WEBP COMPRESSOR (HD + THUMBNAIL + AI BASE64) & CODE-ONLY WATERMARK
   ========================================================================== */
/**
 * در یک مرحله واحد روی موبایل/دسکتاپ:
 * 1) نسخه HD (عرض 1200px) با واترمارکِ فقط کد محصول (بدون قیمت)
 * 2) نسخه Thumbnail فوق‌سبک (عرض 420px) برای اسکرول سریع مشتریان
 * 3) رشته Base64 سبک (`aiBase64`) برای ارسال مستقیم به جمنای بدون خطای CORS فایربیس
 */
async function compressImageToDualWebP(file, watermarkCode = "") {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("خطا در خواندن فایل عکس"));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("فرمت عکس پشتیبانی نمی‌شود"));
      img.onload = async () => {
        try {
          const origW = img.naturalWidth || img.width;
          const origH = img.naturalHeight || img.height;

          const renderCanvasBlob = (maxW, qual, includeBase64 = false) =>
            new Promise((resBlob, rejBlob) => {
              let w = origW;
              let h = origH;
              if (w > maxW) {
                h = Math.round((h * maxW) / widthOrOrig(origW));
                w = maxW;
              }
              function widthOrOrig(val) {
                return val || 1;
              }
              const canvas = document.createElement("canvas");
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, w, h);

              // حک فقط کد محصول (بدون قیمت) روی عکس
              if (watermarkCode) {
                const fontSize = Math.max(12, Math.round(w * 0.026));
                ctx.font = `800 ${fontSize}px sans-serif`;
                const padX = Math.round(fontSize * 0.75);
                const padY = Math.round(fontSize * 0.42);
                const metrics = ctx.measureText(watermarkCode);
                const boxW = metrics.width + padX * 2;
                const boxH = fontSize + padY * 2;
                const posX = Math.round(w * 0.025);
                const posY = h - boxH - Math.round(w * 0.025);

                ctx.fillStyle = "rgba(9, 13, 22, 0.82)";
                ctx.beginPath();
                if (ctx.roundRect) {
                  ctx.roundRect(posX, posY, boxW, boxH, 6);
                } else {
                  ctx.rect(posX, posY, boxW, boxH);
                }
                ctx.fill();

                ctx.strokeStyle = "rgba(212, 175, 55, 0.9)";
                ctx.lineWidth = Math.max(1, Math.round(w * 0.0018));
                ctx.stroke();

                ctx.fillStyle = "#ffffff";
                ctx.textBaseline = "middle";
                ctx.fillText(watermarkCode, posX + padX, posY + boxH / 2);
              }

              const dataUrl = includeBase64 ? canvas.toDataURL("image/webp", qual) : "";
              canvas.toBlob(
                (blob) => {
                  if (!blob) return rejBlob(new Error("WebP conversion failed"));
                  resBlob({ blob, dataUrl });
                },
                "image/webp",
                qual
              );
            });

          const [hdRes, thumbRes] = await Promise.all([
            renderCanvasBlob(1200, 0.85, false),
            renderCanvasBlob(420, 0.76, true)
          ]);

          const aiBase64 = (thumbRes.dataUrl || "").split(",")[1] || "";

          resolve({
            file,
            fileName: file.name,
            fingerprint: getFileFingerprint(file),
            blob: hdRes.blob,
            thumbBlob: thumbRes.blob,
            dataUrl: thumbRes.dataUrl,
            aiBase64,
            origSize: file.size,
            webpSize: hdRes.blob.size,
            thumbSize: thumbRes.blob.size,
            remoteUrl: "",
            remoteThumbUrl: ""
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * آپلود همزمان نسخه HD و نسخه Thumbnail در Firebase Storage
 */
async function uploadDualWebPToStorage(stagedItem, dept, skuCode, index = 0) {
  if (stagedItem.remoteUrl && stagedItem.remoteThumbUrl) {
    return { hdUrl: stagedItem.remoteUrl, thumbUrl: stagedItem.remoteThumbUrl };
  }
  const cleanCode = String(skuCode || "PRD").replace(/[^a-zA-Z0-9_-]/g, "");
  const ts = Date.now();
  const suffix = index > 0 ? `_${index + 1}` : "";

  const hdPath = `products/${dept || "men"}/${ts}_${cleanCode}${suffix}.webp`;
  const thumbPath = `products/${dept || "men"}/thumbs/${ts}_${cleanCode}${suffix}_thumb.webp`;

  const hdRef = storageRef(storage, hdPath);
  const thumbRef = storageRef(storage, thumbPath);

  const cacheMeta = {
    contentType: "image/webp",
    cacheControl: "public,max-age=31536000,immutable"
  };

  await Promise.all([
    uploadBytes(hdRef, stagedItem.blob, cacheMeta),
    uploadBytes(thumbRef, stagedItem.thumbBlob || stagedItem.blob, cacheMeta)
  ]);

  const [hdUrl, thumbUrl] = await Promise.all([
    getDownloadURL(hdRef),
    getDownloadURL(thumbRef)
  ]);

  stagedItem.remoteUrl = hdUrl;
  stagedItem.remoteThumbUrl = thumbUrl;
  return { hdUrl, thumbUrl };
}

/**
 * آپلود عکس‌های دسته‌بندی یا لوگو در استوریج
 */
async function uploadSingleImageAsset(file, folder = "categories", maxW = 700) {
  const processed = await compressImageToDualWebP(file, "");
  const cleanName = slugify(file.name.replace(/\.[^.]+$/, ""), "asset");
  const path = `${folder}/${Date.now()}_${cleanName}.webp`;
  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, maxW <= 500 ? processed.thumbBlob : processed.blob, {
    contentType: "image/webp",
    cacheControl: "public,max-age=31536000"
  });
  return await getDownloadURL(fileRef);
}

/**
 * آپلود مستقیم فایل ویدیو از گالری گوشی
 */
async function uploadVideoFileToStorage(videoFile, dept, skuCode) {
  if (!videoFile) return "";
  const cleanCode = String(skuCode || "VID").replace(/[^a-zA-Z0-9_-]/g, "");
  const ext = (videoFile.name.split(".").pop() || "mp4").toLowerCase();
  const path = `products/${dept || "men"}/videos/${Date.now()}_${cleanCode}.${ext}`;
  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, videoFile, {
    contentType: videoFile.type || "video/mp4",
    cacheControl: "public,max-age=31536000"
  });
  return await getDownloadURL(fileRef);
}

/* ==========================================================================
   7. GEMINI MULTI-KEY ROTATOR ENGINE
   ========================================================================== */
function getActiveGeminiKeys() {
  const textareaVal = document.getElementById("cfg-gemini-keys")?.value || "";
  const fromDom = textareaVal
    .split(/[\r\n,]+/)
    .map((k) => k.trim())
    .filter(Boolean);

  if (fromDom.length > 0) {
    adminState.adminSecrets.geminiKeys = fromDom;
  }
  return adminState.adminSecrets.geminiKeys;
}

async function callGeminiWithRotator(contentsPayload, expectJson = true) {
  const keys = getActiveGeminiKeys();
  if (keys.length === 0) {
    throw new Error("کلید جمنای در تب تنظیمات وارد نشده است.");
  }

  const preferredModel =
    document.getElementById("cfg-gemini-model")?.value || adminState.adminSecrets.geminiModel || "gemini-2.5-flash";
  const modelsToTry = Array.from(new Set([preferredModel, "gemini-2.5-flash", "gemini-2.0-flash"]));

  let lastError = null;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const keyIndex = (adminState.geminiKeyCursor + attempt) % keys.length;
    const apiKey = keys[keyIndex];

    for (const modelName of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const bodyObj = {
        contents: contentsPayload,
        generationConfig: {
          temperature: 0.35,
          ...(expectJson ? { responseMimeType: "application/json" } : {})
        }
      };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyObj)
        });

        if (res.status === 429 || res.status === 503) {
          lastError = new Error(`محدودیت سهمیه کلید ${keyIndex + 1}`);
          break;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          lastError = new Error(errData?.error?.message || `HTTP ${res.status}`);
          continue;
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!rawText) throw new Error("پاسخ خالی از جمنای");

        adminState.geminiKeyCursor = (keyIndex + 1) % keys.length;

        if (!expectJson) return rawText;

        const cleanedJson = rawText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();

        return JSON.parse(cleanedJson);
      } catch (err) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error("خطا در ارتباط با جمنای");
}

/* === پایان بلوک ۱ از ۲ فایل admin.js — بلوک ۲ را دقیقاً زیر این خط پیست کنید === */
/* === شروع بلوک ۲ از ۲ فایل admin.js — دقیقاً زیر بلوک ۱ پیست کنید === */

/* ==========================================================================
   8. VENDOR MANAGER, TAXONOMY DROPDOWNS & INSTANT GALLERY SELECTION
   ========================================================================== */
function syncVendorsFromProductsAndConfig() {
  const vendorMap = new Map();

  const cfgVendors = Array.isArray(adminState.publicConfig.vendors) ? adminState.publicConfig.vendors : [];
  cfgVendors.forEach((v) => {
    if (v && v.code) {
      const code = String(v.code).trim().toUpperCase();
      vendorMap.set(code, { code, name: v.name || code });
    }
  });

  adminState.products.forEach((p) => {
    const code = String(p.vendorCode || String(p.sku || "").split("-")[0] || "PRD")
      .trim()
      .toUpperCase();
    if (code && !vendorMap.has(code)) {
      vendorMap.set(code, { code, name: p.vendorName || code });
    }
  });

  if (vendorMap.size === 0) {
    vendorMap.set("PRD", { code: "PRD", name: "تامین‌کننده اصلی پارادایس" });
  }

  adminState.vendors = Array.from(vendorMap.values());
  renderVendorDropdowns();
  renderVendorsManagerTable();
  updateDashboardKPIs();
}

function renderVendorDropdowns(selectedCode = "") {
  const uploadVendorSel = document.getElementById("prod-vendor-select");
  if (uploadVendorSel) {
    const current = selectedCode || uploadVendorSel.value || adminState.vendors[0]?.code || "PRD";
    uploadVendorSel.innerHTML = adminState.vendors
      .map(
        (v) =>
          `<option value="${escapeHtml(v.code)}" ${v.code === current ? "selected" : ""}>${escapeHtml(v.code)} — ${escapeHtml(v.name)}</option>`
      )
      .join("");
  }

  const catalogVendorSel = document.getElementById("catalog-filter-vendor");
  if (catalogVendorSel) {
    const currentFilter = catalogVendorSel.value || "all";
    const counts = {};
    adminState.products.forEach((p) => {
      const c = String(p.vendorCode || String(p.sku || "").split("-")[0] || "PRD").toUpperCase();
      counts[c] = (counts[c] || 0) + 1;
    });

    let html = `<option value="all">همه عمده‌فروش‌ها (${adminState.products.length})</option>`;
    adminState.vendors.forEach((v) => {
      const cnt = counts[v.code] || 0;
      html += `<option value="${escapeHtml(v.code)}" ${v.code === currentFilter ? "selected" : ""}>${escapeHtml(v.code)} — ${escapeHtml(v.name)} (${cnt})</option>`;
    });
    catalogVendorSel.innerHTML = html;
  }
}

function getSelectedVendorObj() {
  const sel = document.getElementById("prod-vendor-select");
  const code = (sel?.value || "PRD").trim().toUpperCase();
  return adminState.vendors.find((v) => v.code === code) || { code, name: code };
}

function populateAllTaxonomySelects(selectedDept = "", selectedSub = "", selectedLeaf = "") {
  const deptSel = document.getElementById("prod-department");
  const catFilterDept = document.getElementById("catalog-filter-dept");
  const subcatParentDept = document.getElementById("subcat-parent-dept");
  const filterSubcatMgrDept = document.getElementById("filter-subcat-manager-dept");

  const activeDepts = adminState.taxonomy;
  const targetDeptId = selectedDept || deptSel?.value || activeDepts[0]?.id || "men";

  if (deptSel) {
    deptSel.innerHTML = activeDepts
      .map(
        (d) =>
          `<option value="${escapeHtml(d.id)}" ${d.id === targetDeptId ? "selected" : ""}>${escapeHtml(d.labelFa || d.label)} (${escapeHtml(d.label)})${d.hidden ? " [مخفی]" : ""}</option>`
      )
      .join("");
  }

  if (catFilterDept) {
    const cur = catFilterDept.value || "all";
    catFilterDept.innerHTML =
      `<option value="all">همه بخش‌ها</option>` +
      activeDepts
        .map((d) => `<option value="${escapeHtml(d.id)}" ${d.id === cur ? "selected" : ""}>${escapeHtml(d.labelFa || d.label)}</option>`)
        .join("");
  }

  if (subcatParentDept) {
    const cur = subcatParentDept.value || activeDepts[0]?.id || "men";
    subcatParentDept.innerHTML = activeDepts
      .map((d) => `<option value="${escapeHtml(d.id)}" ${d.id === cur ? "selected" : ""}>${escapeHtml(d.labelFa || d.label)}</option>`)
      .join("");
  }

  if (filterSubcatMgrDept) {
    const cur = filterSubcatMgrDept.value || activeDepts[0]?.id || "men";
    filterSubcatMgrDept.innerHTML = activeDepts
      .map((d) => `<option value="${escapeHtml(d.id)}" ${d.id === cur ? "selected" : ""}>${escapeHtml(d.labelFa || d.label)}</option>`)
      .join("");
  }

  populateSubcategoryDropdown(targetDeptId, selectedSub, selectedLeaf);
  populateCatalogFilterSubcategories(catFilterDept?.value || "all");
}

function populateSubcategoryDropdown(deptId, selectedSubId = "", selectedLeaf = "") {
  const subSelect = document.getElementById("prod-subcategory");
  if (!subSelect) return;
  const deptObj = adminState.taxonomy.find((d) => d.id === deptId) || adminState.taxonomy[0];
  const subs = deptObj?.subcategories || [];
  const targetSub = selectedSubId || subs[0]?.id || "";

  subSelect.innerHTML = subs
    .map(
      (sc) =>
        `<option value="${escapeHtml(sc.id)}" ${sc.id === targetSub ? "selected" : ""}>${escapeHtml(sc.labelFa || sc.label)} (${escapeHtml(sc.label)})${sc.hidden ? " [مخفی]" : ""}</option>`
    )
    .join("");

  populateLeafSubDropdown(deptId, targetSub, selectedLeaf);
}

function populateLeafSubDropdown(deptId, subcatId, selectedLeaf = "") {
  const leafSelect = document.getElementById("prod-leaf-sub");
  if (!leafSelect) return;
  const deptObj = adminState.taxonomy.find((d) => d.id === deptId) || adminState.taxonomy[0];
  const subObj = (deptObj?.subcategories || []).find((s) => s.id === subcatId);
  const leaves = Array.isArray(subObj?.leaves) ? subObj.leaves : [];

  leafSelect.innerHTML =
    `<option value="">— عمومی شاخه —</option>` +
    leaves
      .map((lf) => `<option value="${escapeHtml(lf)}" ${lf === selectedLeaf ? "selected" : ""}>${escapeHtml(lf)}</option>`)
      .join("");
}

function populateCatalogFilterSubcategories(deptId = "all") {
  const filterSub = document.getElementById("catalog-filter-subcat");
  if (!filterSub) return;
  const currentVal = filterSub.value || "all";

  let html = `<option value="all">همه شاخه‌ها</option>`;
  adminState.taxonomy.forEach((d) => {
    if (deptId !== "all" && d.id !== deptId) return;
    (d.subcategories || []).forEach((sc) => {
      html += `<option value="${escapeHtml(sc.id)}" ${sc.id === currentVal ? "selected" : ""}>${escapeHtml(sc.labelFa || sc.label)}</option>`;
    });
  });
  filterSub.innerHTML = html;
}

function updatePackMathDisplay() {
  const unitPrice = parseFloat(document.getElementById("prod-unit-price")?.value) || 0;
  const pcs = Math.max(1, parseInt(document.getElementById("prod-pcs-per-pack")?.value, 10) || 6);
  const total = unitPrice * pcs;
  const displayEl = document.getElementById("prod-pack-total-display");
  if (displayEl) {
    displayEl.value = `$${total.toFixed(2)} (${pcs} pcs)`;
  }
}

function generateAutoSku() {
  const vendor = getSelectedVendorObj();
  const rand = Math.floor(1000 + Math.random() * 9000);
  const newSku = `${vendor.code}-${rand}`;
  const skuInput = document.getElementById("prod-sku");
  if (skuInput) skuInput.value = newSku;
  return newSku;
}

function renderStagedImagePreviews() {
  const container = document.getElementById("product-upload-previews");
  const badge = document.getElementById("webp-compression-status");
  if (!container) return;

  if (adminState.stagedImages.length === 0) {
    container.innerHTML = "";
    if (badge) badge.textContent = "(تولید خودکار ۲ کیفیت Thumbnail و HD + آپلود ۸تایی همزمان)";
    return;
  }

  container.innerHTML = adminState.stagedImages
    .map(
      (item, idx) => `
      <div class="preview-item">
        <img src="${escapeHtml(item.previewUrl || item.dataUrl || item.remoteUrl)}" alt="Preview ${idx + 1}" />
        <button type="button" class="preview-remove" data-remove-staged="${idx}">✕</button>
      </div>
    `
    )
    .join("");

  if (badge) {
    badge.textContent = `(${adminState.stagedImages.length} عکس آماده آپلود ۸تایی پرسرعت)`;
  }
}

function handleFilesSelected(fileList) {
  const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
  if (files.length === 0) return;

  let skippedInSelection = 0;
  for (const file of files) {
    const fp = getFileFingerprint(file);
    if (adminState.stagedImages.some((s) => s.fingerprint && s.fingerprint === fp)) {
      skippedInSelection++;
      continue;
    }
    adminState.stagedImages.push({
      file,
      fileName: file.name,
      fingerprint: fp,
      previewUrl: URL.createObjectURL(file),
      origSize: file.size,
      remoteUrl: "",
      remoteThumbUrl: ""
    });
  }

  renderStagedImagePreviews();
  if (skippedInSelection > 0) {
    showAdminToast(`${skippedInSelection} عکس تکراری در انتخاب فعلی نادیده گرفته شد.`);
  }
}

function renderBatchUploadReport() {
  const box = document.getElementById("batch-upload-report-box");
  if (!box) return;

  const rep = adminState.lastUploadReport;
  box.style.display = "block";

  const setTxt = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(v);
  };

  setTxt("rep-count-success", rep.successItems.length);
  setTxt("rep-count-duplicate", rep.duplicateItems.length);
  setTxt("rep-count-failed", rep.failedItems.length);

  const retryBtn = document.getElementById("btn-retry-failed-uploads");
  if (retryBtn) {
    if (adminState.failedUploadQueue.length > 0) {
      retryBtn.style.display = "inline-flex";
      retryBtn.textContent = `🔄 تلاش مجدد برای خطاها (${adminState.failedUploadQueue.length})`;
    } else {
      retryBtn.style.display = "none";
    }
  }

  const logEl = document.getElementById("batch-report-details-log");
  if (logEl) {
    const lines = [];
    rep.successItems.forEach((s) => {
      lines.push(`<div style="color:#065f46;">✅ <strong>${escapeHtml(s.sku)}</strong> (${escapeHtml(s.fileName)}) — ثبت شد</div>`);
    });
    rep.duplicateItems.forEach((d) => {
      lines.push(`<div style="color:#92400e;">⚠️ <strong>تکراری (رد شد):</strong> ${escapeHtml(d.fileName)} (کد موجود: ${escapeHtml(d.existingSku)})</div>`);
    });
    rep.failedItems.forEach((f) => {
      lines.push(`<div style="color:#991b1b;">❌ <strong>خطا:</strong> ${escapeHtml(f.fileName)} — ${escapeHtml(f.error)}</div>`);
    });
    logEl.innerHTML = lines.join("") || "آماده";
  }
}

/* ==========================================================================
   9. 8x PARALLEL BATCH UPLOADER + VIDEO-AS-PRODUCT + AI WORKER
   ========================================================================== */
async function executeParallelBatchUpload(itemsToProcess, isRetry = false) {
  const submitBtn = document.getElementById("btn-save-product-submit");
  const retryBtn = document.getElementById("btn-retry-failed-uploads");
  const progWrap = document.getElementById("parallel-upload-progress-wrap");
  const progFill = document.getElementById("parallel-upload-progress-fill");

  const vendor = getSelectedVendorObj();
  const department = document.getElementById("prod-department")?.value || "men";
  const subcategory = document.getElementById("prod-subcategory")?.value || "men-tshirts";
  const leafSub = document.getElementById("prod-leaf-sub")?.value || "";
  const unitPrice = parseFloat(document.getElementById("prod-unit-price")?.value) || 5;
  const pcsPerPack = Math.max(1, parseInt(document.getElementById("prod-pcs-per-pack")?.value, 10) || 6);
  const sizeRange = document.getElementById("prod-size-range")?.value.trim() || "S - M - L - XL - XXL";
  const watermarkEnabled = Boolean(document.getElementById("prod-watermark-toggle")?.checked);
  const youtubeRaw = (document.getElementById("prod-youtube-url")?.value || "").trim();
  const youtubeId = extractYouTubeId(youtubeRaw);
  const videoFile = document.getElementById("prod-video-file")?.files?.[0] || null;

  if (!isRetry) {
    adminState.lastUploadReport = {
      totalSelected: itemsToProcess.length,
      successItems: [],
      failedItems: [],
      duplicateItems: []
    };
  } else {
    adminState.lastUploadReport.failedItems = [];
  }

  const newFailedQueue = [];
  if (submitBtn) submitBtn.disabled = true;
  if (retryBtn) retryBtn.disabled = true;
  if (progWrap) progWrap.style.display = "block";
  if (progFill) progFill.style.width = "4%";

  let sharedVideoUrl = "";
  if (videoFile) {
    try {
      sharedVideoUrl = await uploadVideoFileToStorage(videoFile, department, vendor.code);
    } catch (e) {}
  }

  let completedCounter = 0;
  const totalCount = itemsToProcess.length;

  // پردازش موازی ۸تا ۸تا همزمان
  for (let startIdx = 0; startIdx < totalCount; startIdx += PARALLEL_UPLOAD_LIMIT) {
    const chunk = itemsToProcess.slice(startIdx, startIdx + PARALLEL_UPLOAD_LIMIT);

    await Promise.all(
      chunk.map(async (item, localIdx) => {
        const globalIdx = startIdx + localIdx;
        const fileName = item.fileName || item.file?.name || `عکس_${globalIdx + 1}`;
        const fp = item.fingerprint || getFileFingerprint(item.file);

        // ۱. بررسی ضد تکراری
        const dupProd = findDuplicateProductByFingerprint(fp);
        if (dupProd && !isRetry) {
          adminState.lastUploadReport.duplicateItems.push({
            fileName,
            existingSku: dupProd.sku || dupProd.id
          });
          completedCounter++;
          return;
        }

        // ۲. ساخت کد یکتا بر اساس کد اختصاصی عمده‌فروش
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const sku =
          totalCount === 1 && document.getElementById("prod-sku")?.value.trim()
            ? document.getElementById("prod-sku").value.trim().toUpperCase()
            : item.assignedSku || `${vendor.code}-${randNum}`;
        item.assignedSku = sku;

        try {
          // ۳. تبدیل دوگانه (نسخه HD + نسخه Thumbnail سبک + حک فقط کد محصول بدون قیمت)
          let dualImg = item;
          if (item.file && !item.blob) {
            dualImg = await compressImageToDualWebP(item.file, watermarkEnabled ? sku : "");
            Object.assign(item, dualImg);
          }

          if (item.aiBase64) {
            adminState.sessionAiBase64Map.set(sku, item.aiBase64);
          }

          // ۴. آپلود همزمان عکس HD و عکس Thumbnail در Storage
          const { hdUrl, thumbUrl } = await uploadDualWebPToStorage(item, department, sku, 0);

          // ۵. تولید عنوان و متن ۳ زبانه استاندارد اولیه
          const fallbackText = buildSmartFallbackContent(department, subcategory, leafSub, sku, pcsPerPack);

          const productPayload = {
            id: sku,
            code: sku,
            sku,
            vendorCode: vendor.code,
            vendorName: vendor.name,
            fileFingerprint: fp,
            fileFingerprints: fp ? [fp] : [],
            department,
            subcategory,
            leafSub,
            unitPrice,
            pcsPerPack,
            packTotal: Number((unitPrice * pcsPerPack).toFixed(2)),
            sizeRange,
            stockStatus: "in_stock",
            isFeatured: true,
            aiStatus: "pending",
            publicTitle: fallbackText.publicTitle,
            brandTitle: fallbackText.brandTitle,
            description: fallbackText.description,
            searchTags: [sku.toLowerCase(), vendor.code.toLowerCase(), department, subcategory, leafSub.toLowerCase()].filter(Boolean),
            imageUrl: hdUrl,
            thumbUrl: thumbUrl || hdUrl,
            images: [hdUrl],
            videoUrl: sharedVideoUrl || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""),
            youtubeId: youtubeId || "",
            createdAtMillis: Date.now() + globalIdx,
            updatedAtIso: new Date().toISOString(),
            createdAt: serverTimestamp()
          };

          await setDoc(doc(db, "products", sku), productPayload, { merge: true });
          adminState.products.unshift(productPayload);
          adminState.lastUploadReport.successItems.push({ sku, fileName });
        } catch (err) {
          newFailedQueue.push(item);
          adminState.lastUploadReport.failedItems.push({
            fileName,
            error: err.message || "خطای ارتباط با سرور"
          });
        } finally {
          completedCounter++;
          const pct = Math.round((completedCounter / totalCount) * 100);
          if (progFill) progFill.style.width = `${pct}%`;
          if (submitBtn) {
            submitBtn.textContent = `⏳ آپلود موازی ۸تایی (${completedCounter} از ${totalCount} — ${pct}%)...`;
          }
        }
      })
    );

    renderBatchUploadReport();
  }

  adminState.failedUploadQueue = newFailedQueue;
  adminState.stagedImages = [...newFailedQueue];

  renderStagedImagePreviews();
  renderBatchUploadReport();
  await rebuildAllCatalogShards();
  syncVendorsFromProductsAndConfig();
  renderCatalogTable();
  updateAiQueueCounters();
  generateAutoSku();

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "🚀 شروع آپلود موازی (۸تایی) و ثبت محصولات";
  }
  if (retryBtn) retryBtn.disabled = false;
  setTimeout(() => {
    if (progWrap) progWrap.style.display = "none";
  }, 1200);

  const succ = adminState.lastUploadReport.successItems.length;
  const dup = adminState.lastUploadReport.duplicateItems.length;
  const fail = adminState.failedUploadQueue.length;
  showAdminToast(`پایان آپلود موازی: ${succ} موفق | ${dup} تکراری | ${fail} خطا`);

  if (succ > 0 && getActiveGeminiKeys().length > 0 && !adminState.aiWorkerRunning) {
    startBackgroundAiWorker();
  }
}

/**
 * ثبت تک محصول (با چند عکس از زوایای مختلف) یا ثبت ویدیو به عنوان محصول مستقل
 */
async function handleSaveProductForm(e) {
  e.preventDefault();

  const mode = document.getElementById("batch-upload-mode")?.value || "batch";
  const existingDocId = document.getElementById("prod-doc-id")?.value.trim() || "";
  const youtubeRaw = (document.getElementById("prod-youtube-url")?.value || "").trim();
  const youtubeId = extractYouTubeId(youtubeRaw);
  const videoFile = document.getElementById("prod-video-file")?.files?.[0] || null;

  if (!existingDocId && mode === "batch" && adminState.stagedImages.length > 0) {
    await executeParallelBatchUpload([...adminState.stagedImages], false);
    return;
  }

  if (adminState.stagedImages.length === 0 && !youtubeId && !youtubeRaw && !videoFile && !existingDocId) {
    showAdminToast("لطفاً عکس انتخاب کنید یا فایل ویدیو / لینک یوتیوب وارد نمایید.");
    return;
  }

  const submitBtn = document.getElementById("btn-save-product-submit");
  const vendor = getSelectedVendorObj();
  const sku = (document.getElementById("prod-sku")?.value.trim() || generateAutoSku()).toUpperCase();
  const docId = existingDocId || sku;

  const department = document.getElementById("prod-department")?.value || "men";
  const subcategory = document.getElementById("prod-subcategory")?.value || "men-tshirts";
  const leafSub = document.getElementById("prod-leaf-sub")?.value || "";
  const unitPrice = parseFloat(document.getElementById("prod-unit-price")?.value) || 5;
  const pcsPerPack = Math.max(1, parseInt(document.getElementById("prod-pcs-per-pack")?.value, 10) || 6);
  const sizeRange = document.getElementById("prod-size-range")?.value.trim() || "S - M - L - XL - XXL";
  const watermarkEnabled = Boolean(document.getElementById("prod-watermark-toggle")?.checked);

  if (!existingDocId && adminState.stagedImages[0]?.fingerprint) {
    const dup = findDuplicateProductByFingerprint(adminState.stagedImages[0].fingerprint);
    if (dup) {
      showAdminToast(`⚠️ این عکس قبلاً با کد ${dup.sku} آپلود شده است!`);
      return;
    }
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "⏳ در حال آپلود رسانه و ثبت محصول...";
  }

  try {
    const uploadedHdUrls = [];
    let primaryThumbUrl = "";
    const fingerprints = [];

    for (let i = 0; i < adminState.stagedImages.length; i++) {
      const staged = adminState.stagedImages[i];
      if (staged.fingerprint) fingerprints.push(staged.fingerprint);

      if (staged.remoteUrl) {
        uploadedHdUrls.push(staged.remoteUrl);
        if (!primaryThumbUrl) primaryThumbUrl = staged.remoteThumbUrl || staged.remoteUrl;
      } else if (staged.file) {
        const dual = await compressImageToDualWebP(staged.file, watermarkEnabled ? sku : "");
        if (i === 0 && dual.aiBase64) {
          adminState.sessionAiBase64Map.set(sku, dual.aiBase64);
        }
        const { hdUrl, thumbUrl } = await uploadDualWebPToStorage(dual, department, sku, i);
        uploadedHdUrls.push(hdUrl);
        if (!primaryThumbUrl) primaryThumbUrl = thumbUrl;
      }
    }

    let finalVideoUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : youtubeRaw;
    if (videoFile) {
      finalVideoUrl = await uploadVideoFileToStorage(videoFile, department, sku);
    }

    const defaultCover = youtubeId
      ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
      : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=80";

    const primaryImageUrl = uploadedHdUrls[0] || defaultCover;
    const finalThumbUrl = primaryThumbUrl || primaryImageUrl;

    const existingProd = adminState.products.find((p) => p.id === docId);
    const fallbackText = buildSmartFallbackContent(department, subcategory, leafSub, sku, pcsPerPack);

    const productPayload = {
      id: docId,
      code: sku,
      sku,
      vendorCode: vendor.code,
      vendorName: vendor.name,
      fileFingerprint: fingerprints[0] || existingProd?.fileFingerprint || "",
      fileFingerprints: fingerprints.length ? fingerprints : existingProd?.fileFingerprints || [],
      department,
      subcategory,
      leafSub,
      unitPrice,
      pcsPerPack,
      packTotal: Number((unitPrice * pcsPerPack).toFixed(2)),
      sizeRange,
      stockStatus: existingProd?.stockStatus || "in_stock",
      isFeatured: true,
      aiStatus: existingProd?.aiStatus === "completed" ? "completed" : uploadedHdUrls.length > 0 ? "pending" : "completed",
      publicTitle: existingProd?.publicTitle || fallbackText.publicTitle,
      brandTitle: existingProd?.brandTitle || fallbackText.brandTitle,
      description: existingProd?.description || fallbackText.description,
      searchTags: existingProd?.searchTags || [sku.toLowerCase(), vendor.code.toLowerCase(), department, subcategory, leafSub.toLowerCase()].filter(Boolean),
      imageUrl: primaryImageUrl,
      thumbUrl: finalThumbUrl,
      images: uploadedHdUrls.length > 0 ? uploadedHdUrls : [primaryImageUrl],
      videoUrl: finalVideoUrl || "",
      youtubeId: youtubeId || "",
      createdAtMillis: existingProd?.createdAtMillis || Date.now(),
      updatedAtIso: new Date().toISOString(),
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, "products", docId), productPayload, { merge: true });

    const idx = adminState.products.findIndex((p) => p.id === docId);
    if (idx > -1) {
      adminState.products[idx] = productPayload;
    } else {
      adminState.products.unshift(productPayload);
    }

    await rebuildAllCatalogShards();
    syncVendorsFromProductsAndConfig();
    renderCatalogTable();
    updateAiQueueCounters();
    resetProductForm();
    showAdminToast(`✓ محصول ${sku} با موفقیت ذخیره شد!`);

    if (productPayload.aiStatus === "pending" && getActiveGeminiKeys().length > 0 && !adminState.aiWorkerRunning) {
      startBackgroundAiWorker();
    }
  } catch (err) {
    showAdminToast(`خطا در ثبت محصول: ${err.message}`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "🚀 شروع آپلود موازی (۸تایی) و ثبت محصولات";
    }
  }
}

/* ==========================================================================
   10. CORS-FREE BACKGROUND AI WORKER
   ========================================================================== */
function updateAiQueueCounters() {
  const pendingCount = adminState.products.filter((p) => p.aiStatus === "pending").length;
  const doneCount = adminState.products.filter((p) => p.aiStatus === "completed").length;

  const pendEl = document.getElementById("ai-queue-pending-count");
  const doneEl = document.getElementById("ai-queue-done-count");
  if (pendEl) pendEl.textContent = String(pendingCount);
  if (doneEl) doneEl.textContent = String(doneCount);
}

async function getProductBase64ForAi(prod) {
  const cached = adminState.sessionAiBase64Map.get(prod.sku) || adminState.sessionAiBase64Map.get(prod.id);
  if (cached) return cached;

  try {
    const res = await fetch(prod.thumbUrl || prod.imageUrl);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return "";
  }
}

async function startBackgroundAiWorker() {
  if (adminState.aiWorkerRunning) return;
  if (getActiveGeminiKeys().length === 0) {
    showAdminToast("برای تگ‌گذاری خودکار، ابتدا کلید جمنای را در تب ۸ وارد کنید.");
    return;
  }

  adminState.aiWorkerRunning = true;
  adminState.aiWorkerStopRequested = false;

  const miniStatus = document.getElementById("ai-worker-mini-status");
  const startBtn = document.getElementById("btn-start-ai-worker");
  const stopBtn = document.getElementById("btn-stop-ai-worker");

  if (startBtn) startBtn.style.display = "none";
  if (stopBtn) stopBtn.style.display = "inline-flex";

  let processed = 0;

  while (!adminState.aiWorkerStopRequested) {
    const nextProd = adminState.products.find((p) => p.aiStatus === "pending");
    if (!nextProd) break;

    updateAiQueueCounters();
    if (miniStatus) miniStatus.textContent = `در حال تگ‌گذاری ${nextProd.sku}...`;

    try {
      const base64Data = await getProductBase64ForAi(nextProd);
      const parts = [];
      if (base64Data) {
        parts.push({ inlineData: { mimeType: "image/webp", data: base64Data } });
      }
      parts.push({
        text: `
Analyze this B2B wholesale item (Code: ${nextProd.sku}, Category: ${nextProd.subcategory} ${nextProd.leafSub || ""}).
Return ONLY valid JSON:
{
  "publicTitle": {
    "en": "Luxury B2B wholesale title describing fabric & cut WITHOUT brand names (append • Code ${nextProd.sku})",
    "it": "Italian luxury wholesale title WITHOUT brand names (append • Cod. ${nextProd.sku})",
    "es": "Spanish luxury wholesale title WITHOUT brand names (append • Cód. ${nextProd.sku})"
  },
  "brandTitle": {
    "en": "Detected brand + model title for internal search (append • ${nextProd.sku})",
    "it": "Italian brand title",
    "es": "Spanish brand title"
  },
  "searchTags": ["12 lowercase keywords in en, it, es, and Persian"],
  "description": {
    "en": "2-sentence B2B wholesale description (${nextProd.pcsPerPack} pcs serie pack, Istanbul direct)",
    "it": "2-sentence Italian wholesale description",
    "es": "2-sentence Spanish wholesale description"
  }
}`.trim()
      });

      const aiRes = await callGeminiWithRotator([{ role: "user", parts }], true);
      const fallback = buildSmartFallbackContent(
        nextProd.department,
        nextProd.subcategory,
        nextProd.leafSub,
        nextProd.sku,
        nextProd.pcsPerPack
      );

      const updates = {
        publicTitle: {
          en: aiRes?.publicTitle?.en || fallback.publicTitle.en,
          it: aiRes?.publicTitle?.it || fallback.publicTitle.it,
          es: aiRes?.publicTitle?.es || fallback.publicTitle.es
        },
        brandTitle: {
          en: aiRes?.brandTitle?.en || aiRes?.publicTitle?.en || fallback.brandTitle.en,
          it: aiRes?.brandTitle?.it || aiRes?.publicTitle?.it || fallback.brandTitle.it,
          es: aiRes?.brandTitle?.es || aiRes?.publicTitle?.es || fallback.brandTitle.es
        },
        description: {
          en: aiRes?.description?.en || fallback.description.en,
          it: aiRes?.description?.it || fallback.description.it,
          es: aiRes?.description?.es || fallback.description.es
        },
        searchTags: Array.from(
          new Set([
            ...(Array.isArray(nextProd.searchTags) ? nextProd.searchTags : []),
            ...(Array.isArray(aiRes?.searchTags) ? aiRes.searchTags.map((t) => String(t).toLowerCase()) : [])
          ])
        ),
        aiStatus: "completed",
        updatedAtIso: new Date().toISOString()
      };

      await updateDoc(doc(db, "products", nextProd.id), updates);
      Object.assign(nextProd, updates);
      adminState.sessionAiBase64Map.delete(nextProd.sku);
      processed++;
      updateAiQueueCounters();
      renderCatalogTable();

      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      nextProd.aiStatus = "completed";
      await updateDoc(doc(db, "products", nextProd.id), { aiStatus: "completed" }).catch(() => {});
      updateAiQueueCounters();
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  adminState.aiWorkerRunning = false;
  if (startBtn) startBtn.style.display = "inline-flex";
  if (stopBtn) stopBtn.style.display = "none";
  updateAiQueueCounters();

  if (processed > 0) await rebuildAllCatalogShards();
  if (miniStatus) miniStatus.textContent = adminState.aiWorkerStopRequested ? "متوقف شد" : "✓ همه تکمیل شد";
}

function resetProductForm() {
  document.getElementById("admin-product-form")?.reset();
  const docIdEl = document.getElementById("prod-doc-id");
  if (docIdEl) docIdEl.value = "";
  const titleEl = document.getElementById("product-form-mode-title");
  if (titleEl) titleEl.textContent = "🚀 آپلود پرسرعت (۸ عکس همزمان + ساخت نسخه سبک و HD)";
  adminState.stagedImages = [];
  renderStagedImagePreviews();
  populateAllTaxonomySelects();
  generateAutoSku();
  updatePackMathDisplay();
}

function bindProductUploaderEvents() {
  document.getElementById("upload-mode-selector")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-mode]");
    if (!btn) return;
    const mode = btn.getAttribute("data-mode");

    document.querySelectorAll("#upload-mode-selector .mode-btn").forEach((b) => {
      b.classList.toggle("active", b === btn);
    });

    const modeInput = document.getElementById("batch-upload-mode");
    if (modeInput) modeInput.value = mode;

    const photoBox = document.getElementById("media-upload-box-photos");
    if (photoBox) {
      photoBox.style.display = mode === "video" ? "none" : "block";
    }
  });

  const drawer = document.getElementById("new-vendor-drawer");
  document.getElementById("btn-toggle-new-vendor")?.addEventListener("click", () => {
    if (!drawer) return;
    drawer.style.display = drawer.style.display === "none" ? "block" : "none";
  });

  document.getElementById("btn-save-new-vendor")?.addEventListener("click", async () => {
    const name = (document.getElementById("new-vendor-name")?.value || "").trim();
    const code = (document.getElementById("new-vendor-code")?.value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const phone = (document.getElementById("new-vendor-phone")?.value || "").trim();
    const address = (document.getElementById("new-vendor-address")?.value || "").trim();

    if (!name || !code) {
      showAdminToast("لطفاً نام و کد عمده‌فروش را وارد کنید.");
      return;
    }

    await saveOrUpdateVendorRecord(code, name, phone, address);
    renderVendorDropdowns(code);
    generateAutoSku();
    if (drawer) drawer.style.display = "none";
  });

  document.getElementById("prod-vendor-select")?.addEventListener("change", () => {
    if (!document.getElementById("prod-doc-id")?.value) generateAutoSku();
  });

  document.getElementById("prod-department")?.addEventListener("change", (e) => {
    populateSubcategoryDropdown(e.target.value);
  });

  document.getElementById("prod-subcategory")?.addEventListener("change", (e) => {
    const deptId = document.getElementById("prod-department")?.value || "men";
    populateLeafSubDropdown(deptId, e.target.value);
  });

  document.getElementById("btn-autogen-sku")?.addEventListener("click", generateAutoSku);
  document.getElementById("prod-unit-price")?.addEventListener("input", updatePackMathDisplay);
  document.getElementById("prod-pcs-per-pack")?.addEventListener("input", updatePackMathDisplay);

  document.querySelectorAll(".size-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-preset");
      const sizeInput = document.getElementById("prod-size-range");
      if (sizeInput && preset) sizeInput.value = preset;
    });
  });

  const fileInput = document.getElementById("product-file-input");
  fileInput?.addEventListener("change", (e) => {
    if (e.target.files) handleFilesSelected(e.target.files);
    fileInput.value = "";
  });

  document.getElementById("product-upload-previews")?.addEventListener("click", (e) => {
    const rmBtn = e.target.closest("[data-remove-staged]");
    if (!rmBtn) return;
    const idx = parseInt(rmBtn.getAttribute("data-remove-staged"), 10);
    adminState.stagedImages.splice(idx, 1);
    renderStagedImagePreviews();
  });

  document.getElementById("btn-retry-failed-uploads")?.addEventListener("click", async () => {
    if (adminState.failedUploadQueue.length === 0) return;
    await executeParallelBatchUpload([...adminState.failedUploadQueue], true);
  });

  document.getElementById("btn-start-ai-worker")?.addEventListener("click", startBackgroundAiWorker);
  document.getElementById("btn-stop-ai-worker")?.addEventListener("click", () => {
    adminState.aiWorkerStopRequested = true;
  });

  document.getElementById("btn-reset-product-form")?.addEventListener("click", resetProductForm);
  document.getElementById("admin-product-form")?.addEventListener("submit", handleSaveProductForm);
}

/* ==========================================================================
   11. TAB 2: CATALOG MANAGER, BULK PRICE/PACK EDITOR & PERSISTENT CHECKBOXES
   ========================================================================== */
async function rebuildAllCatalogShards() {
  try {
    const hiddenDeptIds = new Set(adminState.taxonomy.filter((d) => d.hidden).map((d) => d.id));
    const hiddenSubcatIds = new Set();
    adminState.taxonomy.forEach((d) => {
      (d.subcategories || []).forEach((s) => {
        if (s.hidden) hiddenSubcatIds.add(s.id);
      });
    });

    // فقط محصولاتی که دسته‌بندی آن‌ها مخفی نیست در شارد عمومی مشتریان قرار می‌گیرند
    const visibleProducts = adminState.products.filter(
      (p) => !hiddenDeptIds.has(p.department) && !hiddenSubcatIds.has(p.subcategory)
    );

    const items = visibleProducts.map((p) => ({
      id: p.id || p.sku,
      sku: p.sku || p.code || p.id,
      vendorCode: p.vendorCode || "PRD",
      department: p.department || "men",
      subcategory: p.subcategory || "men-tshirts",
      leafSub: p.leafSub || "",
      unitPrice: Number(p.unitPrice) || 0,
      pcsPerPack: Math.max(1, parseInt(p.pcsPerPack, 10) || 6),
      sizeRange: p.sizeRange || "S - M - L - XL",
      stockStatus: p.stockStatus || "in_stock",
      isFeatured: Boolean(p.isFeatured),
      publicTitle: p.publicTitle || { en: `Wholesale Garment • ${p.sku}` },
      brandTitle: p.brandTitle || p.publicTitle || { en: `Wholesale Garment • ${p.sku}` },
      searchTags: Array.isArray(p.searchTags) ? p.searchTags : [],
      imageUrl: p.imageUrl || "",
      thumbUrl: p.thumbUrl || p.imageUrl || "",
      images: Array.isArray(p.images) ? p.images : [p.imageUrl],
      videoUrl: p.videoUrl || "",
      youtubeId: p.youtubeId || "",
      createdAtMillis: p.createdAtMillis || Date.now()
    }));

    await setDoc(doc(db, "catalog_shards", "latest"), {
      updatedAtIso: new Date().toISOString(),
      items: items.slice(0, 24)
    });

    const masterTotalPages = Math.max(1, Math.ceil(items.length / SHARD_CHUNK_SIZE));
    await setDoc(doc(db, "catalog_shards", "master_catalog"), {
      updatedAtIso: new Date().toISOString(),
      totalCount: items.length,
      totalPages: masterTotalPages,
      chunkSize: SHARD_CHUNK_SIZE,
      items: items.slice(0, 200)
    });

    for (const deptObj of adminState.taxonomy) {
      const deptItems = items.filter((i) => i.department === deptObj.id);
      const totalPages = Math.max(1, Math.ceil(deptItems.length / SHARD_CHUNK_SIZE));

      await setDoc(doc(db, "catalog_shards", deptObj.id), {
        department: deptObj.id,
        updatedAtIso: new Date().toISOString(),
        totalCount: deptItems.length,
        totalPages,
        page: 1,
        items: deptItems.slice(0, SHARD_CHUNK_SIZE)
      });

      for (let page = 2; page <= totalPages; page++) {
        const chunk = deptItems.slice((page - 1) * SHARD_CHUNK_SIZE, page * SHARD_CHUNK_SIZE);
        await setDoc(doc(db, "catalog_shards", `${deptObj.id}_p${page}`), {
          department: deptObj.id,
          updatedAtIso: new Date().toISOString(),
          page,
          totalPages,
          items: chunk
        });
      }
    }
  } catch (err) {
    console.warn("Shard sync warning:", err.message);
  }
}

async function loadProductsCatalog() {
  try {
    const q = query(collection(db, "products"), orderBy("createdAtMillis", "desc"), limit(5000));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    adminState.products = list;
  } catch (err) {
    try {
      const fallbackSnap = await getDocs(collection(db, "products"));
      const list = [];
      fallbackSnap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      adminState.products = list;
    } catch (e) {}
  }
  populateAllTaxonomySelects();
  renderCatalogTable();
  updateAiQueueCounters();
}

function getFilteredCatalogProducts() {
  const vendorFilter = document.getElementById("catalog-filter-vendor")?.value || "all";
  const deptFilter = document.getElementById("catalog-filter-dept")?.value || "all";
  const subcatFilter = document.getElementById("catalog-filter-subcat")?.value || "all";
  const priceFilterRaw = (document.getElementById("catalog-filter-price")?.value || "").trim();
  const priceFilter = priceFilterRaw !== "" ? parseFloat(priceFilterRaw) : null;
  const searchQ = (document.getElementById("catalog-search-input")?.value || "").trim().toLowerCase();

  return adminState.products.filter((p) => {
    const pVendor = String(p.vendorCode || String(p.sku || "").split("-")[0] || "PRD").toUpperCase();
    if (vendorFilter !== "all" && pVendor !== vendorFilter) return false;
    if (deptFilter !== "all" && p.department !== deptFilter) return false;
    if (subcatFilter !== "all" && p.subcategory !== subcatFilter) return false;
    if (priceFilter !== null && !isNaN(priceFilter) && Number(p.unitPrice) !== priceFilter) return false;
    if (searchQ) {
      const pubEn = p.publicTitle?.en || "";
      const brdEn = p.brandTitle?.en || "";
      const tags = Array.isArray(p.searchTags) ? p.searchTags.join(" ") : "";
      const hay = `${p.sku || ""} ${pVendor} ${p.vendorName || ""} ${pubEn} ${brdEn} ${tags}`.toLowerCase();
      if (!hay.includes(searchQ)) return false;
    }
    return true;
  });
}

function updateSelectionCountersUI() {
  const selCountEl = document.getElementById("catalog-selected-count");
  if (selCountEl) selCountEl.textContent = String(adminState.selectedProductIds.size);
}

function renderCatalogTable() {
  const tbody = document.getElementById("admin-catalog-tbody");
  const countEl = document.getElementById("catalog-showing-count");
  const loadMoreBtn = document.getElementById("btn-load-more-catalog");
  if (!tbody) return;

  const filtered = getFilteredCatalogProducts();
  if (countEl) countEl.textContent = String(filtered.length);
  updateSelectionCountersUI();

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">هیچ محصولی با این فیلتر یافت نشد.</td></tr>`;
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  const visibleSlice = filtered.slice(0, adminState.catalogDisplayLimit);

  if (loadMoreBtn) {
    if (filtered.length > adminState.catalogDisplayLimit) {
      loadMoreBtn.style.display = "inline-flex";
      loadMoreBtn.textContent = `⬇️ نمایش ۱۰۰ محصول بعدی (${visibleSlice.length} از ${filtered.length} — حفظ تیک‌های قبلی)`;
    } else {
      loadMoreBtn.style.display = "none";
    }
  }

  const isSuper = adminState.role === "super_admin";

  tbody.innerHTML = visibleSlice
    .map((p) => {
      const id = escapeHtml(p.id || p.sku);
      const sku = escapeHtml(p.sku || p.id);
      const vCode = escapeHtml(p.vendorCode || String(p.sku || "").split("-")[0] || "PRD");
      const subcat = escapeHtml(p.subcategory || p.department || "men");
      const unitPrice = Number(p.unitPrice) || 0;
      const pcs = Math.max(1, parseInt(p.pcsPerPack, 10) || 6);
      const packTotal = formatMoney(unitPrice * pcs);
      const stock = p.stockStatus || "in_stock";
      const img = escapeHtml(p.thumbUrl || p.imageUrl || "");
      const hasVideo = Boolean(p.videoUrl || p.youtubeId);
      const isChecked = adminState.selectedProductIds.has(p.id || p.sku);

      return `
        <tr class="${isChecked ? "selected-row" : ""}" data-row-id="${id}">
          <td style="text-align:center;">
            <input type="checkbox" class="catalog-row-check" data-check-id="${id}" ${isChecked ? "checked" : ""} style="width:17px; height:17px; cursor:pointer;" />
          </td>
          <td>
            <img src="${img}" alt="${sku}" style="width:44px; height:58px; object-fit:cover; border-radius:6px; border:1px solid var(--border);" loading="lazy" />
          </td>
          <td>
            <strong style="color:var(--gold-dark); display:block; direction:ltr; text-align:right;">${sku}</strong>
            <span style="font-size:0.7rem; color:var(--text-muted);">${vCode} | ${subcat}</span>
            ${hasVideo ? `<span style="display:inline-block; font-size:0.65rem; background:#dbeafe; color:#1e40af; padding:1px 5px; border-radius:4px;">🎬 ویدیو</span>` : ""}
          </td>
          <td>
            <input type="number" step="0.5" class="input" data-inline-price="${id}" value="${unitPrice}" style="width:74px; padding:5px; direction:ltr;" ${!isSuper ? "readonly" : ""} />
          </td>
          <td>
            <input type="number" step="1" min="1" class="input" data-inline-pcs="${id}" value="${pcs}" style="width:64px; padding:5px; direction:ltr;" ${!isSuper ? "readonly" : ""} />
          </td>
          <td style="font-weight:800; direction:ltr;">${packTotal}</td>
          <td>
            <select class="select" data-inline-stock="${id}" style="width:105px; padding:5px; font-size:0.74rem;">
              <option value="in_stock" ${stock === "in_stock" ? "selected" : ""}>🟢 موجود</option>
              <option value="low_stock" ${stock === "low_stock" ? "selected" : ""}>🟡 محدود</option>
              <option value="out_of_stock" ${stock === "out_of_stock" ? "selected" : ""}>🔴 ناموجود</option>
            </select>
          </td>
          <td style="white-space:nowrap;">
            <button type="button" class="btn-outline" data-save-inline="${id}" title="ذخیره سریع">💾</button>
            <button type="button" class="btn-outline" data-open-title-modal="${id}" title="مشاهده و ویرایش عنوان">🏷️ عنوان</button>
            <button type="button" class="btn-outline" data-open-video-modal="${id}" title="آپلود فایل ویدیو یا لینک">🎬 ویدیو</button>
            ${isSuper ? `<button type="button" class="btn-outline" data-delete-prod="${id}" style="color:var(--danger); border-color:#fecaca;" title="حذف">🗑</button>` : ""}
          </td>
        </tr>
      `;
    })
    .join("");
}

/**
 * تغییر دسته‌جمعی قیمت یا تعداد در پک (روی محصولات تیک‌خورده، یا اگر تیکی نباشد روی کل فیلتر فعلی)
 */
async function executeBulkCatalogUpdate(fieldType, newValue) {
  const filtered = getFilteredCatalogProducts();
  const targets =
    adminState.selectedProductIds.size > 0
      ? adminState.products.filter((p) => adminState.selectedProductIds.has(p.id))
      : filtered;

  if (targets.length === 0) {
    showAdminToast("هیچ محصولی انتخاب یا فیلتر نشده است.");
    return;
  }

  const label = fieldType === "price" ? `قیمت جدید $${newValue}` : `تعداد در پک ${newValue} تایی`;
  if (!confirm(`آیا مطمئن هستید که می‌خواهید برای ${targets.length} محصول، ${label} را به صورت یکجا اعمال کنید؟`)) {
    return;
  }

  showAdminToast(`⏳ در حال بروزرسانی ${targets.length} محصول...`);

  try {
    for (let i = 0; i < targets.length; i += PARALLEL_UPLOAD_LIMIT) {
      const chunk = targets.slice(i, i + PARALLEL_UPLOAD_LIMIT);
      await Promise.all(
        chunk.map(async (prod) => {
          const newPrice = fieldType === "price" ? Number(newValue) : Number(prod.unitPrice) || 5;
          const newPcs = fieldType === "pcs" ? Math.max(1, parseInt(newValue, 10)) : Math.max(1, parseInt(prod.pcsPerPack, 10) || 6);
          const packTotal = Number((newPrice * newPcs).toFixed(2));

          await updateDoc(doc(db, "products", prod.id), {
            unitPrice: newPrice,
            pcsPerPack: newPcs,
            packTotal,
            updatedAtIso: new Date().toISOString()
          });

          prod.unitPrice = newPrice;
          prod.pcsPerPack = newPcs;
          prod.packTotal = packTotal;
        })
      );
    }

    await rebuildAllCatalogShards();
    renderCatalogTable();
    showAdminToast(`✓ تعداد ${targets.length} محصول با موفقیت به ${label} تغییر یافت!`);
  } catch (err) {
    showAdminToast(`خطا در بروزرسانی گروهی: ${err.message}`);
  }
}

async function deleteProductList(targetProducts) {
  if (!targetProducts || targetProducts.length === 0) return;
  if (!confirm(`آیا مطمئن هستید که ${targetProducts.length} محصول برای همیشه از کل سایت حذف شوند؟`)) return;

  showAdminToast(`⏳ در حال حذف ${targetProducts.length} محصول...`);
  try {
    const deletedIds = new Set();
    for (let i = 0; i < targetProducts.length; i += PARALLEL_UPLOAD_LIMIT) {
      const chunk = targetProducts.slice(i, i + PARALLEL_UPLOAD_LIMIT);
      await Promise.all(
        chunk.map(async (prod) => {
          await deleteDoc(doc(db, "products", prod.id));
          deletedIds.add(prod.id);
          adminState.selectedProductIds.delete(prod.id);
        })
      );
    }

    adminState.products = adminState.products.filter((p) => !deletedIds.has(p.id));
    await rebuildAllCatalogShards();
    syncVendorsFromProductsAndConfig();
    renderCatalogTable();
    updateAiQueueCounters();
    showAdminToast(`✓ تعداد ${deletedIds.size} محصول از کل سایت حذف شد.`);
  } catch (err) {
    showAdminToast(`خطا در حذف: ${err.message}`);
  }
}

function bindCatalogManagerEvents() {
  const resetLimitAndRender = () => {
    adminState.catalogDisplayLimit = 100;
    renderCatalogTable();
  };

  document.getElementById("catalog-filter-vendor")?.addEventListener("change", resetLimitAndRender);
  document.getElementById("catalog-filter-dept")?.addEventListener("change", (e) => {
    populateCatalogFilterSubcategories(e.target.value);
    resetLimitAndRender();
  });
  document.getElementById("catalog-filter-subcat")?.addEventListener("change", resetLimitAndRender);
  document.getElementById("catalog-filter-price")?.addEventListener("input", resetLimitAndRender);
  document.getElementById("catalog-search-input")?.addEventListener("input", resetLimitAndRender);

  // دکمه بارگذاری ۱۰۰ محصول بعدی بدون پریدن تیک‌ها
  document.getElementById("btn-load-more-catalog")?.addEventListener("click", () => {
    adminState.catalogDisplayLimit += 100;
    renderCatalogTable();
  });

  // انتخاب همه فیلتر شده‌ها
  document.getElementById("catalog-select-all-filtered")?.addEventListener("change", (e) => {
    const checked = e.target.checked;
    const filtered = getFilteredCatalogProducts();
    filtered.forEach((p) => {
      if (checked) adminState.selectedProductIds.add(p.id);
      else adminState.selectedProductIds.delete(p.id);
    });
    renderCatalogTable();
  });

  document.getElementById("btn-clear-selected-checks")?.addEventListener("click", () => {
    adminState.selectedProductIds.clear();
    const selAll = document.getElementById("catalog-select-all-filtered");
    if (selAll) selAll.checked = false;
    renderCatalogTable();
  });

  // تغییر گروهی قیمت و تعداد پک
  document.getElementById("btn-apply-bulk-price")?.addEventListener("click", async () => {
    const val = parseFloat(document.getElementById("bulk-new-unit-price")?.value);
    if (!val || val <= 0) {
      showAdminToast("لطفاً قیمت جدید را وارد کنید.");
      return;
    }
    await executeBulkCatalogUpdate("price", val);
  });

  document.getElementById("btn-apply-bulk-pcs")?.addEventListener("click", async () => {
    const val = parseInt(document.getElementById("bulk-new-pcs-pack")?.value, 10);
    if (!val || val < 1) {
      showAdminToast("لطفاً تعداد جدید در پک را وارد کنید.");
      return;
    }
    await executeBulkCatalogUpdate("pcs", val);
  });

  // حذف تیک‌خورده‌ها یا حذف کل فیلتر
  document.getElementById("btn-delete-selected-products")?.addEventListener("click", async () => {
    if (adminState.selectedProductIds.size === 0) {
      showAdminToast("ابتدا محصولات مورد نظر را تیک بزنید.");
      return;
    }
    const targets = adminState.products.filter((p) => adminState.selectedProductIds.has(p.id));
    await deleteProductList(targets);
  });

  document.getElementById("btn-bulk-delete-filtered")?.addEventListener("click", async () => {
    const vendorFilter = document.getElementById("catalog-filter-vendor")?.value || "all";
    const deptFilter = document.getElementById("catalog-filter-dept")?.value || "all";
    const subcatFilter = document.getElementById("catalog-filter-subcat")?.value || "all";
    if (vendorFilter === "all" && deptFilter === "all" && subcatFilter === "all") {
      showAdminToast("⚠️ ابتدا یک عمده‌فروش یا شاخه را فیلتر کنید.");
      return;
    }
    await deleteProductList(getFilteredCatalogProducts());
  });

  document.getElementById("btn-rebuild-all-shards")?.addEventListener("click", async () => {
    await rebuildAllCatalogShards();
    showAdminToast("✓ کاتالوگ سایت بروزرسانی شد!");
  });

  // رویدادهای جدول محصولات
  document.getElementById("admin-catalog-tbody")?.addEventListener("change", (e) => {
    const check = e.target.closest(".catalog-row-check");
    if (!check) return;
    const id = check.getAttribute("data-check-id");
    if (check.checked) adminState.selectedProductIds.add(id);
    else adminState.selectedProductIds.delete(id);
    check.closest("tr")?.classList.toggle("selected-row", check.checked);
    updateSelectionCountersUI();
  });

  document.getElementById("admin-catalog-tbody")?.addEventListener("click", async (e) => {
    const target = e.target;

    const saveBtn = target.closest("[data-save-inline]");
    if (saveBtn) {
      const id = saveBtn.getAttribute("data-save-inline");
      const row = saveBtn.closest("tr");
      const newPrice = parseFloat(row.querySelector(`[data-inline-price="${id}"]`)?.value) || 0;
      const newPcs = Math.max(1, parseInt(row.querySelector(`[data-inline-pcs="${id}"]`)?.value, 10) || 6);
      const newStock = row.querySelector(`[data-inline-stock="${id}"]`)?.value || "in_stock";

      try {
        await updateDoc(doc(db, "products", id), {
          unitPrice: newPrice,
          pcsPerPack: newPcs,
          packTotal: Number((newPrice * newPcs).toFixed(2)),
          stockStatus: newStock,
          updatedAtIso: new Date().toISOString()
        });
        const prod = adminState.products.find((p) => p.id === id);
        if (prod) {
          prod.unitPrice = newPrice;
          prod.pcsPerPack = newPcs;
          prod.stockStatus = newStock;
        }
        await rebuildAllCatalogShards();
        renderCatalogTable();
        showAdminToast(`✓ ذخیره شد.`);
      } catch (err) {
        showAdminToast(`خطا: ${err.message}`);
      }
      return;
    }

    // باز کردن پاپ‌آپ ویرایش عنوان (🏷️ عنوان)
    const titleBtn = target.closest("[data-open-title-modal]");
    if (titleBtn) {
      const id = titleBtn.getAttribute("data-open-title-modal");
      const prod = adminState.products.find((p) => p.id === id);
      if (!prod) return;

      document.getElementById("modal-prod-id").value = prod.id;
      document.getElementById("modal-title-heading").textContent = `🏷️ عنوان و تگ‌های محصول: ${prod.sku}`;
      document.getElementById("modal-pub-en").value = prod.publicTitle?.en || "";
      document.getElementById("modal-pub-it").value = prod.publicTitle?.it || "";
      document.getElementById("modal-pub-es").value = prod.publicTitle?.es || "";
      document.getElementById("modal-brand-en").value = prod.brandTitle?.en || "";
      document.getElementById("modal-search-tags").value = Array.isArray(prod.searchTags) ? prod.searchTags.join(", ") : "";
      document.getElementById("modal-desc-en").value = prod.description?.en || "";
      document.getElementById("modal-edit-titles")?.classList.add("open");
      return;
    }

    // باز کردن پاپ‌آپ افزودن فایل ویدیو یا لینک به محصول (🎬 ویدیو)
    const vidBtn = target.closest("[data-open-video-modal]");
    if (vidBtn) {
      const id = vidBtn.getAttribute("data-open-video-modal");
      const prod = adminState.products.find((p) => p.id === id);
      if (!prod) return;

      document.getElementById("modal-video-prod-id").value = prod.id;
      document.getElementById("modal-video-heading").textContent = `🎬 ویدیوی محصول: ${prod.sku}`;
      document.getElementById("modal-video-url-input").value = prod.videoUrl || (prod.youtubeId ? `https://youtu.be/${prod.youtubeId}` : "");
      const fileInp = document.getElementById("modal-video-file-input");
      if (fileInp) fileInp.value = "";
      document.getElementById("modal-product-video")?.classList.add("open");
      return;
    }

    const delBtn = target.closest("[data-delete-prod]");
    if (delBtn) {
      const id = delBtn.getAttribute("data-delete-prod");
      const prod = adminState.products.find((p) => p.id === id);
      if (prod) await deleteProductList([prod]);
    }
  });

  // رویدادهای مودال عنوان و مودال ویدیوی محصول
  document.getElementById("btn-close-title-modal")?.addEventListener("click", () => {
    document.getElementById("modal-edit-titles")?.classList.remove("open");
  });

  document.getElementById("form-modal-edit-titles")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("modal-prod-id").value;
    const prod = adminState.products.find((p) => p.id === id);
    if (!prod) return;

    const publicTitle = {
      en: document.getElementById("modal-pub-en").value.trim(),
      it: document.getElementById("modal-pub-it").value.trim(),
      es: document.getElementById("modal-pub-es").value.trim()
    };
    const brandTitle = {
      ...prod.brandTitle,
      en: document.getElementById("modal-brand-en").value.trim() || publicTitle.en
    };
    const searchTags = document
      .getElementById("modal-search-tags")
      .value.split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const description = {
      ...prod.description,
      en: document.getElementById("modal-desc-en").value.trim()
    };

    await updateDoc(doc(db, "products", id), { publicTitle, brandTitle, searchTags, description, aiStatus: "completed" });
    Object.assign(prod, { publicTitle, brandTitle, searchTags, description, aiStatus: "completed" });
    await rebuildAllCatalogShards();
    document.getElementById("modal-edit-titles")?.classList.remove("open");
    renderCatalogTable();
    showAdminToast("✓ عناوین محصول ذخیره شد.");
  });

  document.getElementById("btn-close-video-modal")?.addEventListener("click", () => {
    document.getElementById("modal-product-video")?.classList.remove("open");
  });

  document.getElementById("form-modal-product-video")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("modal-video-prod-id").value;
    const prod = adminState.products.find((p) => p.id === id);
    if (!prod) return;

    const btn = document.getElementById("btn-save-modal-video");
    const file = document.getElementById("modal-video-file-input")?.files?.[0] || null;
    const rawUrl = document.getElementById("modal-video-url-input")?.value.trim() || "";
    const ytId = extractYouTubeId(rawUrl);

    if (btn) {
      btn.disabled = true;
      btn.textContent = "⏳ در حال آپلود ویدیو...";
    }

    try {
      let finalVideoUrl = rawUrl;
      if (file) {
        finalVideoUrl = await uploadVideoFileToStorage(file, prod.department, prod.sku);
      }
      await updateDoc(doc(db, "products", id), {
        videoUrl: finalVideoUrl,
        youtubeId: ytId || "",
        updatedAtIso: new Date().toISOString()
      });
      prod.videoUrl = finalVideoUrl;
      prod.youtubeId = ytId || "";
      await rebuildAllCatalogShards();
      renderCatalogTable();
      document.getElementById("modal-product-video")?.classList.remove("open");
      showAdminToast(`🎬 ویدیو به محصول ${prod.sku} اضافه شد!`);
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "💾 آپلود و ذخیره ویدیوی محصول";
      }
    }
  });

  document.getElementById("btn-remove-modal-video")?.addEventListener("click", async () => {
    const id = document.getElementById("modal-video-prod-id").value;
    const prod = adminState.products.find((p) => p.id === id);
    if (!prod) return;
    await updateDoc(doc(db, "products", id), { videoUrl: "", youtubeId: "" });
    prod.videoUrl = "";
    prod.youtubeId = "";
    await rebuildAllCatalogShards();
    renderCatalogTable();
    document.getElementById("modal-product-video")?.classList.remove("open");
    showAdminToast("ویدیوی محصول حذف شد.");
  });
}

/* ==========================================================================
   12. TAB 3: VISUAL CATEGORIES, SEASONAL REORDER (⬆️⬇️) & HIDE/SHOW (👁️)
   ========================================================================== */
async function saveTaxonomyToFirestore() {
  adminState.publicConfig.taxonomy = adminState.taxonomy;
  await setDoc(doc(db, "settings", "public_config"), { taxonomy: adminState.taxonomy }, { merge: true });
  await rebuildAllCatalogShards();
  populateAllTaxonomySelects();
  renderCategoriesManagerUI();
}

function renderCategoriesManagerUI() {
  const deptTbody = document.getElementById("admin-departments-tbody");
  if (deptTbody) {
    deptTbody.innerHTML = adminState.taxonomy
      .map(
        (d, idx) => `
        <tr>
          <td><img src="${escapeHtml(d.image || "")}" style="width:48px; height:48px; object-fit:cover; border-radius:8px; border:1px solid var(--border);" /></td>
          <td>
            <strong>${escapeHtml(d.labelFa || d.label)}</strong> (${escapeHtml(d.label)})<br>
            <code style="font-size:0.72rem; color:var(--text-muted);">${escapeHtml(d.id)}</code>
          </td>
          <td>${(d.subcategories || []).length} شاخه</td>
          <td>
            <button type="button" class="btn-outline" data-toggle-dept-vis="${idx}" style="background:${d.hidden ? "#fef2f2" : "#ecfdf5"}; color:${d.hidden ? "#991b1b" : "#065f46"};">
              ${d.hidden ? "🙈 مخفی در سایت (کلیک برای نمایش)" : "👁️ فعال در سایت"}
            </button>
          </td>
          <td>
            <button type="button" class="btn-outline" data-move-dept="${idx}:-1" ${idx === 0 ? "disabled" : ""}>⬆️ بالا</button>
            <button type="button" class="btn-outline" data-move-dept="${idx}:1" ${idx === adminState.taxonomy.length - 1 ? "disabled" : ""}>⬇️ پایین</button>
          </td>
          <td>
            <button type="button" class="btn-outline" data-edit-dept="${idx}">✏️ ویرایش/عکس</button>
            <button type="button" class="btn-outline" data-del-dept="${idx}" style="color:var(--danger);">🗑</button>
          </td>
        </tr>
      `
      )
      .join("");
  }

  renderSubcategoriesManagerTable();
}

function renderSubcategoriesManagerTable() {
  const subTbody = document.getElementById("admin-subcategories-tbody");
  if (!subTbody) return;
  const filterDeptId = document.getElementById("filter-subcat-manager-dept")?.value || adminState.taxonomy[0]?.id || "men";
  const deptObj = adminState.taxonomy.find((d) => d.id === filterDeptId) || adminState.taxonomy[0];
  const subs = deptObj?.subcategories || [];

  if (subs.length === 0) {
    subTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--text-muted);">هنوز شاخه‌ای برای این بخش ثبت نشده است.</td></tr>`;
    return;
  }

  subTbody.innerHTML = subs
    .map(
      (sc, idx) => `
      <tr>
        <td><img src="${escapeHtml(sc.image || "")}" style="width:48px; height:58px; object-fit:cover; border-radius:8px; border:1px solid var(--border);" /></td>
        <td>
          <strong>${escapeHtml(sc.labelFa || sc.label)}</strong> (${escapeHtml(sc.label)})<br>
          <code style="font-size:0.72rem; color:var(--text-muted);">${escapeHtml(sc.id)}</code>
        </td>
        <td>${Array.isArray(sc.leaves) && sc.leaves.length ? escapeHtml(sc.leaves.join(" ، ")) : "—"}</td>
        <td>
          <button type="button" class="btn-outline" data-toggle-sub-vis="${deptObj.id}:${idx}" style="background:${sc.hidden ? "#fef2f2" : "#ecfdf5"}; color:${sc.hidden ? "#991b1b" : "#065f46"};">
            ${sc.hidden ? "🙈 مخفی (کلیک برای نمایش)" : "👁️ فعال در سایت"}
          </button>
        </td>
        <td>
          <button type="button" class="btn-outline" data-move-sub="${deptObj.id}:${idx}:-1" ${idx === 0 ? "disabled" : ""}>⬆️</button>
          <button type="button" class="btn-outline" data-move-sub="${deptObj.id}:${idx}:1" ${idx === subs.length - 1 ? "disabled" : ""}>⬇️</button>
        </td>
        <td>
          <button type="button" class="btn-outline" data-edit-sub="${deptObj.id}:${idx}">✏️ ویرایش/عکس</button>
          <button type="button" class="btn-outline" data-del-sub="${deptObj.id}:${idx}" style="color:var(--danger);">🗑</button>
        </td>
      </tr>
    `
    )
    .join("");
}

function bindCategoriesManagerEvents() {
  document.getElementById("filter-subcat-manager-dept")?.addEventListener("change", renderSubcategoriesManagerTable);

  // افزودن یا ویرایش بخش اصلی
  document.getElementById("form-add-department")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = slugify(document.getElementById("dept-id-input").value.trim(), "dept");
    const labelFa = document.getElementById("dept-label-fa").value.trim();
    const label = document.getElementById("dept-label-en").value.trim();
    const labelItEs = document.getElementById("dept-label-ites").value.trim();
    const imgFile = document.getElementById("dept-image-file")?.files?.[0] || null;
    let image = document.getElementById("dept-image-url").value.trim();

    const btn = document.getElementById("btn-save-dept");
    if (btn) btn.disabled = true;

    try {
      if (imgFile) {
        image = await uploadSingleImageAsset(imgFile, "categories/depts", 700);
      }
      const existing = adminState.taxonomy.find((d) => d.id === id);
      if (existing) {
        existing.labelFa = labelFa;
        existing.label = label;
        existing.labelItEs = labelItEs;
        if (image) existing.image = image;
      } else {
        adminState.taxonomy.push({
          id,
          labelFa,
          label,
          labelItEs,
          hidden: false,
          image: image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
          subcategories: []
        });
      }
      await saveTaxonomyToFirestore();
      e.target.reset();
      showAdminToast(`✓ بخش "${labelFa}" ذخیره شد!`);
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  // رویدادهای جدول بخش‌های اصلی (مخفی‌سازی، جابجایی، ویرایش، حذف)
  document.getElementById("admin-departments-tbody")?.addEventListener("click", async (e) => {
    const toggleBtn = e.target.closest("[data-toggle-dept-vis]");
    if (toggleBtn) {
      const idx = parseInt(toggleBtn.getAttribute("data-toggle-dept-vis"), 10);
      adminState.taxonomy[idx].hidden = !adminState.taxonomy[idx].hidden;
      await saveTaxonomyToFirestore();
      showAdminToast(adminState.taxonomy[idx].hidden ? "بخش در سایت مخفی شد." : "بخش در سایت فعال شد.");
      return;
    }

    const moveBtn = e.target.closest("[data-move-dept]");
    if (moveBtn) {
      const [idxStr, dirStr] = moveBtn.getAttribute("data-move-dept").split(":");
      const idx = parseInt(idxStr, 10);
      const targetIdx = idx + parseInt(dirStr, 10);
      if (targetIdx < 0 || targetIdx >= adminState.taxonomy.length) return;
      const temp = adminState.taxonomy[idx];
      adminState.taxonomy[idx] = adminState.taxonomy[targetIdx];
      adminState.taxonomy[targetIdx] = temp;
      await saveTaxonomyToFirestore();
      return;
    }

    const editBtn = e.target.closest("[data-edit-dept]");
    if (editBtn) {
      const idx = parseInt(editBtn.getAttribute("data-edit-dept"), 10);
      const d = adminState.taxonomy[idx];
      document.getElementById("dept-id-input").value = d.id;
      document.getElementById("dept-label-fa").value = d.labelFa || "";
      document.getElementById("dept-label-en").value = d.label || "";
      document.getElementById("dept-label-ites").value = d.labelItEs || "";
      document.getElementById("dept-image-url").value = d.image || "";
      return;
    }

    const delBtn = e.target.closest("[data-del-dept]");
    if (delBtn) {
      const idx = parseInt(delBtn.getAttribute("data-del-dept"), 10);
      if (!confirm(`آیا بخش "${adminState.taxonomy[idx].labelFa}" حذف شود؟`)) return;
      adminState.taxonomy.splice(idx, 1);
      await saveTaxonomyToFirestore();
    }
  });

  // افزودن یا ویرایش شاخه (مثلاً کلاه مردانه) و زیرمجموعه‌ها (مثلاً جاگر) + عکس اختصاصی
  document.getElementById("form-add-subcategory")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const deptId = document.getElementById("subcat-parent-dept").value;
    const deptObj = adminState.taxonomy.find((d) => d.id === deptId);
    if (!deptObj) return;

    const rawId = document.getElementById("subcat-id-input").value.trim();
    const id = slugify(rawId.startsWith(deptId) ? rawId : `${deptId}-${rawId}`, `${deptId}-item`);
    const labelFa = document.getElementById("subcat-label-fa").value.trim();
    const label = document.getElementById("subcat-label-en").value.trim();
    const leaves = document
      .getElementById("subcat-leaves-input")
      .value.split(/[,،]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const imgFile = document.getElementById("subcat-image-file")?.files?.[0] || null;
    let image = document.getElementById("subcat-image-url").value.trim();

    const btn = document.getElementById("btn-save-subcat");
    if (btn) btn.disabled = true;

    try {
      if (imgFile) {
        image = await uploadSingleImageAsset(imgFile, "categories/subcats", 600);
      }
      if (!Array.isArray(deptObj.subcategories)) deptObj.subcategories = [];
      const existing = deptObj.subcategories.find((s) => s.id === id);

      if (existing) {
        existing.labelFa = labelFa;
        existing.label = label;
        existing.en = `Luxury Turkish Wholesale ${label}`;
        existing.leaves = leaves;
        if (image) existing.image = image;
      } else {
        deptObj.subcategories.push({
          id,
          labelFa,
          label,
          en: `Luxury Turkish Wholesale ${label}`,
          it: `Ingrosso ${label}`,
          es: `Mayorista ${label}`,
          hidden: false,
          image: image || deptObj.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
          leaves
        });
      }

      document.getElementById("filter-subcat-manager-dept").value = deptId;
      await saveTaxonomyToFirestore();
      e.target.reset();
      showAdminToast(`✓ شاخه "${labelFa}" ذخیره شد!`);
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  // رویدادهای جدول شاخه‌ها (مخفی‌سازی، جابجایی فصلی ⬆️⬇️، ویرایش عکس، حذف)
  document.getElementById("admin-subcategories-tbody")?.addEventListener("click", async (e) => {
    const toggleBtn = e.target.closest("[data-toggle-sub-vis]");
    if (toggleBtn) {
      const [deptId, idxStr] = toggleBtn.getAttribute("data-toggle-sub-vis").split(":");
      const deptObj = adminState.taxonomy.find((d) => d.id === deptId);
      const sc = deptObj?.subcategories?.[parseInt(idxStr, 10)];
      if (!sc) return;
      sc.hidden = !sc.hidden;
      await saveTaxonomyToFirestore();
      showAdminToast(sc.hidden ? `شاخه "${sc.labelFa}" در سایت مخفی شد.` : `شاخه "${sc.labelFa}" در سایت فعال شد.`);
      return;
    }

    const moveBtn = e.target.closest("[data-move-sub]");
    if (moveBtn) {
      const [deptId, idxStr, dirStr] = moveBtn.getAttribute("data-move-sub").split(":");
      const deptObj = adminState.taxonomy.find((d) => d.id === deptId);
      const subs = deptObj?.subcategories || [];
      const idx = parseInt(idxStr, 10);
      const targetIdx = idx + parseInt(dirStr, 10);
      if (targetIdx < 0 || targetIdx >= subs.length) return;
      const temp = subs[idx];
      subs[idx] = subs[targetIdx];
      subs[targetIdx] = temp;
      await saveTaxonomyToFirestore();
      return;
    }

    const editBtn = e.target.closest("[data-edit-sub]");
    if (editBtn) {
      const [deptId, idxStr] = editBtn.getAttribute("data-edit-sub").split(":");
      const deptObj = adminState.taxonomy.find((d) => d.id === deptId);
      const sc = deptObj?.subcategories?.[parseInt(idxStr, 10)];
      if (!sc) return;

      document.getElementById("subcat-parent-dept").value = deptId;
      document.getElementById("subcat-id-input").value = sc.id;
      document.getElementById("subcat-label-fa").value = sc.labelFa || "";
      document.getElementById("subcat-label-en").value = sc.label || "";
      document.getElementById("subcat-leaves-input").value = (sc.leaves || []).join(", ");
      document.getElementById("subcat-image-url").value = sc.image || "";
      showAdminToast(`شاخه "${sc.labelFa}" در فرم بالا بارگذاری شد.`);
      return;
    }

    const delBtn = e.target.closest("[data-del-sub]");
    if (delBtn) {
      const [deptId, idxStr] = delBtn.getAttribute("data-del-sub").split(":");
      const deptObj = adminState.taxonomy.find((d) => d.id === deptId);
      const idx = parseInt(idxStr, 10);
      if (!deptObj?.subcategories?.[idx]) return;
      if (!confirm(`آیا شاخه "${deptObj.subcategories[idx].labelFa}" حذف شود؟`)) return;
      deptObj.subcategories.splice(idx, 1);
      await saveTaxonomyToFirestore();
    }
  });
}

/* ==========================================================================
   13. TAB 4: VENDORS CRM (CODE, NAME & SUPER-ADMIN PRIVATE PHONE/ADDRESS)
   ========================================================================== */
async function saveOrUpdateVendorRecord(code, name, phone = "", address = "", originalCode = "") {
  const cleanCode = String(code).trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!cleanCode) return;

  if (originalCode && originalCode !== cleanCode) {
    adminState.vendors = adminState.vendors.filter((v) => v.code !== originalCode);
    delete adminState.vendorSecrets[originalCode];
  }

  const existing = adminState.vendors.find((v) => v.code === cleanCode);
  if (existing) {
    existing.name = name;
  } else {
    adminState.vendors.push({ code: cleanCode, name });
  }

  adminState.publicConfig.vendors = adminState.vendors;
  await setDoc(doc(db, "settings", "public_config"), { vendors: adminState.vendors }, { merge: true });

  // ذخیره شماره تلفن و آدرس عمده‌فروش فقط در سند محرمانه مدیر کل
  if (adminState.role === "super_admin") {
    adminState.vendorSecrets[cleanCode] = {
      phone: phone || adminState.vendorSecrets[cleanCode]?.phone || "",
      address: address || adminState.vendorSecrets[cleanCode]?.address || ""
    };
    adminState.adminSecrets.vendorSecrets = adminState.vendorSecrets;
    await setDoc(doc(db, "settings", "admin_secrets"), { vendorSecrets: adminState.vendorSecrets }, { merge: true });
  }

  renderVendorDropdowns(cleanCode);
  renderVendorsManagerTable();
  updateDashboardKPIs();
  showAdminToast(`✓ اطلاعات عمده‌فروش ${cleanCode} (${name}) ذخیره شد.`);
}

function renderVendorsManagerTable() {
  const tbody = document.getElementById("admin-vendors-tbody");
  if (!tbody) return;

  const isSuper = adminState.role === "super_admin";
  const counts = {};
  adminState.products.forEach((p) => {
    const c = String(p.vendorCode || String(p.sku || "").split("-")[0] || "PRD").toUpperCase();
    counts[c] = (counts[c] || 0) + 1;
  });

  tbody.innerHTML = adminState.vendors
    .map((v) => {
      const secret = adminState.vendorSecrets[v.code] || {};
      const cnt = counts[v.code] || 0;
      return `
        <tr>
          <td><strong style="color:var(--gold-dark); font-size:0.92rem; direction:ltr;">${escapeHtml(v.code)}</strong></td>
          <td><strong>${escapeHtml(v.name)}</strong></td>
          <td>${cnt} محصول</td>
          ${
            isSuper
              ? `<td>
                  <div style="font-size:0.78rem;">📞 <strong style="direction:ltr; display:inline-block;">${escapeHtml(secret.phone || "ثبت نشده")}</strong></div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">📍 ${escapeHtml(secret.address || "آدرس ثبت نشده")}</div>
                </td>`
              : ""
          }
          <td style="white-space:nowrap;">
            <button type="button" class="btn-outline" data-edit-vendor="${escapeHtml(v.code)}">✏️ ویرایش</button>
            ${isSuper ? `<button type="button" class="btn-outline" data-delete-vendor="${escapeHtml(v.code)}" style="color:var(--danger);">🗑 حذف</button>` : ""}
          </td>
        </tr>
      `;
    })
    .join("");
}

function bindVendorsManagerEvents() {
  document.getElementById("form-manage-vendor")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const origCode = document.getElementById("vendor-original-code").value.trim();
    const code = document.getElementById("vendor-form-code").value.trim();
    const name = document.getElementById("vendor-form-name").value.trim();
    const phone = document.getElementById("vendor-form-phone")?.value.trim() || "";
    const address = document.getElementById("vendor-form-address")?.value.trim() || "";

    await saveOrUpdateVendorRecord(code, name, phone, address, origCode);
    e.target.reset();
    document.getElementById("vendor-original-code").value = "";
  });

  document.getElementById("btn-reset-vendor-form")?.addEventListener("click", () => {
    document.getElementById("form-manage-vendor")?.reset();
    document.getElementById("vendor-original-code").value = "";
  });

  document.getElementById("admin-vendors-tbody")?.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit-vendor]");
    if (editBtn) {
      const code = editBtn.getAttribute("data-edit-vendor");
      const v = adminState.vendors.find((x) => x.code === code);
      if (!v) return;
      const sec = adminState.vendorSecrets[code] || {};

      document.getElementById("vendor-original-code").value = v.code;
      document.getElementById("vendor-form-code").value = v.code;
      document.getElementById("vendor-form-name").value = v.name;
      if (document.getElementById("vendor-form-phone")) document.getElementById("vendor-form-phone").value = sec.phone || "";
      if (document.getElementById("vendor-form-address")) document.getElementById("vendor-form-address").value = sec.address || "";
      return;
    }

    const delBtn = e.target.closest("[data-delete-vendor]");
    if (delBtn) {
      const code = delBtn.getAttribute("data-delete-vendor");
      if (!confirm(`آیا عمده‌فروش ${code} از لیست حذف شود؟`)) return;
      adminState.vendors = adminState.vendors.filter((x) => x.code !== code);
      delete adminState.vendorSecrets[code];
      await setDoc(doc(db, "settings", "public_config"), { vendors: adminState.vendors }, { merge: true });
      if (adminState.role === "super_admin") {
        await setDoc(doc(db, "settings", "admin_secrets"), { vendorSecrets: adminState.vendorSecrets }, { merge: true });
      }
      renderVendorDropdowns();
      renderVendorsManagerTable();
      updateDashboardKPIs();
    }
  });
}

/* ==========================================================================
   14. TAB 5, 6, 7, 8: ORDERS, VIDEOS, EDITABLE BLOGS & GLOBAL SETTINGS
   ========================================================================== */
async function loadOrdersAndCustomers() {
  try {
    const ordSnap = await getDocs(collection(db, "orders"));
    const ordersList = [];
    ordSnap.forEach((d) => ordersList.push({ id: d.id, orderCode: d.id, ...d.data() }));
    adminState.orders = ordersList;
  } catch (e) {}

  try {
    const custSnap = await getDocs(collection(db, "customers"));
    const custList = [];
    custSnap.forEach((d) => custList.push({ id: d.id, ...d.data() }));
    adminState.customers = custList;
  } catch (e) {}

  renderOrdersTable();
  renderCustomersTable();
}

function renderOrdersTable() {
  const tbody = document.getElementById("admin-orders-tbody");
  if (!tbody) return;
  const searchQ = (document.getElementById("orders-search-input")?.value || "").trim().toLowerCase();
  const statusFilter = document.getElementById("orders-status-filter")?.value || "all";

  const filtered = adminState.orders.filter((o) => {
    if (statusFilter !== "all" && (o.status || "pending_whatsapp") !== statusFilter) return false;
    if (searchQ) {
      return `${o.orderCode || ""} ${o.buyerName || ""} ${o.buyerCountry || ""} ${o.buyerPhone || ""}`.toLowerCase().includes(searchQ);
    }
    return true;
  });

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:18px; color:var(--text-muted);">سفارشی یافت نشد.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((o) => {
      const code = escapeHtml(o.orderCode || o.id);
      const dateStr = o.createdAtIso ? new Date(o.createdAtIso).toLocaleDateString("fa-IR") : "2026";
      const cleanPhone = String(o.buyerPhone || "").replace(/[^0-9]/g, "");
      const amount = formatMoney(o.totalAmount || 0);
      const status = o.status || "pending_whatsapp";
      const invoiceUrl = `order.html?id=${encodeURIComponent(o.orderCode || o.id)}`;
      const waHref = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${o.buyerName || ""}! Regarding your Paradise Wholesale Order ${code} (${amount}): ${SITE_DOMAIN}/${invoiceUrl}`)}`
        : "#";

      return `
        <tr>
          <td><strong>${code}</strong><br><small style="color:var(--text-muted);">${escapeHtml(dateStr)}</small></td>
          <td><strong>${escapeHtml(o.buyerName || "—")}</strong></td>
          <td>${escapeHtml(o.buyerCountry || "—")}</td>
          <td style="direction:ltr;">${escapeHtml(o.buyerPhone || "—")}</td>
          <td>${Number(o.totalPacks) || 0} پک (${Number(o.totalPieces) || 0} عدد)</td>
          <td style="font-weight:800; direction:ltr;">${amount}</td>
          <td>
            <select class="select" data-order-status-change="${code}" style="padding:5px; font-size:0.74rem; width:135px;">
              <option value="pending_whatsapp" ${status === "pending_whatsapp" ? "selected" : ""}>🟡 انتظار واتساپ</option>
              <option value="preparing" ${status === "preparing" ? "selected" : ""}>🔵 آماده‌سازی</option>
              <option value="shipped" ${status === "shipped" ? "selected" : ""}>🟣 ارسال شده</option>
              <option value="completed" ${status === "completed" ? "selected" : ""}>🟢 تکمیل شده</option>
            </select>
          </td>
          <td style="white-space:nowrap;">
            <a href="${invoiceUrl}" target="_blank" class="btn-outline">📄 فاکتور</a>
            <a href="${waHref}" target="_blank" class="btn-outline" style="background:#ecfdf5; color:#065f46;">💬 واتساپ</a>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderCustomersTable() {
  const tbody = document.getElementById("admin-customers-tbody");
  if (!tbody) return;
  const q = (document.getElementById("customers-search-input")?.value || "").trim().toLowerCase();
  const filtered = adminState.customers.filter((c) => !q || `${c.name || ""} ${c.country || ""} ${c.phone || ""}`.toLowerCase().includes(q));

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--text-muted);">مشتری یافت نشد.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((c) => {
      const cleanPhone = String(c.phone || "").replace(/[^0-9]/g, "");
      return `
        <tr>
          <td><strong>${escapeHtml(c.name || "—")}</strong></td>
          <td>${escapeHtml(c.country || "—")}</td>
          <td style="direction:ltr;">${escapeHtml(c.phone || "—")}</td>
          <td>${escapeHtml(c.lastOrderCode || "—")}</td>
          <td style="direction:ltr;">${formatMoney(c.lastOrderAmount || 0)}</td>
          <td>${cleanPhone ? `<a href="https://wa.me/${cleanPhone}" target="_blank" class="btn-outline">💬 پیام</a>` : "—"}</td>
        </tr>
      `;
    })
    .join("");
}

function bindOrdersAndCrmEvents() {
  document.getElementById("orders-search-input")?.addEventListener("input", renderOrdersTable);
  document.getElementById("orders-status-filter")?.addEventListener("change", renderOrdersTable);
  document.getElementById("customers-search-input")?.addEventListener("input", renderCustomersTable);
  document.getElementById("btn-refresh-orders")?.addEventListener("click", loadOrdersAndCustomers);

  document.getElementById("admin-orders-tbody")?.addEventListener("change", async (e) => {
    const sel = e.target.closest("[data-order-status-change]");
    if (!sel) return;
    const code = sel.getAttribute("data-order-status-change");
    await updateDoc(doc(db, "orders", code), { status: sel.value, updatedAt: serverTimestamp() });
    showAdminToast(`✓ وضعیت سفارش ${code} ذخیره شد.`);
  });

  document.getElementById("btn-export-customers-csv")?.addEventListener("click", () => {
    if (!adminState.customers.length) return;
    const rows = ["Name,Country,Phone,LastOrder,Amount"].concat(
      adminState.customers.map((c) => `"${c.name || ""}","${c.country || ""}","${c.phone || ""}","${c.lastOrderCode || ""}",${c.lastOrderAmount || 0}`)
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" }));
    a.download = "paradise_customers.csv";
    a.click();
  });
}

function renderShowroomVideosTable() {
  const tbody = document.getElementById("admin-showroom-videos-tbody");
  if (!tbody) return;
  const list = Array.isArray(adminState.publicConfig.showroomVideos) ? adminState.publicConfig.showroomVideos : [];
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:16px; color:var(--text-muted);">ویدیویی در ویترین ثبت نشده است.</td></tr>`;
    return;
  }
  tbody.innerHTML = list
    .map((v, idx) => {
      const ytId = escapeHtml(v.ytId || "");
      const thumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "";
      return `
        <tr>
          <td>${thumb ? `<img src="${thumb}" style="width:46px; height:60px; object-fit:cover; border-radius:6px;" />` : "🎬 فایل ویدیو"}</td>
          <td><strong>${escapeHtml(v.title || "")}</strong></td>
          <td>${escapeHtml(v.dept || "all")}</td>
          <td style="direction:ltr;"><code>${ytId || "MP4 Video"}</code></td>
          <td><button type="button" class="btn-outline" data-remove-showroom-vid="${idx}" style="color:var(--danger);">🗑 حذف</button></td>
        </tr>
      `;
    })
    .join("");
}

function renderCargoVideosTable() {
  const tbody = document.getElementById("admin-cargo-videos-tbody");
  if (!tbody) return;
  const list = Array.isArray(adminState.publicConfig.cargoVideos) ? adminState.publicConfig.cargoVideos : [];
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:16px; color:var(--text-muted);">ویدیوی رضایت و بار ثبت نشده است.</td></tr>`;
    return;
  }
  tbody.innerHTML = list
    .map((v, idx) => {
      const ytId = escapeHtml(v.ytId || "");
      const thumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "";
      return `
        <tr>
          <td>${thumb ? `<img src="${thumb}" style="width:46px; height:60px; object-fit:cover; border-radius:6px;" />` : "🎬 ویدیو"}</td>
          <td>${escapeHtml(v.badge || "CARGO")}</td>
          <td><strong>${escapeHtml(v.title || "")}</strong></td>
          <td style="direction:ltr;"><code>${ytId || "MP4"}</code></td>
          <td><button type="button" class="btn-outline" data-remove-cargo-vid="${idx}" style="color:var(--danger);">🗑 حذف</button></td>
        </tr>
      `;
    })
    .join("");
}

function bindVideosManagerEvents() {
  document.getElementById("admin-hero-video-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rawUrl = document.getElementById("hero-yt-url").value.trim();
    const ytId = extractYouTubeId(rawUrl) || rawUrl;
    const poster = document.getElementById("hero-yt-poster").value.trim() || `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`;
    const title = document.getElementById("hero-yt-title").value.trim() || "Istanbul Warehouse & Live Order Packing";

    adminState.publicConfig.heroVideo = { ytId, poster, title };
    await setDoc(doc(db, "settings", "public_config"), { heroVideo: adminState.publicConfig.heroVideo }, { merge: true });
    showAdminToast("✓ ویدیوی صفحه اول ذخیره شد!");
  });

  // افزودن ویدیو به ویترین (پشتیبانی از فایل گالری یا لینک یوتیوب)
  document.getElementById("admin-add-showroom-video-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = document.getElementById("showroom-vid-file")?.files?.[0] || null;
    const rawUrl = document.getElementById("showroom-vid-url")?.value.trim() || "";
    const title = document.getElementById("showroom-vid-title").value.trim();
    const dept = document.getElementById("showroom-vid-dept").value || "all";

    if (!file && !rawUrl) {
      showAdminToast("لطفاً یک فایل ویدیو از گالری انتخاب کنید یا لینک یوتیوب بدهید.");
      return;
    }

    const btn = document.getElementById("btn-submit-showroom-vid");
    if (btn) btn.disabled = true;

    try {
      let finalUrl = rawUrl;
      if (file) {
        finalUrl = await uploadVideoFileToStorage(file, "showroom", "SHOWROOM");
      }
      const ytId = extractYouTubeId(finalUrl);
      const thumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "";

      if (!Array.isArray(adminState.publicConfig.showroomVideos)) adminState.publicConfig.showroomVideos = [];
      adminState.publicConfig.showroomVideos.unshift({ url: finalUrl, ytId, title, dept, thumb });

      await setDoc(doc(db, "settings", "public_config"), { showroomVideos: adminState.publicConfig.showroomVideos }, { merge: true });
      renderShowroomVideosTable();
      e.target.reset();
      showAdminToast("✓ ویدیو به ویترین سایت اضافه شد!");
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  document.getElementById("admin-showroom-videos-tbody")?.addEventListener("click", async (e) => {
    const rmBtn = e.target.closest("[data-remove-showroom-vid]");
    if (!rmBtn) return;
    const idx = parseInt(rmBtn.getAttribute("data-remove-showroom-vid"), 10);
    adminState.publicConfig.showroomVideos.splice(idx, 1);
    await setDoc(doc(db, "settings", "public_config"), { showroomVideos: adminState.publicConfig.showroomVideos }, { merge: true });
    renderShowroomVideosTable();
  });

  // افزودن ویدیوی رضایت مشتریان و ارسال بار (فایل گالری یا لینک یوتیوب)
  document.getElementById("admin-add-cargo-video-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = document.getElementById("cargo-vid-file")?.files?.[0] || null;
    const rawUrl = document.getElementById("cargo-vid-url")?.value.trim() || "";
    const badge = document.getElementById("cargo-vid-badge").value.trim();
    const title = document.getElementById("cargo-vid-title").value.trim();

    if (!file && !rawUrl) {
      showAdminToast("لطفاً فایل ویدیو یا لینک یوتیوب را وارد کنید.");
      return;
    }

    const btn = document.getElementById("btn-submit-cargo-vid");
    if (btn) btn.disabled = true;

    try {
      let finalUrl = rawUrl;
      if (file) {
        finalUrl = await uploadVideoFileToStorage(file, "cargo", "CARGO");
      }
      const ytId = extractYouTubeId(finalUrl);
      const thumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "";

      if (!Array.isArray(adminState.publicConfig.cargoVideos)) adminState.publicConfig.cargoVideos = [];
      adminState.publicConfig.cargoVideos.unshift({ url: finalUrl, ytId, badge, title, thumb });

      await setDoc(doc(db, "settings", "public_config"), { cargoVideos: adminState.publicConfig.cargoVideos }, { merge: true });
      renderCargoVideosTable();
      e.target.reset();
      showAdminToast("✓ ویدیوی ارسال بار اضافه شد!");
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  document.getElementById("admin-cargo-videos-tbody")?.addEventListener("click", async (e) => {
    const rmBtn = e.target.closest("[data-remove-cargo-vid]");
    if (!rmBtn) return;
    const idx = parseInt(rmBtn.getAttribute("data-remove-cargo-vid"), 10);
    adminState.publicConfig.cargoVideos.splice(idx, 1);
    await setDoc(doc(db, "settings", "public_config"), { cargoVideos: adminState.publicConfig.cargoVideos }, { merge: true });
    renderCargoVideosTable();
  });
}

/* وبلاگ ۳ زبانه با قابلیت ویرایش توسط مدیر کل */
async function loadPublishedBlogs() {
  try {
    const snap = await getDocs(collection(db, "blogs"));
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    adminState.blogs = list;
  } catch (e) {}
  renderPublishedBlogsTable();
}

function renderPublishedBlogsTable() {
  const tbody = document.getElementById("admin-blogs-tbody");
  if (!tbody) return;
  if (!adminState.blogs.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:18px; color:var(--text-muted);">هنوز مقاله‌ای منتشر نشده است.</td></tr>`;
    return;
  }
  tbody.innerHTML = adminState.blogs
    .map((b) => {
      const id = escapeHtml(b.id);
      const titleEn = escapeHtml(b.title?.en || b.title || "Article");
      const slugEn = escapeHtml(b.slugs?.en || b.slug || id);
      return `
        <tr>
          <td><img src="${escapeHtml(b.coverImage || "")}" style="width:52px; height:34px; object-fit:cover; border-radius:4px;" /></td>
          <td><strong>${titleEn}</strong></td>
          <td style="direction:ltr;"><a href="blog.html?slug=${encodeURIComponent(slugEn)}" target="_blank">/en/blog/${slugEn}/ ↗</a></td>
          <td>${escapeHtml(b.publishedAt || "2026")}</td>
          <td style="white-space:nowrap;">
            <button type="button" class="btn-outline" data-edit-blog="${id}">✏️ ویرایش</button>
            <button type="button" class="btn-outline" data-delete-blog="${id}" style="color:var(--danger);">🗑 حذف</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function syncBlogIndexToFirestore() {
  await setDoc(doc(db, "settings", "blog_index"), {
    updatedAtIso: new Date().toISOString(),
    articles: adminState.blogs.map((b) => ({
      id: b.id,
      slug: b.slug,
      slugs: b.slugs,
      category: b.category,
      coverImage: b.coverImage,
      title: b.title,
      excerpt: b.excerpt,
      publishedAt: b.publishedAt
    }))
  });
}

async function commitFileToGitHub(filePath, contentString, commitMessage) {
  const token = (document.getElementById("cfg-github-token")?.value || adminState.adminSecrets.githubToken || "").trim();
  const repo = (document.getElementById("cfg-github-repo")?.value || adminState.adminSecrets.githubRepo || "").trim();
  const branch = (document.getElementById("cfg-github-branch")?.value || adminState.adminSecrets.githubBranch || "main").trim();

  if (!token || !repo) throw new Error("توکن یا ریپازیتوری گیت‌هاب در تب ۸ وارد نشده است.");

  const cleanPath = filePath.replace(/^\/+/, "");
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${cleanPath}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json"
  };

  let existingSha = null;
  try {
    const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers });
    if (getRes.ok) {
      const existingData = await getRes.json();
      existingSha = existingData.sha || null;
    }
  } catch (e) {}

  const bodyPayload = { message: commitMessage, content: utf8ToBase64(contentString), branch };
  if (existingSha) bodyPayload.sha = existingSha;

  const putRes = await fetch(apiUrl, { method: "PUT", headers, body: JSON.stringify(bodyPayload) });
  if (!putRes.ok) throw new Error(`GitHub HTTP ${putRes.status}`);
  return await putRes.json();
}

async function buildAndPushSitemapAndRobots() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_DOMAIN}/`, priority: "1.0" },
    { loc: `${SITE_DOMAIN}/category.html`, priority: "0.9" },
    { loc: `${SITE_DOMAIN}/blog.html`, priority: "0.8" }
  ];

  adminState.taxonomy
    .filter((d) => !d.hidden)
    .forEach((dept) => {
      urls.push({ loc: `${SITE_DOMAIN}/category.html?dept=${dept.id}`, priority: "0.85" });
      (dept.subcategories || [])
        .filter((s) => !s.hidden)
        .forEach((sc) => {
          urls.push({ loc: `${SITE_DOMAIN}/category.html?dept=${dept.id}&cat=${sc.id}`, priority: "0.75" });
        });
    });

  adminState.blogs.forEach((b) => {
    const sEn = b.slugs?.en || b.slug || b.id;
    urls.push({ loc: `${SITE_DOMAIN}/en/blog/${encodeURIComponent(sEn)}/`, priority: "0.8" });
  });

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`)
    .join("\n")}\n</urlset>`;

  // عدم درج نام raminreza.html در robots.txt تا هیچ هکری نتواند آدرس مخفی پنل را پیدا کند
  const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /order.html\nDisallow: /*?q=*\nSitemap: ${SITE_DOMAIN}/sitemap.xml\n`;

  await commitFileToGitHub("sitemap.xml", sitemapXml, "Update sitemap.xml");
  await commitFileToGitHub("robots.txt", robotsTxt, "Update robots.txt");
}

function bindBlogStudioEvents() {
  document.getElementById("btn-auto-generate-and-publish-blog")?.addEventListener("click", async () => {
    const promptInput = document.getElementById("blog-ai-prompt")?.value.trim();
    if (!promptInput) {
      showAdminToast("لطفاً موضوع مقاله را بنویسید.");
      return;
    }

    const btn = document.getElementById("btn-auto-generate-and-publish-blog");
    const statusEl = document.getElementById("blog-ai-status");
    const category = document.getElementById("blog-category-select")?.value || "logistics";
    const coverImage =
      document.getElementById("blog-cover-url")?.value.trim() ||
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85";

    if (btn) btn.disabled = true;
    if (statusEl) statusEl.textContent = "⏳ جمنای در حال نگارش مقاله ۳ زبانه...";

    const blogPrompt = `
Write a B2B wholesale SEO article for Paradise Wholesale Clothing Istanbul (${SITE_DOMAIN}) about: "${promptInput}".
Include HTML headings (<h2>, <p>) and internal links to ${SITE_DOMAIN}/category.html. Do NOT mention luxury brand names.
Return ONLY valid JSON:
{
  "en": { "title": "...", "slug": "...", "metaDescription": "...", "htmlContent": "<h2>...</h2><p>...</p>" },
  "it": { "title": "...", "slug": "...", "metaDescription": "...", "htmlContent": "<h2>...</h2><p>...</p>" },
  "es": { "title": "...", "slug": "...", "metaDescription": "...", "htmlContent": "<h2>...</h2><p>...</p>" }
}`.trim();

    try {
      const data = await callGeminiWithRotator([{ role: "user", parts: [{ text: blogPrompt }] }], true);
      const slugEn = slugify(data?.en?.slug || data?.en?.title, `guide-${Date.now()}`);
      const nowIso = new Date().toISOString();

      const payload = {
        id: slugEn,
        slug: slugEn,
        slugs: {
          en: slugEn,
          it: slugify(data?.it?.slug || data?.it?.title, `${slugEn}-it`),
          es: slugify(data?.es?.slug || data?.es?.title, `${slugEn}-es`)
        },
        category,
        coverImage,
        title: { en: data?.en?.title || "Wholesale Guide", it: data?.it?.title || "", es: data?.es?.title || "" },
        metaTitle: { en: data?.en?.title || "", it: data?.it?.title || "", es: data?.es?.title || "" },
        metaDescription: { en: data?.en?.metaDescription || "", it: data?.it?.metaDescription || "", es: data?.es?.metaDescription || "" },
        excerpt: { en: data?.en?.metaDescription || "", it: data?.it?.metaDescription || "", es: data?.es?.metaDescription || "" },
        content: { en: data?.en?.htmlContent || "", it: data?.it?.htmlContent || "", es: data?.es?.htmlContent || "" },
        publishedAt: nowIso.slice(0, 10),
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "blogs", slugEn), payload, { merge: true });
      adminState.blogs.unshift(payload);
      await syncBlogIndexToFirestore();
      renderPublishedBlogsTable();
      updateDashboardKPIs();
      if (statusEl) statusEl.textContent = "✓ مقاله ۳ زبانه منتشر شد!";
      showAdminToast("🚀 مقاله ۳ زبانه تولید و منتشر شد!");
    } catch (err) {
      if (statusEl) statusEl.textContent = `خطا: ${err.message}`;
      showAdminToast(`خطا: ${err.message}`);
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  document.getElementById("admin-blogs-tbody")?.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit-blog]");
    if (editBtn) {
      const id = editBtn.getAttribute("data-edit-blog");
      const art = adminState.blogs.find((b) => b.id === id);
      if (!art) return;

      document.getElementById("edit-blog-id").value = art.id;
      document.getElementById("edit-blog-title-en").value = art.title?.en || "";
      document.getElementById("edit-blog-html-en").value = art.content?.en || "";
      document.getElementById("edit-blog-title-it").value = art.title?.it || "";
      document.getElementById("edit-blog-title-es").value = art.title?.es || "";
      document.getElementById("edit-blog-html-it").value = art.content?.it || "";
      document.getElementById("edit-blog-html-es").value = art.content?.es || "";
      document.getElementById("modal-edit-blog")?.classList.add("open");
      return;
    }

    const delBtn = e.target.closest("[data-delete-blog]");
    if (delBtn) {
      const id = delBtn.getAttribute("data-delete-blog");
      if (!confirm("این مقاله حذف شود؟")) return;
      await deleteDoc(doc(db, "blogs", id));
      adminState.blogs = adminState.blogs.filter((b) => b.id !== id);
      await syncBlogIndexToFirestore();
      renderPublishedBlogsTable();
      updateDashboardKPIs();
    }
  });

  document.getElementById("btn-close-blog-modal")?.addEventListener("click", () => {
    document.getElementById("modal-edit-blog")?.classList.remove("open");
  });

  document.getElementById("form-modal-edit-blog")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-blog-id").value;
    const art = adminState.blogs.find((b) => b.id === id);
    if (!art) return;

    art.title = {
      en: document.getElementById("edit-blog-title-en").value.trim(),
      it: document.getElementById("edit-blog-title-it").value.trim(),
      es: document.getElementById("edit-blog-title-es").value.trim()
    };
    art.content = {
      en: document.getElementById("edit-blog-html-en").value.trim(),
      it: document.getElementById("edit-blog-html-it").value.trim(),
      es: document.getElementById("edit-blog-html-es").value.trim()
    };
    art.updatedAtIso = new Date().toISOString();

    await setDoc(doc(db, "blogs", id), art, { merge: true });
    await syncBlogIndexToFirestore();
    renderPublishedBlogsTable();
    document.getElementById("modal-edit-blog")?.classList.remove("open");
    showAdminToast("✓ تغییرات مقاله با موفقیت ذخیره شد!");
  });
}

/* تنظیمات کلی، آپلود لوگو، فرمول حداقل سفارش (۲۵ عدد) و تشخیص سطح دسترسی */
async function loadSettingsFromFirestore() {
  try {
    const pubSnap = await getDoc(doc(db, "settings", "public_config"));
    if (pubSnap.exists()) {
      const data = pubSnap.data();
      adminState.publicConfig = { ...adminState.publicConfig, ...data, currencySymbol: "$", currencyCode: "USD" };
      if (Array.isArray(data.taxonomy) && data.taxonomy.length > 0) {
        adminState.taxonomy = data.taxonomy;
      }
    }
  } catch (e) {}

  const loggedEmail = String(adminState.user?.email || "").trim().toLowerCase();
  const assistants = (adminState.publicConfig.assistantEmails || []).map((e) => String(e).trim().toLowerCase());
  const supers = (adminState.publicConfig.superAdminEmails || []).map((e) => String(e).trim().toLowerCase());

  if (assistants.includes(loggedEmail) && !supers.includes(loggedEmail)) {
    adminState.role = "assistant";
  } else {
    adminState.role = "super_admin";
  }
  applyRolePermissionsUI();

  if (adminState.role === "super_admin") {
    try {
      const secSnap = await getDoc(doc(db, "settings", "admin_secrets"));
      if (secSnap.exists()) {
        adminState.adminSecrets = { ...adminState.adminSecrets, ...secSnap.data() };
        adminState.vendorSecrets = adminState.adminSecrets.vendorSecrets || {};
      }
    } catch (e) {}
  }

  populateSettingsFormUI();
  renderShowroomVideosTable();
  renderCargoVideosTable();
}

function populateSettingsFormUI() {
  const pub = adminState.publicConfig;
  const sec = adminState.adminSecrets;
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null) el.value = val;
  };

  setVal("cfg-logo-url", pub.logoUrl || "");
  setVal("cfg-whatsapp-raw", pub.whatsappRaw || DEFAULT_WHATSAPP);
  setVal("cfg-whatsapp-display", pub.whatsappDisplay || "+90 545 909 93 95");
  setVal("cfg-bulk-threshold", pub.bestRateThreshold || 25);
  setVal("cfg-under-moq-markup", pub.underMoqMarkupPercent ?? 15);

  setVal("cfg-super-admin-emails", (pub.superAdminEmails || sec.superAdminEmails || []).join("\n"));
  setVal("cfg-assistant-emails", (pub.assistantEmails || sec.assistantEmails || []).join("\n"));

  setVal("cfg-ga4-id", pub.ga4MeasurementId || "");
  setVal("cfg-gads-id", pub.googleAdsId || "");
  setVal("cfg-gads-label", pub.googleAdsConversionLabel || "");
  setVal("cfg-gsc-verify", pub.googleSiteVerification || "");

  setVal("cfg-instagram-url", pub.instagramUrl || "");
  setVal("cfg-telegram-url", pub.telegramUrl || "");
  setVal("cfg-tiktok-url", pub.tiktokUrl || "");
  setVal("cfg-android-app-url", pub.androidAppUrl || "");

  if (pub.heroVideo) {
    setVal("hero-yt-url", pub.heroVideo.ytId || "");
    setVal("hero-yt-poster", pub.heroVideo.poster || "");
    setVal("hero-yt-title", pub.heroVideo.title || "");
  }

  const keysArr = Array.isArray(sec.geminiKeys) ? sec.geminiKeys : [];
  setVal("cfg-gemini-keys", keysArr.join("\n"));
  setVal("cfg-gemini-model", sec.geminiModel || "gemini-2.5-flash");
  setVal("cfg-github-token", sec.githubToken || "");
  setVal("cfg-github-repo", sec.githubRepo || "");
  setVal("cfg-github-branch", sec.githubBranch || "main");

  const badge = document.getElementById("gemini-key-count-badge");
  if (badge) badge.textContent = `${keysArr.length} کلید`;
}

function bindSettingsEvents() {
  document.getElementById("admin-global-settings-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn-save-global-settings");
    if (btn) btn.disabled = true;

    try {
      const logoFile = document.getElementById("cfg-logo-file")?.files?.[0] || null;
      let logoUrl = document.getElementById("cfg-logo-url")?.value.trim() || adminState.publicConfig.logoUrl || "";
      if (logoFile) {
        logoUrl = await uploadSingleImageAsset(logoFile, "branding", 500);
      }

      const superAdminEmails = (document.getElementById("cfg-super-admin-emails")?.value || "")
        .split(/[\r\n,]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const assistantEmails = (document.getElementById("cfg-assistant-emails")?.value || "")
        .split(/[\r\n,]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const updatedPublic = {
        ...adminState.publicConfig,
        logoUrl,
        whatsappRaw: document.getElementById("cfg-whatsapp-raw").value.trim() || DEFAULT_WHATSAPP,
        whatsappDisplay: document.getElementById("cfg-whatsapp-display").value.trim() || "+90 545 909 93 95",
        currencySymbol: "$",
        currencyCode: "USD",
        bestRateThreshold: Math.max(1, parseInt(document.getElementById("cfg-bulk-threshold").value, 10) || 25),
        underMoqMarkupPercent: Math.max(0, parseFloat(document.getElementById("cfg-under-moq-markup").value) || 0),
        superAdminEmails,
        assistantEmails,
        ga4MeasurementId: document.getElementById("cfg-ga4-id").value.trim(),
        googleAdsId: document.getElementById("cfg-gads-id").value.trim(),
        googleAdsConversionLabel: document.getElementById("cfg-gads-label").value.trim(),
        googleSiteVerification: document.getElementById("cfg-gsc-verify").value.trim(),
        instagramUrl: document.getElementById("cfg-instagram-url").value.trim(),
        telegramUrl: document.getElementById("cfg-telegram-url").value.trim(),
        tiktokUrl: document.getElementById("cfg-tiktok-url").value.trim(),
        androidAppUrl: document.getElementById("cfg-android-app-url").value.trim(),
        vendors: adminState.vendors,
        taxonomy: adminState.taxonomy,
        updatedAtIso: new Date().toISOString()
      };

      const geminiKeys = (document.getElementById("cfg-gemini-keys")?.value || "")
        .split(/[\r\n,]+/)
        .map((k) => k.trim())
        .filter(Boolean);

      const updatedSecrets = {
        ...adminState.adminSecrets,
        geminiKeys,
        geminiModel: document.getElementById("cfg-gemini-model").value || "gemini-2.5-flash",
        githubToken: document.getElementById("cfg-github-token").value.trim(),
        githubRepo: document.getElementById("cfg-github-repo").value.trim(),
        githubBranch: document.getElementById("cfg-github-branch").value.trim() || "main",
        superAdminEmails,
        assistantEmails,
        vendorSecrets: adminState.vendorSecrets,
        updatedAtIso: new Date().toISOString()
      };

      await setDoc(doc(db, "settings", "public_config"), updatedPublic, { merge: true });
      await setDoc(doc(db, "settings", "admin_secrets"), updatedSecrets, { merge: true });

      adminState.publicConfig = updatedPublic;
      adminState.adminSecrets = updatedSecrets;
      populateSettingsFormUI();
      showAdminToast("✓ تمام تنظیمات، لوگو، فرمول حداقل سفارش و دسترسی‌ها ذخیره شد!");
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  document.getElementById("btn-test-gemini-keys")?.addEventListener("click", async () => {
    const keys = getActiveGeminiKeys();
    const logBox = document.getElementById("gemini-diagnostic-log");
    if (!logBox) return;
    logBox.style.display = "block";
    if (!keys.length) {
      logBox.textContent = "❌ هیچ کلیدی وارد نشده است.";
      return;
    }
    logBox.textContent = `در حال تست ${keys.length} کلید...\n`;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(k)}`;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "OK" }] }] })
        });
        logBox.textContent += res.ok ? `✅ کلید ${i + 1}: سالم و فعال\n` : `⚠️ کلید ${i + 1}: خطای HTTP ${res.status}\n`;
      } catch (e) {
        logBox.textContent += `❌ کلید ${i + 1}: خطا\n`;
      }
    }
  });

  document.getElementById("btn-test-github-conn")?.addEventListener("click", async () => {
    const token = document.getElementById("cfg-github-token")?.value.trim();
    const repo = document.getElementById("cfg-github-repo")?.value.trim();
    if (!token || !repo) {
      showAdminToast("توکن و نام ریپازیتوری را وارد کنید.");
      return;
    }
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showAdminToast("✓ اتصال به گیت‌هاب برقرار است!");
    } catch (err) {
      showAdminToast(`خطا در اتصال گیت‌هاب: ${err.message}`);
    }
  });

  document.getElementById("btn-push-sitemap-robots")?.addEventListener("click", async () => {
    try {
      await buildAndPushSitemapAndRobots();
      showAdminToast("✓ فایل‌های sitemap.xml و robots.txt در گیت‌هاب آپدیت شدند!");
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    }
  });
}

/* ==========================================================================
   15. INITIALIZE ADMIN SUITE
   ========================================================================== */
function initAdminSuite() {
  cleanDuplicateDomNodes();
  populateAllTaxonomySelects();
  bindAuthEvents();
  bindNavigationEvents();
  bindProductUploaderEvents();
  bindCatalogManagerEvents();
  bindCategoriesManagerEvents();
  bindVendorsManagerEvents();
  bindOrdersAndCrmEvents();
  bindVideosManagerEvents();
  bindBlogStudioEvents();
  bindSettingsEvents();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminSuite);
} else {
  initAdminSuite();
}
