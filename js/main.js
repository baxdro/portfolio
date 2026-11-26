(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function splitTitle() {
    const title = $('.hero__title');
    if (!title || reduced) return;
    const text = title.textContent.trim();
    title.setAttribute('aria-label', text);
    title.textContent = '';
    text.split(/\s+/).forEach((word, index) => {
      if (index) title.append(' ');
      const span = document.createElement('span');
      span.className = 'w';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', index);
      span.textContent = word;
      title.append(span);
    });
  }

  function revealOnScroll() {
    const items = $$('.reveal');
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-in'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
  }

  function header() {
    const bar = $('.site-header');
    if (!bar) return;
    let lastY = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      bar.classList.toggle('is-scrolled', y > 24);
      if (y < 120) {
        bar.classList.remove('is-hidden');
        lastY = y;
        return;
      }
      if (Math.abs(y - lastY) < 8) return;
      bar.classList.toggle('is-hidden', y > lastY && !bar.contains(document.activeElement));
      lastY = y;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    bar.addEventListener('focusin', () => bar.classList.remove('is-hidden'));
  }

  function drawer() {
    const dialog = $('#drawer');
    const toggle = $('.burger');
    if (!dialog || !toggle) return;
    const sheet = $('.drawer__sheet', dialog);
    let timer = 0;

    const open = () => {
      clearTimeout(timer);
      dialog.showModal();
      requestAnimationFrame(() => requestAnimationFrame(() => dialog.classList.add('is-open')));
      toggle.setAttribute('aria-expanded', 'true');
    };

    const close = (then) => {
      if (!dialog.open) return;
      dialog.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        dialog.close();
        if (typeof then === 'function') then();
      };
      sheet.addEventListener('transitionend', finish, { once: true });
      timer = setTimeout(finish, 650);
    };

    toggle.addEventListener('click', open);
    $('.drawer__close', dialog).addEventListener('click', close);
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      close();
    });
    dialog.addEventListener('click', (event) => {
      if (!sheet.contains(event.target)) close();
    });
    $$('.drawer__nav a', dialog).forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        close(() => { location.hash = link.getAttribute('href'); });
      });
    });
  }

  splitTitle();
  revealOnScroll();
  header();
  drawer();
})();
