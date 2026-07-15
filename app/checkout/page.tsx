"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DemoQrCode } from "../components/demo-qr-code";
import { Header } from "../components/header";
import { tickets } from "../data/demo";

type PaymentState = "idle" | "paid" | "cancelled";

const orderId = "ORD-2026-1157";

function getTicketPrefix(name: string) {
  return name.replace(/\s/g, "").slice(0, 3).toUpperCase();
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<Record<string, number>>({
    Standard: 2,
    VIP: 1,
    "Online Live": 0,
  });
  const [promo, setPromo] = useState("");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");

  const cartItems = useMemo(
    () =>
      tickets
        .map((ticket) => ({
          ...ticket,
          quantity: cart[ticket.name] ?? 0,
          lineTotal: ticket.price * (cart[ticket.name] ?? 0),
        }))
        .filter((ticket) => ticket.quantity > 0),
    [cart],
  );

  const ticketCount = cartItems.reduce((sum, ticket) => sum + ticket.quantity, 0);
  const subtotal = cartItems.reduce((sum, ticket) => sum + ticket.lineTotal, 0);
  const discount = promo.trim().toUpperCase() === "VALYUTA20" && subtotal > 0 ? 20 : 0;
  const total = Math.max(subtotal - discount, 0);

  const issuedTickets = useMemo(
    () =>
      cartItems.flatMap((ticket) =>
        Array.from({ length: ticket.quantity }, (_, index) => ({
          name: ticket.name,
          type: ticket.type,
          code: `VEV-2026-${getTicketPrefix(ticket.name)}-${index + 1}${ticket.quantity}A7`,
        })),
      ),
    [cartItems],
  );

  const updateQuantity = (ticketName: string, nextQuantity: number) => {
    setPaymentState("idle");
    setCart((current) => ({
      ...current,
      [ticketName]: Math.max(0, Math.min(nextQuantity, 10)),
    }));
  };

  const payOrder = () => {
    if (ticketCount === 0) {
      setPaymentState("cancelled");
      return;
    }

    setPaymentState("paid");
  };

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#151817]">
      <Header />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-medium text-[#68736c]">Test checkout</p>
          <h1 className="mt-2 text-4xl font-semibold">AI & Finance Summit bileti</h1>
          <p className="mt-3 max-w-2xl text-[#5b665f]">
            Bir sifarişdə fərqli bilet növlərini səbətə əlavə etmək mümkündür. Promo kod:
            <span className="font-semibold text-[#151817]"> VALYUTA20</span>
          </p>

          <div className="mt-7 grid gap-3">
            {tickets.map((ticket) => {
              const quantity = cart[ticket.name] ?? 0;

              return (
                <article
                  className={`rounded-lg border bg-white p-4 transition ${
                    quantity > 0 ? "border-[#34a51d] bg-[#f0faed]" : "border-black/10"
                  }`}
                  key={ticket.name}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="font-semibold">{ticket.name}</h3>
                      <p className="mt-1 text-sm text-[#5b665f]">{ticket.description}</p>
                      <p className="mt-2 text-xs text-[#68736c]">
                        {ticket.type} · {ticket.available} yer qalıb
                      </p>
                    </div>
                    <div className="grid gap-3 sm:min-w-44 sm:text-right">
                      <strong>{ticket.price} AZN</strong>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="grid size-9 place-items-center rounded-lg border border-black/10 bg-white text-lg font-semibold disabled:opacity-40"
                          disabled={quantity === 0}
                          onClick={() => updateQuantity(ticket.name, quantity - 1)}
                          type="button"
                        >
                          -
                        </button>
                        <input
                          className="h-9 w-14 rounded-lg border border-black/10 bg-white text-center text-sm font-semibold"
                          max={10}
                          min={0}
                          onChange={(event) =>
                            updateQuantity(ticket.name, Number(event.target.value))
                          }
                          type="number"
                          value={quantity}
                        />
                        <button
                          className="grid size-9 place-items-center rounded-lg border border-black/10 bg-white text-lg font-semibold"
                          onClick={() => updateQuantity(ticket.name, quantity + 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-black/10 bg-white p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Sifariş məlumatları</h2>
          <div className="mt-5 grid gap-3">
            <label className="grid gap-2 text-sm">
              Ad və soyad
              <input
                className="rounded-lg border border-black/10 bg-white px-3 py-3"
                defaultValue="Nigar Məmmədova"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Email
              <input
                className="rounded-lg border border-black/10 bg-white px-3 py-3"
                defaultValue="nigar@example.com"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Telefon nömrəsi
              <input
                className="rounded-lg border border-black/10 bg-white px-3 py-3"
                defaultValue="+994 50 123 45 67"
                inputMode="tel"
                placeholder="+994 XX XXX XX XX"
                type="tel"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Promo kod
              <input
                className="rounded-lg border border-black/10 bg-white px-3 py-3 uppercase"
                onChange={(event) => setPromo(event.target.value)}
                placeholder="VALYUTA20"
                value={promo}
              />
            </label>
          </div>

          <div className="mt-6 border-t border-black/10 pt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Səbət</h3>
              <span className="text-sm text-[#68736c]">{ticketCount} bilet</span>
            </div>
            {cartItems.length ? (
              <div className="mt-3 grid gap-2">
                {cartItems.map((item) => (
                  <div
                    className="rounded-lg border border-[#dfe8e2] bg-[#f9fbfa] p-3 text-sm"
                    key={item.name}
                  >
                    <div className="flex justify-between gap-4">
                      <strong>{item.name}</strong>
                      <span>{item.quantity} ədəd</span>
                    </div>
                    <div className="mt-1 flex justify-between gap-4 text-[#68736c]">
                      <span>{item.price} AZN x {item.quantity}</span>
                      <span>{item.lineTotal} AZN</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-lg border border-dashed border-[#c8d6ce] p-4 text-sm text-[#68736c]">
                Səbət boşdur. Ən azı bir bilet əlavə edin.
              </p>
            )}
          </div>

          <dl className="mt-6 space-y-3 border-t border-black/10 pt-5 text-sm">
            <div className="flex justify-between">
              <dt>Sifariş</dt>
              <dd>{orderId}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Ara cəm</dt>
              <dd>{subtotal} AZN</dd>
            </div>
            <div className="flex justify-between">
              <dt>Endirim</dt>
              <dd>-{discount} AZN</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Ödəniləcək</dt>
              <dd>{total} AZN</dd>
            </div>
          </dl>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white disabled:opacity-45"
              disabled={ticketCount === 0}
              onClick={payOrder}
              type="button"
            >
              Test ödə
            </button>
            <button
              className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-semibold"
              onClick={() => setPaymentState("cancelled")}
              type="button"
            >
              Ləğv et
            </button>
          </div>

          {paymentState === "paid" && (
            <div className="mt-5 rounded-lg border border-[#34a51d]/30 bg-[#f0faed] p-4">
              <p className="font-semibold">Ödəniş təsdiqləndi</p>
              <p className="mt-1 text-sm text-[#5b665f]">
                {orderId} daxilində {issuedTickets.length} bilet yaradıldı.
              </p>
              <div className="mt-4 grid max-h-[380px] gap-3 overflow-y-auto pr-1">
                {issuedTickets.map((ticket) => (
                  <div className="rounded-lg border border-[#bde6c6] bg-white p-3" key={ticket.code}>
                    <div className="grid grid-cols-[96px_1fr] gap-3">
                      <div className="rounded-lg bg-white">
                        <DemoQrCode active={false} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{ticket.name}</p>
                        <p className="mt-1 text-xs text-[#68736c]">{ticket.type}</p>
                        <p className="mt-3 text-xs font-semibold">{ticket.code}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                className="mt-4 flex justify-center rounded-lg bg-[#101510] px-4 py-3 text-sm font-semibold text-white"
                href="/tickets/vev-nigar-vip-1a7"
              >
                Bilet kabinetinə keç
              </Link>
            </div>
          )}

          {paymentState === "cancelled" && (
            <div className="mt-5 rounded-lg border border-[#b42318]/20 bg-[#fff3f1] p-4">
              <p className="font-semibold">Sifariş ləğv edildi</p>
              <p className="mt-1 text-sm text-[#5b665f]">
                Bilet rezervi 15 dəqiqədən sonra sərbəst buraxılacaq.
              </p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
