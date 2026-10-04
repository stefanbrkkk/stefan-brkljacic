export function initNavigation(requestFrame) {
  const menuBtn = document.querySelector('.menu-btn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mainEl = document.getElementById('main');
  let menuOpen = false;
  /** Header controls and mobile links form the active keyboard region. */
  const menuControls = () => [...document.querySelectorAll('.topbar a,.topbar button,#mobileMenu a')].filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  const setMenuOpen = (open, {restoreFocus = true} = {}) => {
    menuOpen = Boolean(open && innerWidth <= 980);
    const focusWasInMenu = mobileMenu.contains(document.activeElement) || document.activeElement === menuBtn;
    document.body.classList.toggle('menu-open', menuOpen);
    menuBtn.setAttribute('aria-expanded', String(menuOpen));
    mobileMenu.setAttribute('aria-hidden', String(!menuOpen));
    mobileMenu.inert = !menuOpen;
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
    if (mainEl) mainEl.inert = menuOpen;
    if (menuOpen) mobileMenu.querySelector('nav a')?.focus();
    else if (restoreFocus && focusWasInMenu) (innerWidth <= 980 ? menuBtn : document.querySelector('.brand')).focus();
    requestFrame();
  };
  if (menuBtn && mobileMenu) {
    setMenuOpen(false, {restoreFocus:false});
    menuBtn.addEventListener('click', () => setMenuOpen(!menuOpen));
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      setMenuOpen(false, {restoreFocus:false});
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        const target = document.getElementById(href.slice(1));
        if (target) {
          if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
          target.focus({preventScroll:true});
        }
      }
    }));
    document.querySelector('.brand').addEventListener('click', () => {
      if (menuOpen) setMenuOpen(false, {restoreFocus:false});
    });
    addEventListener('resize', () => {
      if (menuOpen && innerWidth > 980) setMenuOpen(false);
    }, {passive:true});
    addEventListener('keydown', event => {
      if (!menuOpen) return;
      if (event.key === 'Escape') { event.preventDefault(); setMenuOpen(false); }
      if (event.key !== 'Tab') return;
      const controls = menuControls(), first = controls[0], last = controls[controls.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      else if (!controls.includes(document.activeElement)) { event.preventDefault(); first.focus(); }
    });
  }
}
