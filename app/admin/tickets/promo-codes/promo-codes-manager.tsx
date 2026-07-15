"use client";

import { useMemo, useState } from "react";
import { SmartDataTable } from "../../smart-data-table";

type Promo = {
  code: string;
  title: string;
  discountType: string;
  discountValue: string;
  appliesTo: string;
  interestGroups: string;
  segments: string;
  minTickets: string;
  ruleSummary: string;
  event: string;
  status: string;
  used: number;
  limit: number;
  startsAt: string;
  endsAt: string;
  minOrder: string;
  revenueImpact: string;
};

const promoColumns = [
  { key: "code", label: "Kod", width: "140px" },
  { key: "title", label: "Ad", width: "210px" },
  { key: "discountType", label: "Endirim tipi", width: "150px" },
  { key: "discountValue", label: "Endirim", width: "120px" },
  { key: "appliesTo", label: "Tətbiq sahəsi", width: "210px" },
  { key: "interestGroups", label: "Maraq qrupu", width: "190px" },
  { key: "segments", label: "Seqment", width: "210px" },
  { key: "ruleSummary", label: "Qayda xülasəsi", width: "280px" },
  { key: "event", label: "Tədbir", width: "240px" },
  { key: "status", label: "Status", width: "130px", badge: true },
  { key: "usage", label: "İstifadə", width: "130px" },
  { key: "period", label: "Tarix aralığı", width: "230px" },
  { key: "minOrder", label: "Min. sifariş", width: "140px" },
  { key: "revenueImpact", label: "Endirim dəyəri", width: "150px" },
];

const emptyPromo: Promo = {
  appliesTo: "Bütün biletlər",
  code: "",
  discountType: "Faiz",
  discountValue: "10%",
  endsAt: "18 Sentyabr 2026",
  event: "AI & Finance Summit 2026",
  interestGroups: "Hamısı",
  limit: 100,
  minOrder: "0 AZN",
  minTickets: "1",
  revenueImpact: "0 AZN",
  ruleSummary: "",
  segments: "Hamısı",
  startsAt: "1 Avqust 2026",
  status: "active",
  title: "",
  used: 0,
};

const rules = [
  "Promo kod checkout-da səbətə tətbiq edilir, tək biletə yox.",
  "Kod tədbir, bilet tipi, maraq qrupu, seqment, tarix və istifadə limiti ilə məhdudlaşdırılır.",
  "Kod yalnız paid sifarişə çevriləndə istifadə sayına düşməlidir.",
  "Refund və ləğv halında promo istifadəsi ayrıca log-da saxlanmalıdır.",
  "Hər promo kod üçün audit log: kim yaratdı, kim dəyişdi, nə vaxt deaktiv edildi.",
];

export function PromoCodesManager({ initialPromos }: { initialPromos: Promo[] }) {
  const [promos, setPromos] = useState(initialPromos);
  const [form, setForm] = useState<Promo>(emptyPromo);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modal, setModal] = useState<"form" | "preview" | "status" | "rules" | null>(null);
  const selected = selectedIndex === null ? null : promos[selectedIndex];

  const rows = useMemo(
    () =>
      promos.map((promo) => ({
        appliesTo: promo.appliesTo,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        event: promo.event,
        interestGroups: promo.interestGroups,
        minOrder: promo.minOrder,
        period: `${promo.startsAt} - ${promo.endsAt}`,
        revenueImpact: promo.revenueImpact,
        ruleSummary: promo.ruleSummary,
        segments: promo.segments,
        status: promo.status,
        title: promo.title,
        usage: `${promo.used}/${promo.limit}`,
      })),
    [promos],
  );

  const stats = useMemo(
    () => ({
      active: promos.filter((promo) => promo.status === "active").length,
      expired: promos.filter((promo) => promo.status === "expired").length,
      scheduled: promos.filter((promo) => promo.status === "scheduled").length,
      usage: promos.reduce((sum, promo) => sum + promo.used, 0),
    }),
    [promos],
  );

  const filters = [
    { key: "status", label: "Status", options: Array.from(new Set(rows.map((row) => row.status))) },
    { key: "event", label: "Tədbir", options: Array.from(new Set(rows.map((row) => row.event))) },
    { key: "discountType", label: "Endirim tipi", options: Array.from(new Set(rows.map((row) => row.discountType))) },
    { key: "appliesTo", label: "Tətbiq sahəsi", options: Array.from(new Set(rows.map((row) => row.appliesTo))) },
    { key: "interestGroups", label: "Maraq qrupu", options: Array.from(new Set(rows.map((row) => row.interestGroups))) },
    { key: "segments", label: "Seqment", options: Array.from(new Set(rows.map((row) => row.segments))) },
  ];

  const openAdd = () => {
    setEditingIndex(null);
    setForm(emptyPromo);
    setModal("form");
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setForm(promos[index]);
    setModal("form");
  };

  const save = () => {
    if (!form.code.trim()) return;
    const next = {
      ...form,
      code: form.code.toUpperCase(),
      ruleSummary:
        form.ruleSummary ||
        `${form.event} · ${form.appliesTo} · ${form.interestGroups} · min. ${form.minTickets} bilet`,
    };
    setPromos((current) =>
      editingIndex === null
        ? [next, ...current]
        : current.map((item, index) => (index === editingIndex ? next : item)),
    );
    setModal(null);
  };

  const toggleStatus = () => {
    if (selectedIndex === null) return;
    setPromos((current) =>
      current.map((promo, index) =>
        index === selectedIndex
          ? { ...promo, status: promo.status === "active" ? "paused" : "active" }
          : promo,
      ),
    );
    setSelectedIndex(null);
    setModal(null);
  };

  return (
    <>
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Aktiv kod" value={`${stats.active}`} />
        <Metric label="Ümumi istifadə" value={`${stats.usage}`} />
        <Metric label="Planlı kod" value={`${stats.scheduled}`} />
        <Metric label="Bitmiş kod" value={`${stats.expired}`} />
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={openAdd} type="button">
          Promo kod yarat
        </button>
        <button className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold" onClick={() => setModal("rules")} type="button">
          Qaydalar
        </button>
      </div>

      <section className="mt-5 grid gap-4 xl:grid-cols-3">
        {promos.map((promo, index) => (
          <article className="rounded-lg border border-black/10 bg-white p-5" key={`${promo.code}-${index}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{promo.code}</h2>
                <p className="mt-1 text-sm text-[#68736c]">{promo.title}</p>
              </div>
              <span className={`rounded px-2 py-1 text-xs font-semibold ${promo.status === "active" ? "bg-[#eefaf5] text-[#207b18]" : "bg-[#fff6df] text-[#8a5a00]"}`}>
                {promo.status}
              </span>
            </div>
            <p className="mt-3 min-h-14 text-sm leading-6 text-[#56615b]">{promo.ruleSummary}</p>
            <dl className="mt-4 grid gap-2 rounded-lg bg-[#f5f7f6] p-3 text-sm">
              <Row label="Endirim" value={`${promo.discountType} · ${promo.discountValue}`} />
              <Row label="Tədbir" value={promo.event} />
              <Row label="İstifadə" value={`${promo.used}/${promo.limit}`} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => openEdit(index)} type="button">Düzəliş et</button>
              <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => { setSelectedIndex(index); setModal("preview"); }} type="button">Preview</button>
              <button className="rounded-lg border border-[#ffd1cc] px-3 py-2 text-sm font-semibold text-[#b42318]" onClick={() => { setSelectedIndex(index); setModal("status"); }} type="button">
                {promo.status === "active" ? "Dayandır" : "Aktiv et"}
              </button>
            </div>
          </article>
        ))}
      </section>

      <SmartDataTable
        columns={promoColumns}
        description="Kodları status, tədbir, endirim tipi və tətbiq sahəsinə görə filtrlə; sütunları tənzimlə və export et."
        eyebrow="Promo CRM"
        filters={filters}
        rows={rows}
        title="Promo kod siyahısı"
      />

      {modal === "form" ? (
        <Modal title={editingIndex === null ? "Promo kod yarat" : "Promo kodu redaktə et"} onClose={() => setModal(null)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Kod" value={form.code} onChange={(value) => setForm({ ...form, code: value.toUpperCase() })} />
            <Input label="Ad" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
            <Select label="Status" value={form.status} options={["active", "scheduled", "paused", "expired"]} onChange={(value) => setForm({ ...form, status: value })} />
            <Select label="Endirim tipi" value={form.discountType} options={["Faiz", "Sabit məbləğ", "100% dəvət kodu"]} onChange={(value) => setForm({ ...form, discountType: value })} />
            <Input label="Endirim dəyəri" value={form.discountValue} onChange={(value) => setForm({ ...form, discountValue: value })} />
            <NumberInput label="İstifadə limiti" value={form.limit} onChange={(value) => setForm({ ...form, limit: value })} />
            <Input label="Min. sifariş" value={form.minOrder} onChange={(value) => setForm({ ...form, minOrder: value })} />
            <Input label="Minimum bilet sayı" value={form.minTickets} onChange={(value) => setForm({ ...form, minTickets: value })} />
            <Select label="Tədbir" value={form.event} options={["AI & Finance Summit 2026", "Startup Valuation Workshop", "Marketing Data Lab", "Bütün gələcək tədbirlər"]} onChange={(value) => setForm({ ...form, event: value })} />
            <Select label="Bilet növü" value={form.appliesTo} options={["Bütün biletlər", "Standard", "VIP", "Online Live"]} onChange={(value) => setForm({ ...form, appliesTo: value })} />
            <Select label="Maraq qrupu" value={form.interestGroups} options={["Hamısı", "AI", "Fintech", "Startap", "Marketinq", "Investor"]} onChange={(value) => setForm({ ...form, interestGroups: value })} />
            <Select label="Seqment" value={form.segments} options={["Hamısı", "Yeni istifadəçilər", "Keçmiş iştirakçılar", "Newsletter", "Dəvətli siyahı"]} onChange={(value) => setForm({ ...form, segments: value })} />
            <Input label="Başlama tarixi" value={form.startsAt} onChange={(value) => setForm({ ...form, startsAt: value })} />
            <Input label="Bitmə tarixi" value={form.endsAt} onChange={(value) => setForm({ ...form, endsAt: value })} />
            <label className="grid gap-2 text-sm font-medium md:col-span-2">
              Qayda xülasəsi
              <textarea className="min-h-24 rounded-lg border border-black/10 px-3 py-3 font-normal" value={form.ruleSummary} onChange={(event) => setForm({ ...form, ruleSummary: event.target.value })} />
            </label>
            <div className="md:col-span-2">
              <Actions disabled={!form.code.trim()} onCancel={() => setModal(null)} onSave={save} />
            </div>
          </div>
        </Modal>
      ) : null}

      {modal === "preview" && selected ? (
        <Modal title="Promo preview" onClose={() => setModal(null)}>
          <article className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{selected.code}</h2>
                <p className="mt-1 text-sm text-[#68736c]">{selected.title}</p>
              </div>
              <strong>{selected.discountValue}</strong>
            </div>
            <p className="mt-4 text-sm leading-6">{selected.ruleSummary}</p>
          </article>
        </Modal>
      ) : null}

      {modal === "status" && selected ? (
        <Modal title="Promo statusu" onClose={() => setModal(null)}>
          <p><strong>{selected.code}</strong> promo kodunun statusu dəyişdirilsin?</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={() => setModal(null)} type="button">Ləğv et</button>
            <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={toggleStatus} type="button">Təsdiq et</button>
          </div>
        </Modal>
      ) : null}

      {modal === "rules" ? (
        <Modal title="Promo kod məntiqi" onClose={() => setModal(null)}>
          <div className="grid gap-3">
            {rules.map((rule, index) => (
              <div className="flex gap-3 rounded-lg border border-[#dfe8e2] p-3" key={rule}>
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#e9f8ee] text-sm font-semibold text-[#106142]">{index + 1}</span>
                <p className="text-sm text-[#4d5752]">{rule}</p>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="rounded-lg border border-black/10 bg-white p-5"><p className="text-sm text-[#68736c]">{label}</p><strong className="mt-2 block text-2xl">{value}</strong></article>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3"><dt className="text-[#68736c]">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>;
}
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4"><div className="w-full max-w-3xl rounded-lg bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-black/10 px-5 py-4"><h2 className="text-xl font-semibold">{title}</h2><button className="grid size-10 place-items-center rounded-lg border border-black/10" onClick={onClose} type="button">x</button></div><div className="max-h-[72vh] overflow-y-auto p-5">{children}</div></div></div>;
}
function Input({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) { return <label className="grid gap-2 text-sm font-medium">{label}<input className="rounded-lg border border-black/10 px-3 py-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function NumberInput({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) { return <label className="grid gap-2 text-sm font-medium">{label}<input className="rounded-lg border border-black/10 px-3 py-3 font-normal" type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>; }
function Select({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[]; value: string }) { return <label className="grid gap-2 text-sm font-medium">{label}<select className="rounded-lg border border-black/10 px-3 py-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function Actions({ disabled, onCancel, onSave }: { disabled?: boolean; onCancel: () => void; onSave: () => void }) { return <div className="flex justify-end gap-2 border-t border-black/10 pt-4"><button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={onCancel} type="button">Ləğv et</button><button className="rounded-lg bg-[#34a51d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={disabled} onClick={onSave} type="button">Yadda saxla</button></div>; }
