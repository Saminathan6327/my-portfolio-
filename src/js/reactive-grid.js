/**
 * Reactive Grid (Proximity Hover) — Originkit Component Port for Vanilla JS
 * Dynamically scales shapes in a grid layout based on cursor proximity.
 */

const DEFAULTS = {
    shape: "rounded", // "square" | "rounded" | "circle" | "triangle" | "diamond" | "hexagon" | "star"
    fill: "solid", // "solid" | "stroke"
    strokeWidth: 1.5,
    particleColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "transparent",
    maxSize: 32,
    minSize: 8,
    gap: 6,
    influence: 260,
};

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export function initReactiveGrid(container, options = {}) {
    if (!container) return null;

    const p = { ...DEFAULTS, ...options };

    // Ensure container has relative positioning
    const containerStyle = window.getComputedStyle(container);
    if (containerStyle.position === "static") {
        container.style.position = "relative";
    }

    // Create Canvas Element
    const canvas = document.createElement("canvas");
    canvas.className = "reactive-grid-canvas";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "0";

    // Prepend canvas so it stays in background
    container.insertBefore(canvas, container.firstChild);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    let rafId = null;
    let mouse = null;
    let sizeState = { w: 0, h: 0, dpr: 1 };
    let currentSizes = new Float32Array(0);

    const syncSize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        if (sizeState.w === w && sizeState.h === h && sizeState.dpr === dpr) return;
        sizeState = { w, h, dpr };
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const buildPath = (cx, cy, s, shp) => {
        const half = s / 2;
        ctx.beginPath();
        switch (shp) {
            case "circle":
                ctx.arc(cx, cy, half, 0, Math.PI * 2);
                break;
            case "rounded": {
                const r = Math.min(half, s * 0.28);
                const x = cx - half;
                const y = cy - half;
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + s, y, x + s, y + s, r);
                ctx.arcTo(x + s, y + s, x, y + s, r);
                ctx.arcTo(x, y + s, x, y, r);
                ctx.arcTo(x, y, x + s, y, r);
                ctx.closePath();
                break;
            }
            case "triangle":
                ctx.moveTo(cx, cy - half);
                ctx.lineTo(cx + half, cy + half);
                ctx.lineTo(cx - half, cy + half);
                ctx.closePath();
                break;
            case "diamond":
                ctx.moveTo(cx, cy - half);
                ctx.lineTo(cx + half, cy);
                ctx.lineTo(cx, cy + half);
                ctx.lineTo(cx - half, cy);
                ctx.closePath();
                break;
            case "hexagon":
                for (let k = 0; k < 6; k++) {
                    const a = ((-90 + 60 * k) * Math.PI) / 180;
                    const px = cx + half * Math.cos(a);
                    const py = cy + half * Math.sin(a);
                    if (k === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                break;
            case "star": {
                const inner = half * 0.5;
                for (let k = 0; k < 10; k++) {
                    const rad = k % 2 === 0 ? half : inner;
                    const a = ((-90 + 36 * k) * Math.PI) / 180;
                    const px = cx + rad * Math.cos(a);
                    const py = cy + rad * Math.sin(a);
                    if (k === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                break;
            }
            default: // "square"
                ctx.rect(cx - half, cy - half, s, s);
        }
    };

    const draw = () => {
        syncSize();
        const { w, h } = sizeState;
        if (w === 0 || h === 0) {
            rafId = requestAnimationFrame(draw);
            return;
        }

        const isStroke = p.fill === "stroke";

        ctx.clearRect(0, 0, w, h);

        if (p.backgroundColor && p.backgroundColor !== "transparent") {
            ctx.fillStyle = p.backgroundColor;
            ctx.fillRect(0, 0, w, h);
        }

        const cell = Math.max(1, p.maxSize + p.gap);
        const cols = Math.max(1, Math.floor(w / cell));
        const rows = Math.max(1, Math.floor(h / cell));
        const offX = (w - cols * cell) / 2 + cell / 2;
        const offY = (h - rows * cell) / 2 + cell / 2;
        const count = cols * rows;

        if (currentSizes.length !== count) {
            currentSizes = new Float32Array(count).fill(p.minSize);
        }

        ctx.fillStyle = p.particleColor;
        ctx.strokeStyle = p.particleColor;
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(0.5, p.strokeWidth);

        const radius = Math.max(1, p.influence);
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const idx = j * cols + i;
                const cx = offX + i * cell;
                const cy = offY + j * cell;
                let infl = 0;
                if (mouse) {
                    const dx = mouse.x - cx;
                    const dy = mouse.y - cy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    infl = clamp(1 - dist / radius, 0, 1);
                }
                const target = lerp(p.minSize, p.maxSize, infl);
                const cur = lerp(currentSizes[idx] || p.minSize, target, 0.2);
                currentSizes[idx] = cur;
                if (cur <= 0.2) continue;
                buildPath(cx, cy, cur, p.shape);
                if (isStroke) ctx.stroke();
                else ctx.fill();
            }
        }
        rafId = requestAnimationFrame(draw);
    };

    const onMove = (e) => {
        const rect = container.getBoundingClientRect();
        mouse = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const onLeave = () => {
        mouse = null;
    };

    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(container);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    rafId = requestAnimationFrame(draw);

    return {
        updateOptions: (newOpts) => {
            Object.assign(p, newOpts);
        },
        destroy: () => {
            ro.disconnect();
            container.removeEventListener("pointermove", onMove);
            container.removeEventListener("pointerleave", onLeave);
            if (rafId) cancelAnimationFrame(rafId);
            canvas.remove();
        }
    };
}
