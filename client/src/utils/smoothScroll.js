const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function smoothScrollTo(targetY, duration = 650) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 1) return;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

export function smoothScrollToElement(element, { offset = 0, duration = 650 } = {}) {
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY + offset;
  smoothScrollTo(top, duration);
}

export function smoothScrollContainer(container, targetScrollTop, duration = 320) {
  if (!container) return;
  const startTop = container.scrollTop;
  const distance = targetScrollTop - startTop;
  if (Math.abs(distance) < 1) return;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    container.scrollTop = startTop + distance * easeInOutCubic(progress);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
