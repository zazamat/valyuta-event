"use client";

import Link from "next/link";
import type { ReactNode } from "react";

const adminGroups = [
  {
    title: "Tədbirlər",
    items: [
      { label: "Tədbir yarat", href: "/admin/events/create" },
      { label: "Cari tədbirlər", href: "/admin/events/current" },
      { label: "Bitmiş tədbirlər", href: "/admin/events/past" },
    ],
  },
  {
    title: "Biletlər",
    items: [
      { label: "Bilet növləri", href: "/admin/tickets/types" },
      { label: "Promo kodlar", href: "/admin/tickets/promo-codes" },
      { label: "PDF / Çap məhsulları", href: "/admin/tickets/print" },
      { label: "QR check-in", href: "/admin/check-in" },
    ],
  },
  {
    title: "Satışlar",
    items: [
      { label: "Sifarişlər", href: "/admin/sales/orders" },
      { label: "Alıcı kabinetləri", href: "/admin/sales/buyer-portals" },
    ],
  },
  {
    title: "Mühasibatlıq",
    items: [
      { label: "İcmal", href: "/admin/accounting" },
      { label: "Gəlirlər", href: "/admin/accounting/income" },
      { label: "Xərclər", href: "/admin/accounting/expenses" },
      { label: "Ödənişlər", href: "/admin/accounting/payments" },
      { label: "Qəbz və invoice", href: "/admin/accounting/invoices" },
      { label: "Hesabatlar", href: "/admin/accounting/reports" },
    ],
  },
  {
    title: "CRM / Data",
    items: [
      { label: "Kontaktlar", href: "/admin/crm/contacts" },
      { label: "İştirakçılar", href: "/admin/crm/participants" },
      { label: "Tamamlanmamış sifarişlər", href: "/admin/crm/abandoned-checkouts" },
      { label: "Seqmentlər", href: "/admin/crm/segments" },
      { label: "Reklam auditoriyaları", href: "/admin/crm/ad-audiences" },
      { label: "UTM / Attribution", href: "/admin/crm/attribution" },
      { label: "Data keyfiyyəti", href: "/admin/crm/data-quality" },
      { label: "Smart cədvəllər", href: "/admin/crm/smart-tables" },
    ],
  },
  {
    title: "Kontent",
    items: [
      { label: "Spikerlər", href: "/admin?view=speakers" },
      { label: "Sponsorlar", href: "/admin?view=sponsors" },
      { label: "Media / qalereya", href: "/admin?view=media" },
    ],
  },
  {
    title: "Marketinq",
    items: [
      { label: "Email kampaniyaları", href: "/admin?view=email" },
      { label: "SMS kampaniyaları", href: "/admin?view=sms" },
      { label: "Newsletter", href: "/admin?view=newsletter" },
    ],
  },
  {
    title: "Adminlər",
    items: [
      { label: "Admin yarat", href: "/admin?view=admin-create" },
      { label: "Adminlər", href: "/admin?view=admins" },
      { label: "Rollar", href: "/admin?view=roles" },
    ],
  },
  {
    title: "Ayarlar",
    items: [
      { label: "Payment gateway", href: "/admin?view=payment" },
      { label: "Sistem ayarları", href: "/admin?view=settings" },
    ],
  },
];

type AdminShellProps = {
  activeLabel?: string;
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AdminShell({
  activeLabel = "Cari tədbirlər",
  action,
  children,
  description,
  title,
}: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#151817]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-black/10 bg-[#101510] text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 px-5 py-5">
              <Link className="flex items-center gap-2 font-semibold" href="/admin">
                <span className="brand-mark">v</span>
                <span>vEvent Admin</span>
              </Link>
              <p className="mt-2 text-xs text-white/55">
                Tədbir, bilet, satış, mühasibatlıq və CRM idarəetməsi
              </p>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid gap-5">
                {adminGroups.map((group) => (
                  <section key={group.title}>
                    <h2 className="px-2 text-xs font-semibold uppercase text-white/45">
                      {group.title}
                    </h2>
                    <div className="mt-2 grid gap-1">
                      {group.items.map((item) => {
                        const active = item.label === activeLabel;
                        return (
                          <Link
                            className={`rounded-lg px-3 py-2 text-sm transition ${
                              active
                                ? "bg-[#34a51d] font-semibold text-white"
                                : "text-white/72 hover:bg-white/8 hover:text-white"
                            }`}
                            href={item.href}
                            key={item.label}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </nav>

            <div className="border-t border-white/10 px-5 py-4">
              <Link className="text-sm text-white/70 hover:text-white" href="/">
                Public sayta qayıt
              </Link>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-black/10 bg-white px-5 py-5">
            <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-medium text-[#68736c]">Admin panel</p>
                <h1 className="mt-1 text-3xl font-semibold">{title}</h1>
                {description && (
                  <p className="mt-2 max-w-2xl text-sm text-[#5b665f]">
                    {description}
                  </p>
                )}
              </div>
              {action}
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
