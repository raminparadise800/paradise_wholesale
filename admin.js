/**
 * ============================================================================
 * PARADISE WHOLESALE CLOTHING (Paradise Turkey Wholesale)
 * Domain: https://paradisewholesaler.com
 * File: admin.js (BLOCK 1 OF 2) — Minimal Persian Mobile-First B2B Engine
 * ============================================================================
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
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
   1. CORE CONFIGURATION & TAXONOMY WITH LUXURY 3-LANGUAGE FALLBACKS
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
export const DEFAULT_WHATSAPP = "+905459099395";
export const SHARD_CHUNK_SIZE = 100;

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export const DEPARTMENTS_TAXONOMY = [
  {
    id: "men",
    label: "مردانه (Men)",
    subcategories: [
      { id: "men-tshirts", label: "تیشرت مردانه (T-Shirts)", en: "Premium Turkish Cotton Men's T-Shirt", it: "T-Shirt Uomo in Cotone Turco Premium", es: "Camiseta Hombre de Algodón Turco Premium" },
      { id: "men-shirts", label: "پیراهن مردانه (Shirts)", en: "Luxury Tailored Men's Casual Shirt", it: "Camicia Uomo Sartoriale di Lusso", es: "Camisa Hombre de Corte Sastre" },
      { id: "men-knitwear", label: "بافت و پلیور مردانه (Knitwear)", en: "Fine Merino Blend Men's Knitwear", it: "Maglieria Uomo in Misto Lana Fine", es: "Punto y Jersey Hombre de Calidad Superior" },
      { id: "men-sweatshirts-hoodies", label: "هودی و دورس مردانه (Hoodies)", en: "Heavyweight 3-Thread Men's Hoodie & Sweatshirt", it: "Felpa e Hoodie Uomo Cotone Pesante", es: "Sudadera y Hoodie Hombre Algodón Premium" },
      { id: "men-tracksuits", label: "ست ورزشی و ترک‌سوئیت مردانه (Tracksuits)", en: "2-Piece Luxury Men's Tracksuit Set", it: "Tuta Completa Uomo 2 Pezzi", es: "Conjunto Chándal Hombre 2 Piezas" },
      { id: "men-jeans", label: "شلوار جین مردانه (Jeans)", en: "Turkish Denim Men's Jeans", it: "Jeans Uomo in Denim Turco", es: "Pantalón Vaquero Denim Hombre" },
      { id: "men-trousers", label: "شلوار کتان و پارچه‌ای مردانه (Trousers)", en: "Tailored Men's Chino & Trousers", it: "Pantaloni Chino e Classici Uomo", es: "Pantalón Chino y Vestir Hombre" },
      { id: "men-jackets-coats", label: "کاپشن و پالتو مردانه (Jackets & Coats)", en: "Designer Men's Outerwear Jacket", it: "Giacca e Capospalla Uomo", es: "Chaqueta y Abrigo Hombre" },
      { id: "men-suits-blazers", label: "کت و شلوار مردانه (Suits & Blazers)", en: "Executive Men's Suit & Blazer", it: "Abito e Blazer Sartoriale Uomo", es: "Traje y Blazer Ejecutivo Hombre" }
    ]
  },
  {
    id: "women",
    label: "زنانه (Women)",
    subcategories: [
      { id: "women-tops-tshirts", label: "تاپ و تیشرت زنانه (Tops & T-Shirts)", en: "Boutique Women's Cotton Top & T-Shirt", it: "Top e T-Shirt Donna Boutique", es: "Top y Camiseta Mujer Boutique" },
      { id: "women-blouses-shirts", label: "بلوز و شومیز زنانه (Blouses & Shirts)", en: "Elegant Women's Satin & Poplin Blouse", it: "Camicia e Blusa Elegante Donna", es: "Blusa y Camisa Elegante Mujer" },
      { id: "women-knitwear", label: "بافت زنانه (Knitwear)", en: "Soft Touch Women's Luxury Knitwear", it: "Maglieria Morbida Donna", es: "Punto Suave Mujer Boutique" },
      { id: "women-sweatshirts-hoodies", label: "هودی و سوئیشرت زنانه (Hoodies)", en: "Luxury Lounge Women's Hoodie & Sweatshirt", it: "Felpa e Hoodie Donna", es: "Sudadera y Hoodie Mujer" },
      { id: "women-dresses-jumpsuits", label: "پیراهن، مجلسی و سرهمی (Dresses)", en: "Evening & Resort Women's Dress", it: "Abito Elegante da Boutique Donna", es: "Vestido Elegante de Boutique Mujer" },
      { id: "women-skirts", label: "دامن زنانه (Skirts)", en: "Tailored Women's Boutique Skirt", it: "Gonna Sartoriale Donna", es: "Falda de Boutique Mujer" },
      { id: "women-jeans-trousers", label: "شلوار و جین زنانه (Jeans & Trousers)", en: "High-Waist Women's Denim & Trousers", it: "Jeans e Pantaloni Vita Alta Donna", es: "Jeans y Pantalón Tiro Alto Mujer" },
      { id: "women-tracksuits-loungewear", label: "ست راحتی و ترک‌سوئیت زنانه (Tracksuits)", en: "2-Piece Women's Tracksuit & Lounge Set", it: "Completo Tuta e Loungewear Donna", es: "Conjunto Chándal y Lounge Mujer" },
      { id: "women-jackets-coats", label: "کاپشن و پالتو زنانه (Jackets & Coats)", en: "Boutique Women's Trench & Coat", it: "Cappotto e Giacca Donna", es: "Abrigo y Chaqueta Mujer" },
      { id: "women-suits-coord", label: "ست دو تکه و کت‌شلوار زنانه (Co-ord Sets)", en: "2-Piece Women's Tailored Co-ord Suit", it: "Tailleur e Completo 2 Pezzi Donna", es: "Conjunto Sastre 2 Piezas Mujer" }
    ]
  },
  {
    id: "kids-baby",
    label: "بچگانه (Kids & Baby)",
    subcategories: [
      { id: "kids-boys", label: "پسرانه (Boys Clothing)", en: "Turkish Cotton Boys Wholesale Set", it: "Completo Bambino in Cotone Turco", es: "Conjunto Niño Algodón Turco" },
      { id: "kids-girls", label: "دخترانه (Girls Clothing)", en: "Boutique Girls Dress & Set", it: "Completo e Abito Bambina", es: "Conjunto y Vestido Niña" },
      { id: "kids-baby-sets", label: "ست نوزادی (Baby Sets)", en: "Organic Combed Cotton Baby Serie Pack", it: "Set Neonato in Cotone Organico", es: "Set Bebé Algodón Orgánico" }
    ]
  },
  {
    id: "shoes",
    label: "کفش (Shoes)",
    subcategories: [
      { id: "shoes-men", label: "کفش و کتانی مردانه (Men's Shoes)", en: "Handcrafted Leather Men's Sneaker & Loafer", it: "Sneaker e Mocassino Uomo in Pelle", es: "Zapatilla y Mocasín Hombre Piel" },
      { id: "shoes-women", label: "کفش و کتانی زنانه (Women's Shoes)", en: "Luxury Women's Footwear & Heels", it: "Calzature e Sneaker Donna di Lusso", es: "Calzado y Zapatilla Mujer de Lujo" }
    ]
  },
  {
    id: "bags-accessories",
    label: "کیف و اکسسوری (Bags)",
    subcategories: [
      { id: "bags-main", label: "کیف (Bags)", en: "Structured Luxury Leather Handbag & Tote", it: "Borsa in Pelle Strutturata di Lusso", es: "Bolso de Piel Estructurado de Lujo" },
      { id: "accessories-main", label: "اکسسوری، کمربند و کلاه (Accessories)", en: "Luxury Leather Belt & Boutique Accessory", it: "Cintura in Pelle e Accessorio Boutique", es: "Cinturón de Piel y Accesorio Boutique" }
    ]
  }
];

/**
 * تولید عنوان و توضیحات ۳ زبانه بسیار شیک و استاندارد (برای مواقعی که جمنای هنوز اجرا نشده یا خطا داده است)
 * تا ظاهر سایت همیشه لوکس و بدون نقص بماند.
 */
function buildSmartFallbackContent(deptId, subcatId, sku, pcsPerPack) {
  const deptObj = DEPARTMENTS_TAXONOMY.find((d) => d.id === deptId) || DEPARTMENTS_TAXONOMY[0];
  const subObj = deptObj.subcategories.find((s) => s.id === subcatId) || deptObj.subcategories[0];

  const enTitle = `${subObj.en || "Luxury Turkish Wholesale Garment"} • Code ${sku}`;
  const itTitle = `${subObj.it || "Abbigliamento Ingrosso Turco di Lusso"} • Cod. ${sku}`;
  const esTitle = `${subObj.es || "Ropa Mayorista Turca de Lujo"} • Cód. ${sku}`;

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
   2. ADMIN APPLICATION STATE
   ========================================================================== */
const adminState = {
  user: null,
  orders: [],
  customers: [],
  products: [],
  blogs: [],
  vendors: [
    { code: "PRD", name: "تامین‌کننده اصلی پارادایس" }
  ],
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
    whatsappRaw: "+905459099395",
    whatsappDisplay: "+90 545 909 93 95",
    currencySymbol: "$",
    currencyCode: "USD",
    bestRateThreshold: 25,
    ga4MeasurementId: "",
    googleAdsId: "",
    googleAdsConversionLabel: "",
    googleSiteVerification: "",
    instagramUrl: "https://instagram.com/paradisewholesaler",
    telegramUrl: "https://t.me/paradisewholesaler",
    tiktokUrl: "https://tiktok.com/@paradisewholesaler",
    androidAppUrl: "",
    vendors: [{ code: "PRD", name: "تامین‌کننده اصلی پارادایس" }],
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
    githubBranch: "main"
  },
  geminiKeyCursor: 0
};

/* ==========================================================================
   3. UTILITY HELPERS & AUTOMATIC DOM DEDUPLICATOR
   ========================================================================== */
/**
 * اگر هنگام کپی‌پیست در admin.html المانی با ID تکراری ایجاد شده باشد، نسخه تکراری را خودکار حذف می‌کند
 */
function cleanDuplicateDomNodes() {
  const seenIds = new Set();
  document.querySelectorAll("[id]").forEach((el) => {
    const id = el.getAttribute("id");
    if (!id) return;
    if (seenIds.has(id)) {
      const wrapper = el.closest("#media-upload-box-photos, #media-upload-box-video, .field") || el;
      wrapper.remove();
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

/* ==========================================================================
   4. FIREBASE AUTHENTICATION & INITIAL BOOTSTRAP
   ========================================================================== */
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
      const submitBtn = document.getElementById("admin-login-submit-btn");
      const errBox = document.getElementById("admin-login-error");

      if (errBox) errBox.style.display = "none";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "در حال ورود...";
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        showAdminToast("✓ خوش آمدید!");
      } catch (err) {
        if (errBox) {
          errBox.style.display = "block";
          errBox.textContent = `خطا در ورود: ${err.message}`;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "🔐 ورود به پنل مدیریت";
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      showAdminToast("خارج شدید.");
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
      if (emailLabel) emailLabel.textContent = user.email || SUPER_ADMIN_EMAIL;
      await loadAllAdminData();
      updateAiQueueCounters();
    } else {
      if (authScreen) authScreen.style.display = "flex";
      if (appShell) appShell.style.display = "none";
    }
  });
}

async function loadAllAdminData() {
  await Promise.all([
    loadSettingsFromFirestore(),
    loadProductsCatalog(),
    loadOrdersAndCustomers(),
    loadPublishedBlogs()
  ]);
  syncVendorsFromProductsAndConfig();
  updateDashboardKPIs();
}

function updateDashboardKPIs() {
  const prodCount = adminState.products.length;
  const ordCount = adminState.orders.length;
  const custCount = adminState.customers.length;
  const blogCount = adminState.blogs.length;

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
    "ai-uploader": "➕ ۱. آپلود سریع محصول",
    catalog: "🗂️ ۲. مدیریت محصولات و عمده‌فروشان",
    orders: "📦 ۳. سفارشات و مشتریان واتساپ",
    videos: "🎬 ۴. ویدیوهای سایت",
    blog: "📝 ۵. وبلاگ اتوماتیک سئو",
    settings: "⚙️ ۶. تنظیمات و کلیدها"
  };

  document.querySelectorAll("[data-admin-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-admin-tab");
      if (!targetTab) return;

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
   6. WEBP IMAGE COMPRESSOR + WATERMARK STAMPER & GEMINI ROTATOR
   ========================================================================== */
async function compressImageToWebP(file, maxWidth = 1200, quality = 0.84, watermarkText = "") {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("خطا در خواندن فایل عکس"));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("فرمت عکس نامعتبر است"));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        if (watermarkText) {
          const fontSize = Math.max(15, Math.round(width * 0.025));
          ctx.font = `800 ${fontSize}px sans-serif`;
          const padX = Math.round(fontSize * 0.75);
          const padY = Math.round(fontSize * 0.45);
          const metrics = ctx.measureText(watermarkText);
          const boxW = metrics.width + padX * 2;
          const boxH = fontSize + padY * 2;
          const posX = 14;
          const posY = height - boxH - 14;

          ctx.fillStyle = "rgba(9, 13, 22, 0.82)";
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(posX, posY, boxW, boxH, 8);
          } else {
            ctx.rect(posX, posY, boxW, boxH);
          }
          ctx.fill();

          ctx.strokeStyle = "rgba(212, 175, 55, 0.9)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.textBaseline = "middle";
          ctx.fillText(watermarkText, posX + padX, posY + boxH / 2);
        }

        const dataUrl = canvas.toDataURL("image/webp", quality);
        const base64Data = dataUrl.split(",")[1] || "";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("خطا در تبدیل به WebP"));
              return;
            }
            resolve({
              file,
              fileName: file.name,
              fingerprint: getFileFingerprint(file),
              blob,
              base64Data,
              mimeType: "image/webp",
              dataUrl,
              origSize: file.size,
              webpSize: blob.size,
              remoteUrl: ""
            });
          },
          "image/webp",
          quality
        );
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadWebPToFirebaseStorage(stagedItem, dept, skuCode, index = 0) {
  if (stagedItem.remoteUrl) return stagedItem.remoteUrl;
  const cleanCode = String(skuCode || "PRD").replace(/[^a-zA-Z0-9_-]/g, "");
  const timestamp = Date.now();
  const suffix = index > 0 ? `_${index + 1}` : "";
  const path = `products/${dept || "men"}/${timestamp}_${cleanCode}${suffix}.webp`;

  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, stagedItem.blob, {
    contentType: "image/webp",
    cacheControl: "public,max-age=31536000,immutable"
  });
  const downloadUrl = await getDownloadURL(fileRef);
  stagedItem.remoteUrl = downloadUrl;
  return downloadUrl;
}

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
    throw new Error("کلید جمنای در تب ۶ وارد نشده است.");
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
          lastError = new Error(`محدودیت سهمیه کلید شماره ${keyIndex + 1}`);
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

  throw lastError || new Error("خطا در ارتباط با کلیدهای جمنای");
}

/* === پایان بلوک ۱ از ۲ فایل admin.js — بلوک ۲ را دقیقاً زیر این خط پیست کنید === */
/* === شروع بلوک ۲ از ۲ فایل admin.js — دقیقاً زیر بلوک ۱ پیست کنید === */

/* ==========================================================================
   7. VENDOR DRAWER, UPLOAD MODES & PRODUCT UPLOADER ENGINE (TAB 1)
   ========================================================================== */
function syncVendorsFromProductsAndConfig() {
  const vendorMap = new Map();

  // ۱. خواندن عمده‌فروشان ذخیره‌شده در تنظیمات
  const cfgVendors = Array.isArray(adminState.publicConfig.vendors) ? adminState.publicConfig.vendors : [];
  cfgVendors.forEach((v) => {
    if (v && v.code) {
      const code = String(v.code).trim().toUpperCase();
      vendorMap.set(code, { code, name: v.name || code });
    }
  });

  // ۲. استخراج خودکار عمده‌فروشان از محصولات موجود
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
}

function renderVendorDropdowns(selectedCode = "") {
  // کشوی انتخاب عمده‌فروش در تب آپلود
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

  // کشوی فیلتر عمده‌فروش در تب کاتالوگ
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
  const found = adminState.vendors.find((v) => v.code === code);
  return found || { code, name: code };
}

function populateSubcategoryDropdown(deptId, selectedSubId = "") {
  const subSelect = document.getElementById("prod-subcategory");
  if (!subSelect) return;
  const deptObj = DEPARTMENTS_TAXONOMY.find((d) => d.id === deptId) || DEPARTMENTS_TAXONOMY[0];

  subSelect.innerHTML = deptObj.subcategories
    .map(
      (sc) =>
        `<option value="${escapeHtml(sc.id)}" ${sc.id === selectedSubId ? "selected" : ""}>${escapeHtml(sc.label)}</option>`
    )
    .join("");
}

function populateCatalogFilterSubcategories(deptId = "all") {
  const filterSub = document.getElementById("catalog-filter-subcat");
  if (!filterSub) return;
  const currentVal = filterSub.value || "all";

  let html = `<option value="all">همه زیرشاخه‌ها</option>`;
  DEPARTMENTS_TAXONOMY.forEach((d) => {
    if (deptId !== "all" && d.id !== deptId) return;
    d.subcategories.forEach((sc) => {
      html += `<option value="${escapeHtml(sc.id)}" ${sc.id === currentVal ? "selected" : ""}>${escapeHtml(sc.label)}</option>`;
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
    if (badge) badge.textContent = "(فشرده‌سازی خودکار WebP)";
    return;
  }

  let totalWebp = 0;
  container.innerHTML = adminState.stagedImages
    .map((item, idx) => {
      totalWebp += item.webpSize || 0;
      return `
        <div class="preview-item">
          <img src="${escapeHtml(item.dataUrl || item.remoteUrl)}" alt="Preview ${idx + 1}" />
          <button type="button" class="preview-remove" data-remove-staged="${idx}">✕</button>
        </div>
      `;
    })
    .join("");

  if (badge) {
    badge.textContent = `(${adminState.stagedImages.length} عکس آماده — ${Math.round(totalWebp / 1024)} KB)`;
  }
}

async function handleFilesSelected(fileList) {
  const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
  if (files.length === 0) return;

  const badge = document.getElementById("webp-compression-status");
  if (badge) badge.textContent = `در حال آماده‌سازی ${files.length} عکس...`;

  let skippedInSelection = 0;
  for (const file of files) {
    const fp = getFileFingerprint(file);
    if (adminState.stagedImages.some((s) => s.fingerprint && s.fingerprint === fp)) {
      skippedInSelection++;
      continue;
    }
    try {
      const compressed = await compressImageToWebP(file, 1200, 0.84, "");
      adminState.stagedImages.push(compressed);
    } catch (err) {
      showAdminToast(`خطا در خواندن ${file.name}`);
    }
  }

  renderStagedImagePreviews();
  if (skippedInSelection > 0) {
    showAdminToast(`${skippedInSelection} عکس تکراری در انتخاب فعلی رد شد.`);
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
      lines.push(`<div style="color:#065f46;">✅ <strong>${escapeHtml(s.sku)}</strong> (${escapeHtml(s.fileName)}) آپلود و ثبت شد.</div>`);
    });
    rep.duplicateItems.forEach((d) => {
      lines.push(`<div style="color:#92400e;">⚠️ <strong>تکراری (رد شد):</strong> ${escapeHtml(d.fileName)} (ثبت شده با کد ${escapeHtml(d.existingSku)})</div>`);
    });
    rep.failedItems.forEach((f) => {
      lines.push(`<div style="color:#991b1b;">❌ <strong>خطا:</strong> ${escapeHtml(f.fileName)} — ${escapeHtml(f.error)}</div>`);
    });
    logEl.innerHTML = lines.join("") || "آماده";
  }
}

/* ==========================================================================
   8. SMART UPLOAD EXECUTION (BATCH / SINGLE MULTI-PHOTO / VIDEO-AS-PRODUCT)
   ========================================================================== */
async function executeBatchUploadItems(itemsToProcess, isRetry = false) {
  const submitBtn = document.getElementById("btn-save-product-submit");
  const retryBtn = document.getElementById("btn-retry-failed-uploads");

  const vendor = getSelectedVendorObj();
  const department = document.getElementById("prod-department")?.value || "men";
  const subcategory = document.getElementById("prod-subcategory")?.value || "men-tshirts";
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

  let uploadedVideoUrl = "";
  if (videoFile) {
    try {
      uploadedVideoUrl = await uploadVideoFileToStorage(videoFile, department, vendor.code);
    } catch (e) {}
  }

  for (let i = 0; i < itemsToProcess.length; i++) {
    const item = itemsToProcess[i];
    const fileName = item.fileName || item.file?.name || `عکس_${i + 1}`;
    const fp = item.fingerprint || getFileFingerprint(item.file);

    if (submitBtn) {
      submitBtn.textContent = `⏳ در حال آپلود (${i + 1} از ${itemsToProcess.length})...`;
    }

    // ۱. بررسی ضد تکراری
    const dupProd = findDuplicateProductByFingerprint(fp);
    if (dupProd && !isRetry) {
      adminState.lastUploadReport.duplicateItems.push({
        fileName,
        existingSku: dupProd.sku || dupProd.id
      });
      renderBatchUploadReport();
      continue;
    }

    // ۲. تولید کد محصول با کد عمده‌فروش
    const sku =
      itemsToProcess.length === 1 && document.getElementById("prod-sku")?.value.trim()
        ? document.getElementById("prod-sku").value.trim().toUpperCase()
        : item.assignedSku || `${vendor.code}-${Math.floor(1000 + Math.random() * 9000)}`;
    item.assignedSku = sku;

    try {
      // ۳. حک کد روی عکس (در صورت فعال بودن تیک)
      let finalStaged = item;
      if (watermarkEnabled && item.file) {
        finalStaged = await compressImageToWebP(item.file, 1200, 0.84, `${sku} | $${unitPrice}`);
      }

      // ۴. آپلود در استوریج
      const remoteUrl = await uploadWebPToFirebaseStorage(finalStaged, department, sku, 0);

      // ۵. ساخت عنوان ۳ زبانه استاندارد و شیک اولیه (تا قبل از اجرای جمنای هیچ ظاهر خامی دیده نشود)
      const fallbackText = buildSmartFallbackContent(department, subcategory, sku, pcsPerPack);

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
        searchTags: [sku.toLowerCase(), vendor.code.toLowerCase(), department, subcategory],
        imageUrl: remoteUrl,
        images: [remoteUrl],
        videoUrl: uploadedVideoUrl || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""),
        youtubeId: youtubeId || "",
        createdAtMillis: Date.now() + i,
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
        error: err.message || "خطای اینترنت یا سرور"
      });
    }

    renderBatchUploadReport();
  }

  adminState.failedUploadQueue = newFailedQueue;
  adminState.stagedImages = [...newFailedQueue];

  renderStagedImagePreviews();
  renderBatchUploadReport();
  await rebuildAllCatalogShards();
  syncVendorsFromProductsAndConfig();
  renderCatalogTable();
  updateDashboardKPIs();
  updateAiQueueCounters();
  generateAutoSku();

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "🚀 شروع آپلود هوشمند و ثبت محصولات";
  }
  if (retryBtn) retryBtn.disabled = false;

  const succ = adminState.lastUploadReport.successItems.length;
  const dup = adminState.lastUploadReport.duplicateItems.length;
  const fail = adminState.failedUploadQueue.length;
  showAdminToast(`پایان آپلود: ${succ} موفق | ${dup} تکراری | ${fail} خطا`);

  if (succ > 0 && getActiveGeminiKeys().length > 0 && !adminState.aiWorkerRunning) {
    startBackgroundAiWorker();
  }
}

/**
 * ثبت تک محصول (با چند عکس از زوایای مختلف) یا ثبت ویدیو به عنوان محصول مستقل (بدون نیاز به عکس)
 */
async function handleSaveProductForm(e) {
  e.preventDefault();

  const mode = document.getElementById("batch-upload-mode")?.value || "batch";
  const existingDocId = document.getElementById("prod-doc-id")?.value.trim() || "";
  const youtubeRaw = (document.getElementById("prod-youtube-url")?.value || "").trim();
  const youtubeId = extractYouTubeId(youtubeRaw);
  const videoFile = document.getElementById("prod-video-file")?.files?.[0] || null;

  // اگر در حالت آپلود دسته‌ای هستیم و عکس انتخاب شده و در حال ویرایش محصول قبلی نیستیم:
  if (!existingDocId && mode === "batch" && adminState.stagedImages.length > 0) {
    await executeBatchUploadItems([...adminState.stagedImages], false);
    return;
  }

  // بررسی اینکه حداقل یک عکس یا یک ویدیو/لینک یوتیوب وارد شده باشد
  if (adminState.stagedImages.length === 0 && !youtubeId && !youtubeRaw && !videoFile && !existingDocId) {
    showAdminToast("لطفاً عکس انتخاب کنید یا لینک ویدیوی یوتیوب / فایل ویدیو وارد نمایید.");
    return;
  }

  const submitBtn = document.getElementById("btn-save-product-submit");
  const vendor = getSelectedVendorObj();
  const sku = (document.getElementById("prod-sku")?.value.trim() || generateAutoSku()).toUpperCase();
  const docId = existingDocId || sku;

  const department = document.getElementById("prod-department")?.value || "men";
  const subcategory = document.getElementById("prod-subcategory")?.value || "men-tshirts";
  const unitPrice = parseFloat(document.getElementById("prod-unit-price")?.value) || 5;
  const pcsPerPack = Math.max(1, parseInt(document.getElementById("prod-pcs-per-pack")?.value, 10) || 6);
  const sizeRange = document.getElementById("prod-size-range")?.value.trim() || "S - M - L - XL - XXL";
  const watermarkEnabled = Boolean(document.getElementById("prod-watermark-toggle")?.checked);

  // بررسی ضد تکراری برای ثبت جدید
  if (!existingDocId && adminState.stagedImages[0]?.fingerprint) {
    const dup = findDuplicateProductByFingerprint(adminState.stagedImages[0].fingerprint);
    if (dup) {
      adminState.lastUploadReport = {
        totalSelected: 1,
        successItems: [],
        failedItems: [],
        duplicateItems: [{ fileName: adminState.stagedImages[0].fileName || "عکس", existingSku: dup.sku }]
      };
      renderBatchUploadReport();
      showAdminToast(`⚠️ این محصول قبلاً با کد ${dup.sku} آپلود شده است!`);
      return;
    }
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "⏳ در حال آپلود و ثبت محصول...";
  }

  try {
    const uploadedUrls = [];
    const fingerprints = [];

    for (let i = 0; i < adminState.stagedImages.length; i++) {
      let staged = adminState.stagedImages[i];
      if (staged.fingerprint) fingerprints.push(staged.fingerprint);

      if (staged.remoteUrl) {
        uploadedUrls.push(staged.remoteUrl);
      } else if (staged.blob) {
        if (watermarkEnabled && staged.file) {
          staged = await compressImageToWebP(staged.file, 1200, 0.84, `${sku} | $${unitPrice}`);
        }
        const url = await uploadWebPToFirebaseStorage(staged, department, sku, i);
        uploadedUrls.push(url);
      }
    }

    let finalVideoUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : youtubeRaw;
    if (videoFile) {
      finalVideoUrl = await uploadVideoFileToStorage(videoFile, department, sku);
    }

    // اگر محصول فقط ویدیو است (بدون عکس)، کاور یوتیوب یا کاور ویدیو را به عنوان تصویر کارت بگذار
    const primaryImageUrl =
      uploadedUrls[0] ||
      (youtubeId
        ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
        : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=80");

    const existingProd = adminState.products.find((p) => p.id === docId);
    const fallbackText = buildSmartFallbackContent(department, subcategory, sku, pcsPerPack);

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
      unitPrice,
      pcsPerPack,
      packTotal: Number((unitPrice * pcsPerPack).toFixed(2)),
      sizeRange,
      stockStatus: existingProd?.stockStatus || "in_stock",
      isFeatured: true,
      aiStatus: existingProd?.aiStatus === "completed" ? "completed" : uploadedUrls.length > 0 ? "pending" : "completed",
      publicTitle: existingProd?.publicTitle || fallbackText.publicTitle,
      brandTitle: existingProd?.brandTitle || fallbackText.brandTitle,
      description: existingProd?.description || fallbackText.description,
      searchTags: existingProd?.searchTags || [sku.toLowerCase(), vendor.code.toLowerCase(), department, subcategory],
      imageUrl: primaryImageUrl,
      images: uploadedUrls.length > 0 ? uploadedUrls : [primaryImageUrl],
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

    adminState.lastUploadReport = {
      totalSelected: 1,
      successItems: [{ sku, fileName: uploadedUrls.length ? `${uploadedUrls.length} عکس` : "محصول ویدیویی" }],
      failedItems: [],
      duplicateItems: []
    };
    renderBatchUploadReport();

    await rebuildAllCatalogShards();
    syncVendorsFromProductsAndConfig();
    renderCatalogTable();
    updateDashboardKPIs();
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
      submitBtn.textContent = "🚀 شروع آپلود هوشمند و ثبت محصولات";
    }
  }
}

/* ==========================================================================
   9. MINIMAL BACKGROUND AI WORKER (AUTO 3-LANGUAGE TITLES & TAGS)
   ========================================================================== */
function updateAiQueueCounters() {
  const pendingCount = adminState.products.filter((p) => p.aiStatus === "pending").length;
  const doneCount = adminState.products.filter((p) => p.aiStatus === "completed").length;

  const pendEl = document.getElementById("ai-queue-pending-count");
  const doneEl = document.getElementById("ai-queue-done-count");
  if (pendEl) pendEl.textContent = String(pendingCount);
  if (doneEl) doneEl.textContent = String(doneCount);
}

async function fetchImageAsBase64(imageUrl) {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Image read failed"));
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      resolve({
        mimeType: blob.type || "image/webp",
        base64Data: dataUrl.split(",")[1] || ""
      });
    };
    reader.readAsDataURL(blob);
  });
}

async function startBackgroundAiWorker() {
  if (adminState.aiWorkerRunning) return;
  if (getActiveGeminiKeys().length === 0) {
    showAdminToast("برای تگ‌گذاری خودکار، ابتدا کلید جمنای را در تب ۶ وارد کنید.");
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
      const imgData = await fetchImageAsBase64(nextProd.imageUrl);
      const prompt = `
Analyze this wholesale garment/shoe/bag image (Code: ${nextProd.sku}, Category: ${nextProd.subcategory}).
Return ONLY valid JSON:
{
  "publicTitle": {
    "en": "Luxury B2B wholesale title describing fabric & cut WITHOUT any brand names (append • Code ${nextProd.sku})",
    "it": "Italian luxury wholesale title WITHOUT brand names (append • Cod. ${nextProd.sku})",
    "es": "Spanish luxury wholesale title WITHOUT brand names (append • Cód. ${nextProd.sku})"
  },
  "brandTitle": {
    "en": "Real detected brand + model title for internal search (append • ${nextProd.sku})",
    "it": "Italian brand title",
    "es": "Spanish brand title"
  },
  "searchTags": ["12 lowercase search keywords in en, it, es, and Persian including detected brand name"],
  "description": {
    "en": "2-sentence B2B wholesale description (${nextProd.pcsPerPack} pcs serie pack, Istanbul direct)",
    "it": "2-sentence Italian wholesale description",
    "es": "2-sentence Spanish wholesale description"
  }
}`.trim();

      const aiRes = await callGeminiWithRotator(
        [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: imgData.mimeType, data: imgData.base64Data } },
              { text: prompt }
            ]
          }
        ],
        true
      );

      const fallback = buildSmartFallbackContent(
        nextProd.department,
        nextProd.subcategory,
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
      processed++;
      updateAiQueueCounters();
      renderCatalogTable();

      await new Promise((r) => setTimeout(r, 1800));
    } catch (err) {
      // اگر جمنای خطا داد، محصول همان عنوان استاندارد و شیک اولیه را حفظ می‌کند تا سایت همیشه زیبا بماند
      nextProd.aiStatus = "completed";
      await updateDoc(doc(db, "products", nextProd.id), { aiStatus: "completed" }).catch(() => {});
      updateAiQueueCounters();
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  adminState.aiWorkerRunning = false;
  if (startBtn) startBtn.style.display = "inline-flex";
  if (stopBtn) stopBtn.style.display = "none";
  updateAiQueueCounters();

  if (processed > 0) {
    await rebuildAllCatalogShards();
  }
  if (miniStatus) {
    miniStatus.textContent = adminState.aiWorkerStopRequested ? "متوقف شد" : "✓ همه تکمیل شد";
  }
}

function resetProductForm() {
  document.getElementById("admin-product-form")?.reset();
  const docIdEl = document.getElementById("prod-doc-id");
  if (docIdEl) docIdEl.value = "";
  const titleEl = document.getElementById("product-form-mode-title");
  if (titleEl) titleEl.textContent = "ثبت و آپلود محصول جدید";
  adminState.stagedImages = [];
  renderStagedImagePreviews();
  populateSubcategoryDropdown(document.getElementById("prod-department")?.value || "men");
  generateAutoSku();
  updatePackMathDisplay();
}

function bindProductUploaderEvents() {
  // ۱. دکمه‌های تغییر حالت آپلود (دسته‌ای / تک محصول / لینک ویدیو)
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
      photoBox.style.display = mode === "youtube" ? "none" : "block";
    }
  });

  // ۲. کشوی ثبت عمده‌فروش جدید
  const drawer = document.getElementById("new-vendor-drawer");
  document.getElementById("btn-toggle-new-vendor")?.addEventListener("click", () => {
    if (!drawer) return;
    drawer.style.display = drawer.style.display === "none" ? "block" : "none";
  });

  document.getElementById("btn-save-new-vendor")?.addEventListener("click", async () => {
    const nameInput = document.getElementById("new-vendor-name");
    const codeInput = document.getElementById("new-vendor-code");
    const name = (nameInput?.value || "").trim();
    const code = (codeInput?.value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (!name || !code) {
      showAdminToast("لطفاً نام و کد انگلیسی عمده‌فروش را وارد کنید.");
      return;
    }

    const exists = adminState.vendors.find((v) => v.code === code);
    if (exists) {
      exists.name = name;
    } else {
      adminState.vendors.push({ code, name });
    }

    adminState.publicConfig.vendors = adminState.vendors;
    renderVendorDropdowns(code);
    generateAutoSku();

    if (nameInput) nameInput.value = "";
    if (codeInput) codeInput.value = "";
    if (drawer) drawer.style.display = "none";

    try {
      await setDoc(doc(db, "settings", "public_config"), { vendors: adminState.vendors }, { merge: true });
      showAdminToast(`✓ عمده‌فروش ${code} (${name}) ذخیره و انتخاب شد!`);
    } catch (err) {
      showAdminToast(`عمده‌فروش در لیست انتخاب شد.`);
    }
  });

  document.getElementById("prod-vendor-select")?.addEventListener("change", () => {
    if (!document.getElementById("prod-doc-id")?.value) {
      generateAutoSku();
    }
  });

  // ۳. تغییر بخش و زیرشاخه
  const deptSelect = document.getElementById("prod-department");
  if (deptSelect) {
    populateSubcategoryDropdown(deptSelect.value);
    deptSelect.addEventListener("change", (e) => {
      populateSubcategoryDropdown(e.target.value);
    });
  }

  generateAutoSku();
  updatePackMathDisplay();

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

  // ۴. انتخاب عکس از گالری
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

  // ۵. تلاش مجدد و کنترل صف جمنای
  document.getElementById("btn-retry-failed-uploads")?.addEventListener("click", async () => {
    if (adminState.failedUploadQueue.length === 0) return;
    await executeBatchUploadItems([...adminState.failedUploadQueue], true);
  });

  document.getElementById("btn-start-ai-worker")?.addEventListener("click", startBackgroundAiWorker);
  document.getElementById("btn-stop-ai-worker")?.addEventListener("click", () => {
    adminState.aiWorkerStopRequested = true;
  });

  document.getElementById("btn-reset-product-form")?.addEventListener("click", resetProductForm);
  document.getElementById("admin-product-form")?.addEventListener("submit", handleSaveProductForm);
}

/* ==========================================================================
   10. CHUNKED 100-ITEM SHARD BUILDER & TAB 2 CATALOG MANAGER
   ========================================================================== */
async function rebuildAllCatalogShards() {
  try {
    const items = adminState.products.map((p) => ({
      id: p.id || p.sku,
      sku: p.sku || p.code || p.id,
      vendorCode: p.vendorCode || "PRD",
      department: p.department || "men",
      subcategory: p.subcategory || "men-tshirts",
      unitPrice: Number(p.unitPrice) || 0,
      pcsPerPack: Math.max(1, parseInt(p.pcsPerPack, 10) || 6),
      sizeRange: p.sizeRange || "S - M - L - XL",
      stockStatus: p.stockStatus || "in_stock",
      isFeatured: Boolean(p.isFeatured),
      publicTitle: p.publicTitle || { en: `Wholesale Garment • ${p.sku}` },
      brandTitle: p.brandTitle || p.publicTitle || { en: `Wholesale Garment • ${p.sku}` },
      searchTags: Array.isArray(p.searchTags) ? p.searchTags : [],
      imageUrl: p.imageUrl || "",
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

    for (const deptObj of DEPARTMENTS_TAXONOMY) {
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
  populateCatalogFilterSubcategories("all");
  renderCatalogTable();
  updateAiQueueCounters();
}

function getFilteredCatalogProducts() {
  const vendorFilter = document.getElementById("catalog-filter-vendor")?.value || "all";
  const deptFilter = document.getElementById("catalog-filter-dept")?.value || "all";
  const subcatFilter = document.getElementById("catalog-filter-subcat")?.value || "all";
  const searchQ = (document.getElementById("catalog-search-input")?.value || "").trim().toLowerCase();

  return adminState.products.filter((p) => {
    const pVendor = String(p.vendorCode || String(p.sku || "").split("-")[0] || "PRD").toUpperCase();
    if (vendorFilter !== "all" && pVendor !== vendorFilter) return false;
    if (deptFilter !== "all" && p.department !== deptFilter) return false;
    if (subcatFilter !== "all" && p.subcategory !== subcatFilter) return false;
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

function renderCatalogTable() {
  const tbody = document.getElementById("admin-catalog-tbody");
  const countEl = document.getElementById("catalog-showing-count");
  if (!tbody) return;

  const filtered = getFilteredCatalogProducts();
  if (countEl) countEl.textContent = String(filtered.length);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">هیچ محصولی با این فیلتر یافت نشد.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .slice(0, 300)
    .map((p) => {
      const id = escapeHtml(p.id || p.sku);
      const sku = escapeHtml(p.sku || p.id);
      const vCode = escapeHtml(p.vendorCode || String(p.sku || "").split("-")[0] || "PRD");
      const subcat = escapeHtml(p.subcategory || p.department || "men");
      const pubEn = escapeHtml(typeof p.publicTitle === "object" ? p.publicTitle.en : p.publicTitle || sku);
      const unitPrice = Number(p.unitPrice) || 0;
      const pcs = Math.max(1, parseInt(p.pcsPerPack, 10) || 6);
      const packTotal = formatMoney(unitPrice * pcs);
      const stock = p.stockStatus || "in_stock";
      const img = escapeHtml(p.imageUrl || "");
      const hasVideo = Boolean(p.videoUrl || p.youtubeId);
      const aiBadge =
        p.aiStatus === "pending"
          ? `<span style="font-size:0.7rem; background:#fef3c7; color:#92400e; padding:2px 6px; border-radius:4px;">⏳ در صف جمنای</span>`
          : `<span style="font-size:0.7rem; background:#ecfdf5; color:#065f46; padding:2px 6px; border-radius:4px;">✓ آماده</span>`;

      return `
        <tr>
          <td>
            <img src="${img}" alt="${sku}" style="width:46px; height:60px; object-fit:cover; border-radius:6px; border:1px solid var(--border);" loading="lazy" />
          </td>
          <td>
            <strong style="color:var(--gold-dark); display:block; direction:ltr; text-align:right;">${sku}</strong>
            <span style="font-size:0.72rem; color:var(--text-muted);">عمده‌فروش: <strong>${vCode}</strong> | ${subcat}</span>
          </td>
          <td>
            <div style="font-weight:700; font-size:0.8rem; margin-bottom:4px;">${pubEn}</div>
            <div>${aiBadge} ${hasVideo ? `<span style="font-size:0.7rem; background:#dbeafe; color:#1e40af; padding:2px 6px; border-radius:4px;">🎬 دارای ویدیو</span>` : ""}</div>
          </td>
          <td>
            <input type="number" step="0.5" class="input" data-inline-price="${id}" value="${unitPrice}" style="width:78px; padding:6px; direction:ltr;" />
          </td>
          <td>
            <input type="number" step="1" min="1" class="input" data-inline-pcs="${id}" value="${pcs}" style="width:68px; padding:6px; direction:ltr;" />
          </td>
          <td style="font-weight:800; direction:ltr;">${packTotal}</td>
          <td>
            <select class="select" data-inline-stock="${id}" style="width:115px; padding:6px; font-size:0.76rem;">
              <option value="in_stock" ${stock === "in_stock" ? "selected" : ""}>🟢 موجود</option>
              <option value="low_stock" ${stock === "low_stock" ? "selected" : ""}>🟡 محدود</option>
              <option value="out_of_stock" ${stock === "out_of_stock" ? "selected" : ""}>🔴 ناموجود</option>
            </select>
          </td>
          <td style="white-space:nowrap;">
            <button type="button" class="btn-outline" data-save-inline="${id}" title="ذخیره قیمت و موجودی">💾</button>
            <button type="button" class="btn-outline" data-quick-video="${id}" title="افزودن یا تغییر لینک ویدیو">🎬 ویدیو</button>
            <button type="button" class="btn-outline" data-edit-full="${id}" title="ویرایش">✏️</button>
            <button type="button" class="btn-outline" data-delete-prod="${id}" style="color:var(--danger); border-color:#fecaca;" title="حذف">🗑</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function handleBulkDeleteFilteredProducts() {
  const vendorFilter = document.getElementById("catalog-filter-vendor")?.value || "all";
  const deptFilter = document.getElementById("catalog-filter-dept")?.value || "all";
  const subcatFilter = document.getElementById("catalog-filter-subcat")?.value || "all";

  if (vendorFilter === "all" && deptFilter === "all" && subcatFilter === "all") {
    showAdminToast("⚠️ ابتدا عمده‌فروش یا شاخه مورد نظر را از بالا فیلتر کنید.");
    return;
  }

  const targets = getFilteredCatalogProducts();
  if (targets.length === 0) {
    showAdminToast("محصولی در این فیلتر وجود ندارد.");
    return;
  }

  if (!confirm(`آیا مطمئن هستید که ${targets.length} محصول فیلتر شده یکجا حذف شوند؟`)) return;

  const btn = document.getElementById("btn-bulk-delete-filtered");
  if (btn) {
    btn.disabled = true;
    btn.textContent = `⏳ در حال حذف ${targets.length} محصول...`;
  }

  try {
    const deletedIds = new Set();
    for (const prod of targets) {
      await deleteDoc(doc(db, "products", prod.id));
      deletedIds.add(prod.id);
    }

    adminState.products = adminState.products.filter((p) => !deletedIds.has(p.id));
    await rebuildAllCatalogShards();
    syncVendorsFromProductsAndConfig();
    renderCatalogTable();
    updateDashboardKPIs();
    updateAiQueueCounters();
    showAdminToast(`✓ تعداد ${deletedIds.size} محصول یکجا حذف شد.`);
  } catch (err) {
    showAdminToast(`خطا در حذف: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "🗑️ حذف یکجای محصولات فیلتر شده";
    }
  }
}

function bindCatalogManagerEvents() {
  document.getElementById("catalog-filter-vendor")?.addEventListener("change", renderCatalogTable);
  document.getElementById("catalog-filter-dept")?.addEventListener("change", (e) => {
    populateCatalogFilterSubcategories(e.target.value);
    renderCatalogTable();
  });
  document.getElementById("catalog-filter-subcat")?.addEventListener("change", renderCatalogTable);
  document.getElementById("catalog-search-input")?.addEventListener("input", renderCatalogTable);
  document.getElementById("btn-rebuild-all-shards")?.addEventListener("click", async () => {
    await rebuildAllCatalogShards();
    showAdminToast("✓ کاتالوگ سایت بروزرسانی شد!");
  });
  document.getElementById("btn-bulk-delete-filtered")?.addEventListener("click", handleBulkDeleteFilteredProducts);

  document.getElementById("admin-catalog-tbody")?.addEventListener("click", async (e) => {
    const target = e.target;

    // ۱. ذخیره سریع قیمت و موجودی
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
        showAdminToast(`✓ قیمت و موجودی ${id} ذخیره شد.`);
      } catch (err) {
        showAdminToast(`خطا: ${err.message}`);
      }
      return;
    }

    // ۲. افزودن یا تغییر ویدیوی محصول در هر زمان
    const vidBtn = target.closest("[data-quick-video]");
    if (vidBtn) {
      const id = vidBtn.getAttribute("data-quick-video");
      const prod = adminState.products.find((p) => p.id === id);
      if (!prod) return;

      const currentVid = prod.videoUrl || (prod.youtubeId ? `https://youtu.be/${prod.youtubeId}` : "");
      const inputUrl = prompt(
        `لینک یوتیوب / Shorts یا لینک مستقیم MP4 را برای محصول ${prod.sku} وارد کنید (برای حذف ویدیو خالی بگذارید):`,
        currentVid
      );
      if (inputUrl === null) return;

      const trimmed = inputUrl.trim();
      const ytId = extractYouTubeId(trimmed);

      try {
        await updateDoc(doc(db, "products", id), {
          videoUrl: trimmed,
          youtubeId: ytId || "",
          updatedAtIso: new Date().toISOString()
        });
        prod.videoUrl = trimmed;
        prod.youtubeId = ytId || "";
        await rebuildAllCatalogShards();
        renderCatalogTable();
        showAdminToast(trimmed ? `🎬 ویدیو به محصول ${prod.sku} متصل شد!` : `ویدیوی محصول حذف شد.`);
      } catch (err) {
        showAdminToast(`خطا: ${err.message}`);
      }
      return;
    }

    // ۳. ویرایش محصول در تب ۱
    const editBtn = target.closest("[data-edit-full]");
    if (editBtn) {
      const id = editBtn.getAttribute("data-edit-full");
      const prod = adminState.products.find((p) => p.id === id);
      if (!prod) return;

      document.getElementById("prod-doc-id").value = prod.id;
      renderVendorDropdowns(prod.vendorCode || "PRD");
      document.getElementById("prod-department").value = prod.department || "men";
      populateSubcategoryDropdown(prod.department || "men", prod.subcategory);
      document.getElementById("prod-sku").value = prod.sku || prod.id;
      document.getElementById("prod-unit-price").value = prod.unitPrice || 5;
      document.getElementById("prod-pcs-per-pack").value = prod.pcsPerPack || 6;
      document.getElementById("prod-size-range").value = prod.sizeRange || "S - M - L - XL - XXL";
      document.getElementById("prod-youtube-url").value = prod.videoUrl || prod.youtubeId || "";
      updatePackMathDisplay();

      adminState.stagedImages = (Array.isArray(prod.images) ? prod.images : [prod.imageUrl]).filter(Boolean).map((u) => ({
        remoteUrl: u,
        dataUrl: u,
        origSize: 0,
        webpSize: 0
      }));
      renderStagedImagePreviews();

      document.getElementById("product-form-mode-title").textContent = `ویرایش محصول: ${prod.sku}`;
      document.querySelector('[data-admin-tab="ai-uploader"]')?.click();
      return;
    }

    // ۴. حذف تکی محصول
    const delBtn = target.closest("[data-delete-prod]");
    if (delBtn) {
      const id = delBtn.getAttribute("data-delete-prod");
      if (!confirm(`محصول ${id} حذف شود؟`)) return;
      try {
        await deleteDoc(doc(db, "products", id));
        adminState.products = adminState.products.filter((p) => p.id !== id);
        await rebuildAllCatalogShards();
        syncVendorsFromProductsAndConfig();
        renderCatalogTable();
        updateDashboardKPIs();
        updateAiQueueCounters();
        showAdminToast(`محصول ${id} حذف شد.`);
      } catch (err) {
        showAdminToast(`خطا: ${err.message}`);
      }
    }
  });
}

/* ==========================================================================
   11. TAB 3: ORDERS & CUSTOMERS CRM
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
      const hay = `${o.orderCode || ""} ${o.buyerName || ""} ${o.buyerCountry || ""} ${o.buyerPhone || ""}`.toLowerCase();
      if (!hay.includes(searchQ)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-muted);">سفارشی یافت نشد.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((o) => {
      const code = escapeHtml(o.orderCode || o.id);
      const dateStr = o.createdAtIso ? new Date(o.createdAtIso).toLocaleDateString("fa-IR") : "2026";
      const buyer = escapeHtml(o.buyerName || "خریدار عمده");
      const country = escapeHtml(o.buyerCountry || "—");
      const phone = escapeHtml(o.buyerPhone || "—");
      const cleanPhone = String(o.buyerPhone || "").replace(/[^0-9]/g, "");
      const packs = Number(o.totalPacks) || 0;
      const pcs = Number(o.totalPieces) || 0;
      const amount = formatMoney(o.totalAmount || 0);
      const status = o.status || "pending_whatsapp";
      const invoiceUrl = `order.html?id=${encodeURIComponent(o.orderCode || o.id)}`;
      const waHref = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${o.buyerName || ""}! Regarding your Paradise Wholesale Order ${code} (${amount}): ${SITE_DOMAIN}/${invoiceUrl}`)}`
        : "#";

      return `
        <tr>
          <td><strong>${code}</strong><br><small style="color:var(--text-muted);">${escapeHtml(dateStr)}</small></td>
          <td><strong>${buyer}</strong></td>
          <td>${country}</td>
          <td style="direction:ltr;">${phone}</td>
          <td>${packs} پک (${pcs} عدد)</td>
          <td style="font-weight:800; direction:ltr;">${amount}</td>
          <td>
            <select class="select" data-order-status-change="${code}" style="padding:5px; font-size:0.75rem; width:140px;">
              <option value="pending_whatsapp" ${status === "pending_whatsapp" ? "selected" : ""}>🟡 در انتظار واتساپ</option>
              <option value="preparing" ${status === "preparing" ? "selected" : ""}>🔵 در حال آماده‌سازی</option>
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
  const filtered = adminState.customers.filter((c) => {
    if (!q) return true;
    return `${c.name || ""} ${c.country || ""} ${c.phone || ""}`.toLowerCase().includes(q);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">مشتری یافت نشد.</td></tr>`;
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
    try {
      await updateDoc(doc(db, "orders", code), { status: sel.value, updatedAt: serverTimestamp() });
      showAdminToast(`✓ وضعیت سفارش ${code} ذخیره شد.`);
    } catch (err) {}
  });

  document.getElementById("btn-export-customers-csv")?.addEventListener("click", () => {
    if (!adminState.customers.length) return;
    const headers = ["Name,Country,Phone,LastOrder,Amount"];
    const rows = adminState.customers.map(
      (c) => `"${c.name || ""}","${c.country || ""}","${c.phone || ""}","${c.lastOrderCode || ""}",${c.lastOrderAmount || 0}`
    );
    const blob = new Blob([headers.concat(rows).join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "paradise_customers.csv";
    a.click();
  });
}

/* ==========================================================================
   12. TAB 4: VIDEOS MANAGER (HERO, SHOWROOM & CARGO REVIEWS)
   ========================================================================== */
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
          <td>${thumb ? `<img src="${thumb}" style="width:48px; height:64px; object-fit:cover; border-radius:6px;" />` : "🎬"}</td>
          <td><strong>${escapeHtml(v.title || "")}</strong></td>
          <td>${escapeHtml(v.dept || "all")}</td>
          <td style="direction:ltr;"><code>${ytId || escapeHtml(v.url || "")}</code></td>
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
      const thumb = escapeHtml(v.thumb || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`);
      return `
        <tr>
          <td><img src="${thumb}" style="width:48px; height:64px; object-fit:cover; border-radius:6px;" /></td>
          <td>${escapeHtml(v.badge || "CARGO")}</td>
          <td><strong>${escapeHtml(v.title || "")}</strong></td>
          <td style="direction:ltr;"><code>${ytId}</code></td>
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

  document.getElementById("admin-add-showroom-video-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rawUrl = document.getElementById("showroom-vid-url").value.trim();
    const ytId = extractYouTubeId(rawUrl);
    const title = document.getElementById("showroom-vid-title").value.trim();
    const dept = document.getElementById("showroom-vid-dept").value || "all";
    const thumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "";

    if (!Array.isArray(adminState.publicConfig.showroomVideos)) adminState.publicConfig.showroomVideos = [];
    adminState.publicConfig.showroomVideos.unshift({ url: rawUrl, ytId, title, dept, thumb });

    await setDoc(doc(db, "settings", "public_config"), { showroomVideos: adminState.publicConfig.showroomVideos }, { merge: true });
    renderShowroomVideosTable();
    e.target.reset();
    showAdminToast("✓ ویدیو به ویترین اضافه شد!");
  });

  document.getElementById("admin-showroom-videos-tbody")?.addEventListener("click", async (e) => {
    const rmBtn = e.target.closest("[data-remove-showroom-vid]");
    if (!rmBtn) return;
    const idx = parseInt(rmBtn.getAttribute("data-remove-showroom-vid"), 10);
    adminState.publicConfig.showroomVideos.splice(idx, 1);
    await setDoc(doc(db, "settings", "public_config"), { showroomVideos: adminState.publicConfig.showroomVideos }, { merge: true });
    renderShowroomVideosTable();
  });

  document.getElementById("admin-add-cargo-video-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rawUrl = document.getElementById("cargo-vid-url").value.trim();
    const ytId = extractYouTubeId(rawUrl) || rawUrl;
    const badge = document.getElementById("cargo-vid-badge").value.trim();
    const title = document.getElementById("cargo-vid-title").value.trim();
    const thumb = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;

    if (!Array.isArray(adminState.publicConfig.cargoVideos)) adminState.publicConfig.cargoVideos = [];
    adminState.publicConfig.cargoVideos.unshift({ ytId, badge, title, thumb });

    await setDoc(doc(db, "settings", "public_config"), { cargoVideos: adminState.publicConfig.cargoVideos }, { merge: true });
    renderCargoVideosTable();
    e.target.reset();
    showAdminToast("✓ ویدیوی ارسال بار اضافه شد!");
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

/* ==========================================================================
   13. TAB 5: 1-CLICK AUTO 3-LANGUAGE BLOG & GITHUB SITEMAP PUBLISHER
   ========================================================================== */
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
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--text-muted);">هنوز مقاله‌ای منتشر نشده است.</td></tr>`;
    return;
  }
  tbody.innerHTML = adminState.blogs
    .map((b) => {
      const id = escapeHtml(b.id);
      const titleEn = escapeHtml(b.title?.en || b.title || "Article");
      const slugEn = escapeHtml(b.slugs?.en || b.slug || id);
      return `
        <tr>
          <td><img src="${escapeHtml(b.coverImage || "")}" style="width:56px; height:36px; object-fit:cover; border-radius:4px;" /></td>
          <td><strong>${titleEn}</strong></td>
          <td style="direction:ltr;"><a href="blog.html?slug=${encodeURIComponent(slugEn)}" target="_blank">/en/blog/${slugEn}/ ↗</a></td>
          <td>${escapeHtml(b.category || "logistics")}</td>
          <td>${escapeHtml(b.publishedAt || "2026")}</td>
          <td><button type="button" class="btn-outline" data-delete-blog="${id}" style="color:var(--danger);">🗑 حذف</button></td>
        </tr>
      `;
    })
    .join("");
}

async function commitFileToGitHub(filePath, contentString, commitMessage) {
  const token = (document.getElementById("cfg-github-token")?.value || adminState.adminSecrets.githubToken || "").trim();
  const repo = (document.getElementById("cfg-github-repo")?.value || adminState.adminSecrets.githubRepo || "").trim();
  const branch = (document.getElementById("cfg-github-branch")?.value || adminState.adminSecrets.githubBranch || "main").trim();

  if (!token || !repo) throw new Error("توکن یا ریپازیتوری گیت‌هاب در تب ۶ وارد نشده است.");

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

  DEPARTMENTS_TAXONOMY.forEach((dept) => {
    urls.push({ loc: `${SITE_DOMAIN}/category.html?dept=${dept.id}`, priority: "0.85" });
    dept.subcategories.forEach((sc) => {
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

  const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /order.html\nDisallow: /*?q=*\nSitemap: ${SITE_DOMAIN}/sitemap.xml\n`;

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
    if (statusEl) statusEl.textContent = "⏳ جمنای در حال نگارش و انتشار مقاله ۳ زبانه...";

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

      await setDoc(doc(db, "settings", "blog_index"), {
        updatedAtIso: nowIso,
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

      renderPublishedBlogsTable();
      updateDashboardKPIs();
      if (statusEl) statusEl.textContent = "✓ مقاله ۳ زبانه با موفقیت منتشر شد!";
      showAdminToast("🚀 مقاله ۳ زبانه تولید و منتشر شد!");
    } catch (err) {
      if (statusEl) statusEl.textContent = `خطا: ${err.message}`;
      showAdminToast(`خطا: ${err.message}`);
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  document.getElementById("admin-blogs-tbody")?.addEventListener("click", async (e) => {
    const delBtn = e.target.closest("[data-delete-blog]");
    if (!delBtn) return;
    const id = delBtn.getAttribute("data-delete-blog");
    if (!confirm("این مقاله حذف شود؟")) return;
    await deleteDoc(doc(db, "blogs", id));
    adminState.blogs = adminState.blogs.filter((b) => b.id !== id);
    renderPublishedBlogsTable();
    updateDashboardKPIs();
  });
}

/* ==========================================================================
   14. TAB 6: GLOBAL LIVE SETTINGS, GEMINI KEYS & GITHUB
   ========================================================================== */
async function loadSettingsFromFirestore() {
  try {
    const pubSnap = await getDoc(doc(db, "settings", "public_config"));
    if (pubSnap.exists()) {
      adminState.publicConfig = { ...adminState.publicConfig, ...pubSnap.data(), currencySymbol: "$", currencyCode: "USD" };
    }
  } catch (e) {}

  try {
    const secSnap = await getDoc(doc(db, "settings", "admin_secrets"));
    if (secSnap.exists()) {
      adminState.adminSecrets = { ...adminState.adminSecrets, ...secSnap.data() };
    }
  } catch (e) {}

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

  setVal("cfg-whatsapp-raw", pub.whatsappRaw || DEFAULT_WHATSAPP);
  setVal("cfg-whatsapp-display", pub.whatsappDisplay || "+90 545 909 93 95");
  setVal("cfg-bulk-threshold", pub.bestRateThreshold || 25);

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

    const updatedPublic = {
      ...adminState.publicConfig,
      whatsappRaw: document.getElementById("cfg-whatsapp-raw").value.trim() || DEFAULT_WHATSAPP,
      whatsappDisplay: document.getElementById("cfg-whatsapp-display").value.trim() || "+90 545 909 93 95",
      currencySymbol: "$",
      currencyCode: "USD",
      bestRateThreshold: Math.max(1, parseInt(document.getElementById("cfg-bulk-threshold").value, 10) || 25),
      ga4MeasurementId: document.getElementById("cfg-ga4-id").value.trim(),
      googleAdsId: document.getElementById("cfg-gads-id").value.trim(),
      googleAdsConversionLabel: document.getElementById("cfg-gads-label").value.trim(),
      googleSiteVerification: document.getElementById("cfg-gsc-verify").value.trim(),
      instagramUrl: document.getElementById("cfg-instagram-url").value.trim(),
      telegramUrl: document.getElementById("cfg-telegram-url").value.trim(),
      tiktokUrl: document.getElementById("cfg-tiktok-url").value.trim(),
      androidAppUrl: document.getElementById("cfg-android-app-url").value.trim(),
      vendors: adminState.vendors,
      updatedAtIso: new Date().toISOString()
    };

    const geminiKeys = document
      .getElementById("cfg-gemini-keys")
      .value.split(/[\r\n,]+/)
      .map((k) => k.trim())
      .filter(Boolean);

    const updatedSecrets = {
      geminiKeys,
      geminiModel: document.getElementById("cfg-gemini-model").value || "gemini-2.5-flash",
      githubToken: document.getElementById("cfg-github-token").value.trim(),
      githubRepo: document.getElementById("cfg-github-repo").value.trim(),
      githubBranch: document.getElementById("cfg-github-branch").value.trim() || "main",
      updatedAtIso: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "settings", "public_config"), updatedPublic, { merge: true });
      await setDoc(doc(db, "settings", "admin_secrets"), updatedSecrets, { merge: true });
      adminState.publicConfig = updatedPublic;
      adminState.adminSecrets = updatedSecrets;
      populateSettingsFormUI();
      showAdminToast("✓ تمام تنظیمات با موفقیت ذخیره شد!");
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
      showAdminToast("✓ فایل‌های sitemap.xml و robots.txt در گیت‌هاب ساخته شدند!");
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    }
  });
}

/* ==========================================================================
   15. INITIALIZE MINIMAL PERSIAN ADMIN SUITE
   ========================================================================== */
function initAdminSuite() {
  cleanDuplicateDomNodes();
  bindAuthEvents();
  bindNavigationEvents();
  bindProductUploaderEvents();
  bindCatalogManagerEvents();
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
