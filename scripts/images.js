/** Preserve native titles/links; reveal an explicit fallback after image failure. */
export function initImages() {
  document.querySelectorAll('.shot,.device-frame img').forEach(image => {
    const container = image.closest('.project-visual,.device-frame');
    const fallback = container?.querySelector('.image-fallback');
    if (!fallback) return;
    const update = () => {
      const unavailable = image.complete && image.naturalWidth === 0;
      container.classList.toggle('image-unavailable', unavailable);
      fallback.hidden = !unavailable;
    };
    image.addEventListener('load', update);
    image.addEventListener('error', update);
    update();
  });
}
