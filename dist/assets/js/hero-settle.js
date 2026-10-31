(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const pageRoot = document.documentElement;
  const settleDuration = 1700;

  pageRoot.classList.add('js-settle');
  // Recover to the final CSS state even if initialization is interrupted.
  setTimeout(() => pageRoot.classList.remove('js-settle'), 2400);

  document.addEventListener('DOMContentLoaded', () => {
    const visual = document.querySelector('.hero-visual');
    if (!visual) return;

    setTimeout(() => visual.classList.add('is-settled'), 350);
    setTimeout(() => visual.classList.add('is-done'), settleDuration);
  }, { once: true });
})();
