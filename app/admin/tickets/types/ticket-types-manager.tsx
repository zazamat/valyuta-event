"use client";

import { useMemo, useState } from "react";

type DemoTicket = {
  name: string;
  price: number;
  type: string;
  description: string;
  available: number;
};

type TicketTemplate = DemoTicket & {
  channel: "Fiziki" | "Onlayn" | "Hibrid";
  status: "Aktiv" | "Dayandırılıb";
};

const emptyTicket: TicketTemplate = {
  available: 100,
  channel: "Fiziki",
  description: "",
  name: "",
  price: 0,
  status: "Aktiv",
  type: "Fiziki iştirak",
};

export function TicketTypesManager({ initialTickets }: { initialTickets: DemoTicket[] }) {
  const [tickets, setTickets] = useState<TicketTemplate[]>(
    initialTickets.map((ticket) => ({
      ...ticket,
      channel: ticket.type.includes("Onlayn") ? "Onlayn" : "Fiziki",
      status: "Aktiv",
    })),
  );
  const [form, setForm] = useState<TicketTemplate>(emptyTicket);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modal, setModal] = useState<"form" | "status" | "preview" | null>(null);
  const selected = selectedIndex === null ? null : tickets[selectedIndex];

  const stats = useMemo(
    () => ({
      active: tickets.filter((ticket) => ticket.status === "Aktiv").length,
      physical: tickets.filter((ticket) => ticket.channel === "Fiziki").length,
      online: tickets.filter((ticket) => ticket.channel === "Onlayn").length,
      total: tickets.length,
    }),
    [tickets],
  );

  const openAdd = () => {
    setEditingIndex(null);
    setForm(emptyTicket);
    setModal("form");
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setForm(tickets[index]);
    setModal("form");
  };

  const save = () => {
    if (!form.name.trim()) return;
    setTickets((current) =>
      editingIndex === null
        ? [...current, form]
        : current.map((item, index) => (index === editingIndex ? form : item)),
    );
    setModal(null);
  };

  const toggleStatus = () => {
    if (selectedIndex === null) return;
    setTickets((current) =>
      current.map((item, index) =>
        index === selectedIndex
          ? { ...item, status: item.status === "Aktiv" ? "Dayandırılıb" : "Aktiv" }
          : item,
      ),
    );
    setSelectedIndex(null);
    setModal(null);
  };

  return (
    <>
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Ümumi şablon" value={`${stats.total}`} />
        <Metric label="Aktiv" value={`${stats.active}`} />
        <Metric label="Fiziki" value={`${stats.physical}`} />
        <Metric label="Onlayn" value={`${stats.online}`} />
      </section>

      <div className="mt-6 mb-5 flex flex-wrap gap-2">
        <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={openAdd} type="button">
          Bilet növü yarat
        </button>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {tickets.map((ticket, index) => (
          <article className="rounded-lg border border-black/10 bg-white p-5" key={`${ticket.name}-${index}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{ticket.name}</h2>
                <p className="mt-1 text-sm text-[#68736c]">{ticket.type}</p>
              </div>
              <div className="text-right">
                <strong>{ticket.price} AZN</strong>
                <span className={`mt-2 block rounded px-2 py-1 text-xs font-semibold ${ticket.status === "Aktiv" ? "bg-[#eefaf5] text-[#207b18]" : "bg-[#fff0ed] text-[#b42318]"}`}>
                  {ticket.status}
                </span>
              </div>
            </div>
            <p className="mt-3 min-h-16 text-sm leading-6">{ticket.description}</p>
            <dl className="mt-4 grid gap-2 rounded-lg bg-[#f5f7f6] p-3 text-sm">
              <Row label="Kanal" value={ticket.channel} />
              <Row label="Default limit" value={`${ticket.available}`} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => openEdit(index)} type="button">Düzəliş et</button>
              <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => { setSelectedIndex(index); setModal("preview"); }} type="button">Preview</button>
              <button className="rounded-lg border border-[#ffd1cc] px-3 py-2 text-sm font-semibold text-[#b42318]" onClick={() => { setSelectedIndex(index); setModal("status"); }} type="button">
                {ticket.status === "Aktiv" ? "Dayandır" : "Aktiv et"}
              </button>
            </div>
          </article>
        ))}
      </section>

      {modal === "form" ? (
        <Modal title={editingIndex === null ? "Bilet növü yarat" : "Bilet növünü redaktə et"} onClose={() => setModal(null)}>
          <div className="grid gap-4">
            <Input label="Bilet adı" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Input label="İştirak tipi" value={form.type} onChange={(value) => setForm({ ...form, type: value })} />
            <label className="grid gap-2 text-sm font-medium">
              Kanal
              <select className="rounded-lg border border-black/10 px-3 py-3 font-normal" value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value as TicketTemplate["channel"] })}>
                <option>Fiziki</option>
                <option>Onlayn</option>
                <option>Hibrid</option>
              </select>
            </label>
            <NumberInput label="Default qiymət" value={form.price} onChange={(value) => setForm({ ...form, price: value })} />
            <NumberInput label="Default limit" value={form.available} onChange={(value) => setForm({ ...form, available: value })} />
            <label className="grid gap-2 text-sm font-medium">
              Status
              <select className="rounded-lg border border-black/10 px-3 py-3 font-normal" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TicketTemplate["status"] })}>
                <option>Aktiv</option>
                <option>Dayandırılıb</option>
              </select>
            </label>
            <Textarea label="Təsvir" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
            <Actions disabled={!form.name.trim()} onCancel={() => setModal(null)} onSave={save} />
          </div>
        </Modal>
      ) : null}

      {modal === "preview" && selected ? (
        <Modal title="Bilet preview" onClose={() => setModal(null)}>
          <article className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{selected.name}</h2>
                <p className="mt-1 text-sm text-[#68736c]">{selected.type}</p>
              </div>
              <strong>{selected.price} AZN</strong>
            </div>
            <p className="mt-4 text-sm leading-6">{selected.description}</p>
          </article>
        </Modal>
      ) : null}

      {modal === "status" && selected ? (
        <Modal title="Statusu dəyiş" onClose={() => setModal(null)}>
          <p><strong>{selected.name}</strong> bilet növünün statusu dəyişdirilsin?</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={() => setModal(null)} type="button">Ləğv et</button>
            <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={toggleStatus} type="button">Təsdiq et</button>
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
  return <div className="flex justify-between gap-3"><dt className="text-[#68736c]">{label}</dt><dd className="font-semibold">{value}</dd></div>;
}
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4"><div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-black/10 px-5 py-4"><h2 className="text-xl font-semibold">{title}</h2><button className="grid size-10 place-items-center rounded-lg border border-black/10" onClick={onClose} type="button">x</button></div><div className="max-h-[72vh] overflow-y-auto p-5">{children}</div></div></div>;
}
function Input({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) { return <label className="grid gap-2 text-sm font-medium">{label}<input className="rounded-lg border border-black/10 px-3 py-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function NumberInput({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) { return <label className="grid gap-2 text-sm font-medium">{label}<input className="rounded-lg border border-black/10 px-3 py-3 font-normal" type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>; }
function Textarea({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) { return <label className="grid gap-2 text-sm font-medium">{label}<textarea className="min-h-24 rounded-lg border border-black/10 px-3 py-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function Actions({ disabled, onCancel, onSave }: { disabled?: boolean; onCancel: () => void; onSave: () => void }) { return <div className="flex justify-end gap-2 border-t border-black/10 pt-4"><button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={onCancel} type="button">Ləğv et</button><button className="rounded-lg bg-[#34a51d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={disabled} onClick={onSave} type="button">Yadda saxla</button></div>; }
