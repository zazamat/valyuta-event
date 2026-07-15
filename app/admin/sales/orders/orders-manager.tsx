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

type OrderRow = {
  id: string;
  invoice: string;
  buyer: string;
  email: string;
  phone: string;
  event: string;
  date: string;
  ticketCount: number;
  ticketsLabel: string;
  amount: number;
  amountLabel: string;
  status: string;
  channel: string;
  lastSent: string;
  items: BuyerTicket[];
};

type Column = {
  key: keyof OrderRow | "action";
  label: string;
  width: string;
  alwaysVisible?: boolean;
};

type LogItem = {
  id: string;
  time: string;
  text: string;
};

const columns: Column[] = [
  { key: "id", label: "Sifariş", width: "140px", alwaysVisible: true },
  { key: "buyer", label: "Alıcı", width: "220px" },
  { key: "email", label: "Email", width: "220px" },
  { key: "phone", label: "Telefon", width: "170px" },
  { key: "event", label: "Tədbir", width: "250px" },
  { key: "date", label: "Tarix", width: "150px" },
  { key: "ticketCount", label: "Bilet sayı", width: "120px" },
  { key: "ticketsLabel", label: "Biletlər", width: "220px" },
  { key: "amountLabel", label: "Məbləğ", width: "120px" },
  { key: "status", label: "Status", width: "170px" },
  { key: "channel", label: "Kanal", width: "140px" },
  { key: "invoice", label: "Invoice", width: "160px" },
  { key: "lastSent", label: "Son göndərilmə", width: "190px" },
  { key: "action", label: "Əməliyyat", width: "130px", alwaysVisible: true },
];

const statusLabels: Record<string, string> = {
  paid: "Ödənilib",
  awaiting_payment: "Ödəniş gözlənilir",
  cancelled: "Ləğv edilib",
  mixed: "Qarışıq status",
  refund_requested: "Refund sorğusu",
};

const statusStyles: Record<string, string> = {
  paid: "bg-[#e9f8ee] text-[#106142] ring-[#bde6c6]",
  awaiting_payment: "bg-[#fff6df] text-[#8a5a00] ring-[#f1d58d]",
  cancelled: "bg-[#fff0ed] text-[#b42318] ring-[#ffc9bf]",
  mixed: "bg-[#eef3f0] text-[#4d5752] ring-[#d6e0da]",
  refund_requested: "bg-[#fff6df] text-[#8a5a00] ring-[#f1d58d]",
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

function buildOrders(tickets: BuyerTicket[]): OrderRow[] {
  const groups = tickets.reduce<Record<string, BuyerTicket[]>>((acc, ticket) => {
    acc[ticket.orderId] = [...(acc[ticket.orderId] ?? []), ticket];
    return acc;
  }, {});

  return Object.entries(groups).map(([orderId, items]) => {
    const first = items[0];
    const statuses = Array.from(new Set(items.map((item) => item.status)));
    const status = statuses.length === 1 ? statuses[0] : "mixed";
    const ticketNames = Array.from(new Set(items.map((item) => item.ticket)));
    const channel = items.every((item) => item.ticket === "Online Live")
      ? "Online"
      : items.some((item) => item.ticket === "Online Live")
        ? "Hibrid səbət"
        : "Fiziki";
    const amount = items.reduce((sum, item) => sum + parseAmount(item.amount), 0);

    return {
      id: orderId,
      invoice: first.invoice,
      buyer: first.buyer,
      email: first.email,
      phone: first.phone,
      event: first.event,
      date: first.date,
      ticketCount: items.length,
      ticketsLabel: ticketNames.join(", "),
      amount,
      amountLabel: `${amount} AZN`,
      status,
      channel,
      lastSent: first.lastSent,
      items,
    };
  });
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function rowsToSeparatedValues(rows: OrderRow[], activeColumns: Column[], separator: string) {
  const printableColumns = activeColumns.filter((column) => column.key !== "action");
  const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const header = printableColumns.map((column) => escapeCell(column.label)).join(separator);
  const body = rows
    .map((row) =>
      printableColumns
        .map((column) => {
          const rawValue = row[column.key as keyof OrderRow];
          const value = column.key === "status" ? statusLabels[String(rawValue)] : rawValue;
          return escapeCell(String(value ?? ""));
        })
        .join(separator),
    )
    .join("\n");

  return [header, body].filter(Boolean).join("\n");
}

export function OrdersManager({ tickets }: { tickets: BuyerTicket[] }) {
  const baseOrders = useMemo(() => buildOrders(tickets), [tickets]);
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [limit, setLimit] = useState(25);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(columns.map((column) => column.key));
  const [columnOrder, setColumnOrder] = useState(columns.map((column) => column.key));
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<Record<string, LogItem[]>>({});
  const [toast, setToast] = useState("");
  const [noteOrderId, setNoteOrderId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const orders = baseOrders.map((order) => ({
    ...order,
    status: statusOverrides[order.id] ?? order.status,
  }));

  const events = Array.from(new Set(orders.map((order) => order.event)));
  const statuses = Array.from(new Set(orders.map((order) => order.status)));
  const channels = Array.from(new Set(orders.map((order) => order.channel)));
  const ticketTypes = Array.from(new Set(orders.flatMap((order) => order.items.map((item) => item.ticket))));

  const orderedColumns = columnOrder
    .map((key) => columns.find((column) => column.key === key))
    .filter((column): column is Column => Boolean(column));
  const tableColumns = orderedColumns.filter(
    (column) => column.alwaysVisible || visibleColumnKeys.includes(column.key),
  );

  const filteredOrders = orders.filter((order) => {
    const haystack = [
      order.id,
      order.invoice,
      order.buyer,
      order.email,
      order.phone,
      order.event,
      order.ticketsLabel,
      order.amountLabel,
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
    const matchesEvent = eventFilter === "all" || order.event === eventFilter;
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesChannel = channelFilter === "all" || order.channel === channelFilter;
    const matchesTicket =
      ticketFilter === "all" || order.items.some((item) => item.ticket === ticketFilter);
    return matchesQuery && matchesEvent && matchesStatus && matchesChannel && matchesTicket;
  });

  const displayedOrders = filteredOrders.slice(0, limit);
  const selectedOrder =
    selectedId === null
      ? null
      : filteredOrders.find((order) => order.id === selectedId) ??
        orders.find((order) => order.id === selectedId) ??
        null;
  const noteOrder = noteOrderId ? orders.find((order) => order.id === noteOrderId) : null;
  const refundOrder = refundOrderId ? orders.find((order) => order.id === refundOrderId) : null;

  const totalRevenue = filteredOrders
    .filter((order) => order.status === "paid")
    .reduce((sum, order) => sum + order.amount, 0);
  const paidTickets = filteredOrders
    .filter((order) => order.status === "paid")
    .reduce((sum, order) => sum + order.ticketCount, 0);
  const awaitingOrders = filteredOrders.filter((order) => order.status === "awaiting_payment").length;

  const addLog = (orderId: string, text: string) => {
    const item = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      time: nowLabel(),
    };
    setLogs((current) => ({ ...current, [orderId]: [item, ...(current[orderId] ?? [])] }));
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  };

  const moveColumn = (key: Column["key"], direction: -1 | 1) => {
    setColumnOrder((current) => {
      const index = current.indexOf(key);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  };

  const exportRows = (format: "copy" | "csv" | "excel" | "pdf" | "json") => {
    if (format === "copy") {
      navigator.clipboard?.writeText(rowsToSeparatedValues(filteredOrders, tableColumns, "\t"));
    }
    if (format === "csv") {
      downloadFile("sifarisler.csv", rowsToSeparatedValues(filteredOrders, tableColumns, ","), "text/csv");
    }
    if (format === "excel") {
      const html = `<table>${filteredOrders
        .map((row) => `<tr>${tableColumns.map((column) => `<td>${String(row[column.key as keyof OrderRow] ?? "")}</td>`).join("")}</tr>`)
        .join("")}</table>`;
      downloadFile("sifarisler.xls", html, "application/vnd.ms-excel");
    }
    if (format === "json") {
      downloadFile("sifarisler.json", JSON.stringify(filteredOrders, null, 2), "application/json");
    }
    if (format === "pdf") {
      window.print();
    }
    setIsExportOpen(false);
  };

  const handleInvoiceSend = (order: OrderRow) => {
    addLog(order.id, `${order.invoice} invoice ${order.email} ünvanına göndərildi.`);
  };

  const handleTicketLinkSend = (order: OrderRow, ticket: BuyerTicket) => {
    addLog(order.id, `${ticket.ticketCode} bilet linki ${order.email} ünvanına göndərildi.`);
  };

  const openNoteModal = (order: OrderRow) => {
    setNoteText("");
    setNoteOrderId(order.id);
  };

  const submitNote = () => {
    if (!noteOrder || !noteText.trim()) return;
    addLog(noteOrder.id, `Admin qeydi əlavə edildi: ${noteText.trim()}`);
    setNoteOrderId(null);
    setNoteText("");
  };

  const openRefundModal = (order: OrderRow) => {
    setRefundAmount(order.amountLabel);
    setRefundReason("");
    setRefundOrderId(order.id);
  };

  const submitRefund = () => {
    if (!refundOrder || !refundReason.trim()) return;
    setStatusOverrides((current) => ({ ...current, [refundOrder.id]: "refund_requested" }));
    addLog(
      refundOrder.id,
      `Refund/ləğv sorğusu açıldı: ${refundAmount || refundOrder.amountLabel}. Səbəb: ${refundReason.trim()}`,
    );
    setRefundOrderId(null);
    setRefundAmount("");
    setRefundReason("");
  };

  return (
    <div className="grid gap-6">
      {toast ? (
        <div className="fixed right-5 top-5 z-[70] rounded-lg border border-[#bde6c6] bg-[#e9f8ee] px-4 py-3 text-sm font-semibold text-[#106142] shadow-xl shadow-black/10">
          {toast}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Sifariş", filteredOrders.length.toString()],
          ["Satılmış bilet", paidTickets.toString()],
          ["Gəlir", `${totalRevenue} AZN`],
          ["Gözləyən ödəniş", awaitingOrders.toString()],
        ].map(([label, value]) => (
          <article className="rounded-lg border border-black/10 bg-white p-5" key={label}>
            <p className="text-sm text-[#68736c]">{label}</p>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-[#d6e0da] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-5">
          <input
            className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm outline-none focus:border-[#34a51d] focus:ring-2 focus:ring-[#34a51d]/15"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Sifariş, alıcı, email, telefon və ya invoice axtar"
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
              <option key={status} value={status}>{statusLabels[status] ?? status}</option>
            ))}
          </select>
          <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm outline-none focus:border-[#34a51d]" onChange={(event) => setChannelFilter(event.target.value)} value={channelFilter}>
            <option value="all">Kanal: hamısı</option>
            {channels.map((channel) => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
          <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm outline-none focus:border-[#34a51d]" onChange={(event) => setTicketFilter(event.target.value)} value={ticketFilter}>
            <option value="all">Bilet: hamısı</option>
            {ticketTypes.map((ticket) => (
              <option key={ticket} value={ticket}>{ticket}</option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <article className="overflow-hidden rounded-lg border border-[#d6e0da] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-[#d6e0da] px-5 py-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm text-[#68736c]">Qlobal satış baxışı</p>
              <h2 className="text-xl font-semibold">Sifariş cədvəli</h2>
              <p className="mt-1 text-sm text-[#68736c]">
                Tapıldı: <strong className="text-[#151817]">{filteredOrders.length}</strong> qeyd
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-[#4d5752]">
                Göstər
                <select className="h-10 rounded-lg border border-[#d6e0da] bg-white px-3 text-sm font-medium" onChange={(event) => setLimit(Number(event.target.value))} value={limit}>
                  {[10, 25, 50, 100].map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </label>
              <button className="h-10 rounded-lg border border-[#c8d6ce] bg-white px-4 text-sm font-semibold text-[#151817] transition hover:border-[#34a51d]" onClick={() => setIsColumnModalOpen(true)} type="button">
                Sütun seç
              </button>
              <div className="relative">
                <button className="h-10 rounded-lg border border-[#c8d6ce] bg-white px-4 text-sm font-semibold text-[#151817] transition hover:border-[#34a51d]" onClick={() => setIsExportOpen((current) => !current)} type="button">
                  Export
                </button>
                {isExportOpen ? (
                  <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-[#d6e0da] bg-white py-2 shadow-xl shadow-black/10">
                    {[
                      ["pdf", "Çap / PDF"],
                      ["copy", "Kopyala"],
                      ["csv", "CSV"],
                      ["excel", "Excel file"],
                      ["json", "Map / JSON"],
                    ].map(([format, label]) => (
                      <button className="block w-full px-4 py-2 text-left text-sm font-medium text-[#334039] hover:bg-[#f5f7f6]" key={format} onClick={() => exportRows(format as "copy" | "csv" | "excel" | "pdf" | "json")} type="button">
                        {label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="bg-[#f7faf8]">
                  {tableColumns.map((column) => (
                    <th className="border-b border-r border-[#dfe8e2] px-4 py-3 font-semibold first:border-l" key={column.key} style={{ minWidth: column.width }}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((order) => (
                  <tr className={`transition hover:bg-[#f9fbfa] ${selectedOrder?.id === order.id ? "bg-[#f3fbf5]" : "bg-white"}`} key={order.id}>
                    {tableColumns.map((column) => (
                      <td className="border-b border-r border-[#e6eee9] px-4 py-3 align-middle first:border-l" key={column.key}>
                        {column.key === "id" ? (
                          <>
                            <button className="text-left font-semibold text-[#101510] underline-offset-4 hover:underline" onClick={() => setSelectedId(order.id)} type="button">
                              {order.id}
                            </button>
                            <p className="text-xs text-[#68736c]">{order.channel}</p>
                          </>
                        ) : column.key === "buyer" ? (
                          <strong>{order.buyer}</strong>
                        ) : column.key === "status" ? (
                          <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[order.status]}`}>
                            {statusLabels[order.status] ?? order.status}
                          </span>
                        ) : column.key === "action" ? (
                          <button className="rounded-lg border border-[#c8d6ce] px-3 py-2 text-xs font-semibold hover:border-[#34a51d]" onClick={() => setSelectedId(order.id)} type="button">
                            Detala bax
                          </button>
                        ) : (
                          <span className="line-clamp-2">{String(order[column.key as keyof OrderRow] ?? "")}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {isColumnModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4">
          <div className="w-full max-w-3xl rounded-lg border border-[#d6e0da] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#d6e0da] px-6 py-5">
              <div>
                <h3 className="text-2xl font-semibold">Sütun seçimi</h3>
                <p className="mt-1 text-sm text-[#68736c]">Sifariş cədvəlində görünəcək sütunları seç və sıralamasını dəyiş.</p>
              </div>
              <button className="grid size-10 place-items-center rounded-lg border border-[#d6e0da] text-xl text-[#68736c]" onClick={() => setIsColumnModalOpen(false)} type="button">
                ×
              </button>
            </div>
            <div className="grid max-h-[55vh] gap-3 overflow-y-auto px-6 py-5 md:grid-cols-2">
              {orderedColumns.map((column, index) => (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-[#dfe8e2] px-3 py-3" key={column.key}>
                  <label className="flex min-w-0 items-center gap-3 text-sm font-medium">
                    <input
                      checked={visibleColumnKeys.includes(column.key)}
                      className="size-4 accent-[#34a51d]"
                      disabled={column.alwaysVisible}
                      onChange={(event) => {
                        setVisibleColumnKeys((current) =>
                          event.target.checked
                            ? [...current, column.key]
                            : current.filter((key) => key !== column.key),
                        );
                      }}
                      type="checkbox"
                    />
                    <span className="truncate">{column.label}</span>
                  </label>
                  <div className="flex gap-1">
                    <button className="size-8 rounded-lg border border-[#c8d6ce] text-sm disabled:opacity-35" disabled={index === 0} onClick={() => moveColumn(column.key, -1)} type="button">↑</button>
                    <button className="size-8 rounded-lg border border-[#c8d6ce] text-sm disabled:opacity-35" disabled={index === orderedColumns.length - 1} onClick={() => moveColumn(column.key, 1)} type="button">↓</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-between gap-3 border-t border-[#d6e0da] px-6 py-4">
              <button className="rounded-lg border border-[#c8d6ce] px-4 py-2 text-sm font-semibold" onClick={() => {
                setVisibleColumnKeys(columns.map((column) => column.key));
                setColumnOrder(columns.map((column) => column.key));
              }} type="button">
                Sıfırla
              </button>
              <button className="rounded-lg bg-[#101510] px-5 py-2 text-sm font-semibold text-white" onClick={() => setIsColumnModalOpen(false)} type="button">
                Təsdiq et
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4 py-6">
          <aside className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-[#d6e0da] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#d6e0da] bg-white px-6 py-5">
              <div>
                <p className="text-sm text-[#68736c]">Sifariş kartı</p>
                <h2 className="mt-1 text-2xl font-semibold">{selectedOrder.id}</h2>
                <p className="text-sm text-[#68736c]">{selectedOrder.invoice}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status] ?? selectedOrder.status}
                </span>
                <button className="grid size-10 place-items-center rounded-lg border border-[#d6e0da] text-xl text-[#68736c]" onClick={() => setSelectedId(null)} type="button">
                  ×
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-6 lg:grid-cols-[1fr_1.05fr]">
              <section className="rounded-lg border border-[#dfe8e2] p-4">
                <h3 className="font-semibold">Alıcı və ödəniş</h3>
                <dl className="mt-4 grid gap-3 text-sm">
                  {[
                    ["Alıcı", selectedOrder.buyer],
                    ["Email", selectedOrder.email],
                    ["Telefon", selectedOrder.phone],
                    ["Tədbir", selectedOrder.event],
                    ["Ümumi məbləğ", selectedOrder.amountLabel],
                    ["Son göndərilmə", selectedOrder.lastSent],
                  ].map(([label, value]) => (
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3" key={label}>
                      <dt className="text-[#68736c]">{label}</dt>
                      <dd className="text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="rounded-lg border border-[#dfe8e2] p-4">
                <h3 className="font-semibold">Sifarişdəki biletlər</h3>
                <div className="mt-3 grid gap-3">
                  {selectedOrder.items.map((ticket) => (
                    <div className="rounded-lg border border-[#dfe8e2] p-3" key={ticket.ticketCode}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong>{ticket.ticket}</strong>
                          <p className="font-mono text-xs text-[#68736c]">{ticket.ticketCode}</p>
                        </div>
                        <span className="text-sm font-semibold">{ticket.amount}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link className="rounded-lg border border-[#c8d6ce] px-3 py-2 text-xs font-semibold hover:border-[#34a51d]" href={`/tickets/${ticket.token}`}>
                          Bilet kabineti
                        </Link>
                        <button className="rounded-lg border border-[#c8d6ce] px-3 py-2 text-xs font-semibold" onClick={() => handleTicketLinkSend(selectedOrder, ticket)} type="button">
                          Link göndər
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-[#dfe8e2] p-4 lg:col-span-2">
                <h3 className="font-semibold">Əməliyyat tarixçəsi</h3>
                <div className="mt-3 grid gap-2 text-sm">
                  {(logs[selectedOrder.id] ?? [
                    { id: "initial", time: selectedOrder.lastSent, text: "Sifariş yaradıldı və bilet linkləri göndərildi." },
                  ]).map((item) => (
                    <div className="grid gap-1 rounded-lg bg-[#f7faf8] px-3 py-2 sm:grid-cols-[150px_minmax(0,1fr)]" key={item.id}>
                      <span className="text-[#68736c]">{item.time}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[#dfe8e2] px-6 py-5">
              <button className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white" onClick={() => handleInvoiceSend(selectedOrder)} type="button">Invoice göndər</button>
              <button className="rounded-lg border border-[#c8d6ce] px-4 py-3 text-sm font-semibold" onClick={() => openNoteModal(selectedOrder)} type="button">Admin qeydi əlavə et</button>
              <button className="rounded-lg border border-[#ffd4cc] px-4 py-3 text-sm font-semibold text-[#b42318]" onClick={() => openRefundModal(selectedOrder)} type="button">Refund / ləğv prosesi</button>
            </div>
          </aside>
        </div>
      ) : null}

      {noteOrder ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#101510]/55 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold">Admin qeydi</h3>
            <p className="mt-1 text-sm text-[#68736c]">{noteOrder.id} sifarişinə daxili qeyd əlavə olunur.</p>
            <textarea
              className="mt-4 min-h-32 w-full rounded-lg border border-[#d6e0da] px-3 py-3 text-sm outline-none focus:border-[#34a51d]"
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Məsələn: Müştəri telefonla invoice yenidən göndərilməsini istədi."
              value={noteText}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-lg border border-[#c8d6ce] px-4 py-2 text-sm font-semibold" onClick={() => setNoteOrderId(null)} type="button">Bağla</button>
              <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white disabled:opacity-45" disabled={!noteText.trim()} onClick={submitNote} type="button">Qeydi saxla</button>
            </div>
          </div>
        </div>
      ) : null}

      {refundOrder ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#101510]/55 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold">Refund / ləğv prosesi</h3>
            <p className="mt-1 text-sm text-[#68736c]">{refundOrder.id} üçün refund sorğusu açılır. Real sistemdə bu addım payment gateway təsdiqi istəyəcək.</p>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-2 text-sm">
                Refund məbləği
                <input className="rounded-lg border border-[#d6e0da] px-3 py-3 outline-none focus:border-[#34a51d]" onChange={(event) => setRefundAmount(event.target.value)} value={refundAmount} />
              </label>
              <label className="grid gap-2 text-sm">
                Səbəb
                <textarea className="min-h-28 rounded-lg border border-[#d6e0da] px-3 py-3 outline-none focus:border-[#34a51d]" onChange={(event) => setRefundReason(event.target.value)} placeholder="Refund/ləğv səbəbini yaz" value={refundReason} />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-lg border border-[#c8d6ce] px-4 py-2 text-sm font-semibold" onClick={() => setRefundOrderId(null)} type="button">Bağla</button>
              <button className="rounded-lg bg-[#b42318] px-4 py-2 text-sm font-semibold text-white disabled:opacity-45" disabled={!refundReason.trim()} onClick={submitRefund} type="button">Sorğunu təsdiqlə</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
