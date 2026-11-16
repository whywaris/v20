import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categoriesOf, fromRow, isLive, mentionsEarnings, readTimeFor, relatedPosts, slugifyPost, validatePostInput } from './posts.ts';
import { addRpmTableNotes, renderArticle, splitForAd } from './markdown.ts';

const long = 'word '.repeat(20);
const row = (slug: string, category: string | null, published_at: string | null, status: 'published' | 'draft' = 'published') =>
  fromRow({ slug, title: slug, description: null, body_md: 'b', cover_url: null, status, published_at, category, updated_at: '2026-01-01T00:00:00Z' });

test('validatePostInput: defaults, slug from title, limits', () => {
  const r = validatePostInput({ title: '  How Faceless Channels Earn $5,000/mo in History  ', content: long });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.value.slug, 'how-faceless-channels-earn-5-000-mo-in-history');
  assert.equal(r.value.status, 'published');
  assert.equal(r.value.originalSlug, null);
  assert.equal(r.value.publishAt, null);

  const custom = validatePostInput({ title: 'ok title', slug: 'My Custom Slug!', content: long, status: 'draft' });
  assert.equal(custom.ok && custom.value.slug, 'my-custom-slug');
  assert.equal(custom.ok && custom.value.status, 'draft');

  assert.equal(validatePostInput({ title: 'x', content: long }).ok, false); // title too short
  assert.equal(validatePostInput({ title: 'Valid title', content: 'too short' }).ok, false);
  assert.equal(validatePostInput({ title: 'Valid title', slug: '!!!', content: long }).ok, true); // falls back to title slug
  assert.equal(validatePostInput({ title: 'Valid title', content: long, coverImage: 'javascript:alert(1)' }).ok, false);
  assert.equal(validatePostInput({ title: 'Valid title', content: long, coverImage: 'https://example.com/a.jpg' }).ok, true);
  assert.equal(validatePostInput({ title: 'Valid title', content: long, excerpt: 'e'.repeat(301) }).ok, false);
  assert.equal(validatePostInput({ title: 'Valid title', content: long, seoTitle: 't'.repeat(71) }).ok, false);
  assert.equal(validatePostInput({ title: 'Valid title', content: long, seoDescription: 'd'.repeat(171) }).ok, false);
  assert.equal(validatePostInput({ title: 'Valid title', content: long, publishAt: 'not a date' }).ok, false);
  const sched = validatePostInput({ title: 'Valid title', content: long, publishAt: '2030-01-02T10:00' });
  assert.equal(sched.ok && sched.value.publishAt?.startsWith('2030-01-02'), true);
  assert.equal(validatePostInput(null).ok, false);
});

test('slugifyPost, readTimeFor and fromRow', () => {
  assert.equal(slugifyPost('Ünïcode & Things'), 'n-code-and-things');
  assert.equal(readTimeFor('a '.repeat(10)), '1 min read');
  assert.equal(readTimeFor('a '.repeat(1000)), '5 min read');
  const p = row('s', null, '2026-11-02T22:00:00Z');
  assert.equal(p.date, 'Nov 2, 2026'); // UTC, not the server's local day
  assert.equal(p.category, 'Guides');
  assert.equal(p.categorySlug, 'guides');
});

test('isLive hides drafts and scheduled posts', () => {
  const now = Date.parse('2026-06-01T00:00:00Z');
  assert.equal(isLive(row('a', null, '2026-05-01T00:00:00Z'), now), true);
  assert.equal(isLive(row('b', null, '2026-07-01T00:00:00Z'), now), false); // scheduled
  assert.equal(isLive(row('c', null, '2026-05-01T00:00:00Z', 'draft'), now), false);
});

test('categoriesOf and relatedPosts', () => {
  const posts = [row('a', 'Money', null), row('b', 'Money', null), row('c', 'Tips', null), row('d', 'Money', null)];
  assert.deepEqual(categoriesOf(posts).map((c) => [c.slug, c.count]), [['money', 3], ['tips', 1]]);
  assert.deepEqual(relatedPosts(posts[0], posts, 3).map((p) => p.slug), ['b', 'd', 'c']);
});

test('renderArticle adds heading ids and a table of contents', () => {
  const { html, toc } = renderArticle('## Intro\n\ntext\n\n### Step **one**\n\n## Intro\n\n[x](https://example.com)');
  assert.deepEqual(toc, [
    { id: 'intro', text: 'Intro', level: 2 },
    { id: 'step-one', text: 'Step one', level: 3 },
    { id: 'intro-2', text: 'Intro', level: 2 },
  ]);
  assert.match(html, /<h2 id="intro">Intro<\/h2>/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
});

test('splitForAd puts the ad after the second section, and skips short articles', () => {
  assert.deepEqual(splitForAd('<p>a</p><h2 id="x">1</h2><p>b</p><h2>2</h2><p>c</p><h2>3</h2><p>d</p>'), ['<p>a</p><h2 id="x">1</h2><p>b</p><h2>2</h2><p>c</p>', '<h2>3</h2><p>d</p>']);
  assert.deepEqual(splitForAd('<h2>1</h2><p>b</p><h2>2</h2>'), ['<h2>1</h2><p>b</p>', '<h2>2</h2>']);
  assert.equal(splitForAd('<h2>only one</h2><p>x</p>'), null);
  assert.equal(splitForAd('<p>no headings</p><h3>sub</h3>'), null);
});

test('excerpt falls back to the SEO description', () => {
  const base = { slug: 's', title: 'T', body_md: 'b', cover_url: null, status: 'published' as const, published_at: null, category: null, updated_at: '2026-01-01T00:00:00Z' };
  assert.equal(fromRow({ ...base, description: null, seo_description: 'meta text' }).excerpt, 'meta text');
  assert.equal(fromRow({ ...base, description: 'own excerpt', seo_description: 'meta text' }).excerpt, 'own excerpt');
});

test('mentionsEarnings and RPM table notes', () => {
  assert.equal(mentionsEarnings('A typical RPM is high'), true);
  assert.equal(mentionsEarnings('earn $3,000 a month'), true);
  assert.equal(mentionsEarnings('How to write better titles'), false);
  const rpmTable = '<table><tr><th>Typical RPM</th></tr></table>';
  const other = '<table><tr><th>Difficulty</th></tr></table>';
  assert.match(addRpmTableNotes(rpmTable), /<\/table><p class="table-note">Estimates, not guarantees/);
  assert.equal(addRpmTableNotes(other), other);
});
