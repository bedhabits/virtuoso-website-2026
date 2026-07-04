(() => {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PROJECTS = [
    {
      slug: 'o-bar',
      title: 'O Bar',
      alt: 'O bar da Virtuoso',
      images: [
        '01.jpg',
        '02.jpg',
        '03.jpg',
        '04.jpg',
        '05.jpg',
        '06.jpg',
        '07.jpg',
      ],
    },
    {
      slug: 'vinhos',
      title: 'Vinhos',
      alt: 'Vinhos naturais na Virtuoso',
      images: [
        'Ovirtuoso_@caianomidam_@thefarcreative-4458.jpg',
        'Ovirtuoso_@caianomidam_@thefarcreative-4466.jpg',
        'Ovirtuoso_@caianomidam_@thefarcreative-4488.jpg',
        'Ovirtuoso_@caianomidam_@thefarcreative-4508.jpg',
        'Ovirtuoso_@caianomidam_@thefarcreative-4554.jpg',
      ],
    },
    {
      slug: 'mesa',
      title: 'Mesa',
      alt: 'A mesa da Virtuoso',
      images: [
        '05.jpg',
        '20241030_Shooting_VirtuosoVinhos_C03_20.jpg',
        '20241030_Shooting_VirtuosoVinhos_C03_31.jpg',
        '20241030_Shooting_VirtuosoVinhos_C03_36.jpg',
        '20241030_Shooting_VirtuosoVinhos_C04_25.jpg',
        '20241030_Shooting_VirtuosoVinhos_R03_03.jpg',
        'Ovirtuoso_@caianomidam_@thefarcreative-4776.jpg',
      ],
    },
    {
      slug: 'djs',
      title: 'DJs',
      alt: 'DJs na Virtuoso',
      images: [
        '01.jpg',
        '003_Bossa_BW.jpg',
        '2608GIAN_001_0473.jpg',
        '833a35fc-4a55-4c39-8b69-085e3b027c2f.jpg',
        'DAVE JEFFERS 2025 @davefotogram.jpg',
        'David_4.jpg',
        'Foto Divulgação.jpg',
        'Foto34 @vivacquafv..jpg',
        'hitoshi2.jpeg',
        'WhatsApp Image 2025-05-31 at 11.13.37.jpeg',
      ],
    },
    {
      slug: 'collabs',
      title: 'Collabs',
      alt: 'Colaborações da Virtuoso',
      images: [
        '01.jpg',
        '02.jpg',
        '03.jpg',
        '04.jpg',
        '05.jpg',
        '06.jpg',
        '07.jpg',
      ],
    },
    {
      slug: 'eventos',
      title: 'Eventos',
      alt: 'Eventos na Virtuoso',
      images: [
        '01.jpeg',
        '02.jpg',
        '03.jpg',
        '04.jpeg',
        '06.jpeg',
        '07.jpg',
        '09.jpg',
      ],
    },
  ];

  const SLIDE_INTERVAL = 3500;
  const FIRST_SLIDE_INTERVAL = 1500;

  const yearEl = document.getElementById('ano');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function initFooterLinkReveal() {
    const reveals = document.querySelectorAll('.footer-link--reveal');
    if (!reveals.length) return;

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    reveals.forEach((link) => {
      link.addEventListener('click', (e) => {
        if (canHover) return;
        if (!link.classList.contains('is-expanded')) {
          e.preventDefault();
          reveals.forEach((other) => {
            if (other !== link) other.classList.remove('is-expanded');
          });
          link.classList.add('is-expanded');
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (canHover) return;
      if (!e.target.closest('.footer-link--reveal')) {
        reveals.forEach((link) => link.classList.remove('is-expanded'));
      }
    });
  }

  initFooterLinkReveal();

  function initNavObservers() {
    const nav = document.getElementById('site-nav');
    const conceito = document.getElementById('conceito');
    const topo = document.getElementById('topo');
    const menu = document.getElementById('menu');
    const contato = document.getElementById('contato');
    const navLinks = nav?.querySelector('.nav-links');
    const navMark = nav?.querySelector('.nav-mark');
    const navCta = nav?.querySelector('.nav-cta');
    if (!nav) return;

    let conceitoObserver = null;
    let topoObserver = null;
    let menuObserver = null;
    let contatoObserver = null;
    let topoInBand = false;
    let conceitoInBand = false;
    let menuInBand = false;
    let contatoInBand = false;

    function navBandRootMargin() {
      const navH = Math.ceil(nav.getBoundingClientRect().height);
      const bottomCrop = Math.max(window.innerHeight - navH, 0);
      return `0px 0px -${bottomCrop}px 0px`;
    }

    function observerOptions() {
      return {
        root: null,
        rootMargin: navBandRootMargin(),
        threshold: 0,
      };
    }

    function pastGalleryEnd() {
      if (!topo) return false;
      const navH = Math.ceil(nav.getBoundingClientRect().height);
      return window.scrollY >= topo.offsetTop + topo.offsetHeight - navH;
    }

    function updateNavLinks() {
      const showLinks = topoInBand && !conceitoInBand && !pastGalleryEnd();
      nav.classList.toggle('nav--links-hidden', !showLinks);
      if (navLinks) navLinks.setAttribute('aria-hidden', showLinks ? 'false' : 'true');
    }

    function updateNavHidden() {
      nav.classList.toggle('nav--hidden', conceitoInBand);
      nav.setAttribute('aria-hidden', conceitoInBand ? 'true' : 'false');
    }

    function updateNavMinimal() {
      const minimal = menuInBand || contatoInBand;
      nav.classList.toggle('nav--minimal', minimal);
      if (navMark) navMark.setAttribute('aria-hidden', minimal || conceitoInBand ? 'true' : 'false');
      if (navCta) navCta.setAttribute('aria-hidden', minimal || conceitoInBand ? 'true' : 'false');
    }

    function createObservers() {
      if (conceitoObserver) conceitoObserver.disconnect();
      if (topoObserver) topoObserver.disconnect();
      if (menuObserver) menuObserver.disconnect();
      if (contatoObserver) contatoObserver.disconnect();

      if (conceito) {
        conceitoObserver = new IntersectionObserver(
          ([entry]) => {
            conceitoInBand = entry.isIntersecting;
            updateNavHidden();
            updateNavMinimal();
            updateNavLinks();
          },
          observerOptions()
        );
        conceitoObserver.observe(conceito);
      }

      if (topo) {
        topoObserver = new IntersectionObserver(
          ([entry]) => {
            topoInBand = entry.isIntersecting;
            updateNavLinks();
          },
          observerOptions()
        );
        topoObserver.observe(topo);
      }

      const minimalSections = [
        { el: menu, set: (v) => { menuInBand = v; } },
        { el: contato, set: (v) => { contatoInBand = v; } },
      ];

      minimalSections.forEach(({ el, set }) => {
        if (!el) return;
        const observer = new IntersectionObserver(
          ([entry]) => {
            set(entry.isIntersecting);
            updateNavMinimal();
          },
          observerOptions()
        );
        observer.observe(el);
        if (el === menu) menuObserver = observer;
        else contatoObserver = observer;
      });

      updateNavHidden();
      updateNavLinks();
      updateNavMinimal();
    }

    createObservers();

    let resizePending = false;
    window.addEventListener('resize', () => {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(() => {
        resizePending = false;
        createObservers();
      });
    }, { passive: true });

    window.addEventListener('scroll', () => {
      updateNavLinks();
    }, { passive: true });
  }

  initNavObservers();

  function projectImages(slug, filenames) {
    const base = `img/projetos/${slug}/`;
    return filenames.map((name) => `${base}${encodeURIComponent(name)}`);
  }

  const FULL_IMAGE_TIMEOUT_MS = 8000;

  function revealFullImage(img, fullSrc, container, onFullReady) {
    let revealed = false;
    let swapped = false;

    const markFull = () => {
      if (revealed) return;
      revealed = true;
      img.classList.remove('frame-slideshow__placeholder');
      container.classList.add('is-full-loaded');
      onFullReady?.();
    };

    const swapToFull = () => {
      if (swapped) return;
      swapped = true;

      const onReady = () => {
        if (img.decode) {
          img.decode().then(markFull).catch(markFull);
        } else {
          markFull();
        }
      };

      const filename = fullSrc.split('/').pop();
      if (img.currentSrc.endsWith(filename)) {
        onReady();
        return;
      }

      img.addEventListener('load', onReady, { once: true });
      img.addEventListener('error', onReady, { once: true });
      img.src = fullSrc;
      if (img.complete && img.naturalWidth > 0) onReady();
    };

    const preloader = new Image();
    preloader.onload = swapToFull;
    preloader.onerror = swapToFull;
    if (isPriorityImage(img)) preloader.fetchPriority = 'high';
    preloader.src = fullSrc;
    if (preloader.complete) swapToFull();

    setTimeout(swapToFull, FULL_IMAGE_TIMEOUT_MS);
  }

  function isPriorityImage(img) {
    return img.loading === 'eager' || img.getAttribute('fetchpriority') === 'high';
  }

  function createSlideImage(src, alt, i, prioritizeFirstSlide) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.decoding = 'async';
    img.loading = i === 0 && prioritizeFirstSlide ? 'eager' : 'lazy';
    if (i === 0 && prioritizeFirstSlide) img.fetchPriority = 'high';
    img.classList.toggle('is-active', i === 0);
    return img;
  }

  function preloadImage(src) {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  }

  function scheduleIdle(fn, timeout = 2000) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, { timeout });
    } else {
      setTimeout(fn, 50);
    }
  }

  function appendSlide(container, src, alt, i, imgs) {
    const img = createSlideImage(src, alt, i, false);
    container.appendChild(img);
    imgs.push(img);
    return img;
  }

  function scheduleRemainingSlides(container, images, alt, imgs, prioritizeFirst = false) {
    if (images.length < 2) return;

    const appendFrom = (start) => {
      for (let i = start; i < images.length; i++) {
        appendSlide(container, images[i], alt, i, imgs);
      }
    };

    if (prioritizeFirst) {
      if (imgs.length < 2) appendSlide(container, images[1], alt, 1, imgs);
      preloadImage(images[1]);
      scheduleIdle(() => appendFrom(2), 2000);
      return;
    }

    scheduleIdle(() => {
      if (imgs.length < 2) appendSlide(container, images[1], alt, 1, imgs);
      scheduleIdle(() => appendFrom(2), 4000);
    }, 400);
  }

  function buildSlideshow(container, images, alt, prioritizeFirst = false) {
    if (images.length === 0) {
      container.innerHTML = `
        <div class="frame-placeholder" role="img" aria-label="${alt} — foto em breve">
          <span class="placeholder-label">Foto em breve</span>
        </div>`;
      container.removeAttribute('aria-hidden');
      return null;
    }

    const placeholder = container.querySelector('.frame-slideshow__placeholder');
    container.innerHTML = '';

    const imgs = [];

    if (placeholder) {
      placeholder.alt = alt;
      placeholder.decoding = 'async';
      placeholder.loading = prioritizeFirst ? 'eager' : 'lazy';
      if (prioritizeFirst) placeholder.fetchPriority = 'high';
      placeholder.classList.add('is-active');
      container.appendChild(placeholder);
      imgs.push(placeholder);

      const onFirstFull = prioritizeFirst && images.length > 1
        ? () => preloadImage(images[1])
        : null;
      revealFullImage(placeholder, images[0], container, onFirstFull);
    } else {
      const first = createSlideImage(images[0], alt, 0, prioritizeFirst);
      container.appendChild(first);
      imgs.push(first);
    }

    container.removeAttribute('aria-hidden');

    if (images.length <= 1) return null;

    if (prioritizeFirst && images.length > 1) preloadImage(images[1]);

    scheduleRemainingSlides(container, images, alt, imgs, prioritizeFirst);
    return imgs;
  }

  function createSlideshowController(imgs) {
    let idx = 0;
    let timer = null;
    let firstTick = null;

    function show(next) {
      if (imgs.length < 2) return;
      imgs[idx].classList.remove('is-active');
      idx = next % imgs.length;
      imgs[idx].classList.add('is-active');
    }

    function tick() {
      show(idx + 1);
    }

    function clearTimers() {
      if (firstTick) {
        clearTimeout(firstTick);
        firstTick = null;
      }
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function runFirstTick() {
      if (imgs.length < 2) {
        firstTick = setTimeout(runFirstTick, 50);
        return;
      }
      firstTick = null;
      tick();
      timer = setInterval(tick, SLIDE_INTERVAL);
    }

    return {
      start() {
        if (firstTick || timer || REDUCED) return;
        firstTick = setTimeout(runFirstTick, FIRST_SLIDE_INTERVAL);
      },
      stop() {
        clearTimers();
      },
    };
  }

  function initProjectSlideshows() {
    const frameData = new Map();

    PROJECTS.forEach((project) => {
      const frame = document.querySelector(`.gallery-frame[data-slug="${project.slug}"]`);
      if (!frame) return;

      const container = frame.querySelector('.frame-slideshow');
      if (!container) return;

      frameData.set(frame, {
        project,
        container,
        imgs: null,
        ctrl: null,
        built: false,
      });
    });

    function ensureBuilt(frame, prioritizeFirst = false) {
      const data = frameData.get(frame);
      if (!data || data.built) return data;

      const images = projectImages(data.project.slug, data.project.images);
      const imgs = buildSlideshow(data.container, images, data.project.alt, prioritizeFirst);
      data.built = true;
      data.imgs = imgs;
      if (imgs) data.ctrl = createSlideshowController(imgs);
      return data;
    }

    return { frameData, ensureBuilt };
  }

  const track  = document.querySelector('.gallery-track');
  const frames = Array.from(document.querySelectorAll('.gallery-frame'));
  const giBtns = Array.from(document.querySelectorAll('.gi-btn'));

  const { frameData, ensureBuilt } = initProjectSlideshows();

  const firstFrame = frames[0];
  if (firstFrame) {
    ensureBuilt(firstFrame, true);
  }

  if (track && frames.length > 0) {
    let activeIdx = 0;
    let pending   = false;

    function syncSlideshows(i) {
      frames.forEach((frame, fi) => {
        const data = frameData.get(frame);
        if (!data) return;

        if (fi === i) {
          ensureBuilt(frame, fi === 0);
          data.ctrl?.start();
        } else {
          data.ctrl?.stop();
        }
      });
    }

    if (firstFrame) {
      frameData.get(firstFrame)?.ctrl?.start();
    }

    function activateFrame(i) {
      const skipUi = i === activeIdx && frames[i].classList.contains('is-active');
      activeIdx = i;

      if (!skipUi) {
        frames.forEach((f, fi) => {
          const on = fi === i;
          f.classList.toggle('is-active', on);
          f.setAttribute('aria-hidden', on ? 'false' : 'true');
        });

        giBtns.forEach((b, bi) => {
          const on = bi === i;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }

      syncSlideshows(i);
    }

    function updateFromScroll() {
      pending = false;
      const rect       = track.getBoundingClientRect();
      const trackH     = track.offsetHeight;
      const vh         = window.innerHeight;
      const scrollable = trackH - vh;
      if (scrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / scrollable, 0), 0.9999);
      const idx      = Math.min(Math.floor(progress * frames.length), frames.length - 1);
      activateFrame(idx);
    }

    function onScroll() {
      if (!pending) {
        requestAnimationFrame(updateFromScroll);
        pending = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateFromScroll();

    giBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        const trackTop   = track.getBoundingClientRect().top + window.scrollY;
        const scrollable = track.offsetHeight - window.innerHeight;
        const targetPct  = (i + 0.1) / frames.length;
        const targetY    = trackTop + scrollable * targetPct;
        window.scrollTo({
          top: targetY,
          behavior: REDUCED ? 'auto' : 'smooth',
        });
      });
    });
  }

})();
