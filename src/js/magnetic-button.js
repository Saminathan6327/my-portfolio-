/**
 * Magnetic Hover Button Engine (Originkit MagneticButton - Custom Style Preset)
 * Provides spring magnetic pointer attraction, green #0D962D radial sweep, and box shadow elevation.
 */

const RANGE_PER_POINT = 18;
const MAX_PULL = 0.5;

export function initMagneticButtons(options = {}) {
  const defaults = {
    magnet: 6,
    stiffness: 0.25,
    damping: 0.7,
    sweepColor: "#0D962D",
    sweepTextColor: "#FFFFFF",
  };

  const opts = { ...defaults, ...options };

  // Inject Base CSS for radial sweep & hover box-shadows
  let styleTag = document.getElementById("magnetic-button-styles");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "magnetic-button-styles";
    styleTag.textContent = `
      .btn, .btn-primary, .btn-accent, .btn-outline {
        position: relative !important;
        overflow: hidden !important;
        box-shadow: 0 8px 22px rgba(0,0,0,0.14);
        transition: box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease, color 0.3s ease !important;
        will-change: transform;
      }
      .btn:hover, .btn-primary:hover, .btn-accent:hover, .btn-outline:hover {
        box-shadow: 0 16px 40px rgba(0,0,0,0.28) !important;
      }
      .btn-sweep-span {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        transform: scale(0);
        transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.25s ease;
        z-index: 0;
        opacity: 0;
      }
      .btn.is-magnetic-hover .btn-sweep-span {
        transform: scale(1);
        opacity: 1;
      }
      .btn > *:not(.btn-sweep-span) {
        position: relative;
        z-index: 1;
      }
    `;
    document.head.appendChild(styleTag);
  }

  const buttons = document.querySelectorAll(".btn, .btn-primary, .btn-accent, .btn-outline, .terminal-chip");

  buttons.forEach((btn) => {
    let sweepSpan = btn.querySelector(".btn-sweep-span");
    if (!sweepSpan) {
      sweepSpan = document.createElement("span");
      sweepSpan.className = "btn-sweep-span";
      sweepSpan.style.background = opts.sweepColor;
      btn.appendChild(sweepSpan);
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHover = false;
    let rafId = 0;

    const pull = (opts.magnet / 20) * MAX_PULL;
    const reach = opts.magnet * RANGE_PER_POINT;

    function update() {
      currentX += (targetX - currentX) * opts.stiffness;
      currentY += (targetY - currentY) * opts.stiffness;

      btn.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05 || isHover) {
        rafId = requestAnimationFrame(update);
      } else {
        btn.style.transform = `translate3d(0px, 0px, 0)`;
      }
    }

    function onPointerMove(e) {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2 - currentX;
      const cy = rect.top + rect.height / 2 - currentY;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (inside && !isHover) {
        isHover = true;
        btn.classList.add("is-magnetic-hover");

        const lx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const ly = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        const d = 2.4 * Math.hypot(rect.width, rect.height);

        sweepSpan.style.left = `${lx}px`;
        sweepSpan.style.top = `${ly}px`;
        sweepSpan.style.width = `${d}px`;
        sweepSpan.style.height = `${d}px`;
        sweepSpan.style.marginLeft = `-${d / 2}px`;
        sweepSpan.style.marginTop = `-${d / 2}px`;
      } else if (!inside && isHover) {
        isHover = false;
        btn.classList.remove("is-magnetic-hover");
      }

      const edgeX = Math.max(0, Math.abs(dx) - rect.width / 2);
      const edgeY = Math.max(0, Math.abs(dy) - rect.height / 2);
      const gap = Math.hypot(edgeX, edgeY);

      if (gap > reach) {
        targetX = 0;
        targetY = 0;
      } else {
        const falloff = reach === 0 ? 0 : 1 - gap / reach;
        targetX = dx * pull * falloff;
        targetY = dy * pull * falloff;
      }

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    }

    function onPointerLeave() {
      targetX = 0;
      targetY = 0;
      isHover = false;
      btn.classList.remove("is-magnetic-hover");
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    }

    window.addEventListener("pointermove", onPointerMove);
    btn.addEventListener("pointerleave", onPointerLeave);
  });
}
