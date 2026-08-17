/**
 * Physics-Driven Magic/Spin Cursor (Originkit MagicCursor Engine)
 * Features exponential follow smoothing, velocity-based rotation, stretch & squash physics, and neon glow.
 */

const FOLLOW_TAU = 0.02;
const VELOCITY_TAU = 0.05;

const ARROW = "M0,0 L18,11 L9,13 L6,21 Z";
const ARROW_W = 18;
const ARROW_H = 21;
const ARROW_REST = Math.atan2(-15, -12);

function angleDelta(from, to) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function initMagicCursor(options = {}) {
  const defaults = {
    fillColor: "#16E263",
    cursorSize: 14,
    enableStretch: false,
    enableGlow: false,
    glowColor: "#16E263",
    glowIntensity: 50,
    hideNative: true,
  };

  const opts = { ...defaults, ...options };

  // Create Style Tag for cursor hiding
  let tag = document.getElementById("magic-cursor-style");
  if (!tag && opts.hideNative) {
    tag = document.createElement("style");
    tag.id = "magic-cursor-style";
    tag.textContent = `
      body, a, button, input, textarea, select, [role="button"] {
        cursor: none !important;
      }
    `;
    document.head.appendChild(tag);
  }

  // Create Host Container
  let host = document.getElementById("magic-cursor-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "magic-cursor-host";
    host.style.position = "fixed";
    host.style.top = "0";
    host.style.left = "0";
    host.style.pointerEvents = "none";
    host.style.zIndex = "999999";
    host.style.transformOrigin = "0 0";
    host.style.opacity = "0";
    host.style.willChange = "transform";
    document.body.appendChild(host);
  }

  // Glow Filter
  if (opts.enableGlow) {
    const t = Math.max(0, Math.min(100, opts.glowIntensity)) / 100;
    const core = (6 * t).toFixed(2);
    const bloom = (18 * t).toFixed(2);
    host.style.filter = `drop-shadow(0 0 ${core}px ${opts.glowColor}) drop-shadow(0 0 ${bloom}px ${opts.glowColor})`;
  }

  // Render SVG Arrow
  host.innerHTML = `
    <svg width="${ARROW_W}" height="${ARROW_H}" viewBox="0 0 ${ARROW_W} ${ARROW_H}" style="display: block; overflow: visible;" aria-hidden="true">
      <path d="${ARROW}" fill="${opts.fillColor}" stroke="rgba(0,0,0,0.4)" stroke-width="0.8" stroke-linejoin="round" />
    </svg>
  `;

  let targetX = -9999;
  let targetY = -9999;
  let x = targetX;
  let y = targetY;
  let vx = 0;
  let vy = 0;
  let angle = 0;
  let pressed = 0;
  let down = false;
  let seen = false;
  let inside = false;

  const onMove = (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!seen || !inside) {
      x = targetX;
      y = targetY;
      vx = 0;
      vy = 0;
      seen = true;
    }
    inside = true;
  };

  const onLeave = () => {
    inside = false;
  };

  const onDown = () => {
    down = true;
  };

  const onUp = () => {
    down = false;
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });

  let rafId = 0;
  let last = performance.now();

  const frame = (now) => {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;

    const followEase = 1 - Math.exp(-dt / FOLLOW_TAU);
    const prevX = x;
    const prevY = y;
    x += (targetX - x) * followEase;
    y += (targetY - y) * followEase;

    if (dt > 0) {
      const vEase = 1 - Math.exp(-dt / VELOCITY_TAU);
      vx += ((x - prevX) / dt - vx) * vEase;
      vy += ((y - prevY) / dt - vy) * vEase;
    }

    const speed = Math.hypot(vx, vy);

    if (speed > 40) {
      const target = Math.atan2(vy, vx) - ARROW_REST;
      angle += angleDelta(angle, target) * (1 - Math.exp(-dt / 0.06));
    }

    const stretch = opts.enableStretch ? 1 + Math.min(speed / 3000, 0.35) : 1;
    const squash = opts.enableStretch ? 1 / Math.sqrt(stretch) : 1;

    const clickTarget = down ? 1 : 0;
    pressed += (clickTarget - pressed) * (1 - Math.exp(-dt / 0.05));
    const press = 1 - pressed * 0.25;

    const s = (opts.cursorSize / ARROW_H) * press;
    host.style.opacity = seen && inside ? "1" : "0";
    host.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad) scale(${s * squash}, ${s * stretch})`;

    rafId = requestAnimationFrame(frame);
  };

  rafId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(rafId);
    if (tag) tag.remove();
    if (host) host.remove();
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
  };
}
