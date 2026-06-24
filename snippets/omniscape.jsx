/*
 * OmniScape Mintlify components — single bundle export.
 * Mintlify inlines named exports only (not module helpers), so everything
 * lives inside one IIFE. Pages import OmniScapeBundle and destructure.
 */

export const OmniScapeBundle = (() => {
/* Fetched and injected via srcDoc — Mintlify prod 404s root .html; CDNs serve text/plain. */
const MOCKUP_FETCH_URL = 'https://cdn.jsdelivr.net/gh/jazzmoradia/docs@main/control-center-mockup.html';

function patchMockupHtml(html) {
  let out = html;
  out = out.replace(
    "if (params.get('embed') === '1') document.body.classList.add('embed');",
    "document.body.classList.add('embed');"
  );
  if (!/<body[^>]*class=\"[^\"]*embed/.test(out)) {
    out = out.replace('<body>', '<body class="embed">');
  }
  return out;
}

const MockupFrame = ({ className = 'os-cc-frame', title = 'OmniScape Control Center', loading = 'eager', iframeRef = null }) => {
  const [srcDoc, setSrcDoc] = useState('');
  const [status, setStatus] = useState('loading');
  const localRef = useRef(null);
  const ref = iframeRef || localRef;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let cancelled = false;
    fetch(MOCKUP_FETCH_URL)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then((html) => {
        if (cancelled) return;
        setSrcDoc(patchMockupHtml(html));
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="os-cc-frame-host">
      {status === 'loading' ? (
        <div className="os-cc-frame-loading" aria-hidden="true">
          <span>Loading Control Center…</span>
        </div>
      ) : null}
      {status === 'error' ? (
        <div className="os-cc-frame-fallback">
          <p>Could not load the interactive mockup.</p>
          <a href={MOCKUP_FETCH_URL} target="_blank" rel="noopener noreferrer">Open Control Center mockup</a>
        </div>
      ) : null}
      {status === 'ready' ? (
        <iframe
          ref={ref}
          srcDoc={srcDoc}
          title={title}
          className={className}
          loading={loading}
        />
      ) : null}
    </div>
  );
};

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const Z = {
  amber: '#cca060',
  copper: '#c49070',
  blue: '#7ab4cc',
  green: '#72ae82',
  road: '#caa05a',
  roadDim: '#6c6452',
  wall: '#5a8aaa',
};

/* variant-driven settlement generator (normalized 0..1) */
function genVariant(seed, variant) {
  const rnd = mulberry32(seed);
  const cx = 0.5;
  const cy = 0.5;
  const nodes = [];
  const roads = [];
  let wall = null;

  const pushRing = (count, rad, jitter, zoneBase) => {
    const a0 = rnd() * Math.PI * 2;
    const base = nodes.length;
    for (let i = 0; i < count; i++) {
      const ang = a0 + (i / count) * Math.PI * 2 + (rnd() - 0.5) * jitter;
      const rr = rad * (0.85 + rnd() * 0.3);
      nodes.push({ x: cx + Math.cos(ang) * rr, y: cy + Math.sin(ang) * rr * 0.9, z: (zoneBase + i) % 4 });
    }
    return base;
  };

  if (variant === 'fortress') {
    nodes.push({ x: cx, y: cy, z: 0 });
    const r1 = pushRing(5, 0.17, 0.25, 1);
    const r2 = pushRing(7, 0.31, 0.3, 2);
    for (let i = r1; i < r2; i++) roads.push([0, i, 0]);
    wall = 1.2;
  } else if (variant === 'planned') {
    const g = 4;
    for (let i = 0; i < g; i++)
      for (let j = 0; j < g; j++) {
        nodes.push({ x: 0.22 + (i / (g - 1)) * 0.56, y: 0.24 + (j / (g - 1)) * 0.52 + (rnd() - 0.5) * 0.02, z: (i + j) % 4 });
      }
    for (let i = 0; i < g; i++)
      for (let j = 0; j < g; j++) {
        const a = i * g + j;
        if (j < g - 1) roads.push([a, a + 1, 1]);
        if (i < g - 1) roads.push([a, a + g, 1]);
      }
  } else if (variant === 'hillside') {
    let prev = -1;
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const x = 0.2 + t * 0.6 + (rnd() - 0.5) * 0.12;
      const y = 0.7 - t * 0.42 + (rnd() - 0.5) * 0.1;
      nodes.push({ x, y, z: i % 4 });
      if (prev >= 0) roads.push([prev, i, rnd() > 0.5 ? 1 : 2]);
      prev = i;
    }
  } else if (variant === 'ruins') {
    pushRing(6, 0.28, 0.55, 0);
    for (let i = 0; i < nodes.length; i++) if (rnd() > 0.5) roads.push([i, (i + 1) % nodes.length, 2]);
    wall = 1.18; // partial — drawn dashed/broken
  } else if (variant === 'county') {
    for (let i = 0; i < 7; i++) nodes.push({ x: 0.16 + rnd() * 0.68, y: 0.18 + rnd() * 0.64, z: i % 4 });
    for (let i = 0; i < nodes.length - 1; i++) roads.push([i, i + 1, 2]);
    roads.push([0, nodes.length - 1, 2]);
  } else {
    // default radial town
    nodes.push({ x: cx, y: cy, z: 0 });
    const r1 = pushRing(4, 0.16, 0.3, 1);
    const r2 = pushRing(6, 0.3, 0.35, 2);
    for (let i = r1; i < r2; i++) roads.push([0, i, 0]);
    for (let i = r2; i < nodes.length; i++) roads.push([i, r1 + ((i - r2) % (r2 - r1)), 2]);
  }

  // buildings
  const buildings = [];
  nodes.forEach((nd) => {
    const k = 4 + Math.floor(rnd() * 6);
    for (let i = 0; i < k; i++) {
      const ang = rnd() * Math.PI * 2;
      const rr = 0.01 + rnd() * 0.045;
      buildings.push({ x: nd.x + Math.cos(ang) * rr, y: nd.y + Math.sin(ang) * rr, t: rnd() > 0.6 ? 1 : 2, z: nd.z, rot: ang });
    }
  });

  // flora ring
  const flora = [];
  const floraN = variant === 'ruins' || variant === 'county' || variant === 'hillside' ? 40 : 22;
  for (let i = 0; i < floraN; i++) {
    const ang = rnd() * Math.PI * 2;
    const rr = 0.4 + rnd() * 0.12;
    flora.push({ x: cx + Math.cos(ang) * rr, y: cy + Math.sin(ang) * rr * 0.92 });
  }

  return { nodes, roads, buildings, flora, wall, cx, cy };
}

function hullOf(points, cx, cy, k) {
  const pts = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  if (pts.length < 3) return [];
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper).map((p) => ({ x: cx + (p.x - cx) * k, y: cy + (p.y - cy) * k }));
}

const ZC = ['#cca060', '#c49070', '#7ab4cc', '#72ae82'];

function drawMini(canvas, data, size, opts) {
  opts = opts || {};
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
  const W = size.w;
  const H = size.h;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const pad = opts.pad != null ? opts.pad : 16;
  const sx = (x) => pad + x * (W - pad * 2);
  const sy = (y) => pad + y * (H - pad * 2);
  const prog = opts.progress != null ? opts.progress : 1;
  ctx.clearRect(0, 0, W, H);

  // zone tints
  data.nodes.forEach((nd) => {
    const g = ctx.createRadialGradient(sx(nd.x), sy(nd.y), 0, sx(nd.x), sy(nd.y), 40);
    g.addColorStop(0, hexA(ZC[nd.z], 0.16 * prog));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(sx(nd.x) - 40, sy(nd.y) - 40, 80, 80);
  });

  // wall
  if (data.wall) {
    const h = hullOf(data.nodes, data.cx, data.cy, data.wall);
    if (h.length > 2) {
      ctx.save();
      ctx.globalAlpha = prog;
      ctx.beginPath();
      h.forEach((p, i) => (i ? ctx.lineTo(sx(p.x), sy(p.y)) : ctx.moveTo(sx(p.x), sy(p.y))));
      if (opts.variant !== 'ruins') ctx.closePath();
      ctx.strokeStyle = Z.wall;
      ctx.lineWidth = 1.4;
      if (opts.variant === 'ruins') ctx.setLineDash([5, 6]);
      ctx.stroke();
      ctx.restore();
    }
  }

  // roads
  const rc = [Z.road, '#9c8a6a', Z.roadDim];
  const rw = [1.9, 1.3, 1];
  data.roads.forEach((r) => {
    const a = data.nodes[r[0]];
    const b = data.nodes[r[1]];
    ctx.save();
    ctx.globalAlpha = 0.9 * prog;
    ctx.strokeStyle = rc[r[2]];
    ctx.lineWidth = rw[r[2]];
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx(a.x), sy(a.y));
    ctx.lineTo(sx(a.x + (b.x - a.x) * prog), sy(a.y + (b.y - a.y) * prog));
    ctx.stroke();
    ctx.restore();
  });

  // buildings
  data.buildings.forEach((bd, i) => {
    const pop = Math.min(1, prog * 1.4 - (i / data.buildings.length) * 0.4);
    if (pop <= 0) return;
    ctx.save();
    ctx.globalAlpha = (bd.t === 1 ? 0.92 : 0.55) * pop;
    ctx.translate(sx(bd.x), sy(bd.y));
    ctx.rotate(bd.rot);
    const s = bd.t === 1 ? 3.6 : 2.4;
    ctx.fillStyle = bd.t === 1 ? Z.copper : ZC[bd.z];
    ctx.fillRect(-s / 2, -s / 2, s, s * 0.8);
    ctx.restore();
  });

  // flora
  if (opts.flora !== false) {
    data.flora.forEach((f, i) => {
      const pop = Math.min(1, prog * 1.5 - (i / data.flora.length) * 0.5);
      if (pop <= 0) return;
      ctx.save();
      ctx.globalAlpha = 0.4 * pop;
      ctx.fillStyle = Z.green;
      ctx.beginPath();
      ctx.arc(sx(f.x), sy(f.y), 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // nodes
  data.nodes.forEach((nd, i) => {
    ctx.save();
    ctx.globalAlpha = prog;
    ctx.fillStyle = i === 0 && (opts.variant === 'fortress' || !opts.variant) ? Z.amber : ZC[nd.z];
    ctx.beginPath();
    ctx.arc(sx(nd.x), sy(nd.y), 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(8,9,10,0.9)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();
  });
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* ---- Isometric build-up renderer (ink-on-paper, progress-driven) -------
 * Reuses genVariant() data. progress 0..1 stages: ground -> roads ->
 * buildings rise -> walls -> flora. Lives on the light hero stage. */
const ISO = {
  ink: '#2a2419',
  plate: '#fdfbf6',
  plateEdge: '#d8cfbb',
  grid: 'rgba(40, 34, 22, 0.07)',
  road: '#a8742a',
  roadCore: '#caa15c',
  top: ['#d2ab66', '#cf9a72', '#86acc0', '#84b394'],
  hero: '#b7714a',
  heroSide: '#854a2c',
  wall: '#3f7390',
  wallSide: '#2c5366',
  flora: '#3c7a48',
  node: '#a8742a',
};
const ISO_SIDE = ['#9a7330', '#8a5a38', '#4f7d96', '#4f8159'];

function drawIso(canvas, data, size, progress) {
  if (!canvas) return;
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
  const W = size.w;
  const H = size.h;
  canvas.width = Math.max(1, Math.round(W * dpr));
  canvas.height = Math.max(1, Math.round(H * dpr));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const p = Math.max(0, Math.min(1, progress));
  const seg = (a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  const SPAN = 9;
  const TILE = Math.min(W, H) * 0.05;
  const tw = TILE;
  const th = TILE * 0.5;
  const hScale = TILE * 1.55;
  const originX = W * 0.5;
  const originY = H * 0.33;
  const gco = (n) => (n - 0.5) * SPAN;
  const proj = (X, Y, Z) => ({ x: originX + (X - Y) * tw, y: originY + (X + Y) * th - (Z || 0) * hScale });
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---- ground plate (diamond) ----
  const gp = ease(seg(0, 0.16));
  if (gp > 0.001) {
    const h = (SPAN / 2) * gp;
    const c0 = proj(-h, -h, 0), c1 = proj(h, -h, 0), c2 = proj(h, h, 0), c3 = proj(-h, h, 0);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(c3.x, c3.y); ctx.closePath();
    const g = ctx.createLinearGradient(c0.x, c0.y, c2.x, c2.y);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, ISO.plate);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = ISO.plateEdge;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // faint iso grid
    ctx.strokeStyle = ISO.grid;
    ctx.lineWidth = 1;
    const step = SPAN / 9;
    for (let i = -SPAN / 2; i <= SPAN / 2 + 0.001; i += step) {
      const a = proj(i, -h, 0), b = proj(i, h, 0);
      const cc = proj(-h, i, 0), d = proj(h, i, 0);
      if (Math.abs(i) <= h + 0.001) {
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cc.x, cc.y); ctx.lineTo(d.x, d.y); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---- roads (ground decals) ----
  const rp = ease(seg(0.12, 0.42));
  if (rp > 0.001) {
    data.roads.forEach((r) => {
      const a = data.nodes[r[0]];
      const b = data.nodes[r[1]];
      if (!a || !b) return;
      const ax = gco(a.x), ay = gco(a.y);
      const bx = lerp(gco(a.x), gco(b.x), rp), by = lerp(gco(a.y), gco(b.y), rp);
      const pa = proj(ax, ay, 0), pb = proj(bx, by, 0);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = ISO.road;
      ctx.lineWidth = r[2] === 0 ? tw * 0.62 : r[2] === 1 ? tw * 0.46 : tw * 0.34;
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      ctx.strokeStyle = ISO.roadCore;
      ctx.lineWidth = Math.max(1, ctx.lineWidth * 0.4);
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      ctx.restore();
    });
  }

  // ---- buildings (extruded boxes, rise + stagger by depth) ----
  const bld = data.buildings
    .map((b, i) => ({ b, i, depth: gco(b.x) + gco(b.y) }))
    .sort((m, n) => m.depth - n.depth);
  const N = Math.max(1, bld.length);
  bld.forEach(({ b }, k) => {
    const start = 0.3 + (k / N) * 0.42;
    const bp = ease(seg(start, start + 0.2));
    if (bp <= 0.001) return;
    const isHero = b.t === 1;
    const hs = (isHero ? 0.26 : 0.18);
    const hgt = (isHero ? 1.25 : 0.62) * bp;
    const cx = gco(b.x), cy = gco(b.y);
    const A = proj(cx - hs, cy - hs, 0), B = proj(cx + hs, cy - hs, 0);
    const C = proj(cx + hs, cy + hs, 0), D = proj(cx - hs, cy + hs, 0);
    const At = proj(cx - hs, cy - hs, hgt), Bt = proj(cx + hs, cy - hs, hgt);
    const Ct = proj(cx + hs, cy + hs, hgt), Dt = proj(cx - hs, cy + hs, hgt);
    const top = isHero ? ISO.hero : ISO.top[b.z % 4];
    const sideR = isHero ? ISO.heroSide : ISO_SIDE[b.z % 4];
    const sideF = sideR;
    ctx.save();
    // right face (B-C)
    ctx.beginPath(); ctx.moveTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.lineTo(Ct.x, Ct.y); ctx.lineTo(Bt.x, Bt.y); ctx.closePath();
    ctx.fillStyle = sideR; ctx.fill();
    // front face (C-D)
    ctx.beginPath(); ctx.moveTo(C.x, C.y); ctx.lineTo(D.x, D.y); ctx.lineTo(Dt.x, Dt.y); ctx.lineTo(Ct.x, Ct.y); ctx.closePath();
    ctx.fillStyle = hexA(sideF, 0.82); ctx.fill();
    // top
    ctx.beginPath(); ctx.moveTo(At.x, At.y); ctx.lineTo(Bt.x, Bt.y); ctx.lineTo(Ct.x, Ct.y); ctx.lineTo(Dt.x, Dt.y); ctx.closePath();
    ctx.fillStyle = top; ctx.fill();
    ctx.strokeStyle = hexA(ISO.ink, 0.18); ctx.lineWidth = 0.8; ctx.stroke();
    ctx.restore();
  });

  // ---- walls (hull crown) ----
  if (data.wall) {
    const wp = ease(seg(0.7, 0.95));
    if (wp > 0.001) {
      const hull = hullOf(data.nodes, data.cx, data.cy, data.wall);
      if (hull.length > 2) {
        const wh = 0.7 * wp;
        const ruin = data.wall === 1.18;
        ctx.save();
        ctx.lineJoin = 'round';
        // base + top edges
        for (let i = 0; i < hull.length; i++) {
          const a = hull[i];
          const b = hull[(i + 1) % hull.length];
          if (ruin && i % 3 === 0) continue;
          const ax = gco(a.x), ay = gco(a.y), bx = gco(b.x), by = gco(b.y);
          const b0 = proj(ax, ay, 0), b1 = proj(bx, by, 0);
          const t0 = proj(ax, ay, wh), t1 = proj(bx, by, wh);
          ctx.beginPath();
          ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t0.x, t0.y); ctx.closePath();
          ctx.fillStyle = hexA(ISO.wallSide, 0.9); ctx.fill();
          ctx.strokeStyle = ISO.wall; ctx.lineWidth = 1.1; ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  // ---- flora ----
  const fp = ease(seg(0.8, 1));
  if (fp > 0.001) {
    data.flora.forEach((f, i) => {
      const pop = Math.min(1, fp * 1.5 - (i / data.flora.length) * 0.5);
      if (pop <= 0) return;
      const pt = proj(gco(f.x), gco(f.y), 0.18 * pop);
      ctx.save();
      ctx.globalAlpha = 0.85 * pop;
      ctx.fillStyle = ISO.flora;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y - 4 * pop);
      ctx.lineTo(pt.x + 2.4, pt.y + 1.5);
      ctx.lineTo(pt.x - 2.4, pt.y + 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  // ---- nodes (markers) ----
  const np = ease(seg(0.18, 0.4));
  if (np > 0.001) {
    data.nodes.forEach((nd, i) => {
      const pt = proj(gco(nd.x), gco(nd.y), 0);
      ctx.save();
      ctx.globalAlpha = np;
      ctx.fillStyle = i === 0 ? ISO.node : hexA(ISO.node, 0.55);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, i === 0 ? 3.4 : 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fffdf8'; ctx.lineWidth = 1.1; ctx.stroke();
      ctx.restore();
    });
  }
}

/* small reveal-animation hook for a canvas */
function useReveal(drawFn, deps) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    let raf = 0;
    const start = performance.now();
    const dur = reduce ? 0 : 700;
    const loop = (now) => {
      const t = dur === 0 ? 1 : Math.min(1, (now - start) / dur);
      drawFn(canvas, 1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, deps);
  return ref;
}

/* ---- HeroPanel — canonical v13 mockup (live iframe) ------------------ */
const HeroPanel = () => (
  <div className="os-cc-frame-wrap os-cc-frame-wrap--hero">
    <MockupFrame title="OmniScape Control Center" loading="eager" />
  </div>
);

/* ---- CinematicHero — headline + live Control Center (device always visible) */
const CinematicHero = () => (
  <section className="os-cine os-cine--static">
    <div className="os-cine-stage">
      <div className="os-cine-inner">
        <span className="os-cine-eyebrow">Procedural settlements &middot; UE 5.5+</span>
        <h1 className="os-cine-title">A whole settlement from a <span className="os-grad">single seed</span>.</h1>
        <p className="os-cine-sub">
          Steer every layer from a single <strong>Control Center</strong> &mdash; layout, buildings, roads, walls, and ambient detail. Your meshes, your style, the same result every time.
        </p>
        <div className="os-cine-frame">
          <HeroPanel />
        </div>
        <div className="os-cine-cta">
          <a className="os-btn os-btn--primary" href="https://fab.com/s/4aeff49faf04">Get it on Fab</a>
          <a className="os-btn os-btn--ghost" href="#control-center">Explore the Control Center</a>
        </div>
      </div>
    </div>
  </section>
);

/* ---- WorkflowSpectrum — the mental model as a band ------------------- */
const SPECTRUM = [
  { n: 'Layout', q: 'Where?', cls: 'os-phase-layout', href: '/guides/layout', d: 'Pattern, size, districts, zones.' },
  { n: 'Build', q: 'What?', cls: 'os-phase-build', href: '/guides/build', d: 'Your meshes and Blueprints, per tier.' },
  { n: 'Structure', q: 'How does it connect?', cls: 'os-phase-structure', href: '/guides/structure', d: 'Roads and walls.' },
  { n: 'Ambient', q: 'Does it breathe?', cls: 'os-phase-ambient', href: '/guides/ambient', d: 'Flora, fauna, audio.' },
];

const WorkflowSpectrum = () => (
  <div className="not-prose os-wf-grid">
    {SPECTRUM.map((p, i) => (
      <a
        key={p.n}
        href={p.href}
        className={'os-wf ' + p.cls}
      >
        <span className="os-wf-accent" />
        <span className="os-wf-num">0{i + 1}</span>
        <span className="os-wf-name">{p.n}</span>
        <span className="os-wf-q">{p.q}</span>
        <span className="os-wf-desc">{p.d}</span>
      </a>
    ))}
  </div>
);

/* ---- IntentTile — creative-direction gallery ------------------------- */
const IntentTile = ({ variant = 'town', seed = 12345, kicker = '', title = '', desc = '' }) => {
  const [size, setSize] = useState({ w: 320, h: 230 });
  const wrapRef = useRef(null);
  const data = useMemo(() => genVariant(seed, variant), [seed, variant]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = () => { const el = wrapRef.current; if (el) setSize({ w: el.clientWidth, h: el.clientHeight }); };
    m();
    let ro;
    if (typeof ResizeObserver !== 'undefined' && wrapRef.current) { ro = new ResizeObserver(m); ro.observe(wrapRef.current); }
    else window.addEventListener('resize', m);
    return () => { if (ro) ro.disconnect(); else window.removeEventListener('resize', m); };
  }, []);
  const canvasRef = useReveal((canvas, p) => drawMini(canvas, data, size, { progress: p, pad: 18, variant }), [data, size]);
  return (
    <div className="os-intent not-prose" ref={wrapRef}>
      <canvas ref={canvasRef} style={{ width: size.w + 'px', height: size.h + 'px' }} aria-label={title + ' settlement silhouette'} />
      <div className="os-intent-grad" />
      <div className="os-intent-txt">
        <span className="os-k">{kicker}</span>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </div>
  );
};

/* ---- DeterminismDemo — same seed renders identically ----------------- */
const DeterminismDemo = () => {
  const [seed, setSeed] = useState(48217);
  const sz = { w: 240, h: 150 };
  const data = useMemo(() => genVariant(seed, 'town'), [seed]);
  const refA = useReveal((c, p) => drawMini(c, data, sz, { progress: p, pad: 14, flora: false }), [data]);
  const refB = useReveal((c, p) => drawMini(c, data, sz, { progress: p, pad: 14, flora: false }), [data]);
  return (
    <div className="not-prose" style={{ border: '1px solid var(--os-br1)', borderRadius: '12px', background: 'var(--os-sf2)', padding: '22px', boxShadow: '0 1px 3px rgba(28, 24, 18, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--os-fm)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--os-t2)' }}>SEED</span>
        <span style={{ fontFamily: 'var(--os-fm)', fontSize: '15px', fontWeight: 700, color: 'var(--os-amber-t)' }}>{seed}</span>
        <button
          type="button"
          onClick={() => setSeed(Math.floor(Math.random() * 90000) + 10000)}
          style={{ marginLeft: 'auto', fontFamily: 'var(--os-fu)', fontSize: '12px', fontWeight: 600, color: 'var(--os-t0)', background: 'var(--os-sf3)', border: '1px solid var(--os-br2)', borderRadius: '3px', padding: '7px 13px', cursor: 'pointer' }}
        >
          Randomize seed
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {[refA, refB].map((r, i) => (
          <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #20262b', background: '#0c0e10', boxShadow: '0 12px 28px -22px rgba(28, 24, 18, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', fontFamily: 'var(--os-fm)', fontSize: '9px', letterSpacing: '0.06em', color: '#6c757d', borderBottom: '1px solid #1e2327' }}>
              <span>{i === 0 ? 'YOUR MACHINE' : 'TEAMMATE \u00b7 COOKED BUILD'}</span>
              <span style={{ color: '#72ae82' }}>{data.nodes.length} N</span>
            </div>
            <canvas ref={r} style={{ width: '100%', height: 'auto', display: 'block' }} aria-label="Settlement render" />
          </div>
        ))}
      </div>
      <p style={{ fontSize: '13px', color: 'var(--os-t1)', margin: '14px 0 0', lineHeight: 1.5 }}>
        Same seed, same settings &rarr; the same settlement, everywhere. Randomize to explore &mdash; lock it when the composition sings.
      </p>
    </div>
  );
};

/* ---- PhaseTag — inline tag for doc pages ----------------------------- */
const PhaseTag = ({ phase = 'layout', children }) => {
  const cls = { layout: 'os-phase-layout', build: 'os-phase-build', structure: 'os-phase-structure', ambient: 'os-phase-ambient' }[phase] || 'os-phase-layout';
  return <span className={'os-tag ' + cls}>{children || phase}</span>;
};

/* ---- ControlCenterExplorer — canonical v13 mockup + phase reader ------ */
const PHASES = [
  {
    id: 'layout', name: 'Layout', q: 'Where?', cls: 'os-phase-layout',
    kicker: 'Tab 1 · the footprint', title: 'Decide where the settlement lives',
    desc: 'Layout sets the silhouette — pattern, size, districts, and the zones every later layer inherits. It is the first read from the map view.',
    controls: [
      { n: 'Pattern strip', loc: 'Layout · top', d: 'Radial, Voronoi, Perlin, Axial, or Organic — the big shape of the place.' },
      { n: 'Settlement size & Num Nodes', loc: 'Layout · Settlement', d: 'Radius in centimetres and how many landmark nodes the pattern places.' },
      { n: 'Districts & Zones', loc: 'Layout · Zones table', d: 'Macro regions and weighted district tags (market, sacred, civic) that bias spawn.', v3: true },
      { n: 'Volumes & Anchors', loc: 'Canvas · edge docks', d: 'Inclusion / exclusion regions and fixed nodes you place by hand.' },
      { n: 'Atlas', loc: 'Canvas · fold-corner', d: 'Import a real place by name, file, or screenshot as the layout skeleton.', v3: true },
    ],
  },
  {
    id: 'build', name: 'Build', q: 'What?', cls: 'os-phase-build',
    kicker: 'Tab 2 · the fabric', title: 'Bring your own buildings',
    desc: 'Build is where your art lives. Assign meshes or Blueprints per tier; OmniScape places them with hand-built rhythm. Presets store the numbers — you bring the kit.',
    controls: [
      { n: 'Large / Medium / Small / Sprawl', loc: 'Build · tier tabs', d: 'Large is one landmark per node; medium and small fill the fabric and edges.' },
      { n: 'Asset slots (Mesh · Blueprint)', loc: 'Build · asset cards', d: 'Drop a static mesh for fast instancing or a Blueprint when you need logic.' },
      { n: 'Tier scale & per-node max', loc: 'Build · tier strip', d: 'Uniform size and how dense each node gets.' },
      { n: 'Cluster vs Roadside', loc: 'Build · placement', d: 'Rings around nodes, or plots that face and line the roads.' },
      { n: 'Edge Density (sprawl)', loc: 'Build · Sprawl tier', d: 'Fills the gaps between clusters and roads with small buildings.' },
    ],
  },
  {
    id: 'structure', name: 'Structure', q: 'How does it connect?', cls: 'os-phase-structure',
    kicker: 'Tab 3 · the connective tissue', title: 'Connect and enclose',
    desc: 'Structure ties the settlement together — roads that read like a real network, and walls that hug irregular sites with gates and towers.',
    controls: [
      { n: 'Roads — style & terrain', loc: 'Structure · Roads', d: 'Straight, curved, or natural; follow the ground, contour steep slopes, or level.' },
      { n: 'Road hierarchy', loc: 'Structure · Roads', d: 'Arterial, Collector, and Local classes with their own width and mesh.', v3: true },
      { n: 'Walls — shape & coverage', loc: 'Structure · Walls', d: 'Hull-hugging or grand ring, full loop or ruined gaps, angular to organic.' },
      { n: 'Gates, pillars & towers', loc: 'Structure · Walls', d: 'Auto, anchored, or evenly spaced gates; towers snap to the sharpest corners.', v3: true },
      { n: 'Landscape bake', loc: 'Structure · Terrain', d: 'Paint landscape layer weights from roads, pads, and walls.', beta: true },
    ],
  },
  {
    id: 'ambient', name: 'Ambient', q: 'Does it breathe?', cls: 'os-phase-ambient',
    kicker: 'Tab 4 · the life', title: 'Make it breathe',
    desc: 'Ambient is the final pass — vegetation, rock and debris that tell a story, plus optional fauna, audio, and a clean hand-off to your own PCG graphs.',
    controls: [
      { n: 'Flora layers', loc: 'Ambient · Flora', d: 'Vegetation, Rock, and Debris layers with density and distance bands.' },
      { n: 'Fauna', loc: 'Ambient · Fauna', d: 'Creature placement with building-distance rules and a global budget.', beta: true },
      { n: 'Audio zones', loc: 'Ambient · Audio', d: 'Per-zone ambient sound with real attenuation, sampled along roads.', beta: true },
      { n: 'PCG Hand-off', loc: 'Ambient · PCG', d: 'Export nodes, roads, walls, and footprints as tagged PCG point records.', beta: true },
    ],
  },
];
const PHASE_INDEX = { layout: 0, build: 1, structure: 2, ambient: 3 };

const ControlCenterExplorer = () => {
  const [phase, setPhase] = useState(0);
  const iframeRef = useRef(null);
  const active = PHASES[phase];

  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || e.data.type !== 'omniscape-tab') return;
      const idx = PHASE_INDEX[e.data.phase];
      if (idx != null) setPhase(idx);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const setPhaseRemote = (idx) => {
    setPhase(idx);
    const win = iframeRef.current && iframeRef.current.contentWindow;
    if (win) win.postMessage({ type: 'omniscape-set-tab', phase: PHASES[idx].id }, '*');
  };

  return (
    <div className="os-explorer not-prose">
      <div className="os-explorer-device">
        <div className="os-cc-frame-wrap">
          <div className="os-cc-frame-label">
            <span>Control Center v13</span>
            <span className="os-cc-frame-badge">Canonical mockup</span>
          </div>
          <MockupFrame
            iframeRef={iframeRef}
            title="OmniScape Control Center — interactive mockup"
            loading="lazy"
          />
        </div>
      </div>
      <div className={'os-explorer-read ' + active.cls}>
        <div className="os-xr-phasebar" role="tablist" aria-label="Workflow phases">
          {PHASES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={phase === i}
              data-active={phase === i}
              className={'os-xr-phase ' + p.cls}
              onClick={() => setPhaseRemote(i)}
            >
              <span className="os-xr-num">0{i + 1}</span>
              <span className="os-xr-name">{p.name}</span>
              <span className="os-xr-q">{p.q}</span>
            </button>
          ))}
        </div>
        <div className="os-xr-body">
          <p className="os-xr-kicker">{active.kicker}</p>
          <h3 className="os-xr-title">{active.title}</h3>
          <p className="os-xr-desc">{active.desc}</p>
          <p className="os-xr-hint">Click tabs in the panel — or use the phase buttons above — to explore each layer.</p>
          <div className="os-xr-controls">
            {active.controls.map((c) => (
              <div className="os-xr-ctrl" key={c.n}>
                <span className="os-xr-ctrl-name">
                  {c.n}
                  {c.beta ? <span className="os-xr-beta">BETA</span> : null}
                  {c.v3 ? <span className="os-xr-beta">v3.0</span> : null}
                </span>
                <span className="os-xr-ctrl-loc">{c.loc}</span>
                <span className="os-xr-ctrl-desc">{c.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---- OsRevealBoot — scroll reveal (mint dev does not load reveal.js) -- */
const OsRevealBoot = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    const reveal = (el) => el.classList.add('is-in');
    const vh = window.innerHeight || 640;

    const revealInView = () => {
      document.querySelectorAll('.os-reveal:not(.is-in)').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.96) reveal(el);
      });
    };

    revealInView();

    let io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              reveal(e.target);
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      document.querySelectorAll('.os-reveal:not(.is-in)').forEach((n) => io.observe(n));
    } else {
      document.querySelectorAll('.os-reveal').forEach(reveal);
    }

    document.documentElement.classList.add('os-reveal-ready');

    const rescan = () => window.requestAnimationFrame(revealInView);
    const mo = new MutationObserver(rescan);
    mo.observe(document.body, { childList: true, subtree: true });

    const safety = window.setTimeout(() => {
      document.querySelectorAll('.os-landing .os-reveal:not(.is-in)').forEach(reveal);
    }, 1500);

    return () => {
      mo.disconnect();
      if (io) io.disconnect();
      window.clearTimeout(safety);
      document.documentElement.classList.remove('os-reveal-ready');
    };
  }, []);

  return null;
};

return {
  HeroPanel,
  CinematicHero,
  WorkflowSpectrum,
  IntentTile,
  DeterminismDemo,
  PhaseTag,
  OsRevealBoot,
  ControlCenterExplorer,
};
})();
