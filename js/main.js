const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const drawer = document.querySelector('#drawer');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function initReveal() {
  if (reducedMotion.matches) return;

  document.querySelectorAll('.stack__item').forEach((item, index) => {
    item.style.setProperty('--i', index);
  });

  const observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      target.classList.add('is-visible');
      observer.unobserve(target);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  for (const block of document.querySelectorAll('.reveal')) {
    if (block.getBoundingClientRect().top < window.innerHeight) {
      block.classList.remove('reveal');
    } else {
      observer.observe(block);
    }
  }

  document.documentElement.classList.add('js');
}

function initHeader() {
  let lastY = window.scrollY;

  const update = () => {
    const y = window.scrollY;
    const canHide = y > 120;

    header.classList.toggle('is-scrolled', y > 24);
    if (canHide && Math.abs(y - lastY) < 8) return;

    header.classList.toggle('is-hidden', canHide && y > lastY);
    lastY = y;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initDrawer() {
  const close = async () => {
    drawer.classList.add('is-closing');
    await Promise.allSettled(drawer.getAnimations({ subtree: true }).map((animation) => animation.finished));
    drawer.close();
    drawer.classList.remove('is-closing');
  };

  menuButton.hidden = false;
  menuButton.addEventListener('click', () => {
    drawer.showModal();
    menuButton.setAttribute('aria-expanded', 'true');
  });

  drawer.querySelector('.drawer__close').addEventListener('click', close);

  drawer.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  drawer.addEventListener('close', () => {
    menuButton.setAttribute('aria-expanded', 'false');
  });

  drawer.addEventListener('click', async (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    event.preventDefault();
    await close();
    location.assign(link.hash);
  });
}

function initAccordions() {
  document.addEventListener('click', async (event) => {
    const item = event.target.closest('.accordion__summary')?.parentElement;
    if (!item?.open || reducedMotion.matches) return;

    event.preventDefault();
    if (item.classList.toggle('is-closing') === false) return;

    await Promise.allSettled(item.getAnimations({ subtree: true }).map((animation) => animation.finished));
    if (!item.classList.contains('is-closing')) return;

    item.open = false;
    item.classList.remove('is-closing');
  });
}

function initTheme() {
  const storageKey = 'color-scheme';
  const scheme = document.querySelector('meta[name="color-scheme"]');
  const toggles = document.querySelectorAll('.theme-toggle');
  const systemDark = matchMedia('(prefers-color-scheme: dark)');

  const system = () => (systemDark.matches ? 'dark' : 'light');
  const rendered = () => (scheme.content === 'light dark' ? system() : scheme.content);

  const sync = () => {
    const label = rendered() === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
    const tint = getComputedStyle(document.documentElement).backgroundColor;

    toggles.forEach((toggle) => toggle.setAttribute('aria-label', label));
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.content = tint;
    });
  };

  const apply = (override) => {
    scheme.content = override ?? 'light dark';
    sync();
  };

  const remember = (override) => {
    try {
      if (override) localStorage.setItem(storageKey, override);
      else localStorage.removeItem(storageKey);
    } catch {}
  };

  const flip = () => {
    const target = rendered() === 'dark' ? 'light' : 'dark';
    const override = target === system() ? null : target;

    remember(override);
    apply(override);
  };

  systemDark.addEventListener('change', sync);
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey) apply(event.newValue);
  });

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', flip);
    toggle.hidden = false;
  });
  sync();
}

initReveal();
initHeader();
initDrawer();
initAccordions();
initTheme();
