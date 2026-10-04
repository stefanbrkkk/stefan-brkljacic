import { initLanguage } from './language.js';
import { initMotion } from './motion.js';
import { initEmail } from './email.js';
import { initNavigation } from './navigation.js';
import { initInquiry } from './inquiry.js';
import { initImages } from './images.js';

// Imports define controllers only. Setup order preserves the shared language and
// frame contracts: language binding → motion → copy → navigation → ready states.
// Inquiry is independent, so an enhancement failure retains its native fallback.
try {
  let motion;
  const language = initLanguage(() => motion?.updateLanguage());
  motion = initMotion();
  initEmail();
  initNavigation(motion.requestFrame);
  // Commit enhancement state only after the main component setup succeeds.
  language.commit();
  document.documentElement.classList.add('language-ready', 'motion-ready', 'menu-ready', 'copy-ready');
  if (motion.revealReady) document.documentElement.classList.add('reveal-ready');
  motion.requestFrame();
} catch (error) {
  console.error('Portfolio enhancements unavailable:', error);
}
initImages();

try {
  initInquiry();
} catch (error) {
  console.error('Inquiry enhancement unavailable:', error);
}
