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

type DocumentStatus = "paid" | "awaiting" | "cancelled" | "refunded";

type InvoiceRow = {
  id: string;
  orderId: string;
  buyer: string;
  email: string;
  phone: string;
  event: string;
  tickets: BuyerTicket[];
  amount: number;
  discount: number;
  vat: number;
  total: number;
  status: DocumentStatus;
  sentAt: string;
  receiptId?: string;
};

type ColumnKey = "id" | "orderId" | "buyer" | "email" | "phone" | "event" | "total" | "status" | "receiptId" | "sentAt";

const columns: Array<{ key: ColumnKey; label: string; width: string }> = [
  { key: "id", label: "Invoice", width: "150px" },
  { key: "orderId", label: "Sifariş", width: "130px" },
  { key: "buyer", label: "Alıcı", width: "180px" },
  { key: "email", label: "Email", width: "220px" },
  { key: "phone", label: "Telefon", width: "160px" },
  { key: "event", label: "Tədbir", width: "240px" },
  { key: "total", label: "Yekun", width: "120px" },
  { key: "status", label: "Status", width: "160px" },
  { key: "receiptId", label: "Qəbz", width: "160px" },
  { key: "sentAt", label: "Son göndərilmə", width: "170px" },
];

const statusLabels: Record<DocumentStatus, string> = {
  paid: "Ödənilib",
  awaiting: "Ödəniş gözlənilir",
  cancelled: "Ləğv edilib",
  refunded: "Refund edilib",
};

const statusStyles: Record<DocumentStatus, string> = {
  paid: "bg-[#e9f8ee] text-[#106142] ring-[#bde6c6]",
  awaiting: "bg-[#fff6df] text-[#8a5a00] ring-[#f1d58d]",
  cancelled: "bg-[#fff0ed] text-[#b42318] ring-[#ffc9bf]",
  refunded: "bg-[#eef3f0] text-[#4d5752] ring-[#d6e0da]",
};

function parseAmount(amount: string) {
  return Number(amount.replace(/[^\d.]/g, "")) || 0;
}

function money(value: number) {
  return `${value.toLocaleString("az-AZ")} AZN`;
}

function nowLabel() {
  return new Intl.DateTimeFormat("az-AZ", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date());
}

function mapStatus(status: string): DocumentStatus {
  if (status === "paid") return "paid";
  if (status === "awaiting_payment") return "awaiting";
  if (status === "cancelled") return "cancelled";
  return "refunded";
}

function exportFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildInvoices(tickets: BuyerTicket[]): InvoiceRow[] {
  const groups = tickets.reduce<Record<string, BuyerTicket[]>>((acc, ticket) => {
    acc[ticket.invoice] = [...(acc[ticket.invoice] ?? []), ticket];
    return acc;
  }, {});

  return Object.entries(groups).map(([invoiceId, items], index) => {
    const first = items[0];
    const amount = items.reduce((sum, ticket) => sum + parseAmount(ticket.amount), 0);
    const discount = index === 0 ? 15 : 0;
    const vat = Math.round((amount - discount) * 0.18);
    const statusSet = Array.from(new Set(items.map((ticket) => mapStatus(ticket.status))));
    const status = statusSet.length === 1 ? statusSet[0] : "paid";

    return {
      id: invoiceId,
      orderId: first.orderId,
      buyer: first.buyer,
      email: first.email,
      phone: first.phone,
      event: first.event,
      tickets: items,
      amount,
      discount,
      vat,
      total: amount - discount + vat,
      status,
      sentAt: first.lastSent,
      receiptId: status === "paid" ? invoiceId.replace("INV", "RCPT") : undefined,
    };
  });
}

function cellValue(row: InvoiceRow, key: ColumnKey) {
  if (key === "total") return money(row.total);
  if (key === "status") return statusLabels[row.status];
  if (key === "receiptId") return row.receiptId ?? "Yoxdur";
  return String(row[key]);
}

export function InvoiceManager({ tickets }: { tickets: BuyerTicket[] }) {
  const baseRows = useMemo(() => buildInvoices(tickets), [tickets]);
  const [rows, setRows] = useState(baseRows);
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [visibleKeys, setVisibleKeys] = useState<ColumnKey[]>(columns.map((column) => column.key));
  const [columnOrder, setColumnOrder] = useState<ColumnKey[]>(columns.map((column) => column.key));
  const [limit, setLimit] = useState(25);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const events = Array.from(new Set(rows.map((row) => row.event)));
  const selected = selectedId ? rows.find((row) => row.id === selectedId) ?? null : null;
  const orderedColumns = columnOrder.map((key) => columns.find((column) => column.key === key)).filter(Boolean) as typeof columns;
  const tableColumns = orderedColumns.filter((column) => visibleKeys.includes(column.key));

  const filteredRows = rows.filter((row) => {
    const haystack = [row.id, row.orderId, row.buyer, row.email, row.phone, row.event, row.receiptId ?? ""].join(" ").toLowerCase();
    return (
      (!query.trim() || haystack.includes(query.trim().toLowerCase())) &&
      (eventFilter === "all" || row.event === eventFilter) &&
      (statusFilter === "all" || row.status === statusFilter)
    );
  });
  const displayedRows = filteredRows.slice(0, limit);
  const paidTotal = filteredRows.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.total, 0);
  const awaitingTotal = filteredRows.filter((row) => row.status === "awaiting").reduce((sum, row) => sum + row.total, 0);

  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const addLog = (row: InvoiceRow, text: string) => {
    setLogs((current) => ({ ...current, [row.id]: [`${nowLabel()} - ${text}`, ...(current[row.id] ?? [])] }));
    showNotice(text);
  };

  const sendInvoice = (row: InvoiceRow) => {
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, sentAt: nowLabel() } : item));
    addLog(row, `${row.id} ${row.email} ünvanına göndərildi.`);
  };

  const createReceipt = (row: InvoiceRow) => {
    const receiptId = row.receiptId ?? row.id.replace("INV", "RCPT");
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, receiptId, status: "paid" } : item));
    addLog(row, `${receiptId} qəbzi yaradıldı.`);
  };

  const markRefund = (row: InvoiceRow) => {
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: "refunded" } : item));
    addLog(row, `${row.id} üçün refund qeydi açıldı.`);
  };

  const downloadDocument = (row: InvoiceRow, type: "invoice" | "receipt") => {
    const docId = type === "invoice" ? row.id : row.receiptId ?? row.id.replace("INV", "RCPT");
    exportFile(
      `${docId}.txt`,
      [
        `Sənəd: ${docId}`,
        `Tip: ${type === "invoice" ? "Invoice" : "Qəbz"}`,
        `Sifariş: ${row.orderId}`,
        `Alıcı: ${row.buyer}`,
        `Email: ${row.email}`,
        `Telefon: ${row.phone}`,
        `Tədbir: ${row.event}`,
        `Məbləğ: ${money(row.amount)}`,
        `Endirim: ${money(row.discount)}`,
        `ƏDV: ${money(row.vat)}`,
        `Yekun: ${money(row.total)}`,
        `Status: ${statusLabels[row.status]}`,
      ].join("\n"),
      "text/plain;charset=utf-8",
    );
    addLog(row, `${docId} demo faylı yükləndi.`);
  };

  const moveColumn = (key: ColumnKey, direction: -1 | 1) => {
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

  const exportRows = (format: "copy" | "csv" | "excel" | "json" | "pdf") => {
    const header = tableColumns.map((column) => column.label);
    const rowsForExport = filteredRows.map((row) => tableColumns.map((column) => cellValue(row, column.key)));
    const csv = [header, ...rowsForExport].map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");

    if (format === "copy") navigator.clipboard?.writeText(csv);
    if (format === "csv") exportFile("invoice-qebz.csv", csv, "text/csv;charset=utf-8");
    if (format === "json") exportFile("invoice-qebz.json", JSON.stringify(filteredRows, null, 2), "application/json");
    if (format === "excel") {
      const html = `<table><thead><tr>${header.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead><tbody>${rowsForExport.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
      exportFile("invoice-qebz.xls", html, "application/vnd.ms-excel;charset=utf-8");
    }
    if (format === "pdf") window.print();
    setIsExportOpen(false);
    showNotice(format === "copy" ? "Cədvəl kopyalandı." : "Export hazırlandı.");
  };

  return (
    <div className="grid gap-6">
      {notice ? (
        <div className="fixed right-5 top-5 z-[70] rounded-lg border border-[#bde6c6] bg-[#e9f8ee] px-4 py-3 text-sm font-semibold text-[#106142] shadow-xl shadow-black/10">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Sənəd sayı", filteredRows.length.toString()],
          ["Ödənilmiş", money(paidTotal)],
          ["Gözləyən", money(awaitingTotal)],
          ["Qəbz yaradılıb", filteredRows.filter((row) => row.receiptId).length.toString()],
        ].map(([label, value]) => (
          <article className="rounded-lg border border-black/10 bg-white p-5" key={label}>
            <p className="text-sm text-[#68736c]">{label}</p>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-[#d6e0da] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_0.8fr]">
          <input className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm" onChange={(event) => setQuery(event.target.value)} placeholder="Invoice, sifariş, email, telefon axtar" value={query} />
          <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm" onChange={(event) => setEventFilter(event.target.value)} value={eventFilter}>
            <option value="all">Tədbir: hamısı</option>
            {events.map((event) => <option key={event}>{event}</option>)}
          </select>
          <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
            <option value="all">Status: hamısı</option>
            {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
      </section>

      <article className="overflow-hidden rounded-lg border border-[#d6e0da] bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d6e0da] px-4 py-3 lg:flex-row lg:items-center">
          <p className="text-sm text-[#4d5752]">
            Tapıldı: <strong className="text-[#151817]">{filteredRows.length}</strong> sənəd
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-[#4d5752]">
              Göstər
              <select className="h-10 rounded-lg border border-[#d6e0da] bg-white px-3 text-sm font-medium" onChange={(event) => setLimit(Number(event.target.value))} value={limit}>
                {[10, 25, 50, 100].map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>
            <button className="h-10 rounded-lg border border-[#c8d6ce] bg-white px-4 text-sm font-semibold hover:border-[#34a51d]" onClick={() => setIsColumnModalOpen(true)} type="button">
              Sütun seç
            </button>
            <div className="relative">
              <button className="h-10 rounded-lg border border-[#c8d6ce] bg-white px-4 text-sm font-semibold hover:border-[#34a51d]" onClick={() => setIsExportOpen((current) => !current)} type="button">
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
                    <button className="block w-full px-4 py-2 text-left text-sm font-medium text-[#334039] hover:bg-[#f5f7f6]" key={format} onClick={() => exportRows(format as "copy" | "csv" | "excel" | "json" | "pdf")} type="button">
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-[#f7faf8]">
                {tableColumns.map((column) => (
                  <th className="border-b border-r border-[#dfe8e2] px-4 py-3 font-semibold first:border-l" key={column.key} style={{ minWidth: column.width }}>
                    {column.label}
                  </th>
                ))}
                <th className="border-b border-r border-[#dfe8e2] px-4 py-3 font-semibold">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row) => (
                <tr className="bg-white hover:bg-[#f9fbfa]" key={row.id}>
                  {tableColumns.map((column) => (
                    <td className="border-b border-r border-[#e6eee9] px-4 py-3 first:border-l" key={column.key}>
                      {column.key === "status" ? (
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[row.status]}`}>{statusLabels[row.status]}</span>
                      ) : (
                        <span className="line-clamp-2">{cellValue(row, column.key)}</span>
                      )}
                    </td>
                  ))}
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">
                    <button className="rounded-lg border border-[#c8d6ce] px-3 py-2 text-xs font-semibold hover:border-[#34a51d]" onClick={() => setSelectedId(row.id)} type="button">
                      Detala bax
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {isColumnModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4">
          <div className="w-full max-w-3xl rounded-lg border border-[#d6e0da] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#d6e0da] px-6 py-5">
              <div>
                <h3 className="text-2xl font-semibold">Sütun seçimi</h3>
                <p className="mt-1 text-sm text-[#68736c]">Qəbz/invoice cədvəlində görünəcək sütunları seç və sırala.</p>
              </div>
              <button className="grid size-10 place-items-center rounded-lg border border-[#d6e0da] text-xl text-[#68736c]" onClick={() => setIsColumnModalOpen(false)} type="button">×</button>
            </div>
            <div className="grid max-h-[55vh] gap-3 overflow-y-auto px-6 py-5 md:grid-cols-2">
              {orderedColumns.map((column, index) => (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-[#dfe8e2] px-3 py-3" key={column.key}>
                  <label className="flex min-w-0 items-center gap-3 text-sm font-medium">
                    <input checked={visibleKeys.includes(column.key)} className="size-4 accent-[#34a51d]" onChange={(event) => setVisibleKeys((current) => event.target.checked ? [...current, column.key] : current.filter((key) => key !== column.key))} type="checkbox" />
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
              <button className="rounded-lg border border-[#c8d6ce] px-4 py-2 text-sm font-semibold" onClick={() => { setVisibleKeys(columns.map((column) => column.key)); setColumnOrder(columns.map((column) => column.key)); }} type="button">Sıfırla</button>
              <button className="rounded-lg bg-[#101510] px-5 py-2 text-sm font-semibold text-white" onClick={() => setIsColumnModalOpen(false)} type="button">Təsdiq et</button>
            </div>
          </div>
        </div>
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4 py-6">
          <aside className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-[#d6e0da] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#d6e0da] bg-white px-6 py-5">
              <div>
                <p className="text-sm text-[#68736c]">Sənəd kartı</p>
                <h2 className="mt-1 text-2xl font-semibold">{selected.id}</h2>
                <p className="text-sm text-[#68736c]">{selected.orderId}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[selected.status]}`}>{statusLabels[selected.status]}</span>
                <button className="grid size-10 place-items-center rounded-lg border border-[#d6e0da] text-xl text-[#68736c]" onClick={() => setSelectedId(null)} type="button">×</button>
              </div>
            </div>

            <div className="grid gap-5 p-6 lg:grid-cols-[1fr_0.9fr]">
              <section className="rounded-lg border border-[#dfe8e2] p-4">
                <h3 className="font-semibold">Alıcı və sənəd</h3>
                <dl className="mt-4 grid gap-3 text-sm">
                  {[
                    ["Alıcı", selected.buyer],
                    ["Email", selected.email],
                    ["Telefon", selected.phone],
                    ["Tədbir", selected.event],
                    ["Məbləğ", money(selected.amount)],
                    ["Endirim", money(selected.discount)],
                    ["ƏDV", money(selected.vat)],
                    ["Yekun", money(selected.total)],
                    ["Son göndərilmə", selected.sentAt],
                  ].map(([label, value]) => (
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3" key={label}>
                      <dt className="text-[#68736c]">{label}</dt>
                      <dd className="text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="rounded-lg border border-[#dfe8e2] p-4">
                <h3 className="font-semibold">Əməliyyatlar</h3>
                <div className="mt-4 grid gap-2">
                  <button className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98]" onClick={() => sendInvoice(selected)} type="button">Invoice göndər</button>
                  <button className="rounded-lg border border-[#c8d6ce] px-4 py-3 text-sm font-semibold transition active:scale-[0.98]" onClick={() => createReceipt(selected)} type="button">Qəbz yarat</button>
                  <button className="rounded-lg border border-[#c8d6ce] px-4 py-3 text-sm font-semibold transition active:scale-[0.98]" onClick={() => downloadDocument(selected, "invoice")} type="button">Invoice yüklə</button>
                  <button className="rounded-lg border border-[#c8d6ce] px-4 py-3 text-sm font-semibold transition active:scale-[0.98]" onClick={() => downloadDocument(selected, "receipt")} type="button">Qəbz yüklə</button>
                  <button className="rounded-lg border border-[#ffd4cc] px-4 py-3 text-sm font-semibold text-[#b42318] transition active:scale-[0.98]" onClick={() => markRefund(selected)} type="button">Refund / ləğv prosesi</button>
                </div>
              </section>

              <section className="rounded-lg border border-[#dfe8e2] p-4 lg:col-span-2">
                <h3 className="font-semibold">Sifarişdəki biletlər</h3>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {selected.tickets.map((ticket) => (
                    <div className="rounded-lg border border-[#dfe8e2] p-3" key={ticket.ticketCode}>
                      <div className="flex items-start justify-between gap-3">
                        <strong>{ticket.ticket}</strong>
                        <span>{ticket.amount}</span>
                      </div>
                      <p className="mt-1 text-xs text-[#68736c]">{ticket.ticketCode}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-[#dfe8e2] p-4 lg:col-span-2">
                <h3 className="font-semibold">Tarixçə</h3>
                <div className="mt-2 grid gap-2 text-sm">
                  {(logs[selected.id] ?? [`${selected.sentAt} - Invoice yaradıldı.`]).map((item) => (
                    <p className="rounded-lg bg-[#f7faf8] px-3 py-2" key={item}>{item}</p>
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
