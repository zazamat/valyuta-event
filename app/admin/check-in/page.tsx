"use client";

import { useMemo, useState } from "react";
import { DemoQrCode } from "../../components/demo-qr-code";
import { buyerTickets } from "../../data/demo";
import { AdminShell } from "../admin-shell";

type CheckInStatus = "not_checked_in" | "checked_in" | "pending" | "cancelled" | "online_pending";
type PaymentStatus = "paid" | "awaiting_payment" | "cancelled";
type Channel = "Fiziki" | "Online";

type CheckInTicket = {
  code: string;
  attendee: string;
  email: string;
  phone: string;
  ticket: string;
  event: string;
  channel: Channel;
  paymentStatus: PaymentStatus;
  checkInStatus: CheckInStatus;
  scannedAt?: string;
  operator?: string;
  gate?: string;
};

type ScanResult =
  | { type: "idle"; title: string; message: string; ticket?: undefined }
  | {
      type: "success" | "duplicate" | "pending" | "cancelled" | "invalid" | "online";
      title: string;
      message: string;
      ticket?: CheckInTicket;
    };

const initialTickets: CheckInTicket[] = buyerTickets.map((ticket) => {
  const isOnline = ticket.ticket === "Online Live";
  const isCheckedIn = ticket.ticketCode === "VEV-2026-VIP-1A7";

  return {
    code: ticket.ticketCode,
    attendee: ticket.buyer,
    email: ticket.email,
    phone: ticket.phone,
    ticket: ticket.ticket,
    event: ticket.event,
    channel: isOnline ? "Online" : "Fiziki",
    paymentStatus: ticket.status as PaymentStatus,
    checkInStatus:
      ticket.status === "cancelled"
        ? "cancelled"
        : ticket.status === "awaiting_payment"
          ? "pending"
          : isCheckedIn
            ? "checked_in"
            : isOnline
              ? "online_pending"
              : "not_checked_in",
    scannedAt: isCheckedIn ? "13:42" : undefined,
    operator: isCheckedIn ? "Nəzarətçi A" : undefined,
    gate: isCheckedIn ? "Giriş 1" : undefined,
  };
});

const resultStyles: Record<ScanResult["type"], string> = {
  idle: "border-white/15 bg-white/8 text-white",
  success: "border-[#34a51d]/45 bg-[#12351b] text-white",
  duplicate: "border-[#f1b84b]/55 bg-[#3a2c11] text-white",
  pending: "border-[#f1b84b]/55 bg-[#3a2c11] text-white",
  online: "border-[#7eb6ff]/55 bg-[#102236] text-white",
  cancelled: "border-[#ff8a7a]/55 bg-[#3d1713] text-white",
  invalid: "border-[#ff8a7a]/55 bg-[#3d1713] text-white",
};

const statusLabel: Record<CheckInStatus, string> = {
  not_checked_in: "Gözləyir",
  checked_in: "Giriş verilib",
  pending: "Ödəniş gözlənilir",
  cancelled: "Ləğv edilib",
  online_pending: "Online giriş gözləyir",
};

const paymentLabel: Record<PaymentStatus, string> = {
  paid: "Ödənilib",
  awaiting_payment: "Ödəniş gözlənilir",
  cancelled: "Ləğv edilib",
};

function nowLabel() {
  return new Intl.DateTimeFormat("az-AZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export default function CheckInPage() {
  const [tickets, setTickets] = useState(initialTickets);
  const [manualCode, setManualCode] = useState("VEV-2026-STA-2B4");
  const [selectedGate, setSelectedGate] = useState("Giriş 1");
  const [selectedOperator, setSelectedOperator] = useState("Nəzarətçi A");
  const [scanPulse, setScanPulse] = useState(false);
  const [result, setResult] = useState<ScanResult>({
    type: "idle",
    title: "Yoxlama gözləyir",
    message: "QR skan edin və ya bilet kodunu əl ilə yazın.",
  });
  const [scanLog, setScanLog] = useState<CheckInTicket[]>(
    initialTickets.filter((ticket) => ticket.checkInStatus === "checked_in"),
  );

  const stats = useMemo(() => {
    const paidTickets = tickets.filter((ticket) => ticket.paymentStatus === "paid");
    const checkedInTickets = tickets.filter((ticket) => ticket.checkInStatus === "checked_in");
    const physicalPaid = paidTickets.filter((ticket) => ticket.channel === "Fiziki");
    const physicalCheckedIn = checkedInTickets.filter((ticket) => ticket.channel === "Fiziki");
    const onlinePaid = paidTickets.filter((ticket) => ticket.channel === "Online");
    const vipCheckedIn = checkedInTickets.filter((ticket) => ticket.ticket === "VIP");
    const physicalPercent = physicalPaid.length
      ? Math.round((physicalCheckedIn.length / physicalPaid.length) * 100)
      : 0;

    return {
      cards: [
        ["Satılmış bilet", paidTickets.length.toString()],
        ["Giriş verilib", checkedInTickets.length.toString()],
        ["Fiziki keçid", physicalCheckedIn.length.toString()],
        ["Online bilet", onlinePaid.length.toString()],
        ["VIP keçid", vipCheckedIn.length.toString()],
        [
          "Ödəniş gözləyir",
          tickets.filter((ticket) => ticket.paymentStatus === "awaiting_payment").length.toString(),
        ],
      ],
      physicalPaid: physicalPaid.length,
      physicalCheckedIn: physicalCheckedIn.length,
      physicalPercent,
    };
  }, [tickets]);

  const validateTicket = (code: string, source: "camera" | "manual" | "hardware") => {
    const normalized = code.trim().toUpperCase();
    const found = tickets.find((ticket) => ticket.code.toUpperCase() === normalized);

    if (!found) {
      setResult({
        type: "invalid",
        title: "Bilet tapılmadı",
        message: `${normalized || "Boş kod"} sistemdə yoxdur. Kod səhvdirsə, iştirakçını sifariş masasına yönləndirin.`,
      });
      return;
    }

    if (found.paymentStatus === "awaiting_payment") {
      setResult({
        type: "pending",
        title: "Ödəniş tamamlanmayıb",
        message: "Bu bilet üçün ödəniş gözlənilir. Ödəniş təsdiqlənmədən fiziki giriş verilməməlidir.",
        ticket: found,
      });
      return;
    }

    if (found.paymentStatus === "cancelled") {
      setResult({
        type: "cancelled",
        title: "Bilet ləğv edilib",
        message: "Bu bilet deaktivdir və giriş üçün keçərli deyil.",
        ticket: found,
      });
      return;
    }

    if (found.channel === "Online") {
      setResult({
        type: "online",
        title: "Online bilet",
        message: "Bu bilet zal girişi üçün deyil. Online iştirak linki alıcı kabinetindən və emaildən açılmalıdır.",
        ticket: found,
      });
      return;
    }

    if (found.checkInStatus === "checked_in") {
      setResult({
        type: "duplicate",
        title: "Bu bilet artıq istifadə olunub",
        message: `${found.scannedAt ?? "Əvvəl"} saatında ${found.operator ?? "operator"} tərəfindən ${found.gate ?? "girişdə"} skan edilib.`,
        ticket: found,
      });
      return;
    }

    const updatedTicket: CheckInTicket = {
      ...found,
      checkInStatus: "checked_in",
      scannedAt: nowLabel(),
      operator: selectedOperator,
      gate: source === "hardware" ? `${selectedGate} · USB skaner` : selectedGate,
    };

    setTickets((current) =>
      current.map((ticket) => (ticket.code === found.code ? updatedTicket : ticket)),
    );
    setScanLog((current) => [updatedTicket, ...current]);
    setResult({
      type: "success",
      title: "Giriş verildi",
      message: "Bilet uğurla yoxlandı və check-in statusu yeniləndi.",
      ticket: updatedTicket,
    });
  };

  const handleCameraDemo = () => {
    setScanPulse(true);
    window.setTimeout(() => setScanPulse(false), 900);
    validateTicket("VEV-2026-STA-2B4", "camera");
  };

  const handleHardwareDemo = () => {
    setScanPulse(true);
    window.setTimeout(() => setScanPulse(false), 650);
    setManualCode("VEV-2026-VIP-1A7");
    validateTicket("VEV-2026-VIP-1A7", "hardware");
  };

  return (
    <AdminShell
      activeLabel="QR check-in"
      description="Giriş nəzarətçisi üçün kamera/USB skan, manual kod yoxlama, təkrar giriş xəbərdarlığı və canlı keçid statistikası."
      title="QR check-in"
    >
      <section className="grid gap-6 rounded-lg bg-[#101510] p-6 text-white xl:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.2fr)]">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">
              AI & Finance Summit 2026
            </span>
            <span className="rounded-full bg-[#34a51d]/20 px-3 py-1 text-xs font-semibold text-[#9ee391]">
              Giriş aktivdir
            </span>
          </div>
          <h2 className="mt-3 text-3xl font-semibold">Operator paneli</h2>
          <p className="mt-3 max-w-xl text-white/70">
            İştirakçı QR bileti telefondan, emaildən və ya çap olunmuş PDF-dən göstərir.
            Nəzarətçi mobil telefon, planşet, laptop kamerası və ya USB/Bluetooth skaner ilə kodu oxudur.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-white/75">
              Nəzarətçi
              <select
                className="rounded-lg border border-white/15 bg-white px-3 py-3 text-[#101510] outline-none"
                onChange={(event) => setSelectedOperator(event.target.value)}
                value={selectedOperator}
              >
                <option>Nəzarətçi A</option>
                <option>Nəzarətçi B</option>
                <option>Baş admin</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm text-white/75">
              Giriş nöqtəsi
              <select
                className="rounded-lg border border-white/15 bg-white px-3 py-3 text-[#101510] outline-none"
                onChange={(event) => setSelectedGate(event.target.value)}
                value={selectedGate}
              >
                <option>Giriş 1</option>
                <option>Giriş 2</option>
                <option>VIP giriş</option>
                <option>Qeydiyyat masası</option>
              </select>
            </label>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className={`scan-button rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#101510] ${
                  scanPulse ? "scan-pulse" : ""
                }`}
                onClick={handleCameraDemo}
                type="button"
              >
                {scanPulse ? "Kamera skan edir..." : "Kamera ilə skan et"}
              </button>
              <button
                className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                onClick={handleHardwareDemo}
                type="button"
              >
                USB skaner test et
              </button>
            </div>

            <div className="rounded-lg border border-white/15 bg-white/8 p-4">
              <label className="grid gap-2 text-sm text-white/75">
                Bilet kodunu əl ilə daxil et
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    className="rounded-lg border border-white/15 bg-white px-3 py-3 text-[#101510] outline-none"
                    onChange={(event) => setManualCode(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        validateTicket(manualCode, "manual");
                      }
                    }}
                    placeholder="VEV-2026-STA-2B4"
                    value={manualCode}
                  />
                  <button
                    className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white"
                    onClick={() => validateTicket(manualCode, "manual")}
                    type="button"
                  >
                    Yoxla
                  </button>
                </div>
              </label>
              <p className="mt-3 text-xs text-white/50">
                Real sistemdə USB skaner bu xanaya kodu yazıb Enter göndərə bilər.
              </p>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(190px,220px)_minmax(0,1fr)]">
          <div className="w-full max-w-[220px] rounded-lg bg-white p-4 text-[#111816]">
            <DemoQrCode active={scanPulse} />
            <p className="mt-3 text-center text-xs font-semibold">
              {result.ticket?.code ?? "VEV-2026-STA-2B4"}
            </p>
          </div>
          <div className={`min-w-0 rounded-lg border p-5 ${resultStyles[result.type]}`}>
            <p className="text-sm opacity-70">Yoxlama nəticəsi</p>
            <h2 className="mt-3 text-2xl font-semibold">{result.title}</h2>
            <p className="mt-2 text-sm opacity-80">{result.message}</p>
            {result.ticket ? (
              <dl className="mt-5 grid gap-3 text-sm text-white/75">
                {[
                  ["İştirakçı", result.ticket.attendee],
                  ["Bilet", result.ticket.ticket],
                  ["Ödəniş", paymentLabel[result.ticket.paymentStatus]],
                  ["Status", statusLabel[result.ticket.checkInStatus]],
                  ["Keçid tipi", result.ticket.channel],
                  ["Telefon", result.ticket.phone],
                ].map(([label, value]) => (
                  <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-4" key={label}>
                    <dt>{label}</dt>
                    <dd className="truncate text-right font-medium text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.cards.map(([label, value]) => (
          <article className="rounded-lg border border-black/10 bg-white p-4" key={label}>
            <p className="text-sm text-[#68736c]">{label}</p>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="overflow-hidden rounded-lg border border-black/10 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
            <div>
              <p className="text-sm text-[#68736c]">Canlı giriş statistikası</p>
              <h2 className="text-xl font-semibold">Son skanlar və keçən şəxslər</h2>
            </div>
            <span className="rounded-lg bg-[#e9f8ee] px-3 py-1 text-sm font-semibold text-[#106142]">
              {scanLog.length} skan
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="bg-[#f7faf8]">
                  {["Saat", "İştirakçı", "Bilet", "Kod", "Keçid", "Operator", "Giriş"].map((header) => (
                    <th className="border-b border-r border-[#dfe8e2] px-4 py-3 font-semibold" key={header}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scanLog.map((ticket) => (
                  <tr className="hover:bg-[#f9fbfa]" key={`${ticket.code}-${ticket.scannedAt}`}>
                    <td className="border-b border-r border-[#e6eee9] px-4 py-3">{ticket.scannedAt}</td>
                    <td className="border-b border-r border-[#e6eee9] px-4 py-3">
                      <strong>{ticket.attendee}</strong>
                      <p className="text-xs text-[#68736c]">{ticket.email}</p>
                    </td>
                    <td className="border-b border-r border-[#e6eee9] px-4 py-3">{ticket.ticket}</td>
                    <td className="border-b border-r border-[#e6eee9] px-4 py-3 font-mono text-xs">{ticket.code}</td>
                    <td className="border-b border-r border-[#e6eee9] px-4 py-3">{ticket.channel}</td>
                    <td className="border-b border-r border-[#e6eee9] px-4 py-3">{ticket.operator}</td>
                    <td className="border-b border-r border-[#e6eee9] px-4 py-3">{ticket.gate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="grid gap-4">
          <article className="rounded-lg border border-black/10 bg-white p-5">
            <p className="text-sm text-[#68736c]">Fiziki keçid</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <strong className="text-3xl">{stats.physicalPercent}%</strong>
              <span className="text-sm text-[#68736c]">
                {stats.physicalCheckedIn}/{stats.physicalPaid} bilet
              </span>
            </div>
            <div className="mt-4 h-3 rounded-full bg-[#edf2ef]">
              <div
                className="h-3 rounded-full bg-[#34a51d]"
                style={{ width: `${stats.physicalPercent}%` }}
              />
            </div>
          </article>

          <article className="rounded-lg border border-black/10 bg-white p-5">
            <p className="text-sm text-[#68736c]">Bu panel nə üçündür?</p>
            <ul className="mt-3 grid gap-2 text-sm text-[#3f4944]">
              <li>Saxta və təkrar bileti girişdə bloklamaq.</li>
              <li>Hansı nəzarətçinin, hansı girişdən, saat neçədə buraxdığını saxlamaq.</li>
              <li>Fiziki və online biletləri ayrı yoxlamaq.</li>
              <li>Tədbir sonrası keçid statistikasını report etmək.</li>
            </ul>
          </article>

          <article className="rounded-lg border border-black/10 bg-white p-5">
            <p className="text-sm text-[#68736c]">Real sistemdə əlavə olunacaq</p>
            <div className="mt-3 grid gap-2 text-sm">
              {["Brauzer kamera icazəsi", "Offline ehtiyat rejimi", "Giriş nöqtəsinə görə rol limiti", "Excel/PDF check-in reportu"].map((item) => (
                <span className="rounded-lg border border-[#dfe8e2] px-3 py-2" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </AdminShell>
  );
}
