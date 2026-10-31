/**
 * ============================================================================
 * PARADISE WHOLESALE CLOTHING (Paradise Turkey Wholesale)
 * Domain: https://paradisewholesaler.com
 * File: admin.js (BLOCK 1 OF 2) — Persian Executive B2B Admin Engine,
 *       Batch Uploader with Duplicate Shield, Retry Queue, Watermark & AI Worker
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
   1. CORE CONFIGURATION & CONSTANTS
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
export const SHARD_CHUNK_SIZE = 100; // بسته‌های ۱۰۰تایی برای پشتیبانی از ده‌ها هزار محصول

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* درخت ۵ دپارتمان و شاخه‌ها (کاملاً هماهنگ با core.js و category.html) */
export const DEPARTMENTS_TAXONOMY = [
  {
    id: "men",
    label: "مردانه (Men)",
    subcategories: [
      { id: "men-tshirts", label: "تیشرت مردانه (T-Shirts)" },
      { id: "men-shirts", label: "پیراهن مردانه (Shirts)" },
      { id: "men-knitwear", label: "بافت و پلیور مردانه (Knitwear)" },
      { id: "men-sweatshirts-hoodies", label: "هودی و دورس مردانه (Hoodies & Sweatshirts)" },
      { id: "men-tracksuits", label: "ست ورزشی و ترک‌سوئیت مردانه (Tracksuits)" },
      { id: "men-jeans", label: "شلوار جین مردانه (Jeans)" },
      { id: "men-trousers", label: "شلوار کتان و پارچه‌ای مردانه (Trousers)" },
      { id: "men-jackets-coats", label: "کاپشن و پالتو مردانه (Jackets & Coats)" },
      { id: "men-suits-blazers", label: "کت و شلوار مردانه (Suits & Blazers)" }
    ]
  },
  {
    id: "women",
    label: "زنانه (Women)",
    subcategories: [
      { id: "women-tops-tshirts", label: "تاپ و تیشرت زنانه (Tops & T-Shirts)" },
      { id: "women-blouses-shirts", label: "بلوز و شومیز زنانه (Blouses & Shirts)" },
      { id: "women-knitwear", label: "بافت زنانه (Knitwear)" },
      { id: "women-sweatshirts-hoodies", label: "هودی و سوئیشرت زنانه (Sweatshirts & Hoodies)" },
      { id: "women-dresses-jumpsuits", label: "پیراهن، مجلسی و سرهمی (Dresses & Jumpsuits)" },
      { id: "women-skirts", label: "دامن زنانه (Skirts)" },
      { id: "women-jeans-trousers", label: "شلوار و جین زنانه (Jeans & Trousers)" },
      { id: "women-tracksuits-loungewear", label: "ست راحتی و ترک‌سوئیت زنانه (Tracksuits)" },
      { id: "women-jackets-coats", label: "کاپشن و مانتو/پالتو زنانه (Jackets & Coats)" },
      { id: "women-suits-coord", label: "ست دو تکه و کت‌شلوار زنانه (Suits & Co-ord)" }
    ]
  },
  {
    id: "kids-baby",
    label: "بچگانه و نوزادی (Kids & Baby)",
    subcategories: [
      { id: "kids-boys", label: "پسرانه (Boys Clothing)" },
      { id: "kids-girls", label: "دخترانه (Girls Clothing)" },
      { id: "kids-baby-sets", label: "ست نوزادی (Baby Sets)" }
    ]
  },
  {
    id: "shoes",
    label: "کفش و کتانی (Shoes)",
    subcategories: [
      { id: "shoes-men", label: "کفش و کتانی مردانه (Men's Shoes)" },
      { id: "shoes-women", label: "کفش و کتانی زنانه (Women's Shoes)" }
    ]
  },
  {
    id: "bags-accessories",
    label: "کیف و اکسسوری (Bags & Accessories)",
    subcategories: [
      { id: "bags-main", label: "کیف (Bags)" },
      { id: "accessories-main", label: "اکسسوری، کمربند و کلاه (Accessories)" }
    ]
  }
];

/* ==========================================================================
   2. ADMIN APPLICATION STATE
   ========================================================================== */
const adminState = {
  user: null,
  orders: [],
  customers: [],
  products: [],
  blogs: [],
  stagedImages: [], // آرایه فایل‌های انتخاب‌شده برای آپلود
  failedUploadQueue: [], // صف عکس‌هایی که هنگام آپلود با خطا مواجه شدند (برای دکمه تلاش مجدد)
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
    currencySymbol: "€",
    currencyCode: "EUR",
    bestRateThreshold: 25,
    ga4MeasurementId: "",
    googleAdsId: "",
    googleAdsConversionLabel: "",
    googleSiteVerification: "",
    instagramUrl: "https://instagram.com/paradisewholesaler",
    telegramUrl: "https://t.me/paradisewholesaler",
    tiktokUrl: "https://tiktok.com/@paradisewholesaler",
    androidAppUrl: "",
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
   3. UTILITY HELPERS & DUPLICATE FINGERPRINT ENGINE
   ========================================================================== */
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;")
    .replace(/'/g, "&" + "#039;");
}

function showAdminToast(message, duration = 4000) {
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
  return match ? match[1] : raw;
}

function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function formatMoney(amount) {
  const sym = adminState.publicConfig.currencySymbol || "€";
  return `${sym}${(Number(amount) || 0).toFixed(2)}`;
}

/**
 * تولید اثرانگشت یکتا برای هر فایل جهت جلوگیری ۱۰۰٪ از آپلود تکراری
 */
function getFileFingerprint(file) {
  if (!file) return "";
  const cleanName = String(file.name || "").trim().toLowerCase();
  const size = Number(file.size) || 0;
  return `${cleanName}__${size}`;
}

/**
 * بررسی می‌کند آیا این فایل قبلاً در دیتابیس آپلود شده است یا خیر
 */
function findDuplicateProductByFingerprint(fingerprint) {
  if (!fingerprint) return null;
  return adminState.products.find(
    (p) =>
      p.fileFingerprint === fingerprint ||
      (Array.isArray(p.fileFingerprints) && p.fileFingerprints.includes(fingerprint))
  );
}

/* ==========================================================================
   4. AUTO-PERSIAN UI TRANSLATOR & SMART CONTROLS INJECTOR
   ========================================================================== */
function injectPersianAndSmartFeaturesUI() {
  // ۱. فارسی کردن منوهای سایدبار و هدر
  const navMap = {
    orders: "📦 ۱. سفارشات و مشتریان واتساپ",
    "ai-uploader": "✨ ۲. آپلود دسته‌ای و هوش مصنوعی",
    catalog: "🏷️ ۳. مدیریت کاتالوگ و عمده‌فروشان",
    blog: "📰 ۴. مقاله‌نویس ۳ زبانه و سئو",
    videos: "🎬 ۵. ویدیوها و ویترین یوتیوب",
    settings: "⚙️ ۶. تنظیمات کلی، کلیدها و ادز"
  };

  document.querySelectorAll("[data-admin-tab]").forEach((btn) => {
    const tabKey = btn.getAttribute("data-admin-tab");
    const labelSpan = btn.querySelector(".sidebar-tab-btn-left span:last-child");
    if (labelSpan && navMap[tabKey]) {
      labelSpan.textContent = navMap[tabKey];
    }
  });

  const topTitle = document.getElementById("topbar-active-title");
  if (topTitle) topTitle.textContent = "📦 ۱. مدیریت سفارشات و مشتریان واتساپ";

  const syncBtn = document.getElementById("topbar-quick-shard-sync");
  if (syncBtn) syncBtn.textContent = "⚡ بروزرسانی فوری کاتالوگ سایت";

  // ۲. تزریق پنل «آپلود دسته‌ای سریع + کد عمده‌فروش + ویدیو + گزارش آپلود و تلاش مجدد + صف هوش مصنوعی» در تب ۲
  const tabUploader = document.getElementById("tab-ai-uploader");
  if (tabUploader && !document.getElementById("smart-batch-control-panel")) {
    const batchPanel = document.createElement("div");
    batchPanel.id = "smart-batch-control-panel";
    batchPanel.className = "panel-card gold-accent";
    batchPanel.style.direction = "rtl";
    batchPanel.innerHTML = `
      <div class="panel-header dark-header" style="direction:rtl;">
        <div class="panel-title">
          <span>🚀</span>
          <span>مرکز آپلود دسته‌ای هوشمند (۱۰۰ تیشرت یکجا)، حک کد عمده‌فروش و صف خودکار هوش مصنوعی</span>
        </div>
        <span class="top-bar-badge" style="background:var(--adm-emerald); color:#fff;">ضد تکراری + تلاش مجدد خودکار</span>
      </div>
      <div class="panel-body" style="direction:rtl; text-align:right;">
        <!-- وضعیت ربات هوش مصنوعی پس‌زمینه -->
        <div id="ai-background-worker-bar" style="background:#0f172a; color:#fff; padding:14px 18px; border-radius:10px; border:1px solid var(--gold); margin-bottom:18px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
          <div>
            <strong style="color:var(--gold-light); font-size:0.92rem; display:block;">🤖 ربات تگ‌گذار خودکار جمنای در پس‌زمینه (Background AI Queue)</strong>
            <span id="ai-worker-status-label" style="font-size:0.8rem; color:#cbd5e1;">آماده به کار — محصولات آپلود شده بدون معطلی شما در پس‌زمینه یکی‌یکی تگ‌گذاری و ۳ زبانه می‌شوند.</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span id="ai-queue-remaining-badge" class="top-bar-badge" style="background:#1e293b; color:#a7f3d0; font-size:0.8rem;">در صف انتظار AI: 0 محصول</span>
            <button type="button" class="btn btn-gold" id="btn-start-ai-worker" style="padding:8px 14px; font-size:0.78rem;">▶️ شروع/ادامه تگ‌گذاری خودکار</button>
            <button type="button" class="adm-btn-xs danger" id="btn-stop-ai-worker" style="display:none; padding:8px 12px;">⏹ توقف موقت</button>
          </div>
        </div>

        <!-- تنظیمات مشترک آپلود دسته‌ای، عمده‌فروش، واترمارک و ویدیو -->
        <div class="form-grid-4" style="margin-bottom:16px; background:#f8fafc; padding:16px; border-radius:10px; border:1px solid var(--adm-border);">
          <div class="adm-field">
            <label for="batch-upload-mode">حالت آپلود عکس‌ها *</label>
            <select id="batch-upload-mode" class="adm-select">
              <option value="batch_separate">📦 آپلود دسته‌ای: هر عکس = ۱ محصول مجزا (سریع)</option>
              <option value="single_multi_angle">📸 آپلود تکی: همه عکس‌ها متعلق به ۱ محصول است</option>
            </select>
          </div>
          <div class="adm-field">
            <label for="prod-vendor-code">کد اختصاری عمده‌فروش (حک در کد و عکس) *</label>
            <input type="text" id="prod-vendor-code" class="adm-input" placeholder="مثلاً: A12 یا MTR" value="PRD" style="font-weight:800; text-transform:uppercase;" />
          </div>
          <div class="adm-field">
            <label for="prod-vendor-name">نام عمده‌فروش / مغازه (فقط برای ادمین)</label>
            <input type="text" id="prod-vendor-name" class="adm-input" placeholder="مثلاً: مهمت مرتر - تیشرت" />
          </div>
          <div class="adm-field">
            <label for="prod-watermark-toggle">حک کد روی عکس (Watermark)</label>
            <label style="display:flex; align-items:center; gap:8px; padding-top:8px; cursor:pointer; font-size:0.82rem; font-weight:700;">
              <input type="checkbox" id="prod-watermark-toggle" checked style="width:18px; height:18px;" />
              <span>حک خودکار کد و قیمت روی عکس (بدون افت سرعت)</span>
            </label>
          </div>
        </div>

        <!-- افزودن ویدیو به محصول (فایل ویدیو یا لینک یوتیوب/Shorts) -->
        <div class="form-grid-2" style="margin-bottom:16px; background:#fffbeb; padding:14px 16px; border-radius:10px; border:1px solid rgba(212,175,55,0.4);">
          <div class="adm-field">
            <label for="prod-youtube-url">🎬 لینک ویدیوی یوتیوب / Shorts برای این محصول (اختیاری)</label>
            <input type="text" id="prod-youtube-url" class="adm-input" placeholder="https://youtube.com/shorts/... یا لینک ویدیو" />
          </div>
          <div class="adm-field">
            <label for="prod-video-file">📹 یا آپلود مستقیم فایل ویدیوی محصول (MP4 - اختیاری)</label>
            <input type="file" id="prod-video-file" class="adm-input" accept="video/mp4,video/webm,video/quicktime" />
          </div>
        </div>

        <!-- دکمه بزرگ آپلود دسته‌ای سریع -->
        <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
          <div style="font-size:0.82rem; color:var(--text-secondary);">
            💡 <strong>راهنمای آپلود دسته‌ای:</strong> ابتدا شاخه (مثلاً تیشرت مردانه)، قیمت واحد (مثلاً 5) و کد عمده‌فروش (مثلاً A12) را در فرم پایین تنظیم کنید، سپس صدها عکس را انتخاب کرده و دکمه سبز روبرو را بزنید.
          </div>
          <button type="button" class="btn btn-gold" id="btn-fast-batch-upload" style="background:var(--adm-emerald); color:#fff; padding:14px 26px; font-size:0.95rem; box-shadow:0 8px 20px rgba(16,185,129,0.3);">
            🚀 شروع آپلود دسته‌ای سریع + ارسال به صف هوش مصنوعی
          </button>
        </div>

        <!-- کادر گزارش دقیق آپلود (موفق / ناموفق / تکراری + دکمه تلاش مجدد) -->
        <div id="batch-upload-report-box" style="display:none; margin-top:18px; padding:18px; border-radius:10px; background:#ffffff; border:2px solid var(--adm-border);">
          <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px;">
            <strong id="batch-report-headline" style="font-size:0.95rem; color:var(--charcoal);">📊 گزارش نهایی عملیات آپلود:</strong>
            <button type="button" class="btn btn-gold" id="btn-retry-failed-uploads" style="display:none; background:#ef4444; color:#fff; padding:9px 18px; font-size:0.84rem;">
              🔄 تلاش مجدد برای عکس‌های ناموفق (0)
            </button>
          </div>
          <div class="form-grid-3" style="margin-bottom:12px;">
            <div style="padding:10px 14px; border-radius:8px; background:#ecfdf5; border:1px solid #10b981; color:#065f46; font-weight:800;">
              ✅ آپلود موفق: <span id="rep-count-success">0</span> محصول
            </div>
            <div style="padding:10px 14px; border-radius:8px; background:#fef3c7; border:1px solid #f59e0b; color:#92400e; font-weight:800;">
              ⚠️ تکراری (رد شده): <span id="rep-count-duplicate">0</span> فایل
            </div>
            <div style="padding:10px 14px; border-radius:8px; background:#fef2f2; border:1px solid #ef4444; color:#991b1b; font-weight:800;">
              ❌ ناموفق (خطا): <span id="rep-count-failed">0</span> فایل
            </div>
          </div>
          <div id="batch-report-details-log" style="max-height:170px; overflow-y:auto; font-size:0.78rem; background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0; line-height:1.7;"></div>
        </div>
      </div>
    `;
    tabUploader.insertBefore(batchPanel, tabUploader.firstChild);
  }

  // ۳. تزریق فیلتر عمده‌فروش + فیلتر زیرشاخه + دکمه «حذف دسته‌جمعی محصولات عمده‌فروش» در تب ۳ (کاتالوگ)
  const tabCatalog = document.getElementById("tab-catalog");
  const catFilterDept = document.getElementById("catalog-filter-dept");
  if (tabCatalog && catFilterDept && !document.getElementById("catalog-filter-vendor")) {
    const filterParent = catFilterDept.parentElement;

    // فیلتر زیرشاخه (تیشرت، ترک‌سوئیت، هودی و...)
    const subcatSelect = document.createElement("select");
    subcatSelect.id = "catalog-filter-subcat";
    subcatSelect.className = "adm-select";
    subcatSelect.style.width = "190px";
    subcatSelect.innerHTML = `<option value="all">همه زیرشاخه‌ها (تیشرت، هودی...)</option>`;
    DEPARTMENTS_TAXONOMY.forEach((d) => {
      d.subcategories.forEach((sc) => {
        subcatSelect.innerHTML += `<option value="${sc.id}">${sc.label}</option>`;
      });
    });
    filterParent.insertBefore(subcatSelect, catFilterDept.nextSibling);

    // فیلتر کد عمده‌فروش
    const vendorSelect = document.createElement("select");
    vendorSelect.id = "catalog-filter-vendor";
    vendorSelect.className = "adm-select";
    vendorSelect.style.width = "190px";
    vendorSelect.innerHTML = `<option value="all">همه عمده‌فروش‌ها (Vendors)</option>`;
    filterParent.insertBefore(vendorSelect, subcatSelect.nextSibling);

    // نوار حذف دسته‌جمعی بر اساس عمده‌فروش و شاخه
    const bulkDeleteBar = document.createElement("div");
    bulkDeleteBar.id = "vendor-bulk-delete-bar";
    bulkDeleteBar.style.cssText =
      "direction:rtl; margin-bottom:16px; padding:12px 16px; border-radius:10px; background:#fef2f2; border:1px solid #fecaca; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px;";
    bulkDeleteBar.innerHTML = `
      <div style="font-size:0.82rem; color:#991b1b; font-weight:700;">
        🗑️ <strong>بروزرسانی و پاکسازی عمده‌فروش:</strong> ابتدا از منوهای بالا «عمده‌فروش» و در صورت تمایل «زیرشاخه (مثلاً تیشرت یا ترک‌سوئیت)» را انتخاب کنید، سپس دکمه مقابل را بزنید تا فقط همان محصولات یکجا پاک شوند.
      </div>
      <button type="button" class="adm-btn-xs danger" id="btn-bulk-delete-filtered" style="padding:9px 16px; font-size:0.82rem; background:#ef4444; color:#fff; border:none;">
        🗑️ حذف یکجای محصولات فیلتر شده
      </button>
    `;
    filterParent.parentElement.insertAdjacentElement("afterend", bulkDeleteBar);
  }

  // ۴. تزریق بخش «ویترین ویدیوها و تیزرهای یوتیوب (Showroom Videos)» در تب ۵
  const tabVideos = document.getElementById("tab-videos");
  if (tabVideos && !document.getElementById("showroom-videos-card")) {
    const showroomCard = document.createElement("div");
    showroomCard.id = "showroom-videos-card";
    showroomCard.className = "panel-card gold-accent";
    showroomCard.style.direction = "rtl";
    showroomCard.innerHTML = `
      <div class="panel-header dark-header">
        <div class="panel-title">
          <span>📺</span>
          <span>ویترین ویدیوها و تیزرهای نمایش محصولات (پخش در صفحه اصلی در کنار رضایت مشتریان)</span>
        </div>
      </div>
      <div class="panel-body">
        <form id="admin-add-showroom-video-form" style="margin-bottom:20px; padding:16px; background:#f8fafc; border:1px solid var(--adm-border); border-radius:10px;">
          <div class="form-grid-3" style="margin-bottom:12px;">
            <div class="adm-field">
              <label for="showroom-vid-url">لینک یوتیوب / Shorts یا لینک مستقیم MP4 *</label>
              <input type="text" id="showroom-vid-url" class="adm-input" required placeholder="https://youtube.com/shorts/..." />
            </div>
            <div class="adm-field">
              <label for="showroom-vid-title">عنوان ویدیو (نمایش زیر ویدیو) *</label>
              <input type="text" id="showroom-vid-title" class="adm-input" required placeholder="مثلاً: کالکشن جدید تیشرت‌های سنگین‌وزن ۲۰۲۵" />
            </div>
            <div class="adm-field">
              <label for="showroom-vid-dept">دپارتمان مرتبط</label>
              <select id="showroom-vid-dept" class="adm-select">
                <option value="all">کل سایت (عمومی)</option>
                <option value="men">مردانه</option>
                <option value="women">زنانه</option>
                <option value="shoes">کفش</option>
                <option value="bags-accessories">کیف و اکسسوری</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-gold" style="padding:9px 18px; font-size:0.82rem;">+ افزودن به ویترین ویدیوهای سایت</button>
        </form>
        <div class="table-responsive">
          <table class="adm-table">
            <thead>
              <tr>
                <th>پیش‌نمایش</th>
                <th>عنوان ویدیو</th>
                <th>دپارتمان</th>
                <th>شناسه / لینک</th>
                <th style="text-align:right;">حذف</th>
              </tr>
            </thead>
            <tbody id="admin-showroom-videos-tbody"></tbody>
          </table>
        </div>
      </div>
    `;
    tabVideos.appendChild(showroomCard);
  }
}

/* ==========================================================================
   5. FIREBASE AUTHENTICATION & INITIAL BOOTSTRAP
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
        submitBtn.textContent = "در حال بررسی و ورود به پنل...";
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        showAdminToast("✓ خوش آمدید! ورود با موفقیت انجام شد.");
      } catch (err) {
        if (errBox) {
          errBox.style.display = "block";
          errBox.textContent = `خطا در ورود: رمز عبور یا ایمیل اشتباه است (${err.message})`;
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
      showAdminToast("از حساب مدیریت خارج شدید.");
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
      // اگر محصولی از قبل در صف هوش مصنوعی مانده باشد، وضعیتش را نشان بده
      updateAiQueueBadge();
    } else {
      if (authScreen) authScreen.style.display = "flex";
      if (appShell) appShell.style.display = "none";
    }
  });
}

async function loadAllAdminData() {
  await Promise.all([
    loadSettingsFromFirestore(),
    loadOrdersAndCustomers(),
    loadProductsCatalog(),
    loadPublishedBlogs()
  ]);
  updateDashboardKPIs();
  refreshVendorFilterDropdown();
}

function updateDashboardKPIs() {
  const prodCount = adminState.products.length;
  const ordCount = adminState.orders.length;
  const custCount = adminState.customers.length;
  const blogCount = adminState.blogs.length;
  const keyCount = adminState.adminSecrets.geminiKeys.length;

  const totalVolume = adminState.orders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("kpi-total-products", String(prodCount));
  setTxt("kpi-total-orders", String(ordCount));
  setTxt("kpi-orders-volume", `مجموع کل سفارشات: ${formatMoney(totalVolume)}`);
  setTxt("kpi-total-customers", String(custCount));
  setTxt("kpi-ai-keys-count", keyCount > 0 ? `${keyCount} کلید فعال ⚡` : "کلید جمنای را در تب ۶ وارد کنید");

  setTxt("nav-badge-orders", String(ordCount));
  setTxt("nav-badge-products", String(prodCount));
  setTxt("nav-badge-blogs", String(blogCount));
}

/* ==========================================================================
   6. NAVIGATION & SIDEBAR TABS CONTROLLER
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
    backdrop?.classList.remove("active");
  });
  closeBtn?.addEventListener("click", closeMobileSidebar);
  backdrop?.addEventListener("click", closeMobileSidebar);

  const tabTitles = {
    orders: "📦 ۱. سفارشات پیش‌فاکتور و مشتریان واتساپ",
    "ai-uploader": "✨ ۲. آپلود دسته‌ای محصولات، واترمارک و هوش مصنوعی",
    catalog: "🏷️ ۳. مدیریت کاتالوگ، قیمت‌ها و حذف بر اساس عمده‌فروش",
    blog: "📰 ۴. استودیوی مقاله‌نویس ۳ زبانه و سئوی گیت‌هاب",
    videos: "🎬 ۵. مدیریت ویدیوهای یوتیوب، رضایت مشتریان و ویترین",
    settings: "⚙️ ۶. تنظیمات کلی سایت، شماره واتساپ، گوگل ادز و کلیدهای API"
  };

  document.querySelectorAll("[data-admin-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-admin-tab");
      if (!targetTab) return;

      document.querySelectorAll("[data-admin-tab]").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
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

  document.getElementById("topbar-quick-shard-sync")?.addEventListener("click", async () => {
    await rebuildAllCatalogShards();
  });
}

/* ==========================================================================
   7. TAB 1: ORDERS & WHATSAPP CRM ENGINE
   ========================================================================== */
async function loadOrdersAndCustomers() {
  try {
    const ordQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(200));
    const ordSnap = await getDocs(ordQuery);
    const ordersList = [];
    ordSnap.forEach((d) => ordersList.push({ id: d.id, orderCode: d.id, ...d.data() }));
    adminState.orders = ordersList;
  } catch (err) {
    try {
      const fallbackSnap = await getDocs(collection(db, "orders"));
      const ordersList = [];
      fallbackSnap.forEach((d) => ordersList.push({ id: d.id, orderCode: d.id, ...d.data() }));
      adminState.orders = ordersList;
    } catch (e) {
      console.warn("Orders load warning:", e.message);
    }
  }

  try {
    const custSnap = await getDocs(collection(db, "customers"));
    const custList = [];
    custSnap.forEach((d) => custList.push({ id: d.id, ...d.data() }));
    adminState.customers = custList;
  } catch (e) {
    console.warn("Customers load warning:", e.message);
  }

  renderOrdersTable();
  renderCustomersTable();
  updateDashboardKPIs();
}

function renderOrdersTable() {
  const tbody = document.getElementById("admin-orders-tbody");
  if (!tbody) return;

  const searchQ = (document.getElementById("orders-search-input")?.value || "").trim().toLowerCase();
  const statusFilter = document.getElementById("orders-status-filter")?.value || "all";

  const filtered = adminState.orders.filter((o) => {
    if (statusFilter !== "all" && (o.status || "pending_whatsapp") !== statusFilter) {
      return false;
    }
    if (searchQ) {
      const hay = `${o.orderCode || ""} ${o.buyerName || ""} ${o.buyerCountry || ""} ${o.buyerPhone || ""}`.toLowerCase();
      if (!hay.includes(searchQ)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:26px; color:var(--text-muted);">هیچ پیش‌فاکتوری یافت نشد.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((o) => {
      const code = escapeHtml(o.orderCode || o.id || "ORD-0000");
      const dateStr = o.createdAtIso ? new Date(o.createdAtIso).toLocaleDateString("fa-IR") : "2026";
      const buyer = escapeHtml(o.buyerName || "مشتری عمده");
      const country = escapeHtml(o.buyerCountry || "—");
      const phone = escapeHtml(o.buyerPhone || "—");
      const cleanPhone = String(o.buyerPhone || "").replace(/[^0-9]/g, "");
      const packs = Number(o.totalPacks) || 0;
      const pcs = Number(o.totalPieces) || 0;
      const amount = formatMoney(o.totalAmount || 0);
      const status = o.status || "pending_whatsapp";
      const invoiceUrl = `order.html?id=${encodeURIComponent(o.orderCode || o.id)}`;

      const waMsg = encodeURIComponent(
        `Hello ${o.buyerName || "Partner"}! Regarding your Paradise Wholesale Istanbul Proforma Order *${o.orderCode || o.id}* (${pcs} pcs — ${amount}):\n${SITE_DOMAIN}/${invoiceUrl}\nOur warehouse team is ready to finalize your express shipment.`
      );
      const waHref = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${waMsg}`
        : `https://wa.me/${adminState.publicConfig.whatsappRaw.replace(/[^0-9]/g, "")}?text=${waMsg}`;

      return `
        <tr>
          <td>
            <strong style="color:var(--charcoal); display:block;">${code}</strong>
            <span style="font-size:0.74rem; color:var(--text-muted);">${escapeHtml(dateStr)}</span>
          </td>
          <td><strong>${buyer}</strong></td>
          <td>${country}</td>
          <td>${phone}</td>
          <td>
            <strong>${packs} پک</strong>
            <span style="display:block; font-size:0.74rem; color:var(--emerald-dark); font-weight:700;">${pcs} عدد ${pcs >= 25 ? "★ عمده VIP" : ""}</span>
          </td>
          <td style="font-weight:800; color:var(--gold-dark);">${amount}</td>
          <td>
            <select class="adm-select" data-order-status-change="${code}" style="padding:5px 8px; font-size:0.76rem; width:170px;">
              <option value="pending_whatsapp" ${status === "pending_whatsapp" ? "selected" : ""}>🟡 در انتظار واتساپ</option>
              <option value="preparing" ${status === "preparing" ? "selected" : ""}>🔵 در حال آماده‌سازی انبار</option>
              <option value="shipped" ${status === "shipped" ? "selected" : ""}>🟣 تحویل به کارگو</option>
              <option value="completed" ${status === "completed" ? "selected" : ""}>🟢 تکمیل شده</option>
            </select>
          </td>
          <td style="text-align:right; white-space:nowrap;">
            <a href="${invoiceUrl}" target="_blank" class="adm-btn-xs" title="مشاهده پیش‌فاکتور">📄 فاکتور ↗</a>
            <a href="${waHref}" target="_blank" rel="noopener" class="adm-btn-xs" style="background:var(--emerald-light); color:var(--emerald-dark); border-color:var(--adm-emerald);">💬 واتساپ مشتری</a>
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
    const hay = `${c.name || ""} ${c.country || ""} ${c.phone || ""} ${c.lastOrderCode || ""}`.toLowerCase();
    return hay.includes(q);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">هنوز مشتری ثبت نشده است.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((c) => {
      const name = escapeHtml(c.name || "خریدار عمده");
      const country = escapeHtml(c.country || "—");
      const phone = escapeHtml(c.phone || "—");
      const cleanPhone = String(c.phone || "").replace(/[^0-9]/g, "");
      const lastOrder = escapeHtml(c.lastOrderCode || "—");
      const lastAmt = formatMoney(c.lastOrderAmount || 0);
      const waLink = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${c.name || ""}, this is Paradise Wholesale Istanbul showroom desk.`)}`
        : "#";

      return `
        <tr>
          <td><strong>${name}</strong></td>
          <td>${country}</td>
          <td>${phone}</td>
          <td>
            ${lastOrder !== "—" ? `<a href="order.html?id=${encodeURIComponent(lastOrder)}" target="_blank" style="color:var(--gold-dark); font-weight:800;">${lastOrder} ↗</a>` : "—"}
          </td>
          <td style="font-weight:700;">${lastAmt} (${c.lastOrderPieces || 0} عدد)</td>
          <td style="text-align:right;">
            ${cleanPhone ? `<a href="${waLink}" target="_blank" rel="noopener" class="adm-btn-xs">💬 پیام واتساپ</a>` : "—"}
          </td>
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
    const orderCode = sel.getAttribute("data-order-status-change");
    const newStatus = sel.value;
    try {
      await updateDoc(doc(db, "orders", orderCode), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      const ordObj = adminState.orders.find((o) => (o.orderCode || o.id) === orderCode);
      if (ordObj) ordObj.status = newStatus;
      showAdminToast(`✓ وضعیت سفارش ${orderCode} بروزرسانی شد.`);
    } catch (err) {
      showAdminToast(`خطا در تغییر وضعیت: ${err.message}`);
    }
  });

  document.getElementById("btn-export-customers-csv")?.addEventListener("click", () => {
    if (adminState.customers.length === 0) {
      showAdminToast("لیست مشتریان خالی است.");
      return;
    }
    const headers = ["Name", "Country", "Phone", "LastOrderCode", "LastOrderAmount", "LastOrderPieces"];
    const rows = adminState.customers.map((c) => [
      `"${String(c.name || "").replace(/"/g, '""')}"`,
      `"${String(c.country || "").replace(/"/g, '""')}"`,
      `"${String(c.phone || "").replace(/"/g, '""')}"`,
      `"${String(c.lastOrderCode || "")}"`,
      c.lastOrderAmount || 0,
      c.lastOrderPieces || 0
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadFileBlob(csvContent, "paradise_b2b_customers.csv", "text/csv;charset=utf-8;");
  });

  document.getElementById("btn-export-customers-json")?.addEventListener("click", () => {
    if (adminState.customers.length === 0) {
      showAdminToast("لیست مشتریان خالی است.");
      return;
    }
    const jsonStr = JSON.stringify(adminState.customers, null, 2);
    downloadFileBlob(jsonStr, "paradise_b2b_customers.json", "application/json");
  });
}

function downloadFileBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   8. WEBP IMAGE COMPRESSOR + FAST WATERMARK STAMPER & GEMINI ROTATOR
   ========================================================================== */
/**
 * فشرده‌سازی عکس به WebP (حداکثر عرض 1200px) و حک کردن کد محصول/عمده‌فروش روی عکس (Watermark)
 */
async function compressImageToWebP(file, maxWidth = 1200, quality = 0.84, watermarkText = "") {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("خطا در خواندن فایل تصویر"));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("فرمت تصویر معتبر نیست"));
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

        // اگر تیک واترمارک روشن باشد، کد محصول و عمده‌فروش را شیک در گوشه پایین عکس حک کن
        if (watermarkText) {
          const fontSize = Math.max(15, Math.round(width * 0.024));
          ctx.font = `800 ${fontSize}px sans-serif`;
          const paddingX = Math.round(fontSize * 0.8);
          const paddingY = Math.round(fontSize * 0.45);
          const textMetrics = ctx.measureText(watermarkText);
          const boxW = textMetrics.width + paddingX * 2;
          const boxH = fontSize + paddingY * 2;
          const posX = 16;
          const posY = height - boxH - 16;

          ctx.fillStyle = "rgba(9, 13, 22, 0.78)";
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(posX, posY, boxW, boxH, 8);
          } else {
            ctx.rect(posX, posY, boxW, boxH);
          }
          ctx.fill();

          ctx.strokeStyle = "rgba(212, 175, 55, 0.85)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = "#f8fafc";
          ctx.textBaseline = "middle";
          ctx.fillText(watermarkText, posX + paddingX, posY + boxH / 2);
        }

        const dataUrl = canvas.toDataURL("image/webp", quality);
        const base64Data = dataUrl.split(",")[1] || "";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("تبدیل به WebP ناموفق بود"));
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

/**
 * آپلود تصویر WebP روی Firebase Storage
 */
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

/**
 * آپلود فایل ویدیوی محصول (MP4/WebM) روی Firebase Storage
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

/**
 * موتور چرخشی کلیدهای هوش مصنوعی جمنای (Multi-Key Rotator)
 */
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
    throw new Error("هیچ کلید Gemini API در تب ۶ وارد نشده است!");
  }

  const preferredModel =
    document.getElementById("cfg-gemini-model")?.value || adminState.adminSecrets.geminiModel || "gemini-2.5-flash";
  const modelsToTry = Array.from(new Set([preferredModel, "gemini-2.5-flash", "gemini-1.5-flash"]));

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
          lastError = new Error(`کلید شماره ${keyIndex + 1} به سقف محدودیت رسید (HTTP ${res.status})`);
          break;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          lastError = new Error(errData?.error?.message || `HTTP ${res.status} on ${modelName}`);
          continue;
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!rawText) {
          throw new Error("پاسخ خالی از سرور جمنای دریافت شد.");
        }

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

  throw lastError || new Error("تمام کلیدهای جمنای با خطا مواجه شدند.");
}

/* === پایان بلوک ۱ از ۲ — بلوک ۲ را دقیقاً در خط زیر پیست کنید === */
/* === شروع بلوک ۲ از ۲ — دقیقاً زیر بلوک ۱ پیست کنید === */

/* ==========================================================================
   9. TAB 2: AI PRODUCT UPLOADER, BATCH ENGINE, DUPLICATE SHIELD & AI WORKER
   ========================================================================== */
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

function updatePackMathDisplay() {
  const unitPrice = parseFloat(document.getElementById("prod-unit-price")?.value) || 0;
  const pcs = parseInt(document.getElementById("prod-pcs-per-pack")?.value, 10) || 1;
  const total = unitPrice * pcs;
  const displayEl = document.getElementById("prod-pack-total-display");
  if (displayEl) {
    displayEl.value = `${formatMoney(total)} (${pcs} عدد در پک)`;
  }
}

function getCleanVendorCode() {
  const raw = (document.getElementById("prod-vendor-code")?.value || "PRD").trim().toUpperCase();
  return raw.replace(/[^A-Z0-9]/g, "") || "PRD";
}

function generateAutoSku() {
  const vendorPrefix = getCleanVendorCode();
  const rand = Math.floor(1000 + Math.random() * 9000);
  const skuInput = document.getElementById("prod-sku");
  if (skuInput) skuInput.value = `${vendorPrefix}-${rand}`;
  return `${vendorPrefix}-${rand}`;
}

function renderStagedImagePreviews() {
  const container = document.getElementById("product-upload-previews");
  const badge = document.getElementById("webp-compression-status");
  if (!container) return;

  if (adminState.stagedImages.length === 0) {
    container.innerHTML = "";
    if (badge) badge.textContent = "آماده دریافت و فشرده‌سازی WebP";
    return;
  }

  let totalOrig = 0;
  let totalWebp = 0;

  container.innerHTML = adminState.stagedImages
    .map((item, idx) => {
      totalOrig += item.origSize || 0;
      totalWebp += item.webpSize || 0;
      const kb = item.webpSize ? `${Math.round(item.webpSize / 1024)} KB` : "لینک مستقیم";
      const fName = escapeHtml(item.fileName || `عکس ${idx + 1}`);
      return `
        <div class="upload-preview-item" title="${fName}">
          <img src="${escapeHtml(item.dataUrl || item.remoteUrl)}" alt="Preview ${idx + 1}" />
          <span class="webp-badge">⚡ ${escapeHtml(kb)}</span>
          <button type="button" data-remove-staged="${idx}" style="position:absolute; top:8px; right:8px; width:24px; height:24px; border-radius:50%; background:rgba(15,23,42,0.85); color:#fff; font-size:0.72rem; font-weight:800;">✕</button>
        </div>
      `;
    })
    .join("");

  if (badge && totalOrig > 0) {
    const savedPct = Math.max(0, Math.round((1 - totalWebp / totalOrig) * 100));
    badge.textContent = `${adminState.stagedImages.length} عکس آماده (${Math.round(totalWebp / 1024)} KB — کاهش حجم ${savedPct}%)`;
  }
}

async function handleFilesSelected(fileList) {
  const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
  if (files.length === 0) return;

  const statusEl = document.getElementById("ai-vision-status-text");
  if (statusEl) statusEl.textContent = `در حال بررسی ${files.length} تصویر و تبدیل به فرمت پرسرعت WebP...`;

  let duplicateSkippedInSelection = 0;

  for (const file of files) {
    const fp = getFileFingerprint(file);
    const alreadyStaged = adminState.stagedImages.some((s) => s.fingerprint && s.fingerprint === fp);
    if (alreadyStaged) {
      duplicateSkippedInSelection++;
      continue;
    }
    try {
      const compressed = await compressImageToWebP(file, 1200, 0.84, "");
      adminState.stagedImages.push(compressed);
    } catch (err) {
      showAdminToast(`خطا در خواندن عکس ${file.name}: ${err.message}`);
    }
  }

  renderStagedImagePreviews();
  if (statusEl) {
    statusEl.textContent = `✓ ${adminState.stagedImages.length} عکس آماده آپلود است.${duplicateSkippedInSelection > 0 ? ` (${duplicateSkippedInSelection} عکس تکراری در انتخاب فعلی نادیده گرفته شد)` : ""}`;
  }
}

/**
 * نمایش گزارش کامل آپلود دسته‌ای (موفق، تکراری، ناموفق) و مدیریت دکمه تلاش مجدد
 */
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
      retryBtn.textContent = `🔄 تلاش مجدد برای عکس‌های ناموفق (${adminState.failedUploadQueue.length})`;
    } else {
      retryBtn.style.display = "none";
    }
  }

  const logEl = document.getElementById("batch-report-details-log");
  if (logEl) {
    const lines = [];
    rep.successItems.forEach((s) => {
      lines.push(`<div style="color:#065f46;">✅ <strong>موفق:</strong> کد <code>${escapeHtml(s.sku)}</code> (${escapeHtml(s.fileName)}) — ذخیره و به صف هوش مصنوعی اضافه شد.</div>`);
    });
    rep.duplicateItems.forEach((d) => {
      lines.push(`<div style="color:#92400e;">⚠️ <strong>تکراری (رد شد):</strong> فایل <code>${escapeHtml(d.fileName)}</code> قبلاً با کد <strong>${escapeHtml(d.existingSku)}</strong> آپلود شده است.</div>`);
    });
    rep.failedItems.forEach((f) => {
      lines.push(`<div style="color:#991b1b;">❌ <strong>ناموفق:</strong> فایل <code>${escapeHtml(f.fileName)}</code> — علت: ${escapeHtml(f.error)}</div>`);
    });
    logEl.innerHTML = lines.join("") || "هیچ موردی ثبت نشد.";
  }
}

/**
 * آپلود دسته‌ای سریع (مثلاً ۱۰۰ تیشرت یکجا) + جلوگیری از تکراری + حک کد عمده‌فروش روی عکس + صف تلاش مجدد
 */
async function executeBatchUploadItems(itemsToProcess, isRetry = false) {
  if (!itemsToProcess || itemsToProcess.length === 0) {
    showAdminToast("ابتدا عکس‌های محصولات را انتخاب کنید.");
    return;
  }

  const batchBtn = document.getElementById("btn-fast-batch-upload");
  const retryBtn = document.getElementById("btn-retry-failed-uploads");
  const department = document.getElementById("prod-department")?.value || "men";
  const subcategory = document.getElementById("prod-subcategory")?.value || "men-tshirts";
  const subStyle = document.getElementById("prod-substyle")?.value || "regular";
  const unitPrice = parseFloat(document.getElementById("prod-unit-price")?.value) || 10;
  const pcsPerPack = Math.max(1, parseInt(document.getElementById("prod-pcs-per-pack")?.value, 10) || 6);
  const sizeRange = document.getElementById("prod-size-range")?.value.trim() || "S - M - L - XL";
  const stockStatus = document.getElementById("prod-stock-status")?.value || "in_stock";
  const isFeatured = Boolean(document.getElementById("prod-is-featured")?.checked);
  const vendorCode = getCleanVendorCode();
  const vendorName = (document.getElementById("prod-vendor-name")?.value || "").trim() || vendorCode;
  const watermarkEnabled = Boolean(document.getElementById("prod-watermark-toggle")?.checked);
  const youtubeRaw = (document.getElementById("prod-youtube-url")?.value || "").trim();
  const youtubeId = extractYouTubeId(youtubeRaw);
  const videoFileInput = document.getElementById("prod-video-file");
  const sharedVideoFile = videoFileInput?.files?.[0] || null;

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

  if (batchBtn) batchBtn.disabled = true;
  if (retryBtn) retryBtn.disabled = true;

  let sharedUploadedVideoUrl = "";
  if (sharedVideoFile) {
    try {
      sharedUploadedVideoUrl = await uploadVideoFileToStorage(sharedVideoFile, department, vendorCode);
    } catch (e) {
      console.warn("Shared video upload warning:", e.message);
    }
  }

  for (let i = 0; i < itemsToProcess.length; i++) {
    const item = itemsToProcess[i];
    const fileName = item.fileName || item.file?.name || `Image_${i + 1}`;
    const fp = item.fingerprint || getFileFingerprint(item.file);

    if (batchBtn) {
      batchBtn.textContent = `⏳ در حال آپلود (${i + 1} از ${itemsToProcess.length})...`;
    }

    // ۱. بررسی ضد تکراری در دیتابیس
    const duplicateProd = findDuplicateProductByFingerprint(fp);
    if (duplicateProd && !isRetry) {
      adminState.lastUploadReport.duplicateItems.push({
        fileName,
        existingSku: duplicateProd.sku || duplicateProd.id
      });
      renderBatchUploadReport();
      continue;
    }

    // ۲. تولید کد یکتا با پیشوند عمده‌فروش
    const seqNum = Math.floor(1000 + Math.random() * 9000);
    const sku = item.assignedSku || `${vendorCode}-${seqNum}`;
    item.assignedSku = sku;

    try {
      // ۳. اگر تیک حک کد روی عکس روشن است و فایل اصلی را داریم، کد را روی عکس حک کن
      let finalStaged = item;
      if (watermarkEnabled && item.file) {
        const stampText = `${sku} | ${pcsPerPack} Pcs`;
        finalStaged = await compressImageToWebP(item.file, 1200, 0.84, stampText);
      }

      // ۴. آپلود در Firebase Storage
      const remoteUrl = await uploadWebPToFirebaseStorage(finalStaged, department, sku, 0);

      // ۵. ساخت عنوان اولیه موقت و قرار دادن در صف هوش مصنوعی پس‌زمینه (aiStatus: 'pending')
      const subLabel = subcategory.replace(/^[a-z]+-/, "").replace(/-/g, " ");
      const tempTitleEn = `Wholesale Turkish ${subLabel.toUpperCase()} (${sku})`;
      const nowMillis = Date.now() + i;

      const productPayload = {
        id: sku,
        code: sku,
        sku,
        vendorCode,
        vendorName,
        fileFingerprint: fp,
        department,
        subcategory,
        subStyle,
        unitPrice,
        pcsPerPack,
        packTotal: Number((unitPrice * pcsPerPack).toFixed(2)),
        sizeRange,
        stockStatus,
        isFeatured,
        aiStatus: "pending",
        publicTitle: {
          en: tempTitleEn,
          it: `Ingrosso Abbigliamento Turco (${sku})`,
          es: `Mayorista Ropa Turca (${sku})`
        },
        brandTitle: {
          en: tempTitleEn,
          it: tempTitleEn,
          es: tempTitleEn
        },
        description: {
          en: `Direct Istanbul wholesale pack (${pcsPerPack} pcs/pack). Code: ${sku}.`,
          it: `Pacco serie ingrosso da Istanbul (${pcsPerPack} pz). Codice: ${sku}.`,
          es: `Paquete serie al por mayor desde Estambul (${pcsPerPack} uds). Código: ${sku}.`
        },
        searchTags: [sku.toLowerCase(), vendorCode.toLowerCase(), department, subcategory],
        imageUrl: remoteUrl,
        images: [remoteUrl],
        videoUrl: sharedUploadedVideoUrl || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""),
        youtubeId: youtubeId || "",
        createdAtMillis: nowMillis,
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
    }

    renderBatchUploadReport();
  }

  adminState.failedUploadQueue = newFailedQueue;
  adminState.stagedImages = [...newFailedQueue];

  renderStagedImagePreviews();
  renderBatchUploadReport();
  await rebuildAllCatalogShards();
  renderCatalogTable();
  updateDashboardKPIs();
  refreshVendorFilterDropdown();
  updateAiQueueBadge();

  if (batchBtn) {
    batchBtn.disabled = false;
    batchBtn.textContent = "🚀 شروع آپلود دسته‌ای سریع + ارسال به صف هوش مصنوعی";
  }
  if (retryBtn) {
    retryBtn.disabled = false;
  }

  const succCount = adminState.lastUploadReport.successItems.length;
  const failCount = adminState.failedUploadQueue.length;
  const dupCount = adminState.lastUploadReport.duplicateItems.length;

  showAdminToast(`آپلود پایان یافت: ${succCount} موفق | ${dupCount} تکراری | ${failCount} ناموفق`);

  // شروع خودکار ربات هوش مصنوعی در پس‌زمینه اگر کلید جمنای فعال باشد
  if (succCount > 0 && getActiveGeminiKeys().length > 0 && !adminState.aiWorkerRunning) {
    startBackgroundAiWorker();
  }
}

/**
 * ربات تگ‌گذار خودکار در پس‌زمینه (Background AI Queue Worker)
 * محصولات دارای aiStatus === "pending" را یکی‌یکی برمی‌دارد و با جمنای تکمیل می‌کند
 */
function updateAiQueueBadge() {
  const pendingList = adminState.products.filter((p) => p.aiStatus === "pending");
  const badge = document.getElementById("ai-queue-remaining-badge");
  if (badge) {
    badge.textContent = `در صف انتظار AI: ${pendingList.length} محصول`;
  }
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
    showAdminToast("برای تگ‌گذاری خودکار، ابتدا کلید Gemini API را در تب ۶ وارد کنید.");
    return;
  }

  adminState.aiWorkerRunning = true;
  adminState.aiWorkerStopRequested = false;

  const statusLbl = document.getElementById("ai-worker-status-label");
  const startBtn = document.getElementById("btn-start-ai-worker");
  const stopBtn = document.getElementById("btn-stop-ai-worker");

  if (startBtn) startBtn.style.display = "none";
  if (stopBtn) stopBtn.style.display = "inline-flex";

  const validTaxonomyJson = JSON.stringify(
    DEPARTMENTS_TAXONOMY.map((d) => ({
      dept: d.id,
      subcategories: d.subcategories.map((s) => s.id)
    }))
  );

  let processedCount = 0;

  while (!adminState.aiWorkerStopRequested) {
    const nextProd = adminState.products.find((p) => p.aiStatus === "pending");
    if (!nextProd) break;

    updateAiQueueBadge();
    if (statusLbl) {
      statusLbl.textContent = `⏳ در حال آنالیز و تگ‌گذاری ۳ زبانه محصول ${nextProd.sku} در پس‌زمینه...`;
    }

    try {
      const imgData = await fetchImageAsBase64(nextProd.imageUrl);
      const prompt = `
Analyze this wholesale product image (Code: ${nextProd.sku}, Category: ${nextProd.subcategory}).
Generate:
1. "publicTitle" (en, it, es): Luxury B2B wholesale title describing fabric, cut, and style WITHOUT any trademarked brand names (100% Google Ads safe).
2. "brandTitle" (en, it, es): Real brand-inspired title recognizing any visible logo or fashion house style for internal site search.
3. "searchTags": Array of 12 lowercase keywords in English, Italian, Spanish, and Persian (including detected brand name and garment type).
4. "description" (en, it, es): 2-sentence B2B wholesale description highlighting Turkish master quality, pack of ${nextProd.pcsPerPack} pcs, and express shipping from Istanbul.
Taxonomy list: ${validTaxonomyJson}
Return ONLY valid JSON:
{
  "publicTitle": { "en": "...", "it": "...", "es": "..." },
  "brandTitle": { "en": "...", "it": "...", "es": "..." },
  "searchTags": ["..."],
  "description": { "en": "...", "it": "...", "es": "..." }
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

      const mergedTags = Array.from(
        new Set([
          ...(Array.isArray(nextProd.searchTags) ? nextProd.searchTags : []),
          ...(Array.isArray(aiRes.searchTags) ? aiRes.searchTags.map((t) => String(t).toLowerCase()) : [])
        ])
      );

      const updates = {
        publicTitle: aiRes.publicTitle || nextProd.publicTitle,
        brandTitle: aiRes.brandTitle || aiRes.publicTitle || nextProd.brandTitle,
        description: aiRes.description || nextProd.description,
        searchTags: mergedTags,
        aiStatus: "completed",
        updatedAtIso: new Date().toISOString()
      };

      await updateDoc(doc(db, "products", nextProd.id), updates);
      Object.assign(nextProd, updates);
      processedCount++;
      updateAiQueueBadge();
      renderCatalogTable();

      // مکث کوتاه ۲ ثانیه‌ای بین هر درخواست برای جلوگیری از بلاک شدن کلید رایگان
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.warn(`Background AI error on ${nextProd.sku}:`, err.message);
      nextProd.aiStatus = "error";
      await updateDoc(doc(db, "products", nextProd.id), { aiStatus: "error" }).catch(() => {});
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  adminState.aiWorkerRunning = false;
  if (startBtn) startBtn.style.display = "inline-flex";
  if (stopBtn) stopBtn.style.display = "none";
  updateAiQueueBadge();

  if (processedCount > 0) {
    await rebuildAllCatalogShards();
  }

  if (statusLbl) {
    statusLbl.textContent = adminState.aiWorkerStopRequested
      ? `⏸ ربات متوقف شد (${processedCount} محصول تکمیل گردید).`
      : `✅ تمام محصولات صف هوش مصنوعی (${processedCount} مورد) با موفقیت تگ‌گذاری و ۳ زبانه شدند!`;
  }
}

/**
 * آنالیز تکی با هوش مصنوعی جمنای (وقتی ادمین می‌خواهد ۱ محصول را قبل از ذخیره در فرم ببیند)
 */
async function runGeminiVisionProductAnalyzer() {
  const btn = document.getElementById("btn-analyze-gemini-vision");
  const statusEl = document.getElementById("ai-vision-status-text");
  const adminHint = (document.getElementById("ai-vision-hint")?.value || "").trim();

  const validTaxonomyJson = JSON.stringify(
    DEPARTMENTS_TAXONOMY.map((d) => ({
      dept: d.id,
      subcategories: d.subcategories.map((s) => s.id)
    }))
  );

  const parts = [];
  const base64Items = adminState.stagedImages.filter((i) => i.base64Data).slice(0, 3);
  base64Items.forEach((item) => {
    parts.push({
      inlineData: {
        mimeType: item.mimeType || "image/webp",
        data: item.base64Data
      }
    });
  });

  if (parts.length === 0 && !adminHint) {
    showAdminToast("لطفاً ابتدا یک عکس انتخاب کنید یا در کادر راهنما توضیح بنویسید.");
    return;
  }

  const visionPrompt = `
You are the B2B Fashion Catalog Director for "Paradise Wholesale Clothing" (Istanbul, Turkey - https://paradisewholesaler.com).
Analyze the attached image(s) and hint: "${adminHint || "None"}".
Generate:
1. "publicTitle" (en, it, es): Luxury B2B wholesale title WITHOUT mentioning any trademarked luxury brand names (100% Google Ads safe).
2. "brandTitle" (en, it, es): Real brand-inspired model title recognizing any visible logo or brand style for internal search results.
3. "searchTags": Array of 15 lowercase keywords including brand name and garment type in English, Italian, Spanish, AND Persian.
4. "description" (en, it, es): 2-3 sentence B2B wholesale description highlighting Turkish master quality and express shipping from Istanbul.
Choose "dept" and "cat" ONLY from: ${validTaxonomyJson}
Choose "sub" from: ["oversize", "regular", "monogram", "heavyweight", "leather"].
Return ONLY valid JSON:
{
  "dept": "men|women|kids-baby|shoes|bags-accessories",
  "cat": "exact_subcategory_id",
  "sub": "oversize|regular|monogram|heavyweight|leather",
  "suggestedUnitPrice": 15,
  "suggestedPcsPerPack": 6,
  "suggestedSizeRange": "S - M - L - XL - XXL",
  "publicTitle": { "en": "...", "it": "...", "es": "..." },
  "brandTitle": { "en": "...", "it": "...", "es": "..." },
  "searchTags": ["..."],
  "description": { "en": "...", "it": "...", "es": "..." }
}`.trim();

  parts.push({ text: visionPrompt });

  if (btn) {
    btn.disabled = true;
    btn.textContent = "🧠 در حال آنالیز تصویر و ساخت عناوین ۳ زبانه...";
  }
  if (statusEl) statusEl.textContent = "در حال ارتباط با هوش مصنوعی جمنای...";

  try {
    const result = await callGeminiWithRotator([{ role: "user", parts }], true);

    const deptEl = document.getElementById("prod-department");
    if (deptEl && result.dept) {
      deptEl.value = result.dept;
      populateSubcategoryDropdown(result.dept, result.cat);
    }
    const subStyleEl = document.getElementById("prod-substyle");
    if (subStyleEl && result.sub) subStyleEl.value = result.sub;

    if (result.suggestedUnitPrice) document.getElementById("prod-unit-price").value = result.suggestedUnitPrice;
    if (result.suggestedPcsPerPack) document.getElementById("prod-pcs-per-pack").value = result.suggestedPcsPerPack;
    if (result.suggestedSizeRange) document.getElementById("prod-size-range").value = result.suggestedSizeRange;
    updatePackMathDisplay();

    document.getElementById("prod-public-en").value = result.publicTitle?.en || "";
    document.getElementById("prod-public-it").value = result.publicTitle?.it || "";
    document.getElementById("prod-public-es").value = result.publicTitle?.es || "";

    document.getElementById("prod-brand-en").value = result.brandTitle?.en || "";
    document.getElementById("prod-brand-it").value = result.brandTitle?.it || "";
    document.getElementById("prod-brand-es").value = result.brandTitle?.es || "";

    const tagsArr = Array.isArray(result.searchTags) ? result.searchTags : [];
    document.getElementById("prod-search-tags").value = tagsArr.join(", ");

    document.getElementById("prod-desc-en").value = result.description?.en || "";
    document.getElementById("prod-desc-it").value = result.description?.it || "";
    document.getElementById("prod-desc-es").value = result.description?.es || "";

    if (!document.getElementById("prod-doc-id").value) {
      generateAutoSku();
    }

    if (statusEl) statusEl.textContent = "✓ آنالیز تکمیل شد! فیلدها پر شدند.";
    showAdminToast("✨ عناوین دوگانه و تگ‌ها به ۳ زبان پر شدند!");
  } catch (err) {
    if (statusEl) statusEl.textContent = `خطای هوش مصنوعی: ${err.message}`;
    showAdminToast(`خطا: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "🧠 آنالیز تکی عکس با جمنای (۳ زبانه)";
    }
  }
}

/* ==========================================================================
   10. SAVE SINGLE PRODUCT & CHUNKED 100-ITEM SHARD ENGINE (10,000+ PRODUCTS)
   ========================================================================== */
async function handleSaveProductForm(e) {
  e.preventDefault();

  // اگر حالت آپلود دسته‌ای انتخاب شده و بیش از ۱ عکس در لیست است و در حالت ویرایش نیستیم، با موتور دسته‌ای آپلود کن
  const batchMode = document.getElementById("batch-upload-mode")?.value || "batch_separate";
  const existingDocId = document.getElementById("prod-doc-id").value.trim();
  if (!existingDocId && batchMode === "batch_separate" && adminState.stagedImages.length > 1) {
    await executeBatchUploadItems([...adminState.stagedImages], false);
    return;
  }

  const submitBtn = document.getElementById("btn-save-product-submit");
  const vendorCode = getCleanVendorCode();
  const vendorName = (document.getElementById("prod-vendor-name")?.value || "").trim() || vendorCode;
  const sku = document.getElementById("prod-sku").value.trim().toUpperCase() || generateAutoSku();
  const docId = existingDocId || sku;

  const department = document.getElementById("prod-department").value;
  const subcategory = document.getElementById("prod-subcategory").value;
  const subStyle = document.getElementById("prod-substyle").value;
  const unitPrice = parseFloat(document.getElementById("prod-unit-price").value) || 0;
  const pcsPerPack = Math.max(1, parseInt(document.getElementById("prod-pcs-per-pack").value, 10) || 6);
  const sizeRange = document.getElementById("prod-size-range").value.trim() || "S - M - L - XL";
  const stockStatus = document.getElementById("prod-stock-status").value || "in_stock";
  const isFeatured = document.getElementById("prod-is-featured").checked;
  const watermarkEnabled = Boolean(document.getElementById("prod-watermark-toggle")?.checked);

  const youtubeRaw = (document.getElementById("prod-youtube-url")?.value || "").trim();
  const youtubeId = extractYouTubeId(youtubeRaw);
  const videoFile = document.getElementById("prod-video-file")?.files?.[0] || null;

  // بررسی تکراری نبودن عکس در ثبت جدید
  if (!existingDocId && adminState.stagedImages[0]?.fingerprint) {
    const dup = findDuplicateProductByFingerprint(adminState.stagedImages[0].fingerprint);
    if (dup) {
      showAdminToast(`⚠️ این عکس تکراری است و قبلاً با کد ${dup.sku} ثبت شده است!`);
      return;
    }
  }

  const publicTitle = {
    en: document.getElementById("prod-public-en").value.trim() || `Wholesale Garment (${sku})`,
    it: document.getElementById("prod-public-it").value.trim() || document.getElementById("prod-public-en").value.trim(),
    es: document.getElementById("prod-public-es").value.trim() || document.getElementById("prod-public-en").value.trim()
  };

  const brandTitle = {
    en: document.getElementById("prod-brand-en").value.trim() || publicTitle.en,
    it: document.getElementById("prod-brand-it").value.trim() || publicTitle.it,
    es: document.getElementById("prod-brand-es").value.trim() || publicTitle.es
  };

  const description = {
    en: document.getElementById("prod-desc-en").value.trim(),
    it: document.getElementById("prod-desc-it").value.trim(),
    es: document.getElementById("prod-desc-es").value.trim()
  };

  const searchTags = document
    .getElementById("prod-search-tags")
    .value.split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "در حال آپلود رسانه و ذخیره محصول...";
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
          staged = await compressImageToWebP(staged.file, 1200, 0.84, `${sku} | ${pcsPerPack} Pcs`);
        }
        const url = await uploadWebPToFirebaseStorage(staged, department, sku, i);
        uploadedUrls.push(url);
      }
    }

    const manualUrl = document.getElementById("prod-manual-image-url")?.value.trim();
    if (manualUrl && !uploadedUrls.includes(manualUrl)) {
      uploadedUrls.push(manualUrl);
    }

    let finalVideoUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : "";
    if (videoFile) {
      finalVideoUrl = await uploadVideoFileToStorage(videoFile, department, sku);
    }

    const primaryImageUrl =
      uploadedUrls[0] ||
      (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80");

    const nowMillis = Date.now();
    const productPayload = {
      id: docId,
      code: sku,
      sku,
      vendorCode,
      vendorName,
      fileFingerprint: fingerprints[0] || "",
      fileFingerprints: fingerprints,
      department,
      subcategory,
      subStyle,
      unitPrice,
      pcsPerPack,
      packTotal: Number((unitPrice * pcsPerPack).toFixed(2)),
      sizeRange,
      stockStatus,
      isFeatured,
      aiStatus: document.getElementById("prod-brand-en").value.trim() ? "completed" : "pending",
      publicTitle,
      brandTitle,
      description,
      searchTags,
      imageUrl: primaryImageUrl,
      images: uploadedUrls.length > 0 ? uploadedUrls : [primaryImageUrl],
      videoUrl: finalVideoUrl,
      youtubeId: youtubeId || "",
      createdAtMillis: nowMillis,
      updatedAtIso: new Date().toISOString(),
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, "products", docId), productPayload, { merge: true });

    const existingIdx = adminState.products.findIndex((p) => p.id === docId);
    if (existingIdx > -1) {
      adminState.products[existingIdx] = productPayload;
    } else {
      adminState.products.unshift(productPayload);
    }

    await rebuildAllCatalogShards();
    renderCatalogTable();
    updateDashboardKPIs();
    refreshVendorFilterDropdown();
    updateAiQueueBadge();
    resetProductForm();
    showAdminToast(`✓ محصول ${sku} با موفقیت ذخیره و در سایت منتشر شد!`);
  } catch (err) {
    showAdminToast(`خطا در ذخیره محصول: ${err.message}`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "💾 ذخیره محصول و بروزرسانی کاتالوگ";
    }
  }
}

/**
 * معماری شاردهای بسته‌بندی شده ۱۰۰تایی (Chunked Shards)
 * هم با نسخه فعلی core.js سازگار است و هم برای ۱۰,۰۰۰+ محصول به ارور ۱ مگابایت فایربیس نمی‌خورد
 */
async function rebuildAllCatalogShards() {
  try {
    const items = adminState.products.map((p) => ({
      id: p.id || p.sku,
      sku: p.sku || p.code || p.id,
      vendorCode: p.vendorCode || "PRD",
      department: p.department || "men",
      subcategory: p.subcategory || "men-tshirts",
      subStyle: p.subStyle || "regular",
      unitPrice: Number(p.unitPrice) || 0,
      pcsPerPack: Math.max(1, parseInt(p.pcsPerPack, 10) || 6),
      sizeRange: p.sizeRange || "S - M - L - XL",
      stockStatus: p.stockStatus || "in_stock",
      isFeatured: Boolean(p.isFeatured),
      publicTitle: p.publicTitle || { en: "Wholesale Garment" },
      brandTitle: p.brandTitle || p.publicTitle || { en: "Wholesale Garment" },
      searchTags: Array.isArray(p.searchTags) ? p.searchTags : [],
      imageUrl: p.imageUrl || "",
      videoUrl: p.videoUrl || "",
      youtubeId: p.youtubeId || "",
      createdAtMillis: p.createdAtMillis || Date.now()
    }));

    // ۱. شارد جدیدترین محصولات برای صفحه اول (۲۴ محصول آخر)
    await setDoc(doc(db, "catalog_shards", "latest"), {
      updatedAtIso: new Date().toISOString(),
      items: items.slice(0, 24)
    });

    // ۲. شارد اصلی (حداکثر ۲۰۰ محصول اول برای جلوگیری از رد شدن سقف ۱ مگابایت فایربیس) + صفحات ۱۰۰تایی
    const masterTotalPages = Math.max(1, Math.ceil(items.length / SHARD_CHUNK_SIZE));
    await setDoc(doc(db, "catalog_shards", "master_catalog"), {
      updatedAtIso: new Date().toISOString(),
      totalCount: items.length,
      totalPages: masterTotalPages,
      chunkSize: SHARD_CHUNK_SIZE,
      items: items.slice(0, 200)
    });

    // ۳. شارد هر دپارتمان در بسته‌های ۱۰۰تایی (مثلاً men, men_p2, men_p3...)
    for (const deptObj of DEPARTMENTS_TAXONOMY) {
      const deptItems = items.filter((i) => i.department === deptObj.id);
      const totalPages = Math.max(1, Math.ceil(deptItems.length / SHARD_CHUNK_SIZE));

      // صفحه اول در نام اصلی دپارتمان ذخیره می‌شود تا core.js فعلی با ۱ بار خوانش آن را باز کند
      await setDoc(doc(db, "catalog_shards", deptObj.id), {
        department: deptObj.id,
        updatedAtIso: new Date().toISOString(),
        totalCount: deptItems.length,
        totalPages,
        page: 1,
        items: deptItems.slice(0, SHARD_CHUNK_SIZE)
      });

      // صفحات بعدی (برای زمانی که بیش از ۱۰۰ محصول در یک دپارتمان باشد)
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

    const syncStatusEl = document.getElementById("topbar-sync-status");
    if (syncStatusEl) {
      syncStatusEl.textContent = `✓ کاتالوگ سایت همگام‌سازی شد (${items.length} محصول در بسته‌های ۱۰۰تایی) — ساعت ${new Date().toLocaleTimeString("fa-IR")}`;
    }
  } catch (err) {
    showAdminToast(`خطا در همگام‌سازی شاردها: ${err.message}`);
  }
}

function resetProductForm() {
  document.getElementById("admin-product-form")?.reset();
  document.getElementById("prod-doc-id").value = "";
  const ytInput = document.getElementById("prod-youtube-url");
  if (ytInput) ytInput.value = "";
  const vidInput = document.getElementById("prod-video-file");
  if (vidInput) vidInput.value = "";
  document.getElementById("product-form-mode-title").textContent = "مشخصات پک عمده و عناوین دوگانه";
  adminState.stagedImages = [];
  renderStagedImagePreviews();
  populateSubcategoryDropdown("men");
  generateAutoSku();
  updatePackMathDisplay();
}

function bindProductUploaderEvents() {
  const deptSelect = document.getElementById("prod-department");
  if (deptSelect) {
    populateSubcategoryDropdown(deptSelect.value);
    deptSelect.addEventListener("change", (e) => {
      populateSubcategoryDropdown(e.target.value);
      if (!document.getElementById("prod-doc-id").value) {
        generateAutoSku();
      }
    });
  }

  document.getElementById("prod-vendor-code")?.addEventListener("input", () => {
    if (!document.getElementById("prod-doc-id").value) {
      generateAutoSku();
    }
  });

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

  const dropzone = document.getElementById("product-upload-dropzone");
  const fileInput = document.getElementById("product-file-input");

  dropzone?.addEventListener("click", () => fileInput?.click());
  dropzone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone?.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone?.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer?.files) handleFilesSelected(e.dataTransfer.files);
  });
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

  document.getElementById("btn-add-manual-image")?.addEventListener("click", () => {
    const urlInput = document.getElementById("prod-manual-image-url");
    const url = urlInput?.value.trim();
    if (!url) return;
    adminState.stagedImages.push({
      remoteUrl: url,
      dataUrl: url,
      origSize: 0,
      webpSize: 0
    });
    renderStagedImagePreviews();
  });

  // دکمه آپلود دسته‌ای سریع
  document.getElementById("btn-fast-batch-upload")?.addEventListener("click", async () => {
    await executeBatchUploadItems([...adminState.stagedImages], false);
  });

  // دکمه تلاش مجدد برای عکس‌های ناموفق
  document.getElementById("btn-retry-failed-uploads")?.addEventListener("click", async () => {
    if (adminState.failedUploadQueue.length === 0) return;
    await executeBatchUploadItems([...adminState.failedUploadQueue], true);
  });

  // کنترل ربات هوش مصنوعی پس‌زمینه
  document.getElementById("btn-start-ai-worker")?.addEventListener("click", startBackgroundAiWorker);
  document.getElementById("btn-stop-ai-worker")?.addEventListener("click", () => {
    adminState.aiWorkerStopRequested = true;
  });

  document.getElementById("btn-analyze-gemini-vision")?.addEventListener("click", runGeminiVisionProductAnalyzer);
  document.getElementById("btn-reset-product-form")?.addEventListener("click", resetProductForm);
  document.getElementById("admin-product-form")?.addEventListener("submit", handleSaveProductForm);
}

/* ==========================================================================
   11. TAB 3: CATALOG MANAGER, VENDOR FILTER & BULK DELETE BY VENDOR/SUBCAT
   ========================================================================== */
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
    } catch (e) {
      console.warn("Catalog load warning:", e.message);
    }
  }
  refreshVendorFilterDropdown();
  renderCatalogTable();
  updateDashboardKPIs();
  updateAiQueueBadge();
}

function refreshVendorFilterDropdown() {
  const vendorSelect = document.getElementById("catalog-filter-vendor");
  if (!vendorSelect) return;
  const currentVal = vendorSelect.value || "all";

  const vendorMap = new Map();
  adminState.products.forEach((p) => {
    const code = (p.vendorCode || String(p.sku || "").split("-")[0] || "PRD").toUpperCase();
    const name = p.vendorName || code;
    vendorMap.set(code, { code, name, count: (vendorMap.get(code)?.count || 0) + 1 });
  });

  let html = `<option value="all">همه عمده‌فروش‌ها (${adminState.products.length})</option>`;
  vendorMap.forEach((v) => {
    html += `<option value="${escapeHtml(v.code)}" ${v.code === currentVal ? "selected" : ""}>عمده‌فروش: ${escapeHtml(v.code)} - ${escapeHtml(v.name)} (${v.count})</option>`;
  });
  vendorSelect.innerHTML = html;
}

function getFilteredCatalogProducts() {
  const deptFilter = document.getElementById("catalog-filter-dept")?.value || "all";
  const subcatFilter = document.getElementById("catalog-filter-subcat")?.value || "all";
  const vendorFilter = document.getElementById("catalog-filter-vendor")?.value || "all";
  const stockFilter = document.getElementById("catalog-filter-stock")?.value || "all";
  const searchQ = (document.getElementById("catalog-search-input")?.value || "").trim().toLowerCase();

  return adminState.products.filter((p) => {
    if (deptFilter !== "all" && p.department !== deptFilter) return false;
    if (subcatFilter !== "all" && p.subcategory !== subcatFilter) return false;
    const pVendor = (p.vendorCode || String(p.sku || "").split("-")[0] || "PRD").toUpperCase();
    if (vendorFilter !== "all" && pVendor !== vendorFilter) return false;
    if (stockFilter !== "all" && (p.stockStatus || "in_stock") !== stockFilter) return false;
    if (searchQ) {
      const pubEn = p.publicTitle?.en || p.publicTitle || "";
      const brdEn = p.brandTitle?.en || p.brandTitle || "";
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
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:26px; color:var(--text-muted);">محصولی با این فیلتر یافت نشد.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .slice(0, 300) // نمایش ۳۰۰ ردیف اول در جدول برای سرعت بالای مرورگر
    .map((p) => {
      const id = escapeHtml(p.id || p.sku);
      const sku = escapeHtml(p.sku || p.id);
      const vCode = escapeHtml(p.vendorCode || String(p.sku || "").split("-")[0] || "PRD");
      const subcat = escapeHtml(p.subcategory || p.department || "men");
      const pubEn = escapeHtml(typeof p.publicTitle === "object" ? p.publicTitle.en : p.publicTitle || "");
      const brdEn = escapeHtml(typeof p.brandTitle === "object" ? p.brandTitle.en : p.brandTitle || "");
      const unitPrice = Number(p.unitPrice) || 0;
      const pcs = Math.max(1, parseInt(p.pcsPerPack, 10) || 6);
      const packTotal = formatMoney(unitPrice * pcs);
      const stock = p.stockStatus || "in_stock";
      const img = escapeHtml(p.imageUrl || "");
      const hasVideo = Boolean(p.videoUrl || p.youtubeId);
      const aiBadge =
        p.aiStatus === "pending"
          ? `<span style="font-size:0.68rem; background:#fef3c7; color:#92400e; padding:2px 6px; border-radius:4px;">⏳ در صف AI</span>`
          : `<span style="font-size:0.68rem; background:#ecfdf5; color:#065f46; padding:2px 6px; border-radius:4px;">✓ AI</span>`;

      return `
        <tr data-catalog-row="${id}">
          <td>
            <img src="${img}" alt="${sku}" style="width:48px; height:62px; object-fit:cover; border-radius:6px; border:1px solid var(--adm-border);" loading="lazy" />
          </td>
          <td>
            <strong style="color:var(--gold-dark); display:block;">${sku}</strong>
            <span style="font-size:0.72rem; color:var(--text-muted);">عمده‌فروش: <strong>${vCode}</strong> | ${subcat}</span>
            <div style="margin-top:3px;">${aiBadge} ${hasVideo ? `<span style="font-size:0.68rem; background:#dbeafe; color:#1e40af; padding:2px 6px; border-radius:4px;">🎬 ویدیودار</span>` : ""}</div>
          </td>
          <td>
            <div style="font-weight:700; color:var(--charcoal); font-size:0.82rem;">🟢 ${pubEn}</div>
            <div style="font-size:0.74rem; color:var(--gold-dark); font-weight:700; margin-top:2px;">🟡 ${brdEn}</div>
          </td>
          <td>
            <input type="number" step="0.5" class="adm-input" data-inline-price="${id}" value="${unitPrice}" style="width:84px; padding:6px 8px;" />
          </td>
          <td>
            <input type="number" step="1" min="1" class="adm-input" data-inline-pcs="${id}" value="${pcs}" style="width:70px; padding:6px 8px;" />
          </td>
          <td style="font-weight:800; color:var(--charcoal);">${packTotal}</td>
          <td>
            <select class="adm-select" data-inline-stock="${id}" style="width:130px; padding:6px 8px; font-size:0.75rem;">
              <option value="in_stock" ${stock === "in_stock" ? "selected" : ""}>🟢 موجود</option>
              <option value="low_stock" ${stock === "low_stock" ? "selected" : ""}>🟡 رو به اتمام</option>
              <option value="out_of_stock" ${stock === "out_of_stock" ? "selected" : ""}>🔴 ناموجود</option>
            </select>
          </td>
          <td style="text-align:right; white-space:nowrap;">
            <button type="button" class="adm-btn-xs" data-save-inline="${id}" title="ذخیره سریع قیمت و موجودی">💾</button>
            <button type="button" class="adm-btn-xs" data-quick-video="${id}" title="افزودن یا تغییر لینک ویدیوی محصول">🎬 ویدیو</button>
            <button type="button" class="adm-btn-xs" data-edit-full="${id}" title="ویرایش کامل">✏️</button>
            <button type="button" class="adm-btn-xs danger" data-delete-prod="${id}" title="حذف محصول">🗑</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

/**
 * حذف یکجای محصولات بر اساس عمده‌فروش و شاخه انتخاب شده
 */
async function handleBulkDeleteFilteredProducts() {
  const vendorFilter = document.getElementById("catalog-filter-vendor")?.value || "all";
  const subcatFilter = document.getElementById("catalog-filter-subcat")?.value || "all";
  const deptFilter = document.getElementById("catalog-filter-dept")?.value || "all";

  if (vendorFilter === "all" && subcatFilter === "all" && deptFilter === "all") {
    showAdminToast("⚠️ برای ایمنی، ابتدا حداقل یک «عمده‌فروش» یا «شاخه» را از فیلتر بالا انتخاب کنید.");
    return;
  }

  const targets = getFilteredCatalogProducts();
  if (targets.length === 0) {
    showAdminToast("هیچ محصولی در این فیلتر وجود ندارد.");
    return;
  }

  const msg = `آیا مطمئن هستید که می‌خواهید ${targets.length} محصول فیلتر شده (عمده‌فروش: ${vendorFilter} | شاخه: ${subcatFilter}) را به صورت یکجا حذف کنید؟`;
  if (!confirm(msg)) return;

  const delBtn = document.getElementById("btn-bulk-delete-filtered");
  if (delBtn) {
    delBtn.disabled = true;
    delBtn.textContent = `⏳ در حال حذف ${targets.length} محصول...`;
  }

  try {
    const deletedIds = new Set();
    for (const prod of targets) {
      await deleteDoc(doc(db, "products", prod.id));
      deletedIds.add(prod.id);
    }

    adminState.products = adminState.products.filter((p) => !deletedIds.has(p.id));
    await rebuildAllCatalogShards();
    refreshVendorFilterDropdown();
    renderCatalogTable();
    updateDashboardKPIs();
    updateAiQueueBadge();
    showAdminToast(`✓ تعداد ${deletedIds.size} محصول با موفقیت حذف شد و کاتالوگ بروز گردید.`);
  } catch (err) {
    showAdminToast(`خطا در حذف دسته‌جمعی: ${err.message}`);
  } finally {
    if (delBtn) {
      delBtn.disabled = false;
      delBtn.textContent = "🗑️ حذف یکجای محصولات فیلتر شده";
    }
  }
}

function bindCatalogManagerEvents() {
  document.getElementById("catalog-filter-dept")?.addEventListener("change", renderCatalogTable);
  document.getElementById("catalog-filter-subcat")?.addEventListener("change", renderCatalogTable);
  document.getElementById("catalog-filter-vendor")?.addEventListener("change", renderCatalogTable);
  document.getElementById("catalog-filter-stock")?.addEventListener("change", renderCatalogTable);
  document.getElementById("catalog-search-input")?.addEventListener("input", renderCatalogTable);
  document.getElementById("btn-rebuild-all-shards")?.addEventListener("click", rebuildAllCatalogShards);
  document.getElementById("btn-bulk-delete-filtered")?.addEventListener("click", handleBulkDeleteFilteredProducts);

  document.getElementById("admin-catalog-tbody")?.addEventListener("click", async (e) => {
    const target = e.target;

    // ۱. ذخیره سریع قیمت، تعداد پک و موجودی
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
        showAdminToast(`✓ تغییرات محصول ${id} ذخیره شد.`);
      } catch (err) {
        showAdminToast(`خطا: ${err.message}`);
      }
      return;
    }

    // ۲. افزودن یا ویرایش سریع لینک ویدیو / یوتیوب برای هر محصول در هر زمان
    const vidBtn = target.closest("[data-quick-video]");
    if (vidBtn) {
      const id = vidBtn.getAttribute("data-quick-video");
      const prod = adminState.products.find((p) => p.id === id);
      if (!prod) return;

      const currentVid = prod.videoUrl || (prod.youtubeId ? `https://youtu.be/${prod.youtubeId}` : "");
      const inputUrl = prompt(
        `لینک ویدیوی یوتیوب / Shorts یا لینک مستقیم MP4 را برای محصول ${prod.sku} وارد کنید (برای حذف ویدیو خالی بگذارید):`,
        currentVid
      );
      if (inputUrl === null) return;

      const trimmed = inputUrl.trim();
      const ytId = extractYouTubeId(trimmed);
      const videoUrl = trimmed;

      try {
        await updateDoc(doc(db, "products", id), {
          videoUrl,
          youtubeId: ytId || "",
          updatedAtIso: new Date().toISOString()
        });
        prod.videoUrl = videoUrl;
        prod.youtubeId = ytId || "";
        await rebuildAllCatalogShards();
        renderCatalogTable();
        showAdminToast(trimmed ? `🎬 ویدیو به محصول ${prod.sku} اضافه شد!` : `ویدیوی محصول ${prod.sku} حذف شد.`);
      } catch (err) {
        showAdminToast(`خطا در ثبت ویدیو: ${err.message}`);
      }
      return;
    }

    // ۳. بارگذاری محصول در تب ۲ برای ویرایش کامل
    const editBtn = target.closest("[data-edit-full]");
    if (editBtn) {
      const id = editBtn.getAttribute("data-edit-full");
      const prod = adminState.products.find((p) => p.id === id);
      if (!prod) return;

      document.getElementById("prod-doc-id").value = prod.id;
      document.getElementById("prod-department").value = prod.department || "men";
      populateSubcategoryDropdown(prod.department || "men", prod.subcategory);
      document.getElementById("prod-substyle").value = prod.subStyle || "regular";
      document.getElementById("prod-sku").value = prod.sku || prod.id;
      if (document.getElementById("prod-vendor-code")) {
        document.getElementById("prod-vendor-code").value = prod.vendorCode || "PRD";
      }
      if (document.getElementById("prod-vendor-name")) {
        document.getElementById("prod-vendor-name").value = prod.vendorName || "";
      }
      if (document.getElementById("prod-youtube-url")) {
        document.getElementById("prod-youtube-url").value = prod.videoUrl || prod.youtubeId || "";
      }
      document.getElementById("prod-unit-price").value = prod.unitPrice || 15;
      document.getElementById("prod-pcs-per-pack").value = prod.pcsPerPack || 6;
      document.getElementById("prod-size-range").value = prod.sizeRange || "S-XL";
      document.getElementById("prod-stock-status").value = prod.stockStatus || "in_stock";
      document.getElementById("prod-is-featured").checked = Boolean(prod.isFeatured);
      updatePackMathDisplay();

      document.getElementById("prod-public-en").value = prod.publicTitle?.en || "";
      document.getElementById("prod-public-it").value = prod.publicTitle?.it || "";
      document.getElementById("prod-public-es").value = prod.publicTitle?.es || "";

      document.getElementById("prod-brand-en").value = prod.brandTitle?.en || "";
      document.getElementById("prod-brand-it").value = prod.brandTitle?.it || "";
      document.getElementById("prod-brand-es").value = prod.brandTitle?.es || "";

      document.getElementById("prod-search-tags").value = Array.isArray(prod.searchTags) ? prod.searchTags.join(", ") : "";
      document.getElementById("prod-desc-en").value = prod.description?.en || "";
      document.getElementById("prod-desc-it").value = prod.description?.it || "";
      document.getElementById("prod-desc-es").value = prod.description?.es || "";

      adminState.stagedImages = (Array.isArray(prod.images) ? prod.images : [prod.imageUrl]).filter(Boolean).map((u) => ({
        remoteUrl: u,
        dataUrl: u,
        origSize: 0,
        webpSize: 0
      }));
      renderStagedImagePreviews();

      document.getElementById("product-form-mode-title").textContent = `در حال ویرایش محصول: ${prod.sku || prod.id}`;
      document.querySelector('[data-admin-tab="ai-uploader"]')?.click();
      showAdminToast(`محصول ${prod.sku} جهت ویرایش بارگذاری شد.`);
      return;
    }

    // ۴. حذف تکی محصول
    const delBtn = target.closest("[data-delete-prod]");
    if (delBtn) {
      const id = delBtn.getAttribute("data-delete-prod");
      if (!confirm(`آیا محصول ${id} برای همیشه حذف شود؟`)) return;
      try {
        await deleteDoc(doc(db, "products", id));
        adminState.products = adminState.products.filter((p) => p.id !== id);
        await rebuildAllCatalogShards();
        refreshVendorFilterDropdown();
        renderCatalogTable();
        updateDashboardKPIs();
        updateAiQueueBadge();
        showAdminToast(`محصول ${id} حذف شد.`);
      } catch (err) {
        showAdminToast(`خطا در حذف: ${err.message}`);
      }
    }
  });
}

/* ==========================================================================
   12. TAB 4: AI 3-LANGUAGE BLOG STUDIO & GITHUB STATIC SEO PUBLISHER
   ========================================================================== */
async function loadPublishedBlogs() {
  try {
    const q = query(collection(db, "blogs"), orderBy("createdAtIso", "desc"), limit(100));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    adminState.blogs = list;
  } catch (err) {
    try {
      const fallbackSnap = await getDocs(collection(db, "blogs"));
      const list = [];
      fallbackSnap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      adminState.blogs = list;
    } catch (e) {}
  }
  renderPublishedBlogsTable();
  updateDashboardKPIs();
}

function renderPublishedBlogsTable() {
  const tbody = document.getElementById("admin-blogs-tbody");
  if (!tbody) return;

  if (adminState.blogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">هنوز مقاله‌ای منتشر نشده است. موضوع مقاله را در کادر بالا به فارسی بنویسید تا جمنای به ۳ زبان تولید کند.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.blogs
    .map((b) => {
      const id = escapeHtml(b.id);
      const titleEn = escapeHtml(b.title?.en || b.title || "Untitled");
      const titleIt = escapeHtml(b.title?.it || "");
      const slugEn = escapeHtml(b.slugs?.en || b.slug || id);
      const cat = escapeHtml((b.category || "logistics").toUpperCase());
      const dateStr = b.publishedAt || (b.createdAtIso ? b.createdAtIso.slice(0, 10) : "2026");
      const cover = escapeHtml(b.coverImage || "");

      return `
        <tr>
          <td>
            <img src="${cover}" alt="${titleEn}" style="width:64px; height:40px; object-fit:cover; border-radius:4px;" loading="lazy" />
          </td>
          <td>
            <strong style="color:var(--charcoal); display:block;">🇬🇧 ${titleEn}</strong>
            <span style="font-size:0.74rem; color:var(--text-muted);">🇮🇹 ${titleIt}</span>
          </td>
          <td style="font-size:0.75rem; font-family:monospace;">
            <a href="blog.html?slug=${encodeURIComponent(slugEn)}" target="_blank" style="color:var(--gold-dark); font-weight:700;">/en/blog/${slugEn}/ ↗</a>
          </td>
          <td><span class="top-bar-badge">${cat}</span></td>
          <td>${escapeHtml(dateStr)}</td>
          <td style="text-align:right; white-space:nowrap;">
            <button type="button" class="adm-btn-xs" data-edit-blog="${id}">✏️ ویرایش</button>
            <button type="button" class="adm-btn-xs danger" data-delete-blog="${id}">🗑 حذف</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function generate3LanguageBlogWithGemini() {
  const promptInput = document.getElementById("blog-ai-prompt")?.value.trim();
  if (!promptInput) {
    showAdminToast("لطفاً ابتدا موضوع مقاله را به فارسی یا انگلیسی وارد کنید.");
    return;
  }

  const category = document.getElementById("blog-category-select")?.value || "logistics";
  const selectedDepts = Array.from(document.querySelectorAll(".blog-silo-dept:checked")).map((cb) => cb.value);
  const siloLinksText = selectedDepts.map((d) => `${SITE_DOMAIN}/category.html?dept=${d}`).join(", ");

  const btn = document.getElementById("btn-generate-3lang-blog");
  const statusEl = document.getElementById("blog-ai-status");

  if (btn) {
    btn.disabled = true;
    btn.textContent = "🤖 جمنای در حال نگارش مقاله به انگلیسی، ایتالیایی و اسپانیایی...";
  }
  if (statusEl) statusEl.textContent = "در حال تولید متن کامل HTML و سوالات متداول سئو...";

  const blogPrompt = `
You are the Chief B2B SEO Content Strategist for "Paradise Wholesale Clothing" (${SITE_DOMAIN}, Istanbul Merter).
Write an authoritative, high-converting B2B wholesale article based on this topic:
"${promptInput}"
Category: ${category}
Naturally include clickable HTML internal silo links (<a href="...">...</a>) to: ${siloLinksText || `${SITE_DOMAIN}/category.html`}.
Highlight direct Istanbul factory supply, flexible MOQ from 1 pack (best rate at 25+ pcs), and 3-5 day express air cargo to Europe & USA. Do NOT mention copyrighted luxury brand names.
Return ONLY valid JSON with native English ("en"), Italian ("it"), and Spanish ("es") versions:
{
  "readingMinutes": 5,
  "en": { "title": "...", "slug": "...", "metaTitle": "...", "metaDescription": "...", "htmlContent": "<h2>...</h2><p>...</p>", "faq": [{ "question": "...", "answer": "..." }] },
  "it": { "title": "...", "slug": "...", "metaTitle": "...", "metaDescription": "...", "htmlContent": "<h2>...</h2><p>...</p>", "faq": [{ "question": "...", "answer": "..." }] },
  "es": { "title": "...", "slug": "...", "metaTitle": "...", "metaDescription": "...", "htmlContent": "<h2>...</h2><p>...</p>", "faq": [{ "question": "...", "answer": "..." }] }
}`.trim();

  try {
    const data = await callGeminiWithRotator([{ role: "user", parts: [{ text: blogPrompt }] }], true);

    ["en", "it", "es"].forEach((lang) => {
      const block = data[lang] || {};
      document.getElementById(`blog-title-${lang}`).value = block.title || "";
      document.getElementById(`blog-slug-${lang}`).value = slugify(block.slug || block.title, `wholesale-guide-${lang}`);
      document.getElementById(`blog-meta-title-${lang}`).value = block.metaTitle || block.title || "";
      document.getElementById(`blog-meta-desc-${lang}`).value = block.metaDescription || "";
      document.getElementById(`blog-html-${lang}`).value = block.htmlContent || "";
      document.getElementById(`blog-faq-${lang}`).value = JSON.stringify(block.faq || [], null, 2);
    });

    if (statusEl) statusEl.textContent = "✓ مقاله ۳ زبانه آماده شد! اکنون دکمه انتشار را بزنید.";
    showAdminToast("✨ مقاله سئو شده به ۳ زبان تولید شد!");
  } catch (err) {
    if (statusEl) statusEl.textContent = `خطا: ${err.message}`;
    showAdminToast(`خطا در تولید مقاله: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "✨ تولید خودکار مقاله ۳ زبانه با جمنای";
    }
  }
}

function buildStaticBlogHtmlPage(articlePayload, lang) {
  const title = articlePayload.title[lang] || articlePayload.title.en;
  const metaTitle = articlePayload.metaTitle[lang] || `${title} | Paradise Wholesale Istanbul`;
  const metaDesc = articlePayload.metaDescription[lang] || articlePayload.excerpt[lang] || "";
  const htmlContent = articlePayload.content[lang] || articlePayload.content.en;
  const faqs = (articlePayload.faqsByLang && articlePayload.faqsByLang[lang]) || [];
  const cover = articlePayload.coverImage;

  const slugEn = articlePayload.slugs.en;
  const slugIt = articlePayload.slugs.it;
  const slugEs = articlePayload.slugs.es;
  const currentSlug = articlePayload.slugs[lang];

  const urlEn = `${SITE_DOMAIN}/en/blog/${slugEn}/`;
  const urlIt = `${SITE_DOMAIN}/it/blog/${slugIt}/`;
  const urlEs = `${SITE_DOMAIN}/es/blog/${slugEs}/`;
  const canonicalUrl = `${SITE_DOMAIN}/${lang}/blog/${currentSlug}/`;

  const schemaGraph = [
    {
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#post`,
      mainEntityOfPage: canonicalUrl,
      headline: title,
      description: metaDesc,
      image: [cover],
      datePublished: articlePayload.createdAtIso,
      dateModified: articlePayload.updatedAtIso,
      inLanguage: lang,
      author: { "@type": "Organization", name: "Paradise Wholesale Clothing Istanbul", url: `${SITE_DOMAIN}/` },
      publisher: { "@type": "Organization", name: "Paradise Wholesale Clothing", url: `${SITE_DOMAIN}/` }
    }
  ];

  if (faqs.length > 0) {
    schemaGraph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer }
      }))
    });
  }

  const faqHtml =
    faqs.length > 0
      ? `<section style="margin-top:32px;">
          <h2 style="font-family:'Playfair Display',serif; font-size:1.45rem; margin-bottom:14px;">FAQ</h2>
          <div class="faq-list">
            ${faqs
              .map(
                (f, idx) => `
              <details class="faq-item" ${idx === 0 ? "open" : ""}>
                <summary class="faq-question"><span>${escapeHtml(f.question)}</span><span class="faq-icon">▼</span></summary>
                <div class="faq-answer">${escapeHtml(f.answer)}</div>
              </details>`
              )
              .join("")}
          </div>
        </section>`
      : "";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(metaTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDesc)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="alternate" hreflang="en" href="${urlEn}" />
  <link rel="alternate" hreflang="it" href="${urlIt}" />
  <link rel="alternate" hreflang="es" href="${urlEs}" />
  <link rel="alternate" hreflang="x-default" href="${urlEn}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(metaTitle)}" />
  <meta property="og:description" content="${escapeHtml(metaDesc)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${escapeHtml(cover)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/style.css" />
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": schemaGraph })}</script>
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="/index.html" class="brand-logo">
        <span class="brand-logo-main">PARADISE <span class="brand-logo-dot"></span></span>
        <span class="brand-logo-sub">Turkey Wholesale • Istanbul</span>
      </a>
      <nav class="main-nav">
        <a href="/index.html">Home</a>
        <a href="/category.html">Full Catalog</a>
        <a href="/blog.html" class="active">B2B Blog</a>
      </nav>
      <div class="header-actions">
        <a href="${urlEn}" class="lang-btn ${lang === "en" ? "active" : ""}">EN</a>
        <a href="${urlIt}" class="lang-btn ${lang === "it" ? "active" : ""}">IT</a>
        <a href="${urlEs}" class="lang-btn ${lang === "es" ? "active" : ""}">ES</a>
      </div>
    </div>
  </header>
  <main class="section-block">
    <div class="container" style="max-width:920px;">
      <article style="background:#fff; padding:36px; border-radius:20px; border:1px solid var(--border-color);">
        <h1 class="section-title" style="margin-bottom:18px;">${escapeHtml(title)}</h1>
        <img src="${escapeHtml(cover)}" alt="${escapeHtml(title)}" style="width:100%; border-radius:14px; margin-bottom:24px; aspect-ratio:16/9; object-fit:cover;" />
        <div class="article-prose" style="line-height:1.85;">${htmlContent}</div>
        ${faqHtml}
      </article>
    </div>
  </main>
  <script type="module" src="/core.js"></script>
</body>
</html>`;
}

async function commitFileToGitHub(filePath, contentString, commitMessage) {
  const token = (document.getElementById("cfg-github-token")?.value || adminState.adminSecrets.githubToken || "").trim();
  const repo = (document.getElementById("cfg-github-repo")?.value || adminState.adminSecrets.githubRepo || "").trim();
  const branch = (document.getElementById("cfg-github-branch")?.value || adminState.adminSecrets.githubBranch || "main").trim();

  if (!token || !repo) {
    throw new Error("توکن یا نام ریپازیتوری گیت‌هاب در تب ۶ وارد نشده است.");
  }

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

  const bodyPayload = {
    message: commitMessage,
    content: utf8ToBase64(contentString),
    branch
  };
  if (existingSha) bodyPayload.sha = existingSha;

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify(bodyPayload)
  });

  if (!putRes.ok) {
    const errJson = await putRes.json().catch(() => ({}));
    throw new Error(errJson.message || `GitHub API HTTP ${putRes.status} on ${cleanPath}`);
  }
  return await putRes.json();
}

async function handlePublishBlogAndGitHub(e) {
  e.preventDefault();
  const btn = document.getElementById("btn-publish-blog-github");

  const title = {
    en: document.getElementById("blog-title-en").value.trim(),
    it: document.getElementById("blog-title-it").value.trim() || document.getElementById("blog-title-en").value.trim(),
    es: document.getElementById("blog-title-es").value.trim() || document.getElementById("blog-title-en").value.trim()
  };

  const slugs = {
    en: slugify(document.getElementById("blog-slug-en").value.trim() || title.en, "wholesale-guide-en"),
    it: slugify(document.getElementById("blog-slug-it").value.trim() || title.it, "guida-ingrosso-it"),
    es: slugify(document.getElementById("blog-slug-es").value.trim() || title.es, "guia-mayorista-es")
  };

  const metaTitle = {
    en: document.getElementById("blog-meta-title-en").value.trim() || title.en,
    it: document.getElementById("blog-meta-title-it").value.trim() || title.it,
    es: document.getElementById("blog-meta-title-es").value.trim() || title.es
  };

  const metaDescription = {
    en: document.getElementById("blog-meta-desc-en").value.trim(),
    it: document.getElementById("blog-meta-desc-it").value.trim() || document.getElementById("blog-meta-desc-en").value.trim(),
    es: document.getElementById("blog-meta-desc-es").value.trim() || document.getElementById("blog-meta-desc-en").value.trim()
  };

  const content = {
    en: document.getElementById("blog-html-en").value.trim(),
    it: document.getElementById("blog-html-it").value.trim() || document.getElementById("blog-html-en").value.trim(),
    es: document.getElementById("blog-html-es").value.trim() || document.getElementById("blog-html-en").value.trim()
  };

  const parseFaqSafe = (id) => {
    try {
      const v = document.getElementById(id)?.value.trim();
      return v ? JSON.parse(v) : [];
    } catch (e) {
      return [];
    }
  };

  const faqsByLang = {
    en: parseFaqSafe("blog-faq-en"),
    it: parseFaqSafe("blog-faq-it"),
    es: parseFaqSafe("blog-faq-es")
  };

  const docId = document.getElementById("blog-doc-id").value.trim() || slugs.en;
  const nowIso = new Date().toISOString();

  const articlePayload = {
    id: docId,
    slug: slugs.en,
    slugs,
    category: document.getElementById("blog-category-select")?.value || "logistics",
    coverImage:
      document.getElementById("blog-cover-url")?.value.trim() ||
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85",
    title,
    metaTitle,
    metaDescription,
    excerpt: metaDescription,
    content,
    faqsByLang,
    readingTime: "5 min read",
    publishedAt: nowIso.slice(0, 10),
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    createdAt: serverTimestamp()
  };

  if (btn) {
    btn.disabled = true;
    btn.textContent = "در حال انتشار در دیتابیس و گیت‌هاب...";
  }

  try {
    await setDoc(doc(db, "blogs", docId), articlePayload, { merge: true });

    const existingIdx = adminState.blogs.findIndex((b) => b.id === docId);
    if (existingIdx > -1) {
      adminState.blogs[existingIdx] = articlePayload;
    } else {
      adminState.blogs.unshift(articlePayload);
    }

    await syncBlogIndexDocument();

    const ghToken = (document.getElementById("cfg-github-token")?.value || adminState.adminSecrets.githubToken || "").trim();
    const ghRepo = (document.getElementById("cfg-github-repo")?.value || adminState.adminSecrets.githubRepo || "").trim();

    if (ghToken && ghRepo) {
      for (const lang of ["en", "it", "es"]) {
        const htmlPage = buildStaticBlogHtmlPage(articlePayload, lang);
        const targetPath = `${lang}/blog/${slugs[lang]}/index.html`;
        await commitFileToGitHub(targetPath, htmlPage, `SEO Static Blog [${lang.toUpperCase()}]: ${title[lang]}`);
      }
      await buildAndPushSitemapAndRobots();
      showAdminToast("🚀 مقاله در فایربیس ذخیره شد و ۳ صفحه HTML مجزا در گیت‌هاب ساخته شد!");
    } else {
      showAdminToast("✓ مقاله با موفقیت در دیتابیس منتشر شد!");
    }

    renderPublishedBlogsTable();
    updateDashboardKPIs();
  } catch (err) {
    showAdminToast(`خطا در انتشار مقاله: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "🌍 انتشار مقاله در سایت و ساخت صفحات سئو در گیت‌هاب";
    }
  }
}

async function syncBlogIndexDocument() {
  const summaries = adminState.blogs.map((b) => ({
    id: b.id,
    slug: b.slug || b.id,
    slugs: b.slugs || { en: b.slug || b.id, it: b.slug || b.id, es: b.slug || b.id },
    category: b.category || "logistics",
    coverImage: b.coverImage || "",
    title: b.title,
    excerpt: b.excerpt || b.metaDescription,
    publishedAt: b.publishedAt || "2026",
    readingTime: b.readingTime || "5 min read",
    createdAtIso: b.createdAtIso || new Date().toISOString()
  }));

  await setDoc(doc(db, "settings", "blog_index"), {
    updatedAtIso: new Date().toISOString(),
    articles: summaries
  });
}

async function buildAndPushSitemapAndRobots() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_DOMAIN}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${SITE_DOMAIN}/category.html`, priority: "0.9", changefreq: "daily" },
    { loc: `${SITE_DOMAIN}/blog.html`, priority: "0.8", changefreq: "daily" }
  ];

  DEPARTMENTS_TAXONOMY.forEach((dept) => {
    urls.push({ loc: `${SITE_DOMAIN}/category.html?dept=${dept.id}`, priority: "0.85", changefreq: "daily" });
    dept.subcategories.forEach((sc) => {
      urls.push({ loc: `${SITE_DOMAIN}/category.html?dept=${dept.id}&cat=${sc.id}`, priority: "0.75", changefreq: "weekly" });
    });
  });

  adminState.blogs.forEach((b) => {
    const sEn = b.slugs?.en || b.slug || b.id;
    const sIt = b.slugs?.it || sEn;
    const sEs = b.slugs?.es || sEn;
    urls.push({ loc: `${SITE_DOMAIN}/en/blog/${encodeURIComponent(sEn)}/`, priority: "0.8", changefreq: "weekly" });
    urls.push({ loc: `${SITE_DOMAIN}/it/blog/${encodeURIComponent(sIt)}/`, priority: "0.8", changefreq: "weekly" });
    urls.push({ loc: `${SITE_DOMAIN}/es/blog/${encodeURIComponent(sEs)}/`, priority: "0.8", changefreq: "weekly" });
  });

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /order.html
Disallow: /*?q=*
Disallow: /*&q=*

Sitemap: ${SITE_DOMAIN}/sitemap.xml
`;

  await commitFileToGitHub("sitemap.xml", sitemapXml, "Automated Technical SEO Sitemap Sync");
  await commitFileToGitHub("robots.txt", robotsTxt, "Automated Technical SEO robots.txt Sync");
}

function bindBlogStudioEvents() {
  document.getElementById("blog-editor-lang-tabs")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-editor-lang]");
    if (!btn) return;
    const lang = btn.getAttribute("data-editor-lang");
    document.querySelectorAll("#blog-editor-lang-tabs .cat-pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".lang-editor-pane").forEach((pane) => {
      pane.classList.toggle("active", pane.id === `blog-pane-${lang}`);
    });
  });

  document.getElementById("btn-generate-3lang-blog")?.addEventListener("click", generate3LanguageBlogWithGemini);
  document.getElementById("admin-blog-publish-form")?.addEventListener("submit", handlePublishBlogAndGitHub);

  document.getElementById("btn-reset-blog-form")?.addEventListener("click", () => {
    document.getElementById("admin-blog-publish-form")?.reset();
    document.getElementById("blog-doc-id").value = "";
  });

  document.getElementById("admin-blogs-tbody")?.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit-blog]");
    if (editBtn) {
      const id = editBtn.getAttribute("data-edit-blog");
      const art = adminState.blogs.find((b) => b.id === id);
      if (!art) return;

      document.getElementById("blog-doc-id").value = art.id;
      document.getElementById("blog-category-select").value = art.category || "logistics";
      document.getElementById("blog-cover-url").value = art.coverImage || "";

      ["en", "it", "es"].forEach((lang) => {
        document.getElementById(`blog-title-${lang}`).value = art.title?.[lang] || "";
        document.getElementById(`blog-slug-${lang}`).value = art.slugs?.[lang] || art.slug || "";
        document.getElementById(`blog-meta-title-${lang}`).value = art.metaTitle?.[lang] || "";
        document.getElementById(`blog-meta-desc-${lang}`).value = art.metaDescription?.[lang] || "";
        document.getElementById(`blog-html-${lang}`).value = art.content?.[lang] || "";
        document.getElementById(`blog-faq-${lang}`).value = JSON.stringify(art.faqsByLang?.[lang] || [], null, 2);
      });
      showAdminToast(`مقاله جهت ویرایش بارگذاری شد.`);
      return;
    }

    const delBtn = e.target.closest("[data-delete-blog]");
    if (delBtn) {
      const id = delBtn.getAttribute("data-delete-blog");
      if (!confirm(`آیا مقاله ${id} حذف شود؟`)) return;
      try {
        await deleteDoc(doc(db, "blogs", id));
        adminState.blogs = adminState.blogs.filter((b) => b.id !== id);
        await syncBlogIndexDocument();
        renderPublishedBlogsTable();
        updateDashboardKPIs();
        showAdminToast("مقاله حذف شد.");
      } catch (err) {
        showAdminToast(`خطا: ${err.message}`);
      }
    }
  });
}

/* ==========================================================================
   13. TAB 5: VIDEOS & MEDIA MANAGER (HERO, CARGO REVIEWS & SHOWROOM VIDEOS)
   ========================================================================== */
function renderCargoVideosTable() {
  const tbody = document.getElementById("admin-cargo-videos-tbody");
  if (!tbody) return;

  const list = Array.isArray(adminState.publicConfig.cargoVideos) ? adminState.publicConfig.cargoVideos : [];
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">هنوز ویدیوی ارسال بار و رضایت مشتری اضافه نشده است.</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map((v, idx) => {
      const ytId = escapeHtml(v.ytId || "");
      const thumb = escapeHtml(v.thumb || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`);
      return `
        <tr>
          <td><img src="${thumb}" alt="Video" style="width:54px; height:72px; object-fit:cover; border-radius:6px;" /></td>
          <td><span class="top-bar-badge">${escapeHtml(v.badge || "CARGO")}</span></td>
          <td><strong>${escapeHtml(v.title || "")}</strong></td>
          <td><code>${ytId}</code></td>
          <td style="text-align:right;">
            <button type="button" class="adm-btn-xs danger" data-remove-cargo-vid="${idx}">🗑 حذف</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderShowroomVideosTable() {
  const tbody = document.getElementById("admin-showroom-videos-tbody");
  if (!tbody) return;

  const list = Array.isArray(adminState.publicConfig.showroomVideos) ? adminState.publicConfig.showroomVideos : [];
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">هنوز ویدیویی در ویترین نمایش محصولات ثبت نشده است.</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map((v, idx) => {
      const ytId = escapeHtml(v.ytId || "");
      const thumb = escapeHtml(v.thumb || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : ""));
      return `
        <tr>
          <td>${thumb ? `<img src="${thumb}" alt="Showroom" style="width:54px; height:72px; object-fit:cover; border-radius:6px;" />` : "🎬"}</td>
          <td><strong>${escapeHtml(v.title || "")}</strong></td>
          <td><span class="top-bar-badge">${escapeHtml(v.dept || "all")}</span></td>
          <td><code>${escapeHtml(v.ytId || v.url || "")}</code></td>
          <td style="text-align:right;">
            <button type="button" class="adm-btn-xs danger" data-remove-showroom-vid="${idx}">🗑 حذف</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function bindVideosManagerEvents() {
  document.getElementById("admin-hero-video-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rawUrl = document.getElementById("hero-yt-url").value.trim();
    const ytId = extractYouTubeId(rawUrl);
    const poster = document.getElementById("hero-yt-poster").value.trim() || `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`;
    const title = document.getElementById("hero-yt-title").value.trim() || "Istanbul Warehouse & Live Order Packing";

    adminState.publicConfig.heroVideo = { ytId, poster, title };
    try {
      await setDoc(doc(db, "settings", "public_config"), { heroVideo: adminState.publicConfig.heroVideo }, { merge: true });
      showAdminToast("✓ ویدیوی اصلی صفحه اول ذخیره شد!");
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    }
  });

  document.getElementById("admin-add-cargo-video-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rawUrl = document.getElementById("cargo-vid-url").value.trim();
    const ytId = extractYouTubeId(rawUrl);
    const badge = document.getElementById("cargo-vid-badge").value.trim();
    const title = document.getElementById("cargo-vid-title").value.trim();
    const thumb = document.getElementById("cargo-vid-thumb").value.trim() || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;

    if (!Array.isArray(adminState.publicConfig.cargoVideos)) {
      adminState.publicConfig.cargoVideos = [];
    }
    adminState.publicConfig.cargoVideos.unshift({ ytId, badge, title, thumb });

    try {
      await setDoc(doc(db, "settings", "public_config"), { cargoVideos: adminState.publicConfig.cargoVideos }, { merge: true });
      renderCargoVideosTable();
      e.target.reset();
      showAdminToast("✓ ویدیوی رضایت مشتری و ارسال بار اضافه شد!");
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    }
  });

  document.getElementById("admin-cargo-videos-tbody")?.addEventListener("click", async (e) => {
    const rmBtn = e.target.closest("[data-remove-cargo-vid]");
    if (!rmBtn) return;
    const idx = parseInt(rmBtn.getAttribute("data-remove-cargo-vid"), 10);
    adminState.publicConfig.cargoVideos.splice(idx, 1);
    try {
      await setDoc(doc(db, "settings", "public_config"), { cargoVideos: adminState.publicConfig.cargoVideos }, { merge: true });
      renderCargoVideosTable();
      showAdminToast("ویدیو حذف شد.");
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    }
  });

  // رویدادهای بخش جدید ویترین ویدیوهای نمایش محصولات
  document.getElementById("admin-add-showroom-video-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rawUrl = document.getElementById("showroom-vid-url").value.trim();
    const ytId = extractYouTubeId(rawUrl);
    const title = document.getElementById("showroom-vid-title").value.trim();
    const dept = document.getElementById("showroom-vid-dept").value || "all";
    const thumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "";

    if (!Array.isArray(adminState.publicConfig.showroomVideos)) {
      adminState.publicConfig.showroomVideos = [];
    }
    adminState.publicConfig.showroomVideos.unshift({ url: rawUrl, ytId, title, dept, thumb });

    try {
      await setDoc(doc(db, "settings", "public_config"), { showroomVideos: adminState.publicConfig.showroomVideos }, { merge: true });
      renderShowroomVideosTable();
      e.target.reset();
      showAdminToast("✓ ویدیو به ویترین نمایش سایت اضافه شد!");
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    }
  });

  document.getElementById("admin-showroom-videos-tbody")?.addEventListener("click", async (e) => {
    const rmBtn = e.target.closest("[data-remove-showroom-vid]");
    if (!rmBtn) return;
    const idx = parseInt(rmBtn.getAttribute("data-remove-showroom-vid"), 10);
    adminState.publicConfig.showroomVideos.splice(idx, 1);
    try {
      await setDoc(doc(db, "settings", "public_config"), { showroomVideos: adminState.publicConfig.showroomVideos }, { merge: true });
      renderShowroomVideosTable();
      showAdminToast("ویدیوی ویترین حذف شد.");
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    }
  });
}

/* ==========================================================================
   14. TAB 6: GLOBAL LIVE SETTINGS, GOOGLE ADS, GEMINI ROTATOR & GITHUB
   ========================================================================== */
async function loadSettingsFromFirestore() {
  try {
    const pubSnap = await getDoc(doc(db, "settings", "public_config"));
    if (pubSnap.exists()) {
      adminState.publicConfig = { ...adminState.publicConfig, ...pubSnap.data() };
    }
  } catch (e) {}

  try {
    const secSnap = await getDoc(doc(db, "settings", "admin_secrets"));
    if (secSnap.exists()) {
      adminState.adminSecrets = { ...adminState.adminSecrets, ...secSnap.data() };
    } else {
      const altSnap = await getDoc(doc(db, "settings", "private_keys"));
      if (altSnap.exists()) {
        adminState.adminSecrets = { ...adminState.adminSecrets, ...altSnap.data() };
      }
    }
  } catch (e) {}

  populateSettingsFormUI();
  renderCargoVideosTable();
  renderShowroomVideosTable();
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
  setVal("cfg-currency-symbol", pub.currencySymbol || "€");
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
  if (badge) badge.textContent = `${keysArr.length} کلید ثبت شده`;
}

async function handleSaveGlobalSettings(e) {
  e.preventDefault();
  const btn = document.getElementById("btn-save-global-settings");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "در حال ذخیره تنظیمات در دیتابیس...";
  }

  const currencySymbol = document.getElementById("cfg-currency-symbol").value || "€";
  const currencyCodeMap = { "€": "EUR", $: "USD", "£": "GBP" };

  const updatedPublic = {
    ...adminState.publicConfig,
    whatsappRaw: document.getElementById("cfg-whatsapp-raw").value.trim() || DEFAULT_WHATSAPP,
    whatsappDisplay: document.getElementById("cfg-whatsapp-display").value.trim() || "+90 545 909 93 95",
    currencySymbol,
    currencyCode: currencyCodeMap[currencySymbol] || "EUR",
    bestRateThreshold: Math.max(1, parseInt(document.getElementById("cfg-bulk-threshold").value, 10) || 25),
    ga4MeasurementId: document.getElementById("cfg-ga4-id").value.trim(),
    googleAdsId: document.getElementById("cfg-gads-id").value.trim(),
    googleAdsConversionLabel: document.getElementById("cfg-gads-label").value.trim(),
    googleSiteVerification: document.getElementById("cfg-gsc-verify").value.trim(),
    instagramUrl: document.getElementById("cfg-instagram-url").value.trim(),
    telegramUrl: document.getElementById("cfg-telegram-url").value.trim(),
    tiktokUrl: document.getElementById("cfg-tiktok-url").value.trim(),
    androidAppUrl: document.getElementById("cfg-android-app-url").value.trim(),
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
    await setDoc(doc(db, "settings", "private_keys"), updatedSecrets, { merge: true });

    adminState.publicConfig = updatedPublic;
    adminState.adminSecrets = updatedSecrets;

    try {
      localStorage.setItem("paradise_public_config_v1", JSON.stringify(updatedPublic));
    } catch (e) {}

    populateSettingsFormUI();
    updateDashboardKPIs();
    showAdminToast("✓ تمام تنظیمات واتساپ، گوگل ادز و کلیدهای جمنای با موفقیت ذخیره شد!");
  } catch (err) {
    showAdminToast(`خطا در ذخیره تنظیمات: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "💾 ذخیره تمام تنظیمات در دیتابیس";
    }
  }
}

async function testAllGeminiKeysHealth() {
  const keys = getActiveGeminiKeys();
  const logBox = document.getElementById("gemini-diagnostic-log");
  if (!logBox) return;

  logBox.style.display = "block";
  if (keys.length === 0) {
    logBox.textContent = "❌ هیچ کلیدی در کادر بالا وارد نشده است.";
    return;
  }

  logBox.textContent = `🩺 در حال تست سلامت ${keys.length} کلید Gemini API...\n`;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const masked = `${key.slice(0, 8)}...${key.slice(-4)}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;
    try {
      const start = performance.now();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Reply with OK" }] }]
        })
      });
      const ms = Math.round(performance.now() - start);
      if (res.ok) {
        logBox.textContent += `✅ کلید شماره ${i + 1} (${masked}): سالم و فعال (${ms} ms)\n`;
      } else {
        logBox.textContent += `⚠️ کلید شماره ${i + 1} (${masked}): خطای HTTP ${res.status}\n`;
      }
    } catch (err) {
      logBox.textContent += `❌ کلید شماره ${i + 1} (${masked}): ${err.message}\n`;
    }
  }
}

async function testGitHubConnection() {
  const token = document.getElementById("cfg-github-token")?.value.trim();
  const repo = document.getElementById("cfg-github-repo")?.value.trim();
  if (!token || !repo) {
    showAdminToast("لطفاً ابتدا توکن و نام ریپازیتوری (مثلاً raminparadise800/paradise-wholesale) را وارد کنید.");
    return;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    showAdminToast(`✓ اتصال به گیت‌هاب برقرار شد: ${data.full_name}`);
  } catch (err) {
    showAdminToast(`خطا در اتصال به گیت‌هاب: ${err.message}`);
  }
}

function bindSettingsEvents() {
  document.getElementById("admin-global-settings-form")?.addEventListener("submit", handleSaveGlobalSettings);
  document.getElementById("btn-test-gemini-keys")?.addEventListener("click", testAllGeminiKeysHealth);
  document.getElementById("btn-test-github-conn")?.addEventListener("click", testGitHubConnection);

  document.getElementById("cfg-gemini-keys")?.addEventListener("input", () => {
    const keys = getActiveGeminiKeys();
    const badge = document.getElementById("gemini-key-count-badge");
    if (badge) badge.textContent = `${keys.length} کلید ثبت شده`;
  });

  document.getElementById("btn-push-sitemap-robots")?.addEventListener("click", async () => {
    try {
      showAdminToast("در حال ساخت و ارسال sitemap.xml و robots.txt به گیت‌هاب...");
      await buildAndPushSitemapAndRobots();
      showAdminToast("✓ فایل‌های sitemap.xml و robots.txt با موفقیت روی گیت‌هاب ساخته شدند!");
    } catch (err) {
      showAdminToast(`خطا: ${err.message}`);
    }
  });
}

/* ==========================================================================
   15. INITIALIZE EXECUTIVE ADMIN SUITE
   ========================================================================== */
function initAdminSuite() {
  injectPersianAndSmartFeaturesUI();
  bindAuthEvents();
  bindNavigationEvents();
  bindOrdersAndCrmEvents();
  bindProductUploaderEvents();
  bindCatalogManagerEvents();
  bindBlogStudioEvents();
  bindVideosManagerEvents();
  bindSettingsEvents();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminSuite);
} else {
  initAdminSuite();
}
