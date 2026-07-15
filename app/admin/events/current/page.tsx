import Image from "next/image";
import Link from "next/link";
import { AdminShell } from "../../admin-shell";
import { events } from "../../../data/demo";

function getEventStats(event: (typeof events)[number]) {
  const remaining = Math.max(event.capacity - event.sold, 0);
  const progress = Math.min(
    Math.round((event.sold / Math.max(event.capacity, 1)) * 100),
    100,
  );

  return { progress, remaining };
}

export default function CurrentEventsPage() {
  const totalSold = events.reduce((sum, event) => sum + event.sold, 0);
  const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0);
  const totalRemaining = Math.max(totalCapacity - totalSold, 0);

  return (
    <AdminShell
      activeLabel="Cari tədbirlər"
      action={
        <Link
          className="rounded-lg bg-[#34a51d] px-5 py-3 text-sm font-semibold text-white"
          href="/admin/events/create"
        >
          Yeni tədbir yarat
        </Link>
      }
      description="Aktiv tədbirləri əvvəl vizual kartlarla izlə, sonra hər tədbirin idarəetmə səhifəsinə keç."
      title="Cari tədbirlər"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-sm text-[#68736c]">Aktiv tədbir</p>
          <strong className="mt-2 block text-3xl">{events.length}</strong>
        </article>
        <article className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-sm text-[#68736c]">Satılan bilet</p>
          <strong className="mt-2 block text-3xl">{totalSold}</strong>
        </article>
        <article className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-sm text-[#68736c]">Qalan yer</p>
          <strong className="mt-2 block text-3xl">{totalRemaining}</strong>
        </article>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-3">
        {events.map((event) => {
          const { progress, remaining } = getEventStats(event);

          return (
            <article
              className="overflow-hidden rounded-lg border border-black/10 bg-white"
              key={event.slug}
            >
              <div className="relative aspect-[16/9] bg-[#101510]">
                <Image
                  alt={event.imageAlt}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  src={event.image}
                />
              </div>

              <div className="grid gap-5 p-5">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
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
                  <h2 className="text-xl font-semibold">{event.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5b665f]">
                    {event.summary}
                  </p>
                </div>

                <dl className="grid gap-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
                    <dt className="text-[#68736c]">Tarix</dt>
                    <dd className="text-right font-medium">
                      {event.date} · {event.time}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
                    <dt className="text-[#68736c]">Məkan</dt>
                    <dd className="text-right font-medium">{event.venue}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
                    <dt className="text-[#68736c]">Bilet</dt>
                    <dd className="text-right font-medium">{event.price}</dd>
                  </div>
                </dl>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-[#68736c]">Satış doluluğu</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-[#e7ece9]">
                    <span
                      className="block h-full rounded bg-[#34a51d]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded border border-black/10 p-3">
                      <span className="block text-[#68736c]">Satılıb</span>
                      <strong>{event.sold}</strong>
                    </div>
                    <div className="rounded border border-black/10 p-3">
                      <span className="block text-[#68736c]">Qalıb</span>
                      <strong>{remaining}</strong>
                    </div>
                    <div className="rounded border border-black/10 p-3">
                      <span className="block text-[#68736c]">Limit</span>
                      <strong>{event.capacity}</strong>
                    </div>
                  </div>
                </div>

                <Link
                  className="rounded-lg bg-[#101510] px-4 py-3 text-center text-sm font-semibold text-white"
                  href={`/admin/events/${event.slug}`}
                >
                  Tədbiri idarə et
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </AdminShell>
  );
}
