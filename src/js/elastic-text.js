/**
 * Elastic Stretchy Text Engine (Originkit StretchyText)
 * Interactive spring-drag physics for text glyph chains.
 */

const DRAG_SPRING = { stiffness: 520, damping: 38, mass: 0.4 };
const RELEASE_SPRING = { stiffness: 240, damping: 13, mass: 0.75 };

export function initElasticText(container, options = {}) {
  if (!container) return null;

  const defaults = {
    text: "saminathan_",
    color: "var(--text-primary)",
    accentColor: "var(--accent-primary)",
    follow: 3,
  };

  const opts = { ...defaults, ...options };
  const chars = Array.from(opts.text);
  const followStrength = Math.min(20, Math.max(0, opts.follow)) / 20;

  container.innerHTML = "";
  container.style.display = "inline-flex";
  container.style.alignItems = "center";
  container.style.userSelect = "none";
  container.style.webkitUserSelect = "none";

  const letterNodes = [];
  const state = chars.map(() => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    targetX: 0,
    targetY: 0,
  }));

  chars.forEach((char, i) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char;
    span.style.display = "inline-block";
    span.style.cursor = "grab";
    span.style.touchAction = "none";
    span.style.willChange = "transform";
    span.style.transition = "color 0.3s ease";

    if (char === "_") {
      span.style.color = opts.accentColor;
    } else {
      span.style.color = opts.color;
    }

    container.appendChild(span);
    letterNodes.push(span);
  });

  let dragging = false;
  let activeIndex = -1;
  let originX = 0;
  let originY = 0;
  let rafId = 0;

  function physicsLoop() {
    let active = false;

    state.forEach((s, i) => {
      const spring = dragging ? DRAG_SPRING : RELEASE_SPRING;
      const k = spring.stiffness * 0.001;
      const d = 1 - spring.damping * 0.02;

      const fx = (s.targetX - s.x) * k;
      const fy = (s.targetY - s.y) * k;

      s.vx = (s.vx + fx) * d;
      s.vy = (s.vy + fy) * d;

      s.x += s.vx;
      s.y += s.vy;

      letterNodes[i].style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;

      if (Math.abs(s.vx) > 0.01 || Math.abs(s.vy) > 0.01 || Math.abs(s.targetX - s.x) > 0.01 || dragging) {
        active = true;
      }
    });

    if (active) {
      rafId = requestAnimationFrame(physicsLoop);
    }
  }

  function onPointerDown(index, event) {
    if (event.button !== 0) return;
    event.preventDefault();

    dragging = true;
    activeIndex = index;
    originX = event.clientX;
    originY = event.clientY;

    letterNodes[index].style.cursor = "grabbing";

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(physicsLoop);
  }

  function onPointerMove(event) {
    if (!dragging || activeIndex < 0) return;

    const deltaX = event.clientX - originX;
    const deltaY = event.clientY - originY;

    state.forEach((s, i) => {
      const distance = Math.abs(i - activeIndex);
      const strength = Math.pow(followStrength, distance);

      s.targetX = deltaX * strength;
      s.targetY = deltaY * strength;
    });
  }

  function onPointerUp() {
    if (!dragging) return;

    if (activeIndex >= 0 && letterNodes[activeIndex]) {
      letterNodes[activeIndex].style.cursor = "grab";
    }

    dragging = false;
    activeIndex = -1;

    state.forEach((s) => {
      s.targetX = 0;
      s.targetY = 0;
    });

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  }

  letterNodes.forEach((node, i) => {
    node.addEventListener("pointerdown", (e) => onPointerDown(i, e));
  });

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  };
}
