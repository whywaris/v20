import type { Metadata } from 'next';
import AdminGate from '@/components/admin/AdminGate';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminToastProvider } from '@/components/admin/AdminToast';
import { getAdminUser } from '@/lib/admin';
import { unreadMessages } from '@/lib/admin-queries';
import { getUser } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin · YT Niches', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) return <AdminGate email={(await getUser())?.email ?? null} />;

  const unread = await unreadMessages();
  return (
    <AdminToastProvider>
      <div className="lg:flex">
        <AdminSidebar email={admin.email ?? ''} unread={unread.value} />
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </div>
    </AdminToastProvider>
  );
}
