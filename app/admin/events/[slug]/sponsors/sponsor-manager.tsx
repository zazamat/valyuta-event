"use client";

import { useState } from "react";

type Sponsor = {
  name: string;
  tier: string;
  website: string;
  description: string;
  logo: string;
  logoZoom?: number;
  logoX?: number;
  logoY?: number;
};

type SponsorManagerProps = {
  initialSponsors: Sponsor[];
};

const emptySponsor: Sponsor = {
  description: "",
  logo: "/valyuta-logo.png",
  logoX: 50,
  logoY: 50,
  logoZoom: 1,
  name: "",
  tier: "Sponsor",
  website: "",
};

function normalizeSponsor(sponsor: Sponsor): Sponsor {
  return {
    logoX: 50,
    logoY: 50,
    logoZoom: 1,
    ...sponsor,
  };
}

export function SponsorManager({ initialSponsors }: SponsorManagerProps) {
  const [sponsors, setSponsors] = useState(initialSponsors.map(normalizeSponsor));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Sponsor>(emptySponsor);
  const [modal, setModal] = useState<"form" | "tiers" | "preview" | "delete" | "order" | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedSponsor = selectedIndex === null ? null : sponsors[selectedIndex];

  const openAdd = () => {
    setEditingIndex(null);
    setForm(emptySponsor);
    setModal("form");
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setForm(normalizeSponsor(sponsors[index]));
    setModal("form");
  };

  const saveSponsor = () => {
    if (!form.name.trim()) return;
    setSponsors((current) =>
      editingIndex === null
        ? [...current, form]
        : current.map((item, index) => (index === editingIndex ? form : item)),
    );
    setModal(null);
  };

  const deleteSponsor = () => {
    if (selectedIndex === null) return;
    setSponsors((current) => current.filter((_, index) => index !== selectedIndex));
    setSelectedIndex(null);
    setModal(null);
  };

  const moveSponsor = (index: number, direction: -1 | 1) => {
    setSponsors((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  };

  const loadLogo = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((current) => ({ ...current, logo: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          className="rounded-lg border border-[#101510] bg-[#101510] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#263126]"
          onClick={openAdd}
          type="button"
        >
          Sponsor əlavə et
        </button>
        <button
          className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold transition hover:border-[#34a51d]"
          onClick={() => setModal("order")}
          type="button"
        >
          Sıralamanı dəyiş
        </button>
        <button
          className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold transition hover:border-[#34a51d]"
          onClick={() => setModal("tiers")}
          type="button"
        >
          Tier-ləri tənzimlə
        </button>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {sponsors.map((sponsor, index) => (
          <article
            className={`overflow-hidden rounded-lg border border-black/10 bg-white ${
              sponsor.tier === "Baş sponsor" ? "lg:col-span-2" : ""
            }`}
            key={`${sponsor.name}-${index}`}
          >
            <div className={`relative grid aspect-[16/9] place-items-center bg-[#f5f7f6] p-6 ${sponsor.tier === "Baş sponsor" ? "min-h-72" : ""}`}>
              <LogoImage sponsor={sponsor} large={sponsor.tier === "Baş sponsor"} />
              <span className="absolute left-4 top-4 rounded bg-white px-2 py-1 text-xs font-semibold text-[#207b18] shadow-sm">
                {sponsor.tier}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className={sponsor.tier === "Baş sponsor" ? "text-2xl font-semibold" : "text-xl font-semibold"}>{sponsor.name}</h2>
                  <p className="mt-1 text-sm text-[#68736c]">{sponsor.website}</p>
                </div>
                <span className="rounded bg-[#eefaf5] px-2 py-1 text-xs font-semibold text-[#207b18]">
                  Aktiv
                </span>
              </div>
              <p className="mt-3 min-h-16 text-sm leading-6">{sponsor.description}</p>
              <dl className="mt-4 grid gap-2 rounded-lg bg-[#f5f7f6] p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#68736c]">Public kart</dt>
                  <dd className="font-semibold">{sponsor.tier === "Baş sponsor" ? "Böyük format" : "Standart format"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#68736c]">Logo</dt>
                  <dd className="font-semibold">Yüklənib</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold transition hover:border-[#34a51d]" onClick={() => openEdit(index)} type="button">
                  Düzəliş et
                </button>
                <button className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold transition hover:border-[#34a51d]" onClick={() => { setSelectedIndex(index); setModal("preview"); }} type="button">
                  Public preview
                </button>
                <button className="rounded-lg border border-[#ffd1cc] bg-white px-3 py-2 text-sm font-semibold text-[#b42318] transition hover:bg-[#fff0ed]" onClick={() => { setSelectedIndex(index); setModal("delete"); }} type="button">
                  Sil
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {sponsors.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/15 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold">Sponsor əlavə edilməyib</h2>
          <p className="mt-2 text-sm text-[#68736c]">
            İlk sponsor əlavə ediləndə public sponsor kartı burada görünəcək.
          </p>
        </div>
      ) : null}

      {modal === "form" ? (
        <Modal onClose={() => setModal(null)} title={editingIndex === null ? "Sponsor əlavə et" : "Sponsoru redaktə et"}>
          <div className="grid gap-5">
            <section className="rounded-lg border border-black/10 bg-[#f7faf8] p-4">
              <h3 className="font-semibold">Logo / şəkil</h3>
              <p className="mt-1 text-sm text-[#68736c]">
                Loqonu buradan yüklə və kart şablonuna uyğunlaşdır. Real sistemdə fayl media storage-a yazılacaq.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
                <div>
                  <div className="grid aspect-[16/9] place-items-center overflow-hidden rounded-lg border border-black/10 bg-white p-4">
                    <LogoImage sponsor={form} large />
                  </div>
                  <input accept="image/*" className="mt-3 w-full text-xs" onChange={(event) => loadLogo(event.target.files?.[0])} type="file" />
                </div>
                <div className="grid gap-3">
                  <Input label="Alternativ logo yolu" onChange={(value) => setForm({ ...form, logo: value })} value={form.logo} />
                  <Range label="Zoom" min={0.5} max={2} step={0.05} value={form.logoZoom ?? 1} onChange={(value) => setForm({ ...form, logoZoom: value })} />
                  <Range label="Üfüqi mövqe" min={0} max={100} step={1} value={form.logoX ?? 50} onChange={(value) => setForm({ ...form, logoX: value })} />
                  <Range label="Şaquli mövqe" min={0} max={100} step={1} value={form.logoY ?? 50} onChange={(value) => setForm({ ...form, logoY: value })} />
                </div>
              </div>
            </section>

            <Input label="Sponsor adı" onChange={(value) => setForm({ ...form, name: value })} value={form.name} />
            <label className="grid gap-2 text-sm font-medium">
              Status / tier
              <select className="rounded-lg border border-black/10 px-3 py-3 font-normal" onChange={(event) => setForm({ ...form, tier: event.target.value })} value={form.tier}>
                <option>Baş sponsor</option>
                <option>Sponsor</option>
                <option>Silver sponsor</option>
                <option>Media partner</option>
              </select>
            </label>
            <Input label="Sayt linki" onChange={(value) => setForm({ ...form, website: value })} value={form.website} />
            <label className="grid gap-2 text-sm font-medium">
              Təsvir
              <textarea className="min-h-24 rounded-lg border border-black/10 px-3 py-3 font-normal" onChange={(event) => setForm({ ...form, description: event.target.value })} value={form.description} />
            </label>
            <div className="flex flex-wrap justify-end gap-2 border-t border-black/10 pt-4">
              <button className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold" onClick={() => setModal(null)} type="button">Ləğv et</button>
              <button className="rounded-lg bg-[#34a51d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={!form.name.trim()} onClick={saveSponsor} type="button">Yadda saxla</button>
            </div>
          </div>
        </Modal>
      ) : null}

      {modal === "tiers" ? (
        <Modal onClose={() => setModal(null)} title="Sponsor statusları">
          <div className="grid gap-3">
            <TierInfo title="Baş sponsor" text="Ən başda və daha böyük logo/kart formatında göstərilir." />
            <TierInfo title="Sponsor" text="Standart sponsor kartı kimi göstərilir." />
            <TierInfo title="Silver sponsor" text="Sponsor siyahısında standart ölçüdə, Silver etiketi ilə görünür." />
            <TierInfo title="Media partner" text="Media tərəfdaşı kimi ayrıca etiketlənir." />
          </div>
        </Modal>
      ) : null}

      {modal === "order" ? (
        <Modal onClose={() => setModal(null)} title="Sponsor sıralaması">
          <div className="grid gap-3">
            {sponsors.map((sponsor, index) => (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 p-3" key={`${sponsor.name}-${index}`}>
                <strong>{index + 1}. {sponsor.name}</strong>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold disabled:opacity-40" disabled={index === 0} onClick={() => moveSponsor(index, -1)} type="button">Yuxarı</button>
                  <button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold disabled:opacity-40" disabled={index === sponsors.length - 1} onClick={() => moveSponsor(index, 1)} type="button">Aşağı</button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}

      {modal === "preview" && selectedSponsor ? (
        <Modal onClose={() => setModal(null)} title="Public sponsor preview">
          <article className="overflow-hidden rounded-lg border border-black/10 bg-white">
            <div className={`relative grid aspect-[16/9] place-items-center bg-[#f5f7f6] p-6 ${selectedSponsor.tier === "Baş sponsor" ? "min-h-72" : ""}`}>
              <LogoImage sponsor={selectedSponsor} large={selectedSponsor.tier === "Baş sponsor"} />
            </div>
            <div className="p-5">
              <span className="rounded bg-[#eefaf5] px-2 py-1 text-xs font-semibold text-[#207b18]">{selectedSponsor.tier}</span>
              <h2 className="mt-4 text-xl font-semibold">{selectedSponsor.name}</h2>
              <p className="mt-2 text-sm text-[#68736c]">{selectedSponsor.website}</p>
              <p className="mt-3 text-sm leading-6">{selectedSponsor.description}</p>
            </div>
          </article>
        </Modal>
      ) : null}

      {modal === "delete" && selectedSponsor ? (
        <Modal onClose={() => setModal(null)} title="Sponsoru sil">
          <p className="text-sm leading-6 text-[#56615b]"><strong>{selectedSponsor.name}</strong> sponsorunu siyahıdan silmək istəyirsən?</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold" onClick={() => setModal(null)} type="button">Ləğv et</button>
            <button className="rounded-lg bg-[#b42318] px-4 py-2 text-sm font-semibold text-white" onClick={deleteSponsor} type="button">Sil</button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function LogoImage({ large = false, sponsor }: { large?: boolean; sponsor: Sponsor }) {
  return (
    <img
      alt={sponsor.name || "Sponsor logo"}
      className="max-w-full object-contain"
      src={sponsor.logo}
      style={{
        height: large ? 112 : 80,
        objectPosition: `${sponsor.logoX ?? 50}% ${sponsor.logoY ?? 50}%`,
        transform: `scale(${sponsor.logoZoom ?? 1})`,
      }}
    />
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4">
      <div className="w-full max-w-2xl rounded-lg border border-black/10 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button className="grid size-10 place-items-center rounded-lg border border-black/10 text-xl" onClick={onClose} type="button">x</button>
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

function TierInfo({ text, title }: { text: string; title: string }) {
  return <div className="rounded-lg border border-black/10 p-4"><strong>{title}</strong><p className="mt-1 text-sm text-[#68736c]">{text}</p></div>;
}
