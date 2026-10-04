import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copy } from '../../scripts/content.js';
import { validateTranslations } from '../../scripts/translations.js';

test('missing, empty and mismatched dictionaries cannot render undefined', () => {
  assert.throws(() => validateTranslations({ en: {}, sr: {} }), /nonempty keys/);
  assert.throws(() => validateTranslations({ en: copy.en }), /Missing sr dictionary/);
  const missing = structuredClone(copy);
  delete missing.sr.navWork;
  assert.throws(() => validateTranslations(missing), /sr.*navWork/);
  const empty = structuredClone(copy);
  empty.en.navWork = '  ';
  assert.throws(() => validateTranslations(empty), /en.*navWork/);
  const extra = structuredClone(copy);
  extra.sr.accidentalKey = 'Text';
  assert.throws(() => validateTranslations(extra), /en.*accidentalKey/);
});

test('binding validation rejects unknown keys and accepts current nonempty dictionaries', () => {
  assert.throws(() => validateTranslations(copy, ['futureMissingBinding']), /futureMissingBinding/);
  assert.doesNotThrow(() => validateTranslations(copy, ['navWork','dialogGoal','imageUnavailable']));
});
