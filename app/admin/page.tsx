import Link from "next/link";
import { AdminShell } from "./admin-shell";
import { SmartDataTable } from "./smart-data-table";
import { adminStats, attendees, buyerTickets, orders } from "../data/demo";

const attendeeColumns = [
  { key: "id", label: "ID", width: "120px" },
  { key: "name", label: "İştirakçı", width: "190px" },
  { key: "email", label: "Email", width: "220px" },
  { key: "phone", label: "Telefon", width: "170px" },
  { key: "event", label: "Tədbir", width: "240px" },
  { key: "ticket", label: "Bilet", width: "130px" },
  { key: "status", label: "Status", width: "140px", badge: true },
  { key: "interests", label: "Maraqlar", width: "180px" },
  { key: "source", label: "Mənbə", width: "150px" },
];

const orderColumns = [
  { key: "id", label: "Sifariş ID", width: "130px" },
  { key: "attendee", label: "Alıcı", width: "190px" },
  { key: "email", label: "Email", width: "220px" },
  { key: "phone", label: "Telefon", width: "170px" },
  { key: "event", label: "Tədbir", width: "240px" },
  { key: "ticket", label: "Bilet", width: "130px" },
  { key: "amount", label: "Məbləğ", width: "120px" },
  { key: "status", label: "Ödəniş statusu", width: "160px", badge: true },
];

const buyerPortalColumns = [
  { key: "ticketCode", label: "Bilet kodu", width: "160px" },
  { key: "buyer", label: "Alıcı", width: "190px" },
  { key: "email", label: "Email", width: "220px" },
  { key: "phone", label: "Telefon", width: "170px" },
  { key: "event", label: "Tədbir", width: "240px" },
  { key: "ticket", label: "Bilet", width: "130px" },
  { key: "status", label: "Status", width: "150px", badge: true },
  { key: "accessType", label: "Giriş tipi", width: "150px" },
  { key: "transferStatus", label: "Transfer", width: "170px" },
  { key: "lastSent", label: "Son göndərilmə", width: "180px" },
  { key: "portal", label: "Kabinet linki", width: "220px" },
];

const attendeeRows = attendees.map((attendee) => ({ ...attendee }));

const orderRows = orders.map((order) => {
  const matchedAttendee = attendees.find(
    (attendee) => attendee.phone === order.phone || attendee.name === order.attendee,
  );

  return {
    ...order,
    email: matchedAttendee?.email ?? "email qeyd olunmayıb",
  };
});

const buyerPortalRows = buyerTickets.map((ticket) => ({
  ...ticket,
  portal: `/tickets/${ticket.token}`,
}));

const attendeeFilters = [
  {
    key: "event",
    label: "Tədbir",
    options: Array.from(new Set(attendeeRows.map((row) => row.event))),
  },
  {
    key: "ticket",
    label: "Bilet",
    options: Array.from(new Set(attendeeRows.map((row) => row.ticket))),
  },
  {
    key: "status",
    label: "Status",
    options: Array.from(new Set(attendeeRows.map((row) => row.status))),
  },
  {
    key: "source",
    label: "Mənbə",
    options: Array.from(new Set(attendeeRows.map((row) => row.source))),
  },
];

const orderFilters = [
  {
    key: "event",
    label: "Tədbir",
    options: Array.from(new Set(orderRows.map((row) => row.event))),
  },
  {
    key: "ticket",
    label: "Bilet",
    options: Array.from(new Set(orderRows.map((row) => row.ticket))),
  },
  {
    key: "status",
    label: "Status",
    options: Array.from(new Set(orderRows.map((row) => row.status))),
  },
];

const buyerPortalFilters = [
  {
    key: "event",
    label: "Tədbir",
    options: Array.from(new Set(buyerPortalRows.map((row) => row.event))),
  },
  {
    key: "ticket",
    label: "Bilet",
    options: Array.from(new Set(buyerPortalRows.map((row) => row.ticket))),
  },
  {
    key: "status",
    label: "Status",
    options: Array.from(new Set(buyerPortalRows.map((row) => row.status))),
  },
  {
    key: "accessType",
    label: "Giriş tipi",
    options: Array.from(new Set(buyerPortalRows.map((row) => row.accessType))),
  },
];

export default function AdminPage() {
  return (
    <AdminShell
      activeLabel="Cari tədbirlər"
      action={
        <Link
          className="rounded-lg bg-[#34a51d] px-5 py-3 text-sm font-semibold text-white"
          href="/admin/check-in"
        >
          Check-in panelini aç
        </Link>
      }
      description="Bölmələr sol paneldə qruplaşdırılıb. Cədvəllər filtr, sütun seçimi, sıralama və export əməliyyatları üçün smart formatda hazırlanır."
      title="Tədbir, bilet və satış idarəetməsi"
    >
      <div className="grid gap-4 md:grid-cols-4">
        {adminStats.map(([label, value]) => (
          <article
            className="rounded-lg border border-black/10 bg-white p-5"
            key={label}
          >
            <p className="text-sm text-[#68736c]">{label}</p>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <section className="rounded-lg border border-black/10 bg-white p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[#68736c]">Tədbirlər</p>
              <h2 className="text-xl font-semibold">Yeni tədbir yarat</h2>
            </div>
            <span className="rounded-lg bg-[#eefaf5] px-3 py-1 text-xs font-medium text-[#106142]">
              Demo form
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm md:col-span-2">
              Tədbir adı
              <input
                className="rounded-lg border border-black/10 px-3 py-3"
                defaultValue="AI & Finance Summit 2026"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Tarix
              <input
                className="rounded-lg border border-black/10 px-3 py-3"
                defaultValue="18 Sentyabr 2026"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Format
              <select className="rounded-lg border border-black/10 px-3 py-3">
                <option>Hibrid</option>
                <option>Fiziki</option>
                <option>Onlayn</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm md:col-span-2">
              Məkan
              <input
                className="rounded-lg border border-black/10 px-3 py-3"
                defaultValue="Baku Convention Center"
              />
            </label>
            <label className="grid gap-2 text-sm md:col-span-2">
              Qısa təsvir
              <textarea
                className="min-h-24 rounded-lg border border-black/10 px-3 py-3"
                defaultValue="Fintech və maliyyə komandaları üçün AI tətbiqləri."
              />
            </label>
          </div>
          <button className="mt-5 rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white">
            Tədbiri yadda saxla
          </button>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5">
          <div className="mb-5">
            <p className="text-sm text-[#68736c]">Biletlər</p>
            <h2 className="text-xl font-semibold">Bilet növü yarat</h2>
          </div>
          <div className="grid gap-3">
            <label className="grid gap-2 text-sm">
              Bilet adı
              <input
                className="rounded-lg border border-black/10 px-3 py-3"
                defaultValue="Standard"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                Qiymət
                <input
                  className="rounded-lg border border-black/10 px-3 py-3"
                  defaultValue="50"
                  inputMode="numeric"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Limit
                <input
                  className="rounded-lg border border-black/10 px-3 py-3"
                  defaultValue="300"
                  inputMode="numeric"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm">
              İştirak növü
              <select className="rounded-lg border border-black/10 px-3 py-3">
                <option>Fiziki iştirak</option>
                <option>Onlayn iştirak</option>
                <option>Replay</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Satış statusu
              <select className="rounded-lg border border-black/10 px-3 py-3">
                <option>Aktiv</option>
                <option>Dayandırılıb</option>
                <option>Satış bitib</option>
              </select>
            </label>
          </div>
          <button className="mt-5 rounded-lg bg-[#101510] px-4 py-3 text-sm font-semibold text-white">
            Bileti yadda saxla
          </button>
        </section>
      </div>

      <SmartDataTable
        columns={orderColumns}
        description="Sifarişçilərin email, telefon, bilet və ödəniş statuslarını filtrələ, sütunları tənzimlə və export et."
        eyebrow="Satış və ödəniş"
        filters={orderFilters}
        rows={orderRows}
        title="Sifarişçilər"
      />

      <SmartDataTable
        columns={buyerPortalColumns}
        description="Alıcıların magic link, OTP, bilet kabineti və transfer statuslarını bir yerdən izləmək üçün idarəetmə cədvəli."
        eyebrow="Alıcı self-service"
        filters={buyerPortalFilters}
        rows={buyerPortalRows}
        title="Alıcı kabinetləri"
      />

      <SmartDataTable
        columns={attendeeColumns}
        description="Bilet alarkən toplanan email, telefon, maraq sahəsi və iştirak məlumatları burada CRM üçün səliqəli görünür."
        eyebrow="CRM / Data"
        filters={attendeeFilters}
        rows={attendeeRows}
        title="İştirakçılar"
      />
    </AdminShell>
  );
}
