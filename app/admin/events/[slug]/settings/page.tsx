import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../admin-shell";
import { AdminActionButton } from "../event-admin-actions";
import { findEvent } from "../event-admin-data";

type SettingsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params;
  const event = findEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <AdminShell
      activeLabel="Cari tədbirlər"
      action={<BackLink slug={event.slug} />}
      description="Təşkilatçı məlumatları, qeydiyyat sualları, qaydalar və SEO ayarları."
      title={`${event.title} · Ayarlar`}
    >
      <div className="mb-5 flex flex-wrap gap-2">
        <AdminActionButton
          label="Ayarları yadda saxla"
          message="Demo: ayarlar yadda saxlanıldı."
          tone="green"
        />
        <AdminActionButton
          label="Public preview"
          message="Demo: public səhifənin preview pəncərəsi açılacaq."
        />
      </div>
      <section className="grid gap-5 lg:grid-cols-3">
        <Card title="Təşkilatçı">
          <Input label="Ad" value={event.organizer?.name ?? ""} />
          <Input label="Email" value={event.organizer?.email ?? ""} />
          <Input label="Telefon" value={event.organizer?.phone ?? ""} />
        </Card>
        <Card title="Qeydiyyat sualları">
          {(event.registrationQuestions ?? []).map((question) => (
            <Input key={question} label="Sual" value={question} />
          ))}
          <AdminActionButton label="Sual əlavə et" message="Demo: yeni qeydiyyat sualı əlavə ediləcək." />
        </Card>
        <Card title="Qaydalar">
          {(event.policies ?? []).map((policy) => (
            <label className="grid gap-2 text-sm font-medium" key={policy}>
              Qayda
              <textarea className="min-h-24 rounded-lg border border-black/10 px-3 py-3 font-normal" defaultValue={policy} />
            </label>
          ))}
        </Card>
      </section>
    </AdminShell>
  );
}

function BackLink({ slug }: { slug: string }) {
  return (
    <Link
      className="rounded-lg border border-black/15 bg-white px-5 py-3 text-sm font-semibold"
      href={`/admin/events/${slug}`}
    >
      Tədbir panelinə qayıt
    </Link>
  );
}

function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <article className="grid gap-4 rounded-lg border border-black/10 bg-white p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </article>
  );
}

function Input({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input className="rounded-lg border border-black/10 px-3 py-3 font-normal" defaultValue={value} />
    </label>
  );
}
