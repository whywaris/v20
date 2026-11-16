import InboxManager from '@/components/admin/InboxManager';
import { PageHeader, SetupNote } from '@/components/admin/ui';
import { latest, type Message } from '@/lib/admin-queries';

export default async function AdminInboxPage() {
  const messages = await latest<Message>('messages', 200);
  return (
    <>
      <PageHeader title="Inbox" description="Messages from the contact form." />
      <SetupNote text={messages.missing} />
      <InboxManager messages={messages.rows} />
    </>
  );
}
