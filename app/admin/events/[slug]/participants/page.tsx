import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../admin-shell";
import { SmartDataTable } from "../../../smart-data-table";
import {
  attendeeColumns,
  buildAttendeeRows,
  findEvent,
  getEventAdminContext,
} from "../event-admin-data";

type ParticipantsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ParticipantsPage({ params }: ParticipantsPageProps) {
  const { slug } = await params;
  const event = findEvent(slug);

  if (!event) {
    notFound();
  }

  const rows = buildAttendeeRows(event);
  const { eventAttendees } = getEventAdminContext(event);
  const filters = [
    {
      key: "ticket",
      label: "Bilet",
      options: Array.from(new Set(rows.map((row) => row.ticket))),
    },
    {
      key: "status",
      label: "Status",
      options: Array.from(new Set(rows.map((row) => row.status))),
    },
    {
      key: "source",
      label: "Mənbə",
      options: Array.from(new Set(rows.map((row) => row.source))),
    },
  ];

  return (
    <AdminShell
      activeLabel="Cari tədbirlər"
      action={<BackLink slug={event.slug} />}
      description="Bu tədbir üzrə bütün iştirakçılar ayrıca smart cədvəldə idarə olunur."
      title={`${event.title} · İştirakçılar`}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Ümumi iştirakçı" value={`${eventAttendees.length}`} />
        <Metric
          label="Ödənişi təsdiqli"
          value={`${eventAttendees.filter((item) => item.status === "paid").length}`}
        />
        <Metric
          label="Gözləyən"
          value={`${eventAttendees.filter((item) => item.status === "awaiting_payment").length}`}
        />
      </section>
      <SmartDataTable
        columns={attendeeColumns}
        description="Email, telefon, bilet, maraq qrupu və status üzrə axtarış, filtr, sütun seçimi və export."
        eyebrow="CRM / Data"
        filters={filters}
        rows={rows}
        title="İştirakçılar cədvəli"
      />
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-5">
      <p className="text-sm text-[#68736c]">{label}</p>
      <strong className="mt-2 block text-2xl">{value}</strong>
    </article>
  );
}
