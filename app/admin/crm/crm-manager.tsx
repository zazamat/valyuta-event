"use client";

import { useMemo, useState } from "react";
import {
  abandonedCheckouts,
  adAudiences,
  attributionRows,
  crmContacts,
  crmParticipants,
  crmSegments,
  dataIssues,
  money,
  type AbandonedCheckout,
  type AdAudience,
  type AttributionRow,
  type CrmContact,
  type CrmParticipant,
  type CrmSegment,
  type DataIssue,
} from "./crm-data";

type Module =
  | "contacts"
  | "participants"
  | "abandoned"
  | "segments"
  | "audiences"
  | "attribution"
  | "quality"
  | "smart";

type Toast = {
  id: number;
  text: string;
};

const platformPixels = [
  ["Meta Pixel", "PageView, ViewContent, InitiateCheckout, Purchase", "Aktiv"],
  ["GA4", "traffic_source, purchase, refund, checkout_progress", "Aktiv"],
  ["LinkedIn Insight Tag", "Event page visit, Lead, Purchase", "Yoxlanılıb"],
  ["TikTok Pixel", "ViewContent, AddToCart, CompletePayment", "Planlaşdırılıb"],
];

function downloadFile(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csv(rows: Array<Record<string, string | number>>) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  return [keys.map(escape).join(","), ...rows.map((row) => keys.map((key) => escape(row[key] ?? "")).join(","))].join("\n");
}

function statusClass(status: string) {
  const lower = status.toLowerCase();
  if (lower.includes("aktiv") || lower.includes("sinxron") || lower.includes("ödə") || lower.includes("həll")) {
    return "bg-[#e9f8ee] text-[#106142] ring-[#bde6c6]";
  }
  if (lower.includes("göz") || lower.includes("plan") || lower.includes("lazım") || lower.includes("orta")) {
    return "bg-[#fff6df] text-[#8a5a00] ring-[#f1d58d]";
  }
  if (lower.includes("ləğv") || lower.includes("yüksək") || lower.includes("yoxdur")) {
    return "bg-[#fff0ed] text-[#b42318] ring-[#ffc9bf]";
  }
  return "bg-[#eef3f0] text-[#4d5752] ring-[#d6e0da]";
}

function Pill({ children }: { children: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(children)}`}>{children}</span>;
}

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-[#d6e0da] bg-white p-5">
      <p className="text-sm text-[#68736c]">{label}</p>
      <strong className="mt-2 block text-2xl">{value}</strong>
      {note && <span className="mt-1 block text-xs text-[#68736c]">{note}</span>}
    </div>
  );
}

function Toolbar({
  children,
  count,
  onExport,
}: {
  children: React.ReactNode;
  count: number;
  onExport: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#d6e0da] bg-white p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <div className="grid gap-3 md:grid-cols-3">{children}</div>
        <span className="text-sm text-[#5b665f]">Tapıldı: <strong>{count}</strong></span>
        <button className="rounded-lg border border-[#c9d8cf] px-4 py-3 text-sm font-semibold hover:bg-[#f3f7f4]" onClick={onExport}>
          CSV export
        </button>
      </div>
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-[#d6e0da] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#34a51d]"
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-[#d6e0da] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#34a51d]"
    />
  );
}

function ToastBox({ toast }: { toast: Toast | null }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-lg border border-[#bde6c6] bg-white px-4 py-3 text-sm font-medium text-[#106142] shadow-lg">
      {toast.text}
    </div>
  );
}

function CrmTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#d6e0da] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-[#f6faf7]">
            <tr>
              {headers.map((header) => (
                <th className="border-b border-r border-[#dfe8e2] px-4 py-3 text-left font-semibold last:border-r-0" key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  );
}

function DetailModal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/45 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#d6e0da] px-6 py-5">
          <div>
            <p className="text-sm text-[#68736c]">CRM detalı</p>
            <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
          </div>
          <button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-sm font-semibold" onClick={onClose}>
            Bağla
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function CrmManager({ module }: { module: Module }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const notify = (text: string) => {
    const next = { id: Date.now(), text };
    setToast(next);
    window.setTimeout(() => setToast((current) => (current?.id === next.id ? null : current)), 2800);
  };

  return (
    <>
      {module === "contacts" && <ContactsModule notify={notify} />}
      {module === "participants" && <ParticipantsModule notify={notify} />}
      {module === "abandoned" && <AbandonedModule notify={notify} />}
      {module === "segments" && <SegmentsModule notify={notify} />}
      {module === "audiences" && <AudiencesModule notify={notify} />}
      {module === "attribution" && <AttributionModule notify={notify} />}
      {module === "quality" && <QualityModule notify={notify} />}
      {module === "smart" && <SmartTablesModule notify={notify} />}
      <ToastBox toast={toast} />
    </>
  );
}

function ContactsModule({ notify }: { notify: (text: string) => void }) {
  const [rows, setRows] = useState(crmContacts);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [consent, setConsent] = useState("all");
  const [selected, setSelected] = useState<CrmContact | null>(null);
  const sources = Array.from(new Set(rows.map((row) => row.source)));
  const filtered = rows.filter((row) => {
    const haystack = [row.name, row.email, row.phone, row.company, row.role, row.interests.join(" ")].join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase()) && (source === "all" || row.source === source) && (consent === "all" || row.consent === consent);
  });

  const tagContact = (id: string) => {
    setRows((items) => items.map((item) => (item.id === id && !item.interests.includes("Retargeting") ? { ...item, interests: [...item.interests, "Retargeting"] } : item)));
    notify("Kontakt Retargeting tag-i ilə işarələndi.");
  };

  const updateConsent = (id: string) => {
    setRows((items) => items.map((item) => (item.id === id ? { ...item, consent: "Email+SMS" } : item)));
    notify("Demo consent Email+SMS olaraq yeniləndi.");
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Kontakt bazası" value={`${rows.length}`} note="Dublikatlar data keyfiyyətində izlənir" />
        <Kpi label="Marketinq razılığı" value={`${rows.filter((row) => row.consent !== "Yoxdur").length}`} note="Email/SMS kampaniyaları üçün" />
        <Kpi label="Aktiv müştəri" value={`${rows.filter((row) => row.lifecycle === "Müştəri").length}`} />
        <Kpi label="CRM gəliri" value={money(rows.reduce((sum, row) => sum + row.spend, 0))} />
      </div>
      <Toolbar
        count={filtered.length}
        onExport={() => {
          downloadFile("vevent-crm-kontaktlar.csv", csv(filtered.map((row) => ({ id: row.id, ad: row.name, email: row.email, telefon: row.phone, merhele: row.lifecycle, maraqlar: row.interests.join("; "), consent: row.consent }))));
          notify("Kontaktlar CSV olaraq hazırlandı.");
        }}
      >
        <TextInput placeholder="Ad, email, telefon, şirkət və maraq axtar" value={query} onChange={(event) => setQuery(event.target.value)} />
        <SelectInput value={source} onChange={(event) => setSource(event.target.value)}>
          <option value="all">Mənbə: hamısı</option>
          {sources.map((item) => <option key={item}>{item}</option>)}
        </SelectInput>
        <SelectInput value={consent} onChange={(event) => setConsent(event.target.value)}>
          <option value="all">Consent: hamısı</option>
          {["Email+SMS", "Email", "SMS", "Yoxdur"].map((item) => <option key={item}>{item}</option>)}
        </SelectInput>
      </Toolbar>
      <CrmTable
        headers={["Kontakt", "Şirkət / rol", "Mərhələ", "Maraq", "Mənbə", "Consent", "Əməliyyat"]}
        rows={filtered.map((row) => (
          <tr className="border-b border-[#e5ece8] last:border-b-0" key={row.id}>
            <td className="border-r border-[#edf2ef] px-4 py-3"><strong>{row.name}</strong><span className="mt-1 block text-xs text-[#68736c]">{row.email} · {row.phone}</span></td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.company}<span className="block text-xs text-[#68736c]">{row.role}</span></td>
            <td className="border-r border-[#edf2ef] px-4 py-3"><Pill>{row.lifecycle}</Pill></td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.interests.join(", ")}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.source}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3"><Pill>{row.consent}</Pill></td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => setSelected(row)}>Detal</button>
                <button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => tagContact(row.id)}>Tag</button>
                <button className="rounded-lg bg-[#34a51d] px-3 py-2 text-xs font-semibold text-white" onClick={() => notify(`${row.email} üçün email kampaniya növbəyə əlavə edildi.`)}>Email</button>
              </div>
            </td>
          </tr>
        ))}
      />
      {selected && (
        <DetailModal title={selected.name} onClose={() => setSelected(null)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Email" value={selected.email} />
            <Info label="Telefon" value={selected.phone} />
            <Info label="Şirkət / rol" value={`${selected.company} · ${selected.role}`} />
            <Info label="İştirak etdiyi tədbirlər" value={selected.events.join(", ") || "Yoxdur"} />
            <Info label="Maraq profili" value={selected.interests.join(", ")} />
            <Info label="Son aktivlik" value={selected.lastActivity} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white" onClick={() => notify("Kontakt AI/Fintech seqmentinə əlavə edildi.")}>Seqmentə əlavə et</button>
            <button className="rounded-lg border border-[#c9d8cf] px-4 py-3 text-sm font-semibold" onClick={() => updateConsent(selected.id)}>Consent yenilə</button>
            <button className="rounded-lg border border-[#c9d8cf] px-4 py-3 text-sm font-semibold" onClick={() => notify("Kontakt tarixçəsinə demo qeyd əlavə edildi.")}>Qeyd əlavə et</button>
          </div>
        </DetailModal>
      )}
    </div>
  );
}

function ParticipantsModule({ notify }: { notify: (text: string) => void }) {
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [checkIn, setCheckIn] = useState("all");
  const events = Array.from(new Set(crmParticipants.map((row) => row.event)));
  const filtered = crmParticipants.filter((row) => {
    const haystack = [row.name, row.email, row.phone, row.event, row.ticket, row.interests].join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase()) && (eventFilter === "all" || row.event === eventFilter) && (checkIn === "all" || row.checkIn === checkIn);
  });
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="İştirakçı qeydi" value={`${crmParticipants.length}`} />
        <Kpi label="Ödənişi tamamlanan" value={`${crmParticipants.filter((row) => row.status === "Ödənilib").length}`} />
        <Kpi label="Check-in gözləyir" value={`${crmParticipants.filter((row) => row.checkIn === "Gözləyir").length}`} />
        <Kpi label="Unikal tədbir" value={`${events.length}`} />
      </div>
      <Toolbar count={filtered.length} onExport={() => { downloadFile("vevent-istirakcilar.csv", csv(filtered)); notify("İştirakçı siyahısı export edildi."); }}>
        <TextInput placeholder="Ad, email, telefon, tədbir axtar" value={query} onChange={(event) => setQuery(event.target.value)} />
        <SelectInput value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}>
          <option value="all">Tədbir: hamısı</option>
          {events.map((item) => <option key={item}>{item}</option>)}
        </SelectInput>
        <SelectInput value={checkIn} onChange={(event) => setCheckIn(event.target.value)}>
          <option value="all">Check-in: hamısı</option>
          {Array.from(new Set(crmParticipants.map((row) => row.checkIn))).map((item) => <option key={item}>{item}</option>)}
        </SelectInput>
      </Toolbar>
      <CrmTable
        headers={["İştirakçı", "Tədbir", "Bilet", "Status", "Check-in", "Mənbə", "Əməliyyat"]}
        rows={filtered.map((row) => (
          <tr className="border-b border-[#e5ece8] last:border-b-0" key={row.id}>
            <td className="border-r border-[#edf2ef] px-4 py-3"><strong>{row.name}</strong><span className="block text-xs text-[#68736c]">{row.email} · {row.phone}</span></td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.event}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.ticket}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3"><Pill>{row.status}</Pill></td>
            <td className="border-r border-[#edf2ef] px-4 py-3"><Pill>{row.checkIn}</Pill></td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.source}</td>
            <td className="px-4 py-3"><button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => notify(`${row.name} üçün bilet kabineti açıldı.`)}>Bilet kabineti</button></td>
          </tr>
        ))}
      />
    </div>
  );
}

function AbandonedModule({ notify }: { notify: (text: string) => void }) {
  const [rows, setRows] = useState(abandonedCheckouts);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const filtered = rows.filter((row) => [row.name, row.email, row.phone, row.event, row.source, row.utmCampaign].join(" ").toLowerCase().includes(query.toLowerCase()) && (stage === "all" || row.stage === stage));
  const potential = filtered.reduce((sum, row) => sum + row.amount, 0);
  const markDone = (id: string) => {
    setRows((items) => items.map((item) => (item.id === id ? { ...item, followUp: "Tamamlandı kimi işarələndi" } : item)));
    notify("Yarımçıq checkout tamamlandı kimi işarələndi.");
  };
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Yarımçıq sifariş" value={`${rows.length}`} />
        <Kpi label="Potensial gəlir" value={money(potential)} />
        <Kpi label="Ödənişə keçən" value={`${rows.filter((row) => row.stage === "Ödənişə keçdi").length}`} />
        <Kpi label="Promo uyğun" value={`${rows.filter((row) => row.followUp.includes("Promo")).length}`} />
      </div>
      <Toolbar count={filtered.length} onExport={() => { downloadFile("vevent-yarimciq-checkout.csv", csv(filtered)); notify("Yarımçıq checkout hesabatı export edildi."); }}>
        <TextInput placeholder="Ad, email, telefon, UTM axtar" value={query} onChange={(event) => setQuery(event.target.value)} />
        <SelectInput value={stage} onChange={(event) => setStage(event.target.value)}>
          <option value="all">Mərhələ: hamısı</option>
          {Array.from(new Set(rows.map((row) => row.stage))).map((item) => <option key={item}>{item}</option>)}
        </SelectInput>
        <button className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white" onClick={() => notify("Recovery kampaniyası 3 nəfər üçün növbəyə əlavə edildi.")}>Recovery kampaniyası</button>
      </Toolbar>
      <CrmTable
        headers={["Kontakt", "Tədbir / bilet", "Məbləğ", "Mərhələ", "Səbəb", "Mənbə / UTM", "Follow-up"]}
        rows={filtered.map((row) => (
          <tr className="border-b border-[#e5ece8] last:border-b-0" key={row.id}>
            <td className="border-r border-[#edf2ef] px-4 py-3"><strong>{row.name}</strong><span className="block text-xs text-[#68736c]">{row.email} · {row.phone}</span></td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.event}<span className="block text-xs text-[#68736c]">{row.ticket}</span></td>
            <td className="border-r border-[#edf2ef] px-4 py-3 font-semibold">{money(row.amount)}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3"><Pill>{row.stage}</Pill></td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.reason}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.source}<span className="block text-xs text-[#68736c]">{row.utmCampaign}</span></td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => notify(`${row.email} üçün bərpa linki göndərildi.`)}>Link göndər</button>
                <button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => notify(`${row.name} üçün 10% promo təklifi hazırlandı.`)}>Promo</button>
                <button className="rounded-lg bg-[#34a51d] px-3 py-2 text-xs font-semibold text-white" onClick={() => markDone(row.id)}>Tamamla</button>
              </div>
              <span className="mt-2 block text-xs text-[#68736c]">{row.followUp}</span>
            </td>
          </tr>
        ))}
      />
    </div>
  );
}

function SegmentsModule({ notify }: { notify: (text: string) => void }) {
  const [rows, setRows] = useState(crmSegments);
  const [name, setName] = useState("");
  const [rule, setRule] = useState("AI marağı + email consent");
  const create = () => {
    if (!name.trim()) {
      notify("Seqment adı yazılmalıdır.");
      return;
    }
    setRows((items) => [{ id: `SEG-${items.length + 1}`.padStart(6, "0"), name, rule, size: 0, channel: "Email", sync: "Yeni", lastSync: "Hələ yoxdur" }, ...items]);
    setName("");
    notify("Yeni seqment yaradıldı.");
  };
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-lg border border-[#d6e0da] bg-white p-5">
          <h2 className="text-xl font-semibold">Seqment yarat</h2>
          <div className="mt-4 grid gap-3">
            <TextInput placeholder="Seqment adı" value={name} onChange={(event) => setName(event.target.value)} />
            <SelectInput value={rule} onChange={(event) => setRule(event.target.value)}>
              <option>AI marağı + email consent</option>
              <option>Checkout yarımçıq + son 14 gün</option>
              <option>VIP alıcı + finance şirkəti</option>
              <option>Keçmiş tədbir iştirakçısı + yeni tədbir uyğunluğu</option>
            </SelectInput>
            <button className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white" onClick={create}>Seqment yarat</button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Kpi label="Seqment sayı" value={`${rows.length}`} />
          <Kpi label="Auditoriya ölçüsü" value={`${rows.reduce((sum, row) => sum + row.size, 0)}`} />
          <Kpi label="Sinxron seqment" value={`${rows.filter((row) => row.sync === "Sinxron").length}`} />
        </div>
      </div>
      <CrmTable
        headers={["Seqment", "Qayda", "Ölçü", "Kanal", "Sync", "Əməliyyat"]}
        rows={rows.map((row) => (
          <tr className="border-b border-[#e5ece8] last:border-b-0" key={row.id}>
            <td className="border-r border-[#edf2ef] px-4 py-3"><strong>{row.name}</strong><span className="block text-xs text-[#68736c]">{row.id}</span></td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.rule}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.size}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.channel}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3"><Pill>{row.sync}</Pill><span className="block text-xs text-[#68736c]">{row.lastSync}</span></td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => notify(`${row.name} export edildi.`)}>Export</button>
                <button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => notify(`${row.name} Meta/LinkedIn üçün sinxron növbəsinə əlavə edildi.`)}>Sync</button>
                <button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => setRows((items) => [{ ...row, id: `${row.id}-COPY`, name: `${row.name} kopya`, sync: "Yeni" }, ...items])}>Kopyala</button>
              </div>
            </td>
          </tr>
        ))}
      />
    </div>
  );
}

function AudiencesModule({ notify }: { notify: (text: string) => void }) {
  const [rows, setRows] = useState(adAudiences);
  const create = () => {
    setRows((items) => [{ id: `AUD-${Date.now().toString().slice(-3)}`, name: "Yeni retargeting auditoriyası", platform: "Meta", rule: "Event page visit, 30 gün", size: 0, matchRate: 0, consentCoverage: 100, sync: "Yeni", lastSync: "Hələ yoxdur" }, ...items]);
    notify("Yeni reklam auditoriyası yaradıldı.");
  };
  return (
    <div className="grid gap-5">
      <div className="rounded-lg border border-[#d6e0da] bg-white p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold">Reklam auditoriyaları</h2>
            <p className="mt-1 text-sm text-[#68736c]">Custom audience, lookalike və retargeting siyahıları consent qaydası ilə idarə olunur.</p>
          </div>
          <button className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white" onClick={create}>Yeni auditoriya yarat</button>
        </div>
      </div>
      <CrmTable
        headers={["Auditoriya", "Platforma", "Qayda", "Ölçü", "Match", "Consent", "Sync"]}
        rows={rows.map((row) => (
          <tr className="border-b border-[#e5ece8] last:border-b-0" key={row.id}>
            <td className="border-r border-[#edf2ef] px-4 py-3"><strong>{row.name}</strong><span className="block text-xs text-[#68736c]">{row.id}</span></td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.platform}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.rule}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.size.toLocaleString("az-AZ")}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.matchRate}%</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.consentCoverage}%</td>
            <td className="px-4 py-3">
              <Pill>{row.sync}</Pill>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => notify(`${row.platform} sync növbəyə əlavə edildi.`)}>Sync</button>
                <button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => { downloadFile(`${row.id}-hashed-audience.txt`, `sha256_email,sha256_phone\n${row.id}_demo_hash,email_phone_hash`, "text/plain;charset=utf-8"); notify("Hash-lənmiş demo siyahı yükləndi."); }}>Hash export</button>
              </div>
            </td>
          </tr>
        ))}
      />
    </div>
  );
}

function AttributionModule({ notify }: { notify: (text: string) => void }) {
  const [platform, setPlatform] = useState("all");
  const [query, setQuery] = useState("");
  const rows = attributionRows.filter((row) => (platform === "all" || row.platform === platform) && [row.campaign, row.adSet, row.ad].join(" ").toLowerCase().includes(query.toLowerCase()));
  const totals = useMemo(() => rows.reduce((acc, row) => ({ spend: acc.spend + row.spend, revenue: acc.revenue + row.revenue, purchases: acc.purchases + row.purchases, clicks: acc.clicks + row.clicks }), { spend: 0, revenue: 0, purchases: 0, clicks: 0 }), [rows]);
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Reklam xərci" value={money(totals.spend)} />
        <Kpi label="Gəlir" value={money(totals.revenue)} />
        <Kpi label="ROAS" value={totals.spend ? `${(totals.revenue / totals.spend).toFixed(1)}x` : "Pulsuz"} />
        <Kpi label="Alış" value={`${totals.purchases}`} />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {platformPixels.map(([name, events, status]) => (
          <div className="rounded-lg border border-[#d6e0da] bg-white p-4" key={name}>
            <div className="flex items-center justify-between gap-3"><strong>{name}</strong><Pill>{status}</Pill></div>
            <p className="mt-2 text-xs text-[#68736c]">{events}</p>
          </div>
        ))}
      </div>
      <Toolbar count={rows.length} onExport={() => { downloadFile("vevent-utm-attribution.csv", csv(rows.map((row) => ({ ...row, ctr: `${((row.clicks / row.impressions) * 100).toFixed(2)}%`, cvr: `${((row.purchases / row.visitors) * 100).toFixed(2)}%`, roas: row.spend ? (row.revenue / row.spend).toFixed(2) : "0" })))); notify("Attribution hesabatı export edildi."); }}>
        <TextInput placeholder="Kampaniya, ad set, reklam axtar" value={query} onChange={(event) => setQuery(event.target.value)} />
        <SelectInput value={platform} onChange={(event) => setPlatform(event.target.value)}>
          <option value="all">Platforma: hamısı</option>
          {Array.from(new Set(attributionRows.map((row) => row.platform))).map((item) => <option key={item}>{item}</option>)}
        </SelectInput>
        <button className="rounded-lg border border-[#c9d8cf] px-4 py-3 text-sm font-semibold" onClick={() => { navigator.clipboard?.writeText("https://vevent.az/events/ai-finance-summit-2026?utm_source=meta&utm_medium=paid&utm_campaign=ai_finance_awareness&utm_content=speaker_teaser"); notify("UTM link kopyalandı."); }}>UTM link yarat</button>
      </Toolbar>
      <CrmTable
        headers={["Platforma", "Kampaniya", "Ad set / reklam", "Xərc", "Klik", "Checkout", "Alış", "Gəlir", "ROAS"]}
        rows={rows.map((row) => (
          <tr className="border-b border-[#e5ece8] last:border-b-0" key={row.id}>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.platform}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3"><strong>{row.campaign}</strong></td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.adSet}<span className="block text-xs text-[#68736c]">{row.ad}</span></td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{money(row.spend)}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.clicks}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.checkoutStarts}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.purchases}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3 font-semibold">{money(row.revenue)}</td>
            <td className="px-4 py-3">{row.spend ? `${(row.revenue / row.spend).toFixed(1)}x` : "Pulsuz"}</td>
          </tr>
        ))}
      />
    </div>
  );
}

function QualityModule({ notify }: { notify: (text: string) => void }) {
  const [rows, setRows] = useState(dataIssues);
  const [severity, setSeverity] = useState("all");
  const filtered = rows.filter((row) => severity === "all" || row.severity === severity);
  const resolveIssue = (id: string) => {
    setRows((items) => items.map((item) => (item.id === id ? { ...item, status: "Həll edildi" } : item)));
    notify("Data problemi həll edildi kimi qeyd olundu.");
  };
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Açıq problem" value={`${rows.filter((row) => row.status !== "Həll edildi").length}`} />
        <Kpi label="Yüksək risk" value={`${rows.filter((row) => row.severity === "Yüksək").length}`} />
        <Kpi label="Həll edilən" value={`${rows.filter((row) => row.status === "Həll edildi").length}`} />
        <Kpi label="Consent problemi" value={`${rows.filter((row) => row.type.includes("Razılıq")).length}`} />
      </div>
      <Toolbar count={filtered.length} onExport={() => { downloadFile("vevent-data-keyfiyyeti.csv", csv(filtered)); notify("Data keyfiyyəti hesabatı export edildi."); }}>
        <SelectInput value={severity} onChange={(event) => setSeverity(event.target.value)}>
          <option value="all">Risk: hamısı</option>
          {["Yüksək", "Orta", "Aşağı"].map((item) => <option key={item}>{item}</option>)}
        </SelectInput>
        <button className="rounded-lg border border-[#c9d8cf] px-4 py-3 text-sm font-semibold" onClick={() => notify("Avtomatik dublikat yoxlaması işə salındı.")}>Dublikat yoxla</button>
        <button className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white" onClick={() => notify("Consent yeniləmə kampaniyası hazırlandı.")}>Consent kampaniyası</button>
      </Toolbar>
      <CrmTable
        headers={["Problem", "Risk", "Kontakt", "Təsvir", "Tövsiyə", "Status", "Əməliyyat"]}
        rows={filtered.map((row) => (
          <tr className="border-b border-[#e5ece8] last:border-b-0" key={row.id}>
            <td className="border-r border-[#edf2ef] px-4 py-3"><strong>{row.type}</strong><span className="block text-xs text-[#68736c]">{row.id}</span></td>
            <td className="border-r border-[#edf2ef] px-4 py-3"><Pill>{row.severity}</Pill></td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.contact}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.issue}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{row.suggestion}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3"><Pill>{row.status}</Pill></td>
            <td className="px-4 py-3"><button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => resolveIssue(row.id)}>Həll et</button></td>
          </tr>
        ))}
      />
    </div>
  );
}

function SmartTablesModule({ notify }: { notify: (text: string) => void }) {
  const views = [
    ["Kontaktlar - marketinq görünüşü", "Ad, email, telefon, consent, maraq, son aktivlik", "CRM komandası"],
    ["Yarımçıq checkout recovery", "Mərhələ, səbəb, məbləğ, UTM, follow-up", "Satış komandası"],
    ["Reklam attribution", "Platforma, kampaniya, xərc, gəlir, ROAS", "Marketinq"],
    ["Data keyfiyyəti", "Risk, problem, tövsiyə, status", "Admin"],
  ];
  return (
    <div className="grid gap-5">
      <div className="rounded-lg border border-[#d6e0da] bg-white p-5">
        <h2 className="text-xl font-semibold">Smart cədvəl standartı</h2>
        <p className="mt-2 max-w-3xl text-sm text-[#68736c]">Bu bölmə gələcəkdə bütün CRM cədvəllərinin sütun seçimi, sıralama, səhifələnmə, saxlanmış görünüş və export qaydasını bir yerdə idarə edəcək.</p>
      </div>
      <CrmTable
        headers={["Görünüş", "Sütunlar", "Sahib", "Əməliyyat"]}
        rows={views.map(([name, columns, owner]) => (
          <tr className="border-b border-[#e5ece8] last:border-b-0" key={name}>
            <td className="border-r border-[#edf2ef] px-4 py-3 font-semibold">{name}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{columns}</td>
            <td className="border-r border-[#edf2ef] px-4 py-3">{owner}</td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => notify(`${name} default görünüş edildi.`)}>Default et</button>
                <button className="rounded-lg border border-[#c9d8cf] px-3 py-2 text-xs font-semibold" onClick={() => notify(`${name} kopyalandı.`)}>Kopyala</button>
              </div>
            </td>
          </tr>
        ))}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d6e0da] bg-[#f8fbf9] p-4">
      <p className="text-xs text-[#68736c]">{label}</p>
      <strong className="mt-1 block text-sm">{value}</strong>
    </div>
  );
}
