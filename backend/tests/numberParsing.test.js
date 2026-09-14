const { test } = require('node:test');
const assert   = require('node:assert');
const { parseOptionalNumber } = require('../src/lib/numberParsing');

test('returns null for undefined (field not provided)', () => {
  assert.equal(parseOptionalNumber(undefined), null);
});

test('returns null for an empty string', () => {
  assert.equal(parseOptionalNumber(''), null);
});

test('returns null for 0 (falsy, treated as "not provided")', () => {
  assert.equal(parseOptionalNumber(0), null);
});

test('parses a valid numeric string', () => {
  assert.equal(parseOptionalNumber('14'), 14);
});

test('parses a valid number', () => {
  assert.equal(parseOptionalNumber(14), 14);
});

test('returns undefined for a non-numeric string (invalid — caller must reject)', () => {
  assert.equal(parseOptionalNumber('not-a-number'), undefined);
});

test('returns undefined for NaN', () => {
  assert.equal(parseOptionalNumber(NaN), undefined);
});

test('returns undefined for Infinity', () => {
  assert.equal(parseOptionalNumber(Infinity), undefined);
});
