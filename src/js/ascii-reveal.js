/**
 * ASCII Image Reveal Effect (Originkit AsciiImage Shader Engine)
 * Renders portrait image as interactive ASCII character art with a fluid cursor blob reveal lens.
 */

const DEFAULTS = {
  fit: "cover",
  focusY: 20,
  columns: 140,
  ramp: " .:-=+*#%@",
  invert: false,
  contrast: 110,
  colorMode: "mono",
  inkColor: "#10b981",
  reveal: true,
  revealOptions: { size: 75, softness: 18 },
};

const contrastAt = (value) => 0.5 + (value / 100) * 2;
const clampFocus = (value) => Math.min(100, Math.max(0, typeof value === "number" ? value : 50));

function placeRect(imgW, imgH, boxW, boxH, fit, focusY) {
  const scale = fit === "contain"
    ? Math.min(boxW / imgW, boxH / imgH)
    : Math.max(boxW / imgW, boxH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const f = fit === "cover" ? clampFocus(focusY) / 100 : 0.5;
  return { dx: (boxW - dw) / 2, dy: (boxH - dh) * f, dw, dh };
}

export function initAsciiReveal(canvasEl, options = {}) {
  if (!canvasEl) return null;

  const opts = { ...DEFAULTS, ...options };
  const revealOptions = { ...DEFAULTS.revealOptions, ...options.revealOptions };

  const ctx = canvasEl.getContext("2d");
  if (!ctx) return null;

  let sampler = document.createElement("canvas");
  let off = document.createElement("canvas");
  let revealCanvas = document.createElement("canvas");
  let maskCanvas = document.createElement("canvas");

  let imgRef = null;
  const BLOB_COUNT = 5;
  const blobs = Array.from({ length: BLOB_COUNT }, () => ({ x: 0, y: 0 }));
  let seeded = false;

  const pointer = { x: -9999, y: -9999, inside: false };
  let rafId = 0;
  let alive = true;
  let coverRect = { dx: 0, dy: 0, dw: 0, dh: 0 };

  const chars = opts.ramp && opts.ramp.length > 0 ? opts.ramp : DEFAULTS.ramp;
  const punch = contrastAt(opts.contrast);

  function getSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvasEl.clientWidth || 400;
    const h = canvasEl.clientHeight || 500;
    return { w, h, dpr };
  }

  function buildFallbackAscii(cols, rows, cellW, cellH, fontPx) {
    off.width = canvasEl.width;
    off.height = canvasEl.height;
    const octx = off.getContext("2d");
    if (!octx) return;

    octx.clearRect(0, 0, off.width, off.height);
    octx.font = fontPx.toFixed(2) + "px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    octx.textBaseline = "top";

    const last = chars.length - 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = (c / cols - 0.5) * 2;
        const ny = (r / rows - 0.45) * 2;

        const headDist = Math.pow(nx * 1.15, 2) + Math.pow(ny * 1.3, 2);
        const shoulderDist = Math.pow(nx * 0.6, 2) + Math.pow((ny - 0.7) * 2.2, 2);
        const eyeL = Math.pow((nx + 0.25) * 3, 2) + Math.pow((ny + 0.1) * 4, 2);
        const eyeR = Math.pow((nx - 0.25) * 3, 2) + Math.pow((ny + 0.1) * 4, 2);

        let lum = 0;
        if (headDist < 0.45 || shoulderDist < 0.65) {
          lum = 0.5 + 0.35 * Math.sin(c * 0.35 + r * 0.25);
          if (eyeL < 0.18 || eyeR < 0.18) lum = 0.9;
        } else if (headDist < 0.62) {
          lum = 0.25;
        }

        if (lum < 0.08) continue;
        const ch = chars[Math.floor(lum * last)];
        if (ch === " ") continue;

        octx.fillStyle = opts.inkColor;
        octx.fillText(ch, c * cellW, r * cellH);
      }
    }
  }

  function buildAscii() {
    const { w, h, dpr } = getSize();
    canvasEl.width = Math.max(1, Math.round(w * dpr));
    canvasEl.height = Math.max(1, Math.round(h * dpr));

    const cols = Math.max(8, Math.round(opts.columns));
    const cellW = (w * dpr) / cols;
    const fontPx = cellW * 1.65;
    const cellH = fontPx;
    const rows = Math.max(1, Math.floor((h * dpr) / cellH));

    if (!imgRef) {
      buildFallbackAscii(cols, rows, cellW, cellH, fontPx);
      return;
    }

    sampler.width = cols;
    sampler.height = rows;
    const sctx = sampler.getContext("2d", { willReadFrequently: true });
    if (!sctx) {
      buildFallbackAscii(cols, rows, cellW, cellH, fontPx);
      return;
    }

    const place = placeRect(
      imgRef.width,
      imgRef.height,
      canvasEl.width,
      canvasEl.height,
      opts.fit,
      opts.focusY
    );

    sctx.clearRect(0, 0, cols, rows);
    sctx.drawImage(
      imgRef,
      place.dx / cellW,
      place.dy / cellH,
      place.dw / cellW,
      place.dh / cellH
    );

    let data;
    try {
      data = sctx.getImageData(0, 0, cols, rows).data;
    } catch (e) {
      buildFallbackAscii(cols, rows, cellW, cellH, fontPx);
      coverRect = place;
      return;
    }

    off.width = canvasEl.width;
    off.height = canvasEl.height;
    const octx = off.getContext("2d");
    if (!octx) return;

    octx.clearRect(0, 0, off.width, off.height);
    octx.font = fontPx.toFixed(2) + "px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    octx.textBaseline = "top";

    const last = chars.length - 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = (r * cols + c) * 4;
        const rr = data[i];
        const gg = data[i + 1];
        const bb = data[i + 2];
        let lum = (0.299 * rr + 0.587 * gg + 0.114 * bb) / 255;
        lum = (lum - 0.5) * punch + 0.5;
        if (opts.invert) lum = 1 - lum;
        lum = lum < 0 ? 0 : lum > 1 ? 1 : lum;
        const ch = chars[Math.round(lum * last)];
        if (ch === " ") continue;

        octx.fillStyle =
          opts.colorMode === "image"
            ? `rgb(${Math.min(255, rr + 30)}, ${Math.min(255, gg + 30)}, ${Math.min(255, bb + 30)})`
            : opts.inkColor;
        octx.fillText(ch, c * cellW, r * cellH);
      }
    }

    coverRect = place;
  }

  function ensureLayer(layerCanvas) {
    if (layerCanvas.width !== canvasEl.width || layerCanvas.height !== canvasEl.height) {
      layerCanvas.width = canvasEl.width;
      layerCanvas.height = canvasEl.height;
    }
    return layerCanvas;
  }

  function updateBlobs() {
    if (blobs.length === 0) return;
    const { dpr } = getSize();
    const tx = pointer.x * dpr;
    const ty = pointer.y * dpr;

    if (!seeded) {
      for (const blob of blobs) {
        blob.x = tx;
        blob.y = ty;
      }
      seeded = true;
      return;
    }

    blobs[0].x += (tx - blobs[0].x) * 0.35;
    blobs[0].y += (ty - blobs[0].y) * 0.35;
    for (let i = 1; i < blobs.length; i++) {
      blobs[i].x += (blobs[i - 1].x - blobs[i].x) * 0.35;
      blobs[i].y += (blobs[i - 1].y - blobs[i].y) * 0.35;
    }
  }

  function paint() {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.drawImage(off, 0, 0);

    if (!opts.reveal || !pointer.inside || !imgRef) return;

    const { dpr } = getSize();
    const photo = ensureLayer(revealCanvas);
    const pctx = photo.getContext("2d");
    const mask = ensureLayer(maskCanvas);
    const mctx = mask.getContext("2d");
    if (!pctx || !mctx) return;

    pctx.globalCompositeOperation = "source-over";
    pctx.clearRect(0, 0, photo.width, photo.height);
    pctx.drawImage(
      imgRef,
      coverRect.dx,
      coverRect.dy,
      coverRect.dw,
      coverRect.dh
    );

    mctx.clearRect(0, 0, mask.width, mask.height);
    mctx.save();
    mctx.filter = `blur(${(revealOptions.softness * dpr).toFixed(1)}px)`;
    mctx.fillStyle = "#FFFFFF";
    for (let i = 0; i < blobs.length; i++) {
      const t = blobs.length <= 1 ? 0 : i / (blobs.length - 1);
      const radius = revealOptions.size * dpr * (1 - t * 0.5);
      mctx.beginPath();
      mctx.arc(blobs[i].x, blobs[i].y, radius, 0, Math.PI * 2);
      mctx.fill();
    }
    mctx.restore();

    pctx.globalCompositeOperation = "destination-in";
    pctx.drawImage(mask, 0, 0);
    pctx.globalCompositeOperation = "source-over";
    ctx.drawImage(photo, 0, 0);
  }

  function loop() {
    if (!alive) return;
    updateBlobs();
    paint();
    rafId = requestAnimationFrame(loop);
  }

  function onMove(event) {
    const rect = canvasEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    pointer.x = x;
    pointer.y = y;
    pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
  }

  function onLeave() {
    pointer.inside = false;
    seeded = false;
  }

  const img = new Image();
  if (
    options.src &&
    (options.src.startsWith("http://") || options.src.startsWith("https://")) &&
    typeof window !== "undefined" &&
    !options.src.includes(window.location.host)
  ) {
    img.crossOrigin = "anonymous";
  }

  img.onload = () => {
    if (!alive) return;
    imgRef = img;
    buildAscii();
    paint();
    if (opts.reveal && !rafId) rafId = requestAnimationFrame(loop);
  };

  img.onerror = () => {
    if (!alive) return;
    buildAscii();
    paint();
    if (opts.reveal && !rafId) rafId = requestAnimationFrame(loop);
  };

  // Immediate initial build so canvas is rendered right away without waiting for img load
  buildAscii();
  paint();
  if (opts.reveal && !rafId) rafId = requestAnimationFrame(loop);

  if (options.src) img.src = options.src;

  let ro = null;
  if (typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(() => {
      buildAscii();
      paint();
    });
    ro.observe(canvasEl);
  }

  canvasEl.addEventListener("pointermove", onMove);
  canvasEl.addEventListener("pointerleave", onLeave);

  return () => {
    alive = false;
    cancelAnimationFrame(rafId);
    ro?.disconnect();
    canvasEl.removeEventListener("pointermove", onMove);
    canvasEl.removeEventListener("pointerleave", onLeave);
  };
}
