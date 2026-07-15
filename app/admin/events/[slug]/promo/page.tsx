import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../admin-shell";
import { findEvent, getEventAdminContext } from "../event-admin-data";
import { PromoManager } from "./promo-manager";

type PromoPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PromoPage({ params }: PromoPageProps) {
  const { slug } = await params;
  const event = findEvent(slug);

  if (!event) {
    notFound();
  }

  const { eventPromoCodes } = getEventAdminContext(event);

  return (
    <AdminShell
      activeLabel="Cari tədbirlər"
      action={<BackLink slug={event.slug} />}
      description="Promo kodlar tədbir, bilet növü, maraq qrupu və seqment üzrə idarə olunur."
      title={`${event.title} · Promo / marketing`}
    >
      <PromoManager initialPromos={eventPromoCodes} />
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
