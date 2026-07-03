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
        '20241030_Shooting_VirtuosoVinhos_R03_06.jpg',
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
        'dj2.jpg',
        'Foto Divulgação.jpg',
        'Foto34 @vivacquafv..jpg',
        'gigios na mantega.jpeg',
        'hitoshi2.jpeg',
        'IMG9467.jpg',
        'L1020574.jpg',
        'Quimera_Dj.jpeg',
        'WhatsApp Image 2025-05-13 at 15.51.48.jpeg',
        'WhatsApp Image 2025-05-31 at 11.13.37.jpeg',
        'WhatsApp Image 2025-11-18 at 11.19.34.jpeg',
        'WhatsApp Image 2025-12-10 at 10.41.49.jpeg',
        'WhatsApp Image 2026-04-22 at 19.06.16.jpeg',
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
        '20250903_VirtuosoVinhos_Expo_Laura_150.jpg',
        '20250903_VirtuosoVinhos_Expo_Laura_177.jpg',
        '20250903_VirtuosoVinhos_Expo_Laura_62.jpg',
        '30_01_26_VIRTUOSO_CANTAO_082.jpg',
        '30_01_26_VIRTUOSO_CANTAO_093.jpg',
        '30_01_26_VIRTUOSO_CANTAO_132.jpg',
        'WhatsApp Image 2026-07-03 at 14.03.28.jpeg',
        'WhatsApp Image 2026-07-03 at 14.03.54 (3).jpeg',
        'WhatsApp Image 2026-07-03 at 14.03.54 (4).jpeg',
        'WhatsApp Image 2026-07-03 at 14.03.54.jpeg',
      ],
    },
  ];

  const SLIDE_INTERVAL = 4500;

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
    if (placeholder) container.appendChild(placeholder);

    const imgs = images.map((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.decoding = 'async';
      img.loading = i === 0 && prioritizeFirst ? 'eager' : 'lazy';
      if (i === 0 && prioritizeFirst) img.fetchPriority = 'high';
      img.classList.toggle('is-active', i === 0);
      container.appendChild(img);
      return img;
    });

    if (placeholder && imgs[0]) {
      const markLoaded = () => container.classList.add('is-full-loaded');
      if (imgs[0].complete) markLoaded();
      else imgs[0].addEventListener('load', markLoaded, { once: true });
    }

    container.removeAttribute('aria-hidden');
    return imgs.length > 1 ? imgs : null;
  }

  function createSlideshowController(imgs) {
    let idx = 0;
    let timer = null;

    function show(next) {
      imgs[idx].classList.remove('is-active');
      idx = next;
      imgs[idx].classList.add('is-active');
    }

    function tick() {
      show((idx + 1) % imgs.length);
    }

    return {
      start() {
        if (timer || REDUCED) return;
        timer = setInterval(tick, SLIDE_INTERVAL);
      },
      stop() {
        if (!timer) return;
        clearInterval(timer);
        timer = null;
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

    function activateFrame(i) {
      if (i === activeIdx && frames[i].classList.contains('is-active')) return;
      activeIdx = i;

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
