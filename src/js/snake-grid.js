

const DEFAULTS = {
  cellSize: 25,
  gap: 2,
  rounded: 11,
  snakeColor: "#0C6428",
  foodColor: "#F9731A",
  boardColor: "rgba(255, 255, 255, 0.06)",
  speed: 8,
  startLength: 3,
  growth: 1,
  fade: 38,
};

const DEATH_BLINKS = 3;
const BLINK_MS = 180;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseColor(color) {
  const value = (color || "").trim();
  const hex = value.replace("#", "");
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
      1,
    ];
  }
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (match) {
    const parts = match[1].split(",").map((p) => parseFloat(p));
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0, parts[3] === undefined ? 1 : parts[3]];
  }
  return [12, 100, 40, 1];
}

const rgba = (c, alpha) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3] * alpha})`;

const STEPS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function initSnakeGrid(container, options = {}) {
  if (!container) return null;

  const opts = { ...DEFAULTS, ...options };

  container.style.position = "relative";
  container.style.overflow = "hidden";

  const canvas = document.createElement("canvas");
  canvas.className = "snake-grid-canvas";
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "1";

  // Prepend canvas so it renders behind existing content/3D layers
  container.insertBefore(canvas, container.firstChild);

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const snakeRGB = parseColor(opts.snakeColor);
  const foodRGB = parseColor(opts.foodColor);
  const boardRGB = parseColor(opts.boardColor);

  const rand = mulberry32(0xc0ffee);
  const pitch = opts.cellSize + opts.gap;
  const stepEvery = 1000 / Math.max(1, opts.speed);
  const tailFade = opts.fade / 100;

  let alive = true;
  let rafId = 0;
  let last = 0;
  let acc = 0;
  let dpr = 1;
  let cols = 0;
  let rows = 0;
  let cellW = 0;
  let cellH = 0;
  let pitchX = 0;
  let pitchY = 0;
  let cellRadius = 0;
  let snake = [];
  let food = -1;
  let dying = 0;

  const idx = (col, row) => row * cols + col;
  const colOf = (i) => i % cols;
  const rowOf = (i) => Math.floor(i / cols);

  function placeFood() {
    const free = [];
    const body = new Set(snake);
    for (let i = 0; i < cols * rows; i++) {
      if (!body.has(i)) free.push(i);
    }
    food = free.length ? free[Math.floor(rand() * free.length)] : -1;
  }

  function reset() {
    const midCol = Math.floor(cols / 2);
    const midRow = Math.floor(rows / 2);
    const length = Math.min(Math.max(1, Math.round(opts.startLength)), Math.max(1, cols - 2));
    snake = [];
    for (let i = 0; i < length; i++) {
      snake.push(idx(Math.max(0, midCol - i), midRow));
    }
    placeFood();
  }

  function blocked(ahead) {
    const keep = Math.max(0, snake.length - ahead);
    return new Set(snake.slice(0, keep));
  }

  function neighbours(cell) {
    const col = colOf(cell);
    const row = rowOf(cell);
    const out = [];
    for (const [dx, dy] of STEPS) {
      const nc = col + dx;
      const nr = row + dy;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      out.push(idx(nc, nr));
    }
    return out;
  }

  function stepTowardFood() {
    if (food < 0) return -1;
    const head = snake[0];
    const walls = blocked(1);
    const prev = new Map();
    const seen = new Set([head]);
    let frontier = [head];

    while (frontier.length) {
      const next = [];
      for (const cell of frontier) {
        for (const n of neighbours(cell)) {
          if (seen.has(n) || walls.has(n)) continue;
          seen.add(n);
          prev.set(n, cell);
          if (n === food) {
            let at = n;
            while (prev.get(at) !== head) {
              at = prev.get(at);
            }
            return at;
          }
          next.push(n);
        }
      }
      frontier = next;
    }
    return -1;
  }

  function room(from) {
    const walls = blocked(1);
    const seen = new Set([from]);
    let frontier = [from];
    let count = 0;
    while (frontier.length && count < cols * rows) {
      const next = [];
      for (const cell of frontier) {
        count++;
        for (const n of neighbours(cell)) {
          if (seen.has(n) || walls.has(n)) continue;
          seen.add(n);
          next.push(n);
        }
      }
      frontier = next;
    }
    return count;
  }

  function advance() {
    if (!snake.length) return;

    let target = stepTowardFood();
    if (target < 0) {
      const walls = blocked(1);
      let best = -1;
      let bestRoom = -1;
      for (const n of neighbours(snake[0])) {
        if (walls.has(n)) continue;
        const space = room(n);
        if (space > bestRoom) {
          bestRoom = space;
          best = n;
        }
      }
      target = best;
    }

    if (target < 0) {
      dying = DEATH_BLINKS * BLINK_MS * 2;
      return;
    }

    snake.unshift(target);

    if (target === food) {
      const tail = snake[snake.length - 1];
      for (let i = 1; i < Math.max(1, Math.round(opts.growth)); i++) {
        snake.push(tail);
      }
      placeFood();
    } else {
      snake.pop();
    }
  }

  function tile(col, row) {
    const x = col * pitchX;
    const y = row * pitchY;
    if (cellRadius > 0 && typeof ctx.roundRect === "function") {
      ctx.roundRect(x, y, cellW, cellH, cellRadius);
    } else {
      ctx.rect(x, y, cellW, cellH);
    }
  }

  function build() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(container.clientWidth));
    const h = Math.max(1, Math.round(container.clientHeight));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(4, Math.floor((w + opts.gap) / pitch));
    rows = Math.max(4, Math.floor((h + opts.gap) / pitch));
    cellW = Math.max(1, (w - opts.gap * (cols - 1)) / cols);
    cellH = Math.max(1, (h - opts.gap * (rows - 1)) / rows);
    pitchX = cellW + opts.gap;
    pitchY = cellH + opts.gap;
    cellRadius = (Math.min(cellW, cellH) / 2) * (Math.min(20, Math.max(0, opts.rounded)) / 20);
    reset();
  }

  function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
      const cell = snake[i];
      const along = snake.length > 1 ? i / (snake.length - 1) : 0;
      ctx.beginPath();
      tile(colOf(cell), rowOf(cell));
      ctx.fillStyle = rgba(snakeRGB, 1 - along * tailFade);
      ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.beginPath();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) tile(col, row);
    }
    ctx.fillStyle = rgba(boardRGB, 1);
    ctx.fill();

    if (dying > 0) {
      const lit = Math.floor(dying / BLINK_MS) % 2 === 0;
      if (lit) drawSnake();
      return;
    }

    if (food >= 0) {
      ctx.beginPath();
      tile(colOf(food), rowOf(food));
      ctx.fillStyle = rgba(foodRGB, 1);
      ctx.fill();
    }

    drawSnake();
  }

  function loop(time) {
    if (!alive) return;
    const dt = last ? Math.min(time - last, 200) : 0;
    last = time;

    if (dying > 0) {
      dying -= dt;
      if (dying <= 0) {
        dying = 0;
        acc = 0;
        reset();
      }
      draw();
      rafId = requestAnimationFrame(loop);
      return;
    }

    acc += dt;
    while (acc >= stepEvery && dying <= 0) {
      acc -= stepEvery;
      advance();
    }
    draw();
    rafId = requestAnimationFrame(loop);
  }

  build();

  let built = `${container.clientWidth}x${container.clientHeight}`;
  const ro = new ResizeObserver(() => {
    const size = `${container.clientWidth}x${container.clientHeight}`;
    if (size === built) return;
    built = size;
    build();
  });
  ro.observe(container);

  rafId = requestAnimationFrame(loop);

  return () => {
    alive = false;
    cancelAnimationFrame(rafId);
    ro.disconnect();
    canvas.remove();
  };
}
