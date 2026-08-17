/**
 * WebGL2 Fluid Mesh Text Hover Effect (Originkit MeshText Shader Engine)
 * Features real-time spring physics, grid displacement, and chromatic RGB color splitting.
 */

const GRID_W = 96;
const GRID_H = 40;
const DRAG = 1.8;
const SPRING_K = 0.08;
const DAMPING = 0.9;
const DT = 0.1;
const CHROMA = 0.005;

const VERT_SRC = `#version 300 es
in vec2 aPos;
in vec2 aUv;
in vec2 aDisp;
out vec2 vUv;
out float vMag;
void main() {
    gl_Position = vec4(aPos + aDisp, 0.0, 1.0);
    vUv = aUv;
    vMag = length(aDisp);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
in float vMag;
out vec4 outColor;
uniform sampler2D uTex;
uniform float uChroma;
uniform vec3 uColorA;
uniform vec3 uColorB;
void main() {
    vec4 base = texture(uTex, vUv);
    if (uChroma > 0.0) {
        float o = uChroma * ${CHROMA.toFixed(5)} * clamp(vMag * 8.0, 0.0, 1.0);
        float aOff = texture(uTex, vUv + vec2(o, 0.0)).a;
        float bOff = texture(uTex, vUv - vec2(o, 0.0)).a;
        vec3 col = base.rgb * base.a;
        col += uColorA * max(0.0, aOff - base.a);
        col += uColorB * max(0.0, bOff - base.a);
        float aMax = max(base.a, max(aOff, bOff));
        outColor = vec4(col, aMax);
    } else {
        outColor = base;
    }
}`;

function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function linkProgram(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(p));
    gl.deleteProgram(p);
    return null;
  }
  return p;
}

function parseColor(v) {
  if (typeof v !== "string") return [1, 1, 1];
  const s = v.trim();
  if (s.startsWith("#")) {
    let h = s.slice(1);
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    if (h.length >= 6) {
      const r = parseInt(h.slice(0, 2), 16) / 255;
      const g = parseInt(h.slice(2, 4), 16) / 255;
      const b = parseInt(h.slice(4, 6), 16) / 255;
      if (isFinite(r) && isFinite(g) && isFinite(b)) return [r, g, b];
    }
  }
  const m = s.match(/rgba?\s*\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (m) {
    return [
      parseInt(m[1], 10) / 255,
      parseInt(m[2], 10) / 255,
      parseInt(m[3], 10) / 255,
    ];
  }
  return [1, 1, 1];
}

function renderTextToCanvas(text, color, fontFamily, fontWeight, fontStyle, fontSize, width, height) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}, sans-serif`;
  ctx.fillText(text, width / 2, height / 2);
  return c;
}

/**
 * Mounts a WebGL2 Mesh Text canvas inside a container element.
 */
export function initMeshText(container, options = {}) {
  if (!container) return null;

  const defaults = {
    text: "SAMINATHAN",
    color: "#ffffff",
    fontFamily: "Outfit",
    fontWeight: "700",
    fontStyle: "normal",
    fontSize: 140,
    colorSplit: true,
    customColors: ["#10b981", "#3b82f6", "#8b5cf6"],
    force: 18,
  };

  const opts = { ...defaults, ...options };

  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.userSelect = "none";

  container.innerHTML = "";
  container.appendChild(canvas);

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
  });

  if (!gl) {
    console.warn("WebGL2 not available for MeshText");
    return null;
  }

  // Grid Geometry
  const vertCount = (GRID_W + 1) * (GRID_H + 1);
  const positions = new Float32Array(vertCount * 2);
  const uvs = new Float32Array(vertCount * 2);
  for (let y = 0; y <= GRID_H; y++) {
    for (let x = 0; x <= GRID_W; x++) {
      const i = y * (GRID_W + 1) + x;
      const u = x / GRID_W;
      const v = y / GRID_H;
      positions[i * 2] = u * 2 - 1;
      positions[i * 2 + 1] = 1 - v * 2;
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
    }
  }

  const indexCount = GRID_W * GRID_H * 6;
  const indices = new Uint32Array(indexCount);
  let idx = 0;
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const a = y * (GRID_W + 1) + x;
      const b = a + 1;
      const c = a + (GRID_W + 1);
      const d = c + 1;
      indices[idx++] = a;
      indices[idx++] = c;
      indices[idx++] = b;
      indices[idx++] = b;
      indices[idx++] = c;
      indices[idx++] = d;
    }
  }

  const disp = new Float32Array(vertCount * 2);
  const vel = new Float32Array(vertCount * 2);

  // Shader Setup
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) return null;
  const program = linkProgram(gl, vs, fs);
  if (!program) return null;

  const aPos = gl.getAttribLocation(program, "aPos");
  const aUv = gl.getAttribLocation(program, "aUv");
  const aDisp = gl.getAttribLocation(program, "aDisp");
  const uTex = gl.getUniformLocation(program, "uTex");
  const uChroma = gl.getUniformLocation(program, "uChroma");
  const uColorA = gl.getUniformLocation(program, "uColorA");
  const uColorB = gl.getUniformLocation(program, "uColorB");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uvBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
  gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

  const dispBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, dispBuf);
  gl.bufferData(gl.ARRAY_BUFFER, disp, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aDisp);
  gl.vertexAttribPointer(aDisp, 2, gl.FLOAT, false, 0, 0);

  const idxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  let cancelled = false;

  const parsedColors = opts.customColors.map(parseColor);
  const forceValue = opts.force / 10;

  const rebuildTex = async () => {
    const w = Math.max(2, canvas.width);
    const h = Math.max(2, canvas.height);
    const dpr = window.devicePixelRatio || 1;
    const realSize = opts.fontSize * dpr;

    try {
      if (typeof document !== "undefined" && document.fonts) {
        const fontStr = `${opts.fontStyle} ${opts.fontWeight} ${realSize}px ${opts.fontFamily}`;
        if (document.fonts.load) await document.fonts.load(fontStr);
        if (document.fonts.ready) await document.fonts.ready;
      }
    } catch (e) {
      /* ignore font load errors */
    }

    if (cancelled) return;

    const c2 = renderTextToCanvas(
      opts.text,
      opts.color,
      opts.fontFamily,
      opts.fontWeight,
      opts.fontStyle,
      realSize,
      w,
      h
    );

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c2);
  };

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = Math.max(2, Math.round(rect.width * dpr));
    const h = Math.max(2, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      rebuildTex();
    }
  };

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();
  rebuildTex();

  // Pointer tracking
  const cursor = {
    x: 99,
    y: 99,
    px: 99,
    py: 99,
    vx: 0,
    vy: 0,
    inside: false,
  };

  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const x = nx * 2 - 1;
    const y = 1 - ny * 2;
    if (!cursor.inside) {
      cursor.px = x;
      cursor.py = y;
      cursor.inside = true;
    }
    cursor.x = x;
    cursor.y = y;
  };

  const onLeave = () => {
    cursor.inside = false;
    cursor.x = 99;
    cursor.y = 99;
    cursor.vx = 0;
    cursor.vy = 0;
  };

  container.addEventListener("pointermove", onMove);
  container.addEventListener("pointerleave", onLeave);

  // Animation Loop
  let rafId = 0;
  const tick = () => {
    cursor.vx = cursor.x - cursor.px;
    cursor.vy = cursor.y - cursor.py;
    const vmag = Math.hypot(cursor.vx, cursor.vy);
    if (vmag > 0.3) {
      cursor.vx = 0;
      cursor.vy = 0;
    }
    cursor.px = cursor.x;
    cursor.py = cursor.y;

    for (let i = 0; i < vertCount; i++) {
      const i2 = i * 2;
      const px = positions[i2];
      const py = positions[i2 + 1];
      const dx = disp[i2];
      const dy = disp[i2 + 1];

      const cx = cursor.x - (px + dx);
      const cy = cursor.y - (py + dy);
      const cd = Math.hypot(cx, cy);
      const proximity = Math.max(0, 1 / (1 + cd / 0.05) - 0.1);

      let vx = vel[i2];
      let vy = vel[i2 + 1];

      vx += cursor.vx * forceValue * proximity;
      vy += cursor.vy * forceValue * proximity;

      vx -= dx * SPRING_K;
      vy -= dy * SPRING_K;

      vx *= DAMPING;
      vy *= DAMPING;

      vel[i2] = vx;
      vel[i2 + 1] = vy;

      let ndx = dx + vx * DT;
      let ndy = dy + vy * DT;
      if (ndx > 1) ndx = 1;
      else if (ndx < -1) ndx = -1;
      if (ndy > 1) ndy = 1;
      else if (ndy < -1) ndy = -1;
      disp[i2] = ndx;
      disp[i2 + 1] = ndy;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, dispBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, disp);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(uTex, 0);
    gl.uniform1f(uChroma, opts.colorSplit ? 1.0 : 0.0);

    let cA = [1, 0, 0];
    let cB = [0, 0, 1];
    if (parsedColors.length === 1) {
      cA = parsedColors[0];
      cB = parsedColors[0];
    } else if (parsedColors.length > 1) {
      const cycleMs = 400;
      const index = Math.floor(performance.now() / cycleMs) % parsedColors.length;
      cA = parsedColors[index];
      cB = parsedColors[(index + 1) % parsedColors.length];
    }

    gl.uniform3f(uColorA, cA[0], cA[1], cA[2]);
    gl.uniform3f(uColorB, cB[0], cB[1], cB[2]);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
    ro.disconnect();
    container.removeEventListener("pointermove", onMove);
    container.removeEventListener("pointerleave", onLeave);
    gl.deleteBuffer(posBuf);
    gl.deleteBuffer(uvBuf);
    gl.deleteBuffer(dispBuf);
    gl.deleteBuffer(idxBuf);
    gl.deleteTexture(tex);
    gl.deleteVertexArray(vao);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
  };
}
