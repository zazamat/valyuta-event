import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AdminShell } from "../../admin-shell";
import { tickets } from "../../../data/demo";
import { AdminActionButton } from "./event-admin-actions";
import { findEvent, getEventAdminContext } from "./event-admin-data";

type EventAdminPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EventAdminPage({ params }: EventAdminPageProps) {
  const { slug } = await params;
  const event = findEvent(slug);

  if (!event) {
    notFound();
  }

  const {
    checkedIn,
    eventAttendees,
    eventOrders,
    eventPromoCodes,
    eventTickets,
    progress,
    remaining,
    revenue,
  } = getEventAdminContext(event);

  const modules = [
    {
      title: "Biletlər",
      description: "Bilet növləri, qiymətlər, limitlər və satış statusları.",
      href: `/admin/events/${event.slug}/tickets`,
      stat: `${tickets.length} növ`,
    },
    {
      title: "İştirakçılar",
      description: "CRM məlumatları, maraqlar, email və telefonlar.",
      href: `/admin/events/${event.slug}/participants`,
      stat: `${eventAttendees.length} nəfər`,
    },
    {
      title: "Sifarişlər",
      description: "Ödəniş statusları, invoice, qəbz və alıcı məlumatları.",
      href: `/admin/events/${event.slug}/orders`,
      stat: `${eventOrders.length} sifariş`,
    },
    {
      title: "Spikerlər",
      description: "Bio, mövzu, vəzifə, şəkil və public görünüş.",
      href: `/admin/events/${event.slug}/speakers`,
      stat: `${event.speakers?.length ?? 0} spiker`,
    },
    {
      title: "Sponsorlar",
      description: "Sponsor tier-ləri, loqolar, linklər və kartlar.",
      href: `/admin/events/${event.slug}/sponsors`,
      stat: `${event.sponsors?.length ?? 0} sponsor`,
    },
    {
      title: "Media",
      description: "Foto qalereya, YouTube/Vimeo embed və press linklər.",
      href: `/admin/events/${event.slug}/media`,
      stat: `${event.media?.photos?.length ?? 0} foto`,
    },
    {
      title: "Promo / marketing",
      description: "Promo kod, maraq qrupu, seqment və kampaniya qaydaları.",
      href: `/admin/events/${event.slug}/promo`,
      stat: `${eventPromoCodes.length} kod`,
    },
    {
      title: "Check-in",
      description: "QR skan, nəzarətçi paneli və giriş statistikası.",
      href: "/admin/check-in",
      stat: `${checkedIn}/${eventTickets.length}`,
    },
    {
      title: "Ayarlar",
      description: "Qaydalar, təşkilatçı, qeydiyyat sualları və SEO.",
      href: `/admin/events/${event.slug}/settings`,
      stat: "Sistem",
    },
  ];

  return (
    <AdminShell
      activeLabel="Cari tədbirlər"
      action={
        <div className="flex flex-wrap gap-2">
          <AdminActionButton
            label="Dəyişiklikləri yayımla"
            message="Demo: dəyişikliklər publish növbəsinə əlavə edildi."
            tone="green"
          />
          <Link
            className="rounded-lg border border-black/15 bg-white px-5 py-3 text-sm font-semibold"
            href="/admin/events/current"
          >
            Siyahıya qayıt
          </Link>
        </div>
      }
      description="Bu səhifə tədbirin kontrol mərkəzidir. Böyük siyahılar ayrıca alt səhifələrdə idarə olunur."
      title={event.title}
    >
      <section className="overflow-hidden rounded-lg border border-black/10 bg-white">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[300px] bg-[#101510]">
            <Image
              alt={event.imageAlt}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={event.image}
            />
          </div>
          <div className="p-6">
            <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded bg-[#eefaf5] px-2 py-1 text-[#207b18]">
                {event.status}
              </span>
              <span className="rounded bg-[#f0f3f1] px-2 py-1 text-[#4c5751]">
                {event.format}
              </span>
              <span className="rounded bg-[#f0f3f1] px-2 py-1 text-[#4c5751]">
                {event.category}
              </span>
            </div>
            <h2 className="text-2xl font-semibold">{event.title}</h2>
            <p className="mt-3 leading-7 text-[#56615b]">
              {event.description ?? event.summary}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info label="Tarix" value={`${event.date} · ${event.time}`} />
              <Info label="Məkan" value={event.venue} />
              <Info label="Satış" value={`${event.sold}/${event.capacity} bilet`} />
              <Info label="Qalan yer" value={`${remaining}`} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-5">
        <Metric label="Satılıb" value={`${event.sold}`} />
        <Metric label="Qalıb" value={`${remaining}`} />
        <Metric label="Doluluq" value={`${progress}%`} />
        <Metric label="Gəlir" value={`${revenue} AZN`} />
        <Metric label="Check-in" value={`${checkedIn}/${eventTickets.length}`} />
      </section>

      <section className="mt-6 rounded-lg border border-black/10 bg-white p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <h2 className="text-xl font-semibold">Əsas məlumatlar</h2>
            <p className="mt-1 text-sm text-[#68736c]">
              Public tədbir səhifəsində görünən başlıq, tarix, məkan və təsvir.
            </p>
          </div>
          <AdminActionButton
            label="Əsas məlumatları redaktə et"
            message="Demo: əsas məlumatların redaktə paneli açılacaq."
            tone="dark"
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Info label="Tədbir adı" value={event.title} />
          <Info label="Status" value={event.status} />
          <Info label="Format" value={event.format} />
          <Info label="Qiymət" value={event.price} />
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">İdarəetmə bölmələri</h2>
          <p className="mt-1 text-sm text-[#68736c]">
            Siyahılar və ağır əməliyyatlar ayrıca səhifədə açılır.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {modules.map((module) => (
            <Link
              className="rounded-lg border border-black/10 bg-white p-5 transition hover:border-[#34a51d] hover:shadow-sm"
              href={module.href}
              key={module.title}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold">{module.title}</h3>
                <span className="rounded bg-[#eefaf5] px-2 py-1 text-xs font-semibold text-[#207b18]">
                  {module.stat}
                </span>
              </div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-[#56615b]">
                {module.description}
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-[#207b18]">
                Aç və idarə et
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <PreviewCard
          actionHref={`/admin/events/${event.slug}/orders`}
          actionText="Bütün sifarişlər"
          items={eventOrders.slice(0, 4).map((order) => `${order.id} · ${order.attendee} · ${order.status}`)}
          title="Son sifarişlər"
        />
        <PreviewCard
          actionHref={`/admin/events/${event.slug}/participants`}
          actionText="Bütün iştirakçılar"
          items={eventAttendees.slice(0, 4).map((attendee) => `${attendee.name} · ${attendee.ticket} · ${attendee.status}`)}
          title="Son iştirakçılar"
        />
      </section>
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 p-4">
      <p className="text-sm text-[#68736c]">{label}</p>
      <strong className="mt-1 block">{value}</strong>
    </div>
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

function PreviewCard({
  actionHref,
  actionText,
  items,
  title,
}: {
  actionHref: string;
  actionText: string;
  items: string[];
  title: string;
}) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link className="text-sm font-semibold text-[#207b18]" href={actionHref}>
          {actionText}
        </Link>
      </div>
      <div className="grid gap-2">
        {items.length ? (
          items.map((item) => (
            <p className="rounded border border-black/10 px-3 py-2 text-sm" key={item}>
              {item}
            </p>
          ))
        ) : (
          <p className="rounded border border-dashed border-black/15 px-3 py-2 text-sm text-[#68736c]">
            Məlumat yoxdur.
          </p>
        )}
      </div>
    </article>
  );
}
