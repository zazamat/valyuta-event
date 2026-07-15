"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "../../admin-shell";
import { buyerTickets } from "../../../data/demo";

type PrintProduct = {
  id: string;
  name: string;
  scope: string;
  size: string;
  productType: "PDF bilet" | "Fiziki bilet" | "Badge" | "Online giriş";
  status: "Aktiv" | "Dayandırılıb";
  fields: string[];
};

const initialProducts: PrintProduct[] = [
  {
    fields: ["Tədbir", "Tarix", "Məkan", "Bilet kodu", "QR", "Qaydalar"],
    id: "standard",
    name: "Standart PDF bilet",
    productType: "PDF bilet",
    scope: "Fiziki və hibrid tədbirlər",
    size: "A4 / 1 bilet",
    status: "Aktiv",
  },
  {
    fields: ["VIP nişanı", "QR", "Networking qeyd", "Sponsor loqoları"],
    id: "vip",
    name: "VIP çap bileti",
    productType: "Fiziki bilet",
    scope: "VIP, sponsor və xüsusi qonaqlar",
    size: "A4 / premium",
    status: "Aktiv",
  },
  {
    fields: ["Ad soyad", "Şirkət", "Rol", "QR", "Rəng etiketi"],
    id: "badge",
    name: "Badge / giriş kartı",
    productType: "Badge",
    scope: "Giriş masasında çap",
    size: "A6 / badge",
    status: "Aktiv",
  },
  {
    fields: ["Magic link", "Replay qaydası", "QR", "Support"],
    id: "online",
    name: "Online giriş PDF-i",
    productType: "Online giriş",
    scope: "Online iştirak və replay",
    size: "Email/PDF",
    status: "Aktiv",
  },
];

const emptyProduct: PrintProduct = {
  fields: ["Tədbir", "Bilet kodu", "QR"],
  id: "new-product",
  name: "",
  productType: "PDF bilet",
  scope: "",
  size: "A4",
  status: "Aktiv",
};

const securityRules = [
  "QR kod yalnız unikal ticketToken və ya yoxlama linki daşıyır.",
  "Email, telefon və şəxsi məlumat QR-in içində saxlanmır.",
  "Check-in zamanı token backend-də yoxlanır: paid, event, cancellation, duplicate.",
  "PDF kopyalansa belə, eyni token ikinci dəfə skan ediləndə sistem xəbərdarlıq verir.",
  "Toplu çap yalnız paid və check-in olunmamış biletlər üçün filtr edilə bilər.",
];

function miniQrCells(seed: string) {
  return Array.from({ length: 81 }, (_, index) => {
    const x = index % 9;
    const y = Math.floor(index / 9);
    const finder = (x <= 2 && y <= 2) || (x >= 6 && y <= 2) || (x <= 2 && y >= 6);
    const hash = seed.charCodeAt(index % seed.length) + x * 7 + y * 11;
    return finder || hash % 5 === 0;
  });
}

export default function TicketPrintPage() {
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState(initialProducts[0].id);
  const [bulkScope, setBulkScope] = useState("paid");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<PrintProduct>(emptyProduct);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modal, setModal] = useState<"form" | "security" | "status" | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedProduct = products.find((product) => product.id === selectedId) ?? products[0];
  const selectedForStatus = selectedIndex === null ? null : products[selectedIndex];

  const printableCount = useMemo(() => {
    if (bulkScope === "paid") {
      return buyerTickets.filter((ticket) => ticket.status === "paid").length;
    }
    if (bulkScope === "physical") {
      return buyerTickets.filter((ticket) => ticket.status === "paid" && ticket.ticket !== "Online Live").length;
    }
    return buyerTickets.length;
  }, [bulkScope]);

  const stats = useMemo(
    () => ({
      active: products.filter((product) => product.status === "Aktiv").length,
      badge: products.filter((product) => product.productType === "Badge").length,
      pdf: products.filter((product) => product.productType === "PDF bilet").length,
      total: products.length,
    }),
    [products],
  );

  const openAdd = () => {
    setEditingIndex(null);
    setForm({ ...emptyProduct, id: `product-${Date.now()}` });
    setModal("form");
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setForm(products[index]);
    setModal("form");
  };

  const save = () => {
    if (!form.name.trim()) return;
    const next = {
      ...form,
      fields: form.fields.map((field) => field.trim()).filter(Boolean),
      id: form.id || form.name.toLowerCase().replaceAll(" ", "-"),
    };
    setProducts((current) =>
      editingIndex === null
        ? [next, ...current]
        : current.map((item, index) => (index === editingIndex ? next : item)),
    );
    setSelectedId(next.id);
    setModal(null);
  };

  const duplicateProduct = (index: number) => {
    const source = products[index];
    const copy = {
      ...source,
      id: `${source.id}-copy-${Date.now()}`,
      name: `${source.name} copy`,
      status: "Dayandırılıb" as const,
    };
    setProducts((current) => [copy, ...current]);
    setSelectedId(copy.id);
    setNotice(`${copy.name} yaradıldı və deaktiv statusda saxlandı.`);
  };

  const toggleStatus = () => {
    if (selectedIndex === null) return;
    setProducts((current) =>
      current.map((product, index) =>
        index === selectedIndex
          ? { ...product, status: product.status === "Aktiv" ? "Dayandırılıb" : "Aktiv" }
          : product,
      ),
    );
    setModal(null);
    setSelectedIndex(null);
  };

  const generatePdf = (type: "single" | "bulk") => {
    const label = type === "single" ? selectedProduct.name : `${printableCount} biletlik toplu PDF`;
    setNotice(`${label} üçün demo PDF generasiya növbəsi yaradıldı.`);
  };

  return (
    <AdminShell
      activeLabel="PDF / Çap məhsulları"
      description="PDF bilet, fiziki çap, badge, bulk print və QR təhlükəsizlik qaydalarını idarə et."
      title="PDF və çap məhsulları"
    >
      {notice ? (
        <div className="mb-5 rounded-lg border border-[#34a51d]/25 bg-[#f0faed] px-4 py-3 text-sm font-medium text-[#106142]">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Məhsul" value={`${stats.total}`} />
        <Metric label="Aktiv" value={`${stats.active}`} />
        <Metric label="PDF bilet" value={`${stats.pdf}`} />
        <Metric label="Badge" value={`${stats.badge}`} />
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={openAdd} type="button">
          Çap məhsulu yarat
        </button>
        <button className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold" onClick={() => setModal("security")} type="button">
          QR təhlükəsizlik qaydaları
        </button>
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <section className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-sm text-[#68736c]">Məhsullar</p>
                <h2 className="text-xl font-semibold">PDF və çap məhsulları</h2>
              </div>
              <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={() => generatePdf("single")} type="button">
                Seçilmiş məhsuldan PDF yarat
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {products.map((product, index) => (
                <article className={`rounded-lg border p-4 transition ${selectedId === product.id ? "border-[#34a51d] bg-[#f0faed]" : "border-[#dfe8e2] bg-white"}`} key={product.id}>
                  <button className="w-full text-left" onClick={() => setSelectedId(product.id)} type="button">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="mt-1 text-sm text-[#5b665f]">{product.scope}</p>
                      </div>
                      <span className="rounded-lg bg-[#eef3f0] px-2 py-1 text-xs text-[#4d5752]">{product.size}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${product.status === "Aktiv" ? "bg-[#eefaf5] text-[#207b18]" : "bg-[#fff0ed] text-[#b42318]"}`}>
                        {product.status}
                      </span>
                      <span className="rounded-lg bg-[#f5f7f6] px-2 py-1 text-xs">{product.productType}</span>
                      {product.fields.slice(0, 4).map((field) => (
                        <span className="rounded-lg bg-[#f5f7f6] px-2 py-1 text-xs" key={field}>{field}</span>
                      ))}
                    </div>
                  </button>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => openEdit(index)} type="button">Düzəliş et</button>
                    <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => duplicateProduct(index)} type="button">Kopyala</button>
                    <button className="rounded-lg border border-[#ffd1cc] px-3 py-2 text-sm font-semibold text-[#b42318]" onClick={() => { setSelectedIndex(index); setModal("status"); }} type="button">
                      {product.status === "Aktiv" ? "Dayandır" : "Aktiv et"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-black/10 bg-white p-5">
            <p className="text-sm text-[#68736c]">Toplu çap</p>
            <h2 className="text-xl font-semibold">Admin üçün PDF paket</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm">
                Çap ediləcək biletlər
                <select className="rounded-lg border border-black/10 bg-white px-3 py-3" onChange={(event) => setBulkScope(event.target.value)} value={bulkScope}>
                  <option value="paid">Yalnız paid biletlər</option>
                  <option value="physical">Yalnız fiziki biletlər</option>
                  <option value="all">Bütün demo biletlər</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                Sıralama
                <select className="rounded-lg border border-black/10 bg-white px-3 py-3">
                  <option>Bilet növü üzrə</option>
                  <option>Ad soyad üzrə</option>
                  <option>Sifariş tarixi üzrə</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                Çap formatı
                <select className="rounded-lg border border-black/10 bg-white px-3 py-3">
                  <option>A4 PDF</option>
                  <option>Badge A6</option>
                  <option>Termal printer etiketi</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white" onClick={() => generatePdf("bulk")} type="button">
                Toplu PDF yarat
              </button>
              <span className="text-sm text-[#68736c]">{printableCount} bilet PDF paketinə düşəcək</span>
            </div>
          </section>
        </div>

        <aside className="h-fit xl:sticky xl:top-6">
          <TicketPreview product={selectedProduct} />
        </aside>
      </section>

      {modal === "form" ? (
        <Modal title={editingIndex === null ? "Çap məhsulu yarat" : "Çap məhsulunu redaktə et"} onClose={() => setModal(null)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Məhsul adı" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Select label="Məhsul tipi" value={form.productType} options={["PDF bilet", "Fiziki bilet", "Badge", "Online giriş"]} onChange={(value) => setForm({ ...form, productType: value as PrintProduct["productType"] })} />
            <Input label="İstifadə sahəsi" value={form.scope} onChange={(value) => setForm({ ...form, scope: value })} />
            <Input label="Ölçü / format" value={form.size} onChange={(value) => setForm({ ...form, size: value })} />
            <Select label="Status" value={form.status} options={["Aktiv", "Dayandırılıb"]} onChange={(value) => setForm({ ...form, status: value as PrintProduct["status"] })} />
            <label className="grid gap-2 text-sm font-medium md:col-span-2">
              Sahələr
              <input className="rounded-lg border border-black/10 px-3 py-3 font-normal" onChange={(event) => setForm({ ...form, fields: event.target.value.split(",") })} value={form.fields.join(", ")} />
            </label>
            <div className="md:col-span-2">
              <Actions disabled={!form.name.trim()} onCancel={() => setModal(null)} onSave={save} />
            </div>
          </div>
        </Modal>
      ) : null}

      {modal === "security" ? (
        <Modal title="QR və token təhlükəsizliyi" onClose={() => setModal(null)}>
          <div className="grid gap-3">
            {securityRules.map((rule, index) => (
              <div className="flex gap-3 rounded-lg border border-[#dfe8e2] p-3" key={rule}>
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#e9f8ee] text-sm font-semibold text-[#106142]">{index + 1}</span>
                <p className="text-sm text-[#4d5752]">{rule}</p>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}

      {modal === "status" && selectedForStatus ? (
        <Modal title="Məhsul statusu" onClose={() => setModal(null)}>
          <p><strong>{selectedForStatus.name}</strong> məhsulunun statusu dəyişdirilsin?</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={() => setModal(null)} type="button">Ləğv et</button>
            <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={toggleStatus} type="button">Təsdiq et</button>
          </div>
        </Modal>
      ) : null}
    </AdminShell>
  );
}

function TicketPreview({ product }: { product: PrintProduct }) {
  const ticket = buyerTickets[0];
  const cells = miniQrCells(`${ticket.token}-${product.id}`);

  return (
    <div className="rounded-lg border border-[#d6e0da] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-dashed border-[#c8d6ce] pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#34a51d]">vEvent ticket</p>
          <h3 className="mt-2 text-2xl font-semibold">{ticket.event}</h3>
          <p className="mt-2 text-sm text-[#5b665f]">{ticket.date} · {ticket.time} · {ticket.venue}</p>
        </div>
        <span className="rounded-lg bg-[#101510] px-3 py-2 text-sm font-semibold text-white">{product.productType}</span>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_150px]">
        <dl className="grid gap-3 text-sm">
          <Info label="İştirakçı" value={ticket.buyer} />
          <Info label="Bilet növü" value={ticket.ticket} />
          <Info label="Bilet kodu" value={ticket.ticketCode} />
          <Info label="Məhsul" value={product.name} />
        </dl>
        <div>
          <div className="rounded-lg border border-[#dfe8e2] bg-white p-3">
            <svg aria-label="Unikal QR preview" className="size-full" role="img" viewBox="0 0 9 9">
              <rect fill="#fff" height="9" width="9" />
              {cells.map((dark, index) => {
                if (!dark) return null;
                const x = index % 9;
                const y = Math.floor(index / 9);
                return <rect fill="#101510" height="0.72" key={index} rx="0.06" width="0.72" x={x + 0.14} y={y + 0.14} />;
              })}
            </svg>
          </div>
          <p className="mt-2 text-center text-xs text-[#68736c]">Server token ilə yoxlanır</p>
        </div>
      </div>

      <p className="mt-5 rounded-lg bg-[#f5f7f6] p-3 text-xs text-[#5b665f]">
        Bu məhsul yalnız QR yoxlaması və backend təsdiqi ilə keçərlidir.
      </p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[#68736c]">{label}</dt><dd className="font-semibold">{value}</dd></div>;
}
function Metric({ label, value }: { label: string; value: string }) {
  return <article className="rounded-lg border border-black/10 bg-white p-5"><p className="text-sm text-[#68736c]">{label}</p><strong className="mt-2 block text-2xl">{value}</strong></article>;
}
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4"><div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-black/10 px-5 py-4"><h2 className="text-xl font-semibold">{title}</h2><button className="grid size-10 place-items-center rounded-lg border border-black/10" onClick={onClose} type="button">x</button></div><div className="max-h-[72vh] overflow-y-auto p-5">{children}</div></div></div>;
}
function Input({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) { return <label className="grid gap-2 text-sm font-medium">{label}<input className="rounded-lg border border-black/10 px-3 py-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function Select({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[]; value: string }) { return <label className="grid gap-2 text-sm font-medium">{label}<select className="rounded-lg border border-black/10 px-3 py-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function Actions({ disabled, onCancel, onSave }: { disabled?: boolean; onCancel: () => void; onSave: () => void }) { return <div className="flex justify-end gap-2 border-t border-black/10 pt-4"><button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={onCancel} type="button">Ləğv et</button><button className="rounded-lg bg-[#34a51d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={disabled} onClick={onSave} type="button">Yadda saxla</button></div>; }
