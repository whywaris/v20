import { Marked } from 'marked';

// Renders an article's Markdown and collects its h2/h3 headings for the table of contents.
// Markdown is written by admins only, so raw HTML in it is trusted.

export type TocItem = { id: string; text: string; level: 2 | 3 };

const headingId = (text: string) =>
  text.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'section';

export function renderArticle(markdown: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const md = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const base = headingId(text);
        const n = used.get(base) ?? 0;
        used.set(base, n + 1);
        const id = n ? `${base}-${n + 1}` : base;
        if (depth === 2 || depth === 3) toc.push({ id, text: text.replace(/<[^>]+>/g, ''), level: depth });
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      // External links open in a new tab.
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?ytniches\.com/i.test(href);
        return `<a href="${href}"${title ? ` title="${title}"` : ''}${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
      },
      image({ href, title, text }) {
        return `<img src="${href}" alt="${text}"${title ? ` title="${title}"` : ''} loading="lazy" />`;
      },
    },
  });
  const html = md.parse(markdown) as string;
  return { html, toc };
}

/**
 * Where the in-article ad goes: after the second H2 section (before the third H2), or before the second H2
 * when there are only two. Returns null for short articles with fewer than two H2s (no mid-article ad).
 */
export function splitForAd(html: string): [string, string] | null {
  const starts = [...html.matchAll(/<h2[\s>]/g)].map((m) => m.index!);
  const at = starts[2] ?? starts[1];
  return at === undefined ? null : [html.slice(0, at), html.slice(at)];
}
