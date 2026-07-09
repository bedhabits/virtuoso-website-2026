import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

/**
 * Vanilla port of react-bits Antigravity (Three.js / instanced mesh).
 * @see https://github.com/DavidHDev/react-bits
 */
const DEFAULTS = {
  count: 130,
  magnetRadius: 24,
  ringRadius: 6,
  waveSpeed: 0.4,
  waveAmplitude: 1,
  particleSize: 1.5,
  lerpSpeed: 0.22,
  color: '#ce8ee1',
  autoAnimate: false,
  particleVariance: 1,
  rotationSpeed: 0,
  depthFactor: 1,
  pulseSpeed: 5.5,
  particleShape: 'capsule',
  fieldStrength: 2,
};

function canEnable() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false;
  return true;
}

function createGeometry(shape) {
  switch (shape) {
    case 'sphere':
      return new THREE.SphereGeometry(0.2, 16, 16);
    case 'box':
      return new THREE.BoxGeometry(0.4, 0.4, 0.4);
    case 'tetrahedron':
      return new THREE.TetrahedronGeometry(0.3);
    case 'capsule':
    default:
      return new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
  }
}

function createParticles(count, width, height) {
  const temp = [];
  for (let i = 0; i < count; i++) {
    const t = Math.random() * 100;
    const speed = 0.01 + Math.random() / 200;
    const x = (Math.random() - 0.5) * width;
    const y = (Math.random() - 0.5) * height;
    const z = (Math.random() - 0.5) * 20;
    const randomRadiusOffset = (Math.random() - 0.5) * 2;
    temp.push({
      t,
      speed,
      mx: x,
      my: y,
      mz: z,
      cx: x,
      cy: y,
      cz: z,
      randomRadiusOffset,
    });
  }
  return temp;
}

function init(container, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const section = container.closest('#conceito') || container;

  let width = container.clientWidth;
  let height = container.clientHeight;
  if (width === 0 || height === 0) return null;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    height / 2,
    -height / 2,
    0.1,
    1000,
  );
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  const geometry = createGeometry(opts.particleShape);
  const material = new THREE.MeshBasicMaterial({ color: opts.color });
  const mesh = new THREE.InstancedMesh(geometry, material, opts.count);
  scene.add(mesh);

  const dummy = new THREE.Object3D();
  let particles = createParticles(opts.count, width, height);

  const pointer = { x: 0, y: 0 };
  const lastMousePos = { x: 0, y: 0 };
  let lastMouseMoveTime = Date.now();
  const virtualMouse = { x: 0, y: 0 };
  const clock = new THREE.Clock();

  let rafId = null;
  let running = false;

  function onPointerMove(e) {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    if (width === 0 || height === 0) return;

    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    particles = createParticles(opts.count, width, height);
  }

  function tick() {
    const elapsed = clock.getElapsedTime();
    const vWidth = width;
    const vHeight = height;

    const mouseDist = Math.hypot(
      pointer.x - lastMousePos.x,
      pointer.y - lastMousePos.y,
    );

    if (mouseDist > 0.001) {
      lastMouseMoveTime = Date.now();
      lastMousePos.x = pointer.x;
      lastMousePos.y = pointer.y;
    }

    let destX = (pointer.x * vWidth) / 2;
    let destY = (pointer.y * vHeight) / 2;

    if (opts.autoAnimate && Date.now() - lastMouseMoveTime > 2000) {
      destX = Math.sin(elapsed * 0.5) * (vWidth / 4);
      destY = Math.cos(elapsed * 0.5 * 2) * (vHeight / 4);
    }

    const smoothFactor = 0.05;
    virtualMouse.x += (destX - virtualMouse.x) * smoothFactor;
    virtualMouse.y += (destY - virtualMouse.y) * smoothFactor;

    const targetX = virtualMouse.x;
    const targetY = virtualMouse.y;
    const globalRotation = elapsed * opts.rotationSpeed;

    for (let i = 0; i < opts.count; i++) {
      const p = particles[i];
      p.t += p.speed / 2;

      const projectionFactor = 1 - p.cz / 50;
      const projectedTargetX = targetX * projectionFactor;
      const projectedTargetY = targetY * projectionFactor;

      const dx = p.mx - projectedTargetX;
      const dy = p.my - projectedTargetY;
      const dist = Math.hypot(dx, dy);

      let targetPos = { x: p.mx, y: p.my, z: p.mz * opts.depthFactor };

      if (dist < opts.magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation;
        const wave = Math.sin(p.t * opts.waveSpeed + angle) * (0.5 * opts.waveAmplitude);
        const deviation = p.randomRadiusOffset * (5 / (opts.fieldStrength + 0.1));
        const currentRingRadius = opts.ringRadius + wave + deviation;

        targetPos.x = projectedTargetX + currentRingRadius * Math.cos(angle);
        targetPos.y = projectedTargetY + currentRingRadius * Math.sin(angle);
        targetPos.z = p.mz * opts.depthFactor
          + Math.sin(p.t) * (1 * opts.waveAmplitude * opts.depthFactor);
      }

      p.cx += (targetPos.x - p.cx) * opts.lerpSpeed;
      p.cy += (targetPos.y - p.cy) * opts.lerpSpeed;
      p.cz += (targetPos.z - p.cz) * opts.lerpSpeed;

      dummy.position.set(p.cx, p.cy, p.cz);
      dummy.lookAt(projectedTargetX, projectedTargetY, p.cz);
      dummy.rotateX(Math.PI / 2);

      const currentDistToMouse = Math.hypot(
        p.cx - projectedTargetX,
        p.cy - projectedTargetY,
      );
      const distFromRing = Math.abs(currentDistToMouse - opts.ringRadius);
      let scaleFactor = 1 - distFromRing / 10;
      scaleFactor = Math.max(0, Math.min(1, scaleFactor));
      const finalScale = scaleFactor
        * (0.8 + Math.sin(p.t * opts.pulseSpeed) * 0.2 * opts.particleVariance)
        * opts.particleSize;

      dummy.scale.set(finalScale, finalScale, finalScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function animate() {
    if (!running) return;
    rafId = requestAnimationFrame(animate);
    tick();
  }

  function start() {
    if (running) return;
    running = true;
    clock.start();
    animate();
  }

  function stop() {
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    clock.stop();
  }

  container.addEventListener('pointermove', onPointerMove, { passive: true });

  let resizePending = false;
  const onResize = () => {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(() => {
      resizePending = false;
      resize();
    });
  };
  window.addEventListener('resize', onResize, { passive: true });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    },
    { threshold: 0 },
  );
  observer.observe(section);

  return {
    destroy() {
      stop();
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointermove', onPointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}

if (canEnable()) {
  const container = document.getElementById('conceito-particles');
  if (container) init(container);
}

export { canEnable, init, DEFAULTS };
