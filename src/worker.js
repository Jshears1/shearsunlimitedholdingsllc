var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var ADMIN_PASSWORD = "ShearsAdmin2026!";
var DANDH_PASSWORD = "DandHCatalog2026!";
var JWT_SECRET = "ShearsJWT2026SecretKey!ChangeMe";

// ── Rate limiting (in-memory per isolate) ─────────────────────────────────────
var _rl = new Map();
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  let e = _rl.get(key) || { n: 0, r: now + windowMs };
  if (now > e.r) { e.n = 0; e.r = now + windowMs; }
  e.n++;
  _rl.set(key, e);
  return e.n > max;
}

// ── Input sanitization ────────────────────────────────────────────────────────
function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, "").trim();
}
function sanitizeObj(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = typeof v === "string" ? sanitize(v) : v;
  }
  return out;
}
var PRINTIFY_SHOP_ID = "27484320";
var PRINTIFY_BASE = "https://api.printify.com/v1";
var AMAZON_REF = 0.15;
var AMAZON_FBA = 3.5;
async function printifyFetch(path, env, opts = {}) {
  const res = await fetch(`${PRINTIFY_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
      "Content-Type": "application/json",
      ...opts.headers || {}
    }
  });
  if (!res.ok) throw new Error(`Printify ${res.status}: ${await res.text()}`);
  return res.json();
}
__name(printifyFetch, "printifyFetch");
async function syncPrintifyProducts(env) {
  const data = await printifyFetch(`/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50`, env);
  const products = data.data || [];
  let synced = 0, errors = 0;
  for (const p of products) {
    try {
      const variant = (p.variants || []).find((v) => v.is_enabled) || p.variants?.[0];
      const price = variant ? variant.price / 100 : 0;
      const imageUrl = p.images?.[0]?.src || "";
      const tag = "Print-on-Demand";
      const existing = await env.DB.prepare(
        "SELECT id FROM products WHERE title=? AND category='pod'"
      ).bind(p.title).first();
      if (existing) {
        await env.DB.prepare(
          "UPDATE products SET description=?,price=?,image_url=?,tag=?,active=1,emoji=?,color=? WHERE id=?"
        ).bind(p.description || "", price, imageUrl, tag, "\u{1F455}", "#F5F0FF", existing.id).run();
      } else {
        await env.DB.prepare(
          "INSERT INTO products (title,description,price,category,emoji,color,tag,badge,stripe_link,paypal_link,image_url,active) VALUES (?,?,?,'pod','\u{1F455}','#F5F0FF','Print-on-Demand','','','',?,1)"
        ).bind(p.title, p.description || "", price, imageUrl).run();
      }
      synced++;
    } catch (e) {
      errors++;
    }
  }
  return { synced, errors, total: products.length };
}
__name(syncPrintifyProducts, "syncPrintifyProducts");
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};
var j = /* @__PURE__ */ __name((d, s = 200) => new Response(JSON.stringify(d), {
  status: s,
  headers: { ...CORS, "Content-Type": "application/json" }
}), "j");
async function hashPassword(pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" }, key, 256);
  return b64(salt) + ":" + b64(new Uint8Array(bits));
}
__name(hashPassword, "hashPassword");
async function checkPassword(pw, stored) {
  const [sb, hb] = stored.split(":");
  const salt = Uint8Array.from(atob(sb), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", enc(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" }, key, 256);
  return b64(new Uint8Array(bits)) === hb;
}
__name(checkPassword, "checkPassword");
async function signJWT(payload) {
  const data = btoa(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1e3 }));
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc(data));
  return data + "." + b64(new Uint8Array(sig));
}
__name(signJWT, "signJWT");
async function verifyJWT(token) {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  try {
    const key = await hmacKey();
    const sigBuf = Uint8Array.from(atob(sig), (c) => c.charCodeAt(0));
    const ok = await crypto.subtle.verify("HMAC", key, sigBuf, enc(data));
    if (!ok) return null;
    const p = JSON.parse(atob(data));
    if (p.exp && Date.now() > p.exp) return null;
    return p;
  } catch {
    return null;
  }
}
__name(verifyJWT, "verifyJWT");
async function hmacKey() {
  return crypto.subtle.importKey("raw", enc(JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
__name(hmacKey, "hmacKey");
function enc(s) {
  return new TextEncoder().encode(s);
}
__name(enc, "enc");
function b64(u) {
  return btoa(String.fromCharCode(...u));
}
__name(b64, "b64");
async function getUserFromReq(req) {
  const auth = req.headers.get("Authorization") || "";
  return verifyJWT(auth.replace("Bearer ", ""));
}
__name(getUserFromReq, "getUserFromReq");
function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
}
__name(slug, "slug");
function makeSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
__name(makeSlug, "makeSlug");
var _tok = null;
var _exp = 0;
async function dandhToken(env) {
  if (_tok && Date.now() < _exp) return _tok;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.DANDH_CLIENT_ID,
    client_secret: env.DANDH_CLIENT_SECRET,
    scope: "resource.READ"
  });
  const r = await fetch("https://auth.dandh.com/api/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  if (!r.ok) throw new Error("D&H auth " + r.status + ": " + await r.text());
  const d = await r.json();
  _tok = d.access_token;
  _exp = Date.now() + ((d.expires_in || 3600) - 60) * 1e3;
  return _tok;
}
__name(dandhToken, "dandhToken");
function profit(cost, map) {
  const sell = map > 0 ? map : cost * 1.4;
  const net = sell - cost - sell * AMAZON_REF - AMAZON_FBA;
  return { sell: +sell.toFixed(2), net: +net.toFixed(2), margin: +(net / sell * 100).toFixed(1) };
}
__name(profit, "profit");
var worker_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    const meth = req.method;
    if (meth === "OPTIONS") return new Response(null, { headers: CORS });

    // ── Rate limiting ─────────────────────────────────────────────────────────
    const ip = req.headers.get("CF-Connecting-IP") || "unknown";
    if (path.startsWith("/api/") && rateLimit(`ip:${ip}`, 100, 60000)) {
      return j({ error: "Too many requests. Please slow down." }, 429);
    }
    if (path === "/api/checkout/session" && rateLimit(`checkout:${ip}`, 5, 60000)) {
      return j({ error: "Too many checkout attempts. Please wait a moment." }, 429);
    }
    if (path === "/api/settings" && meth === "GET") {
      const { results } = await env.DB.prepare("SELECT key,value FROM site_settings").all();
      const s = {};
      results.forEach((r) => s[r.key] = r.value);
      return j(s);
    }
    if (path === "/api/auth/signup" && meth === "POST") {
      const { email, password, name } = await req.json();
      if (!email || !password || !name) return j({ error: "All fields required" }, 400);
      if (password.length < 8) return j({ error: "Password must be at least 8 characters" }, 400);
      const existing = await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email.toLowerCase()).first();
      if (existing) return j({ error: "An account with this email already exists" }, 409);
      const hash = await hashPassword(password);
      const { meta } = await env.DB.prepare(
        "INSERT INTO users (email,name,password_hash,role) VALUES (?,?,?,'user')"
      ).bind(email.toLowerCase(), name, hash).run();
      const token = await signJWT({ userId: meta.last_row_id, email: email.toLowerCase(), name, role: "user" });
      return j({ success: true, token, user: { id: meta.last_row_id, email, name, role: "user" } });
    }
    if (path === "/api/auth/login" && meth === "POST") {
      const { email, password } = await req.json();
      if (!email || !password) return j({ error: "Email and password required" }, 400);
      const user = await env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email.toLowerCase()).first();
      if (!user) return j({ error: "Invalid email or password" }, 401);
      const ok = await checkPassword(password, user.password_hash);
      if (!ok) return j({ error: "Invalid email or password" }, 401);
      const token = await signJWT({ userId: user.id, email: user.email, name: user.name, role: user.role });
      return j({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }
    if (path === "/api/auth/me" && meth === "GET") {
      const u = await getUserFromReq(req);
      if (!u) return j({ error: "Unauthorized" }, 401);
      return j({ user: u });
    }
    if (path === "/api/products" && meth === "GET") {
      const category = url.searchParams.get("category");
      const search = url.searchParams.get("search");
      let query = "SELECT * FROM products WHERE active=1";
      const binds = [];
      if (category && category !== "all") { query += " AND category=?"; binds.push(category); }
      if (search) { query += " AND title LIKE ?"; binds.push(`%${search}%`); }
      query += " ORDER BY category,id";
      const { results } = await env.DB.prepare(query).bind(...binds).all();
      return j(results);
    }
    if (path.match(/^\/api\/products\/([^/]+)$/) && meth === "GET") {
      const idOrSlug = path.split("/").pop();
      const isNumeric = /^\d+$/.test(idOrSlug);
      const product = isNumeric
        ? await env.DB.prepare("SELECT * FROM products WHERE id=? AND active=1").bind(idOrSlug).first()
        : await env.DB.prepare("SELECT * FROM products WHERE slug=? AND active=1").bind(idOrSlug).first();
      if (!product) return j({ error: "Product not found" }, 404);
      return j(product);
    }
    if (path === "/api/webhooks/stripe" && meth === "POST") {
      const rawBody = await req.text();
      const sig = req.headers.get("stripe-signature") || "";
      if (env.STRIPE_WEBHOOK_SECRET && sig) {
        try {
          const parts = sig.split(",");
          const ts = (parts.find((p) => p.startsWith("t=")) || "").slice(2);
          const v1 = (parts.find((p) => p.startsWith("v1=")) || "").slice(3);
          const payload = `${ts}.${rawBody}`;
          const key = await crypto.subtle.importKey("raw", enc(env.STRIPE_WEBHOOK_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
          const mac = await crypto.subtle.sign("HMAC", key, enc(payload));
          const expected = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
          if (expected !== v1) return j({ error: "Invalid webhook signature" }, 400);
        } catch {
          return j({ error: "Webhook verification failed" }, 400);
        }
      }
      let event;
      try { event = JSON.parse(rawBody); } catch { return j({ error: "Invalid JSON" }, 400); }
      if (event.type === "payment_intent.succeeded") {
        const pi = event.data.object;
        const existing = await env.DB.prepare("SELECT order_number FROM orders WHERE payment_intent_id=?").bind(pi.id).first();
        if (!existing && pi.metadata) {
          const orderNumber = "SU-" + Date.now().toString(36).toUpperCase();
          let items = [];
          try { items = JSON.parse(pi.metadata.items || "[]"); } catch {}
          const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
          const hasPhysical = items.some((i) => i.category === "physical" || i.category === "pod");
          const shippingCost = hasPhysical ? 7.99 : 0;
          const tax = +(subtotal * 0.08).toFixed(2);
          const total = +(subtotal + shippingCost + tax).toFixed(2);
          try {
            await env.DB.prepare(
              "INSERT OR IGNORE INTO orders (order_number,customer_email,customer_name,items,subtotal,tax,shipping_cost,total,status,payment_intent_id,shipping_address,billing_address) VALUES (?,?,?,?,?,?,?,?,'processing',?,?,?)"
            ).bind(
              orderNumber, pi.metadata.customer_email || pi.receipt_email || "", pi.metadata.customer_name || "",
              pi.metadata.items || "[]", +subtotal.toFixed(2), tax, shippingCost, total, pi.id,
              pi.metadata.shipping_address || "{}", pi.metadata.billing_address || "{}"
            ).run();
          } catch {}
        }
      }
      return j({ received: true });
    }
    if (path === "/api/stripe/config" && meth === "GET") {
      return j({ publishableKey: env.STRIPE_PUBLISHABLE_KEY || "" });
    }
    if (path === "/api/checkout/session" && meth === "POST") {
      if (!env.STRIPE_SECRET_KEY) return j({ error: "Stripe not configured" }, 503);
      const { items, email, name, shipping, billing } = await req.json();
      if (!items?.length || !email) return j({ error: "Cart and email required" }, 400);
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const hasPhysical = items.some((i) => i.category === "physical" || i.category === "pod");
      const shippingCost = hasPhysical ? 7.99 : 0;
      const tax = +(subtotal * 0.08).toFixed(2);
      const total = +(subtotal + shippingCost + tax).toFixed(2);
      const params = new URLSearchParams();
      params.set("amount", String(Math.round(total * 100)));
      params.set("currency", "usd");
      params.set("receipt_email", email);
      params.set("metadata[customer_email]", email);
      params.set("metadata[customer_name]", name || "");
      params.set("metadata[items]", JSON.stringify(items.map((i) => ({ id: i.id, title: i.title, qty: i.quantity, price: i.price }))));
      if (shipping) params.set("metadata[shipping_address]", JSON.stringify(shipping));
      if (billing) params.set("metadata[billing_address]", JSON.stringify(billing));
      const res = await fetch("https://api.stripe.com/v1/payment_intents", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      });
      const pi = await res.json();
      if (pi.error) return j({ error: pi.error.message }, 400);
      return j({ clientSecret: pi.client_secret, total, subtotal, tax, shippingCost });
    }
    if (path === "/api/checkout/complete" && meth === "POST") {
      if (!env.STRIPE_SECRET_KEY) return j({ error: "Stripe not configured" }, 503);
      const { paymentIntentId, items, shipping, billing, email, name } = await req.json();
      if (!paymentIntentId) return j({ error: "Payment intent required" }, 400);
      const res = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
        headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
      });
      const pi = await res.json();
      if (pi.error || pi.status !== "succeeded") return j({ error: "Payment not confirmed" }, 400);
      const existing = await env.DB.prepare("SELECT order_number FROM orders WHERE payment_intent_id=?").bind(paymentIntentId).first();
      if (existing) return j({ success: true, order_number: existing.order_number });
      const orderNumber = "SU-" + Date.now().toString(36).toUpperCase();
      const subtotal = (items || []).reduce((s, i) => s + i.price * i.quantity, 0);
      const hasPhysical = (items || []).some((i) => i.category === "physical" || i.category === "pod");
      const shippingCost = hasPhysical ? 7.99 : 0;
      const tax = +(subtotal * 0.08).toFixed(2);
      const total = +(subtotal + shippingCost + tax).toFixed(2);
      await env.DB.prepare(
        "INSERT INTO orders (order_number,customer_email,customer_name,items,subtotal,tax,shipping_cost,total,status,payment_intent_id,shipping_address,billing_address) VALUES (?,?,?,?,?,?,?,?,'processing',?,?,?)"
      ).bind(
        orderNumber, email || pi.receipt_email || "", name || "",
        JSON.stringify(items || []),
        +subtotal.toFixed(2), tax, shippingCost, total,
        paymentIntentId,
        JSON.stringify(shipping || {}),
        JSON.stringify(billing || {})
      ).run();
      return j({ success: true, order_number: orderNumber });
    }
    if (path === "/api/contact" && meth === "POST") {
      const raw = await req.json();
      const { name, email, subject, message } = sanitizeObj(raw);
      if (!name || !email || !message) return j({ error: "Name, email and message required" }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return j({ error: "Invalid email address" }, 400);
      await env.DB.prepare(
        "INSERT INTO contact_messages (name,email,subject,message) VALUES (?,?,?,?)"
      ).bind(name, email, subject || "", message).run();
      return j({ success: true });
    }
    if (path === "/api/blog" && meth === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT id,title,slug,excerpt,external_url,source,tag,author_name,created_at FROM blog_posts WHERE status='published' ORDER BY created_at DESC"
      ).all();
      return j(results);
    }
    if (path.startsWith("/api/blog/") && meth === "GET") {
      const u = await getUserFromReq(req);
      if (!u) return j({ error: "Login required to read full posts" }, 401);
      const postSlug = path.replace("/api/blog/", "");
      const post = await env.DB.prepare(
        "SELECT * FROM blog_posts WHERE slug=? AND status='published'"
      ).bind(postSlug).first();
      if (!post) return j({ error: "Post not found" }, 404);
      return j(post);
    }
    if (path === "/api/blog" && meth === "POST") {
      const u = await getUserFromReq(req);
      if (!u) return j({ error: "Login required" }, 401);
      const p = await req.json();
      if (!p.title) return j({ error: "Title required" }, 400);
      const postSlug = slug(p.title);
      const status = u.role === "admin" ? "published" : "pending";
      await env.DB.prepare(
        `INSERT INTO blog_posts (user_id,author_name,title,slug,excerpt,content,external_url,source,tag,status)
                                 VALUES (?,?,?,?,?,?,?,?,?,?)`
      ).bind(
        u.userId,
        u.name,
        p.title,
        postSlug,
        p.excerpt || "",
        p.content || "",
        p.external_url || "",
        p.source || "internal",
        p.tag || "",
        status
      ).run();
      return j({ success: true, status, message: status === "pending" ? "Your post has been submitted for review!" : "Post published!" });
    }
    if (path === "/api/admin/login" && meth === "POST") {
      const { password } = await req.json();
      return password === ADMIN_PASSWORD ? j({ success: true, token: ADMIN_PASSWORD }) : j({ success: false, error: "Wrong password" }, 401);
    }
    if (path === "/api/dandh/login" && meth === "POST") {
      const { password } = await req.json();
      return password === DANDH_PASSWORD ? j({ success: true, token: DANDH_PASSWORD }) : j({ success: false, error: "Wrong password" }, 401);
    }
    if (path.startsWith("/api/admin/")) {
      const adminAuth = (req.headers.get("Authorization") || "").replace("Bearer ", "");
      if (adminAuth !== ADMIN_PASSWORD) return j({ error: "Unauthorized" }, 401);
      if (path === "/api/admin/products" && meth === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY category,id").all();
        return j(results);
      }
      if (path === "/api/admin/products" && meth === "POST") {
        const raw = await req.json();
        const p = sanitizeObj(raw);
        if (!p.title || !p.price || isNaN(parseFloat(p.price))) return j({ error: "Title and price required" }, 400);
        const { meta } = await env.DB.prepare(
          `INSERT INTO products (title,description,price,category,emoji,color,tag,badge,stripe_link,paypal_link,image_url,active)
                                               VALUES (?,?,?,?,?,?,?,?,?,?,?,1)`
        ).bind(
          p.title, p.description, p.price, p.category,
          p.emoji || "\u{1F4E6}", p.color || "#F5F5F5",
          p.tag || "", p.badge || "",
          p.stripe_link || "", p.paypal_link || "", p.image_url || ""
        ).run();
        const newId = meta.last_row_id;
        try {
          const slugBase = makeSlug(p.title);
          const existing = await env.DB.prepare("SELECT id FROM products WHERE slug=? AND id!=?").bind(slugBase, newId).first();
          const finalSlug = existing ? `${slugBase}-${newId}` : slugBase;
          await env.DB.prepare("UPDATE products SET slug=? WHERE id=?").bind(finalSlug, newId).run();
        } catch {}
        return j({ success: true, id: newId });
      }
      const prodM = path.match(/^\/api\/admin\/products\/(\d+)$/);
      if (prodM && meth === "PUT") {
        const p = sanitizeObj(await req.json());
        const prodId = prodM[1];
        let updSlug = null;
        try {
          const slugBase = makeSlug(p.title);
          const existing = await env.DB.prepare("SELECT id FROM products WHERE slug=? AND id!=?").bind(slugBase, prodId).first();
          updSlug = existing ? `${slugBase}-${prodId}` : slugBase;
        } catch {}
        if (updSlug) {
          await env.DB.prepare(
            `UPDATE products SET title=?,description=?,price=?,category=?,emoji=?,color=?,tag=?,badge=?,stripe_link=?,paypal_link=?,image_url=?,slug=?,active=? WHERE id=?`
          ).bind(
            p.title, p.description, p.price, p.category,
            p.emoji, p.color, p.tag, p.badge,
            p.stripe_link, p.paypal_link, p.image_url || "",
            updSlug, p.active ? 1 : 0, prodId
          ).run();
        } else {
          await env.DB.prepare(
            `UPDATE products SET title=?,description=?,price=?,category=?,emoji=?,color=?,tag=?,badge=?,stripe_link=?,paypal_link=?,image_url=?,active=? WHERE id=?`
          ).bind(
            p.title, p.description, p.price, p.category,
            p.emoji, p.color, p.tag, p.badge,
            p.stripe_link, p.paypal_link, p.image_url || "",
            p.active ? 1 : 0, prodId
          ).run();
        }
        return j({ success: true });
      }
      if (prodM && meth === "DELETE") {
        await env.DB.prepare("DELETE FROM products WHERE id=?").bind(prodM[1]).run();
        return j({ success: true });
      }
      if (path === "/api/admin/upload-image" && meth === "POST") {
        const fd = await req.formData();
        const file = fd.get("image");
        if (!file) return j({ error: "No file" }, 400);
        const ext = file.name.split(".").pop().toLowerCase();
        if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return j({ error: "Invalid file type" }, 400);
        const key = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        await env.IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
        return j({ success: true, url: `/api/images/${key}` });
      }
      if (path === "/api/admin/blog" && meth === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM blog_posts ORDER BY created_at DESC").all();
        return j(results);
      }
      const blogM = path.match(/^\/api\/admin\/blog\/(\d+)\/approve$/);
      if (blogM && meth === "PUT") {
        await env.DB.prepare("UPDATE blog_posts SET status='published' WHERE id=?").bind(blogM[1]).run();
        return j({ success: true });
      }
      const blogDel = path.match(/^\/api\/admin\/blog\/(\d+)$/);
      if (blogDel && meth === "DELETE") {
        await env.DB.prepare("DELETE FROM blog_posts WHERE id=?").bind(blogDel[1]).run();
        return j({ success: true });
      }
      if (path === "/api/admin/users" && meth === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT id,email,name,role,created_at FROM users ORDER BY created_at DESC"
        ).all();
        return j(results);
      }
      if (path === "/api/admin/users/export" && meth === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT email,name,role,created_at FROM users ORDER BY created_at DESC"
        ).all();
        const csv = "Email,Name,Role,Joined\n" + results.map((u) => `"${u.email}","${u.name}","${u.role}","${u.created_at}"`).join("\n");
        return new Response(csv, { headers: { ...CORS, "Content-Type": "text/csv", "Content-Disposition": "attachment;filename=users.csv" } });
      }
      if (path === "/api/admin/settings" && meth === "GET") {
        const { results } = await env.DB.prepare("SELECT key,value FROM site_settings").all();
        const s = {};
        results.forEach((r) => s[r.key] = r.value);
        return j(s);
      }
      if (path === "/api/admin/settings" && meth === "POST") {
        const settings = await req.json();
        for (const [key, value] of Object.entries(settings)) {
          await env.DB.prepare("INSERT OR REPLACE INTO site_settings (key,value) VALUES (?,?)").bind(key, value).run();
        }
        return j({ success: true });
      }
      if (path === "/api/admin/printify/sync" && meth === "POST") {
        try {
          const result = await syncPrintifyProducts(env);
          return j({ success: true, ...result });
        } catch (e) {
          return j({ error: "Printify sync failed: " + e.message }, 502);
        }
      }
      if (path === "/api/admin/printify/products" && meth === "GET") {
        try {
          const data = await printifyFetch(`/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50`, env);
          return j(data);
        } catch (e) {
          return j({ error: e.message }, 502);
        }
      }
      if (path === "/api/admin/contacts" && meth === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC").all();
        return j(results);
      }
      if (path === "/api/admin/migrate" && meth === "POST") {
        await env.DB.exec("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_number TEXT UNIQUE, customer_email TEXT NOT NULL, customer_name TEXT, items TEXT, subtotal REAL, tax REAL, shipping_cost REAL, total REAL, status TEXT DEFAULT 'processing', payment_intent_id TEXT, shipping_address TEXT, billing_address TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
        await env.DB.exec("CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email)");
        await env.DB.exec("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)");
        await env.DB.exec("CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)");
        return j({ success: true, message: "Orders table ready" });
      }
      if (path === "/api/admin/migrate-slugs" && meth === "POST") {
        try { await env.DB.exec("ALTER TABLE products ADD COLUMN slug TEXT"); } catch {}
        const { results } = await env.DB.prepare("SELECT id, title FROM products WHERE slug IS NULL OR slug = ''").all();
        let updated = 0;
        for (const p of results) {
          const base = makeSlug(p.title);
          const existing = await env.DB.prepare("SELECT id FROM products WHERE slug=? AND id!=?").bind(base, p.id).first();
          const s = existing ? `${base}-${p.id}` : base;
          await env.DB.prepare("UPDATE products SET slug=? WHERE id=?").bind(s, p.id).run();
          updated++;
        }
        return j({ success: true, updated });
      }
      if (path === "/api/admin/orders" && meth === "GET") {
        const status = url.searchParams.get("status");
        let query = "SELECT * FROM orders";
        const binds = [];
        if (status) { query += " WHERE status=?"; binds.push(status); }
        query += " ORDER BY created_at DESC";
        const { results } = await env.DB.prepare(query).bind(...binds).all();
        return j(results);
      }
      const orderM = path.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
      if (orderM && meth === "PUT") {
        const { status } = await req.json();
        await env.DB.prepare("UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE order_number=?").bind(status, orderM[1]).run();
        return j({ success: true });
      }
    }
    if (path.startsWith("/api/images/")) {
      const key = path.replace("/api/images/", "");
      const obj = await env.IMAGES.get(key);
      if (!obj) return new Response("Not found", { status: 404 });
      const h = new Headers();
      obj.writeHttpMetadata(h);
      h.set("Cache-Control", "public,max-age=31536000");
      return new Response(obj.body, { headers: h });
    }
    if (path === "/api/dandh/catalog" && meth === "POST") {
      const adminAuth = (req.headers.get("Authorization") || "").replace("Bearer ", "");
      if (adminAuth !== DANDH_PASSWORD) return j({ error: "Unauthorized" }, 401);
      const filters = await req.json();
      let tok;
      try {
        tok = await dandhToken(env);
      } catch (e) {
        return j({ error: "D&H auth failed \u2014 " + e.message }, 502);
      }
      const account = env.DANDH_ACCOUNT || "3310440000";
      const params = new URLSearchParams({ pageSize: "100", itemType: "Merchandise" });
      if (filters.scrollId) params.set("scrollId", filters.scrollId);
      const dr = await fetch(`https://api.dandh.com/catalog/v1/customers/${account}/items?${params}`, {
        headers: {
          Authorization: `Bearer ${tok}`,
          "accept": "application/json",
          "dandh-tenant": "dhus"
        }
      });
      if (!dr.ok) {
        const t = await dr.text();
        return j({ error: `D&H ${dr.status}: ${t}` }, dr.status);
      }
      const raw = await dr.json();
      const elements = raw.elements || raw.items || raw || [];
      const kw = (filters.keyword || "").toLowerCase();
      const brand = (filters.brand || "").toLowerCase();
      let items = elements.map((p) => {
        const cost = parseFloat(p.approximatePrice || p.yourCost || p.price || 0);
        const erp = parseFloat(p.estimatedRetailPrice || p.retailPrice || 0);
        const map = parseFloat(p.minimumAdvertisedPrice || p.mapPrice || 0);
        const sell = map > 0 ? map : (erp > 0 ? erp : cost * 1.4);
        const net = +(sell - cost).toFixed(2);
        const margin = sell > 0 ? +(net / sell * 100).toFixed(1) : 0;
        const dims = p.shippingDimensions || {};
        const weight = parseFloat(dims.weight || p.weight || 0);
        const upc = p.universalProductCode || p.upc || "";
        return {
          sku: p.itemId || p.vendorItemId || p.sku || "",
          title: p.description || p.title || p.name || "",
          brand: p.vendorName || p.manufacturer || p.brand || "",
          upc,
          cost: +cost.toFixed(2),
          map: +map.toFixed(2),
          sell: +sell.toFixed(2),
          net,
          margin,
          weight,
          condition: "New",
          inStock: p.itemStatus === "active" || p.availability === "instock",
          image: p.imageUrl || p.image || "",
          category: p.category || "",
          hasUpc: !!(upc && upc.length > 5 && upc !== "000000000000"),
          isPhysical: weight > 0,
          hasMap: map > 0
        };
      });
      // Client-side keyword/brand filter
      if (kw) items = items.filter(p => p.title.toLowerCase().includes(kw) || p.brand.toLowerCase().includes(kw) || p.sku.toLowerCase().includes(kw));
      if (brand) items = items.filter(p => p.brand.toLowerCase().includes(brand));
      if (filters.hasUpcOnly) items = items.filter((p) => p.hasUpc);
      if (filters.physicalOnly) items = items.filter((p) => p.isPhysical);
      if (filters.mapOnly) items = items.filter((p) => p.hasMap);
      if (filters.inStockOnly) items = items.filter((p) => p.inStock);
      if (filters.maxCost) items = items.filter((p) => p.cost <= +filters.maxCost);
      if (filters.minCost) items = items.filter((p) => p.cost >= +filters.minCost);
      if (filters.minProfit) items = items.filter((p) => p.net >= +filters.minProfit);
      if (filters.minMargin) items = items.filter((p) => p.margin >= +filters.minMargin);
      if (filters.maxWeight) items = items.filter((p) => p.weight <= +filters.maxWeight);
      if (filters.minWeight) items = items.filter((p) => p.weight >= +filters.minWeight);
      return j({ total: items.length, items, hasNext: raw.hasNext || false, scrollId: raw.scrollId || null });
    }
    // ── Sitemap ───────────────────────────────────────────────────────────────
    if (path === "/robots.txt" && meth === "GET") {
      const txt = `User-agent: *\nAllow: /\n\nSitemap: https://www.shearsunlimitedholdingsllc.com/sitemap.xml\n`;
      return new Response(txt, { headers: { "Content-Type": "text/plain" } });
    }

    if (path === "/sitemap.xml" && meth === "GET") {
      const { results } = await env.DB.prepare("SELECT id,title,slug FROM products WHERE active=1").all();
      const base = "https://www.shearsunlimitedholdingsllc.com";
      const staticUrls = ["/", "/shop"].map(u =>
        `<url><loc>${base}${u}</loc><changefreq>weekly</changefreq><priority>${u === "/" ? "1.0" : "0.8"}</priority></url>`
      ).join("\n  ");
      const productUrls = results.map(p =>
        `<url><loc>${base}/product/${p.slug || p.id}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
      ).join("\n  ");
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${staticUrls}\n  ${productUrls}\n</urlset>`;
      return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public,max-age=3600" } });
    }

    if (meth === "GET" && !path.startsWith("/api/") && /^\/google[a-f0-9]+\.html$/.test(path)) {
      return env.ASSETS.fetch(req);
    }
    if (meth === "GET" && !path.startsWith("/api/")) {
      // Redirect numeric product IDs to slug URLs for canonical SEO
      const numericProductMatch = path.match(/^\/product\/(\d+)$/);
      if (numericProductMatch) {
        const base = "https://www.shearsunlimitedholdingsllc.com";
        const prod = await env.DB.prepare("SELECT slug FROM products WHERE id=? AND active=1").bind(numericProductMatch[1]).first();
        if (prod?.slug) {
          return Response.redirect(`${base}/product/${prod.slug}`, 301);
        }
      }

      // Always fetch /index.html using an absolute URL to avoid relative-path issues
      const indexUrl = new URL("/index.html", req.url).href;
      let htmlRes = await env.ASSETS.fetch(new Request(indexUrl, { headers: req.headers }));
      if (!htmlRes.ok) htmlRes = await env.ASSETS.fetch(req);
      if (!htmlRes.ok) return htmlRes;

      // ── SEO meta injection ─────────────────────────────────────────────────
      const base = "https://www.shearsunlimitedholdingsllc.com";
      let title = "Shears Unlimited Holdings LLC | Shop Physical & Digital Products";
      let description = "Browse and shop physical products, digital downloads, and print-on-demand items at Shears Unlimited Holdings LLC.";
      let schema = null;
      let extraSchema = null;

      const productMatch = path.match(/^\/product\/([^/]+)$/);
      if (productMatch) {
        const idOrSlug = productMatch[1];
        const isNumeric = /^\d+$/.test(idOrSlug);
        const prod = isNumeric
          ? await env.DB.prepare("SELECT * FROM products WHERE id=? AND active=1").bind(idOrSlug).first()
          : await env.DB.prepare("SELECT * FROM products WHERE slug=? AND active=1").bind(idOrSlug).first();
        if (prod) {
          title = `${prod.title} | Shears Unlimited Holdings LLC`;
          const plainDesc = prod.description
            ? prod.description
                .replace(/<table[\s\S]*?<\/table>/gi, " ")
                .replace(/<[^>]+>/g, " ")
                .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#?[a-z0-9]+;/gi, " ")
                .replace(/\s+/g, " ").trim()
            : "";
          description = plainDesc ? plainDesc.slice(0, 155) : `Buy ${prod.title} at Shears Unlimited Holdings LLC.`;
          const canonicalSlug = prod.slug || prod.id;
          const productUrl = `${base}/product/${canonicalSlug}`;
          const productSchema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": prod.title,
            "description": prod.description || "",
            "image": prod.image_url || "",
            "offers": {
              "@type": "Offer",
              "price": prod.price.toFixed(2),
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "url": productUrl
            }
          };
          const breadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": base },
              { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${base}/shop` },
              { "@type": "ListItem", "position": 3, "name": prod.title, "item": productUrl }
            ]
          };
          schema = JSON.stringify(productSchema);
          extraSchema = JSON.stringify(breadcrumbSchema);
        }
      } else if (path === "/shop") {
        title = "Shop All Products | Shears Unlimited Holdings LLC";
        description = "Browse our full selection of physical products, digital downloads, and print-on-demand items.";
      } else if (path === "/") {
        schema = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Shears Unlimited Holdings LLC",
          "url": base,
          "description": "A diversified holding company focused on strategic investments, business development, and creating lasting value across diverse industries.",
          "contactPoint": { "@type": "ContactPoint", "email": "info@shearsunlimitedholdings.com", "contactType": "customer service" }
        });
      }

      const q = (s) => s.replace(/"/g, '&quot;');
      return new HTMLRewriter()
        .on("title", { element(el) { el.setInnerContent(title); } })
        .on("head", {
          element(el) {
            el.append(`<meta name="google-site-verification" content="LR6VKpE0Ut-7T86jeFjaXa7fHliq1ltasSsnYJCwyXs"><script async src="https://www.googletagmanager.com/gtag/js?id=G-S6CTLYWDTK"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-S6CTLYWDTK');</script><meta name="description" content="${q(description)}"><meta property="og:title" content="${q(title)}"><meta property="og:description" content="${q(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${base}${path}"><link rel="canonical" href="${base}${path}">${schema ? `<script type="application/ld+json">${schema}</script>` : ""}${extraSchema ? `<script type="application/ld+json">${extraSchema}</script>` : ""}`, { html: true });
          }
        })
        .transform(htmlRes);
    }
    return env.ASSETS.fetch(req);
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
