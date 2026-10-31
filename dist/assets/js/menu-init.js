(() => {
  const root = document.documentElement;

  // Reveal the menu only after the small enhancement script is ready.
  root.classList.add('js-menu');
  setTimeout(() => {
    if (!root.dataset.menuReady) root.classList.remove('js-menu');
  }, 4000);
})();
