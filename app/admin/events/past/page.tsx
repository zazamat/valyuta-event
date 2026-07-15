import Image from "next/image";
import Link from "next/link";
import { AdminShell } from "../../admin-shell";
import { pastEvents } from "../../../data/demo";

function getRate(sold: number, capacity: number) {
  return Math.min(Math.round((sold / Math.max(capacity, 1)) * 100), 100);
}

export default function PastEventsPage() {
  const totalSold = pastEvents.reduce((sum, event) => sum + event.sold, 0);
  const totalCapacity = pastEvents.reduce((sum, event) => sum + event.capacity, 0);
  const averageRate = getRate(totalSold, totalCapacity);

  return (
    <AdminShell
      activeLabel="Bitmiş tədbirlər"
      description="Bitmiş tədbirlər arxiv rejimində saxlanılır. Burada edit yox, hesabat, nəticə və materiallara baxış var."
      title="Bitmiş tədbirlər"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Arxiv tədbir" value={`${pastEvents.length}`} />
        <Metric label="Ümumi iştirak" value={`${totalSold}`} />
        <Metric label="Orta doluluq" value={`${averageRate}%`} />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        {pastEvents.map((event) => {
          const rate = getRate(event.sold, event.capacity);

          return (
            <article className="overflow-hidden rounded-lg border border-black/10 bg-white" key={event.slug}>
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-64 bg-[#101510]">
                  <Image
                    alt={event.imageAlt}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1280px) 40vw, 100vw"
                    src={event.image}
                  />
                </div>
                <div className="grid gap-5 p-5">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded bg-[#eef3f0] px-2 py-1 text-[#4d5752]">
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
                    <p className="mt-2 text-sm leading-6 text-[#5b665f]">{event.summary}</p>
                  </div>

                  <dl className="grid gap-3 text-sm">
                    <Row label="Tarix" value={`${event.date} · ${event.time}`} />
                    <Row label="Məkan" value={event.venue} />
                    <Row label="İştirak" value={`${event.sold}/${event.capacity}`} />
                  </dl>

                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-[#68736c]">Doluluq</span>
                      <strong>{rate}%</strong>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-[#e7ece9]">
                      <span className="block h-full rounded bg-[#6d766f]" style={{ width: `${rate}%` }} />
                    </div>
                  </div>

                  <Link
                    className="rounded-lg bg-[#101510] px-4 py-3 text-center text-sm font-semibold text-white"
                    href={`/admin/events/past/${event.slug}`}
                  >
                    Arxivə bax
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </AdminShell>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
      <dt className="text-[#68736c]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
