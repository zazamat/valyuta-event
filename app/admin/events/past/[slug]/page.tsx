import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../admin-shell";
import { pastEvents } from "../../../../data/demo";

type PastEventPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getRate(sold: number, capacity: number) {
  return Math.min(Math.round((sold / Math.max(capacity, 1)) * 100), 100);
}

export default async function PastEventPage({ params }: PastEventPageProps) {
  const { slug } = await params;
  const event = pastEvents.find((item) => item.slug === slug);

  if (!event) {
    notFound();
  }

  const rate = getRate(event.sold, event.capacity);
  const noShow = Math.max(event.capacity - event.sold, 0);
  const archiveModules = [
    {
      title: "İştirak hesabatı",
      text: "Qeydiyyat, check-in, iştirakçı segmentləri və yekun siyahı.",
      stat: `${event.sold} iştirak`,
    },
    {
      title: "Satış nəticələri",
      text: "Bilet satışı, doluluq faizi, ödəniş və invoice arxivi.",
      stat: `${rate}% doluluq`,
    },
    {
      title: "Media arxivi",
      text: "Foto, video, replay və press materiallarının saxlandığı bölmə.",
      stat: event.price,
    },
    {
      title: "CRM təsiri",
      text: "Tədbirdən sonra yaranan maraq qrupları, lead-lər və follow-up seqmentləri.",
      stat: event.category,
    },
  ];

  return (
    <AdminShell
      activeLabel="Bitmiş tədbirlər"
      action={
        <Link
          className="rounded-lg border border-black/15 bg-white px-5 py-3 text-sm font-semibold"
          href="/admin/events/past"
        >
          Arxiv siyahısına qayıt
        </Link>
      }
      description="Bu səhifə read-only arxivdir. Bitmiş tədbirdə edit edilmir, yalnız nəticə, hesabat və materiallara baxılır."
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
            <h2 className="text-2xl font-semibold">{event.title}</h2>
            <p className="mt-3 leading-7 text-[#56615b]">{event.summary}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info label="Tarix" value={`${event.date} · ${event.time}`} />
              <Info label="Məkan" value={event.venue} />
              <Info label="Format" value={event.format} />
              <Info label="Arxiv statusu" value={event.status} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <Metric label="İştirak" value={`${event.sold}`} />
        <Metric label="Limit" value={`${event.capacity}`} />
        <Metric label="Doluluq" value={`${rate}%`} />
        <Metric label="Qeydiyyatdan keçib gəlməyən" value={`${noShow}`} />
      </section>

      <section className="mt-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Arxiv bölmələri</h2>
          <p className="mt-1 text-sm text-[#68736c]">
            Bu kartlar hesabat və materiallara baxış üçündür, redaktə əməliyyatı yoxdur.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {archiveModules.map((module) => (
            <article className="rounded-lg border border-black/10 bg-white p-5" key={module.title}>
              <span className="rounded bg-[#eef3f0] px-2 py-1 text-xs font-semibold text-[#4d5752]">
                {module.stat}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{module.title}</h3>
              <p className="mt-2 min-h-20 text-sm leading-6 text-[#56615b]">{module.text}</p>
              <button className="mt-4 rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" type="button">
                Baxış
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-black/10 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold">Yekun qeydlər</h2>
            <p className="mt-1 text-sm text-[#68736c]">
              Arxivləşdirilmiş tədbirlərdə kontent kilidlidir. Dəyişiklik lazım olsa, tədbir kopyalanıb yeni tədbir kimi yaradılmalıdır.
            </p>
          </div>
          <button className="rounded-lg bg-[#101510] px-4 py-3 text-sm font-semibold text-white" type="button">
            Hesabatı export et
          </button>
        </div>
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
