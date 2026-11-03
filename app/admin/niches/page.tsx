import NichesManager from '@/components/admin/NichesManager';
import { PageHeader } from '@/components/admin/ui';

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function AdminNichesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader title="Niches" description="Edit RPM, competition and summaries, hide niches or add new ones." />
      <NichesManager initialStatus={one(sp.status)} initialSearch={one(sp.q)} openNew={one(sp.new) === '1'} />
    </>
  );
}
