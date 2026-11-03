'use client';

import BlogManager from '@/components/admin/BlogManager';
import { useAdminToast } from '@/components/admin/AdminToast';
import { PageHeader } from '@/components/admin/ui';

export default function AdminBlogPage() {
  const toast = useAdminToast();
  return (
    <>
      <PageHeader title="Blog" description="Write, publish and edit articles." />
      <BlogManager showToast={toast} />
    </>
  );
}
