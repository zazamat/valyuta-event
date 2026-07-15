"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Header } from "../components/header";
import { buyerTickets } from "../data/demo";

type BuyerTicket = (typeof buyerTickets)[number];

type BuyerOrder = {
  orderId: string;
  buyer: string;
  email: string;
  phone: string;
  event: string;
  date: string;
  time: string;
  venue: string;
  status: string;
  invoice: string;
  tickets: BuyerTicket[];
  total: number;
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

function amountToNumber(amount: string) {
  return Number(amount.replace(/[^\d.]/g, "")) || 0;
}

function groupTicketsByOrder(tickets: BuyerTicket[]): BuyerOrder[] {
  const groups = new Map<string, BuyerOrder>();

  tickets.forEach((ticket) => {
    const existing = groups.get(ticket.orderId);

    if (existing) {
      existing.tickets.push(ticket);
      existing.total += amountToNumber(ticket.amount);
      if (existing.status !== "cancelled" && ticket.status !== "paid") {
        existing.status = ticket.status;
      }
      return;
    }

    groups.set(ticket.orderId, {
      orderId: ticket.orderId,
      buyer: ticket.buyer,
      email: ticket.email,
      phone: ticket.phone,
      event: ticket.event,
      date: ticket.date,
      time: ticket.time,
      venue: ticket.venue,
      status: ticket.status,
      invoice: ticket.invoice,
      tickets: [ticket],
      total: amountToNumber(ticket.amount),
    });
  });

  return Array.from(groups.values());
}

function isPastOrClosed(order: BuyerOrder) {
  return order.status === "cancelled" || order.date.includes("Mart") || order.date.includes("2025");
}

function isMiniQrCellDark(index: number) {
  const size = 9;
  const x = index % size;
  const y = Math.floor(index / size);
  const inFinder = (originX: number, originY: number) => {
    const dx = x - originX;
    const dy = y - originY;
    if (dx < 0 || dy < 0 || dx > 2 || dy > 2) return false;
    return dx === 0 || dy === 0 || dx === 2 || dy === 2 || (dx === 1 && dy === 1);
  };

  if (inFinder(0, 0) || inFinder(6, 0) || inFinder(0, 6)) return true;
  return (x * 5 + y * 7 + x * y) % 4 === 0;
}

function MiniQrCode({ active }: { active: boolean }) {
  const cells = Array.from({ length: 81 }, (_, index) => index).filter(isMiniQrCellDark);

  return (
    <svg
      aria-label={active ? "QR bilet" : "Passiv QR bilet"}
      className={`size-full ${active ? "" : "opacity-35 grayscale"}`}
      role="img"
      viewBox="0 0 9 9"
    >
      <rect fill="#ffffff" height="9" width="9" />
      {cells.map((index) => {
        const x = index % 9;
        const y = Math.floor(index / 9);
        return (
          <rect
            fill="#101510"
            height="0.72"
            key={index}
            rx="0.06"
            width="0.72"
            x={x + 0.14}
            y={y + 0.14}
          />
        );
      })}
    </svg>
  );
}

export default function MyTicketsPage() {
  const [query, setQuery] = useState("nigar@example.com");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [notice, setNotice] = useState("");
  const [sentTicketToken, setSentTicketToken] = useState("");

  const matchedTickets = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return buyerTickets;
    }

    return buyerTickets.filter(
      (ticket) =>
        ticket.email.toLowerCase().includes(normalized) ||
        ticket.phone.toLowerCase().includes(normalized) ||
        ticket.ticketCode.toLowerCase().includes(normalized) ||
        ticket.orderId.toLowerCase().includes(normalized),
    );
  }, [query]);

  const orders = useMemo(() => groupTicketsByOrder(matchedTickets), [matchedTickets]);
  const currentOrders = orders.filter((order) => !isPastOrClosed(order));
  const pastOrders = orders.filter(isPastOrClosed);
  const totalTickets = orders.reduce((sum, order) => sum + order.tickets.length, 0);

  const resetAccess = (value: string) => {
    setQuery(value);
    setOtpSent(false);
    setOtpCode("");
    setIsVerified(false);
    setNotice("");
    setSentTicketToken("");
  };

  const sendOtp = () => {
    if (!query.trim()) {
      setNotice("Email, telefon, sifariş və ya bilet kodu yazın.");
      return;
    }

    setOtpSent(true);
    setIsVerified(false);
    setOtpCode("");
    setNotice("Demo OTP kodu göndərildi: 123456");
  };

  const verifyOtp = () => {
    if (otpCode === "123456") {
      setIsVerified(true);
      setNotice("Giriş təsdiqləndi. Sifariş və biletlərə baxa bilərsiniz.");
      return;
    }

    setIsVerified(false);
    setNotice("Kod yanlışdır. Demo üçün 123456 yazın.");
  };

  const resendMagicLink = (token: string) => {
    setSentTicketToken(token);
  };

  const renderOrder = (order: BuyerOrder) => (
    <article className="rounded-lg border border-black/10 bg-white p-5" key={order.orderId}>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm text-[#68736c]">{order.orderId} · {order.invoice}</p>
          <h3 className="mt-1 text-xl font-semibold">{order.event}</h3>
          <p className="mt-2 text-sm text-[#5b665f]">
            {order.date} · {order.time} · {order.venue}
          </p>
          <p className="mt-3 text-sm">
            {order.buyer} · {order.email} · {order.phone}
          </p>
        </div>
        <div className="grid gap-2 lg:text-right">
          <span
            className={`w-fit rounded-lg px-3 py-1 text-sm font-semibold lg:ml-auto ${
              statusStyle[order.status]
            }`}
          >
            {statusLabel[order.status] ?? order.status}
          </span>
          <strong>{order.tickets.length} bilet</strong>
          <span className="text-sm text-[#68736c]">{order.total} AZN</span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-[#dfe8e2]">
        <div className="min-w-[780px]">
        <div className="grid grid-cols-[88px_1.2fr_1fr_1fr_1fr] bg-[#f7faf8] px-4 py-3 text-sm font-semibold text-[#4d5752]">
          <span>QR</span>
          <span>Bilet</span>
          <span>Kod</span>
          <span>Status</span>
          <span>Əməliyyat</span>
        </div>
        {order.tickets.map((ticket) => (
          <div
            className="grid grid-cols-[88px_1.2fr_1fr_1fr_1fr] items-center border-t border-[#e6eee9] px-4 py-3 text-sm"
            key={ticket.token}
          >
            <div className="size-16 rounded-lg border border-[#dfe8e2] bg-white p-2">
              <MiniQrCode active={ticket.status === "paid"} />
            </div>
            <div>
              <strong>{ticket.ticket}</strong>
              <p className="mt-1 text-xs text-[#68736c]">{ticket.amount}</p>
            </div>
            <span className="font-medium">{ticket.ticketCode}</span>
            <span
              className={`w-fit rounded-lg px-2 py-1 text-xs font-semibold ${
                statusStyle[ticket.status]
              }`}
            >
              {statusLabel[ticket.status] ?? ticket.status}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  isVerified
                    ? "bg-[#101510] text-white"
                    : "pointer-events-none bg-[#d6e0da] text-[#68736c]"
                }`}
                href={`/tickets/${ticket.token}`}
                aria-disabled={!isVerified}
              >
                Bax
              </Link>
              <button
                className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold"
                onClick={() => resendMagicLink(ticket.token)}
                type="button"
              >
                Link göndər
              </button>
              {sentTicketToken === ticket.token ? (
                <span className="text-xs font-medium text-[#106142]">Göndərildi</span>
              ) : null}
            </div>
          </div>
        ))}
        </div>
      </div>
    </article>
  );

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#151817]">
      <Header />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="h-fit rounded-lg border border-black/10 bg-white p-6">
          <p className="text-sm font-medium text-[#68736c]">Alıcı kabineti</p>
          <h1 className="mt-2 text-4xl font-semibold">Biletlərim</h1>
          <p className="mt-3 text-sm leading-6 text-[#5b665f]">
            Sifarişlər bir yerdə görünür. Bir sifarişin içində Standard, VIP və Online
            Live kimi fərqli biletlər ola bilər. Demo giriş kodu <strong>123456</strong>-dır.
          </p>

          <label className="mt-6 grid gap-2 text-sm">
            Email, telefon, sifariş və ya bilet kodu
            <input
              className="rounded-lg border border-black/10 bg-white px-3 py-3 outline-none focus:border-[#34a51d] focus:ring-2 focus:ring-[#34a51d]/15"
              onChange={(event) => resetAccess(event.target.value)}
              placeholder="nigar@example.com"
              value={query}
            />
          </label>
          <button
            className="mt-3 w-full rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white"
            onClick={sendOtp}
            type="button"
          >
            Giriş kodu göndər
          </button>

          {otpSent ? (
            <div className="mt-4 rounded-lg border border-[#34a51d]/25 bg-[#f0faed] p-4">
              <p className="text-sm font-medium text-[#106142]">{notice}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  className="rounded-lg border border-[#bde6c6] bg-white px-3 py-3 text-sm outline-none focus:border-[#34a51d]"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => setOtpCode(event.target.value)}
                  placeholder="123456"
                  value={otpCode}
                />
                <button
                  className="rounded-lg bg-[#101510] px-4 py-3 text-sm font-semibold text-white"
                  onClick={verifyOtp}
                  type="button"
                >
                  Təsdiqlə
                </button>
              </div>
            </div>
          ) : notice ? (
            <div className="mt-4 rounded-lg border border-[#d6e0da] bg-[#f9fbfa] p-4 text-sm text-[#4d5752]">
              {notice}
            </div>
          ) : null}
        </aside>

        <div>
          <div className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-sm text-[#68736c]">Tapıldı</p>
                <h2 className="text-2xl font-semibold">
                  {orders.length} sifariş · {totalTickets} bilet
                </h2>
              </div>
              <span
                className={`rounded-lg px-3 py-2 text-sm ${
                  isVerified ? "bg-[#e9f8ee] text-[#106142]" : "bg-[#eef3f0] text-[#4d5752]"
                }`}
              >
                {isVerified ? "Giriş təsdiqlənib" : "Giriş üçün OTP lazımdır"}
              </span>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-[#c8d6ce] bg-white p-8 text-center">
              <h2 className="text-xl font-semibold">Sifariş tapılmadı</h2>
              <p className="mt-2 text-sm text-[#5b665f]">
                Email, telefon, sifariş ID və ya bilet kodunu yenidən yoxlayın. Demo üçün
                `nigar@example.com` yaza bilərsiniz.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-8">
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">İndiki sifarişlər</h2>
                  <span className="text-sm text-[#68736c]">{currentOrders.length} sifariş</span>
                </div>
                <div className="grid gap-4">
                  {currentOrders.length ? (
                    currentOrders.map(renderOrder)
                  ) : (
                    <p className="rounded-lg border border-dashed border-[#c8d6ce] bg-white p-5 text-sm text-[#68736c]">
                      Aktiv sifariş yoxdur.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Keçmiş və bağlı sifarişlər</h2>
                  <span className="text-sm text-[#68736c]">{pastOrders.length} sifariş</span>
                </div>
                <div className="grid gap-4">
                  {pastOrders.length ? (
                    pastOrders.map(renderOrder)
                  ) : (
                    <p className="rounded-lg border border-dashed border-[#c8d6ce] bg-white p-5 text-sm text-[#68736c]">
                      Keçmiş sifariş yoxdur.
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
