import { unstable_cache } from 'next/cache';
import { categoriesOf, getPublishedPosts } from '@/lib/posts';

export const POSTS_TAG = 'posts';

/** Blog categories for the navbar. Cached for 5 minutes; saving a post in /admin refreshes it at once. */
export const getNavCategories = unstable_cache(
  async () => categoriesOf(await getPublishedPosts()).map(({ name, slug }) => ({ name, slug })),
  ['nav-categories'],
  { tags: [POSTS_TAG], revalidate: 300 }
);
