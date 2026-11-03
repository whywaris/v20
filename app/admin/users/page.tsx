import UsersManager from '@/components/admin/UsersManager';
import { PageHeader, SetupNote } from '@/components/admin/ui';
import { getAdminUser } from '@/lib/admin';
import { listUsers } from '@/lib/admin-queries';

export default async function AdminUsersPage() {
  const [{ users, missing }, me] = await Promise.all([listUsers(), getAdminUser()]);
  const admins = users.filter((u) => u.role === 'admin').length;
  return (
    <>
      <PageHeader title="Users" description={`${users.length.toLocaleString()} signed-up user${users.length === 1 ? '' : 's'} · ${admins} admin${admins === 1 ? '' : 's'}`} />
      <SetupNote text={missing} />
      <UsersManager users={users} me={me?.id ?? ''} />
    </>
  );
}
