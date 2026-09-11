/** Slower wheel travel with time-based damping, using real native scroll positions.
 * Sticky elements, scroll-linked scenes, touch, and browser history keep working.
 */
export function createSmoothScroll({ reducedMotion, onUpdate }) {
 const speed = 0.58;
 const damping = 170;
 let target = scrollY;
 let expected = scrollY;
 let frame = 0;
 let lastTime = 0;
 let journey = null;
 const limit = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
 const bound = value => Math.max(0, Math.min(limit(), value));
 function stop() {
  cancelAnimationFrame(frame); frame = 0; journey = null; lastTime = 0;
  target = expected = scrollY;
 }
 function tick(now) {
  frame = 0;
  if (document.body.classList.contains('modal-open') || reducedMotion.matches) { stop(); return; }
  target = bound(target);
  let next;
  if (journey) {
   const progress = Math.min(1, (now - journey.started) / journey.duration);
   const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
   next = journey.from + (target - journey.from) * eased;
   if (progress === 1) journey = null;
  } else {
   const elapsed = lastTime ? Math.min(64, now - lastTime) : 16.67;
   next = scrollY + (target - scrollY) * (1 - Math.exp(-elapsed / damping));
   if (Math.abs(target - next) < 1) next = target;
  }
  lastTime = now;
  window.scrollTo({ top: next, behavior: 'instant' });
  expected = scrollY;
  onUpdate();
  if (journey || Math.abs(target - scrollY) >= 1) frame = requestAnimationFrame(tick);
  else { target = scrollY; lastTime = 0; }
 }
 function start() { if (!frame) { lastTime = 0; frame = requestAnimationFrame(tick); } }
 function scrollToPosition(top, { immediate = false } = {}) {
  stop(); target = bound(top);
  if (reducedMotion.matches || immediate) {
   window.scrollTo({ top: target, behavior: 'instant' }); expected = scrollY; onUpdate(); return;
  }
  journey = { from: scrollY, started: performance.now(), duration: Math.min(2600, Math.max(1100, Math.abs(target - scrollY) * .25)) };
  start();
 }
 function nestedScroller(node) {
  for (let el = node instanceof Element ? node : null; el && el !== document.body; el = el.parentElement) {
   if (el.matches('dialog, input, textarea, select, [contenteditable="true"]')) return true;
   if (el.scrollHeight > el.clientHeight && /(auto|scroll)/.test(getComputedStyle(el).overflowY)) return true;
  }
  return false;
 }
 function moveBy(delta) {
  if (journey) { stop(); }
  // Drop forward momentum immediately when the user reverses direction.
  if (delta * (target - scrollY) < 0) target = scrollY;
  target = bound(target + delta); start();
 }
 addEventListener('wheel', event => {
  if (reducedMotion.matches || event.ctrlKey || event.metaKey || !event.cancelable || Math.abs(event.deltaX) > Math.abs(event.deltaY) || nestedScroller(event.target) || document.body.classList.contains('modal-open')) return;
  const unit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? innerHeight : 1;
  const delta = event.deltaY * unit * speed;
  if (!delta || (bound(target + delta) === scrollY && !frame)) return;
  event.preventDefault(); moveBy(delta);
 }, { passive: false });
 addEventListener('keydown', event => {
  if (reducedMotion.matches || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || nestedScroller(event.target) || document.body.classList.contains('modal-open')) return;
  if (event.target instanceof Element && event.target.closest('button, a, [role="button"], [role="tab"]')) return;
  const step = innerHeight * .7;
  const distances = { ArrowDown: 65, ArrowUp: -65, PageDown: step, PageUp: -step, ' ': event.shiftKey ? -step : step };
  if (event.key in distances) { event.preventDefault(); moveBy(distances[event.key]); }
  else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); scrollToPosition(event.key === 'Home' ? 0 : limit()); }
 });
 // Native touch gestures, scrollbar dragging, focus scrolling and history changes
 // take control immediately rather than fighting a pending animation.
 addEventListener('pointerdown', stop, { passive: true });
 addEventListener('touchstart', stop, { passive: true });
 addEventListener('resize', stop, { passive: true });
 addEventListener('scroll', () => {
  if (Math.abs(scrollY - expected) > 2) stop();
 }, { passive: true });
 document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
 return { to: scrollToPosition, stop };
}
