import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../admin-shell";
import { tickets } from "../../../../data/demo";
import { findEvent } from "../event-admin-data";
import { TicketManager } from "./ticket-manager";

type TicketsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TicketsPage({ params }: TicketsPageProps) {
  const { slug } = await params;
  const event = findEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <AdminShell
      activeLabel="Cari tədbirlər"
      action={<BackLink slug={event.slug} />}
      description="Bilet növləri, qiymətlər, limitlər və satış aktivliyi burada idarə olunur."
      title={`${event.title} · Biletlər`}
    >
      <TicketManager capacity={event.capacity} initialTickets={tickets} />
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
