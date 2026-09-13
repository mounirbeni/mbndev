const { test } = require('node:test');
const assert   = require('node:assert');
const { matchesSignature } = require('../src/lib/fileSignature');

test('a real PNG signature matches .png', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0]);
  assert.equal(matchesSignature(png, '.png'), true);
});

test('a real JPEG signature matches .jpg and .jpeg', () => {
  const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
  assert.equal(matchesSignature(jpg, '.jpg'), true);
  assert.equal(matchesSignature(jpg, '.jpeg'), true);
});

test('a renamed executable does NOT pass as a PNG (regression: MIME/extension spoofing)', () => {
  const exe = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // "MZ" — Windows PE header
  assert.equal(matchesSignature(exe, '.png'), false);
});

test('a renamed executable does NOT pass as a PDF', () => {
  const exe = Buffer.from([0x4d, 0x5a, 0x90, 0x00]);
  assert.equal(matchesSignature(exe, '.pdf'), false);
});

test('a real PDF signature matches .pdf', () => {
  const pdf = Buffer.from('%PDF-1.4\n', 'ascii');
  assert.equal(matchesSignature(pdf, '.pdf'), true);
});

test('a real ZIP signature matches .zip and .docx (docx is a zip container)', () => {
  const zip = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]);
  assert.equal(matchesSignature(zip, '.zip'), true);
  assert.equal(matchesSignature(zip, '.docx'), true);
});

test('a real WEBP signature matches .webp', () => {
  const webp = Buffer.concat([
    Buffer.from('RIFF', 'ascii'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBP', 'ascii'),
  ]);
  assert.equal(matchesSignature(webp, '.webp'), true);
});

test('a Windows executable renamed to .webp is rejected', () => {
  const exe = Buffer.from([0x4d, 0x5a, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(matchesSignature(exe, '.webp'), false);
});

test('an empty buffer never matches a known signature', () => {
  assert.equal(matchesSignature(Buffer.alloc(0), '.png'), false);
});

test('plain text (.txt) accepts ordinary content but rejects an ELF binary', () => {
  assert.equal(matchesSignature(Buffer.from('hello world'), '.txt'), true);
  const elf = Buffer.from([0x7f, 0x45, 0x4c, 0x46]);
  assert.equal(matchesSignature(elf, '.txt'), false);
});

test('an extension with no defined signature check fails open', () => {
  assert.equal(matchesSignature(Buffer.from('anything'), '.unknownext'), true);
});
