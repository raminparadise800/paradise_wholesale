/**
 * ============================================================================
 * PARADISE WHOLESALE CLOTHING (Paradise Turkey Wholesale)
 * Domain: https://paradisewholesaler.com
 * File: admin.js — Executive B2B Admin Engine, Gemini Vision Dual-Title AI,
 *                  WebP Storage Uploader, 1-Read Shard Sync & GitHub SEO Publisher
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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* 5-Department Taxonomy (100% synced with core.js & category.html) */
export const DEPARTMENTS_TAXONOMY = [
  {
    id: "men",
    label: "Men",
    subcategories: [
      { id: "men-tshirts", label: "T-Shirts" },
      { id: "men-shirts", label: "Shirts" },
      { id: "men-knitwear", label: "Knitwear" },
      { id: "men-sweatshirts-hoodies", label: "Sweatshirts & Hoodies" },
      { id: "men-tracksuits", label: "Tracksuits" },
      { id: "men-jeans", label: "Jeans" },
      { id: "men-trousers", label: "Trousers" },
      { id: "men-jackets-coats", label: "Jackets & Coats" },
      { id: "men-suits-blazers", label: "Suits & Blazers" }
    ]
  },
  {
    id: "women",
    label: "Women",
    subcategories: [
      { id: "women-tops-tshirts", label: "Tops & T-Shirts" },
      { id: "women-blouses-shirts", label: "Blouses & Shirts" },
      { id: "women-knitwear", label: "Knitwear" },
      { id: "women-sweatshirts-hoodies", label: "Sweatshirts & Hoodies" },
      { id: "women-dresses-jumpsuits", label: "Dresses & Jumpsuits" },
      { id: "women-skirts", label: "Skirts" },
      { id: "women-jeans-trousers", label: "Jeans & Trousers" },
      { id: "women-tracksuits-loungewear", label: "Tracksuits & Loungewear" },
      { id: "women-jackets-coats", label: "Jackets & Coats" },
      { id: "women-suits-coord", label: "Suits & Co-ord Sets" }
    ]
  },
  {
    id: "kids-baby",
    label: "Kids & Baby",
    subcategories: [
      { id: "kids-boys", label: "Boys Clothing" },
      { id: "kids-girls", label: "Girls Clothing" },
      { id: "kids-baby-sets", label: "Baby Sets" }
    ]
  },
  {
    id: "shoes",
    label: "Shoes",
    subcategories: [
      { id: "shoes-men", label: "Men's Shoes" },
      { id: "shoes-women", label: "Women's Shoes" }
    ]
  },
  {
    id: "bags-accessories",
    label: "Bags & Accessories",
    subcategories: [
      { id: "bags-main", label: "Bags" },
      { id: "accessories-main", label: "Accessories" }
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
  stagedImages: [], // Array of { file, blob, base64Data, mimeType, dataUrl, origSize, webpSize, remoteUrl }
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
    cargoVideos: []
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
   3. UTILITY HELPERS & TOAST NOTIFICATIONS
   ========================================================================== */
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;")
    .replace(/'/g, "&" + "#039;");
}

function showAdminToast(message, duration = 3600) {
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
      togglePassBtn.textContent = isPass ? "HIDE" : "SHOW";
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
        submitBtn.textContent = "Authenticating with Firebase...";
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        showAdminToast("✓ Executive Session Authenticated");
      } catch (err) {
        if (errBox) {
          errBox.style.display = "block";
          errBox.textContent = `Authentication failed: ${err.message}`;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "🔐 Authenticate & Unlock Suite";
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      showAdminToast("Signed out of executive session.");
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
  setTxt("kpi-orders-volume", `Total Volume: ${formatMoney(totalVolume)}`);
  setTxt("kpi-total-customers", String(custCount));
  setTxt("kpi-ai-keys-count", keyCount > 0 ? `${keyCount} Active Keys ⚡` : "Add Key in Tab 6");

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
    orders: "1. Orders & WhatsApp B2B CRM",
    "ai-uploader": "2. Gemini Vision AI Product Uploader & Dual-Title Shield",
    catalog: "3. Master Catalog & 1-Read Shard Optimizer",
    blog: "4. AI 3-Language Blog Studio & Static GitHub SEO",
    videos: "5. YouTube & Shorts Showroom Media Manager",
    settings: "6. Global Live Settings, Google Ads & API Keys"
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

  // Quick Shard Sync in Topbar
  document.getElementById("topbar-quick-shard-sync")?.addEventListener("click", async () => {
    await rebuildAllCatalogShards();
  });
}

/* ==========================================================================
   6. TAB 1: ORDERS & WHATSAPP CRM ENGINE
   ========================================================================== */
async function loadOrdersAndCustomers() {
  try {
    const ordQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100));
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
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:26px; color:var(--text-muted);">No matching wholesale proforma orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((o) => {
      const code = escapeHtml(o.orderCode || o.id || "ORD-0000");
      const dateStr = o.createdAtIso ? new Date(o.createdAtIso).toLocaleDateString() : "2026";
      const buyer = escapeHtml(o.buyerName || "B2B Buyer");
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
            <strong>${packs} Packs</strong>
            <span style="display:block; font-size:0.74rem; color:var(--emerald-dark); font-weight:700;">${pcs} pcs ${pcs >= 25 ? "★ VIP" : ""}</span>
          </td>
          <td style="font-weight:800; color:var(--gold-dark);">${amount}</td>
          <td>
            <select class="adm-select" data-order-status-change="${code}" style="padding:5px 8px; font-size:0.76rem; width:165px;">
              <option value="pending_whatsapp" ${status === "pending_whatsapp" ? "selected" : ""}>🟡 Pending WhatsApp</option>
              <option value="preparing" ${status === "preparing" ? "selected" : ""}>🔵 Preparing Warehouse</option>
              <option value="shipped" ${status === "shipped" ? "selected" : ""}>🟣 Shipped Cargo</option>
              <option value="completed" ${status === "completed" ? "selected" : ""}>🟢 Completed</option>
            </select>
          </td>
          <td style="text-align:right; white-space:nowrap;">
            <a href="${invoiceUrl}" target="_blank" class="adm-btn-xs" title="Open Proforma Invoice">📄 Invoice ↗</a>
            <a href="${waHref}" target="_blank" rel="noopener" class="adm-btn-xs" style="background:var(--emerald-light); color:var(--emerald-dark); border-color:var(--adm-emerald);">💬 WhatsApp</a>
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
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">No customer records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((c) => {
      const name = escapeHtml(c.name || "VIP Buyer");
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
          <td style="font-weight:700;">${lastAmt} (${c.lastOrderPieces || 0} pcs)</td>
          <td style="text-align:right;">
            ${cleanPhone ? `<a href="${waLink}" target="_blank" rel="noopener" class="adm-btn-xs">💬 Message Buyer</a>` : "—"}
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

  // Order Status Inline Change
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
      showAdminToast(`✓ Order ${orderCode} status updated to ${newStatus}`);
    } catch (err) {
      showAdminToast(`Status update error: ${err.message}`);
    }
  });

  // Export Customers CSV
  document.getElementById("btn-export-customers-csv")?.addEventListener("click", () => {
    if (adminState.customers.length === 0) {
      showAdminToast("No customer records to export.");
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

  // Export Customers JSON
  document.getElementById("btn-export-customers-json")?.addEventListener("click", () => {
    if (adminState.customers.length === 0) {
      showAdminToast("No customer records to export.");
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
   7. WEBP CLIENT-SIDE IMAGE COMPRESSOR & FIREBASE STORAGE UPLOADER
   ========================================================================== */
/**
 * Converts any selected image file into a lightweight WebP Blob (max width 1200px, quality 0.84)
 * and extracts pure Base64 for Gemini Vision API.
 */
async function compressImageToWebP(file, maxWidth = 1200, quality = 0.84) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File read failed"));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image decode failed"));
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

        const dataUrl = canvas.toDataURL("image/webp", quality);
        const base64Data = dataUrl.split(",")[1] || "";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("WebP Canvas conversion failed"));
              return;
            }
            resolve({
              file,
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
 * Uploads compressed WebP Blob to Firebase Storage at `products/{dept}/{timestamp}_{code}.webp`
 * and returns the public download URL.
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

/* ==========================================================================
   8. MULTI-KEY GEMINI AI ROTATOR ENGINE (gemini-2.5-flash + Failover)
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

/**
 * Executes a Gemini generateContent request with automatic Multi-Key Rotation
 * and automatic model fallback (`gemini-2.5-flash` -> `gemini-1.5-flash`).
 */
async function callGeminiWithRotator(contentsPayload, expectJson = true) {
  const keys = getActiveGeminiKeys();
  if (keys.length === 0) {
    throw new Error("No Gemini API keys configured! Please enter at least one Gemini API Key in Tab 6 (Global Live Settings).");
  }

  const preferredModel = document.getElementById("cfg-gemini-model")?.value || adminState.adminSecrets.geminiModel || "gemini-2.5-flash";
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
          // Quota or rate limit reached on this key; rotate to next key
          lastError = new Error(`Key #${keyIndex + 1} hit quota/rate-limit (HTTP ${res.status})`);
          break;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          lastError = new Error(errData?.error?.message || `HTTP ${res.status} on ${modelName}`);
          continue; // Try fallback model on same key
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!rawText) {
          throw new Error("Empty response from Gemini API.");
        }

        // Advance cursor for balanced load rotation on next call
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

  throw lastError || new Error("All Gemini API keys and fallback models failed.");
}

/* ==========================================================================
   9. TAB 2: AI PRODUCT UPLOADER & GEMINI VISION DUAL-TITLE ANALYZER
   ========================================================================== */
function populateSubcategoryDropdown(deptId, selectedSubId = "") {
  const subSelect = document.getElementById("prod-subcategory");
  if (!subSelect) return;
  const deptObj = DEPARTMENTS_TAXONOMY.find((d) => d.id === deptId) || DEPARTMENTS_TAXONOMY[0];

  subSelect.innerHTML = deptObj.subcategories
    .map((sc) => `<option value="${escapeHtml(sc.id)}" ${sc.id === selectedSubId ? "selected" : ""}>${escapeHtml(sc.label)} (${escapeHtml(sc.id)})</option>`)
    .join("");
}

function updatePackMathDisplay() {
  const unitPrice = parseFloat(document.getElementById("prod-unit-price")?.value) || 0;
  const pcs = parseInt(document.getElementById("prod-pcs-per-pack")?.value, 10) || 1;
  const total = unitPrice * pcs;
  const displayEl = document.getElementById("prod-pack-total-display");
  if (displayEl) {
    displayEl.value = `${formatMoney(total)} (${pcs} pcs)`;
  }
}

function generateAutoSku() {
  const dept = document.getElementById("prod-department")?.value || "men";
  const prefixMap = {
    men: "PRD-M",
    women: "PRD-W",
    "kids-baby": "PRD-K",
    shoes: "PRD-S",
    "bags-accessories": "PRD-B"
  };
  const prefix = prefixMap[dept] || "PRD-TR";
  const rand = Math.floor(100 + Math.random() * 900);
  const skuInput = document.getElementById("prod-sku");
  if (skuInput) skuInput.value = `${prefix}${rand}`;
}

function renderStagedImagePreviews() {
  const container = document.getElementById("product-upload-previews");
  const badge = document.getElementById("webp-compression-status");
  if (!container) return;

  if (adminState.stagedImages.length === 0) {
    container.innerHTML = "";
    return;
  }

  let totalOrig = 0;
  let totalWebp = 0;

  container.innerHTML = adminState.stagedImages
    .map((item, idx) => {
      totalOrig += item.origSize || 0;
      totalWebp += item.webpSize || 0;
      const kb = item.webpSize ? `${Math.round(item.webpSize / 1024)} KB WebP` : "Direct URL";
      return `
        <div class="upload-preview-item">
          <img src="${escapeHtml(item.dataUrl || item.remoteUrl)}" alt="Preview ${idx + 1}" />
          <span class="webp-badge">⚡ ${escapeHtml(kb)}</span>
          <button type="button" data-remove-staged="${idx}" style="position:absolute; top:8px; right:8px; width:24px; height:24px; border-radius:50%; background:rgba(15,23,42,0.85); color:#fff; font-size:0.72rem; font-weight:800;">✕</button>
        </div>
      `;
    })
    .join("");

  if (badge && totalOrig > 0) {
    const savedPct = Math.max(0, Math.round((1 - totalWebp / totalOrig) * 100));
    badge.textContent = `WebP Ready: ${Math.round(totalWebp / 1024)} KB (Saved ${savedPct}%)`;
  }
}

async function handleFilesSelected(fileList) {
  const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
  if (files.length === 0) return;

  const statusEl = document.getElementById("ai-vision-status-text");
  if (statusEl) statusEl.textContent = "Compressing image(s) to ultra-fast WebP...";

  for (const file of files) {
    try {
      const compressed = await compressImageToWebP(file, 1200, 0.84);
      adminState.stagedImages.push(compressed);
    } catch (err) {
      showAdminToast(`Image compression error: ${err.message}`);
    }
  }

  renderStagedImagePreviews();
  if (statusEl) {
    statusEl.textContent = `✓ ${adminState.stagedImages.length} WebP image(s) ready. Click "Analyze Image with Gemini Vision AI" to auto-fill all fields.`;
  }
}

/**
 * Gemini Vision Dual-Title Analyzer
 * Analyzes staged product image(s) + admin hint and populates 3-language publicTitle, brandTitle, searchTags, and description.
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

  // Attach up to 3 staged images with base64Data for multi-angle / label inspection
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
    showAdminToast("Please select a product photo or enter a product hint first.");
    return;
  }

  const visionPrompt = `
You are the Executive B2B Fashion Catalog Director for "Paradise Wholesale Clothing" (Istanbul, Turkey - [https://paradisewholesaler.com](https://paradisewholesaler.com)).
Analyze the attached garment/footwear/bag image(s) and optional admin hint: "${adminHint || "None"}".

CRITICAL DUAL-TITLE ARCHITECTURE:
1. "publicTitle" (en, it, es): Luxury, high-converting B2B wholesale title describing fabric weight (e.g. 320 GSM Combed Turkish Cotton), cut, texture, or silhouette WITHOUT mentioning any trademarked luxury brand names (100% safe for Google Ads & SEO).
2. "brandTitle" (en, it, es): The exact, real brand-inspired model title recognizing any visible logo, monogram, crest, or fashion house style (e.g. Gucci, Louis Vuitton, Prada, Balenciaga, Dior, Amiri, Balmain, Chanel, YSL, Fendi, Moncler, Hermes, Zara, etc.) for internal buyer search results.
3. "searchTags": Array of 12 to 18 lowercase search keywords including the detected brand name and garment type in English, Italian, Spanish, AND Persian (e.g. ["gucci", "oversize tshirt", "maglietta gucci", "camiseta gucci", "گوچی", "تیشرت گوچی", "عمده پوشاک ترک"]).
4. "description" (en, it, es): Professional 2-3 sentence B2B wholesale description highlighting Turkish master quality, fabric/stitching excellence, flexible MOQ (order from 1 serie pack, best factory rate for 25+ pcs), and 3-5 day express DHL/UPS air cargo from Istanbul to Italy, Spain, UK, and USA.

Choose "dept" and "cat" ONLY from this exact taxonomy list:
${validTaxonomyJson}

Choose "sub" from: ["oversize", "regular", "monogram", "heavyweight", "leather"].

Return ONLY a valid JSON object matching this exact structure:
{
  "dept": "men|women|kids-baby|shoes|bags-accessories",
  "cat": "exact_subcategory_id_from_list",
  "sub": "oversize|regular|monogram|heavyweight|leather",
  "suggestedUnitPrice": 16.5,
  "suggestedPcsPerPack": 6,
  "suggestedSizeRange": "S - M - L - XL - XXL",
  "publicTitle": { "en": "...", "it": "...", "es": "..." },
  "brandTitle": { "en": "...", "it": "...", "es": "..." },
  "searchTags": ["...", "..."],
  "description": { "en": "...", "it": "...", "es": "..." }
}
`.trim();

  parts.push({ text: visionPrompt });

  if (btn) {
    btn.disabled = true;
    btn.textContent = "🧠 Gemini Vision Analyzing Fabric, Brand & 3 Languages...";
  }
  if (statusEl) statusEl.textContent = "Calling Gemini Vision AI via Multi-Key Rotator...";

  try {
    const result = await callGeminiWithRotator([{ role: "user", parts }], true);

    // Populate Taxonomy
    const deptEl = document.getElementById("prod-department");
    if (deptEl && result.dept) {
      deptEl.value = result.dept;
      populateSubcategoryDropdown(result.dept, result.cat);
    }
    const subStyleEl = document.getElementById("prod-substyle");
    if (subStyleEl && result.sub) subStyleEl.value = result.sub;

    // Populate Pack Math if new item
    if (result.suggestedUnitPrice) {
      document.getElementById("prod-unit-price").value = result.suggestedUnitPrice;
    }
    if (result.suggestedPcsPerPack) {
      document.getElementById("prod-pcs-per-pack").value = result.suggestedPcsPerPack;
    }
    if (result.suggestedSizeRange) {
      document.getElementById("prod-size-range").value = result.suggestedSizeRange;
    }
    updatePackMathDisplay();

    // Populate Dual Titles (Public Safe)
    document.getElementById("prod-public-en").value = result.publicTitle?.en || "";
    document.getElementById("prod-public-it").value = result.publicTitle?.it || "";
    document.getElementById("prod-public-es").value = result.publicTitle?.es || "";

    // Populate Dual Titles (Real Brand for Search)
    document.getElementById("prod-brand-en").value = result.brandTitle?.en || "";
    document.getElementById("prod-brand-it").value = result.brandTitle?.it || "";
    document.getElementById("prod-brand-es").value = result.brandTitle?.es || "";

    // Populate Search Tags
    const tagsArr = Array.isArray(result.searchTags) ? result.searchTags : [];
    document.getElementById("prod-search-tags").value = tagsArr.join(", ");

    // Populate 3-Language Descriptions
    document.getElementById("prod-desc-en").value = result.description?.en || "";
    document.getElementById("prod-desc-it").value = result.description?.it || "";
    document.getElementById("prod-desc-es").value = result.description?.es || "";

    if (!document.getElementById("prod-doc-id").value) {
      generateAutoSku();
    }

    if (statusEl) {
      statusEl.textContent = "✓ Gemini Vision completed! Review the Dual-Title fields below and click Save.";
    }
    showAdminToast("✨ Gemini Vision populated all 3 languages & Dual-Title Shield!");
  } catch (err) {
    if (statusEl) statusEl.textContent = `AI Analysis Error: ${err.message}`;
    showAdminToast(`Gemini Vision Error: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "🧠 Analyze Image with Gemini Vision AI (3 Languages)";
    }
  }
}

/* ==========================================================================
   10. SAVE PRODUCT & 1-READ CATALOG SHARD SYNC ENGINE
   ========================================================================== */
async function handleSaveProductForm(e) {
  e.preventDefault();
  const submitBtn = document.getElementById("btn-save-product-submit");
  const existingDocId = document.getElementById("prod-doc-id").value.trim();
  const sku = document.getElementById("prod-sku").value.trim().toUpperCase() || `PRD-${Date.now().toString().slice(-4)}`;
  const docId = existingDocId || sku;

  const department = document.getElementById("prod-department").value;
  const subcategory = document.getElementById("prod-subcategory").value;
  const subStyle = document.getElementById("prod-substyle").value;
  const unitPrice = parseFloat(document.getElementById("prod-unit-price").value) || 0;
  const pcsPerPack = Math.max(1, parseInt(document.getElementById("prod-pcs-per-pack").value, 10) || 6);
  const sizeRange = document.getElementById("prod-size-range").value.trim() || "S - M - L - XL";
  const stockStatus = document.getElementById("prod-stock-status").value || "in_stock";
  const isFeatured = document.getElementById("prod-is-featured").checked;

  const publicTitle = {
    en: document.getElementById("prod-public-en").value.trim(),
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
    submitBtn.textContent = "Uploading WebP to Storage & Syncing Shards...";
  }

  try {
    // 1. Upload any staged WebP blobs to Firebase Storage
    const uploadedUrls = [];
    for (let i = 0; i < adminState.stagedImages.length; i++) {
      const staged = adminState.stagedImages[i];
      if (staged.remoteUrl) {
        uploadedUrls.push(staged.remoteUrl);
      } else if (staged.blob) {
        try {
          const url = await uploadWebPToFirebaseStorage(staged, department, sku, i);
          uploadedUrls.push(url);
        } catch (storageErr) {
          console.warn("Storage upload fallback to inline WebP dataUrl:", storageErr.message);
          uploadedUrls.push(staged.dataUrl);
        }
      }
    }

    const manualUrl = document.getElementById("prod-manual-image-url")?.value.trim();
    if (manualUrl && !uploadedUrls.includes(manualUrl)) {
      uploadedUrls.push(manualUrl);
    }

    const primaryImageUrl =
      uploadedUrls[0] ||
      "[https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80](https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80)";

    const nowMillis = Date.now();
    const productPayload = {
      id: docId,
      code: sku,
      sku,
      department,
      subcategory,
      subStyle,
      unitPrice,
      pcsPerPack,
      packTotal: Number((unitPrice * pcsPerPack).toFixed(2)),
      sizeRange,
      stockStatus,
      isFeatured,
      publicTitle,
      brandTitle,
      description,
      searchTags,
      imageUrl: primaryImageUrl,
      images: uploadedUrls.length > 0 ? uploadedUrls : [primaryImageUrl],
      createdAtMillis: nowMillis,
      updatedAtIso: new Date().toISOString(),
      createdAt: serverTimestamp()
    };

    // 2. Save to Firestore `products/{docId}`
    await setDoc(doc(db, "products", docId), productPayload, { merge: true });

    // Update in-memory list
    const existingIdx = adminState.products.findIndex((p) => p.id === docId);
    if (existingIdx > -1) {
      adminState.products[existingIdx] = productPayload;
    } else {
      adminState.products.unshift(productPayload);
    }

    // 3. Rebuild 1-Read Catalog Shards immediately
    await rebuildAllCatalogShards();

    renderCatalogTable();
    updateDashboardKPIs();
    resetProductForm();
    showAdminToast(`✓ Product ${sku} saved & 1-Read Catalog Shards synced!`);
  } catch (err) {
    showAdminToast(`Save Product Error: ${err.message}`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "💾 Save Product to Firestore & Sync Catalog Shard";
    }
  }
}

/**
 * Rebuilds `catalog_shards/master_catalog`, `catalog_shards/latest`, and per-department shards (`catalog_shards/{dept}`)
 * so `index.html` and `category.html` load all products in 1 single document read.
 */
async function rebuildAllCatalogShards() {
  try {
    const items = adminState.products.map((p) => ({
      id: p.id || p.sku,
      sku: p.sku || p.code || p.id,
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
      createdAtMillis: p.createdAtMillis || Date.now()
    }));

    // 1. Master Catalog Shard
    await setDoc(doc(db, "catalog_shards", "master_catalog"), {
      updatedAtIso: new Date().toISOString(),
      totalCount: items.length,
      items
    });

    // 2. Latest Arrivals Shard (Top 24)
    await setDoc(doc(db, "catalog_shards", "latest"), {
      updatedAtIso: new Date().toISOString(),
      items: items.slice(0, 24)
    });

    // 3. Per-Department Shards
    for (const deptObj of DEPARTMENTS_TAXONOMY) {
      const deptItems = items.filter((i) => i.department === deptObj.id);
      await setDoc(doc(db, "catalog_shards", deptObj.id), {
        department: deptObj.id,
        updatedAtIso: new Date().toISOString(),
        totalCount: deptItems.length,
        items: deptItems
      });
    }

    const syncStatusEl = document.getElementById("topbar-sync-status");
    if (syncStatusEl) {
      syncStatusEl.textContent = `✓ All 1-Read Catalog Shards Synced (${items.length} products) at ${new Date().toLocaleTimeString()}`;
    }
    showAdminToast(`⚡ Synced ${items.length} products across all 1-Read Firestore Shards!`);
  } catch (err) {
    showAdminToast(`Shard sync error: ${err.message}`);
  }
}

function resetProductForm() {
  document.getElementById("admin-product-form")?.reset();
  document.getElementById("prod-doc-id").value = "";
  document.getElementById("product-form-mode-title").textContent =
    "Step 2: B2B Serie Pack Specs & Dual-Title Brand Protection";
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

  // Dropzone events
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

  // Remove staged image
  document.getElementById("product-upload-previews")?.addEventListener("click", (e) => {
    const rmBtn = e.target.closest("[data-remove-staged]");
    if (!rmBtn) return;
    const idx = parseInt(rmBtn.getAttribute("data-remove-staged"), 10);
    adminState.stagedImages.splice(idx, 1);
    renderStagedImagePreviews();
  });

  // Add manual image URL to preview
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

  document.getElementById("btn-analyze-gemini-vision")?.addEventListener("click", runGeminiVisionProductAnalyzer);
  document.getElementById("btn-reset-product-form")?.addEventListener("click", resetProductForm);
  document.getElementById("admin-product-form")?.addEventListener("submit", handleSaveProductForm);
}

/* ==========================================================================
   11. TAB 3: CATALOG & SHARD MANAGER
   ========================================================================== */
async function loadProductsCatalog() {
  try {
    const q = query(collection(db, "products"), orderBy("createdAtMillis", "desc"), limit(200));
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
  renderCatalogTable();
  updateDashboardKPIs();
}

function renderCatalogTable() {
  const tbody = document.getElementById("admin-catalog-tbody");
  const countEl = document.getElementById("catalog-showing-count");
  if (!tbody) return;

  const deptFilter = document.getElementById("catalog-filter-dept")?.value || "all";
  const stockFilter = document.getElementById("catalog-filter-stock")?.value || "all";
  const searchQ = (document.getElementById("catalog-search-input")?.value || "").trim().toLowerCase();

  const filtered = adminState.products.filter((p) => {
    if (deptFilter !== "all" && p.department !== deptFilter) return false;
    if (stockFilter !== "all" && (p.stockStatus || "in_stock") !== stockFilter) return false;
    if (searchQ) {
      const pubEn = p.publicTitle?.en || p.publicTitle || "";
      const brdEn = p.brandTitle?.en || p.brandTitle || "";
      const tags = Array.isArray(p.searchTags) ? p.searchTags.join(" ") : "";
      const hay = `${p.sku || ""} ${pubEn} ${brdEn} ${tags}`.toLowerCase();
      if (!hay.includes(searchQ)) return false;
    }
    return true;
  });

  if (countEl) countEl.textContent = String(filtered.length);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:26px; color:var(--text-muted);">No products match your filter criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((p) => {
      const id = escapeHtml(p.id || p.sku);
      const sku = escapeHtml(p.sku || p.id);
      const dept = escapeHtml((p.department || "men").toUpperCase());
      const pubEn = escapeHtml(typeof p.publicTitle === "object" ? p.publicTitle.en : p.publicTitle || "");
      const brdEn = escapeHtml(typeof p.brandTitle === "object" ? p.brandTitle.en : p.brandTitle || "");
      const unitPrice = Number(p.unitPrice) || 0;
      const pcs = Math.max(1, parseInt(p.pcsPerPack, 10) || 6);
      const packTotal = formatMoney(unitPrice * pcs);
      const stock = p.stockStatus || "in_stock";
      const img = escapeHtml(p.imageUrl || "");

      return `
        <tr data-catalog-row="${id}">
          <td>
            <img src="${img}" alt="${sku}" style="width:46px; height:60px; object-fit:cover; border-radius:6px; border:1px solid var(--adm-border);" loading="lazy" />
          </td>
          <td>
            <strong style="color:var(--gold-dark); display:block;">${sku}</strong>
            <span style="font-size:0.72rem; color:var(--text-muted);">${dept}</span>
          </td>
          <td>
            <div style="font-weight:700; color:var(--charcoal); font-size:0.84rem;">🟢 ${pubEn}</div>
            <div style="font-size:0.75rem; color:var(--gold-dark); font-weight:700; margin-top:2px;">🟡 ${brdEn}</div>
          </td>
          <td>
            <input type="number" step="0.5" class="adm-input" data-inline-price="${id}" value="${unitPrice}" style="width:88px; padding:6px 8px;" />
          </td>
          <td>
            <input type="number" step="1" min="1" class="adm-input" data-inline-pcs="${id}" value="${pcs}" style="width:74px; padding:6px 8px;" />
          </td>
          <td style="font-weight:800; color:var(--charcoal);">${packTotal}</td>
          <td>
            <select class="adm-select" data-inline-stock="${id}" style="width:135px; padding:6px 8px; font-size:0.75rem;">
              <option value="in_stock" ${stock === "in_stock" ? "selected" : ""}>🟢 In Stock</option>
              <option value="low_stock" ${stock === "low_stock" ? "selected" : ""}>🟡 Low Stock</option>
              <option value="out_of_stock" ${stock === "out_of_stock" ? "selected" : ""}>🔴 Out of Stock</option>
            </select>
          </td>
          <td style="text-align:right; white-space:nowrap;">
            <button type="button" class="adm-btn-xs" data-save-inline="${id}" title="Save Quick Edits">💾 Save</button>
            <button type="button" class="adm-btn-xs" data-edit-full="${id}" title="Load into AI Form">✏️ Edit</button>
            <button type="button" class="adm-btn-xs danger" data-delete-prod="${id}" title="Delete Product">🗑</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function bindCatalogManagerEvents() {
  document.getElementById("catalog-filter-dept")?.addEventListener("change", renderCatalogTable);
  document.getElementById("catalog-filter-stock")?.addEventListener("change", renderCatalogTable);
  document.getElementById("catalog-search-input")?.addEventListener("input", renderCatalogTable);
  document.getElementById("btn-rebuild-all-shards")?.addEventListener("click", rebuildAllCatalogShards);

  document.getElementById("admin-catalog-tbody")?.addEventListener("click", async (e) => {
    const target = e.target;

    // 1. Save Inline Price / Pack / Stock Changes
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
      } catch (err) {
        showAdminToast(`Inline update error: ${err.message}`);
      }
      return;
    }

    // 2. Load Product into Tab 2 Full Editor
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

      document.getElementById("product-form-mode-title").textContent = `Editing Product: ${prod.sku || prod.id}`;
      document.querySelector('[data-admin-tab="ai-uploader"]')?.click();
      showAdminToast(`Loaded ${prod.sku} into editor.`);
      return;
    }

    // 3. Delete Product
    const delBtn = target.closest("[data-delete-prod]");
    if (delBtn) {
      const id = delBtn.getAttribute("data-delete-prod");
      if (!confirm(`Delete product ${id} permanently from catalog?`)) return;
      try {
        await deleteDoc(doc(db, "products", id));
        adminState.products = adminState.products.filter((p) => p.id !== id);
        await rebuildAllCatalogShards();
        renderCatalogTable();
        updateDashboardKPIs();
      } catch (err) {
        showAdminToast(`Delete error: ${err.message}`);
      }
    }
  });
}

/* ==========================================================================
   12. TAB 4: AI 3-LANGUAGE BLOG STUDIO & GITHUB STATIC SEO PUBLISHER
   ========================================================================== */
async function loadPublishedBlogs() {
  try {
    const q = query(collection(db, "blogs"), orderBy("createdAtIso", "desc"), limit(50));
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
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">No blog articles published yet. Use Gemini Studio above to generate your first 3-language SEO guide.</td></tr>`;
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
            <button type="button" class="adm-btn-xs" data-edit-blog="${id}">✏️ Edit</button>
            <button type="button" class="adm-btn-xs danger" data-delete-blog="${id}">🗑 Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function generate3LanguageBlogWithGemini() {
  const promptInput = document.getElementById("blog-ai-prompt")?.value.trim();
  if (!promptInput) {
    showAdminToast("Please enter an article topic in Persian or English first.");
    return;
  }

  const category = document.getElementById("blog-category-select")?.value || "logistics";
  const selectedDepts = Array.from(document.querySelectorAll(".blog-silo-dept:checked")).map((cb) => cb.value);
  const siloLinksText = selectedDepts
    .map((d) => `${SITE_DOMAIN}/category.html?dept=${d}`)
    .join(", ");

  const btn = document.getElementById("btn-generate-3lang-blog");
  const statusEl = document.getElementById("blog-ai-status");

  if (btn) {
    btn.disabled = true;
    btn.textContent = "🤖 Gemini Writing Native EN, IT & ES SEO Articles...";
  }
  if (statusEl) statusEl.textContent = "Generating comprehensive 3-language HTML & FAQ schema...";

  const blogPrompt = `
You are the Chief B2B SEO Content Strategist for "Paradise Wholesale Clothing" (Paradise Turkey Wholesale — [https://paradisewholesaler.com](https://paradisewholesaler.com), located in Istanbul Merter).
Write an authoritative, high-converting, long-form B2B wholesale article based on this topic:
"${promptInput}"

Category: ${category}
Must naturally include clickable HTML internal silo links (<a href="...">...</a>) to these wholesale departments: ${siloLinksText || "[https://paradisewholesaler.com/category.html](https://paradisewholesaler.com/category.html)"}.
Must highlight our core B2B USPs:
- Direct Istanbul factory supply (heavyweight combed cotton, luxury streetwear, boutique women's sets, handcrafted leather shoes & bags).
- Flexible MOQ: Order starting from 1 Serie Pack to test quality, and unlock Best Factory Wholesale Tier Rate for 25+ pieces.
- Fast 3–5 day express DHL/UPS air cargo to Italy, Spain, UK, USA & worldwide.
- Do NOT mention copyrighted luxury brand names in the article text (keep 100% Google Ads & SEO safe).

Return ONLY a valid JSON object with native, fluent English ("en"), Italian ("it"), and Spanish ("es") versions matching this exact schema:
{
  "readingMinutes": 5,
  "en": {
    "title": "...",
    "slug": "seo-friendly-english-slug",
    "metaTitle": "...",
    "metaDescription": "...",
    "htmlContent": "<h2>...</h2><p>...</p><h3>...</h3><ul><li>...</li></ul>...",
    "faq": [
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." }
    ]
  },
  "it": {
    "title": "...",
    "slug": "slug-italiano-seo",
    "metaTitle": "...",
    "metaDescription": "...",
    "htmlContent": "<h2>...</h2><p>...</p>...",
    "faq": [
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." }
    ]
  },
  "es": {
    "title": "...",
    "slug": "slug-espanol-seo",
    "metaTitle": "...",
    "metaDescription": "...",
    "htmlContent": "<h2>...</h2><p>...</p>...",
    "faq": [
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." }
    ]
  }
}
`.trim();

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

    if (statusEl) {
      statusEl.textContent = "✓ 3-Language SEO Article generated! Review EN / IT / ES tabs below and click Publish.";
    }
    showAdminToast("✨ 3-Language SEO Article & FAQ Schema Ready!");
  } catch (err) {
    if (statusEl) statusEl.textContent = `Blog Generation Error: ${err.message}`;
    showAdminToast(`Gemini Blog Error: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "✨ Generate Native 3-Language SEO Article with Gemini";
    }
  }
}

/**
 * Generates standalone, 100% crawlable static HTML for `/en/blog/{slug}/index.html`, `/it/blog/{slug}/index.html`, `/es/blog/{slug}/index.html`
 */
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
      author: {
        "@type": "Organization",
        name: "Paradise Wholesale Clothing Istanbul",
        url: `${SITE_DOMAIN}/`
      },
      publisher: {
        "@type": "Organization",
        name: "Paradise Wholesale Clothing",
        url: `${SITE_DOMAIN}/`
      }
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_DOMAIN}/` },
        { "@type": "ListItem", position: 2, name: "B2B Blog", item: `${SITE_DOMAIN}/blog.html` },
        { "@type": "ListItem", position: 3, name: title, item: canonicalUrl }
      ]
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
          <h2 style="font-family:'Playfair Display',serif; font-size:1.45rem; margin-bottom:14px;">Frequently Asked Questions</h2>
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
  <link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)" />
  <link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossorigin />
  <link href="[https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap](https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap)" rel="stylesheet" />
  <link rel="stylesheet" href="/style.css" />
  <script type="application/ld+json">${JSON.stringify({ "@context": "[https://schema.org](https://schema.org)", "@graph": schemaGraph })}</script>
</head>
<body>
  <div class="top-bar">
    <div class="container top-bar-inner">
      <div class="top-bar-message">
        <span class="top-bar-badge">ISTANBUL FACTORY DIRECT</span>
        <span>Flexible MOQ from 1 Pack • Best Wholesale Rate for 25+ pcs • Express DHL/UPS Worldwide</span>
      </div>
    </div>
  </div>
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
        <span class="top-bar-badge" style="margin-bottom:12px;">${escapeHtml(articlePayload.category.toUpperCase())}</span>
        <h1 class="section-title" style="margin-bottom:18px;">${escapeHtml(title)}</h1>
        <img src="${escapeHtml(cover)}" alt="${escapeHtml(title)}" style="width:100%; border-radius:14px; margin-bottom:24px; aspect-ratio:16/9; object-fit:cover;" />
        <div class="article-prose" style="line-height:1.85;">
          ${htmlContent}
        </div>
        ${faqHtml}
        <div style="margin-top:36px; padding:28px; border-radius:14px; background:var(--charcoal); color:#fff; border:1.5px solid var(--gold);">
          <span class="top-bar-badge" style="margin-bottom:8px;">Direct Istanbul Wholesale • Flexible MOQ (From 1 Pack / Best Rate 25+ pcs)</span>
          <h3 style="font-family:'Playfair Display',serif; font-size:1.35rem; margin-bottom:10px;">Order Direct from Paradise Wholesale Istanbul</h3>
          <div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:14px;">
            <button type="button" class="btn btn-whatsapp" data-whatsapp-trigger="static_blog_cta" data-whatsapp-message="Hello Paradise Wholesale Istanbul! I read your guide (${escapeHtml(title)}) and want to request your VIP catalog.">
              Chat with Wholesale Desk on WhatsApp
            </button>
            <a href="/category.html" class="btn btn-gold">Explore Wholesale Serie Packs →</a>
          </div>
        </div>
      </article>
    </div>
  </main>
  <script type="module" src="/core.js"></script>
</body>
</html>`;
}

/**
 * Commits a file to GitHub Repository via REST API (`PUT /repos/{owner}/{repo}/contents/{path}`)
 */
async function commitFileToGitHub(filePath, contentString, commitMessage) {
  const token = (document.getElementById("cfg-github-token")?.value || adminState.adminSecrets.githubToken || "").trim();
  const repo = (document.getElementById("cfg-github-repo")?.value || adminState.adminSecrets.githubRepo || "").trim();
  const branch = (document.getElementById("cfg-github-branch")?.value || adminState.adminSecrets.githubBranch || "main").trim();

  if (!token || !repo) {
    throw new Error("GitHub Token or Repository (owner/repo) is not configured in Tab 6.");
  }

  const cleanPath = filePath.replace(/^\/+/, "");
  const apiUrl = `[https://api.github.com/repos/$](https://api.github.com/repos/$){repo}/contents/${cleanPath}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json"
  };

  // Check if file exists to get current `sha`
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

  const combinedFaqs = faqsByLang.en.map((item, idx) => ({
    question: {
      en: item.question || "",
      it: faqsByLang.it[idx]?.question || item.question || "",
      es: faqsByLang.es[idx]?.question || item.question || ""
    },
    answer: {
      en: item.answer || "",
      it: faqsByLang.it[idx]?.answer || item.answer || "",
      es: faqsByLang.es[idx]?.answer || item.answer || ""
    }
  }));

  const docId = document.getElementById("blog-doc-id").value.trim() || slugs.en;
  const nowIso = new Date().toISOString();

  const articlePayload = {
    id: docId,
    slug: slugs.en,
    slugs,
    category: document.getElementById("blog-category-select")?.value || "logistics",
    coverImage:
      document.getElementById("blog-cover-url")?.value.trim() ||
      "[https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85](https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85)",
    title,
    metaTitle,
    metaDescription,
    excerpt: metaDescription,
    content,
    faqs: combinedFaqs,
    faqsByLang,
    readingTime: "5 min read",
    publishedAt: nowIso.slice(0, 10),
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    createdAt: serverTimestamp()
  };

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Publishing to Firestore & Building Static GitHub Pages...";
  }

  try {
    // 1. Save full article in `blogs/{docId}`
    await setDoc(doc(db, "blogs", docId), articlePayload, { merge: true });

    const existingIdx = adminState.blogs.findIndex((b) => b.id === docId);
    if (existingIdx > -1) {
      adminState.blogs[existingIdx] = articlePayload;
    } else {
      adminState.blogs.unshift(articlePayload);
    }

    // 2. Sync lightweight 1-Read `settings/blog_index`
    await syncBlogIndexDocument();

    // 3. If GitHub token is configured, push `/en/blog/{slug}/index.html`, `/it/blog/{slug}/index.html`, `/es/blog/{slug}/index.html` + `sitemap.xml`
    const ghToken = (document.getElementById("cfg-github-token")?.value || adminState.adminSecrets.githubToken || "").trim();
    const ghRepo = (document.getElementById("cfg-github-repo")?.value || adminState.adminSecrets.githubRepo || "").trim();

    if (ghToken && ghRepo) {
      for (const lang of ["en", "it", "es"]) {
        const htmlPage = buildStaticBlogHtmlPage(articlePayload, lang);
        const targetPath = `${lang}/blog/${slugs[lang]}/index.html`;
        await commitFileToGitHub(targetPath, htmlPage, `SEO Static Blog [${lang.toUpperCase()}]: ${title[lang]}`);
      }
      await buildAndPushSitemapAndRobots();
      showAdminToast("🚀 Published to Firestore + 3 Static HTML Pages & Sitemap pushed to GitHub!");
    } else {
      showAdminToast("✓ Published to Firestore (`blogs` & `settings/blog_index`)!");
    }

    renderPublishedBlogsTable();
    updateDashboardKPIs();
  } catch (err) {
    showAdminToast(`Publish Error: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "🌍 Publish to Firestore & Push Static HTML Pages to GitHub";
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

/**
 * Generates `sitemap.xml` (Home, all 5 Departments & Subcategories, all 3-language Blog URLs)
 * and `robots.txt` (Disallowing admin.html, order.html, and search queries) and commits to GitHub.
 */
async function buildAndPushSitemapAndRobots() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_DOMAIN}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${SITE_DOMAIN}/category.html`, priority: "0.9", changefreq: "daily" },
    { loc: `${SITE_DOMAIN}/blog.html`, priority: "0.8", changefreq: "daily" }
  ];

  DEPARTMENTS_TAXONOMY.forEach((dept) => {
    urls.push({
      loc: `${SITE_DOMAIN}/category.html?dept=${dept.id}`,
      priority: "0.85",
      changefreq: "daily"
    });
    dept.subcategories.forEach((sc) => {
      urls.push({
        loc: `${SITE_DOMAIN}/category.html?dept=${dept.id}&cat=${sc.id}`,
        priority: "0.75",
        changefreq: "weekly"
      });
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
<urlset xmlns="[http://www.sitemaps.org/schemas/sitemap/0.9](http://www.sitemaps.org/schemas/sitemap/0.9)">
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
  // Language Editor Sub-tabs
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
      showAdminToast(`Loaded article "${art.title?.en || id}" into editor.`);
      return;
    }

    const delBtn = e.target.closest("[data-delete-blog]");
    if (delBtn) {
      const id = delBtn.getAttribute("data-delete-blog");
      if (!confirm(`Delete article ${id}?`)) return;
      try {
        await deleteDoc(doc(db, "blogs", id));
        adminState.blogs = adminState.blogs.filter((b) => b.id !== id);
        await syncBlogIndexDocument();
        renderPublishedBlogsTable();
        updateDashboardKPIs();
        showAdminToast("Article deleted.");
      } catch (err) {
        showAdminToast(`Delete error: ${err.message}`);
      }
    }
  });
}

/* ==========================================================================
   13. TAB 5: VIDEOS & MEDIA MANAGER (HERO YOUTUBE/SHORTS & CARGO CAROUSEL)
   ========================================================================== */
function renderCargoVideosTable() {
  const tbody = document.getElementById("admin-cargo-videos-tbody");
  if (!tbody) return;

  const list = Array.isArray(adminState.publicConfig.cargoVideos) ? adminState.publicConfig.cargoVideos : [];
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No custom cargo videos added yet (default showcase active). Add a YouTube or Shorts link above.</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map((v, idx) => {
      const ytId = escapeHtml(v.ytId || "");
      const thumb = escapeHtml(v.thumb || `[https://i.ytimg.com/vi/$](https://i.ytimg.com/vi/$){ytId}/hqdefault.jpg`);
      return `
        <tr>
          <td><img src="${thumb}" alt="Video" style="width:54px; height:72px; object-fit:cover; border-radius:6px;" /></td>
          <td><span class="top-bar-badge">${escapeHtml(v.badge || "CARGO")}</span></td>
          <td><strong>${escapeHtml(v.title || "")}</strong></td>
          <td><code>${ytId}</code></td>
          <td style="text-align:right;">
            <button type="button" class="adm-btn-xs danger" data-remove-cargo-vid="${idx}">🗑 Remove</button>
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
    const poster = document.getElementById("hero-yt-poster").value.trim() || `[https://i.ytimg.com/vi/$](https://i.ytimg.com/vi/$){ytId}/maxresdefault.jpg`;
    const title = document.getElementById("hero-yt-title").value.trim() || "Istanbul Warehouse & Live Order Packing";

    adminState.publicConfig.heroVideo = { ytId, poster, title };
    try {
      await setDoc(doc(db, "settings", "public_config"), { heroVideo: adminState.publicConfig.heroVideo }, { merge: true });
      showAdminToast("✓ Hero Showroom Video saved to live config!");
    } catch (err) {
      showAdminToast(`Video save error: ${err.message}`);
    }
  });

  document.getElementById("admin-add-cargo-video-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rawUrl = document.getElementById("cargo-vid-url").value.trim();
    const ytId = extractYouTubeId(rawUrl);
    const badge = document.getElementById("cargo-vid-badge").value.trim();
    const title = document.getElementById("cargo-vid-title").value.trim();
    const thumb = document.getElementById("cargo-vid-thumb").value.trim() || `[https://i.ytimg.com/vi/$](https://i.ytimg.com/vi/$){ytId}/hqdefault.jpg`;

    if (!Array.isArray(adminState.publicConfig.cargoVideos)) {
      adminState.publicConfig.cargoVideos = [];
    }
    adminState.publicConfig.cargoVideos.unshift({ ytId, badge, title, thumb });

    try {
      await setDoc(doc(db, "settings", "public_config"), { cargoVideos: adminState.publicConfig.cargoVideos }, { merge: true });
      renderCargoVideosTable();
      e.target.reset();
      showAdminToast("✓ Cargo review video added!");
    } catch (err) {
      showAdminToast(`Save error: ${err.message}`);
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
      showAdminToast("Video removed.");
    } catch (err) {
      showAdminToast(`Remove error: ${err.message}`);
    }
  });
}

/* ==========================================================================
   14. TAB 6: GLOBAL LIVE SETTINGS, GOOGLE ADS, GEMINI ROTATOR & GITHUB
   ========================================================================== */
async function loadSettingsFromFirestore() {
  // 1. Load `settings/public_config`
  try {
    const pubSnap = await getDoc(doc(db, "settings", "public_config"));
    if (pubSnap.exists()) {
      adminState.publicConfig = { ...adminState.publicConfig, ...pubSnap.data() };
    }
  } catch (e) {}

  // 2. Load `settings/admin_secrets` (with fallback check on `settings/private_keys`)
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
  if (badge) badge.textContent = `${keysArr.length} Keys Configured`;
}

async function handleSaveGlobalSettings(e) {
  e.preventDefault();
  const btn = document.getElementById("btn-save-global-settings");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Saving Global Settings to Firestore...";
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
    showAdminToast("✓ Live WhatsApp, Google Ads & Gemini Rotator settings saved globally!");
  } catch (err) {
    showAdminToast(`Settings save error: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "💾 Save All Global Settings to Firestore";
    }
  }
}

async function testAllGeminiKeysHealth() {
  const keys = getActiveGeminiKeys();
  const logBox = document.getElementById("gemini-diagnostic-log");
  if (!logBox) return;

  logBox.style.display = "block";
  if (keys.length === 0) {
    logBox.textContent = "❌ No Gemini API keys entered in the box above.";
    return;
  }

  logBox.textContent = `🩺 Testing ${keys.length} Gemini API Key(s)...\n`;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const masked = `${key.slice(0, 8)}...${key.slice(-4)}`;
    const url = `[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$){encodeURIComponent(key)}`;
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
        logBox.textContent += `✅ Key #${i + 1} (${masked}): HEALTHY (${ms} ms)\n`;
      } else {
        logBox.textContent += `⚠️ Key #${i + 1} (${masked}): HTTP ${res.status}\n`;
      }
    } catch (err) {
      logBox.textContent += `❌ Key #${i + 1} (${masked}): ${err.message}\n`;
    }
  }
}

async function testGitHubConnection() {
  const token = document.getElementById("cfg-github-token")?.value.trim();
  const repo = document.getElementById("cfg-github-repo")?.value.trim();
  if (!token || !repo) {
    showAdminToast("Please enter both GitHub Token and Repository (owner/repo) first.");
    return;
  }

  try {
    const res = await fetch(`[https://api.github.com/repos/$](https://api.github.com/repos/$){repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    showAdminToast(`✓ Connected to GitHub Repo: ${data.full_name} (Default branch: ${data.default_branch})`);
  } catch (err) {
    showAdminToast(`GitHub Connection Failed: ${err.message}`);
  }
}

function bindSettingsEvents() {
  document.getElementById("admin-global-settings-form")?.addEventListener("submit", handleSaveGlobalSettings);
  document.getElementById("btn-test-gemini-keys")?.addEventListener("click", testAllGeminiKeysHealth);
  document.getElementById("btn-test-github-conn")?.addEventListener("click", testGitHubConnection);

  document.getElementById("cfg-gemini-keys")?.addEventListener("input", () => {
    const keys = getActiveGeminiKeys();
    const badge = document.getElementById("gemini-key-count-badge");
    if (badge) badge.textContent = `${keys.length} Keys Configured`;
  });

  document.getElementById("btn-push-sitemap-robots")?.addEventListener("click", async () => {
    try {
      showAdminToast("Building & pushing sitemap.xml and robots.txt to GitHub...");
      await buildAndPushSitemapAndRobots();
      showAdminToast("✓ sitemap.xml & robots.txt pushed to GitHub successfully!");
    } catch (err) {
      showAdminToast(`Sitemap push error: ${err.message}`);
    }
  });
}

/* ==========================================================================
   15. INITIALIZE EXECUTIVE ADMIN SUITE
   ========================================================================== */
function initAdminSuite() {
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
