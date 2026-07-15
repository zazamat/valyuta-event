"use client";

import { useState } from "react";

type DemoTicket = {
  name: string;
  price: number;
  type: string;
  description: string;
  available: number;
};

type Ticket = DemoTicket & {
  status: "Aktiv" | "Dayandırılıb";
};

const emptyTicket: Ticket = {
  available: 100,
  description: "",
  name: "",
  price: 0,
  status: "Aktiv",
  type: "Fiziki iştirak",
};

export function TicketManager({
  capacity,
  initialTickets,
}: {
  capacity: number;
  initialTickets: DemoTicket[];
}) {
  const [tickets, setTickets] = useState<Ticket[]>(
    initialTickets.map((ticket) => ({ ...ticket, status: "Aktiv" })),
  );
  const [form, setForm] = useState<Ticket>(emptyTicket);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modal, setModal] = useState<"form" | "status" | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex === null ? null : tickets[selectedIndex];

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
    setModal(null);
    setSelectedIndex(null);
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={openAdd} type="button">
          Bilet növü əlavə et
        </button>
      </div>
      <section className="grid gap-4 lg:grid-cols-3">
        {tickets.map((ticket, index) => {
          const sold = Math.max(0, capacity - ticket.available);
          const progress = Math.min(Math.round((sold / Math.max(capacity, 1)) * 100), 100);

          return (
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
              <p className="mt-3 min-h-14 text-sm leading-6">{ticket.description}</p>
              <div className="mt-4 h-2 overflow-hidden rounded bg-[#e7ece9]">
                <span className="block h-full rounded bg-[#34a51d]" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span>Qalıb: {ticket.available}</span>
                <span>Demo satış: {sold}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => openEdit(index)} type="button">Düzəliş et</button>
                <button className="rounded-lg border border-[#ffd1cc] px-3 py-2 text-sm font-semibold text-[#b42318]" onClick={() => { setSelectedIndex(index); setModal("status"); }} type="button">
                  {ticket.status === "Aktiv" ? "Satışı dayandır" : "Satışı aktiv et"}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {modal === "form" ? (
        <Modal title={editingIndex === null ? "Bilet əlavə et" : "Bileti redaktə et"} onClose={() => setModal(null)}>
          <div className="grid gap-4">
            <Input label="Bilet adı" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Input label="İştirak tipi" value={form.type} onChange={(value) => setForm({ ...form, type: value })} />
            <NumberInput label="Qiymət" value={form.price} onChange={(value) => setForm({ ...form, price: value })} />
            <NumberInput label="Qalan say" value={form.available} onChange={(value) => setForm({ ...form, available: value })} />
            <label className="grid gap-2 text-sm font-medium">
              Status
              <select className="rounded-lg border border-black/10 px-3 py-3 font-normal" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Ticket["status"] })}>
                <option>Aktiv</option>
                <option>Dayandırılıb</option>
              </select>
            </label>
            <Textarea label="Təsvir" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
            <Actions disabled={!form.name.trim()} onCancel={() => setModal(null)} onSave={save} />
          </div>
        </Modal>
      ) : null}

      {modal === "status" && selected ? (
        <Modal title="Satış statusu" onClose={() => setModal(null)}>
          <p><strong>{selected.name}</strong> üçün satış statusunu dəyişmək istəyirsən?</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={() => setModal(null)} type="button">Ləğv et</button>
            <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={toggleStatus} type="button">Təsdiq et</button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4"><div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-black/10 px-5 py-4"><h2 className="text-xl font-semibold">{title}</h2><button className="grid size-10 place-items-center rounded-lg border border-black/10" onClick={onClose} type="button">x</button></div><div className="p-5">{children}</div></div></div>;
}
function Input({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) { return <label className="grid gap-2 text-sm font-medium">{label}<input className="rounded-lg border border-black/10 px-3 py-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function NumberInput({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) { return <label className="grid gap-2 text-sm font-medium">{label}<input className="rounded-lg border border-black/10 px-3 py-3 font-normal" type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>; }
function Textarea({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) { return <label className="grid gap-2 text-sm font-medium">{label}<textarea className="min-h-24 rounded-lg border border-black/10 px-3 py-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function Actions({ disabled, onCancel, onSave }: { disabled?: boolean; onCancel: () => void; onSave: () => void }) { return <div className="flex justify-end gap-2 border-t border-black/10 pt-4"><button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={onCancel} type="button">Ləğv et</button><button className="rounded-lg bg-[#34a51d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={disabled} onClick={onSave} type="button">Yadda saxla</button></div>; }
