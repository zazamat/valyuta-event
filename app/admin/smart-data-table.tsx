"use client";

import { useMemo, useState } from "react";

type SmartColumn = {
  key: string;
  label: string;
  width?: string;
  badge?: boolean;
};

type SmartFilter = {
  key: string;
  label: string;
  options: string[];
};

type SmartRow = Record<string, string>;

type SmartDataTableProps = {
  title: string;
  eyebrow: string;
  description: string;
  rows: SmartRow[];
  columns: SmartColumn[];
  filters: SmartFilter[];
};

const statusStyles: Record<string, string> = {
  paid: "bg-[#e9f8ee] text-[#106142] ring-[#bde6c6]",
  awaiting_payment: "bg-[#fff6df] text-[#8a5a00] ring-[#f1d58d]",
  cancelled: "bg-[#fff0ed] text-[#b42318] ring-[#ffc9bf]",
  checked_in: "bg-[#e9f8ee] text-[#106142] ring-[#bde6c6]",
};

function exportFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function rowsToSeparatedValues(rows: SmartRow[], columns: SmartColumn[], separator: string) {
  const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const header = columns.map((column) => escapeCell(column.label)).join(separator);
  const body = rows
    .map((row) => columns.map((column) => escapeCell(row[column.key] ?? "")).join(separator))
    .join("\n");

  return [header, body].filter(Boolean).join("\n");
}

export function SmartDataTable({
  title,
  eyebrow,
  description,
  rows,
  columns,
  filters,
}: SmartDataTableProps) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(columns.map((column) => column.key));
  const [columnOrder, setColumnOrder] = useState(columns.map((column) => column.key));
  const [limit, setLimit] = useState(25);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const orderedColumns = useMemo(
    () =>
      columnOrder
        .map((key) => columns.find((column) => column.key === key))
        .filter((column): column is SmartColumn => Boolean(column)),
    [columnOrder, columns],
  );

  const visibleColumns = orderedColumns.filter((column) => visibleColumnKeys.includes(column.key));

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !query ||
        columns.some((column) => (row[column.key] ?? "").toLowerCase().includes(query));

      const matchesFilters = filters.every((filter) => {
        const selected = filterValues[filter.key];
        return !selected || selected === "all" || row[filter.key] === selected;
      });

      return matchesSearch && matchesFilters;
    });
  }, [columns, filterValues, filters, rows, search]);

  const displayedRows = filteredRows.slice(0, limit);
  const tableColumns = visibleColumns.length ? visibleColumns : orderedColumns.slice(0, 1);

  const moveColumn = (key: string, direction: -1 | 1) => {
    setColumnOrder((current) => {
      const index = current.indexOf(key);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);

      return next;
    });
  };

  const exportRows = (format: "copy" | "csv" | "excel" | "pdf" | "map") => {
    const safeTitle = title.toLowerCase().replaceAll(" ", "-");

    if (format === "copy") {
      navigator.clipboard?.writeText(rowsToSeparatedValues(filteredRows, tableColumns, "\t"));
    }

    if (format === "csv") {
      exportFile(`${safeTitle}.csv`, rowsToSeparatedValues(filteredRows, tableColumns, ","), "text/csv");
    }

    if (format === "excel") {
      const html = `<table>${filteredRows
        .map(
          (row) =>
            `<tr>${tableColumns
              .map((column) => `<td>${row[column.key] ?? ""}</td>`)
              .join("")}</tr>`,
        )
        .join("")}</table>`;
      exportFile(`${safeTitle}.xls`, html, "application/vnd.ms-excel");
    }

    if (format === "map") {
      exportFile(`${safeTitle}.json`, JSON.stringify(filteredRows, null, 2), "application/json");
    }

    if (format === "pdf") {
      window.print();
    }

    setIsExportOpen(false);
  };

  return (
    <section className="mt-6">
      <div className="mb-5">
        <p className="text-sm font-medium uppercase tracking-[0.08em] text-[#68736c]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-[#151817]">{title}</h2>
        <p className="mt-2 text-sm text-[#5b665f]">{description}</p>
      </div>

      <div className="rounded-lg border border-[#d6e0da] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-4">
          <label className="lg:col-span-1">
            <span className="sr-only">Axtarış</span>
            <input
              className="h-11 w-full rounded-lg border border-[#d6e0da] bg-white px-4 text-sm outline-none transition focus:border-[#34a51d] focus:ring-2 focus:ring-[#34a51d]/15"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ad, email, telefon və ya kod axtar"
              value={search}
            />
          </label>
          {filters.map((filter) => (
            <label key={filter.key}>
              <span className="sr-only">{filter.label}</span>
              <select
                className="h-11 w-full rounded-lg border border-[#d6e0da] bg-white px-4 text-sm outline-none transition focus:border-[#34a51d] focus:ring-2 focus:ring-[#34a51d]/15"
                onChange={(event) =>
                  setFilterValues((current) => ({ ...current, [filter.key]: event.target.value }))
                }
                value={filterValues[filter.key] ?? "all"}
              >
                <option value="all">{filter.label}: hamısı</option>
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[#d6e0da] bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d6e0da] px-4 py-3 lg:flex-row lg:items-center">
          <p className="text-sm text-[#4d5752]">
            Tapıldı: <strong className="text-[#151817]">{filteredRows.length}</strong> qeyd
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-[#4d5752]">
              Göstər
              <select
                className="h-10 rounded-lg border border-[#d6e0da] bg-white px-3 text-sm font-medium"
                onChange={(event) => setLimit(Number(event.target.value))}
                value={limit}
              >
                {[10, 25, 50, 100].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="h-10 rounded-lg border border-[#c8d6ce] bg-white px-4 text-sm font-semibold text-[#151817] transition hover:border-[#34a51d]"
              onClick={() => setIsColumnModalOpen(true)}
              type="button"
            >
              Sütun seç
            </button>
            <div className="relative">
              <button
                className="h-10 rounded-lg border border-[#c8d6ce] bg-white px-4 text-sm font-semibold text-[#151817] transition hover:border-[#34a51d]"
                onClick={() => setIsExportOpen((current) => !current)}
                type="button"
              >
                Export
              </button>
              {isExportOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-[#d6e0da] bg-white py-2 shadow-xl shadow-black/10">
                  {[
                    ["pdf", "Çap / PDF"],
                    ["copy", "Kopyala"],
                    ["csv", "CSV"],
                    ["excel", "Excel file"],
                    ["map", "Map / JSON"],
                  ].map(([format, label]) => (
                    <button
                      className="block w-full px-4 py-2 text-left text-sm font-medium text-[#334039] hover:bg-[#f5f7f6]"
                      key={format}
                      onClick={() => exportRows(format as "copy" | "csv" | "excel" | "pdf" | "map")}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-[#f7faf8]">
                {tableColumns.map((column) => (
                  <th
                    className="border-b border-r border-[#dfe8e2] px-4 py-3 font-semibold text-[#151817] first:border-l"
                    key={column.key}
                    style={{ minWidth: column.width ?? "150px" }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row, rowIndex) => (
                <tr className="bg-white transition hover:bg-[#f9fbfa]" key={`${row.id}-${rowIndex}`}>
                  {tableColumns.map((column) => {
                    const value = row[column.key] ?? "";

                    return (
                      <td
                        className="border-b border-r border-[#e6eee9] px-4 py-3 align-middle text-[#25312b] first:border-l"
                        key={column.key}
                      >
                        {column.badge ? (
                          <span
                            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${
                              statusStyles[value] ?? "bg-[#eef3f0] text-[#4d5752] ring-[#d6e0da]"
                            }`}
                          >
                            {value}
                          </span>
                        ) : (
                          <span className="line-clamp-2">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isColumnModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4">
          <div className="w-full max-w-3xl rounded-lg border border-[#d6e0da] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#d6e0da] px-6 py-5">
              <div>
                <h3 className="text-2xl font-semibold text-[#151817]">Sütun seçimi</h3>
                <p className="mt-1 text-sm text-[#68736c]">
                  Cədvəldə görünəcək sütunları seç və sıralamasını dəyiş.
                </p>
              </div>
              <button
                className="grid size-10 place-items-center rounded-lg border border-[#d6e0da] text-xl text-[#68736c]"
                onClick={() => setIsColumnModalOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="grid max-h-[55vh] gap-3 overflow-y-auto px-6 py-5 md:grid-cols-2">
              {orderedColumns.map((column, index) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#dfe8e2] px-3 py-3"
                  key={column.key}
                >
                  <label className="flex min-w-0 items-center gap-3 text-sm font-medium">
                    <input
                      checked={visibleColumnKeys.includes(column.key)}
                      className="size-4 accent-[#34a51d]"
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
                    <button
                      className="size-8 rounded-lg border border-[#c8d6ce] text-sm disabled:opacity-35"
                      disabled={index === 0}
                      onClick={() => moveColumn(column.key, -1)}
                      type="button"
                    >
                      ↑
                    </button>
                    <button
                      className="size-8 rounded-lg border border-[#c8d6ce] text-sm disabled:opacity-35"
                      disabled={index === orderedColumns.length - 1}
                      onClick={() => moveColumn(column.key, 1)}
                      type="button"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-between gap-3 border-t border-[#d6e0da] px-6 py-4">
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-[#c8d6ce] px-4 py-2 text-sm font-semibold"
                  onClick={() => setVisibleColumnKeys(columns.map((column) => column.key))}
                  type="button"
                >
                  Hamısını seç
                </button>
                <button
                  className="rounded-lg border border-[#c8d6ce] px-4 py-2 text-sm font-semibold"
                  onClick={() => {
                    setVisibleColumnKeys(columns.map((column) => column.key));
                    setColumnOrder(columns.map((column) => column.key));
                  }}
                  type="button"
                >
                  Sıfırla
                </button>
              </div>
              <button
                className="rounded-lg bg-[#101510] px-5 py-2 text-sm font-semibold text-white"
                onClick={() => setIsColumnModalOpen(false)}
                type="button"
              >
                Təsdiq et
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
