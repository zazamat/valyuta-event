"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type BuyerTicket = {
  token: string;
  ticketCode: string;
  orderId: string;
  attendeeId: string;
  buyer: string;
  email: string;
  phone: string;
  event: string;
  date: string;
  time: string;
  venue: string;
  ticket: string;
  amount: string;
  status: string;
  checkInStatus: string;
  invoice: string;
  accessType: string;
  onlineAccess: string;
  transferStatus: string;
  lastSent: string;
};

type PortalRow = {
  id: string;
  buyer: string;
  email: string;
  phone: string;
  events: string;
  ticketCount: number;
  activeTickets: number;
  accessTypes: string;
  status: "active" | "awaiting_payment" | "blocked" | "cancelled";
  transferStatus: string;
  lastSent: string;
  items: BuyerTicket[];
};

type LogItem = {
  id: string;
  time: string;
  text: string;
};

const statusLabels: Record<PortalRow["status"], string> = {
  active: "Aktiv",
  awaiting_payment: "Ödəniş gözlənilir",
  blocked: "Bloklanıb",
  cancelled: "Ləğv edilib",
};

const statusStyles: Record<PortalRow["status"], string> = {
  active: "bg-[#e9f8ee] text-[#106142] ring-[#bde6c6]",
  awaiting_payment: "bg-[#fff6df] text-[#8a5a00] ring-[#f1d58d]",
  blocked: "bg-[#fff0ed] text-[#b42318] ring-[#ffc9bf]",
  cancelled: "bg-[#fff0ed] text-[#b42318] ring-[#ffc9bf]",
};

function nowLabel() {
  return new Intl.DateTimeFormat("az-AZ", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date());
}

function buildPortals(tickets: BuyerTicket[]): PortalRow[] {
  const groups = tickets.reduce<Record<string, BuyerTicket[]>>((acc, ticket) => {
    const key = `${ticket.email}-${ticket.phone}`;
    acc[key] = [...(acc[key] ?? []), ticket];
    return acc;
  }, {});

  return Object.entries(groups).map(([id, items]) => {
    const first = items[0];
    const events = Array.from(new Set(items.map((item) => item.event))).join(", ");
    const accessTypes = Array.from(new Set(items.map((item) => item.accessType))).join(", ");
    const activeTickets = items.filter((item) => item.status === "paid").length;
    const allCancelled = items.every((item) => item.status === "cancelled");
    const hasPending = items.some((item) => item.status === "awaiting_payment");

    return {
      id,
      buyer: first.buyer,
      email: first.email,
      phone: first.phone,
      events,
      ticketCount: items.length,
      activeTickets,
      accessTypes,
      status: allCancelled ? "cancelled" : hasPending ? "awaiting_payment" : "active",
      transferStatus: Array.from(new Set(items.map((item) => item.transferStatus))).join(", "),
      lastSent: first.lastSent,
      items,
    };
  });
}

export function BuyerPortalsManager({ tickets }: { tickets: BuyerTicket[] }) {
  const basePortals = useMemo(() => buildPortals(tickets), [tickets]);
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, PortalRow["status"]>>({});
  const [logs, setLogs] = useState<Record<string, LogItem[]>>({});
  const [toast, setToast] = useState("");

  const portals = basePortals.map((portal) => ({
    ...portal,
    status: statusOverrides[portal.id] ?? portal.status,
  }));

  const events = Array.from(new Set(portals.flatMap((portal) => portal.events.split(", "))));
  const statuses = Array.from(new Set(portals.map((portal) => portal.status)));
  const accessTypes = Array.from(new Set(portals.flatMap((portal) => portal.accessTypes.split(", "))));

  const filteredPortals = portals.filter((portal) => {
    const haystack = [
      portal.buyer,
      portal.email,
      portal.phone,
      portal.events,
      portal.accessTypes,
      portal.items.map((item) => item.ticketCode).join(" "),
      portal.items.map((item) => item.orderId).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
    const matchesEvent = eventFilter === "all" || portal.events.includes(eventFilter);
    const matchesStatus = statusFilter === "all" || portal.status === statusFilter;
    const matchesAccess = accessFilter === "all" || portal.accessTypes.includes(accessFilter);
    return matchesQuery && matchesEvent && matchesStatus && matchesAccess;
  });

  const selectedPortal =
    selectedId === null
      ? null
      : filteredPortals.find((portal) => portal.id === selectedId) ??
        portals.find((portal) => portal.id === selectedId) ??
        null;

  const addLog = (portalId: string, text: string) => {
    const item = { id: `${Date.now()}-${Math.random()}`, time: nowLabel(), text };
    setLogs((current) => ({ ...current, [portalId]: [item, ...(current[portalId] ?? [])] }));
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  };

  const sendMagicLink = (portal: PortalRow) => {
    addLog(portal.id, `Magic link ${portal.email} ünvanına yenidən göndərildi.`);
  };

  const resetOtp = (portal: PortalRow) => {
    addLog(portal.id, `${portal.phone} üçün yeni OTP yaradıldı və SMS növbəsinə əlavə edildi.`);
  };

  const toggleBlock = (portal: PortalRow) => {
    const nextStatus = portal.status === "blocked" ? "active" : "blocked";
    setStatusOverrides((current) => ({ ...current, [portal.id]: nextStatus }));
    addLog(portal.id, nextStatus === "blocked" ? "Alıcı kabineti bloklandı." : "Alıcı kabineti yenidən aktiv edildi.");
  };

  const activePortals = portals.filter((portal) => portal.status === "active").length;
  const totalTickets = filteredPortals.reduce((sum, portal) => sum + portal.ticketCount, 0);
  const activeTickets = filteredPortals.reduce((sum, portal) => sum + portal.activeTickets, 0);

  return (
    <div className="grid gap-6">
      {toast ? (
        <div className="fixed right-5 top-5 z-[70] rounded-lg border border-[#bde6c6] bg-[#e9f8ee] px-4 py-3 text-sm font-semibold text-[#106142] shadow-xl shadow-black/10">
          {toast}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Kabinet", filteredPortals.length.toString()],
          ["Aktiv kabinet", activePortals.toString()],
          ["Bilet", totalTickets.toString()],
          ["Aktiv bilet", activeTickets.toString()],
        ].map(([label, value]) => (
          <article className="rounded-lg border border-black/10 bg-white p-5" key={label}>
            <p className="text-sm text-[#68736c]">{label}</p>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-[#d6e0da] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-4">
          <input
            className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm outline-none focus:border-[#34a51d] focus:ring-2 focus:ring-[#34a51d]/15"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ad, email, telefon, sifariş və ya bilet kodu axtar"
            value={query}
          />
          <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm outline-none focus:border-[#34a51d]" onChange={(event) => setEventFilter(event.target.value)} value={eventFilter}>
            <option value="all">Tədbir: hamısı</option>
            {events.map((event) => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>
          <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm outline-none focus:border-[#34a51d]" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
            <option value="all">Status: hamısı</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{statusLabels[status]}</option>
            ))}
          </select>
          <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm outline-none focus:border-[#34a51d]" onChange={(event) => setAccessFilter(event.target.value)} value={accessFilter}>
            <option value="all">Giriş üsulu: hamısı</option>
            {accessTypes.map((access) => (
              <option key={access} value={access}>{access}</option>
            ))}
          </select>
        </div>
      </section>

      <article className="overflow-hidden rounded-lg border border-[#d6e0da] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d6e0da] px-5 py-4">
          <div>
            <p className="text-sm text-[#68736c]">Self-service giriş</p>
            <h2 className="text-xl font-semibold">Alıcı kabinetləri</h2>
          </div>
          <span className="rounded-lg bg-[#eef3f0] px-3 py-1 text-sm font-semibold text-[#4d5752]">
            {filteredPortals.length} qeyd
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-[#f7faf8]">
                {["Alıcı", "Tədbir", "Biletlər", "Giriş üsulu", "Status", "Transfer", "Son göndərilmə", "Əməliyyat"].map((header) => (
                  <th className="border-b border-r border-[#dfe8e2] px-4 py-3 font-semibold first:border-l" key={header}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPortals.map((portal) => (
                <tr className="bg-white transition hover:bg-[#f9fbfa]" key={portal.id}>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3 first:border-l">
                    <strong>{portal.buyer}</strong>
                    <p className="text-xs text-[#68736c]">{portal.email}</p>
                    <p className="text-xs text-[#68736c]">{portal.phone}</p>
                  </td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">{portal.events}</td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">
                    <strong>{portal.activeTickets}/{portal.ticketCount} aktiv</strong>
                    <p className="text-xs text-[#68736c]">
                      {portal.items.map((item) => item.ticket).join(", ")}
                    </p>
                  </td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">{portal.accessTypes}</td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">
                    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[portal.status]}`}>
                      {statusLabels[portal.status]}
                    </span>
                  </td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">{portal.transferStatus}</td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">{portal.lastSent}</td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">
                    <button className="rounded-lg border border-[#c8d6ce] px-3 py-2 text-xs font-semibold hover:border-[#34a51d]" onClick={() => setSelectedId(portal.id)} type="button">
                      Kabinetə bax
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {selectedPortal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4 py-6">
          <aside className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-[#d6e0da] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#d6e0da] bg-white px-6 py-5">
              <div>
                <p className="text-sm text-[#68736c]">Alıcı kabineti</p>
                <h2 className="mt-1 text-2xl font-semibold">{selectedPortal.buyer}</h2>
                <p className="text-sm text-[#68736c]">{selectedPortal.email} · {selectedPortal.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[selectedPortal.status]}`}>
                  {statusLabels[selectedPortal.status]}
                </span>
                <button className="grid size-10 place-items-center rounded-lg border border-[#d6e0da] text-xl text-[#68736c]" onClick={() => setSelectedId(null)} type="button">
                  ×
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-6 lg:grid-cols-[0.85fr_1.15fr]">
              <section className="rounded-lg border border-[#dfe8e2] p-4">
                <h3 className="font-semibold">Kabinet məlumatı</h3>
                <dl className="mt-4 grid gap-3 text-sm">
                  {[
                    ["Giriş üsulu", selectedPortal.accessTypes],
                    ["Tədbirlər", selectedPortal.events],
                    ["Bilet", `${selectedPortal.activeTickets}/${selectedPortal.ticketCount} aktiv`],
                    ["Transfer", selectedPortal.transferStatus],
                    ["Son göndərilmə", selectedPortal.lastSent],
                  ].map(([label, value]) => (
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3" key={label}>
                      <dt className="text-[#68736c]">{label}</dt>
                      <dd className="text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 grid gap-2">
                  <button className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white" onClick={() => sendMagicLink(selectedPortal)} type="button">
                    Magic link göndər
                  </button>
                  <button className="rounded-lg border border-[#c8d6ce] px-4 py-3 text-sm font-semibold" onClick={() => resetOtp(selectedPortal)} type="button">
                    OTP sıfırla
                  </button>
                  <button className="rounded-lg border border-[#ffd4cc] px-4 py-3 text-sm font-semibold text-[#b42318]" onClick={() => toggleBlock(selectedPortal)} type="button">
                    {selectedPortal.status === "blocked" ? "Blokdan çıxar" : "Kabineti blokla"}
                  </button>
                </div>
              </section>

              <section className="rounded-lg border border-[#dfe8e2] p-4">
                <h3 className="font-semibold">Kabinetdə görünən biletlər</h3>
                <div className="mt-3 grid gap-3">
                  {selectedPortal.items.map((ticket) => (
                    <div className="rounded-lg border border-[#dfe8e2] p-3" key={ticket.ticketCode}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong>{ticket.ticket}</strong>
                          <p className="font-mono text-xs text-[#68736c]">{ticket.ticketCode}</p>
                          <p className="text-xs text-[#68736c]">{ticket.event} · {ticket.date}</p>
                        </div>
                        <span className={`rounded-lg px-2 py-1 text-xs font-semibold ring-1 ${ticket.status === "paid" ? statusStyles.active : ticket.status === "cancelled" ? statusStyles.cancelled : statusStyles.awaiting_payment}`}>
                          {ticket.status === "paid" ? "Aktiv" : ticket.status === "cancelled" ? "Ləğv" : "Ödəniş gözlənilir"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link className="rounded-lg border border-[#c8d6ce] px-3 py-2 text-xs font-semibold hover:border-[#34a51d]" href={`/tickets/${ticket.token}`}>
                          Bilet kabineti
                        </Link>
                        <button className="rounded-lg border border-[#c8d6ce] px-3 py-2 text-xs font-semibold" onClick={() => addLog(selectedPortal.id, `${ticket.ticketCode} linki yenidən göndərildi.`)} type="button">
                          Bilet linki göndər
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-[#dfe8e2] p-4 lg:col-span-2">
                <h3 className="font-semibold">Kabinet tarixçəsi</h3>
                <div className="mt-3 grid gap-2 text-sm">
                  {(logs[selectedPortal.id] ?? [
                    { id: "initial", time: selectedPortal.lastSent, text: "Kabinet linki alıcıya göndərilib." },
                  ]).map((item) => (
                    <div className="grid gap-1 rounded-lg bg-[#f7faf8] px-3 py-2 sm:grid-cols-[150px_minmax(0,1fr)]" key={item.id}>
                      <span className="text-[#68736c]">{item.time}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
