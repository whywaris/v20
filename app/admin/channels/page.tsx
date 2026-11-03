import ChannelsManager from '@/components/admin/ChannelsManager';
import { PageHeader } from '@/components/admin/ui';

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

// ?status=edited|hidden|new filters; ?new=1&url=… opens "Add channel" (used when approving a submission).
export default async function AdminChannelsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const url = one(sp.url);
  const handle = url.match(/youtube\.com\/(@[\w.-]+)/i)?.[1] ?? '';
  return (
    <>
      <PageHeader title="Channels" description="Edit, hide or add channels. Changes go live on the site within seconds." />
      <ChannelsManager initialStatus={one(sp.status)} initialSearch={one(sp.q)} openNew={one(sp.new) === '1'} prefill={url ? { youtubeUrl: url, handle } : undefined} />
    </>
  );
}
