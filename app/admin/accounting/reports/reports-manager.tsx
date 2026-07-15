"use client";

import { useMemo, useState } from "react";

type EventItem = {
  title: string;
  sold: number;
  capacity: number;
};

type BuyerTicket = {
  event: string;
  amount: string;
  status: string;
};

type ReportRow = {
  id: string;
  event: string;
  type: string;
  source: string;
  amount: number;
  status: string;
};

const extraIncome: ReportRow[] = [
  { id: "INC-201", event: "AI & Finance Summit 2026", type: "Sponsor gəliri", source: "Baş sponsor", amount: 5000, status: "Təsdiqlənib" },
  { id: "INC-202", event: "AI & Finance Summit 2026", type: "Sərgi stendi", source: "Fintech Expo", amount: 1800, status: "Daxil olub" },
  { id: "INC-203", event: "Marketing Data Lab", type: "Sponsor gəliri", source: "Data Partner", amount: 1200, status: "Gözləmədə" },
  { id: "INC-204", event: "Fintech Founders Meetup 2025", type: "Sponsor gəliri", source: "Valyuta.az", amount: 2600, status: "Daxil olub" },
];

const expenseRows: ReportRow[] = [
  { id: "EXP-301", event: "AI & Finance Summit 2026", type: "Məkan", source: "Baku Convention Center", amount: 4500, status: "Təsdiqlənib" },
  { id: "EXP-302", event: "AI & Finance Summit 2026", type: "Texniki avadanlıq", source: "AV Pro", amount: 2200, status: "Ödənilib" },
  { id: "EXP-303", event: "AI & Finance Summit 2026", type: "Catering", source: "Event Cafe", amount: 1500, status: "Planlanıb" },
  { id: "EXP-304", event: "Marketing Data Lab", type: "Reklam", source: "Meta Ads", amount: 1400, status: "Ödənilib" },
  { id: "EXP-305", event: "Fintech Founders Meetup 2025", type: "Catering", source: "Event Cafe", amount: 520, status: "Ödənilib" },
];

function parseAmount(amount: string) {
  return Number(amount.replace(/[^\d.]/g, "")) || 0;
}

function money(value: number) {
  return `${value.toLocaleString("az-AZ")} AZN`;
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

function xmlEscape(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function groupSum(rows: ReportRow[], key: "event" | "type") {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row[key]] = (acc[row[key]] ?? 0) + row.amount;
    return acc;
  }, {});
}

function sheetXml(name: string, rows: Array<Array<string | number>>, numericColumns: number[] = []) {
  return `
    <Worksheet ss:Name="${xmlEscape(name)}">
      <Table>
        ${rows.map((row, rowIndex) => `
          <Row>
            ${row.map((cell, cellIndex) => {
              const isNumber = rowIndex > 0 && numericColumns.includes(cellIndex);
              return `<Cell${rowIndex === 0 ? ' ss:StyleID="Header"' : ""}><Data ss:Type="${isNumber ? "Number" : "String"}">${xmlEscape(cell)}</Data></Cell>`;
            }).join("")}
          </Row>
        `).join("")}
      </Table>
    </Worksheet>
  `;
}

function tableHtml(headers: string[], rows: string[][]) {
  return `<table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function barChartHtml(items: Array<{ label: string; value: number }>, title: string) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return `
    <section class="chart">
      <h2>${title}</h2>
      ${items.map((item) => `
        <div class="bar-row">
          <span>${item.label}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.max(4, Math.round((item.value / max) * 100))}%"></div></div>
          <strong>${money(item.value)}</strong>
        </div>
      `).join("")}
    </section>
  `;
}

export function ReportsManager({ events, tickets }: { events: EventItem[]; tickets: BuyerTicket[] }) {
  const [eventFilter, setEventFilter] = useState("all");
  const [period, setPeriod] = useState("2026 Q3");
  const [notice, setNotice] = useState("");
  const [plQuery, setPlQuery] = useState("");
  const [plProfitFilter, setPlProfitFilter] = useState("all");
  const [plOccupancyFilter, setPlOccupancyFilter] = useState("all");
  const [plPageSize, setPlPageSize] = useState(10);
  const [plPage, setPlPage] = useState(1);

  const ticketIncome = useMemo<ReportRow[]>(() => {
    const groups = tickets.reduce<Record<string, number>>((acc, ticket) => {
      if (ticket.status === "paid") acc[ticket.event] = (acc[ticket.event] ?? 0) + parseAmount(ticket.amount);
      return acc;
    }, {});
    return Object.entries(groups).map(([event, amount], index) => ({
      id: `INC-TKT-${index + 1}`,
      event,
      type: "Bilet satışı",
      source: "Checkout",
      amount,
      status: "Daxil olub",
    }));
  }, [tickets]);

  const incomeRows = [...ticketIncome, ...extraIncome];
  const selectedIncomeRows = incomeRows.filter((row) => eventFilter === "all" || row.event === eventFilter);
  const selectedExpenseRows = expenseRows.filter((row) => eventFilter === "all" || row.event === eventFilter);
  const selectedEvents = events.filter((event) => eventFilter === "all" || event.title === eventFilter);
  const totalIncome = selectedIncomeRows.reduce((sum, row) => sum + row.amount, 0);
  const totalExpense = selectedExpenseRows.reduce((sum, row) => sum + row.amount, 0);
  const profit = totalIncome - totalExpense;
  const margin = totalIncome ? Math.round((profit / totalIncome) * 100) : 0;
  const eventIncome = groupSum(selectedIncomeRows, "event");
  const eventExpense = groupSum(selectedExpenseRows, "event");
  const incomeByType = groupSum(selectedIncomeRows, "type");
  const expenseByType = groupSum(selectedExpenseRows, "type");

  const eventSummary = selectedEvents.map((event) => {
    const income = eventIncome[event.title] ?? 0;
    const expense = eventExpense[event.title] ?? 0;
    const occupancyRate = event.capacity ? Math.round((event.sold / event.capacity) * 100) : 0;
    return {
      event: event.title,
      income,
      expense,
      profit: income - expense,
      occupancy: `${event.sold}/${event.capacity}`,
      occupancyRate,
    };
  });

  const filteredEventSummary = eventSummary.filter((row) => {
    const matchesQuery = !plQuery.trim() || row.event.toLowerCase().includes(plQuery.trim().toLowerCase());
    const matchesProfit =
      plProfitFilter === "all" ||
      (plProfitFilter === "profit" && row.profit > 0) ||
      (plProfitFilter === "loss" && row.profit < 0) ||
      (plProfitFilter === "zero" && row.profit === 0);
    const matchesOccupancy =
      plOccupancyFilter === "all" ||
      (plOccupancyFilter === "high" && row.occupancyRate >= 80) ||
      (plOccupancyFilter === "mid" && row.occupancyRate >= 50 && row.occupancyRate < 80) ||
      (plOccupancyFilter === "low" && row.occupancyRate < 50);
    return matchesQuery && matchesProfit && matchesOccupancy;
  });
  const plTotalPages = Math.max(1, Math.ceil(filteredEventSummary.length / plPageSize));
  const safePlPage = Math.min(plPage, plTotalPages);
  const pagedEventSummary = filteredEventSummary.slice((safePlPage - 1) * plPageSize, safePlPage * plPageSize);

  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const reportHtml = () => {
    const eventRows = eventSummary.map((row) => [row.event, money(row.income), money(row.expense), money(row.profit), `${row.occupancy} (${row.occupancyRate}%)`]);
    const incomeRowsHtml = selectedIncomeRows.map((row) => [row.id, row.event, row.type, row.source, money(row.amount), row.status]);
    const expenseRowsHtml = selectedExpenseRows.map((row) => [row.id, row.event, row.type, row.source, money(row.amount), row.status]);
    const incomeChartItems = Object.entries(incomeByType).map(([label, value]) => ({ label, value }));
    const expenseChartItems = Object.entries(expenseByType).map(([label, value]) => ({ label, value }));

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>vEvent Mühasibatlıq Hesabatı</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;color:#151817;margin:32px;background:#fff}
            .header{display:flex;justify-content:space-between;gap:24px;border-bottom:3px solid #34a51d;padding-bottom:18px;margin-bottom:22px}
            .brand{font-size:28px;font-weight:800}.meta{text-align:right;color:#5b665f;font-size:13px;line-height:1.6}
            .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}
            .kpi{border:1px solid #d6e0da;border-radius:8px;padding:14px;background:#f7faf8}.kpi span{display:block;color:#68736c;font-size:12px}.kpi strong{display:block;font-size:22px;margin-top:8px}
            table{border-collapse:collapse;width:100%;margin:16px 0 26px;font-size:12px}th,td{border:1px solid #dfe8e2;padding:9px;text-align:left}th{background:#f7faf8}
            h1{font-size:24px;margin:0}h2{font-size:18px;margin:24px 0 10px}.chart{border:1px solid #d6e0da;border-radius:8px;padding:14px;margin:14px 0}
            .bar-row{display:grid;grid-template-columns:170px 1fr 110px;gap:12px;align-items:center;margin:10px 0;font-size:12px}
            .bar-track{height:14px;background:#eef3f0;border-radius:99px;overflow:hidden}.bar-fill{height:100%;background:#34a51d;border-radius:99px}
            @media print{body{margin:18mm}.no-print{display:none}.header{break-after:avoid}table,.chart{break-inside:avoid}}
          </style>
        </head>
        <body>
          <div class="header">
            <div><div class="brand">vEvent</div><h1>Mühasibatlıq hesabatı</h1></div>
            <div class="meta">Dövr: ${period}<br/>Tədbir: ${eventFilter === "all" ? "Bütün tədbirlər" : eventFilter}<br/>Hazırlanma: ${new Date().toLocaleString("az-AZ")}</div>
          </div>
          <section class="kpis">
            <div class="kpi"><span>Gəlir</span><strong>${money(totalIncome)}</strong></div>
            <div class="kpi"><span>Xərc</span><strong>${money(totalExpense)}</strong></div>
            <div class="kpi"><span>Mənfəət</span><strong>${money(profit)}</strong></div>
            <div class="kpi"><span>Marja</span><strong>${margin}%</strong></div>
          </section>
          ${barChartHtml(incomeChartItems, "Gəlir növləri üzrə bölgü")}
          ${barChartHtml(expenseChartItems, "Xərc növləri üzrə bölgü")}
          <h2>Tədbirlər üzrə P&L</h2>
          ${tableHtml(["Tədbir", "Gəlir", "Xərc", "Mənfəət", "Doluluq"], eventRows)}
          <h2>Gəlir detalları</h2>
          ${tableHtml(["ID", "Tədbir", "Gəlir növü", "Mənbə", "Məbləğ", "Status"], incomeRowsHtml)}
          <h2>Xərc detalları</h2>
          ${tableHtml(["ID", "Tədbir", "Xərc növü", "Vendor", "Məbləğ", "Status"], expenseRowsHtml)}
        </body>
      </html>
    `;
  };

  const excelXml = () => {
    const generatedAt = new Date().toLocaleString("az-AZ");
    const breakdownRows = [
      ["Bölmə", "Növ", "Məbləğ"],
      ...Object.entries(incomeByType).map(([type, amount]) => ["Gəlir", type, amount]),
      ...Object.entries(expenseByType).map(([type, amount]) => ["Xərc", type, amount]),
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
      <?mso-application progid="Excel.Sheet"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:html="http://www.w3.org/TR/REC-html40">
        <Styles>
          <Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#F7FAF8" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
        </Styles>
        ${sheetXml("Icmal", [
          ["Göstərici", "Dəyər"],
          ["Dövr", period],
          ["Tədbir", eventFilter === "all" ? "Bütün tədbirlər" : eventFilter],
          ["Hazırlanma", generatedAt],
          ["Gəlir", totalIncome],
          ["Xərc", totalExpense],
          ["Mənfəət", profit],
          ["Marja (%)", margin],
        ], [1])}
        ${sheetXml("P&L", [
          ["Tədbir", "Gəlir", "Xərc", "Mənfəət", "Doluluq", "Doluluq (%)"],
          ...eventSummary.map((row) => [row.event, row.income, row.expense, row.profit, row.occupancy, row.occupancyRate]),
        ], [1, 2, 3, 5])}
        ${sheetXml("Gelir detallari", [
          ["ID", "Tədbir", "Gəlir növü", "Mənbə", "Məbləğ", "Status"],
          ...selectedIncomeRows.map((row) => [row.id, row.event, row.type, row.source, row.amount, row.status]),
        ], [4])}
        ${sheetXml("Xerc detallari", [
          ["ID", "Tədbir", "Xərc növü", "Vendor", "Məbləğ", "Status"],
          ...selectedExpenseRows.map((row) => [row.id, row.event, row.type, row.source, row.amount, row.status]),
        ], [4])}
        ${sheetXml("Bolgu", breakdownRows, [2])}
      </Workbook>`;
  };

  const exportExcel = () => {
    exportFile("vevent-muhasibat-hesabati.xls", excelXml(), "application/vnd.ms-excel;charset=utf-8");
    showNotice("Excel hesabatı cədvəl formatında yaradıldı.");
  };

  const exportPdf = () => {
    const win = window.open("", "_blank", "width=1200,height=900");
    if (!win) {
      showNotice("PDF pəncərəsi bloklandı. Brauzerdə pop-up icazəsi ver.");
      return;
    }
    win.document.write(reportHtml());
    win.document.close();
    win.focus();
    window.setTimeout(() => win.print(), 350);
    showNotice("PDF üçün çap pəncərəsi açıldı.");
  };

  const exportCsv = () => {
    const rows = [
      ["Bölmə", "ID", "Tədbir", "Növ", "Mənbə/Vendor", "Məbləğ", "Status"],
      ...selectedIncomeRows.map((row) => ["Gəlir", row.id, row.event, row.type, row.source, money(row.amount), row.status]),
      ...selectedExpenseRows.map((row) => ["Xərc", row.id, row.event, row.type, row.source, money(row.amount), row.status]),
    ];
    exportFile("vevent-muhasibat-detallari.csv", rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n"), "text/csv;charset=utf-8");
    showNotice("CSV hesabatı yaradıldı.");
  };

  return (
    <div className="grid gap-6">
      {notice ? (
        <div className="fixed right-5 top-5 z-[70] rounded-lg border border-[#bde6c6] bg-[#e9f8ee] px-4 py-3 text-sm font-semibold text-[#106142] shadow-xl shadow-black/10">
          {notice}
        </div>
      ) : null}

      <section className="rounded-lg border border-[#d6e0da] bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto_auto_auto]">
          <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm" onChange={(event) => setEventFilter(event.target.value)} value={eventFilter}>
            <option value="all">Bütün tədbirlər</option>
            {events.map((event) => <option key={event.title}>{event.title}</option>)}
          </select>
          <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm" onChange={(event) => setPeriod(event.target.value)} value={period}>
            {["2026 Q1", "2026 Q2", "2026 Q3", "2026 Q4", "2026 Tam il", "Bütün dövr"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="h-11 rounded-lg bg-[#101510] px-4 text-sm font-semibold text-white" onClick={exportPdf} type="button">PDF</button>
          <button className="h-11 rounded-lg border border-[#c8d6ce] px-4 text-sm font-semibold" onClick={exportExcel} type="button">Excel</button>
          <button className="h-11 rounded-lg border border-[#c8d6ce] px-4 text-sm font-semibold" onClick={exportCsv} type="button">CSV</button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Gəlir", money(totalIncome)],
          ["Xərc", money(totalExpense)],
          ["Mənfəət", money(profit)],
          ["Marja", `${margin}%`],
        ].map(([label, value]) => (
          <article className="rounded-lg border border-black/10 bg-white p-5" key={label}>
            <p className="text-sm text-[#68736c]">{label}</p>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Gəlir növləri üzrə bölgü" items={Object.entries(incomeByType)} total={totalIncome} color="#34a51d" />
        <ChartCard title="Xərc növləri üzrə bölgü" items={Object.entries(expenseByType)} total={totalExpense} color="#151817" />
      </section>

      <article className="overflow-hidden rounded-lg border border-[#d6e0da] bg-white">
        <div className="border-b border-[#d6e0da] px-5 py-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm text-[#68736c]">Tədbirlər üzrə P&L</p>
              <h2 className="text-xl font-semibold">Gəlir, xərc, mənfəət və doluluq</h2>
            </div>
            <span className="rounded-lg bg-[#eef3f0] px-3 py-1 text-sm font-semibold text-[#4d5752]">
              {filteredEventSummary.length} tədbir
            </span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_160px]">
            <input
              className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm outline-none focus:border-[#34a51d] focus:ring-2 focus:ring-[#34a51d]/15"
              onChange={(event) => {
                setPlQuery(event.target.value);
                setPlPage(1);
              }}
              placeholder="Tədbir adı ilə axtar"
              value={plQuery}
            />
            <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm" onChange={(event) => { setPlProfitFilter(event.target.value); setPlPage(1); }} value={plProfitFilter}>
              <option value="all">Mənfəət: hamısı</option>
              <option value="profit">Mənfəətli</option>
              <option value="loss">Zərərdə</option>
              <option value="zero">Sıfır nəticə</option>
            </select>
            <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm" onChange={(event) => { setPlOccupancyFilter(event.target.value); setPlPage(1); }} value={plOccupancyFilter}>
              <option value="all">Doluluq: hamısı</option>
              <option value="high">80%+</option>
              <option value="mid">50-79%</option>
              <option value="low">50%-dən az</option>
            </select>
            <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm" onChange={(event) => { setPlPageSize(Number(event.target.value)); setPlPage(1); }} value={plPageSize}>
              {[5, 10, 25, 50].map((count) => <option key={count} value={count}>{count} / səhifə</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-[#f7faf8]">
                {["Tədbir", "Gəlir", "Xərc", "Mənfəət", "Doluluq"].map((header) => (
                  <th className="border-b border-r border-[#dfe8e2] px-4 py-3 font-semibold first:border-l" key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedEventSummary.map((row) => (
                <tr className="bg-white hover:bg-[#f9fbfa]" key={row.event}>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3 first:border-l font-semibold">{row.event}</td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">{money(row.income)}</td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">{money(row.expense)}</td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3 font-semibold">{money(row.profit)}</td>
                  <td className="border-b border-r border-[#e6eee9] px-4 py-3">{row.occupancy} · {row.occupancyRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-[#d6e0da] px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-[#68736c]">
            Səhifə {safePlPage}/{plTotalPages} · {filteredEventSummary.length} nəticədən {pagedEventSummary.length} göstərilir
          </p>
          <div className="flex gap-2">
            <button className="rounded-lg border border-[#c8d6ce] px-4 py-2 text-sm font-semibold disabled:opacity-40" disabled={safePlPage <= 1} onClick={() => setPlPage((current) => Math.max(1, current - 1))} type="button">
              Əvvəlki
            </button>
            <button className="rounded-lg border border-[#c8d6ce] px-4 py-2 text-sm font-semibold disabled:opacity-40" disabled={safePlPage >= plTotalPages} onClick={() => setPlPage((current) => Math.min(plTotalPages, current + 1))} type="button">
              Növbəti
            </button>
          </div>
        </div>
      </article>

      <section className="grid gap-5">
        <DetailTable title="Gəlir detalları" rows={selectedIncomeRows} amountLabel="Məbləğ" />
        <DetailTable title="Xərc detalları" rows={selectedExpenseRows} amountLabel="Məbləğ" />
      </section>
    </div>
  );
}

function ChartCard({ color, items, title, total }: { color: string; items: Array<[string, number]>; title: string; total: number }) {
  return (
    <article className="rounded-lg border border-[#d6e0da] bg-white p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map(([label, value]) => (
          <div className="grid gap-2" key={label}>
            <div className="flex justify-between gap-3 text-sm"><span>{label}</span><strong>{money(value)}</strong></div>
            <div className="h-3 overflow-hidden rounded-full bg-[#eef3f0]"><div className="h-full rounded-full" style={{ background: color, width: `${Math.max(4, Math.round((value / Math.max(total, 1)) * 100))}%` }} /></div>
          </div>
        ))}
      </div>
    </article>
  );
}

function DetailTable({ amountLabel, rows, title }: { amountLabel: string; rows: ReportRow[]; title: string }) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#d6e0da] bg-white">
      <div className="border-b border-[#d6e0da] px-5 py-4">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-[#f7faf8]">
              {["ID", "Tədbir", "Növ", "Mənbə/Vendor", amountLabel, "Status"].map((header) => (
                <th className="border-b border-r border-[#dfe8e2] px-4 py-3 font-semibold first:border-l" key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="bg-white hover:bg-[#f9fbfa]" key={row.id}>
                <td className="border-b border-r border-[#e6eee9] px-4 py-3 first:border-l font-semibold">{row.id}</td>
                <td className="border-b border-r border-[#e6eee9] px-4 py-3">{row.event}</td>
                <td className="border-b border-r border-[#e6eee9] px-4 py-3">{row.type}</td>
                <td className="border-b border-r border-[#e6eee9] px-4 py-3">{row.source}</td>
                <td className="border-b border-r border-[#e6eee9] px-4 py-3 font-semibold">{money(row.amount)}</td>
                <td className="border-b border-r border-[#e6eee9] px-4 py-3">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
