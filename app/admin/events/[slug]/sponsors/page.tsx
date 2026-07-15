import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../admin-shell";
import { findEvent } from "../event-admin-data";
import { SponsorManager } from "./sponsor-manager";

type SponsorsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SponsorsPage({ params }: SponsorsPageProps) {
  const { slug } = await params;
  const event = findEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <AdminShell
      activeLabel="Cari tədbirlər"
      action={<BackLink slug={event.slug} />}
      description="Sponsor tier-ləri, loqolar, sayt linkləri və public kartlar ayrıca idarə olunur."
      title={`${event.title} · Sponsorlar`}
    >
      <SponsorManager initialSponsors={event.sponsors ?? []} />
    </AdminShell>
  );
}

function BackLink({ slug }: { slug: string }) {
  return (
    <Link
      className="rounded-lg border border-black/15 bg-white px-5 py-3 text-sm font-semibold"
      href={`/admin/events/${slug}`}
    >
      Tədbir panelinə qayıt
    </Link>
  );
}
