// worker.js - UPDATED VERSION
// Add Stripe checkout, order routing, and remove blog sign-in gate

var ADMIN_PASSWORD = "ShearsAdmin2026!";
var DANDH_PASSWORD = "DandHCatalog2026!";
var JWT_SECRET = "ShearsJWT2026SecretKey!ChangeMe";
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
        ).bind(p.description || "", price, imageUrl, tag, "👕", "#F5F0FF", existing.id).run();
      } else {
        await env.DB.prepare(
          "INSERT INTO products (title,description,price,category,emoji,color,tag,badge,stripe_link,paypal_link,image_url,active) VALUES (?,?,?,'pod','👕','#F5F0FF','Print-on-Demand','','','',?,1)"
        ).bind(p.title, p.description || "", price, imageUrl).run();
      }
      synced++;
    } catch (e) {
      errors++;
    }
  }
  return { synced, errors, total: products.length };
}

var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};

var j = (d, s = 200) => new Response(JSON.stringify(d), {
  status: s,
  headers: { ...CORS, "Content-Type": "application/json" }
});

async function hashPassword(pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" }, key, 256);
  return b64(salt) + ":" + b64(new Uint8Array(bits));
}

async function checkPassword(pw, stored) {
  const [sb, hb] = stored.split(":");
  const salt = Uint8Array.from(atob(sb), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", enc(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" }, key, 256);
  return b64(new Uint8Array(bits)) === hb;
}

async function signJWT(payload) {
  const data = btoa(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1e3 }));
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc(data));
  return data + "." + b64(new Uint8Array(sig));
}

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

async function hmacKey() {
  return crypto.subtle.importKey("raw", enc(JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function enc(s) {
  return new TextEncoder().encode(s);
}

function b64(u) {
  return btoa(String.fromCharCode(...u));
}

async function getUserFromReq(req) {
  const auth = req.headers.get("Authorization") || "";
  return verifyJWT(auth.replace("Bearer ", ""));
}

function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
}

var _tok = null;
var _exp = 0;

async function dandhToken(env) {
  if (_tok && Date.now() < _exp) return _tok;
  const creds = btoa(`${env.DANDH_CLIENT_ID}:${env.DANDH_CLIENT_SECRET}`);
  const r = await fetch("https://api.dandh.com/v1/oauth/token", {
    method: "POST",
    headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials"
  });
  if (!r.ok) throw new Error("D&H auth " + r.status);
  const d = await r.json();
  _tok = d.access_token;
  _exp = Date.now() + (d.expires_in - 60) * 1e3;
  return _tok;
}

function profit(cost, map) {
  const sell = map > 0 ? map : cost * 1.4;
  const net = sell - cost - sell * AMAZON_REF - AMAZON_FBA;
  return { sell: +sell.toFixed(2), net: +net.toFixed(2), margin: +(net / sell * 100).toFixed(1) };
}

// ======== NEW: STRIPE CHECKOUT ENDPOINTS ========

async function handleStripeCheckoutSession(req, env) {
  const { items, email, origin } = await req.json();
  
  if (!items || items.length === 0) {
    return j({ error: "Cart is empty" }, 400);
  }

  if (!email) {
    return j({ error: "Email required" }, 400);
  }

  try {
    // Build line items for Stripe
    const lineItems = items.map((item, idx) => ({
      [`line_items[${idx}][price_data][currency]`]: "usd",
      [`line_items[${idx}][price_data][product_data][name]`]: item.title,
      [`line_items[${idx}][price_data][product_data][description]`]: item.description || item.tag || "",
      [`line_items[${idx}][price_data][unit_amount]`]: Math.round(item.price * 100),
      [`line_items[${idx}][quantity]`]: item.quantity || 1
    })).reduce((acc, obj) => ({ ...acc, ...obj }), {});

    const params = new URLSearchParams({
      ...lineItems,
      "mode": "payment",
      "payment_method_types[0]": "card",
      "success_url": `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      "cancel_url": `${origin}/checkout/cancel`,
      "customer_email": email,
      "billing_address_collection": "required"
    });

    // Call Stripe API
    const auth = btoa(`${env.STRIPE_SECRET_KEY}:`);
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });

    if (!stripeRes.ok) {
      const errText = await stripeRes.text();
      console.error("Stripe error:", errText);
      return j({ error: `Stripe error: ${stripeRes.status}` }, stripeRes.status);
    }

    const session = await stripeRes.json();
    return j({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return j({ error: `Checkout error: ${error.message}` }, 500);
  }
}

async function handleCheckoutComplete(req, env) {
  const { sessionId } = await req.json();

  if (!sessionId) {
    return j({ error: "Session ID required" }, 400);
  }

  try {
    // Verify session with Stripe
    const auth = btoa(`${env.STRIPE_SECRET_KEY}:`);
    const sessionRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: { "Authorization": `Basic ${auth}` }
      }
    );

    if (!sessionRes.ok) {
      return j({ error: "Invalid session" }, 400);
    }

    const session = await sessionRes.json();

    // Create order in database
    const { meta } = await env.DB.prepare(
      `INSERT INTO orders (
        email, name, payment_method, session_id, 
        status, created_at
      ) VALUES (?, ?, ?, ?, 'completed', datetime('now'))`
    ).bind(
      session.customer_email || "unknown@example.com",
      "Customer",
      "stripe",
      sessionId
    ).run();

    const orderId = meta.last_row_id;

    // TODO: Send confirmation email
    // TODO: Route to fulfillment (Printify/D&H)

    return j({
      success: true,
      orderId,
      email: session.customer_email,
      message: "Order received! Check your email for confirmation."
    });
  } catch (error) {
    console.error("Order completion error:", error);
    return j({ error: `Order error: ${error.message}` }, 500);
  }
}

// ======== MAIN WORKER ========

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    const meth = req.method;

    if (meth === "OPTIONS") return new Response(null, { headers: CORS });

    // NEW: Stripe Checkout Endpoints
    if (path === "/api/checkout/session" && meth === "POST") {
      return handleStripeCheckoutSession(req, env);
    }

    if (path === "/api/checkout/complete" && meth === "POST") {
      return handleCheckoutComplete(req, env);
    }

    // ======== PUBLIC API ========

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
      const { results } = await env.DB.prepare(
        "SELECT * FROM products WHERE active=1 ORDER BY category,id"
      ).all();
      return j(results);
    }

    // NEW: Get single product
    const productIdMatch = path.match(/^\/api\/products\/(\d+)$/);
    if (productIdMatch && meth === "GET") {
      const productId = productIdMatch[1];
      const product = await env.DB.prepare(
        "SELECT * FROM products WHERE id=? AND active=1"
      ).bind(productId).first();
      
      if (!product) {
        return j({ error: "Product not found" }, 404);
      }
      
      return j(product);
    }

    if (path === "/api/contact" && meth === "POST") {
      const { name, email, subject, message } = await req.json();
      if (!name || !email || !message) return j({ error: "Name, email and message required" }, 400);
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

    // UPDATED: Remove sign-in gate for blog posts (make public)
    if (path.startsWith("/api/blog/") && meth === "GET") {
      const slug = path.replace("/api/blog/", "");
      const post = await env.DB.prepare(
        "SELECT * FROM blog_posts WHERE slug=? AND status='published'"
      ).bind(slug).first();
      
      if (!post) return j({ error: "Post not found" }, 404);
      
      // Remove sensitive fields
      const { user_id, ...publicPost } = post;
      return j(publicPost);
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

    // ======== ADMIN ENDPOINTS ========

    if (path.startsWith("/api/admin/")) {
      const adminAuth = (req.headers.get("Authorization") || "").replace("Bearer ", "");
      if (adminAuth !== ADMIN_PASSWORD) return j({ error: "Unauthorized" }, 401);

      if (path === "/api/admin/products" && meth === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY category,id").all();
        return j(results);
      }

      if (path === "/api/admin/products" && meth === "POST") {
        const p = await req.json();
        const { meta } = await env.DB.prepare(
          `INSERT INTO products (title,description,price,category,emoji,color,tag,badge,stripe_link,paypal_link,image_url,active)
                                               VALUES (?,?,?,?,?,?,?,?,?,?,?,1)`
        ).bind(
          p.title,
          p.description,
          p.price,
          p.category,
          p.emoji || "📦",
          p.color || "#F5F5F5",
          p.tag || "",
          p.badge || "",
          p.stripe_link || "",
          p.paypal_link || "",
          p.image_url || ""
        ).run();
        return j({ success: true, id: meta.last_row_id });
      }

      const prodM = path.match(/^\/api\/admin\/products\/(\d+)$/);
      if (prodM && meth === "PUT") {
        const p = await req.json();
        await env.DB.prepare(
          `UPDATE products SET title=?,description=?,price=?,category=?,emoji=?,color=?,tag=?,badge=?,stripe_link=?,paypal_link=?,image_url=?,active=? WHERE id=?`
        ).bind(
          p.title,
          p.description,
          p.price,
          p.category,
          p.emoji,
          p.color,
          p.tag,
          p.badge,
          p.stripe_link,
          p.paypal_link,
          p.image_url || "",
          p.active ? 1 : 0,
          prodM[1]
        ).run();
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
    }

    // ======== IMAGE SERVING ========

    if (path.startsWith("/api/images/")) {
      const key = path.replace("/api/images/", "");
      const obj = await env.IMAGES.get(key);
      if (!obj) return new Response("Not found", { status: 404 });
      const h = new Headers();
      obj.writeHttpMetadata(h);
      h.set("Cache-Control", "public,max-age=31536000");
      return new Response(obj.body, { headers: h });
    }

    // ======== D&H CATALOG ========

    if (path === "/api/dandh/catalog" && meth === "POST") {
      const adminAuth = (req.headers.get("Authorization") || "").replace("Bearer ", "");
      if (adminAuth !== DANDH_PASSWORD) return j({ error: "Unauthorized" }, 401);
      const filters = await req.json();
      let tok;
      try {
        tok = await dandhToken(env);
      } catch (e) {
        return j({ error: "D&H auth failed — check Worker secrets." }, 502);
      }
      const params = new URLSearchParams({ limit: "200", offset: String((filters.page || 0) * 200) });
      if (filters.keyword) params.set("search", filters.keyword);
      if (filters.brand) params.set("manufacturer", filters.brand);
      const dr = await fetch(`https://api.dandh.com/v1/products?${params}`, {
        headers: { Authorization: `Bearer ${tok}`, Accept: "application/json", "X-AccountNumber": env.DANDH_ACCOUNT || "" }
      });
      if (!dr.ok) {
        const t = await dr.text();
        return j({ error: `D&H ${dr.status}: ${t}` }, dr.status);
      }
      const raw = await dr.json();
      let items = (raw.products || raw.items || raw || []).map((p) => {
        const cost = parseFloat(p.price || p.unitPrice || p.cost || 0);
        const map = parseFloat(p.mapPrice || p.map || 0);
        const { sell, net, margin } = profit(cost, map);
        return {
          sku: p.sku || p.partNumber || "",
          title: p.description || p.title || p.name || "",
          brand: p.manufacturer || p.brand || "",
          upc: p.upc || "",
          cost,
          map,
          sell,
          net,
          margin,
          weight: parseFloat(p.weight || 0),
          condition: p.condition || "New",
          inStock: p.availability === "instock" || (p.quantityAvailable || 0) > 0,
          image: p.imageUrl || p.image || "",
          category: p.category || "",
          hasUpc: !!(p.upc && p.upc.length > 5),
          isPhysical: parseFloat(p.weight || 0) > 0,
          hasMap: map > 0
        };
      });
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
      return j({ total: items.length, items });
    }

    // ======== SPA ROUTING ========

    if (meth === "GET" && path.startsWith("/admin")) {
      const indexReq = new Request(new URL("./index.html", req.url), {
        headers: req.headers
      });
      return await env.ASSETS.fetch(indexReq);
    }

    if (meth === "GET" && !path.startsWith("/api/")) {
      const indexReq = new Request(new URL("./index.html", req.url), {
        headers: req.headers
      });
      const res = await env.ASSETS.fetch(indexReq);
      if (res.status === 404) {
        return await env.ASSETS.fetch(req);
      }
      return res;
    }

    return env.ASSETS.fetch(req);
  }
};
