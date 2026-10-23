/* Cybertron, annotated — motion engine, canvas drawing kit, screen plates and comparisons.
   Built on the DeepInfer Annotated engine: every scene is a pure function of (beat position b,
   time t). Scroll scrubs the story; time only drives ambient motion. No library dependencies. */
(function () {
  "use strict";
  const RM = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, u) => a + (b - a) * u;
  const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const eout = (x) => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
  const ein = (x) => { x = clamp(x); return x * x * x; };
  const ramp = (v, a, d = 0.6) => (d <= 0 ? (v >= a ? 1 : 0) : eout((v - a) / d));
  const win = (v, a, b, fi = 0.4, fo = 0.4) => Math.min(ramp(v, a, fi), 1 - ramp(v, b - fo, fo));
  const rng = (seed) => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; };

  // ---------- tokens (read from CSS custom properties) ----------
  const TOK = ["paper", "sheet", "card", "ink", "ink-2", "ink-3", "hair", "grid", "exp", "ctl", "exe", "kno", "tel", "ok", "bad", "bee"];
  let COL = {};
  function readTokens() {
    const cs = getComputedStyle(document.documentElement);
    TOK.forEach((k) => { COL[k] = cs.getPropertyValue("--" + k).trim() || "#888"; });
  }
  function hexToRgb(c) {
    c = c.replace("#", "");
    if (c.length === 3) c = c.split("").map((x) => x + x).join("");
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  }
  function col(name) { return COL[name] || name; }
  function rgba(name, a) {
    const c = col(name);
    if (!c.startsWith("#")) return c;
    const [r, g, b] = hexToRgb(c);
    return `rgba(${r},${g},${b},${a})`;
  }
  function mixc(n1, n2, u) {
    const a = hexToRgb(col(n1)), b = hexToRgb(col(n2));
    u = clamp(u);
    return `rgb(${Math.round(lerp(a[0], b[0], u))},${Math.round(lerp(a[1], b[1], u))},${Math.round(lerp(a[2], b[2], u))})`;
  }

  const FONT = {
    display: "'Big Shoulders Display', 'Arial Narrow', sans-serif",
    body: "'Newsreader', Georgia, serif",
    mono: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
    ui: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif",
  };

  // ---------- drawing kit ----------
  function Kit(ctx, W, H) {
    const g = { ctx, W, H, narrow: W < 800, C: col, rgba, mix: mixc };
    const A = (a) => (a === undefined ? 1 : a);
    g.font = (size, weight = 500, fam = "mono") => `${weight} ${size}px ${FONT[fam] || fam}`;
    g.tw = (s, size = 18, fam = "mono", weight = 500) => { ctx.font = g.font(size, weight, fam); return ctx.measureText(String(s)).width; };
    function paint(fill, stroke, lw, a, dash) {
      if (a <= 0.003) return;
      ctx.globalAlpha = a;
      if (fill && fill !== "none") { ctx.fillStyle = col(fill); ctx.fill(); }
      if (stroke) { ctx.strokeStyle = col(stroke); ctx.lineWidth = lw || 1.5; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); }
      ctx.globalAlpha = 1;
    }
    g.rect = (x, y, w, h, o = {}) => {
      const a = A(o.a); if (a <= 0.003 || w <= 0 || h <= 0) return;
      ctx.beginPath();
      if (o.r) ctx.roundRect(x, y, w, h, Math.min(o.r, w / 2, h / 2)); else ctx.rect(x, y, w, h);
      paint(o.fill, o.stroke, o.lw, a, o.dash);
    };
    g.circle = (x, y, r, o = {}) => {
      const a = A(o.a); if (a <= 0.003 || r <= 0) return;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); paint(o.fill, o.stroke, o.lw, a, o.dash);
    };
    g.text = (s, x, y, o = {}) => {
      const a = A(o.a); if (a <= 0.003 || s === "" || s == null) return;
      ctx.globalAlpha = a;
      ctx.font = g.font(o.size || 18, o.weight || 500, o.font || "mono");
      ctx.fillStyle = col(o.color || "ink");
      ctx.textAlign = o.align || "left";
      ctx.textBaseline = o.base || "alphabetic";
      if (o.ls && "letterSpacing" in ctx) ctx.letterSpacing = o.ls + "px";
      if (o.maxW) ctx.fillText(String(s), x, y, o.maxW); else ctx.fillText(String(s), x, y);
      if (o.ls && "letterSpacing" in ctx) ctx.letterSpacing = "0px";
      ctx.globalAlpha = 1;
    };
    // wrap text into lines that fit maxW; returns the y after the last line
    g.wrap = (s, x, y, maxW, o = {}) => {
      const size = o.size || 16, lh = o.lh || size * 1.35, fam = o.font || "mono", wt = o.weight || 500;
      const words = String(s).split(/\s+/); let line = "", yy = y, n = 0;
      for (const w of words) {
        const t = line ? line + " " + w : w;
        if (g.tw(t, size, fam, wt) > maxW && line) { g.text(line, x, yy, o); yy += lh; line = w; n++; if (o.maxLines && n >= o.maxLines) return yy; }
        else line = t;
      }
      if (line) { g.text(line, x, yy, o); yy += lh; }
      return yy;
    };
    g.line = (x1, y1, x2, y2, o = {}) => {
      const a = A(o.a); if (a <= 0.003) return;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.lineCap = o.cap || "round"; paint(null, o.color || "ink-3", o.lw || 1.5, a, o.dash);
    };
    g.poly = (pts, o = {}) => {
      const a = A(o.a); if (a <= 0.003 || pts.length < 2) return;
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      if (o.close) ctx.closePath();
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      paint(o.fill, o.color, o.lw || 2, a, o.dash);
    };
    g.head = (x, y, ang, o = {}) => {
      const s = o.size || 11, a = A(o.a);
      g.poly([[x, y], [x + s * Math.cos(ang + 2.6), y + s * Math.sin(ang + 2.6)], [x + s * Math.cos(ang - 2.6), y + s * Math.sin(ang - 2.6)]], { fill: o.color || "ink-3", close: true, a });
    };
    g.arrow = (x1, y1, x2, y2, o = {}) => {
      const p = o.prog === undefined ? 1 : o.prog; if (p <= 0.001) return;
      const xe = lerp(x1, x2, p), ye = lerp(y1, y2, p), ang = Math.atan2(y2 - y1, x2 - x1), hs = o.head || 11;
      g.line(x1, y1, xe - hs * 0.55 * Math.cos(ang), ye - hs * 0.55 * Math.sin(ang), o);
      g.head(xe, ye, ang, { color: o.color, size: hs, a: o.a });
    };
    g.bez = (p0, p1, p2, u) => [
      (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0],
      (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1],
    ];
    g.curve = (p0, p1, p2, o = {}) => {
      const p = o.prog === undefined ? 1 : o.prog; if (p <= 0.001) return;
      const n = Math.max(3, Math.round(24 * p)), pts = [];
      for (let i = 0; i <= n; i++) pts.push(g.bez(p0, p1, p2, (p * i) / n));
      g.poly(pts, o);
      if (o.arrow !== false) { const [xa, ya] = pts[pts.length - 2], [xb, yb] = pts[pts.length - 1]; g.head(xb, yb, Math.atan2(yb - ya, xb - xa), { color: o.color, size: o.head || 10, a: o.a }); }
    };
    g.hatch = (x, y, w, h, o = {}) => {
      const a = A(o.a); if (a <= 0.003 || w <= 1) return;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.globalAlpha = a * 0.55; ctx.strokeStyle = col(o.color || "bad"); ctx.lineWidth = 1.2;
      const step = o.step || 7;
      ctx.beginPath();
      for (let k = -h; k < w; k += step) { ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + h, y); }
      ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1;
      g.rect(x, y, w, h, { stroke: o.color || "bad", lw: 1, a: a * 0.8, dash: [4, 4], r: o.r || 3 });
    };
    // label in a rounded capsule; (x,y) = left-center, or center with align:'center'
    g.pill = (x, y, label, o = {}) => {
      const size = o.size || 18, fam = o.font || "mono", weight = o.weight || 500, pad = o.pad === undefined ? 12 : o.pad;
      const w = g.tw(label, size, fam, weight) + pad * 2, h = o.h || Math.round(size * 1.8);
      const x0 = o.align === "center" ? x - w / 2 : o.align === "right" ? x - w : x;
      g.rect(x0, y - h / 2, w, h, { fill: o.fill === undefined ? "card" : o.fill, stroke: o.stroke === undefined ? "hair" : o.stroke, lw: o.lw || 1.5, r: o.r === undefined ? h / 2 : o.r, a: o.a, dash: o.dash });
      g.text(label, x0 + w / 2, y + size * 0.35, { size, font: fam, weight, color: o.color || "ink", align: "center", a: o.a });
      return w;
    };
    g.chip = (x, y, label, color, o = {}) => {
      const size = o.size || 15, w = g.tw(label, size, "mono", 600) + 20, h = Math.round(size * 1.75);
      const x0 = o.align === "center" ? x - w / 2 : o.align === "right" ? x - w : x, a = A(o.a);
      g.rect(x0, y - h / 2, w, h, { fill: rgba(color, 0.14), r: h / 2, a });
      g.text(label, x0 + w / 2, y + size * 0.36, { size, weight: 600, color, align: "center", a });
      return w;
    };
    g.box = (x, y, w, h, o = {}) => {
      const a = A(o.a), c = o.color || "exp";
      g.rect(x, y, w, h, { fill: rgba(c, o.wash === undefined ? 0.1 : o.wash), r: o.r === undefined ? 10 : o.r, a });
      g.rect(x, y, w, h, { stroke: c, lw: o.lw || 1.6, r: o.r === undefined ? 10 : o.r, a, dash: o.dash });
      if (o.title) {
        const ts = o.tsize || 20, ss = o.ssize || 14;
        const cy = y + h / 2 + (o.sub ? -ss * 0.55 : ts * 0.35);
        g.text(o.title, x + w / 2, cy, { size: ts, weight: o.tweight || 700, font: o.tfont || "display", align: "center", a, color: o.tcolor || "ink" });
        if (o.sub) g.text(o.sub, x + w / 2, cy + ss * 1.45, { size: ss, color: "ink-2", align: "center", a });
      }
    };
    // engineering dimension line: |<---- label ---->|
    g.dim = (x1, x2, y, label, o = {}) => {
      const a = A(o.a), c = o.color || "ink-2", vert = o.vertical;
      if (a <= 0.003) return;
      if (!vert) {
        g.line(x1, y - 7, x1, y + 7, { color: c, lw: 1.2, a }); g.line(x2, y - 7, x2, y + 7, { color: c, lw: 1.2, a });
        const tw_ = label ? g.tw(label, o.size || 14, "mono", 500) + 14 : 0, mid = (x1 + x2) / 2;
        if (x2 - x1 > tw_ + 24) {
          g.arrow(mid - tw_ / 2, y, x1 + 1, y, { color: c, lw: 1.2, head: 7, a });
          g.arrow(mid + tw_ / 2, y, x2 - 1, y, { color: c, lw: 1.2, head: 7, a });
          if (label) g.text(label, mid, y + 5, { size: o.size || 14, color: c, align: "center", a });
        } else {
          g.line(x1, y, x2, y, { color: c, lw: 1.2, a });
          if (label) g.text(label, mid, y - 10, { size: o.size || 14, color: c, align: "center", a });
        }
      } else {
        const y1 = x1, y2 = x2, x = y;
        g.line(x - 7, y1, x + 7, y1, { color: c, lw: 1.2, a }); g.line(x - 7, y2, x + 7, y2, { color: c, lw: 1.2, a });
        g.arrow(x, (y1 + y2) / 2, x, y1 + 1, { color: c, lw: 1.2, head: 7, a });
        g.arrow(x, (y1 + y2) / 2, x, y2 - 1, { color: c, lw: 1.2, head: 7, a });
        if (label) g.text(label, x + 12, (y1 + y2) / 2 + 5, { size: o.size || 14, color: c, a });
      }
    };
    // callout leader: dot at target, elbow line, label
    g.callout = (tx, ty, lx, ly, label, o = {}) => {
      const a = A(o.a), c = o.color || "ink-2"; if (a <= 0.003) return;
      g.circle(tx, ty, 3.5, { fill: c, a });
      g.poly([[tx, ty], [lx, ly], [lx + (o.left ? -18 : 18), ly]], { color: c, lw: 1.2, a });
      g.text(label, lx + (o.left ? -24 : 24), ly + 5, { size: o.size || 15, color: o.tcolor || c, align: o.left ? "right" : "left", a, weight: o.weight || 500 });
    };
    // a miniature Vector window: title bar, optional environment pill; returns the content rect
    g.win = (x, y, w, h, o = {}) => {
      const a = A(o.a), bh = o.bar || 24;
      g.rect(x + 2, y + 4, w, h, { fill: "ink", r: 9, a: a * 0.06 });
      g.rect(x, y, w, h, { fill: "card", stroke: "hair", lw: 1.2, r: 9, a });
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 9); ctx.clip();
      g.rect(x, y, w, bh, { fill: "#F2F2F5", a });
      g.line(x, y + bh, x + w, y + bh, { color: "hair", lw: 1, a });
      ctx.restore();
      g.rect(x + 8, y + bh / 2 - 6, 12, 12, { fill: "ink", r: 3.5, a });
      g.poly([[x + 10.8, y + bh / 2 - 2.4], [x + 14, y + bh / 2 + 3.2], [x + 17.2, y + bh / 2 - 2.4]], { color: "#FFFFFF", lw: 1.4, a });
      if (o.title) g.text(o.title, x + 27, y + bh / 2 + 4.5, { size: o.tsize || 12, font: "ui", weight: 600, color: "ink", a });
      let rx = x + w - 10;
      if (o.caption !== false) { ["×", "□", "–"].forEach((c, i) => g.text(c, rx - i * 15, y + bh / 2 + 4.5, { size: 11, font: "ui", color: "ink-3", align: "right", a })); rx -= 46; }
      if (o.env) {
        const ew = g.tw(o.env, 10.5, "ui", 600) + 22;
        g.rect(rx - ew, y + bh / 2 - 8, ew, 16, { fill: "#F4F8FE", stroke: "#B9D3F5", lw: 1, r: 8, a });
        g.circle(rx - ew + 8, y + bh / 2, 2.6, { fill: "exp", a });
        g.text(o.env, rx - ew + 14, y + bh / 2 + 3.8, { size: 10.5, font: "ui", weight: 600, color: "#0058B0", a });
      }
      return { x: x + 1, y: y + bh + 1, w: w - 2, h: h - bh - 2 };
    };
    // a labelled node: dot + text in a capsule; dash for proposed; returns width
    g.node = (x, y, label, o = {}) => {
      const size = o.size || 14, c = o.color || "ink-3";
      const w = g.tw(label, size, o.font || "mono", 500) + 34, h = o.h || Math.round(size * 2.1);
      const x0 = o.align === "center" ? x - w / 2 : o.align === "right" ? x - w : x, a = A(o.a);
      g.rect(x0, y - h / 2, w, h, { fill: o.fill || "card", stroke: o.stroke || c, lw: o.lw || 1.4, r: o.r === undefined ? 8 : o.r, dash: o.dash, a });
      g.circle(x0 + 13, y, 4, { fill: c, a });
      g.text(label, x0 + 24, y + size * 0.36, { size, font: o.font || "mono", color: o.tcolor || "ink", weight: o.weight || 500, a });
      return w;
    };
    // the @B mark
    g.bee = (x, y, s = 22, o = {}) => {
      const a = A(o.a);
      g.rect(x - s / 2, y - s / 2, s, s, { fill: "bee", r: s * 0.27, a });
      g.text("@B", x, y + s * 0.16, { size: s * 0.42, font: "ui", weight: 800, color: "#1D1D1F", align: "center", a });
    };
    g.chart = (o) => {
      const a = A(o.a); if (a <= 0.003) return;
      const { x0, y0, x1, y1, xmax, ymax } = o, xmin = o.xmin || 0, ymin = o.ymin || 0;
      const sx = (v) => x0 + ((x1 - x0) * (v - xmin)) / (xmax - xmin), sy = (v) => y1 - ((y1 - y0) * (v - ymin)) / (ymax - ymin);
      const ts = o.tsize || 14, fx = o.fx || String, fy = o.fy || String;
      (o.yticks || []).forEach((v) => { g.line(x0, sy(v), x1, sy(v), { color: "grid", lw: 1, a }); g.text(fy(v), x0 - 8, sy(v) + 5, { size: ts, color: "ink-3", align: "right", a }); });
      (o.xticks || []).forEach((v) => { g.line(sx(v), y1, sx(v), y1 + 5, { color: "hair", lw: 1, a }); g.text(fx(v), sx(v), y1 + 22, { size: ts, color: "ink-3", align: "center", a }); });
      g.line(x0, y1, x1, y1, { color: "ink-3", lw: 1.2, a }); g.line(x0, y0, x0, y1, { color: "ink-3", lw: 1.2, a });
      if (o.xlabel) g.text(o.xlabel, (x0 + x1) / 2, y1 + 46, { size: ts + 1, color: "ink-2", align: "center", a });
      if (o.ylabel) { ctx.save(); ctx.translate(x0 - (o.ylabelOff || 54), (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); g.text(o.ylabel, 0, 0, { size: ts + 1, color: "ink-2", align: "center", a }); ctx.restore(); }
      (o.series || []).forEach((ser, si) => {
        const p = Array.isArray(o.prog) ? o.prog[si] : o.prog === undefined ? 1 : o.prog;
        if (p <= 0) return;
        const pts = ser.pts.map((q) => [sx(q[0]), sy(q[1])]), n = pts.length, upto = p * (n - 1);
        const drawn = pts.slice(0, Math.floor(upto) + 1);
        if (Math.floor(upto) < n - 1) { const u = upto - Math.floor(upto), A0 = pts[Math.floor(upto)], B0 = pts[Math.floor(upto) + 1]; drawn.push([lerp(A0[0], B0[0], u), lerp(A0[1], B0[1], u)]); }
        if (ser.area) { const ar = drawn.concat([[drawn[drawn.length - 1][0], y1], [drawn[0][0], y1]]); g.poly(ar, { fill: rgba(ser.color, 0.12), close: true, a }); }
        g.poly(drawn, { color: ser.color, lw: ser.lw || 3, a, dash: ser.dash });
        if (ser.dots !== false) pts.forEach((q, i) => {
          if (i > upto + 1e-6) return;
          const pa = a * ramp(upto, i - 0.3, 0.3);
          g.circle(q[0], q[1], 5, { fill: ser.color, stroke: "sheet", lw: 2, a: pa });
          const lab = ser.pts[i][2];
          if (lab) g.text(lab, q[0] + (ser.ldx || 0), q[1] + (ser.ldy === undefined ? -12 : ser.ldy), { size: ts - 1, weight: 600, color: ser.color, align: "center", a: pa });
        });
      });
      return { sx, sy };
    };
    return g;
  }

  // ---------- stages ----------
  const stages = [];
  function makeStage(el, draw, opts = {}) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", el.getAttribute("data-label") || "Animated diagram");
    el.prepend(canvas);
    const st = { el, canvas, ctx: canvas.getContext("2d"), draw, opts, visible: true, dirty: true, t0: performance.now(), b: 0, state: {}, cssW: 0, cssH: 0 };
    stages.push(st);
    if (opts.onClick) canvas.addEventListener("click", (e) => {
      const r = canvas.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * st.W, y = ((e.clientY - r.top) / r.height) * st.H;
      opts.onClick(x, y, st); st.dirty = true;
    });
    if (opts.onClick) canvas.style.cursor = "pointer";
    return st;
  }
  function sizeStage(st) {
    const r = st.el.getBoundingClientRect();
    const cssW = Math.max(1, r.width), cssH = Math.max(1, r.height);
    if (cssW === st.cssW && cssH === st.cssH) return;
    st.cssW = cssW; st.cssH = cssH;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    st.canvas.width = Math.round(cssW * dpr); st.canvas.height = Math.round(cssH * dpr);
    const W = clamp(cssW * (st.opts.zoom || 1.3), st.opts.minW || 620, st.opts.maxW || 1000);
    st.W = W; st.H = (W * cssH) / cssW; st.scale = (cssW / W) * dpr; st.dirty = true;
  }
  function render(st, now) {
    sizeStage(st);
    const ctx = st.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, st.canvas.width, st.canvas.height);
    ctx.setTransform(st.scale, 0, 0, st.scale, 0, 0);
    const g = Kit(ctx, st.W, st.H);
    g.css = st.W / st.cssW;                 // drawing units per CSS pixel
    g.safeTop = Math.ceil(32 * g.css);      // keep drawings below the HTML ruler label
    const t = RM.matches ? (st.opts.restT || 2.5) : Math.max(0, (now - st.t0) / 1000);
    const b = st.b;
    const s = { b, t, n: st.n || 1, state: st.state, st,
      at: (i, w = 0.55) => ease((b - i + 0.8) / w),
      between: (i, j) => ease((b - i + 0.8) / 0.55) * (1 - ease((b - j + 0.8) / 0.55)),
      swapOut: (i) => 1 - ease((b - i + 0.65) / 0.28),
      swapIn: (i) => ease((b - i + 0.32) / 0.28),
      solo: (i, w = 0.3) => (i === (st.n || 1) - 1 ? ease((b - i + 0.5) / w) : ease((0.5 - Math.abs(b - i)) / w)) };
    try { st.draw(g, s); } catch (e) { console.error(e); }
  }

  // scrolly binding
  const scrollies = [];
  function bindScrolly(sec, st) {
    const beats = Array.from(sec.querySelectorAll(".beat"));
    st.n = beats.length;
    scrollies.push({ sec, st, beats });
  }
  function updateScrollies() {
    const vh = window.innerHeight, narrow = window.innerWidth <= 860;
    const line = vh * (narrow ? 0.8 : 0.56);
    scrollies.forEach((sc) => {
      const cs = sc.beats.map((el) => { const c = el.querySelector(".card") || el; const rc = c.getBoundingClientRect(); return rc.top + rc.height / 2; });
      let b = 0;
      if (cs.length) {
        if (line <= cs[0]) b = 0;
        else if (line >= cs[cs.length - 1]) b = cs.length - 1;
        else for (let i = 0; i < cs.length - 1; i++) if (line >= cs[i] && line < cs[i + 1]) { b = i + (line - cs[i]) / (cs[i + 1] - cs[i]); break; }
      }
      if (Math.abs(b - sc.st.b) > 1e-4) { sc.st.b = b; sc.st.dirty = true; }
      const on = Math.round(b);
      sc.beats.forEach((el, i) => el.classList.toggle("on", i === on));
    });
  }

  function loop(now) {
    updateScrollies();
    stages.forEach((st) => {
      if (!st.visible) return;
      if (st.dirty || (st.opts.anim && !RM.matches)) { render(st, now); st.dirty = false; }
    });
    const bar = document.querySelector(".bar .progress");
    if (bar) { const h = document.documentElement.scrollHeight - window.innerHeight; bar.style.width = (h > 0 ? (100 * window.scrollY) / h : 0) + "%"; }
    requestAnimationFrame(loop);
  }

  const io = "IntersectionObserver" in window ? new IntersectionObserver((ents) => {
    ents.forEach((e) => { const st = stages.find((s) => s.el === e.target); if (st) { st.visible = e.isIntersecting; if (e.isIntersecting) st.dirty = true; } });
  }, { rootMargin: "120px" }) : null;

  const registry = {};
  function scene(id, draw, opts) { registry[id] = { draw, opts: opts || {} }; }

  // ---------- screen plates: real Vector screens with numbered pins ----------
  // <figure class="shot" data-src="screens/v3/X.webp" data-w="1600" data-h="1000" data-crop="x,y,w,h" data-title="...">
  //   <span class="pin c-bad" data-x="820" data-y="410">1</span>
  //   <span class="ring" data-box="x,y,w,h"></span>
  // </figure>      (all coordinates in the screen's own 1600×1000 pixel space)
  function initShots() {
    document.querySelectorAll("figure.shot").forEach((fig) => {
      if (fig.dataset.ready) return; fig.dataset.ready = "1";
      const W = +fig.dataset.w || 1600, H = +fig.dataset.h || 1000;
      const [cx, cy, cw, ch] = (fig.dataset.crop || `0,0,${W},${H}`).split(",").map(Number);
      const vp = document.createElement("div"); vp.className = "vp"; vp.style.aspectRatio = `${cw} / ${ch}`;
      const img = document.createElement("img");
      img.src = fig.dataset.src; img.alt = fig.dataset.alt || fig.dataset.title || "Vector screen"; img.loading = "lazy"; img.decoding = "async";
      img.style.width = (100 * W) / cw + "%"; img.style.left = (-100 * cx) / cw + "%"; img.style.top = (-100 * cy) / ch + "%";
      vp.appendChild(img);
      fig.querySelectorAll(".pin, .ring").forEach((el) => {
        if (el.classList.contains("pin")) {
          const x = +el.dataset.x, y = +el.dataset.y;
          el.style.left = (100 * (x - cx)) / cw + "%"; el.style.top = (100 * (y - cy)) / ch + "%";
          if (x < cx || x > cx + cw || y < cy || y > cy + ch) el.hidden = true;
        } else {
          const [bx, by, bw, bh] = el.dataset.box.split(",").map(Number);
          el.style.left = (100 * (bx - cx)) / cw + "%"; el.style.top = (100 * (by - cy)) / ch + "%";
          el.style.width = (100 * bw) / cw + "%"; el.style.height = (100 * bh) / ch + "%";
        }
        vp.appendChild(el);
      });
      const hint = document.createElement("span"); hint.className = "zoomhint"; hint.textContent = "open full screen"; vp.appendChild(hint);
      fig.prepend(vp);
      fig.tabIndex = 0; fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", "Open full screen: " + (fig.dataset.title || "Vector screen"));
      const open = () => lightbox(fig.dataset.src, fig.dataset.title || "", fig.dataset.alt || "");
      fig.addEventListener("click", open);
      fig.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    document.querySelectorAll("[data-lightbox]").forEach((el) => {
      if (el.dataset.ready) return; el.dataset.ready = "1";
      el.addEventListener("click", () => lightbox(el.dataset.lightbox, el.dataset.title || "", el.dataset.alt || ""));
    });
  }
  let lbEl = null, lbReturn = null;
  function lightbox(src, title, alt) {
    closeLightbox();
    lbReturn = document.activeElement;
    lbEl = document.createElement("div"); lbEl.className = "lightbox"; lbEl.setAttribute("role", "dialog"); lbEl.setAttribute("aria-modal", "true"); lbEl.setAttribute("aria-label", title || "Screen");
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    lbEl.innerHTML = `<figure><div class="lb-scroll"><img src="${esc(src)}" alt="${esc(alt || title)}"></div><figcaption><span>${esc(title)}</span><button type="button">Close</button></figcaption></figure>`;
    lbEl.addEventListener("click", (e) => { if (e.target === lbEl || e.target.tagName === "BUTTON") closeLightbox(); });
    document.body.appendChild(lbEl);
    lbEl.querySelector("button").focus();
  }
  function closeLightbox() { if (lbEl) { lbEl.remove(); lbEl = null; if (lbReturn && lbReturn.focus) lbReturn.focus(); } }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  // ---------- comparisons ----------
  function escH(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  // data = { rows: [{ self, name, who: [], what (html), vs (html), src: [[label, url]] }], sources: [[label, url]] }
  function alts(rootId, srcId, data) {
    const root = document.getElementById(rootId);
    if (root && data && data.rows) root.innerHTML = data.rows.map((r) => `
      <article class="alt${r.self ? " self" : ""}">
        <div><h4>${escH(r.name)}</h4><div class="who">${(r.who || []).map((w) => `<span class="tag">${escH(w)}</span>`).join("")}</div></div>
        <div><p>${r.what}</p>${r.src ? `<div class="src">${r.src.map(([l, u]) => `<a href="${escH(u)}" target="_blank" rel="noopener">${escH(l)} ↗</a>`).join("")}</div>` : ""}</div>
        <div class="vs">${r.vs}</div>
      </article>`).join("");
    const src = srcId && document.getElementById(srcId);
    if (src && data && data.sources) src.innerHTML = `<span class="k-label">Sources</span>` + data.sources.map(([l, u]) => u ? `<div><a href="${escH(u)}" target="_blank" rel="noopener">${escH(l)}</a></div>` : `<div>${escH(l)}</div>`).join("");
  }

  function init() {
    readTokens();
    initShots();
    document.querySelectorAll("[data-stage]").forEach((el) => {
      const def = registry[el.getAttribute("data-stage")];
      if (!def) return;
      const st = makeStage(el, def.draw, def.opts);
      const sec = el.closest("[data-scrolly]");
      if (sec) bindScrolly(sec, st);
      if (def.opts.controls) {
        const root = document.getElementById(def.opts.controls);
        if (root) {
          const read = () => {
            root.querySelectorAll("input,select").forEach((inp) => {
              st.state[inp.id] = inp.type === "range" ? parseFloat(inp.value) : inp.type === "checkbox" ? inp.checked : inp.value;
              const out = root.querySelector(`output[for="${inp.id}"]`);
              if (out && def.opts.format) out.textContent = def.opts.format(inp.id, st.state[inp.id], st.state);
            });
            if (def.opts.onState) def.opts.onState(st.state, st);
            st.dirty = true;
          };
          root.addEventListener("input", read);
          root.addEventListener("change", read);
          root.querySelectorAll(".seg").forEach((sg) => sg.addEventListener("click", (e) => {
            const btn = e.target.closest("button"); if (!btn) return;
            sg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === btn)));
            st.state[sg.id] = btn.value; read();
          }));
          root.querySelectorAll(".seg").forEach((sg) => { const on = sg.querySelector('[aria-pressed="true"]'); if (on) st.state[sg.id] = on.value; });
          // action buttons: <button data-act="name"> → opts.onAction(name, state, st)
          root.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-act]"); if (!btn || !def.opts.onAction) return;
            def.opts.onAction(btn.dataset.act, st.state, st, btn); read();
          });
          if (def.opts.initState) def.opts.initState(st.state, st);
          read();
        }
      }
      if (io) io.observe(el);
    });
    const dirtyAll = () => { readTokens(); stages.forEach((s) => (s.dirty = true)); };
    window.addEventListener("resize", () => stages.forEach((s) => { s.cssW = 0; s.dirty = true; }));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(dirtyAll);
    setTimeout(dirtyAll, 600);
    requestAnimationFrame(loop);
  }

  window.Field = { scene, alts, lightbox, clamp, lerp, ease, eout, ein, ramp, win, rng, col, rgba, mixc, stages, FONT, renderAll: () => stages.forEach((s) => render(s, performance.now())) };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else setTimeout(init, 0);
})();
