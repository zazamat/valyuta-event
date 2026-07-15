import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../admin-shell";
import { findEvent } from "../event-admin-data";
import { SpeakerManager } from "./speaker-manager";

type SpeakersPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SpeakersPage({ params }: SpeakersPageProps) {
  const { slug } = await params;
  const event = findEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <AdminShell
      activeLabel="Cari tədbirlər"
      action={<BackLink slug={event.slug} />}
      description="Spikerin şəkli, bio məlumatı, mövzusu və public səhifədə görünüşü buradan idarə olunur."
      title={`${event.title} · Spikerlər`}
    >
      <SpeakerManager initialSpeakers={event.speakers ?? []} />
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
