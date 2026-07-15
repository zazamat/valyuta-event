import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../admin-shell";
import { SmartDataTable } from "../../../smart-data-table";
import {
  buildOrderRows,
  findEvent,
  getEventAdminContext,
  orderColumns,
} from "../event-admin-data";

type OrdersPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { slug } = await params;
  const event = findEvent(slug);

  if (!event) {
    notFound();
  }

  const rows = buildOrderRows(event);
  const { eventOrders, revenue } = getEventAdminContext(event);
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
  ];

  return (
    <AdminShell
      activeLabel="Cari tədbirlər"
      action={<BackLink slug={event.slug} />}
      description="Sifarişlər, ödəniş statusları, invoice və qəbz əməliyyatları ayrıca idarə olunur."
      title={`${event.title} · Sifarişlər`}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Sifariş" value={`${eventOrders.length}`} />
        <Metric
          label="Ödənilib"
          value={`${eventOrders.filter((item) => item.status === "paid").length}`}
        />
        <Metric label="Gəlir" value={`${revenue} AZN`} />
      </section>
      <SmartDataTable
        columns={orderColumns}
        description="Alıcı, email, telefon, bilet, məbləğ və ödəniş statusları üzrə smart cədvəl."
        eyebrow="Satış"
        filters={filters}
        rows={rows}
        title="Sifarişlər cədvəli"
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
