(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCompact = matchMedia('(max-width: 760px), (pointer: coarse)');

  let usingPointer = false;
  document.addEventListener('pointerdown', () => { usingPointer = true; }, true);
  document.addEventListener('keydown', () => { usingPointer = false; }, true);

  function splitHeroTitle() {
    const title = $('.hero__title');
    if (!title || prefersReducedMotion) return;

    const text = title.textContent.trim();
    title.setAttribute('aria-label', text);
    title.textContent = '';

    text.split(/\s+/).forEach((word, index) => {
      if (index > 0) title.append(' ');
      const span = document.createElement('span');
      span.className = 'hero__word';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', index);
      span.textContent = word;
      title.append(span);
    });
  }

  function setupReveal() {
    $$('.stack__item').forEach((item, index) => item.style.setProperty('--i', index));

    const items = $$('.reveal');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    items.forEach((item) => observer.observe(item));
  }

  function setupHeader() {
    const header = $('.site-header');
    if (!header) return;

    let lastY = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);

      if (y < 120) {
        header.classList.remove('is-hidden');
        lastY = y;
        return;
      }
      if (Math.abs(y - lastY) < 8) return;

      const scrollingDown = y > lastY;
      const hasFocus = header.contains(document.activeElement);
      header.classList.toggle('is-hidden', scrollingDown && !hasFocus && !isCompact.matches);
      lastY = y;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  }

  function setupDrawer() {
    const drawer = $('#drawer');
    const trigger = $('.menu-button');
    if (!drawer || !trigger) return;

    const sheet = $('.drawer__sheet', drawer);
    let fallbackTimer = 0;

    const open = () => {
      clearTimeout(fallbackTimer);
      drawer.showModal();
      requestAnimationFrame(() => requestAnimationFrame(() => drawer.classList.add('is-open')));
      trigger.setAttribute('aria-expanded', 'true');
    };

    const close = (onClosed) => {
      if (!drawer.open) return;
      drawer.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        drawer.close();
        if (usingPointer) trigger.blur();
        onClosed?.();
      };

      const onTransitionEnd = (event) => {
        if (event.target !== sheet || event.propertyName !== 'clip-path') return;
        sheet.removeEventListener('transitionend', onTransitionEnd);
        finish();
      };
      sheet.addEventListener('transitionend', onTransitionEnd);
      fallbackTimer = setTimeout(finish, 700);
    };

    trigger.addEventListener('click', open);
    $('.drawer__close', drawer).addEventListener('click', () => close());

    drawer.addEventListener('cancel', (event) => {
      event.preventDefault();
      close();
    });

    $$('.drawer__nav a, .drawer__top .logo', drawer).forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const target = link.getAttribute('href');
        close(() => { location.hash = target; });
      });
    });
  }

  splitHeroTitle();
  setupReveal();
  setupHeader();
  setupDrawer();
})();
