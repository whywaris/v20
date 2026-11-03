import InboxManager from '@/components/admin/InboxManager';
import { PageHeader, SetupNote } from '@/components/admin/ui';
import { latest, type Message, type Submission } from '@/lib/admin-queries';

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminInboxPage({ searchParams }: { searchParams: SP }) {
  const tab = (await searchParams).tab === 'submissions' ? 'submissions' : 'messages';
  const [messages, submissions] = await Promise.all([latest<Message>('messages', 200), latest<Submission>('submissions', 200)]);
  return (
    <>
      <PageHeader title="Inbox" description="Contact form messages and channel suggestions from visitors." />
      <SetupNote text={messages.missing || submissions.missing} />
      <InboxManager messages={messages.rows} submissions={submissions.rows} initialTab={tab} />
    </>
  );
}
