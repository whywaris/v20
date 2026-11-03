import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { createAdminClient } from '@/lib/supabase/admin';

// POST multipart { file }: stores a blog image in the public `blog-images` bucket and returns its URL.
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const file = (await request.formData().catch(() => null))?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file received.' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Use a JPG, PNG, WebP or GIF image.' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Image must be 5 MB or smaller.' }, { status: 400 });

  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'image';
  const path = `${new Date().toISOString().slice(0, 7)}/${base}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const storage = createAdminClient().storage.from('blog-images');
  const { error } = await storage.upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) {
    const msg = /bucket/i.test(error.message) ? 'Run supabase/migrations/0007_blog.sql in Supabase first (image bucket is missing).' : error.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  return NextResponse.json({ url: storage.getPublicUrl(path).data.publicUrl });
}
