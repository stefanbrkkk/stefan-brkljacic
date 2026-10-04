export const bindingAttributes = ['data-i18n', 'data-i18n-html', 'data-i18n-aria-label', 'data-i18n-alt'];

/** Fail before touching the DOM when an edit leaves a translation incomplete. */
export function validateTranslations(dictionaries, bindings = []) {
  const keys = new Set([...Object.keys(dictionaries.en || {}), ...Object.keys(dictionaries.sr || {}), ...bindings]);
  if (!keys.size) throw new Error('Translation dictionaries must contain nonempty keys');
  for (const language of ['en', 'sr']) {
    if (!dictionaries[language]) throw new Error(`Missing ${language} dictionary`);
    for (const key of keys) {
      const value = dictionaries[language][key];
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`Missing or empty ${language} translation: ${key}`);
      }
    }
  }
}
