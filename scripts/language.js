import { copy } from './content.js';
import { bindingAttributes, validateTranslations } from './translations.js';

export function initLanguage(onChange = () => {}) {
  const bindings = [...document.querySelectorAll(bindingAttributes.map(attribute => `[${attribute}]`).join(','))]
    .flatMap(element => bindingAttributes.map(attribute => element.getAttribute(attribute)).filter(key => key !== null));
  validateTranslations(copy, bindings);
  const switcher = document.querySelector('.lang-switch');
  /** @param {'en'|'sr'} language */
  const setLanguage = (language) => {
    const lang = language === 'sr' ? 'sr' : 'en';
    const dict = copy[lang];
    document.documentElement.lang = lang;
    switcher.dataset.lang = lang;
    switcher.setAttribute('aria-pressed', String(lang === 'sr'));
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = dict[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = dict[el.dataset.i18nHtml]; });
    for (const attribute of ['aria-label', 'alt']) {
      document.querySelectorAll('[data-i18n-' + attribute + ']').forEach(el => {
        el.setAttribute(attribute, dict[el.getAttribute('data-i18n-' + attribute)]);
      });
    }
    try { localStorage.setItem('stefan-lang', lang); } catch (_) { /* Optional browser capability; preserve the visible fallback. */ }
    onChange();
  };
  const saved = (() => { try { return localStorage.getItem('stefan-lang'); } catch (_) { return null; } })();
  switcher.addEventListener('click', () => setLanguage(switcher.dataset.lang === 'en' ? 'sr' : 'en'));


  return { commit: () => setLanguage(saved === 'sr' ? 'sr' : 'en') };
}
