/**
 * Neon Border Engine (Originkit NeonBorder - Custom Style 2 Preset)
 * Renders twin orbiting conic neon light streaks with multi-layered glow bloom.
 */

const DEFAULTS = {
  color: "#1BB754",
  rounded: 39,
  thickness: 2,
  borderSize: 25,
  glow: 100,
  speed: 16,
};

const GLOW_LAYERS = [
  { blur: 8, opacity: 0.5, reach: 0.3 },
  { blur: 15, opacity: 0.3, reach: 0.6 },
  { blur: 40, opacity: 0.2, reach: 1 },
];

const MAX_GLOW_BLUR = 40;
const MAX_GLOW_REACH = 36;
const ARC_SAMPLES = 24;
const MIN_ARC = 0.015;

function withAlpha(input, alpha) {
  const a = Math.max(0, Math.min(1, alpha));
  if (typeof input !== "string") return `rgba(27,183,84,${a})`;
  const s = input.trim();
  const hex = s.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) {
      h = h.split("").map((c) => c + c).join("");
    }
    const n = parseInt(h.slice(0, 6), 16);
    if (!Number.isFinite(n)) return `rgba(27,183,84,${a})`;
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  return `rgba(27,183,84,${a})`;
}

function perimeterPoint(u, w, h) {
  const d = (((u % 1) + 1) % 1) * 2 * (w + h);
  if (d < w) return [d, 0];
  if (d < w + h) return [w, d - w];
  if (d < w * 2 + h) return [w - (d - w - h), h];
  return [0, h - (d - w * 2 - h)];
}

function cornerLap(k, w, h) {
  const p = 2 * (w + h);
  const at = [0, w / p, (w + h) / p, (w * 2 + h) / p];
  return Math.floor(k / 4) + at[((k % 4) + 4) % 4];
}

function perimeterAngle(u, w, h) {
  const [x, y] = perimeterPoint(u, w, h);
  return (Math.atan2(x - w / 2, h / 2 - y) * 180) / Math.PI;
}

function buildArc(lap, lengthPct, w, h, color) {
  const fw = w > 0 ? w : 100;
  const fh = h > 0 ? h : 100;

  const len = Math.max(0, Math.min(100, lengthPct));
  const span = Math.max(MIN_ARC, (len / 100) * 0.5);
  const solidT = len / 100;

  const stops = [];
  let base = 0;
  let prev = 0;
  let acc = 0;

  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const f = i / ARC_SAMPLES;
    const angle = perimeterAngle(lap + (f - 0.5) * span, fw, fh);
    if (i === 0) {
      base = angle;
    } else {
      let d = angle - prev;
      while (d > 180) d -= 360;
      while (d < -180) d += 360;
      acc += d;
    }
    prev = angle;

    const t = Math.abs(f - 0.5) * 2;
    const k = solidT >= 1 ? 1 : t <= solidT ? 1 : 1 - (t - solidT) / (1 - solidT);
    stops.push(`${withAlpha(color, k * k * (3 - 2 * k))} ${acc.toFixed(2)}deg`);
  }

  const end = acc.toFixed(2);
  stops.push(`${withAlpha(color, 0)} ${end}deg`);
  stops.push(`${withAlpha(color, 0)} 360deg`);

  return `conic-gradient(from ${base.toFixed(2)}deg at 50% 50%, ${stops.join(", ")})`;
}

const SLOWEST_CYCLE = 30;
const FASTEST_CYCLE = 4;

export function initNeonBorder(container, options = {}) {
  if (!container) return null;

  const opts = { ...DEFAULTS, ...options };

  container.style.position = "relative";

  const wrapper = document.createElement("div");
  wrapper.className = "neon-border-wrapper";
  wrapper.style.position = "absolute";
  wrapper.style.inset = "0";
  wrapper.style.pointerEvents = "none";
  wrapper.style.zIndex = "4";
  wrapper.style.overflow = "visible";

  container.appendChild(wrapper);

  const rect = container.getBoundingClientRect();
  let w = rect.width || 380;
  let h = rect.height || 480;

  const radius = (Math.max(0, Math.min(100, opts.rounded)) / 100) * (Math.min(w, h) / 2);
  container.style.borderRadius = `${radius}px`;

  const groupA = document.createElement("div");
  const groupB = document.createElement("div");

  [groupA, groupB].forEach((g) => {
    g.style.position = "absolute";
    g.style.inset = "0";
    g.style.overflow = "visible";
    g.style.pointerEvents = "none";
    wrapper.appendChild(g);
  });

  const BAND_MASK_STYLE = `
    -webkit-mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
    -webkit-mask-clip: content-box, border-box;
    -webkit-mask-composite: xor;
    mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
    mask-clip: content-box, border-box;
    mask-composite: exclude;
  `;

  function createGlowGroup(groupEl, initialStart) {
    groupEl.innerHTML = "";

    const glowOuter = 10 + MAX_GLOW_REACH + MAX_GLOW_BLUR * 2;
    const amount = Math.max(0, Math.min(100, opts.glow)) / 100;
    const ringAt = (share) => opts.thickness + amount * MAX_GLOW_REACH * share;

    if (amount > 0) {
      GLOW_LAYERS.forEach((l, i) => {
        const r = ringAt(l.reach);
        const layer = document.createElement("div");
        layer.style.cssText = `
          position: absolute;
          inset: -${glowOuter}px;
          box-sizing: border-box;
          padding: ${glowOuter}px;
          border-radius: ${radius > 0 ? radius + glowOuter : 0}px;
          opacity: ${l.opacity};
          mix-blend-mode: plus-lighter;
          filter: blur(${l.blur}px);
          -webkit-filter: blur(${l.blur}px);
          ${BAND_MASK_STYLE}
        `;

        const band = document.createElement("div");
        band.style.cssText = `
          position: absolute;
          inset: -${r}px;
          box-sizing: border-box;
          padding: ${r}px;
          border-radius: ${radius > 0 ? radius + r : 0}px;
          background: var(--arc);
          ${BAND_MASK_STYLE}
        `;

        layer.appendChild(band);
        groupEl.appendChild(layer);
      });
    }

    for (let i = 0; i < 2; i++) {
      const edge = document.createElement("div");
      edge.style.cssText = `
        position: absolute;
        inset: 0;
        mix-blend-mode: plus-lighter;
      `;
      const band = document.createElement("div");
      band.style.cssText = `
        position: absolute;
        inset: -${opts.thickness}px;
        box-sizing: border-box;
        padding: ${opts.thickness}px;
        border-radius: ${radius > 0 ? radius + opts.thickness : 0}px;
        background: var(--arc);
        ${BAND_MASK_STYLE}
      `;
      edge.appendChild(band);
      groupEl.appendChild(edge);
    }
  }

  createGlowGroup(groupA, 0);
  createGlowGroup(groupB, 0.5);

  let rafId = 0;
  let last = performance.now();
  let lap = 0;
  let corner = 0;
  let stepT = 0;

  const updateSize = () => {
    const r = container.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      w = r.width;
      h = r.height;
    }
  };

  const ro = new ResizeObserver(updateSize);
  ro.observe(container);
  updateSize();

  const frame = (now) => {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;

    const s = Math.max(0, Math.min(20, opts.speed));
    if (s > 0) {
      const beat = (SLOWEST_CYCLE + ((FASTEST_CYCLE - SLOWEST_CYCLE) * (s - 1)) / 19) / 4;
      stepT += dt / beat;
      while (stepT >= 1) {
        stepT -= 1;
        corner += 1;
      }
      const eased = stepT;
      const from = cornerLap(corner, w, h);
      const to = cornerLap(corner + 1, w, h);
      lap = from + (to - from) * eased;

      groupA.style.setProperty("--arc", buildArc(lap, opts.borderSize, w, h, opts.color));
      groupB.style.setProperty("--arc", buildArc(lap + 0.5, opts.borderSize, w, h, opts.color));
    }

    rafId = requestAnimationFrame(frame);
  };

  rafId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    wrapper.remove();
  };
}
