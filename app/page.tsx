import Image from "next/image";
import Link from "next/link";
import { EventCard } from "./components/event-card";
import { Header } from "./components/header";
import { events } from "./data/demo";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#151817]">
      <Header />

      <section className="relative isolate overflow-hidden bg-[#101510] text-white">
        <Image
          alt="Hybrid technology conference stage"
          className="absolute inset-0 -z-10 object-cover opacity-55"
          fill
          priority
          src="/event-hero.png"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101510] via-[#101510]/85 to-[#101510]/20" />
        <div className="mx-auto grid min-h-[620px] max-w-7xl content-center px-5 py-16">
          <div className="max-w-3xl">
            <p className="mb-5 w-fit rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/85">
              vEvent · Valyuta.az event platforması
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">
              Seminar, təlim və hibrid tədbirlər üçün bilet platforması.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
              Tədbir səhifəsi, promo kodlu checkout, QR bilet, admin
              statistikası və girişdə check-in paneli bir axında.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#101510]"
                href="/checkout"
              >
                Checkout-u yoxla
              </Link>
              <Link
                className="rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white"
                href="/admin"
              >
                Admin panelə bax
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-[#68736c]">Gələcək tədbirlər</p>
            <h2 className="mt-2 text-3xl font-semibold">Satışda olan tədbirlər</h2>
          </div>
          <Link
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold"
            href="/events"
          >
            Hamısına bax
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {events.map((event) => (
            <EventCard event={event} key={event.slug} />
          ))}
        </div>
      </section>
    </main>
  );
}
