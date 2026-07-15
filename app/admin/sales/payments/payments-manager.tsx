"use client";

import { useMemo, useState } from "react";

type BuyerTicket = {
  ticketCode: string;
  orderId: string;
  buyer: string;
  email: string;
  phone: string;
  event: string;
  ticket: string;
  amount: string;
  status: string;
  invoice: string;
  lastSent: string;
};

type PaymentStatus = "successful" | "awaiting" | "failed" | "cancelled" | "refunded";

type PaymentRow = {
  id: string;
  orderId: string;
  invoice: string;
  buyer: string;
  email: string;
  phone: string;
  event: string;
  ticketCount: number;
  ticketsLabel: string;
  amount: number;
  amountLabel: string;
  status: PaymentStatus;
  gateway: string;
  method: string;
  date: string;
};

type LogItem = {
  id: string;
  time: string;
  text: string;
};

const statusLabels: Record<PaymentStatus, string> = {
  successful: "Uğurlu",
  awaiting: "Gözləmədə",
  failed: "Uğursuz",
  cancelled: "Ləğv edilib",
  refunded: "Refund edilib",
};

const statusStyles: Record<PaymentStatus, string> = {
  successful: "bg-[#e9f8ee] text-[#106142] ring-[#bde6c6]",
  awaiting: "bg-[#fff6df] text-[#8a5a00] ring-[#f1d58d]",
  failed: "bg-[#fff0ed] text-[#b42318] ring-[#ffc9bf]",
  cancelled: "bg-[#fff0ed] text-[#b42318] ring-[#ffc9bf]",
  refunded: "bg-[#eef3f0] text-[#4d5752] ring-[#d6e0da]",
};

function parseAmount(amount: string) {
  return Number(amount.replace(/[^\d.]/g, "")) || 0;
}

function nowLabel() {
  return new Intl.DateTimeFormat("az-AZ", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date());
}

function mapPaymentStatus(status: string): PaymentStatus {
  if (status === "paid") return "successful";
  if (status === "awaiting_payment") return "awaiting";
  if (status === "cancelled") return "cancelled";
  return "failed";
}

function buildPayments(tickets: BuyerTicket[]): PaymentRow[] {
  const groups = tickets.reduce<Record<string, BuyerTicket[]>>((acc, ticket) => {
    acc[ticket.orderId] = [...(acc[ticket.orderId] ?? []), ticket];
    return acc;
  }, {});

  return Object.entries(groups).map(([orderId, items], index) => {
    const first = items[0];
    const statuses = Array.from(new Set(items.map((item) => mapPaymentStatus(item.status))));
    const status = statuses.length === 1 ? statuses[0] : "successful";
    const amount = items.reduce((sum, item) => sum + parseAmount(item.amount), 0);
    const ticketNames = Array.from(new Set(items.map((item) => item.ticket))).join(", ");

    return {
      id: `PAY-2026-${1048 + index}`,
      orderId,
      invoice: first.invoice,
      buyer: first.buyer,
      email: first.email,
      phone: first.phone,
      event: first.event,
      ticketCount: items.length,
      ticketsLabel: ticketNames,
      amount,
      amountLabel: `${amount} AZN`,
      status,
      gateway: index === 1 ? "Kapital eCommerce" : "AzeriCard",
      method: index === 2 ? "Manual ləğv" : "Kart",
      date: first.lastSent,
    };
  });
}

function downloadCsv(rows: PaymentRow[]) {
  const header = ["Ödəniş ID", "Sifariş", "Alıcı", "Email", "Telefon", "Tədbir", "Məbləğ", "Status", "Gateway", "Tarix"];
  const body = rows.map((row) =>
    [
      row.id,
      row.orderId,
      row.buyer,
      row.email,
      row.phone,
      row.event,
      row.amountLabel,
      statusLabels[row.status],
      row.gateway,
      row.date,
    ]
      .map((value) => `"${value.replaceAll('"', '""')}"`)
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "odenisler.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function PaymentsManager({ tickets }: { tickets: BuyerTicket[] }) {
  const basePayments = useMemo(() => buildPayments(tickets), [tickets]);
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, PaymentStatus>>({});
  const [logs, setLogs] = useState<Record<string, LogItem[]>>({});
  const [toast, setToast] = useState("");

  const payments = basePayments.map((payment) => ({
    ...payment,
    status: statusOverrides[payment.id] ?? payment.status,
  }));
  const events = Array.from(new Set(payments.map((payment) => payment.event)));
  const statuses = Array.from(new Set(payments.map((payment) => payment.status)));
  const gateways = Array.from(new Set(payments.map((payment) => payment.gateway)));

  const filteredPayments = payments.filter((payment) => {
    const haystack = [
      payment.id,
      payment.orderId,
      payment.invoice,
      payment.buyer,
      payment.email,
      payment.phone,
      payment.event,
      payment.amountLabel,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query.trim() || haystack.includes(query.trim().toLowerCase())) &&
      (eventFilter === "all" || payment.event === eventFilter) &&
      (statusFilter === "all" || payment.status === statusFilter) &&
      (gatewayFilter === "all" || payment.gateway === gatewayFilter)
    );
  });

  const selectedPayment =
    selectedId === null
      ? null
      : filteredPayments.find((payment) => payment.id === selectedId) ??
        payments.find((payment) => payment.id === selectedId) ??
        null;

  const successful = filteredPayments.filter((payment) => payment.status === "successful");
  const failed = filteredPayments.filter((payment) => payment.status === "failed");
  const cancelled = filteredPayments.filter((payment) => payment.status === "cancelled" || payment.status === "refunded");
  const awaiting = filteredPayments.filter((payment) => payment.status === "awaiting");
  const totalSales = successful.reduce((sum, payment) => sum + payment.amount, 0);

  const addLog = (paymentId: string, text: string) => {
    const item = { id: `${Date.now()}-${Math.random()}`, time: nowLabel(), text };
    setLogs((current) => ({ ...current, [paymentId]: [item, ...(current[paymentId] ?? [])] }));
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  };

  const markStatus = (payment: PaymentRow, status: PaymentStatus, text: string) => {
    setStatusOverrides((current) => ({ ...current, [payment.id]: status }));
    addLog(payment.id, text);
  };

  const actionButtonClass = (status: PaymentStatus, activeClass: string) =>
    `rounded-lg px-4 py-3 text-sm font-semibold transition active:scale-[0.98] ${
      selectedPayment?.status === status
        ? activeClass
        : "border border-[#c8d6ce] bg-white text-[#151817] hover:border-[#34a51d]"
    }`;

  return (
    <div className="grid gap-6">
      {toast ? (
        <div className="fixed right-5 top-5 z-[70] rounded-lg border border-[#bde6c6] bg-[#e9f8ee] px-4 py-3 text-sm font-semibold text-[#106142] shadow-xl shadow-black/10">
          {toast}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-5">
        {[
          ["Ümumi satış", `${totalSales} AZN`],
          ["Uğurlu", successful.length.toString()],
          ["Gözləmədə", awaiting.length.toString()],
          ["Uğursuz", failed.length.toString()],
          ["Ləğv/refund", cancelled.length.toString()],
        ].map(([label, value]) => (
          <article className="rounded-lg border border-black/10 bg-white p-5" key={label}>
            <p className="text-sm text-[#68736c]">{label}</p>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-[#d6e0da] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto]">
          <input
            className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm outline-none focus:border-[#34a51d] focus:ring-2 focus:ring-[#34a51d]/15"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ödəniş ID, sifariş, email, telefon və ya invoice axtar"
            value={query}
          />
          <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm outline-none focus:border-[#34a51d]" onChange={(event) => setEventFilter(event.target.value)} value={eventFilter}>
            <option value="all">Tədbir: hamısı</option>
            {events.map((event) => <option key={event} value={event}>{event}</option>)}
          </select>
          <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm outline-none focus:border-[#34a51d]" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
            <option value="all">Status: hamısı</option>
            {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select>
          <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm outline-none focus:border-[#34a51d]" onChange={(event) => setGatewayFilter(event.target.value)} value={gatewayFilter}>
            <option value="all">Gateway: hamısı</option>
            {gateways.map((gateway) => <option key={gateway} value={gateway}>{gateway}</option>)}
          </select>
          <button className="h-11 rounded-lg bg-[#101510] px-4 text-sm font-semibold text-white" onClick={() => downloadCsv(filteredPayments)} type="button">
            CSV export
          </button>
        </div>
      </section>

      <article className="overflow-hidden rounded-lg border border-[#d6e0da] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d6e0da] px-5 py-4">
          <div>
            <p className="text-sm text-[#68736c]">Gateway tranzaksiyaları</p>
            <h2 className="text-xl font-semibold">Ödəniş cədvəli</h2>
          </div>
          <span className="rounded-lg bg-[#eef3f0] px-3 py-1 text-sm font-semibold text-[#4d5752]">
            {filteredPayments.length} qeyd
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-[#f7faf8]">
                {["Ödəniş", "Sifariş", "Alıcı", "Tədbir", "Məbləğ", "Status", "Gateway", "Tarix", "Əməliyyat"].map((header) => (
                  <th className="border-b border-r border-[#dfe8e2] px-4 py-3 font-semibold first:border-l" key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr className="bg-white transition hover:bg-[#f9fbfa]" key={payment.id}>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3 first:border-l">
                    <strong>{payment.id}</strong>
                    <p className="text-xs text-[#68736c]">{payment.method}</p>
                  </td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">
                    {payment.orderId}
                    <p className="text-xs text-[#68736c]">{payment.invoice}</p>
                  </td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">
                    <strong>{payment.buyer}</strong>
                    <p className="text-xs text-[#68736c]">{payment.email}</p>
                    <p className="text-xs text-[#68736c]">{payment.phone}</p>
                  </td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">{payment.event}</td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3 font-semibold">{payment.amountLabel}</td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">
                    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[payment.status]}`}>
                      {statusLabels[payment.status]}
                    </span>
                  </td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">{payment.gateway}</td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">{payment.date}</td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">
                    <button className="rounded-lg border border-[#c8d6ce] px-3 py-2 text-xs font-semibold hover:border-[#34a51d]" onClick={() => setSelectedId(payment.id)} type="button">
                      Detala bax
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {selectedPayment ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4 py-6">
          <aside className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-[#d6e0da] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#d6e0da] bg-white px-6 py-5">
              <div>
                <p className="text-sm text-[#68736c]">Ödəniş detalı</p>
                <h2 className="mt-1 text-2xl font-semibold">{selectedPayment.id}</h2>
                <p className="text-sm text-[#68736c]">{selectedPayment.orderId} · {selectedPayment.invoice}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[selectedPayment.status]}`}>
                  {statusLabels[selectedPayment.status]}
                </span>
                <button className="grid size-10 place-items-center rounded-lg border border-[#d6e0da] text-xl text-[#68736c]" onClick={() => setSelectedId(null)} type="button">
                  ×
                </button>
              </div>
            </div>
            <div className="grid gap-5 p-6 lg:grid-cols-2">
              <section className="rounded-lg border border-[#dfe8e2] p-4">
                <h3 className="font-semibold">Alıcı və gateway</h3>
                <dl className="mt-4 grid gap-3 text-sm">
                  {[
                    ["Alıcı", selectedPayment.buyer],
                    ["Email", selectedPayment.email],
                    ["Telefon", selectedPayment.phone],
                    ["Gateway", selectedPayment.gateway],
                    ["Metod", selectedPayment.method],
                    ["Məbləğ", selectedPayment.amountLabel],
                  ].map(([label, value]) => (
                    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3" key={label}>
                      <dt className="text-[#68736c]">{label}</dt>
                      <dd className="text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="rounded-lg border border-[#dfe8e2] p-4">
                <h3 className="font-semibold">Əməliyyatlar</h3>
                <div className="mt-4 grid gap-2">
                  <button className={actionButtonClass("successful", "bg-[#34a51d] text-white shadow-sm shadow-[#34a51d]/25 ring-2 ring-[#34a51d]/20")} onClick={() => markStatus(selectedPayment, "successful", `${selectedPayment.id} manual olaraq uğurlu təsdiqləndi.`)} type="button">
                    Uğurlu təsdiqlə
                  </button>
                  <button className={actionButtonClass("failed", "bg-[#fff0ed] text-[#b42318] ring-2 ring-[#ffc9bf]")} onClick={() => markStatus(selectedPayment, "failed", `${selectedPayment.id} uğursuz kimi işarələndi.`)} type="button">
                    Uğursuz işarələ
                  </button>
                  <button className={actionButtonClass("refunded", "bg-[#eef3f0] text-[#4d5752] ring-2 ring-[#c8d6ce]")} onClick={() => markStatus(selectedPayment, "refunded", `${selectedPayment.id} üçün refund qeydi yaradıldı.`)} type="button">
                    Refund qeyd et
                  </button>
                </div>
                <p className="mt-3 rounded-lg bg-[#f7faf8] px-3 py-2 text-xs font-medium text-[#4d5752]">
                  Aktiv status: {statusLabels[selectedPayment.status]}
                </p>
              </section>
              <section className="rounded-lg border border-[#dfe8e2] p-4 lg:col-span-2">
                <h3 className="font-semibold">Ödəniş tarixçəsi</h3>
                <div className="mt-3 grid gap-2 text-sm">
                  {(logs[selectedPayment.id] ?? [
                    { id: "initial", time: selectedPayment.date, text: `${statusLabels[selectedPayment.status]} ödəniş qeydi yaradıldı.` },
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
