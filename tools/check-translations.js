import { readFile } from 'node:fs/promises';
import { copy } from '../scripts/content.js';
import { validateTranslations } from '../scripts/translations.js';

const html = await readFile('index.html', 'utf8');
const bindings = [...html.matchAll(/data-i18n(?:-(?:html|aria-label|alt))?=["']([^"']+)["']/g)].map(match => match[1]);
validateTranslations(copy, bindings);
process.stdout.write(`Translations validated: ${Object.keys(copy.en).length} keys per language, ${bindings.length} HTML bindings.\n`);
