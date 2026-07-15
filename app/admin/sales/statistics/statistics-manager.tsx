"use client";

import { useMemo, useState } from "react";

type EventItem = {
  title: string;
  date: string;
  format: string;
  sold: number;
  capacity: number;
};

type BuyerTicket = {
  event: string;
  ticket: string;
  amount: string;
  status: string;
};

type FinanceModule = "overview" | "expenses" | "income";
type TypeStatus = "Aktiv" | "Passiv";

type FinanceType = {
  id: string;
  name: string;
  status: TypeStatus;
  scope: string;
};

type ExpenseRow = {
  id: string;
  event: string;
  type: string;
  vendor: string;
  amount: number;
  status: "Planlanıb" | "Təsdiqlənib" | "Ödənilib";
  date: string;
};

type IncomeRow = {
  id: string;
  event: string;
  type: string;
  source: string;
  amount: number;
  status: "Gözləmədə" | "Təsdiqlənib" | "Daxil olub";
  date: string;
};

const expenseTypeSeed: FinanceType[] = [
  { id: "EXT-1", name: "Məkan", status: "Aktiv", scope: "Fiziki tədbirlər" },
  { id: "EXT-2", name: "Catering", status: "Aktiv", scope: "Fiziki tədbirlər" },
  { id: "EXT-3", name: "Texniki avadanlıq", status: "Aktiv", scope: "Hibrid və fiziki" },
  { id: "EXT-4", name: "Reklam", status: "Aktiv", scope: "Bütün tədbirlər" },
  { id: "EXT-5", name: "Spiker honorarı", status: "Aktiv", scope: "Konfrans və seminar" },
  { id: "EXT-6", name: "Dizayn/çap", status: "Aktiv", scope: "Bütün tədbirlər" },
];

const incomeTypeSeed: FinanceType[] = [
  { id: "INT-1", name: "Bilet satışı", status: "Aktiv", scope: "Bütün tədbirlər" },
  { id: "INT-2", name: "Sponsor gəliri", status: "Aktiv", scope: "Sponsor paketləri" },
  { id: "INT-3", name: "Sərgi stendi", status: "Aktiv", scope: "Expo / networking" },
  { id: "INT-4", name: "Online replay", status: "Aktiv", scope: "Online tədbirlər" },
  { id: "INT-5", name: "Korporativ paket", status: "Aktiv", scope: "B2B satış" },
];

const expenseSeed: ExpenseRow[] = [
  { id: "EXP-301", event: "AI & Finance Summit 2026", type: "Məkan", vendor: "Baku Convention Center", amount: 4500, status: "Təsdiqlənib", date: "10 İyul 2026" },
  { id: "EXP-302", event: "AI & Finance Summit 2026", type: "Texniki avadanlıq", vendor: "AV Pro", amount: 2200, status: "Ödənilib", date: "11 İyul 2026" },
  { id: "EXP-303", event: "Marketing Data Lab", type: "Reklam", vendor: "Meta Ads", amount: 1400, status: "Ödənilib", date: "12 İyul 2026" },
  { id: "EXP-304", event: "Fintech Founders Meetup 2025", type: "Catering", vendor: "Event Cafe", amount: 520, status: "Ödənilib", date: "20 Noyabr 2025" },
];

const incomeSeed: IncomeRow[] = [
  { id: "INC-502", event: "AI & Finance Summit 2026", type: "Sponsor gəliri", source: "Fintech Partner", amount: 5000, status: "Təsdiqlənib", date: "15 İyul 2026" },
  { id: "INC-503", event: "Marketing Data Lab", type: "Online replay", source: "Replay satış", amount: 350, status: "Gözləmədə", date: "13 İyul 2026" },
  { id: "INC-504", event: "Fintech Founders Meetup 2025", type: "Sponsor gəliri", source: "Valyuta.az", amount: 2600, status: "Daxil olub", date: "22 Noyabr 2025" },
];

function parseAmount(amount: string) {
  return Number(amount.replace(/[^\d.]/g, "")) || 0;
}

function money(value: number) {
  return `${value.toLocaleString("az-AZ")} AZN`;
}

function downloadCsv(filename: string, rows: string[][]) {
  const blob = new Blob([rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildTicketIncome(tickets: BuyerTicket[]): IncomeRow[] {
  const groups = tickets.reduce<Record<string, BuyerTicket[]>>((acc, ticket) => {
    acc[ticket.event] = [...(acc[ticket.event] ?? []), ticket];
    return acc;
  }, {});

  return Object.entries(groups).map(([event, items], index) => {
    const amount = items
      .filter((ticket) => ticket.status === "paid")
      .reduce((sum, ticket) => sum + parseAmount(ticket.amount), 0);
    return {
      id: `INC-TKT-${index + 1}`,
      event,
      type: "Bilet satışı",
      source: "Checkout",
      amount,
      status: amount > 0 ? "Daxil olub" : "Gözləmədə",
      date: "13 İyul 2026",
    };
  });
}

export function SalesStatisticsManager({
  events,
  initialModule = "overview",
  tickets,
}: {
  events: EventItem[];
  initialModule?: FinanceModule;
  tickets: BuyerTicket[];
}) {
  const [activeModule, setActiveModule] = useState<FinanceModule>(initialModule);
  const [expenseTypes, setExpenseTypes] = useState(expenseTypeSeed);
  const [incomeTypes, setIncomeTypes] = useState(incomeTypeSeed);
  const [expenseRows, setExpenseRows] = useState(expenseSeed);
  const [incomeRows, setIncomeRows] = useState(() => [
    ...buildTicketIncome(tickets),
    ...incomeSeed,
  ]);
  const [eventFilter, setEventFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [expenseDraft, setExpenseDraft] = useState({
    event: events[0]?.title ?? "",
    type: "Məkan",
    vendor: "",
    amount: "",
    status: "Planlanıb" as ExpenseRow["status"],
  });
  const [incomeDraft, setIncomeDraft] = useState({
    event: events[0]?.title ?? "",
    type: "Sponsor gəliri",
    source: "",
    amount: "",
    status: "Gözləmədə" as IncomeRow["status"],
  });
  const [expenseTypeDraft, setExpenseTypeDraft] = useState({ name: "", scope: "Bütün tədbirlər" });
  const [incomeTypeDraft, setIncomeTypeDraft] = useState({ name: "", scope: "Bütün tədbirlər" });

  const eventOptions = useMemo(() => events.map((event) => event.title), [events]);
  const activeExpenseTypes = expenseTypes.filter((type) => type.status === "Aktiv");
  const activeIncomeTypes = incomeTypes.filter((type) => type.status === "Aktiv");
  const currentTypeList = activeModule === "expenses" ? expenseTypes : incomeTypes;
  const currentActiveTypeNames =
    activeModule === "expenses"
      ? activeExpenseTypes.map((type) => type.name)
      : activeIncomeTypes.map((type) => type.name);

  const totalIncome = incomeRows
    .filter((row) => row.status !== "Gözləmədə")
    .reduce((sum, row) => sum + row.amount, 0);
  const totalExpenses = expenseRows
    .filter((row) => row.status !== "Planlanıb")
    .reduce((sum, row) => sum + row.amount, 0);
  const profit = totalIncome - totalExpenses;
  const margin = totalIncome ? Math.round((profit / totalIncome) * 100) : 0;

  const filteredExpenses = expenseRows.filter((row) => {
    const matchesEvent = eventFilter === "all" || row.event === eventFilter;
    const matchesType = typeFilter === "all" || row.type === typeFilter;
    const matchesQuery =
      !query.trim() ||
      [row.id, row.vendor, row.event, row.type].join(" ").toLowerCase().includes(query.trim().toLowerCase());
    return matchesEvent && matchesType && matchesQuery;
  });

  const filteredIncome = incomeRows.filter((row) => {
    const matchesEvent = eventFilter === "all" || row.event === eventFilter;
    const matchesType = typeFilter === "all" || row.type === typeFilter;
    const matchesQuery =
      !query.trim() ||
      [row.id, row.source, row.event, row.type].join(" ").toLowerCase().includes(query.trim().toLowerCase());
    return matchesEvent && matchesType && matchesQuery;
  });

  const eventSummary = useMemo(() => {
    return eventOptions.map((event) => {
      const income = incomeRows
        .filter((row) => row.event === event && row.status !== "Gözləmədə")
        .reduce((sum, row) => sum + row.amount, 0);
      const expenses = expenseRows
        .filter((row) => row.event === event && row.status !== "Planlanıb")
        .reduce((sum, row) => sum + row.amount, 0);
      return { event, income, expenses, profit: income - expenses };
    });
  }, [eventOptions, expenseRows, incomeRows]);

  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const switchModule = (module: FinanceModule) => {
    setActiveModule(module);
    setEventFilter("all");
    setTypeFilter("all");
    setQuery("");
  };

  const addExpenseType = () => {
    const name = expenseTypeDraft.name.trim();
    if (!name || expenseTypes.some((type) => type.name.toLowerCase() === name.toLowerCase())) {
      showNotice("Xərc növü üçün unikal ad yaz.");
      return;
    }
    setExpenseTypes((current) => [
      { id: `EXT-${current.length + 1}`, name, scope: expenseTypeDraft.scope, status: "Aktiv" },
      ...current,
    ]);
    setExpenseDraft((current) => ({ ...current, type: name }));
    setExpenseTypeDraft({ name: "", scope: "Bütün tədbirlər" });
    showNotice(`${name} xərc növü yaradıldı.`);
  };

  const addIncomeType = () => {
    const name = incomeTypeDraft.name.trim();
    if (!name || incomeTypes.some((type) => type.name.toLowerCase() === name.toLowerCase())) {
      showNotice("Gəlir növü üçün unikal ad yaz.");
      return;
    }
    setIncomeTypes((current) => [
      { id: `INT-${current.length + 1}`, name, scope: incomeTypeDraft.scope, status: "Aktiv" },
      ...current,
    ]);
    setIncomeDraft((current) => ({ ...current, type: name }));
    setIncomeTypeDraft({ name: "", scope: "Bütün tədbirlər" });
    showNotice(`${name} gəlir növü yaradıldı.`);
  };

  const toggleTypeStatus = (module: "expenses" | "income", id: string) => {
    const toggle = (type: FinanceType) =>
      type.id === id ? { ...type, status: type.status === "Aktiv" ? "Passiv" : "Aktiv" } : type;
    if (module === "expenses") setExpenseTypes((current) => current.map(toggle));
    if (module === "income") setIncomeTypes((current) => current.map(toggle));
    showNotice("Növ statusu yeniləndi.");
  };

  const addExpense = () => {
    if (!expenseDraft.vendor.trim() || !expenseDraft.amount.trim()) {
      showNotice("Xərc üçün vendor və məbləğ yaz.");
      return;
    }
    setExpenseRows((current) => [
      {
        id: `EXP-${400 + current.length}`,
        event: expenseDraft.event,
        type: expenseDraft.type,
        vendor: expenseDraft.vendor,
        amount: Number(expenseDraft.amount) || 0,
        status: expenseDraft.status,
        date: "13 İyul 2026",
      },
      ...current,
    ]);
    setExpenseDraft((current) => ({ ...current, vendor: "", amount: "" }));
    showNotice("Yeni xərc qeydi əlavə edildi.");
  };

  const addIncome = () => {
    if (!incomeDraft.source.trim() || !incomeDraft.amount.trim()) {
      showNotice("Gəlir üçün mənbə və məbləğ yaz.");
      return;
    }
    setIncomeRows((current) => [
      {
        id: `INC-${600 + current.length}`,
        event: incomeDraft.event,
        type: incomeDraft.type,
        source: incomeDraft.source,
        amount: Number(incomeDraft.amount) || 0,
        status: incomeDraft.status,
        date: "13 İyul 2026",
      },
      ...current,
    ]);
    setIncomeDraft((current) => ({ ...current, source: "", amount: "" }));
    showNotice("Yeni gəlir qeydi əlavə edildi.");
  };

  const exportCurrent = () => {
    if (activeModule === "expenses") {
      downloadCsv("xercler.csv", [
        ["ID", "Tədbir", "Xərc növü", "Vendor", "Məbləğ", "Status", "Tarix"],
        ...filteredExpenses.map((row) => [row.id, row.event, row.type, row.vendor, money(row.amount), row.status, row.date]),
      ]);
      showNotice("Xərclər CSV olaraq hazırlandı.");
      return;
    }
    if (activeModule === "income") {
      downloadCsv("gelirler.csv", [
        ["ID", "Tədbir", "Gəlir növü", "Mənbə", "Məbləğ", "Status", "Tarix"],
        ...filteredIncome.map((row) => [row.id, row.event, row.type, row.source, money(row.amount), row.status, row.date]),
      ]);
      showNotice("Gəlirlər CSV olaraq hazırlandı.");
      return;
    }
    downloadCsv("muhasibat-icmal.csv", [
      ["Tədbir", "Gəlir", "Xərc", "Mənfəət"],
      ...eventSummary.map((row) => [row.event, money(row.income), money(row.expenses), money(row.profit)]),
    ]);
    showNotice("İcmal hesabatı CSV olaraq hazırlandı.");
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
          ["Gəlir", money(totalIncome)],
          ["Xərc", money(totalExpenses)],
          ["Mənfəət", money(profit)],
          ["Marja", `${margin}%`],
        ].map(([label, value]) => (
          <article className="rounded-lg border border-black/10 bg-white p-5" key={label}>
            <p className="text-sm text-[#68736c]">{label}</p>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </article>
        ))}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d6e0da] bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {[
            ["overview", "İcmal"],
            ["income", "Gəlirlər"],
            ["expenses", "Xərclər"],
          ].map(([key, label]) => (
            <button
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeModule === key
                  ? "bg-[#34a51d] text-white"
                  : "border border-[#d6e0da] bg-white hover:border-[#34a51d]"
              }`}
              key={key}
              onClick={() => switchModule(key as FinanceModule)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={exportCurrent} type="button">
          CSV export
        </button>
      </section>

      {activeModule === "overview" ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <article className="overflow-hidden rounded-lg border border-[#d6e0da] bg-white">
            <div className="border-b border-[#d6e0da] px-5 py-4">
              <p className="text-sm text-[#68736c]">Tədbirlər üzrə xülasə</p>
              <h2 className="text-xl font-semibold">Gəlir, xərc və mənfəət</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="bg-[#f7faf8]">
                    {["Tədbir", "Gəlir", "Xərc", "Mənfəət"].map((header) => (
                      <th className="border-b border-r border-[#dfe8e2] px-4 py-3 font-semibold first:border-l" key={header}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eventSummary.map((item) => (
                    <tr className="bg-white hover:bg-[#f9fbfa]" key={item.event}>
                      <td className="border-b border-r border-[#e6eee9] px-4 py-3 first:border-l"><strong>{item.event}</strong></td>
                      <td className="border-b border-r border-[#e6eee9] px-4 py-3">{money(item.income)}</td>
                      <td className="border-b border-r border-[#e6eee9] px-4 py-3">{money(item.expenses)}</td>
                      <td className="border-b border-r border-[#e6eee9] px-4 py-3 font-semibold">{money(item.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="rounded-lg border border-[#d6e0da] bg-white p-5">
            <p className="text-sm text-[#68736c]">Ən çox qazandıranlar</p>
            <h2 className="mt-1 text-xl font-semibold">Top tədbirlər</h2>
            <div className="mt-4 grid gap-3">
              {[...eventSummary]
                .sort((a, b) => b.profit - a.profit)
                .slice(0, 5)
                .map((item, index) => (
                  <div className="rounded-lg border border-[#dfe8e2] p-3" key={item.event}>
                    <div className="flex items-start justify-between gap-3">
                      <strong>{index + 1}. {item.event}</strong>
                      <span className="font-semibold">{money(item.profit)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </aside>
        </section>
      ) : null}

      {activeModule !== "overview" ? (
        <>
          <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-lg border border-[#d6e0da] bg-white p-5">
              <div className="mb-4">
                <p className="text-sm text-[#68736c]">
                  {activeModule === "expenses" ? "Xərc növləri" : "Gəlir növləri"}
                </p>
                <h2 className="text-xl font-semibold">
                  {activeModule === "expenses" ? "Yeni xərc növü yarat" : "Yeni gəlir növü yarat"}
                </h2>
              </div>
              {activeModule === "expenses" ? (
                <div className="grid gap-3">
                  <input className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" onChange={(event) => setExpenseTypeDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Məsələn: Foto/video çəkiliş" value={expenseTypeDraft.name} />
                  <input className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" onChange={(event) => setExpenseTypeDraft((current) => ({ ...current, scope: event.target.value }))} placeholder="İstifadə sahəsi" value={expenseTypeDraft.scope} />
                  <button className="h-11 rounded-lg bg-[#101510] px-4 text-sm font-semibold text-white" onClick={addExpenseType} type="button">Növ yarat</button>
                </div>
              ) : (
                <div className="grid gap-3">
                  <input className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" onChange={(event) => setIncomeTypeDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Məsələn: VIP masa satışı" value={incomeTypeDraft.name} />
                  <input className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" onChange={(event) => setIncomeTypeDraft((current) => ({ ...current, scope: event.target.value }))} placeholder="İstifadə sahəsi" value={incomeTypeDraft.scope} />
                  <button className="h-11 rounded-lg bg-[#101510] px-4 text-sm font-semibold text-white" onClick={addIncomeType} type="button">Növ yarat</button>
                </div>
              )}
            </article>

            <article className="overflow-hidden rounded-lg border border-[#d6e0da] bg-white">
              <div className="border-b border-[#d6e0da] px-5 py-4">
                <p className="text-sm text-[#68736c]">
                  {activeModule === "expenses" ? "Xərc növləri siyahısı" : "Gəlir növləri siyahısı"}
                </p>
                <h2 className="text-xl font-semibold">Növlər</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left text-sm">
                  <thead>
                    <tr className="bg-[#f7faf8]">
                      {["Növ", "İstifadə sahəsi", "Status", "Əməliyyat"].map((header) => (
                        <th className="border-b border-r border-[#dfe8e2] px-4 py-3 font-semibold first:border-l" key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTypeList.map((type) => (
                      <tr className="bg-white hover:bg-[#f9fbfa]" key={type.id}>
                        <td className="border-b border-r border-[#e6eee9] px-4 py-3 first:border-l font-semibold">{type.name}</td>
                        <td className="border-b border-r border-[#e6eee9] px-4 py-3">{type.scope}</td>
                        <td className="border-b border-r border-[#e6eee9] px-4 py-3">{type.status}</td>
                        <td className="border-b border-r border-[#e6eee9] px-4 py-3">
                          <button className="rounded-lg border border-[#c8d6ce] px-3 py-2 text-xs font-semibold hover:border-[#34a51d]" onClick={() => toggleTypeStatus(activeModule, type.id)} type="button">
                            {type.status === "Aktiv" ? "Passiv et" : "Aktiv et"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <section className="rounded-lg border border-[#d6e0da] bg-white p-5">
            <div className="mb-4">
              <p className="text-sm text-[#68736c]">{activeModule === "expenses" ? "Xərc əlavə et" : "Gəlir əlavə et"}</p>
              <h2 className="text-xl font-semibold">{activeModule === "expenses" ? "Yeni xərc kartı" : "Yeni gəlir kartı"}</h2>
            </div>
            {activeModule === "expenses" ? (
              <div className="grid gap-3 lg:grid-cols-[1fr_180px_1fr_140px_150px_auto]">
                <select className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" onChange={(event) => setExpenseDraft((current) => ({ ...current, event: event.target.value }))} value={expenseDraft.event}>{eventOptions.map((event) => <option key={event}>{event}</option>)}</select>
                <select className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" onChange={(event) => setExpenseDraft((current) => ({ ...current, type: event.target.value }))} value={expenseDraft.type}>{activeExpenseTypes.map((type) => <option key={type.id}>{type.name}</option>)}</select>
                <input className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" onChange={(event) => setExpenseDraft((current) => ({ ...current, vendor: event.target.value }))} placeholder="Vendor / təchizatçı" value={expenseDraft.vendor} />
                <input className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" inputMode="numeric" onChange={(event) => setExpenseDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="AZN" value={expenseDraft.amount} />
                <select className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" onChange={(event) => setExpenseDraft((current) => ({ ...current, status: event.target.value as ExpenseRow["status"] }))} value={expenseDraft.status}>{["Planlanıb", "Təsdiqlənib", "Ödənilib"].map((status) => <option key={status}>{status}</option>)}</select>
                <button className="h-11 rounded-lg bg-[#34a51d] px-4 text-sm font-semibold text-white" onClick={addExpense} type="button">Əlavə et</button>
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-[1fr_180px_1fr_140px_150px_auto]">
                <select className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" onChange={(event) => setIncomeDraft((current) => ({ ...current, event: event.target.value }))} value={incomeDraft.event}>{eventOptions.map((event) => <option key={event}>{event}</option>)}</select>
                <select className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" onChange={(event) => setIncomeDraft((current) => ({ ...current, type: event.target.value }))} value={incomeDraft.type}>{activeIncomeTypes.map((type) => <option key={type.id}>{type.name}</option>)}</select>
                <input className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" onChange={(event) => setIncomeDraft((current) => ({ ...current, source: event.target.value }))} placeholder="Mənbə / sponsor / kanal" value={incomeDraft.source} />
                <input className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" inputMode="numeric" onChange={(event) => setIncomeDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="AZN" value={incomeDraft.amount} />
                <select className="h-11 rounded-lg border border-[#d6e0da] px-3 text-sm" onChange={(event) => setIncomeDraft((current) => ({ ...current, status: event.target.value as IncomeRow["status"] }))} value={incomeDraft.status}>{["Gözləmədə", "Təsdiqlənib", "Daxil olub"].map((status) => <option key={status}>{status}</option>)}</select>
                <button className="h-11 rounded-lg bg-[#34a51d] px-4 text-sm font-semibold text-white" onClick={addIncome} type="button">Əlavə et</button>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-[#d6e0da] bg-white p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_220px]">
              <input className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm" onChange={(event) => setQuery(event.target.value)} placeholder="Axtar" value={query} />
              <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm" onChange={(event) => setEventFilter(event.target.value)} value={eventFilter}>
                <option value="all">Tədbir: hamısı</option>
                {eventOptions.map((event) => <option key={event}>{event}</option>)}
              </select>
              <select className="h-11 rounded-lg border border-[#d6e0da] px-4 text-sm" onChange={(event) => setTypeFilter(event.target.value)} value={typeFilter}>
                <option value="all">Növ: hamısı</option>
                {currentActiveTypeNames.map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
          </section>

          <article className="overflow-hidden rounded-lg border border-[#d6e0da] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d6e0da] px-5 py-4">
              <div>
                <p className="text-sm text-[#68736c]">{activeModule === "expenses" ? "Xərclər cədvəli" : "Gəlirlər cədvəli"}</p>
                <h2 className="text-xl font-semibold">{activeModule === "expenses" ? "Tədbir üzrə xərclər" : "Tədbir üzrə gəlirlər"}</h2>
              </div>
              <span className="rounded-lg bg-[#eef3f0] px-3 py-1 text-sm font-semibold text-[#4d5752]">
                {activeModule === "expenses" ? filteredExpenses.length : filteredIncome.length} qeyd
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="bg-[#f7faf8]">
                    {(activeModule === "expenses" ? ["ID", "Tədbir", "Xərc növü", "Vendor", "Məbləğ", "Status", "Tarix"] : ["ID", "Tədbir", "Gəlir növü", "Mənbə", "Məbləğ", "Status", "Tarix"]).map((header) => (
                      <th className="border-b border-r border-[#dfe8e2] px-4 py-3 font-semibold first:border-l" key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(activeModule === "expenses" ? filteredExpenses : filteredIncome).map((row) => (
                    <tr className="bg-white hover:bg-[#f9fbfa]" key={row.id}>
                      <td className="border-b border-r border-[#e6eee9] px-4 py-3 first:border-l font-semibold">{row.id}</td>
                      <td className="border-b border-r border-[#e6eee9] px-4 py-3">{row.event}</td>
                      <td className="border-b border-r border-[#e6eee9] px-4 py-3">{row.type}</td>
                      <td className="border-b border-r border-[#e6eee9] px-4 py-3">{"vendor" in row ? row.vendor : row.source}</td>
                      <td className="border-b border-r border-[#e6eee9] px-4 py-3 font-semibold">{money(row.amount)}</td>
                      <td className="border-b border-r border-[#e6eee9] px-4 py-3">{row.status}</td>
                      <td className="border-b border-r border-[#e6eee9] px-4 py-3">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </>
      ) : null}
    </div>
  );
}
