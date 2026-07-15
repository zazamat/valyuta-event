"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoQrCode } from "../../components/demo-qr-code";
import { buyerTickets } from "../../data/demo";

type BuyerTicket = (typeof buyerTickets)[number];

type TicketCabinetProps = {
  ticket: BuyerTicket;
};

const statusLabel: Record<string, string> = {
  paid: "Ödənilib",
  awaiting_payment: "Ödəniş gözlənilir",
  cancelled: "Ləğv edilib",
};

const statusStyle: Record<string, string> = {
  paid: "bg-[#e9f8ee] text-[#106142]",
  awaiting_payment: "bg-[#fff6df] text-[#8a5a00]",
  cancelled: "bg-[#fff0ed] text-[#b42318]",
};

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function TicketCabinet({ ticket }: TicketCabinetProps) {
  const [buyer, setBuyer] = useState(ticket.buyer);
  const [email, setEmail] = useState(ticket.email);
  const [phone, setPhone] = useState(ticket.phone);
  const [isEditing, setIsEditing] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferName, setTransferName] = useState("");
  const [transferEmail, setTransferEmail] = useState("");
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [notice, setNotice] = useState("");

  const isPaid = ticket.status === "paid";

  const saveProfile = () => {
    setIsEditing(false);
    setNotice("Alıcı məlumatları yeniləndi. Real sistemdə bu dəyişiklik audit log-da saxlanacaq.");
  };

  const sendTransferRequest = () => {
    if (!transferName.trim() || !transferEmail.trim()) {
      setNotice("Transfer üçün yeni iştirakçının adı və emaili yazılmalıdır.");
      return;
    }

    setTransferOpen(false);
    setNotice(`Transfer sorğusu yaradıldı: ${transferName} (${transferEmail}).`);
  };

  const sendSupportRequest = () => {
    if (!supportMessage.trim()) {
      setNotice("Support mesajı boş ola bilməz.");
      return;
    }

    setSupportOpen(false);
    setSupportMessage("");
    setNotice("Support sorğusu göndərildi. Cavab emailə gələcək.");
  };

  const emailTicket = () => {
    setNotice(`Bilet linki ${email} ünvanına göndərildi.`);
  };

  const addToWallet = () => {
    downloadTextFile(
      `${ticket.ticketCode}-wallet.pkpass.txt`,
      `vEvent Wallet Pass\n${ticket.event}\n${ticket.ticketCode}\n${buyer}\n${ticket.date}`,
    );
    setNotice("Demo wallet pass faylı hazırlandı.");
  };

  const downloadPdfTicket = () => {
    downloadTextFile(
      `${ticket.ticketCode}-ticket.txt`,
      `vEvent PDF bilet demo\n\nBilet: ${ticket.ticketCode}\nAlıcı: ${buyer}\nEmail: ${email}\nTelefon: ${phone}\nTədbir: ${ticket.event}\nTarix: ${ticket.date} ${ticket.time}\nMəkan: ${ticket.venue}\nStatus: ${statusLabel[ticket.status] ?? ticket.status}`,
    );
    setNotice("PDF bilet demo faylı yükləndi.");
  };

  const downloadInvoice = () => {
    downloadTextFile(
      `${ticket.invoice}.txt`,
      `Invoice: ${ticket.invoice}\nSifariş: ${ticket.orderId}\nAlıcı: ${buyer}\nMəbləğ: ${ticket.amount}\nStatus: ${statusLabel[ticket.status] ?? ticket.status}`,
    );
    setNotice("Invoice demo faylı yükləndi.");
  };

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#151817]">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_380px]">
        <div>
          <Link className="text-sm font-medium text-[#258016]" href="/my-tickets">
            ← Biletlərim
          </Link>

          {notice ? (
            <div className="mt-5 rounded-lg border border-[#34a51d]/25 bg-[#f0faed] px-4 py-3 text-sm font-medium text-[#106142]">
              {notice}
            </div>
          ) : null}

          <div className="mt-5 rounded-lg border border-black/10 bg-white p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-medium text-[#68736c]">Bilet kabineti</p>
                <h1 className="mt-2 text-4xl font-semibold">{ticket.event}</h1>
                <p className="mt-3 text-[#5b665f]">
                  {ticket.date} · {ticket.time} · {ticket.venue}
                </p>
              </div>
              <span
                className={`w-fit rounded-lg px-3 py-2 text-sm font-semibold ${
                  statusStyle[ticket.status]
                }`}
              >
                {statusLabel[ticket.status] ?? ticket.status}
              </span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Bilet kodu", ticket.ticketCode],
                ["Bilet növü", ticket.ticket],
                ["Məbləğ", ticket.amount],
                ["Sifariş", ticket.orderId],
                ["Invoice", ticket.invoice],
                ["Check-in", ticket.checkInStatus],
              ].map(([label, value]) => (
                <div className="rounded-lg border border-[#dfe8e2] bg-[#f9fbfa] p-4" key={label}>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#68736c]">{label}</p>
                  <strong className="mt-2 block text-sm">{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <section className="rounded-lg border border-black/10 bg-white p-5">
              <h2 className="text-xl font-semibold">Alıcı məlumatları</h2>
              {isEditing ? (
                <div className="mt-4 grid gap-3 text-sm">
                  <label className="grid gap-2">
                    Ad soyad
                    <input
                      className="rounded-lg border border-black/10 px-3 py-3"
                      onChange={(event) => setBuyer(event.target.value)}
                      value={buyer}
                    />
                  </label>
                  <label className="grid gap-2">
                    Email
                    <input
                      className="rounded-lg border border-black/10 px-3 py-3"
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      value={email}
                    />
                  </label>
                  <label className="grid gap-2">
                    Telefon
                    <input
                      className="rounded-lg border border-black/10 px-3 py-3"
                      onChange={(event) => setPhone(event.target.value)}
                      value={phone}
                    />
                  </label>
                </div>
              ) : (
                <dl className="mt-4 grid gap-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
                    <dt className="text-[#68736c]">Ad soyad</dt>
                    <dd className="font-medium">{buyer}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
                    <dt className="text-[#68736c]">Email</dt>
                    <dd className="font-medium">{email}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#68736c]">Telefon</dt>
                    <dd className="font-medium">{phone}</dd>
                  </div>
                </dl>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                {isEditing ? (
                  <>
                    <button
                      className="rounded-lg bg-[#34a51d] px-4 py-2 text-sm font-semibold text-white"
                      onClick={saveProfile}
                      type="button"
                    >
                      Yadda saxla
                    </button>
                    <button
                      className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold"
                      onClick={() => setIsEditing(false)}
                      type="button"
                    >
                      Ləğv et
                    </button>
                  </>
                ) : (
                  <button
                    className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold"
                    onClick={() => setIsEditing(true)}
                    type="button"
                  >
                    Məlumatları yenilə
                  </button>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-black/10 bg-white p-5">
              <h2 className="text-xl font-semibold">Online giriş</h2>
              <p className="mt-3 text-sm leading-6 text-[#5b665f]">{ticket.onlineAccess}</p>
              <div className="mt-5 rounded-lg border border-[#dfe8e2] bg-[#f9fbfa] p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-[#68736c]">
                  Giriş metodu
                </p>
                <strong className="mt-2 block">{ticket.accessType}</strong>
              </div>
              <button
                className="mt-4 rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold"
                onClick={() => setNotice("Online giriş linki tədbir günü email və kabinetdə aktiv olacaq.")}
                type="button"
              >
                Giriş linkini yoxla
              </button>
            </section>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <section className="rounded-lg border border-black/10 bg-white p-5">
              <h2 className="text-xl font-semibold">Transfer</h2>
              <p className="mt-3 text-sm text-[#5b665f]">
                Bileti başqa iştirakçıya göndərmək üçün dəyişiklik sorğusu yaradılır.
              </p>
              <div className="mt-4 rounded-lg bg-[#f5f7f6] p-4 text-sm font-semibold">
                {ticket.transferStatus}
              </div>
              {transferOpen ? (
                <div className="mt-4 grid gap-3 text-sm">
                  <input
                    className="rounded-lg border border-black/10 px-3 py-3"
                    onChange={(event) => setTransferName(event.target.value)}
                    placeholder="Yeni iştirakçı adı"
                    value={transferName}
                  />
                  <input
                    className="rounded-lg border border-black/10 px-3 py-3"
                    onChange={(event) => setTransferEmail(event.target.value)}
                    placeholder="Yeni iştirakçı emaili"
                    type="email"
                    value={transferEmail}
                  />
                  <button
                    className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white"
                    onClick={sendTransferRequest}
                    type="button"
                  >
                    Transfer sorğusu yarat
                  </button>
                </div>
              ) : (
                <button
                  className="mt-4 rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold"
                  onClick={() => setTransferOpen(true)}
                  type="button"
                >
                  Transferə başla
                </button>
              )}
            </section>

            <section className="rounded-lg border border-black/10 bg-white p-5">
              <h2 className="text-xl font-semibold">Qəbz və support</h2>
              <p className="mt-3 text-sm text-[#5b665f]">
                Qəbz, invoice və bilet linki eyni kabinetdən idarə olunur.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white"
                  onClick={downloadInvoice}
                  type="button"
                >
                  Invoice yüklə
                </button>
                <button
                  className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold"
                  onClick={() => setSupportOpen((current) => !current)}
                  type="button"
                >
                  Supporta yaz
                </button>
              </div>
              {supportOpen ? (
                <div className="mt-4 grid gap-3">
                  <textarea
                    className="min-h-24 rounded-lg border border-black/10 px-3 py-3 text-sm"
                    onChange={(event) => setSupportMessage(event.target.value)}
                    placeholder="Müraciətinizi yazın"
                    value={supportMessage}
                  />
                  <button
                    className="rounded-lg bg-[#34a51d] px-4 py-2 text-sm font-semibold text-white"
                    onClick={sendSupportRequest}
                    type="button"
                  >
                    Göndər
                  </button>
                </div>
              ) : null}
            </section>
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-black/10 bg-white p-5 lg:sticky lg:top-24">
          <div className="rounded-lg bg-[#101510] p-5 text-white">
            <p className="text-sm text-white/65">QR bilet</p>
            <div className="mx-auto mt-5 max-w-[240px] rounded-lg bg-white p-4">
              <DemoQrCode active={isPaid} />
            </div>
            <p className="mt-4 text-center text-sm font-semibold">{ticket.ticketCode}</p>
          </div>
          <div className="mt-5 grid gap-2">
            <button
              className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white"
              onClick={emailTicket}
              type="button"
            >
              Bileti emailə göndər
            </button>
            <button
              className="rounded-lg border border-black/10 px-4 py-3 text-sm font-semibold"
              onClick={addToWallet}
              type="button"
            >
              Apple / Google Wallet
            </button>
            <button
              className="rounded-lg border border-black/10 px-4 py-3 text-sm font-semibold"
              onClick={downloadPdfTicket}
              type="button"
            >
              PDF bilet
            </button>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#68736c]">
            Son göndərilmə: {ticket.lastSent}. Magic link yalnız bu biletə aid məlumatları
            açır.
          </p>
        </aside>
      </section>
    </main>
  );
}
