import { initToast } from './toast.js';

export function initEmail() {
  const showToast = initToast();
  const copyEmail = () => {
    const email = 'stefanbrkk@gmail.com';
    const done = () => showToast(document.documentElement.lang === 'sr' ? 'Kopirano ✓' : 'Copied ✓');
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = email; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) { /* Optional browser capability; preserve the visible fallback. */ }
      document.body.removeChild(ta);
      ok ? done() : showToast(email);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(done).catch(fallback);
    else fallback();
  };
  ['copyBtn', 'copyBtn2'].forEach(id => { const b = document.getElementById(id); if (b) b.addEventListener('click', copyEmail); });
}
