import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPostDraft, validatePostDraft } from '../src/components/CreatePost/postDraft.ts';

test('new articles have independent identities, sources and attachments', () => {
  const first = createPostDraft();
  const second = createPostDraft();
  first.sources[0].url = 'https://example.com';
  assert.notEqual(first.id, second.id);
  assert.notEqual(first.sources[0].id, second.sources[0].id);
  assert.equal(second.sources[0].url, '');
  assert.notEqual(first.media, second.media);
});

test('validates each article separately, including its sources', () => {
  const first = { ...createPostDraft(), title: 'Un premier article', category: 'societe', content: 'Contenu' };
  const second = createPostDraft();
  assert.deepEqual(validatePostDraft(first), {});
  assert.deepEqual(Object.keys(validatePostDraft(second)), ['title', 'category', 'content']);
  first.sources[0].url = 'javascript:alert(1)';
  assert.ok(validatePostDraft(first)[`source-${first.sources[0].id}`]);
});
