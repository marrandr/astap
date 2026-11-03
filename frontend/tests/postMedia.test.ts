import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateMediaSelection } from '../src/components/CreatePost/postMedia.ts';

const file = (name: string, type: string, size = 10) => ({ name, type, size }) as File;

test('accepts several images and videos in the same article', () => {
  assert.equal(validateMediaSelection([], [file('a.jpg', 'image/jpeg'), file('b.mp4', 'video/mp4')]), '');
});
test('counts existing attachments when adding more files', () => {
  assert.match(validateMediaSelection(Array.from({ length: 20 }, () => file('a.jpg', 'image/jpeg')), [file('b.jpg', 'image/jpeg')]), /20/);
});
test('rejects unsupported files and oversize images and videos', () => {
  assert.match(validateMediaSelection([], [file('a.svg', 'image/svg+xml')]), /format/);
  assert.match(validateMediaSelection([], [file('a.jpg', 'image/jpeg', 6 * 1024 ** 2)]), /5 Mo/);
  assert.match(validateMediaSelection([], [file('a.mp4', 'video/mp4', 101 * 1024 ** 2)]), /100 Mo/);
});
test('rejects attachments exceeding the total article size', () => {
  const video = file('a.mp4', 'video/mp4', 100 * 1024 ** 2);
  assert.match(validateMediaSelection([video, video], [file('a.jpg', 'image/jpeg')]), /200 Mo/);
});
