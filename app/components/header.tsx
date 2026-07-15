import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link className="flex items-center gap-2 font-semibold tracking-tight" href="/">
          <span className="brand-mark">v</span>
          <span>vEvent</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[#49514d] md:flex">
          <Link href="/events">Tədbirlər</Link>
          <Link href="/checkout">Bilet al</Link>
          <Link href="/my-tickets">Biletlərim</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/admin/check-in">Check-in</Link>
        </nav>
        <Link
          className="rounded-lg bg-[#34a51d] px-4 py-2 text-sm font-medium text-white"
          href="/checkout"
        >
          Test bilet al
        </Link>
      </div>
    </header>
  );
}
