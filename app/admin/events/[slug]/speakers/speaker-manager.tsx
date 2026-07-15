"use client";

import { useState } from "react";

type Speaker = {
  name: string;
  role: string;
  company: string;
  bio: string;
  topic: string;
  linkedin: string;
  photo: string;
  imageZoom?: number;
  imageX?: number;
  imageY?: number;
};

const emptySpeaker: Speaker = {
  bio: "",
  company: "",
  imageX: 50,
  imageY: 50,
  imageZoom: 1,
  linkedin: "",
  name: "",
  photo: "/speaker-leyla.svg",
  role: "",
  topic: "",
};

function normalizeSpeaker(speaker: Speaker): Speaker {
  return {
    imageX: 50,
    imageY: 50,
    imageZoom: 1,
    ...speaker,
  };
}

export function SpeakerManager({ initialSpeakers }: { initialSpeakers: Speaker[] }) {
  const [speakers, setSpeakers] = useState(initialSpeakers.map(normalizeSpeaker));
  const [form, setForm] = useState<Speaker>(emptySpeaker);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modal, setModal] = useState<"form" | "preview" | "delete" | "order" | null>(null);
  const selected = selectedIndex === null ? null : speakers[selectedIndex];

  const openAdd = () => {
    setEditingIndex(null);
    setForm(emptySpeaker);
    setModal("form");
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setForm(normalizeSpeaker(speakers[index]));
    setModal("form");
  };

  const save = () => {
    if (!form.name.trim()) return;
    setSpeakers((current) =>
      editingIndex === null
        ? [...current, form]
        : current.map((item, index) => (index === editingIndex ? form : item)),
    );
    setModal(null);
  };

  const remove = () => {
    if (selectedIndex === null) return;
    setSpeakers((current) => current.filter((_, index) => index !== selectedIndex));
    setModal(null);
    setSelectedIndex(null);
  };

  const moveSpeaker = (index: number, direction: -1 | 1) => {
    setSpeakers((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  };

  const loadPhoto = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((current) => ({ ...current, photo: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={openAdd} type="button">
          Spiker əlavə et
        </button>
        <button className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold" onClick={() => setModal("order")} type="button">
          Sıralamanı dəyiş
        </button>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {speakers.map((speaker, index) => (
          <article className="overflow-hidden rounded-lg border border-black/10 bg-white" key={`${speaker.name}-${index}`}>
            <div className="grid gap-5 p-5 md:grid-cols-[120px_1fr]">
              <div className="grid justify-items-center gap-3">
                <AvatarImage speaker={speaker} size={112} />
                <span className="rounded bg-[#eefaf5] px-2 py-1 text-xs font-semibold text-[#207b18]">Public kart</span>
              </div>
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{speaker.name}</h2>
                    <p className="mt-1 text-sm text-[#68736c]">{speaker.role} · {speaker.company}</p>
                  </div>
                  <span className="rounded bg-[#f0f3f1] px-2 py-1 text-xs font-semibold text-[#4c5751]">Görünür</span>
                </div>
                <p className="mt-3 text-sm leading-6">{speaker.bio}</p>
                <div className="mt-4 rounded-lg bg-[#f5f7f6] p-3 text-sm">Mövzu: <strong>{speaker.topic}</strong></div>
              </div>
            </div>
            <div className="border-t border-black/10 px-5 py-4">
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => openEdit(index)} type="button">Düzəliş et</button>
                <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => { setSelectedIndex(index); setModal("preview"); }} type="button">Public preview</button>
                <button className="rounded-lg border border-[#ffd1cc] px-3 py-2 text-sm font-semibold text-[#b42318]" onClick={() => { setSelectedIndex(index); setModal("delete"); }} type="button">Sil</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {speakers.length === 0 ? <Empty title="Spiker əlavə edilməyib" /> : null}

      {modal === "form" ? (
        <Modal onClose={() => setModal(null)} title={editingIndex === null ? "Spiker əlavə et" : "Spikeri redaktə et"}>
          <div className="grid gap-5">
            <section className="rounded-lg border border-black/10 bg-[#f7faf8] p-4">
              <h3 className="font-semibold">Spiker şəkli</h3>
              <p className="mt-1 text-sm text-[#68736c]">
                Şəkli buradan yüklə. Real sistemdə fayl media storage-a yazılacaq, kartda isə avtomatik uyğun ölçüdə görünəcək.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-[160px_1fr]">
                <div className="grid justify-items-center gap-3">
                  <AvatarImage speaker={form} size={140} />
                  <input accept="image/*" className="w-full text-xs" onChange={(event) => loadPhoto(event.target.files?.[0])} type="file" />
                </div>
                <div className="grid gap-3">
                  <Input label="Alternativ şəkil yolu" value={form.photo} onChange={(value) => setForm({ ...form, photo: value })} />
                  <Range label="Zoom" min={1} max={2} step={0.05} value={form.imageZoom ?? 1} onChange={(value) => setForm({ ...form, imageZoom: value })} />
                  <Range label="Üfüqi mövqe" min={0} max={100} step={1} value={form.imageX ?? 50} onChange={(value) => setForm({ ...form, imageX: value })} />
                  <Range label="Şaquli mövqe" min={0} max={100} step={1} value={form.imageY ?? 50} onChange={(value) => setForm({ ...form, imageY: value })} />
                </div>
              </div>
            </section>

            <Input label="Ad soyad" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Input label="Vəzifə" value={form.role} onChange={(value) => setForm({ ...form, role: value })} />
            <Input label="Şirkət" value={form.company} onChange={(value) => setForm({ ...form, company: value })} />
            <Input label="Mövzu" value={form.topic} onChange={(value) => setForm({ ...form, topic: value })} />
            <Input label="LinkedIn" value={form.linkedin} onChange={(value) => setForm({ ...form, linkedin: value })} />
            <Textarea label="Bio" value={form.bio} onChange={(value) => setForm({ ...form, bio: value })} />
            <Actions onCancel={() => setModal(null)} onSave={save} disabled={!form.name.trim()} />
          </div>
        </Modal>
      ) : null}

      {modal === "preview" && selected ? (
        <Modal onClose={() => setModal(null)} title="Public spiker preview">
          <div className="grid justify-items-center rounded-lg border border-black/10 p-6 text-center">
            <AvatarImage speaker={selected} size={128} />
            <h2 className="mt-4 text-2xl font-semibold">{selected.name}</h2>
            <p className="mt-1 text-sm text-[#68736c]">{selected.role} · {selected.company}</p>
            <p className="mt-4 text-sm leading-6">{selected.bio}</p>
          </div>
        </Modal>
      ) : null}

      {modal === "delete" && selected ? (
        <Modal onClose={() => setModal(null)} title="Spikeri sil">
          <p><strong>{selected.name}</strong> spikerini silmək istəyirsən?</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={() => setModal(null)} type="button">Ləğv et</button>
            <button className="rounded-lg bg-[#b42318] px-4 py-2 text-sm font-semibold text-white" onClick={remove} type="button">Sil</button>
          </div>
        </Modal>
      ) : null}

      {modal === "order" ? (
        <Modal onClose={() => setModal(null)} title="Spiker sıralaması">
          <div className="grid gap-3">
            {speakers.map((speaker, index) => (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 p-3" key={`${speaker.name}-${index}`}>
                <strong>{index + 1}. {speaker.name}</strong>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold disabled:opacity-40" disabled={index === 0} onClick={() => moveSpeaker(index, -1)} type="button">Yuxarı</button>
                  <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold disabled:opacity-40" disabled={index === speakers.length - 1} onClick={() => moveSpeaker(index, 1)} type="button">Aşağı</button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function AvatarImage({ size, speaker }: { size: number; speaker: Speaker }) {
  return (
    <div className="overflow-hidden rounded-full border border-black/10 bg-white" style={{ height: size, width: size }}>
      <img
        alt={speaker.name || "Spiker şəkli"}
        className="h-full w-full object-cover"
        src={speaker.photo}
        style={{
          objectPosition: `${speaker.imageX ?? 50}% ${speaker.imageY ?? 50}%`,
          transform: `scale(${speaker.imageZoom ?? 1})`,
        }}
      />
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button className="grid size-10 place-items-center rounded-lg border border-black/10" onClick={onClose} type="button">x</button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return <label className="grid gap-2 text-sm font-medium">{label}<input className="rounded-lg border border-black/10 px-3 py-3 font-normal" onChange={(event) => onChange(event.target.value)} value={value} /></label>;
}

function Range({ label, max, min, onChange, step, value }: { label: string; max: number; min: number; onChange: (value: number) => void; step: number; value: number }) {
  return <label className="grid gap-2 text-sm font-medium">{label}<input max={max} min={min} onChange={(event) => onChange(Number(event.target.value))} step={step} type="range" value={value} /></label>;
}

function Textarea({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return <label className="grid gap-2 text-sm font-medium">{label}<textarea className="min-h-24 rounded-lg border border-black/10 px-3 py-3 font-normal" onChange={(event) => onChange(event.target.value)} value={value} /></label>;
}

function Actions({ disabled, onCancel, onSave }: { disabled?: boolean; onCancel: () => void; onSave: () => void }) {
  return <div className="flex justify-end gap-2 border-t border-black/10 pt-4"><button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={onCancel} type="button">Ləğv et</button><button className="rounded-lg bg-[#34a51d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={disabled} onClick={onSave} type="button">Yadda saxla</button></div>;
}

function Empty({ title }: { title: string }) {
  return <div className="rounded-lg border border-dashed border-black/15 bg-white p-8 text-center"><h2 className="text-xl font-semibold">{title}</h2></div>;
}
