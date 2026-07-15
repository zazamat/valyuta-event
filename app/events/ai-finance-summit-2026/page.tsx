import Image from "next/image";
import Link from "next/link";
import { CountdownTimer } from "../../components/countdown-timer";
import { Header } from "../../components/header";
import { events, tickets } from "../../data/demo";

const event = events[0];

export default function EventDetailPage() {
  const remainingTickets = Math.max(event.capacity - event.sold, 0);
  const salesProgress = Math.min(Math.round((event.sold / event.capacity) * 100), 100);

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#151817]">
      <Header />
      <section className="relative isolate overflow-hidden bg-[#101510] text-white">
        <Image
          alt="AI and finance event hall"
          className="absolute inset-0 -z-10 object-cover opacity-45"
          fill
          priority
          src={event.image}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101510] via-[#101510]/90 to-[#101510]/30" />
        <div className="mx-auto max-w-7xl px-5 py-16">
          <p className="w-fit rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/80">
            {event.format} · {event.category}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
            {event.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
            {event.summary}
          </p>
          <div className="mt-8 grid max-w-4xl gap-3 text-sm text-white/82 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-white/15 bg-white/8 p-4">
              <span className="block text-white/55">Tarix</span>
              <strong className="mt-1 block">{event.date}</strong>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/8 p-4">
              <span className="block text-white/55">Saat</span>
              <strong className="mt-1 block">{event.time}</strong>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/8 p-4">
              <span className="block text-white/55">Məkan</span>
              <strong className="mt-1 block">{event.venue}</strong>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/8 p-4">
              <span className="block text-white/55">Qalan bilet</span>
              <strong className="mt-1 block">{remainingTickets} yer</strong>
            </div>
          </div>
          <div className="mt-5 max-w-2xl">
            <p className="mb-3 text-sm font-medium text-white/65">Tədbirə geri sayım</p>
            <CountdownTimer target={event.startsAt} />
          </div>
          <Link
            className="mt-8 inline-flex rounded-lg bg-[#34a51d] px-5 py-3 text-sm font-semibold text-white"
            href="/checkout"
          >
            Bilet al
          </Link>
        </div>
      </section>

      <nav className="sticky top-[65px] z-10 border-b border-black/10 bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-5 py-3 text-sm font-medium text-[#4d5752]">
          {[
            ["Haqqında", "about"],
            ["Proqram", "agenda"],
            ["Spikerlər", "speakers"],
            ["Media", "media"],
            ["FAQ", "faq"],
            ["Sponsorlar", "sponsors"],
          ].map(([label, id]) => (
              <a className="whitespace-nowrap hover:text-[#258016]" href={`#${id}`} key={id}>
                {label}
              </a>
            ))}
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg border border-black/10 bg-[#101510]">
            <Image
              alt={event.imageAlt}
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              src={event.image}
            />
          </div>
          <p id="about" className="text-sm font-medium text-[#68736c]">Tədbir haqqında</p>
          <h2 className="mt-2 text-3xl font-semibold">Nə üçün qatılmalı?</h2>
          <p className="mt-4 max-w-3xl text-[#5b665f]">{event.description}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <section className="rounded-lg border border-black/10 bg-white p-5">
              <h3 className="text-lg font-semibold">Kimlər üçündür?</h3>
              <ul className="mt-4 grid gap-2 text-sm text-[#5b665f]">
                {event.audience.map((item) => (
                  <li className="rounded-lg bg-[#f5f7f6] px-3 py-2" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-black/10 bg-white p-5">
              <h3 className="text-lg font-semibold">Nə əldə edəcəksən?</h3>
              <ul className="mt-4 grid gap-2 text-sm text-[#5b665f]">
                {event.takeaways.map((item) => (
                  <li className="rounded-lg bg-[#f5f7f6] px-3 py-2" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <p id="agenda" className="mt-12 text-sm font-medium text-[#68736c]">Proqram</p>
          <h2 className="mt-2 text-3xl font-semibold">Günün axını</h2>
          <div className="mt-6 grid gap-3">
            {event.agenda.map((session) => (
              <div
                className="grid gap-2 rounded-lg border border-black/10 bg-white p-4 md:grid-cols-[70px_1fr]"
                key={session.time}
              >
                <strong>{session.time}</strong>
                <div>
                  <span className="font-medium">{session.title}</span>
                  <p className="mt-1 text-sm text-[#68736c]">{session.description}</p>
                </div>
              </div>
            ))}
          </div>

          <section id="speakers" className="mt-12">
            <p className="text-sm font-medium text-[#68736c]">Spikerlər</p>
            <h2 className="mt-2 text-3xl font-semibold">Səhnədə kimlər olacaq?</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {event.speakers.map((speaker) => (
                <article
                  className="rounded-lg border border-black/10 bg-white p-5"
                  key={speaker.name}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-[#e9f8ee] bg-[#101510]">
                    <Image
                      alt={speaker.name}
                      className="object-cover"
                      fill
                      sizes="96px"
                      src={speaker.photo}
                    />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{speaker.name}</h3>
                      <p className="mt-1 text-sm text-[#68736c]">
                        {speaker.role} · {speaker.company}
                      </p>
                      <p className="mt-3 rounded-lg bg-[#f5f7f6] px-3 py-2 text-sm font-medium">
                        {speaker.topic}
                      </p>
                    </div>
                  </div>
                  <div className="hidden">
                    <h3 className="text-xl font-semibold">{speaker.name}</h3>
                    <p className="mt-1 text-sm text-[#68736c]">
                      {speaker.role} · {speaker.company}
                    </p>
                    <p className="mt-3 text-sm font-medium">{speaker.topic}</p>
                    <p className="mt-2 text-sm text-[#5b665f]">{speaker.bio}</p>
                    <p className="mt-3 text-xs text-[#258016]">{speaker.linkedin}</p>
                  </div>
                  <p className="mt-4 text-sm text-[#5b665f]">{speaker.bio}</p>
                  <p className="mt-3 text-xs text-[#258016]">{speaker.linkedin}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="media" className="mt-12">
            <p className="text-sm font-medium text-[#68736c]">Foto və video</p>
            <h2 className="mt-2 text-3xl font-semibold">Media materialları</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {event.media.photos.map((photo) => (
                <article
                  className="overflow-hidden rounded-lg border border-black/10 bg-white"
                  key={photo.title}
                >
                  <div className="relative aspect-video bg-[#101510]">
                    <Image
                      alt={photo.title}
                      className="object-cover"
                      fill
                      sizes="(min-width: 768px) 35vw, 100vw"
                      src={photo.url}
                    />
                  </div>
                  <p className="p-4 text-sm font-medium">{photo.title}</p>
                </article>
              ))}
            </div>
            <div className="mt-4 grid gap-4">
              {event.media.videos.map((video) => (
                <article
                  className="overflow-hidden rounded-lg border border-black/10 bg-white"
                  key={video.title}
                >
                  <div className="aspect-video bg-[#101510]">
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full"
                      loading="lazy"
                      src={video.embedUrl}
                      title={video.title}
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium">{video.title}</p>
                    <p className="text-sm text-[#68736c]">{video.provider}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="faq" className="mt-12">
            <p className="text-sm font-medium text-[#68736c]">FAQ</p>
            <h2 className="mt-2 text-3xl font-semibold">Tez-tez verilən suallar</h2>
            <div className="mt-6 grid gap-3">
              {event.faq.map((item) => (
                <article className="rounded-lg border border-black/10 bg-white p-4" key={item.question}>
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="mt-2 text-sm text-[#5b665f]">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
        <aside className="h-fit rounded-lg border border-black/10 bg-white p-5 lg:sticky lg:top-28">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#68736c]">Bilet satışı</p>
              <h2 className="text-xl font-semibold">Bilet növləri</h2>
            </div>
            <span className="rounded-lg bg-[#e9f8ee] px-2 py-1 text-xs font-semibold text-[#106142]">
              Aktiv
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {tickets.map((ticket) => (
              <div className="rounded-lg bg-[#f5f7f6] p-4" key={ticket.name}>
                <div className="flex justify-between gap-4">
                  <strong>{ticket.name}</strong>
                  <span>{ticket.price} AZN</span>
                </div>
                <p className="mt-2 text-sm text-[#5b665f]">{ticket.description}</p>
                <p className="mt-3 text-xs font-semibold text-[#258016]">
                  {ticket.available} bilet qalıb
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-[#dbe8df] bg-[#f7fbf8] p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-[#68736c]">Ümumi qalıq</p>
                <strong className="mt-1 block text-2xl">{remainingTickets}</strong>
              </div>
              <p className="text-right text-sm text-[#68736c]">
                {event.sold}/{event.capacity} satılıb
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dce7e0]">
              <div
                className="h-full rounded-full bg-[#34a51d]"
                style={{ width: `${salesProgress}%` }}
              />
            </div>
          </div>
          <Link
            className="mt-5 flex justify-center rounded-lg bg-[#34a51d] px-5 py-3 text-sm font-semibold text-white"
            href="/checkout"
          >
            Bilet al
          </Link>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold">
              Paylaş
            </button>
            <button className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold">
              Yadda saxla
            </button>
          </div>

          <div className="mt-6 border-t border-black/10 pt-5">
            <h2 className="text-xl font-semibold">Təşkilatçı</h2>
            <p className="mt-3 font-medium">{event.organizer.name}</p>
            <p className="mt-2 text-sm text-[#5b665f]">{event.organizer.description}</p>
            <dl className="mt-3 grid gap-2 text-sm text-[#68736c]">
              <div className="flex justify-between gap-4">
                <dt>Email</dt>
                <dd className="text-right">{event.organizer.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Telefon</dt>
                <dd>{event.organizer.phone}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 border-t border-black/10 pt-5">
            <h2 className="text-xl font-semibold">Məkan və giriş</h2>
            <dl className="mt-3 grid gap-2 text-sm text-[#5b665f]">
              <div className="flex justify-between gap-4">
                <dt>Ünvan</dt>
                <dd className="text-right">{event.venueDetails.address}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Zal</dt>
                <dd>{event.venueDetails.room}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-[#68736c]">
              {event.venueDetails.onlineAccess}
            </p>
          </div>

          <div id="sponsors" className="mt-6 border-t border-black/10 pt-5">
            <h2 className="text-xl font-semibold">Sponsorlar</h2>
            <div className="mt-4 grid gap-3">
              {event.sponsors.map((sponsor) => (
                <article className="rounded-lg bg-[#f5f7f6] p-4" key={sponsor.name}>
                  <div className="relative mb-3 h-10 w-32">
                    <Image
                      alt={sponsor.name}
                      className="object-contain object-left"
                      fill
                      sizes="128px"
                      src={sponsor.logo}
                    />
                  </div>
                  <p className="text-xs font-semibold text-[#258016]">
                    {sponsor.tier}
                  </p>
                  <h3 className="mt-1 font-semibold">{sponsor.name}</h3>
                  <p className="mt-2 text-sm text-[#5b665f]">
                    {sponsor.description}
                  </p>
                  <p className="mt-2 text-xs text-[#68736c]">{sponsor.website}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-black/10 pt-5">
            <h2 className="text-xl font-semibold">Qeydiyyat məlumatları</h2>
            <ul className="mt-3 grid gap-2 text-sm text-[#5b665f]">
              {event.registrationQuestions.map((question) => (
                <li className="rounded-lg bg-[#f5f7f6] px-3 py-2" key={question}>
                  {question}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-black/10 pt-5">
            <h2 className="text-xl font-semibold">Qaydalar</h2>
            <ul className="mt-3 grid gap-2 text-sm text-[#5b665f]">
              {event.policies.map((policy) => (
                <li key={policy}>{policy}</li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
