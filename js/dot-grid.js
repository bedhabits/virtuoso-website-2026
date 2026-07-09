/**
 * Vanilla port of react-bits DotGrid (canvas + inertia physics).
 * @see https://github.com/DavidHDev/react-bits/blob/main/src/content/Backgrounds/DotGrid/DotGrid.jsx
 */

const DEFAULTS = {
  dotSize: 12,
  gap: 18,
  baseColor: '#551154',
  activeColor: '#9A80FA',
  proximity: 210,
  speedTrigger: 100,
  shockRadius: 390,
  shockStrength: 5,
  maxSpeed: 7500,
  resistance: 500,
  returnDuration: 3.3,
};

function canEnable() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false;
  return true;
}

function hexToRgb(hex) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

function elasticOut(t, amplitude = 1, period = 0.75) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const s = (period / (2 * Math.PI)) * Math.asin(1 / amplitude);
  return amplitude * (2 ** (-10 * t)) * Math.sin((t - s) * (2 * Math.PI) / period) + 1;
}

function throttle(fn, limit) {
  let lastCall = 0;
  return function throttled(...args) {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

function ensureLayout(section, container) {
  if (getComputedStyle(section).position === 'static') {
    section.style.position = 'relative';
    section.style.overflow = 'hidden';
    section.style.isolation = 'isolate';
  }

  if (getComputedStyle(container).position === 'static') {
    Object.assign(container.style, {
      position: 'absolute',
      inset: '0',
      zIndex: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
    });
  }

  const inner = section.querySelector('.menu-cta__inner');
  if (inner && getComputedStyle(inner).zIndex === 'auto') {
    inner.style.position = 'relative';
    inner.style.zIndex = '1';
  }
}

function measureSection(section) {
  const styles = getComputedStyle(section);
  const padTop = parseFloat(styles.paddingTop) || 0;
  const padBottom = parseFloat(styles.paddingBottom) || 0;
  const padLeft = parseFloat(styles.paddingLeft) || 0;
  const padRight = parseFloat(styles.paddingRight) || 0;
  const inner = section.querySelector('.menu-cta__inner');

  const width = Math.max(section.clientWidth - padLeft - padRight, 0);
  const contentHeight = inner ? inner.offsetHeight : section.clientHeight - padTop - padBottom;
  const height = contentHeight + padTop + padBottom;

  if (width < 1 || height < 1 || height > window.innerHeight * 3) {
    return null;
  }
  return { width, height };
}

function buildGridState(section, canvas, opts) {
  const dims = measureSection(section);
  if (!dims) return null;
  const { width, height } = dims;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const { dotSize, gap } = opts;
  const cols = Math.floor((width + gap) / (dotSize + gap));
  const rows = Math.floor((height + gap) / (dotSize + gap));
  const cell = dotSize + gap;

  const gridW = cell * cols - gap;
  const gridH = cell * rows - gap;
  const startX = (width - gridW) / 2 + dotSize / 2;
  const startY = (height - gridH) / 2 + dotSize / 2;

  const dots = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      dots.push({
        cx: startX + x * cell,
        cy: startY + y * cell,
        xOffset: 0,
        yOffset: 0,
        vx: 0,
        vy: 0,
        phase: 'idle',
        returnFromX: 0,
        returnFromY: 0,
        returnStart: 0,
        busy: false,
      });
    }
  }

  const circlePath = new Path2D();
  circlePath.arc(0, 0, dotSize / 2, 0, Math.PI * 2);

  return { width, height, ctx, dots, circlePath, dpr };
}

function drawStaticGrid(state, opts) {
  const { ctx, dots, circlePath, width, height } = state;
  const { baseColor } = opts;
  ctx.clearRect(0, 0, width, height);
  for (const dot of dots) {
    ctx.save();
    ctx.translate(dot.cx, dot.cy);
    ctx.fillStyle = baseColor;
    ctx.fill(circlePath);
    ctx.restore();
  }
}

function applyPush(dot, pushX, pushY, opts) {
  if (dot.busy) return;
  dot.busy = true;
  dot.vx = pushX * 0.08;
  dot.vy = pushY * 0.08;
  dot.phase = 'inertia';
}

function updateDotPhysics(dot, dt, opts) {
  const { resistance, returnDuration } = opts;
  const drag = Math.exp(-(resistance / 450) * dt);

  if (dot.phase === 'inertia') {
    dot.xOffset += dot.vx * dt;
    dot.yOffset += dot.vy * dt;
    dot.vx *= drag;
    dot.vy *= drag;

    if (Math.hypot(dot.vx, dot.vy) < 4) {
      dot.phase = 'return';
      dot.returnFromX = dot.xOffset;
      dot.returnFromY = dot.yOffset;
      dot.returnStart = performance.now();
      dot.vx = 0;
      dot.vy = 0;
    }
    return;
  }

  if (dot.phase === 'return') {
    const t = Math.min((performance.now() - dot.returnStart) / (returnDuration * 1000), 1);
    const eased = elasticOut(t);
    dot.xOffset = dot.returnFromX * (1 - eased);
    dot.yOffset = dot.returnFromY * (1 - eased);

    if (t >= 1) {
      dot.xOffset = 0;
      dot.yOffset = 0;
      dot.phase = 'idle';
      dot.busy = false;
    }
  }
}

function initStatic(container, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const section = container.closest('#menu') || container;
  ensureLayout(section, container);
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  let state = buildGridState(section, canvas, opts);
  if (!state) return null;

  const draw = () => {
    if (!state) return;
    drawStaticGrid(state, opts);
  };

  draw();

  const onResize = () => {
    const next = buildGridState(section, canvas, opts);
    if (!next) return;
    state = next;
    draw();
  };

  let resizeObserver = null;
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(section);
  } else {
    window.addEventListener('resize', onResize, { passive: true });
  }

  container.dataset.dotGridMode = 'static';

  return {
    destroy() {
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', onResize);
      if (canvas.parentNode === container) container.removeChild(canvas);
    },
  };
}

function init(container, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const section = container.closest('#menu') || container;
  ensureLayout(section, container);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  let state = buildGridState(section, canvas, opts);
  if (!state) return null;

  const baseRgb = hexToRgb(opts.baseColor);
  const activeRgb = hexToRgb(opts.activeColor);
  const proxSq = opts.proximity * opts.proximity;

  const pointer = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  };

  let rafId = null;
  let running = false;
  let lastFrame = performance.now();

  function rebuild() {
    const next = buildGridState(section, canvas, opts);
    if (next) state = next;
  }

  function drawFrame(now) {
    if (!state) return;
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    const { ctx, dots, circlePath, width, height } = state;
    ctx.clearRect(0, 0, width, height);

    for (const dot of dots) {
      updateDotPhysics(dot, dt, opts);
    }

    const { x: px, y: py } = pointer;

    for (const dot of dots) {
      const ox = dot.cx + dot.xOffset;
      const oy = dot.cy + dot.yOffset;
      const dx = dot.cx - px;
      const dy = dot.cy - py;
      const dsq = dx * dx + dy * dy;

      let style = opts.baseColor;
      if (dsq <= proxSq) {
        const dist = Math.sqrt(dsq);
        const t = 1 - dist / opts.proximity;
        const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
        const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
        const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
        style = `rgb(${r},${g},${b})`;
      }

      ctx.save();
      ctx.translate(ox, oy);
      ctx.fillStyle = style;
      ctx.fill(circlePath);
      ctx.restore();
    }
  }

  function animate(now) {
    if (!running) return;
    rafId = requestAnimationFrame(animate);
    drawFrame(now);
  }

  function start() {
    if (running) return;
    running = true;
    lastFrame = performance.now();
    animate(lastFrame);
  }

  function stop() {
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function updatePointer(clientX, clientY) {
    const now = performance.now();
    const dt = pointer.lastTime ? now - pointer.lastTime : 16;
    const dx = clientX - pointer.lastX;
    const dy = clientY - pointer.lastY;
    let vx = (dx / dt) * 1000;
    let vy = (dy / dt) * 1000;
    let speed = Math.hypot(vx, vy);

    if (speed > opts.maxSpeed) {
      const scale = opts.maxSpeed / speed;
      vx *= scale;
      vy *= scale;
      speed = opts.maxSpeed;
    }

    pointer.lastTime = now;
    pointer.lastX = clientX;
    pointer.lastY = clientY;
    pointer.vx = vx;
    pointer.vy = vy;
    pointer.speed = speed;

    const rect = canvas.getBoundingClientRect();
    pointer.x = clientX - rect.left;
    pointer.y = clientY - rect.top;

    if (!state) return;

    for (const dot of state.dots) {
      const dist = Math.hypot(dot.cx - pointer.x, dot.cy - pointer.y);
      if (pointer.speed > opts.speedTrigger && dist < opts.proximity && !dot.busy) {
        const pushX = dot.cx - pointer.x + vx * 0.005;
        const pushY = dot.cy - pointer.y + vy * 0.005;
        applyPush(dot, pushX, pushY, opts);
      }
    }
  }

  function onClick(e) {
    if (!state) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    for (const dot of state.dots) {
      const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
      if (dist < opts.shockRadius && !dot.busy) {
        const falloff = Math.max(0, 1 - dist / opts.shockRadius);
        const pushX = (dot.cx - cx) * opts.shockStrength * falloff;
        const pushY = (dot.cy - cy) * opts.shockStrength * falloff;
        applyPush(dot, pushX, pushY, opts);
      }
    }
  }

  const onMove = throttle((e) => updatePointer(e.clientX, e.clientY), 50);

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('click', onClick);

  let resizeObserver = null;
  const onResize = () => rebuild();
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(section);
  } else {
    window.addEventListener('resize', onResize, { passive: true });
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    },
    { threshold: 0 },
  );
  observer.observe(section);

  container.dataset.dotGridMode = 'interactive';
  start();

  return {
    destroy() {
      stop();
      observer.disconnect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', onResize);
      if (canvas.parentNode === container) container.removeChild(canvas);
    },
  };
}

const menuDots = document.getElementById('menu-dot-grid');
if (menuDots) {
  const boot = () => {
    if (canEnable()) init(menuDots, DEFAULTS);
    else initStatic(menuDots, DEFAULTS);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(boot), { once: true });
  } else {
    requestAnimationFrame(boot);
  }
}

export { canEnable, init, initStatic, DEFAULTS };
