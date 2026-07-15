import Image from "next/image";
import Link from "next/link";
import { EventCard } from "../components/event-card";
import { Header } from "../components/header";
import { events, pastEvents } from "../data/demo";

const filters = ["Hamısı", "Fiziki", "Onlayn", "Hibrid", "Fintech", "AI"];
const featuredEvent = events[0];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#151817]">
      <Header />
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-[#68736c]">Tədbirlər</p>
            <h1 className="mt-2 text-4xl font-semibold">
              Gələcək və keçmiş tədbirlər
            </h1>
            <p className="mt-3 max-w-2xl text-[#5b665f]">
              vEvent-də satışda olan seminar, təlim və hibrid tədbirlər. Keçmiş
              tədbirlər arxivi media, replay və sponsor görünürlüğü üçün saxlanılır.
            </p>
          </div>
          <Link
            className="rounded-lg bg-[#34a51d] px-5 py-3 text-sm font-semibold text-white"
            href="/checkout"
          >
            Test checkout
          </Link>
        </div>

        <section className="mb-8 overflow-hidden rounded-lg border border-black/10 bg-white">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[340px] bg-[#101510]">
              <Image
                alt={featuredEvent.imageAlt}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={featuredEvent.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
                <span className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-[#106142]">
                  {featuredEvent.status}
                </span>
                <span className="rounded-lg bg-[#101510]/75 px-3 py-1 text-xs font-semibold text-white">
                  {featuredEvent.format}
                </span>
              </div>
            </div>
            <div className="p-6 lg:p-8">
              <p className="text-sm font-medium text-[#68736c]">Seçilmiş tədbir</p>
              <h2 className="mt-3 text-3xl font-semibold">{featuredEvent.title}</h2>
              <p className="mt-4 text-[#5b665f]">{featuredEvent.summary}</p>
              <dl className="mt-6 grid gap-3 text-sm text-[#4d5752] sm:grid-cols-2">
                <div className="rounded-lg bg-[#f5f7f6] p-4">
                  <dt>Tarix</dt>
                  <dd className="mt-1 font-semibold text-[#151817]">
                    {featuredEvent.date}
                  </dd>
                </div>
                <div className="rounded-lg bg-[#f5f7f6] p-4">
                  <dt>Məkan</dt>
                  <dd className="mt-1 font-semibold text-[#151817]">
                    {featuredEvent.venue}
                  </dd>
                </div>
              </dl>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  className="rounded-lg bg-[#101510] px-5 py-3 text-sm font-semibold text-white"
                  href={`/events/${featuredEvent.slug}`}
                >
                  Ətraflı bax
                </Link>
                <Link
                  className="rounded-lg border border-black/10 bg-white px-5 py-3 text-sm font-semibold"
                  href="/checkout"
                >
                  Bilet al
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-7 flex flex-wrap gap-2 text-sm">
          {filters.map((item) => (
            <button
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[#39413d]"
              key={item}
            >
              {item}
            </button>
          ))}
        </div>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#68736c]">Satış aktivdir</p>
              <h2 className="mt-1 text-2xl font-semibold">Gələcək tədbirlər</h2>
            </div>
            <span className="text-sm text-[#68736c]">{events.length} tədbir</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {events.map((event) => (
              <EventCard event={event} key={event.slug} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#68736c]">Arxiv</p>
              <h2 className="mt-1 text-2xl font-semibold">Keçmiş tədbirlər</h2>
            </div>
            <span className="text-sm text-[#68736c]">
              Replay və media arxivi
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {pastEvents.map((event) => (
              <EventCard compact event={event} key={event.slug} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
