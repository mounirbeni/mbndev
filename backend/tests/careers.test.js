const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateApplication, ROLE_QUESTIONS, ROLE_TITLES } = require('../src/lib/careers');

const base = {
  role: 'frontend-developer', fullName: 'Sara El Amrani', email: 'Sara@Example.com',
  experienceYears: '3-5', availability: 'now',
  answers: JSON.stringify({ mainStack: 'React, Next.js', github: 'github.com/sara' }),
  languages: JSON.stringify(['English', 'French', 'Klingon']),
};

test('accepts a valid application and normalises it', () => {
  const { data, error } = validateApplication(base);
  assert.equal(error, undefined);
  assert.equal(data.email, 'sara@example.com');
  assert.equal(data.answers.github, 'https://github.com/sara');
  assert.deepEqual(data.languages, ['English', 'French']);
  assert.equal(data.phone, null);
});

test('rejects unknown roles and missing required answers', () => {
  assert.ok(validateApplication({ ...base, role: 'ceo' }).error);
  assert.ok(validateApplication({ ...base, answers: JSON.stringify({ github: 'github.com/x' }) }).error);
  assert.ok(validateApplication({ ...base, role: 'video-editor', answers: JSON.stringify({ software: 'Premiere' }) }).error);
});

test('rejects bad email, experience and links', () => {
  assert.ok(validateApplication({ ...base, email: 'nope' }).error);
  assert.ok(validateApplication({ ...base, experienceYears: '20' }).error);
  assert.ok(validateApplication({ ...base, portfolioUrl: 'javascript:alert(1)' }).error);
});

test('drops answers that do not belong to the role and strips markup', () => {
  const { data } = validateApplication({ ...base, message: '<script>x</script> hi', answers: JSON.stringify({ mainStack: 'Vue', showreel: 'https://x.com' }) });
  assert.deepEqual(Object.keys(data.answers), ['mainStack']);
  assert.ok(!data.message.includes('<'));
});

test('every role has a title', () => {
  for (const role of Object.keys(ROLE_QUESTIONS)) assert.ok(ROLE_TITLES[role], role);
});
