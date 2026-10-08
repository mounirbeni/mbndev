const { test } = require('node:test');
const assert   = require('node:assert');
const { CAMPAIGNS, campaignStatus, getCampaign, listCampaigns, monthKey } = require('../src/lib/broadcastCampaigns');

const user = { name: 'Youssef <img src=x onerror=alert(1)> Amrani', role: 'client', email: 'client@example.com' };

test('monthKey uses Morocco time (UTC+1)', () => {
  // 23:30 UTC on 31 Oct is already 00:30 on 1 Nov in Casablanca
  assert.equal(monthKey(new Date('2026-10-31T23:30:00Z')), '2026-11');
  assert.equal(monthKey(new Date('2026-10-31T12:00:00Z')), '2026-10');
});

test('monthly campaigns: live in their month, upcoming before, archived after', () => {
  const oct = getCampaign('october2026');
  assert.equal(campaignStatus(oct, new Date('2026-09-20T12:00:00Z')), 'upcoming');
  assert.equal(campaignStatus(oct, new Date('2026-10-01T00:30:00Z')), 'live');
  assert.equal(campaignStatus(oct, new Date('2026-10-31T12:00:00Z')), 'live');
  assert.equal(campaignStatus(oct, new Date('2026-11-01T12:00:00Z')), 'archived');
  assert.equal(campaignStatus(getCampaign('december2026'), new Date('2027-01-02T12:00:00Z')), 'archived');
});

test('evergreen is always live, retired is always archived', () => {
  const now = new Date('2026-10-08T12:00:00Z');
  assert.equal(campaignStatus(getCampaign('checkIn'), now), 'live');
  assert.equal(campaignStatus(getCampaign('juneUpdate'), now), 'archived');
  assert.equal(campaignStatus(getCampaign('platformUpdate'), now), 'archived');
  assert.equal(campaignStatus(getCampaign('comingSoon'), now), 'archived');
});

test('there is a monthly campaign for every month from October to December 2026', () => {
  const months = CAMPAIGNS.filter((c) => c.kind === 'monthly').map((c) => c.month).sort();
  assert.deepEqual(months, ['2026-10', '2026-11', '2026-12']);
});

test('keys are unique', () => {
  const keys = CAMPAIGNS.map((c) => c.key);
  assert.equal(new Set(keys).size, keys.length);
});

for (const c of CAMPAIGNS) {
  test(`${c.key} renders a complete, safe email`, () => {
    const { subject, preheader, html } = c.build(user);
    assert.ok(subject && subject.length < 120, 'subject present and short');
    assert.ok(typeof preheader === 'string');
    assert.match(html, /^<!DOCTYPE html>/);
    assert.ok(html.includes('</html>'));
    assert.ok(!/undefined|\[object Object\]/.test(html), 'no undefined values');
    assert.ok(!/>,\s*</.test(html), 'no stray commas from an un-joined array');
    assert.ok(!html.includes('<img src=x'), 'user name is escaped');
  });
}

test('listCampaigns returns UI metadata with a status for each campaign', () => {
  const list = listCampaigns(user, new Date('2026-10-08T12:00:00Z'));
  assert.equal(list.length, CAMPAIGNS.length);
  const oct = list.find((x) => x.key === 'october2026');
  assert.equal(oct.status, 'live');
  assert.equal(oct.monthLabel, 'October 2026');
  assert.ok(list.every((x) => ['live', 'upcoming', 'archived'].includes(x.status)));
});

test('admins get a link to the admin dashboard, clients to theirs', () => {
  const admin = getCampaign('october2026').build({ name: 'Mounir', role: 'admin' }).html;
  const client = getCampaign('october2026').build({ name: 'Sara', role: 'client' }).html;
  assert.ok(admin.includes('/dashboard/admin'));
  assert.ok(client.includes('/dashboard/client'));
});
