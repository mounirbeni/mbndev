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

test('archives used for code deliverables are recognised by their bytes', () => {
  const rar = Buffer.from([0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00]);
  const sevenZ = Buffer.from([0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c, 0x00, 0x04]);
  const gz = Buffer.from([0x1f, 0x8b, 0x08, 0x00]);
  assert.equal(matchesSignature(rar, '.rar'), true);
  assert.equal(matchesSignature(sevenZ, '.7z'), true);
  assert.equal(matchesSignature(gz, '.gz'), true);
  assert.equal(matchesSignature(gz, '.tgz'), true);
  const tar = Buffer.alloc(300); tar.write('ustar', 257, 'ascii');
  assert.equal(matchesSignature(tar, '.tar'), true);
});

test('a Windows executable renamed to .rar or .mp4 is rejected', () => {
  const exe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00]);
  assert.equal(matchesSignature(exe, '.rar'), false);
  assert.equal(matchesSignature(exe, '.mp4'), false);
});

test('an MP4 (ftyp box) matches .mp4 and .mov', () => {
  const mp4 = Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);
  assert.equal(matchesSignature(mp4, '.mp4'), true);
  assert.equal(matchesSignature(mp4, '.mov'), true);
});
