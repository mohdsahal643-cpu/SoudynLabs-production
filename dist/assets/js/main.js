(() => {
  'use strict';
  const siteHeader = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-button');
  const navigation = document.querySelector('#site-navigation');

  if (!siteHeader || !menuToggle || !navigation) return;

  const mobileBreakpoint = window.matchMedia('(max-width: 899px)');
  const pageContent = [...document.querySelectorAll('main, .site-footer, .skip-link')];
  let menuIsOpen = false;

  function closeMenu(restoreFocus = true) {
    menuIsOpen = false;
    siteHeader.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = 'Menu';
    pageContent.forEach(element => { element.inert = false; });
    if (restoreFocus) menuToggle.focus();
  }

  function openMenu() {
    menuIsOpen = true;
    siteHeader.classList.add('is-open');
    document.body.classList.add('menu-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.textContent = 'Close';
    pageContent.forEach(element => { element.inert = true; });
    navigation.querySelector('a').focus();
  }

  menuToggle.addEventListener('click', () => {
    if (menuIsOpen) closeMenu();
    else openMenu();
  });

  siteHeader.addEventListener('keydown', event => {
    if (!menuIsOpen) return;
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(); }
    if (event.key !== 'Tab') return;
    const focusableItems = [menuToggle, ...navigation.querySelectorAll('a')];
    const firstItem = focusableItems[0];
    const lastItem = focusableItems.at(-1);

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  });

  navigation.addEventListener('click', event => {
    if (menuIsOpen && event.target.closest('a')) closeMenu(false);
  });

  mobileBreakpoint.addEventListener('change', () => {
    if (!mobileBreakpoint.matches && menuIsOpen) closeMenu(false);
  });

  const currentPath = location.pathname.replace(/index\.html$/, '');
  navigation.querySelectorAll('a:not(.button)').forEach(link => {
    const isCurrentPage = link.pathname === currentPath;
    const isProductPage = link.pathname === '/products.html' &&
      (currentPath === '/products.html' || currentPath === '/travelos.html');
    if (isCurrentPage || isProductPage) link.setAttribute('aria-current', 'page');
  });

  const updateHeaderOnScroll = () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
  updateHeaderOnScroll();

  document.documentElement.classList.add('js-menu');
  document.documentElement.dataset.menuReady = 'true';

  // Keep analytics optional. The event is harmless when no provider is configured.
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link?.textContent.trim() === 'Start a project') {
      document.dispatchEvent(new CustomEvent('soudyn:analytics', { detail: { name: 'start_project_click' } }));
    }
  });
  document.addEventListener('soudyn:analytics', event => {
    if (window.SOUDYN?.analytics === 'plausible' && typeof window.plausible === 'function') {
      window.plausible(event.detail.name);
    }
  });
})();
