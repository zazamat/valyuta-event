import { copyFileSync, cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = "vercel-static";

rmSync(outDir, { force: true, recursive: true });
mkdirSync(outDir, { recursive: true });

for (const file of [
  "event-hero.png",
  "valyuta-logo.png",
  "speaker-leyla.svg",
  "speaker-murad.svg",
  "favicon.svg",
  "file.svg",
  "globe.svg",
  "window.svg",
]) {
  copyFileSync(join("public", file), join(outDir, file));
}

const html = String.raw`<!doctype html>
<html lang="az">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>valyuta-event</title>
    <meta name="description" content="Valyuta.az üçün tədbir, bilet satışı, CRM və admin platformasının təqdimat demosu." />
    <link rel="icon" href="/favicon.svg" />
    <style>
      :root {
        color-scheme: light;
        --green: #34a51d;
        --ink: #151817;
        --muted: #657067;
        --line: #d9e4dd;
        --soft: #f5f7f6;
        --dark: #101510;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--soft);
        color: var(--ink);
        font-family: Arial, Helvetica, sans-serif;
      }
      a { color: inherit; text-decoration: none; }
      button, input, select { font: inherit; }
      button {
        cursor: pointer;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fff;
        padding: 10px 14px;
        font-weight: 700;
      }
      button.primary { background: var(--green); border-color: var(--green); color: #fff; }
      button.dark { background: var(--dark); border-color: var(--dark); color: #fff; }
      button:active { transform: translateY(1px) scale(.99); }
      .topbar {
        position: sticky; top: 0; z-index: 20;
        border-bottom: 1px solid var(--line);
        background: rgba(255,255,255,.95);
        backdrop-filter: blur(8px);
      }
      .wrap { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
      .nav { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 72px; }
      .brand { display: flex; align-items: center; gap: 10px; font-weight: 900; }
      .brand img { height: 31px; width: auto; }
      .links { display: flex; flex-wrap: wrap; gap: 8px; }
      .links a { border-radius: 8px; padding: 9px 11px; color: var(--muted); font-size: 14px; font-weight: 700; }
      .links a.active, .links a:hover { background: #edf7ea; color: #16650b; }
      .hero {
        position: relative;
        min-height: 600px;
        display: grid;
        align-items: center;
        overflow: hidden;
        background: var(--dark);
        color: #fff;
      }
      .hero:before {
        content: "";
        position: absolute; inset: 0;
        background: linear-gradient(90deg, rgba(16,21,16,.97), rgba(16,21,16,.82), rgba(16,21,16,.25)), url("/event-hero.png") center/cover;
      }
      .hero > .wrap { position: relative; padding: 56px 0; }
      .eyebrow { color: var(--muted); font-size: 14px; font-weight: 700; }
      .hero .eyebrow { display: inline-block; color: rgba(255,255,255,.82); border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.1); border-radius: 8px; padding: 7px 10px; }
      h1 { margin: 14px 0 0; max-width: 780px; font-size: clamp(40px, 7vw, 76px); line-height: 1; letter-spacing: 0; }
      h2 { margin: 6px 0 0; font-size: clamp(26px, 3vw, 38px); letter-spacing: 0; }
      h3 { margin: 0; font-size: 20px; }
      p { line-height: 1.65; }
      .lead { max-width: 760px; color: rgba(255,255,255,.78); font-size: 18px; }
      .section { padding: 44px 0; }
      .grid { display: grid; gap: 16px; }
      .cards-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .cards-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .two { grid-template-columns: minmax(0, 1fr) minmax(320px, .55fr); }
      .card {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fff;
        overflow: hidden;
      }
      .card.pad { padding: 20px; }
      .event-img { width: 100%; height: 180px; object-fit: cover; display: block; }
      .meta { color: var(--muted); font-size: 14px; }
      .pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 5px 9px; background: #e9f8ee; color: #106142; font-size: 12px; font-weight: 800; }
      .pill.warn { background: #fff6df; color: #8a5a00; }
      .pill.bad { background: #fff0ed; color: #b42318; }
      .row { display: flex; gap: 10px; align-items: center; justify-content: space-between; }
      .stack { display: grid; gap: 12px; }
      .tabs { display: flex; gap: 8px; flex-wrap: wrap; margin: 18px 0; }
      .tabs button.active { background: var(--dark); color: #fff; border-color: var(--dark); }
      .table-wrap { overflow: auto; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
      table { border-collapse: collapse; width: 100%; min-width: 760px; font-size: 14px; }
      th, td { border-bottom: 1px solid #e6eee9; border-right: 1px solid #edf3ef; padding: 13px 14px; text-align: left; vertical-align: top; }
      th { background: #f7faf8; font-weight: 900; }
      tr:last-child td { border-bottom: 0; }
      .form { display: grid; gap: 12px; }
      label { display: grid; gap: 6px; font-size: 13px; color: var(--muted); font-weight: 700; }
      input, select { border: 1px solid var(--line); border-radius: 8px; padding: 12px; background: #fff; color: var(--ink); }
      .qr { width: 168px; aspect-ratio: 1; border: 12px solid #fff; border-radius: 8px; background:
        linear-gradient(90deg,#111 12px,transparent 12px) 0 0/28px 28px,
        linear-gradient(#111 12px,transparent 12px) 0 0/28px 28px,
        #fff;
        box-shadow: inset 0 0 0 1px #d9e4dd;
      }
      .admin { display: grid; grid-template-columns: 260px 1fr; min-height: calc(100vh - 72px); }
      .side { background: var(--dark); color: #fff; padding: 20px; }
      .side a { display: block; border-radius: 8px; padding: 10px 12px; color: rgba(255,255,255,.72); font-weight: 700; font-size: 14px; }
      .side a.active, .side a:hover { background: var(--green); color: #fff; }
      .content { padding: 28px; min-width: 0; }
      .toast { position: fixed; right: 18px; bottom: 18px; z-index: 40; display: none; max-width: 360px; border: 1px solid #bde6c6; border-radius: 8px; background: #fff; color: #106142; padding: 13px 15px; box-shadow: 0 14px 40px rgba(0,0,0,.16); font-weight: 700; }
      .toast.show { display: block; }
      @media (max-width: 900px) {
        .cards-3, .cards-4, .two, .admin { grid-template-columns: 1fr; }
        .side { position: static; }
        .links { display: none; }
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <div id="toast" class="toast"></div>
    <script>
      const events = [
        { title: "AI & Finance Summit 2026", date: "18 Sentyabr 2026", time: "10:00-17:30", venue: "Baku Convention Center", sold: 184, capacity: 300, price: "50 AZN-dən", status: "Satış aktivdir", category: "AI, Fintech" },
        { title: "Startup Valuation Workshop", date: "12 Mart 2026", time: "14:00-18:00", venue: "Valyuta.az Studio", sold: 46, capacity: 80, price: "35 AZN", status: "Early bird", category: "Startap" },
        { title: "Marketing Data Lab", date: "26 Mart 2026", time: "19:00-21:00", venue: "Online live", sold: 92, capacity: 500, price: "20 AZN", status: "Qeydiyyat açıqdır", category: "Marketinq" }
      ];
      const tickets = [
        ["VIP", "VEV-2026-VIP-1A7", "120 AZN", "Ödənilib"],
        ["Standard", "VEV-2026-STA-2B4", "50 AZN", "Ödənilib"],
        ["Online Live", "VEV-2026-ONL-3C6", "25 AZN", "Ödənilib"]
      ];
      const orders = [
        ["ORD-1048", "Nigar Məmmədova", "nigar@example.com", "+994 50 123 45 67", "AI & Finance Summit 2026", "3 bilet", "195 AZN", "Ödənilib"],
        ["ORD-1049", "Rauf Əliyev", "rauf@example.com", "+994 55 228 10 11", "AI & Finance Summit 2026", "Standard", "50 AZN", "Ödəniş gözlənilir"],
        ["ORD-1050", "Aysel Quliyeva", "aysel@example.com", "+994 70 441 22 90", "Marketing Data Lab", "Online Live", "25 AZN", "Ləğv edilib"]
      ];
      const crm = [
        ["Nigar Məmmədova", "nigar@example.com", "AI, Fintech", "Meta Ads", "Email+SMS", "Müştəri"],
        ["Rauf Əliyev", "rauf@example.com", "Startap, Fintech", "LinkedIn Ads", "Email", "Yarımçıq checkout"],
        ["Aysel Quliyeva", "aysel@example.com", "Marketinq, Data", "Google Search", "SMS", "Ləğv edilmiş"],
        ["Lalə Əhmədova", "lala@example.com", "AI, Marketinq", "Newsletter", "Email", "Prospekt"]
      ];
      const accounting = [
        ["AI & Finance Summit 2026", "6,995 AZN", "8,200 AZN", "-1,205 AZN", "184/300"],
        ["Marketing Data Lab", "1,200 AZN", "1,400 AZN", "-200 AZN", "92/500"],
        ["Fintech Founders Meetup 2025", "2,600 AZN", "520 AZN", "2,080 AZN", "128/140"]
      ];

      const routes = ["home","events","event","checkout","my-tickets","admin","crm","accounting"];
      const routeLabel = {
        home: "Ana səhifə", events: "Tədbirlər", event: "Tədbir səhifəsi", checkout: "Bilet al", "my-tickets": "Biletlərim", admin: "Admin", crm: "CRM/Data", accounting: "Mühasibatlıq"
      };
      const app = document.getElementById("app");
      const toastEl = document.getElementById("toast");
      function toast(text) {
        toastEl.textContent = text;
        toastEl.classList.add("show");
        setTimeout(() => toastEl.classList.remove("show"), 2300);
      }
      function statusPill(text) {
        const cls = text.includes("göz") || text.includes("Early") ? "warn" : text.includes("Ləğv") || text.includes("-") ? "bad" : "";
        return '<span class="pill ' + cls + '">' + text + '</span>';
      }
      function header(active) {
        return '<header class="topbar"><div class="wrap nav"><a class="brand" href="/"><img src="/valyuta-logo.png" alt="Valyuta.az" /><span>event</span></a><nav class="links">' +
          routes.map(r => '<a class="' + (r===active ? "active" : "") + '" href="/' + (r==="home" ? "" : r) + '">' + routeLabel[r] + '</a>').join("") +
          '</nav></div></header>';
      }
      function eventCards() {
        return events.map(e => '<article class="card"><img class="event-img" src="/event-hero.png" alt="" /><div class="pad stack"><div class="row"><span class="pill">' + e.status + '</span><span class="meta">' + e.category + '</span></div><h3>' + e.title + '</h3><p class="meta">' + e.date + ' · ' + e.time + ' · ' + e.venue + '</p><div class="row"><strong>' + e.price + '</strong><span class="meta">' + e.sold + '/' + e.capacity + ' satılıb</span></div><a href="/event"><button class="dark">Detala bax</button></a></div></article>').join("");
      }
      function table(headers, rows) {
        return '<div class="table-wrap"><table><thead><tr>' + headers.map(h => '<th>' + h + '</th>').join("") + '</tr></thead><tbody>' +
          rows.map(row => '<tr>' + row.map(cell => '<td>' + cell + '</td>').join("") + '</tr>').join("") +
          '</tbody></table></div>';
      }
      function home() {
        return header("home") + '<section class="hero"><div class="wrap"><span class="eyebrow">vEvent · Valyuta.az event platforması</span><h1>Seminar, təlim və hibrid tədbirlər üçün bilet platforması.</h1><p class="lead">Tədbir səhifəsi, promo kodlu checkout, QR bilet, admin statistikası, CRM/Data və girişdə check-in paneli bir axında.</p><div class="tabs"><a href="/checkout"><button class="primary">Checkout-u yoxla</button></a><a href="/admin"><button>Admin panelə bax</button></a></div></div></section><section class="section wrap"><div class="row"><div><span class="eyebrow">Gələcək tədbirlər</span><h2>Satışda olan tədbirlər</h2></div><a href="/events"><button>Hamısına bax</button></a></div><div class="grid cards-3" style="margin-top:18px">' + eventCards() + '</div></section>';
      }
      function eventsPage() {
        return header("events") + '<section class="section wrap"><span class="eyebrow">Tədbirlər</span><h2>Gələcək və aktiv tədbirlər</h2><div class="grid cards-3" style="margin-top:20px">' + eventCards() + '</div></section>';
      }
      function eventPage() {
        return header("event") + '<section class="hero" style="min-height:420px"><div class="wrap"><span class="eyebrow">AI, Fintech · Hibrid</span><h1>AI & Finance Summit 2026</h1><p class="lead">Bankçılıq, investisiya və fintech komandaları üçün süni intellektin real tətbiqləri.</p><div class="tabs"><a href="/checkout"><button class="primary">Bilet al</button></a><button onclick="toast(\'Tədbir təqvimə əlavə edildi\')">Təqvimə əlavə et</button></div></div></section><section class="section wrap grid two"><div class="stack"><div class="card pad"><h3>Proqram</h3><p>10:00 Qeydiyyat və networking</p><p>11:00 AI-nin maliyyə sektorunda real tətbiqləri</p><p>13:00 Panel: Fintech, banklar və risk komandaları</p><p>15:30 Workshop: AI use-case xəritəsi</p></div><div class="card pad"><h3>Spikerlər</h3><div class="row"><img src="/speaker-leyla.svg" width="72" height="72" alt="" /><div><strong>Leyla Həsənova</strong><p class="meta">Chief Data Officer · Valyuta.az</p></div></div><div class="row"><img src="/speaker-murad.svg" width="72" height="72" alt="" /><div><strong>Murad Əliyev</strong><p class="meta">Fintech Product Lead · PayTech Lab</p></div></div></div></div><aside class="card pad stack"><h3>Bilet qalığı</h3><h2>116 yer</h2><p class="meta">Tədbirə geri sayım: 64 gün</p><button class="primary" onclick="location.href=\'/checkout\'">Bilet al</button></aside></section>';
      }
      function checkout() {
        return header("checkout") + '<section class="section wrap grid two"><div class="card pad stack"><span class="eyebrow">Bilet al</span><h2>Səbət</h2>' + tickets.map(t => '<div class="row"><div><strong>' + t[0] + '</strong><p class="meta">' + t[1] + '</p></div><strong>' + t[2] + '</strong></div>').join("") + '<hr /><div class="row"><strong>Yekun</strong><strong>195 AZN</strong></div></div><div class="card pad"><h3>Alıcı məlumatları</h3><div class="form" style="margin-top:14px"><label>Ad soyad<input value="Nigar Məmmədova" /></label><label>Email<input value="nigar@example.com" /></label><label>Telefon<input value="+994 50 123 45 67" /></label><label>Promo kod<input placeholder="VALYUTA20" /></label><button class="primary" onclick="toast(\'Demo ödəniş təsdiqləndi. QR biletlər yaradıldı.\')">Kartla ödə</button><button onclick="toast(\'Ödəniş ləğv edildi kimi qeyd olundu.\')">Ləğv et</button></div></div></section>';
      }
      function myTickets() {
        return header("my-tickets") + '<section class="section wrap"><span class="eyebrow">Alıcı kabineti</span><h2>Biletlərim</h2><div class="card pad" style="margin-top:18px"><div class="row"><div><strong>ORD-1048 · AI & Finance Summit 2026</strong><p class="meta">1 sifariş · 3 bilet · ödənilib</p></div><button onclick="toast(\'Magic link yenidən göndərildi\')">Link göndər</button></div>' + table(["QR", "Bilet", "Kod", "Status", "Əməliyyat"], tickets.map(t => ['<div class="qr"></div>', '<strong>' + t[0] + '</strong><br><span class="meta">' + t[2] + '</span>', t[1], statusPill(t[3]), '<button onclick="toast(\\\'Bilet kabineti açıldı\\\')">Bax</button>'])) + '</div></section>';
      }
      function adminShell(active, body) {
        const items = [["admin","İcmal"],["crm","CRM/Data"],["accounting","Mühasibatlıq"],["checkout","Bilet testi"],["event","Tədbir səhifəsi"]];
        return header(active) + '<main class="admin"><aside class="side"><div class="brand" style="margin-bottom:20px"><span style="background:#34a51d;border-radius:8px;padding:7px 11px">v</span><span>vEvent Admin</span></div>' + items.map(i => '<a class="' + (i[0]===active ? "active" : "") + '" href="/' + i[0] + '">' + i[1] + '</a>').join("") + '</aside><section class="content">' + body + '</section></main>';
      }
      function admin() {
        const body = '<span class="eyebrow">Admin panel</span><h2>Tədbir, bilet və satış idarəetməsi</h2><div class="grid cards-4" style="margin:18px 0"><div class="card pad"><span class="meta">Satış</span><h2>14,820 AZN</h2></div><div class="card pad"><span class="meta">Biletlər</span><h2>322</h2></div><div class="card pad"><span class="meta">Check-in</span><h2>68%</h2></div><div class="card pad"><span class="meta">Promo kod</span><h2>41</h2></div></div>' + table(["Sifariş", "Alıcı", "Email", "Telefon", "Tədbir", "Bilet", "Məbləğ", "Status"], orders.map(o => [o[0], o[1], o[2], o[3], o[4], o[5], o[6], statusPill(o[7])])) + '<div class="tabs"><button class="primary" onclick="toast(\'Invoice göndərildi\')">Invoice göndər</button><button onclick="toast(\'Admin qeydi əlavə edildi\')">Admin qeydi əlavə et</button><button onclick="toast(\'Refund prosesi başladıldı\')">Refund / ləğv prosesi</button></div>';
        return adminShell("admin", body);
      }
      function crmPage() {
        const body = '<span class="eyebrow">CRM / Data</span><h2>Kontakt, iştirakçı və reklam datası</h2><div class="grid cards-4" style="margin:18px 0"><div class="card pad"><span class="meta">Kontakt</span><h2>5</h2></div><div class="card pad"><span class="meta">Yarımçıq checkout</span><h2>3</h2></div><div class="card pad"><span class="meta">Reklam auditoriyası</span><h2>3</h2></div><div class="card pad"><span class="meta">ROAS</span><h2>4.7x</h2></div></div><div class="tabs"><button class="primary" onclick="toast(\'Recovery kampaniyası növbəyə əlavə edildi\')">Recovery kampaniyası</button><button onclick="toast(\'UTM link kopyalandı\')">UTM link yarat</button><button onclick="toast(\'Hash-lənmiş auditoriya export edildi\')">Auditoriya export</button></div>' + table(["Kontakt", "Email", "Maraq", "Mənbə", "Consent", "Mərhələ"], crm.map(r => [r[0], r[1], r[2], r[3], statusPill(r[4]), r[5]]));
        return adminShell("crm", body);
      }
      function accountingPage() {
        const body = '<span class="eyebrow">Mühasibatlıq</span><h2>Gəlir, xərc və hesabatlar</h2><div class="grid cards-4" style="margin:18px 0"><div class="card pad"><span class="meta">Gəlir</span><h2>6,995 AZN</h2></div><div class="card pad"><span class="meta">Xərc</span><h2>8,200 AZN</h2></div><div class="card pad"><span class="meta">Mənfəət</span><h2>-1,205 AZN</h2></div><div class="card pad"><span class="meta">Qəbz</span><h2>3</h2></div></div><div class="tabs"><button class="primary" onclick="toast(\'Excel hesabatı hazırlandı\')">Excel export</button><button onclick="toast(\'PDF hesabatı hazırlandı\')">PDF export</button><button onclick="toast(\'Yeni xərc növü yaradıldı\')">Xərc növü yarat</button></div>' + table(["Tədbir", "Gəlir", "Xərc", "Mənfəət", "Doluluq"], accounting);
        return adminShell("accounting", body);
      }
      function render() {
        const first = location.pathname.replace(/^\/+/, "").split("/")[0] || "home";
        const page = first === "events" ? eventsPage : first === "event" || first === "admin" && location.pathname.includes("events") ? eventPage : first === "checkout" ? checkout : first === "my-tickets" || first === "tickets" ? myTickets : first === "admin" ? admin : first === "crm" || location.pathname.includes("/admin/crm") ? crmPage : first === "accounting" || location.pathname.includes("/admin/accounting") ? accountingPage : home;
        app.innerHTML = page();
      }
      window.addEventListener("popstate", render);
      document.addEventListener("click", (event) => {
        const link = event.target.closest("a[href^='/']");
        if (!link) return;
        event.preventDefault();
        history.pushState({}, "", link.getAttribute("href"));
        render();
        scrollTo({ top: 0, behavior: "smooth" });
      });
      render();
    </script>
  </body>
</html>`;

writeFileSync(join(outDir, "index.html"), html);
writeFileSync(join(outDir, "404.html"), html);
