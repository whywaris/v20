import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BlogList from '@/components/blog/BlogList';
import BlogShell from '@/components/blog/BlogShell';
import { toCard } from '@/components/blog/PostCard';
import { categoriesOf, getPublishedPosts } from '@/lib/posts';
import { SITE_URL } from '@/lib/site';

export const revalidate = 300;

interface Props {
  params: Promise<{ category: string }>;
}

async function load(slug: string) {
  const posts = await getPublishedPosts();
  const categories = categoriesOf(posts);
  const category = categories.find((c) => c.slug === slug);
  return category ? { category, categories, posts: posts.filter((p) => p.categorySlug === slug) } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load((await params).category);
  if (!found) return { title: 'Category not found · YT Niches' };
  const { category } = found;
  return {
    title: `${category.name} Articles · YT Niches Blog`,
    description: `${category.count} article${category.count === 1 ? '' : 's'} on ${category.name.toLowerCase()} for small YouTube channels: guides, data and case studies.`,
    alternates: { canonical: `${SITE_URL}/blog/category/${category.slug}` },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const found = await load((await params).category);
  if (!found) notFound();
  const { category, categories, posts } = found;
  return (
    <BlogShell
      title={category.name}
      description={`${category.count} article${category.count === 1 ? '' : 's'} in ${category.name}.`}
      categories={categories}
      activeSlug={category.slug}
      crumbs={[
        { name: 'Blog', href: '/blog' },
        { name: category.name, href: `/blog/category/${category.slug}` },
      ]}
    >
      <BlogList posts={posts.map(toCard)} featureFirst={false} />
    </BlogShell>
  );
}
