import Link from "next/link";
import Image from "next/image";

type EventCardProps = {
  event: {
    slug: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    format: string;
    status: string;
    sold: number;
    capacity: number;
    price: string;
    image: string;
    imageAlt: string;
    summary?: string;
  };
  compact?: boolean;
};

export function EventCard({ compact = false, event }: EventCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
      <div className="relative aspect-[16/9] bg-[#101510]">
        <Image
          alt={event.imageAlt}
          className="object-cover"
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          src={event.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
          <span className="rounded-lg bg-white/92 px-3 py-1 text-xs font-medium text-[#106142]">
            {event.status}
          </span>
          <span className="rounded-lg bg-[#101510]/72 px-3 py-1 text-xs font-semibold text-white">
            {event.price}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold">{event.title}</h3>
        {event.summary && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5b665f]">
            {event.summary}
          </p>
        )}
        <dl className="mt-4 space-y-2 text-sm text-[#4d5752]">
          <div className="flex justify-between gap-4">
            <dt>Tarix</dt>
            <dd className="font-medium text-[#151817]">{event.date}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Saat</dt>
            <dd>{event.time}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Format</dt>
            <dd>{event.format}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Məkan</dt>
            <dd className="text-right">{event.venue}</dd>
          </div>
        </dl>
        {!compact && (
          <div className="mt-5 h-2 overflow-hidden rounded-lg bg-[#e8ece9]">
            <div
              className="h-full rounded-lg bg-[#34a51d]"
              style={{ width: `${(event.sold / event.capacity) * 100}%` }}
            />
          </div>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-[#68736c]">
            {compact
              ? `${event.sold} iştirakçı`
              : `${event.sold}/${event.capacity} yer satılıb`}
          </p>
          <Link
            className="text-sm font-semibold text-[#258016]"
            href={`/events/${event.slug}`}
          >
            Ətraflı
          </Link>
        </div>
      </div>
    </article>
  );
}
