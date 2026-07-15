"use client";

import { useState } from "react";

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

const emptyPromo: Promo = {
  appliesTo: "Bütün biletlər",
  code: "",
  discountType: "Faiz",
  discountValue: "10%",
  endsAt: "",
  event: "",
  interestGroups: "",
  limit: 100,
  minOrder: "0 AZN",
  minTickets: "1",
  revenueImpact: "0 AZN",
  ruleSummary: "",
  segments: "",
  startsAt: "",
  status: "active",
  title: "",
  used: 0,
};

export function PromoManager({ initialPromos }: { initialPromos: Promo[] }) {
  const [promos, setPromos] = useState(initialPromos);
  const [form, setForm] = useState<Promo>(emptyPromo);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modal, setModal] = useState<"form" | "email" | "deactivate" | null>(null);
  const selected = selectedIndex === null ? null : promos[selectedIndex];

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
      ruleSummary: form.ruleSummary || `${form.appliesTo} · ${form.interestGroups || "bütün maraqlar"} · min. ${form.minTickets} bilet`,
    };
    setPromos((current) =>
      editingIndex === null
        ? [...current, next]
        : current.map((item, index) => (index === editingIndex ? next : item)),
    );
    setModal(null);
  };

  const deactivate = () => {
    if (selectedIndex === null) return;
    setPromos((current) =>
      current.map((item, index) => (index === selectedIndex ? { ...item, status: "inactive" } : item)),
    );
    setModal(null);
    setSelectedIndex(null);
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={openAdd} type="button">Promo kod yarat</button>
        <button className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold" onClick={() => setModal("email")} type="button">Email kampaniyası</button>
      </div>
      <section className="grid gap-4 lg:grid-cols-3">
        {promos.map((promo, index) => (
          <article className="rounded-lg border border-black/10 bg-white p-5" key={`${promo.code}-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{promo.code}</h2>
              <span className={`rounded px-2 py-1 text-xs font-semibold ${promo.status === "inactive" ? "bg-[#fff0ed] text-[#b42318]" : "bg-[#eefaf5] text-[#207b18]"}`}>{promo.status}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#56615b]">{promo.ruleSummary}</p>
            <dl className="mt-4 grid gap-2 text-sm">
              <Row label="Endirim" value={`${promo.discountType} · ${promo.discountValue}`} />
              <Row label="Bilet" value={promo.appliesTo} />
              <Row label="Maraq" value={promo.interestGroups} />
              <Row label="İstifadə" value={`${promo.used}/${promo.limit}`} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => openEdit(index)} type="button">Düzəliş et</button>
              <button className="rounded-lg border border-[#ffd1cc] px-3 py-2 text-sm font-semibold text-[#b42318]" onClick={() => { setSelectedIndex(index); setModal("deactivate"); }} type="button">Deaktiv et</button>
            </div>
          </article>
        ))}
      </section>

      {modal === "form" ? (
        <Modal title={editingIndex === null ? "Promo kod yarat" : "Promo kodu redaktə et"} onClose={() => setModal(null)}>
          <div className="grid gap-4">
            <Input label="Kod" value={form.code} onChange={(value) => setForm({ ...form, code: value.toUpperCase() })} />
            <Input label="Başlıq" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
            <Input label="Endirim tipi" value={form.discountType} onChange={(value) => setForm({ ...form, discountType: value })} />
            <Input label="Endirim dəyəri" value={form.discountValue} onChange={(value) => setForm({ ...form, discountValue: value })} />
            <Input label="Bilet tətbiqi" value={form.appliesTo} onChange={(value) => setForm({ ...form, appliesTo: value })} />
            <Input label="Maraq qrupları" value={form.interestGroups} onChange={(value) => setForm({ ...form, interestGroups: value })} />
            <Input label="Seqmentlər" value={form.segments} onChange={(value) => setForm({ ...form, segments: value })} />
            <NumberInput label="Limit" value={form.limit} onChange={(value) => setForm({ ...form, limit: value })} />
            <Actions disabled={!form.code.trim()} onCancel={() => setModal(null)} onSave={save} />
          </div>
        </Modal>
      ) : null}

      {modal === "email" ? (
        <Modal title="Email kampaniyası" onClose={() => setModal(null)}>
          <p className="text-sm text-[#56615b]">Demo: promo kod istifadəçilərinə və seçilmiş maraq qruplarına kampaniya yaradılacaq.</p>
          <div className="mt-5 flex justify-end"><button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={() => setModal(null)} type="button">Kampaniyanı hazırla</button></div>
        </Modal>
      ) : null}

      {modal === "deactivate" && selected ? (
        <Modal title="Promo kodu deaktiv et" onClose={() => setModal(null)}>
          <p><strong>{selected.code}</strong> promo kodunu deaktiv etmək istəyirsən?</p>
          <div className="mt-5 flex justify-end gap-2"><button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={() => setModal(null)} type="button">Ləğv et</button><button className="rounded-lg bg-[#b42318] px-4 py-2 text-sm font-semibold text-white" onClick={deactivate} type="button">Deaktiv et</button></div>
        </Modal>
      ) : null}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-3 border-b border-black/10 pb-2"><dt className="text-[#68736c]">{label}</dt><dd className="text-right font-medium">{value}</dd></div>; }
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4"><div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-black/10 px-5 py-4"><h2 className="text-xl font-semibold">{title}</h2><button className="grid size-10 place-items-center rounded-lg border border-black/10" onClick={onClose} type="button">x</button></div><div className="max-h-[72vh] overflow-y-auto p-5">{children}</div></div></div>; }
function Input({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) { return <label className="grid gap-2 text-sm font-medium">{label}<input className="rounded-lg border border-black/10 px-3 py-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function NumberInput({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) { return <label className="grid gap-2 text-sm font-medium">{label}<input className="rounded-lg border border-black/10 px-3 py-3 font-normal" type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>; }
function Actions({ disabled, onCancel, onSave }: { disabled?: boolean; onCancel: () => void; onSave: () => void }) { return <div className="flex justify-end gap-2 border-t border-black/10 pt-4"><button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={onCancel} type="button">Ləğv et</button><button className="rounded-lg bg-[#34a51d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={disabled} onClick={onSave} type="button">Yadda saxla</button></div>; }
