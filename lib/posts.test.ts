import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromRow, readTimeFor, slugifyPost, validatePostInput } from './posts.ts';

const long = 'word '.repeat(20);

test('validatePostInput: defaults, slug from title, limits', () => {
  const r = validatePostInput({ title: '  How Faceless Channels Earn $5,000/mo in History  ', content: long });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.value.slug, 'how-faceless-channels-earn-5-000-mo-in-history');
  assert.equal(r.value.status, 'published');
  assert.equal(r.value.originalSlug, null);

  assert.equal(validatePostInput({ title: 'ok title', slug: 'My Custom Slug!', content: long, status: 'draft' }).ok && validatePostInput({ title: 'ok title', slug: 'My Custom Slug!', content: long }).ok, true);
  const custom = validatePostInput({ title: 'ok title', slug: 'My Custom Slug!', content: long, status: 'draft' });
  assert.equal(custom.ok && custom.value.slug, 'my-custom-slug');
  assert.equal(custom.ok && custom.value.status, 'draft');

  assert.equal(validatePostInput({ title: 'x', content: long }).ok, false); // title too short
  assert.equal(validatePostInput({ title: 'Valid title', content: 'too short' }).ok, false);
  assert.equal(validatePostInput({ title: 'Valid title', slug: '!!!', content: long }).ok, true); // falls back to title slug
  assert.equal(validatePostInput({ title: 'Valid title', content: long, coverImage: 'javascript:alert(1)' }).ok, false);
  assert.equal(validatePostInput({ title: 'Valid title', content: long, coverImage: 'https://example.com/a.jpg' }).ok, true);
  assert.equal(validatePostInput({ title: 'Valid title', content: long, excerpt: 'e'.repeat(301) }).ok, false);
  assert.equal(validatePostInput(null).ok, false);
});

test('slugifyPost, readTimeFor and fromRow', () => {
  assert.equal(slugifyPost('Ünïcode & Things'), 'n-code-and-things');
  assert.equal(readTimeFor('a '.repeat(10)), '1 min read');
  assert.equal(readTimeFor('a '.repeat(1000)), '5 min read');
  const p = fromRow({ slug: 's', title: 'T', description: null, body_md: 'b', cover_url: null, status: 'published', published_at: '2026-11-02T22:00:00Z', category: null, updated_at: '2026-11-02T00:00:00Z' });
  assert.equal(p.date, 'Nov 2, 2026'); // UTC, not the server's local day
  assert.equal(p.category, 'Guides');
  assert.equal(p.source, 'database');
});
