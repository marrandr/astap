import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePressCard } from '../src/components/Signup/signupFiles.ts';

test('accepts PNG, JPEG and PDF press cards up to 10 MiB', () => {
  for (const type of ['image/png', 'image/jpeg', 'application/pdf']) {
    assert.equal(validatePressCard({ type, size: 10 * 1024 ** 2 }), '');
  }
});

test('rejects unsupported, empty and oversized press cards', () => {
  assert.match(validatePressCard({ type: 'image/svg+xml', size: 100 }), /PNG, JPG ou PDF/);
  assert.match(validatePressCard({ type: 'image/png', size: 0 }), /vide/);
  assert.match(validatePressCard({ type: 'application/pdf', size: 10 * 1024 ** 2 + 1 }), /10 Mo/);
});
